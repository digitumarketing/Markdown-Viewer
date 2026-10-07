/* Digitum Markdown Viewer: static site plus short share links.
 *
 * Static files come from ./public through the ASSETS binding; Cloudflare
 * serves any request that matches a file before this script runs. The
 * script only sees what is left:
 *
 *   POST /api/share        body: the markdown text  ->  { id }
 *   GET  /api/share/:id    ->  the markdown text
 *   GET  /api/fetch?url=   ->  a public web page or feed, for the URL,
 *                              Google Docs, Reddit and podcast converters
 *   GET  /s/:id, /e/:id    ->  the app (index.html), which then loads :id
 *
 *   GET  /markdown-editor and the other paths in PAGES  ->  the viewer
 *        (index.html) or the tool shell (tool.html), with that page's
 *        title, description, heading, content and tool id written in
 *
 * Shared documents live in the SHARES KV namespace under "doc:<id>".
 * Shared and embedded documents are kept out of search results.
 */

import { SITE, PAGES } from "./pages.js";

const MAX_BYTES = 512 * 1024;          // a very long document is still well under this
const ID_LEN = 7;                      // 57^7 ≈ 1.9 trillion ids
const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/l/I

function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LEN));
  let id = "";
  for (const b of bytes) id += ALPHABET[b % ALPHABET.length];
  return id;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function createShare(request, env) {
  const text = await request.text();
  const size = new TextEncoder().encode(text).length;
  if (!text.trim()) return json({ error: "empty" }, 400);
  if (size > MAX_BYTES) return json({ error: "too_large", limit: MAX_BYTES }, 413);

  for (let attempt = 0; attempt < 5; attempt++) {
    const id = newId();
    if (await env.SHARES.get("doc:" + id) !== null) continue;
    await env.SHARES.put("doc:" + id, text, { metadata: { createdAt: Date.now(), size } });
    return json({ id }, 201);
  }
  return json({ error: "try_again" }, 503);
}

async function readShare(id, env) {
  const text = await env.SHARES.get("doc:" + id);
  if (text === null) return json({ error: "not_found" }, 404);
  return new Response(text, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      // a share never changes once written
      "cache-control": "public, max-age=86400, immutable",
    },
  });
}

/* ---- fetching public pages for the web-to-markdown tools ---- */

const FETCH_MAX = 4 * 1024 * 1024;
const FETCH_TYPES = /^(text\/(html|plain|markdown|xml)|application\/(xhtml\+xml|xml|rss\+xml|atom\+xml|json|ld\+json))/i;

/* only public http(s) hosts: no IP literals, no local names, not ourselves */
function allowedTarget(raw, self) {
  let u;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (u.username || u.password) return null;
  const h = u.hostname.toLowerCase();
  if (!h.includes(".") || h.endsWith(".local") || h.endsWith(".internal") || h.endsWith(".localhost")) return null;
  if (/^[\d.]+$/.test(h) || h.includes(":") || h.startsWith("[")) return null;
  if (h === self) return null;
  if (u.port && u.port !== "80" && u.port !== "443") return null;
  return u;
}

async function fetchPage(request, url) {
  const target = allowedTarget(url.searchParams.get("url") || "", url.hostname);
  if (!target) return json({ error: "bad_url" }, 400);
  let res;
  try {
    res = await fetch(target.toString(), {
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; DigitumMarkdownBot/1.0; +https://markdown.digitum.marketing/tools)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.9,*/*;q=0.5",
        "accept-language": "en;q=0.9,*;q=0.5",
      },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
  } catch (e) {
    return json({ error: "unreachable", detail: String(e && e.message || e) }, 502);
  }
  const type = (res.headers.get("content-type") || "").split(";")[0].trim();
  if (!res.ok) return json({ error: "upstream", status: res.status }, 502);
  if (type && !FETCH_TYPES.test(type)) return json({ error: "unsupported_type", contentType: type }, 415);

  /* read at most FETCH_MAX bytes */
  const reader = res.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > FETCH_MAX) { reader.cancel(); return json({ error: "too_large", limit: FETCH_MAX }, 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) { bytes.set(c, at); at += c.length; }
  const charset = ((res.headers.get("content-type") || "").match(/charset=([^;]+)/i) || [])[1] || "utf-8";
  let body;
  try { body = new TextDecoder(charset.trim()).decode(bytes); } catch { body = new TextDecoder().decode(bytes); }

  return json({ url: res.url || target.toString(), contentType: type, body }, 200);
}

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
};

