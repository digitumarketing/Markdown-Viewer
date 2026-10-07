"""On-page and technical SEO audit for every page in the sitemap.

    python3 tools/seo_audit.py http://127.0.0.1:8787     # local wrangler dev
    python3 tools/seo_audit.py https://markdown.digitum.marketing

Checks titles, descriptions, headings, keyword placement (tools/seo_keywords.py),
content depth, canonical, Open Graph, JSON-LD, image alt text, internal links and
duplicates. Exits non-zero when any page has an error.
"""
import json
import re
import sys
import urllib.request
from html import unescape
from html.parser import HTMLParser
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from seo_keywords import KEYWORDS  # noqa: E402

SITE = "https://markdown.digitum.marketing"
MIN_WORDS = 600
MIN_FAQ = 5


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title, self.meta, self.links, self.ld = "", {}, [], []
        self.h = []          # (level, text)
        self.imgs = []       # attrs of <img>
        self.anchors = []    # hrefs
        self.text = []       # visible text of <main>/#seoContent
        self._stack = []
        self._cur_h = None
        self._in = {"title": False, "script": False, "style": False, "ld": False, "seo": 0}
        self._ld_buf = ""

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self._in["title"] = True
        elif tag == "meta":
            k = a.get("name") or a.get("property")
            if k:
                self.meta[k] = a.get("content", "")
        elif tag == "link":
            self.links.append(a)
        elif tag == "script":
            self._in["script"] = True
            if a.get("type") == "application/ld+json":
                self._in["ld"] = True
                self._ld_buf = ""
        elif tag == "style":
            self._in["style"] = True
        elif re.fullmatch(r"h[1-6]", tag):
            self._cur_h = [int(tag[1]), ""]
        elif tag == "img":
            self.imgs.append(a)
        elif tag == "a" and a.get("href"):
            self.anchors.append(a["href"])
        if a.get("id") == "seoContent" or self._in["seo"]:
            self._in["seo"] += 1 if tag not in ("br", "img", "input", "meta", "link", "hr") else 0

    def handle_endtag(self, tag):
        if tag == "title":
            self._in["title"] = False
        elif tag == "script":
            if self._in["ld"]:
                self.ld.append(self._ld_buf)
            self._in["script"] = self._in["ld"] = False
        elif tag == "style":
            self._in["style"] = False
        elif self._cur_h and tag == "h%d" % self._cur_h[0]:
            self.h.append((self._cur_h[0], " ".join(self._cur_h[1].split())))
            self._cur_h = None
        if self._in["seo"] and tag not in ("br", "img", "input", "meta", "link", "hr"):
            self._in["seo"] -= 1

    def handle_data(self, d):
        if self._in["title"]:
            self.title += d
        if self._in["ld"]:
            self._ld_buf += d
            return
        if self._in["script"] or self._in["style"]:
            return
        if self._cur_h is not None:
            self._cur_h[1] += d
        if self._in["seo"]:
            self.text.append(d)


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "seo-audit"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status, r.read().decode("utf-8", "replace"), r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, "", url


def has(text, kw):
    return kw.lower() in text.lower()


