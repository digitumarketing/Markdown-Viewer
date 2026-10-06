/* Digitum Markdown Viewer: static site plus short share links.
 *
 * Static files come from ./public through the ASSETS binding; Cloudflare
 * serves any request that matches a file before this script runs. The
 * script only sees what is left:
 *
 *   POST /api/share        body: the markdown text  ->  { id }
 *   GET  /api/share/:id    ->  the markdown text
 *   GET  /s/:id, /e/:id    ->  the app (index.html), which then loads :id
 *
 * Shared documents live in the SHARES KV namespace under "doc:<id>".
 */

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/share" && request.method === "POST") return createShare(request, env);

    const read = path.match(/^\/api\/share\/([A-Za-z0-9]{4,16})$/);
    if (read && request.method === "GET") return readShare(read[1], env);

    if (/^\/[se]\/[A-Za-z0-9]{4,16}\/?$/.test(path)) {
      // "/" rather than "/index.html": the assets layer redirects the latter to the former
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    }

    if (path.startsWith("/api/")) return json({ error: "not_found" }, 404);
    return env.ASSETS.fetch(request);
  },
};