function withHeaders(response, extra) {
  const r = new Response(response.body, response);
  for (const [k, v] of Object.entries({ ...SECURITY_HEADERS, ...extra })) r.headers.set(k, v);
  return r;
}

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* index.html or tool.html, with one page's copy written into it */
async function landingPage(request, env, path) {
  const page = PAGES[path];
  const url = SITE + path;
  // "/tool" and "/" rather than the .html names, which the assets layer redirects
  const shell = page.shell === "tool" ? "/tool" : "/";
  const base = await env.ASSETS.fetch(new Request(new URL(shell, request.url), request));
  const setAttr = (name, value) => ({ element(el) { el.setAttribute(name, value); } });
  const setHTML = (html) => ({ element(el) { el.setInnerContent(html, { html: true }); } });

  const rewritten = new HTMLRewriter()
    .on("title", setHTML(esc(page.title)))
    .on('meta[name="description"]', setAttr("content", page.desc))
    .on('link[rel="canonical"]', setAttr("href", url))
    .on('meta[property="og:url"]', setAttr("content", url))
    .on('meta[property="og:title"]', setAttr("content", page.ogTitle))
    .on('meta[property="og:description"]', setAttr("content", page.desc))
    .on('meta[name="twitter:title"]', setAttr("content", page.ogTitle))
    .on('meta[name="twitter:description"]', setAttr("content", page.desc))
    .on("script#ldjson", setHTML(page.ld))
    .on("#heroEyebrow", setHTML(esc(page.eyebrow)))
    .on("#heroTitle", setHTML(page.h1))
    .on("#heroLede", setHTML(esc(page.lede)))
    .on("#seoContent", setHTML(page.content))
    .on("#crumbName", setHTML(esc(page.eyebrow)))
    .on("body", {
      element(el) {
        el.setAttribute("data-page", path.slice(1));
        if (page.tool) el.setAttribute("data-tool", page.tool);
      },
    })
    .transform(base);

  return withHeaders(rewritten, { "cache-control": "public, max-age=0, must-revalidate" });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/share" && request.method === "POST") {
      return withHeaders(await createShare(request, env), { "x-robots-tag": "noindex" });
    }

    if (path === "/api/fetch" && request.method === "GET") {
      return withHeaders(await fetchPage(request, url), { "x-robots-tag": "noindex", "cache-control": "no-store" });
    }

    const read = path.match(/^\/api\/share\/([A-Za-z0-9]{4,16})$/);
    if (read && request.method === "GET") return withHeaders(await readShare(read[1], env), { "x-robots-tag": "noindex" });

    /* one address per page: no trailing slash, no upper case */
    const clean = path.length > 1 ? path.replace(/\/+$/, "").toLowerCase() : path;
    if (clean !== path && PAGES[clean]) return Response.redirect(new URL(clean + url.search, url), 301);
    if (PAGES[path]) return landingPage(request, env, path);
    /* the bare tool shell is not a page of its own */
    if (path === "/tool" || path === "/tool.html") return Response.redirect(new URL("/", url), 301);

    if (/^\/[se]\/[A-Za-z0-9]{4,16}\/?$/.test(path)) {
      /* someone's shared document: usable, but not for search engines.
         "/" rather than "/index.html", which the assets layer redirects */
      const page = await env.ASSETS.fetch(new Request(new URL("/", url), request));
      return withHeaders(page, { "x-robots-tag": "noindex, nofollow" });
    }
    if (path.startsWith("/api/")) return json({ error: "not_found" }, 404);
    /* anything else is not a file: the assets layer answers with 404.html */
    return env.ASSETS.fetch(request);
  },
};