def audit(base):
    _, sm, _ = get(base + "/sitemap.xml")
    paths = [re.sub(r"^https?://[^/]+", "", u) or "/" for u in re.findall(r"<loc>(.*?)</loc>", sm)]
    seen_t, seen_d, problems, internal = {}, {}, {}, set()
    rows = []
    for path in paths:
        status, body, _ = get(base + path)
        errs, warns = [], []
        if status != 200:
            problems[path] = (["HTTP %s" % status], [])
            continue
        p = Page()
        p.feed(body)
        title, desc = unescape(p.title.strip()), p.meta.get("description", "")
        h1 = [t for lvl, t in p.h if lvl == 1]
        h2 = [t for lvl, t in p.h if lvl == 2]
        content = " ".join(" ".join(p.text).split())
        words = len(content.split())
        lede = re.search(r'id="heroLede"[^>]*>(.*?)</p>', body, re.S)
        lede = unescape(re.sub(r"<[^>]+>", "", lede.group(1))) if lede else ""
        full = " ".join([title, desc, " ".join(h1), lede, content])

        if not 30 <= len(title) <= 65:
            errs.append("title length %d" % len(title))
        if not 70 <= len(desc) <= 160:
            errs.append("description length %d" % len(desc))
        if len(h1) != 1:
            errs.append("%d H1" % len(h1))
        if len(h2) < 4:
            warns.append("only %d H2" % len(h2))
        canon = next((l.get("href") for l in p.links if l.get("rel") == "canonical"), None)
        if canon != SITE + path:
            errs.append("canonical %s" % canon)
        for k in ("og:title", "og:description", "og:url", "og:image", "og:type", "twitter:card", "twitter:title",
                  "twitter:description", "twitter:image", "robots", "viewport"):
            if k not in p.meta:
                errs.append("missing meta " + k)
        if p.meta.get("og:url") and p.meta["og:url"] != SITE + path:
            errs.append("og:url %s" % p.meta["og:url"])
        if "noindex" in p.meta.get("robots", ""):
            errs.append("noindex")
        if not re.search(r'<html[^>]+lang="en"', body):
            errs.append("no html lang")
        types = []
        for raw in p.ld:
            try:
                d = json.loads(raw)
            except ValueError as e:
                errs.append("bad JSON-LD: %s" % e)
                continue
            for node in d.get("@graph", [d]):
                t = node.get("@type")
                types += t if isinstance(t, list) else [t]
        for need in ("Organization", "BreadcrumbList") if path != "/" else ("Organization", "WebSite"):
            if need not in types:
                errs.append("JSON-LD lacks " + need)
        if path not in ("/tools", "/markdown-cheat-sheet") and "FAQPage" not in types:
            errs.append("JSON-LD lacks FAQPage")
        faqs = len(re.findall(r"<details><summary>", body))
        if path != "/tools" and faqs < MIN_FAQ:
            warns.append("%d FAQ" % faqs)
        for img in p.imgs:
            if "alt" not in img:
                errs.append("img without alt: %s" % img.get("src"))
        if words < MIN_WORDS:
            warns.append("%d words" % words)

        kw, secondary = KEYWORDS.get(path, (None, []))
        if kw is None:
            errs.append("no keywords defined")
        else:
            slug = path.strip("/").replace("-", " ") or "markdown viewer"
            if path != "/" and not has(slug, kw) and kw.split()[0] not in slug:
                warns.append("keyword not in URL")
            for where, txt in (("title", title), ("description", desc), ("H1", " ".join(h1)), ("lede", lede)):
                if not has(txt, kw):
                    errs.append("'%s' not in %s" % (kw, where))
            if title.lower().find(kw.lower()) > 25:
                warns.append("keyword late in title")
            if not any(has(t, kw.split()[-1]) for t in h2):
                warns.append("no H2 mentions '%s'" % kw.split()[-1])
            n = full.lower().count(kw.lower())
            if n < 4:
                warns.append("'%s' used %dx" % (kw, n))
            for s in secondary:
                if not has(full, s):
                    errs.append("secondary '%s' missing" % s)

        seen_t.setdefault(title, []).append(path)
        seen_d.setdefault(desc, []).append(path)
        for href in p.anchors:
            if href.startswith("/") and not href.startswith("//"):
                internal.add(href.split("#")[0].split("?")[0] or "/")
        n_internal = len({h for h in p.anchors if h.startswith("/")})
        if n_internal < 10:
            warns.append("%d internal links" % n_internal)
        rows.append((path, len(title), len(desc), words, len(h2), faqs, n_internal))
        if errs or warns:
            problems[path] = (errs, warns)

    for label, seen in (("title", seen_t), ("description", seen_d)):
        for v, ps in seen.items():
            if len(ps) > 1:
                for q in ps:
                    problems.setdefault(q, ([], []))[0].append("duplicate %s with %s" % (label, ", ".join(ps)))
    for href in sorted(internal):
        status, _, _ = get(base + href)
        if status != 200:
            problems.setdefault("(links)", ([], []))[0].append("%s → %s" % (href, status))
    for robots in ("/robots.txt", "/llms.txt", "/manifest.json", "/og-image.png", "/favicon.ico"):
        if get(base + robots)[0] != 200:
            problems.setdefault("(technical)", ([], []))[0].append(robots + " missing")

    print("%-30s %5s %5s %6s %4s %4s %5s" % ("page", "title", "desc", "words", "h2", "faq", "links"))
    for r in rows:
        print("%-30s %5d %5d %6d %4d %4d %5d" % r)
    n_err = 0
    for path, (errs, warns) in problems.items():
        print("\n" + path)
        for e in errs:
            print("  ERROR " + e)
        for w in warns:
            print("  warn  " + w)
        n_err += len(errs)
    print("\n%d pages, %d errors, %d with warnings" % (len(rows), n_err, sum(1 for e, w in problems.values() if w)))
    return n_err


if __name__ == "__main__":
    sys.exit(1 if audit(sys.argv[1].rstrip("/") if len(sys.argv) > 1 else SITE) else 0)
