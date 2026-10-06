#!/usr/bin/env python3
"""Generates the search content for the site from one source of truth.

Writes:
  public/index.html   the home page content between <!--seo:start--> and
                      <!--seo:end-->, and its JSON-LD in <script id="ldjson">
  src/pages.js        title, meta, hero and content for the landing pages,
                      which the Worker serves by rewriting index.html
  public/sitemap.xml  every indexable URL

Run after changing any copy here:  python3 tools/build_seo.py
"""
import html
import json
import pathlib
import re
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://markdown.digitum.marketing"
ORG = {"@type": "Organization", "@id": "https://digitum.marketing/#org", "name": "Digitum Marketing",
       "url": "https://digitum.marketing/", "logo": SITE + "/brand/logo-charcoal.png"}
TODAY = date.today().isoformat()

TOOLS = [
    ("/", "Markdown viewer", "Open and read any .md file"),
    ("/markdown-editor", "Markdown editor", "Write with a live preview"),
    ("/markdown-to-pdf", "Markdown to PDF", "Print-ready PDF in one click"),
    ("/markdown-to-html", "Markdown to HTML", "Clean or styled HTML"),
    ("/markdown-cheat-sheet", "Markdown cheat sheet", "Every bit of syntax, with examples"),
]

FEATURES = [
    ("Open any .md file", "Drag in files or a whole folder, open one from a link, or paste markdown text. "
     "It reads .md, .markdown, .mdx and .txt files, and once installed as an app you can double-click a markdown "
     "file on your computer and it opens here."),
    ("A real editor with a formatting toolbar", "Headings, bold, italic, lists, checklists, tables, links, images, "
     "code blocks, maths and emoji are one click or one shortcut away, and Ctrl Z undoes formatting like ordinary typing."),
    ("Source and preview stay in step", "Select words in the preview and the same words are selected in the source, "
     "and the other way round. In split view both panes scroll together, with line numbers and a live character count."),
    ("Export to PDF, HTML, PNG and more", "Download the Markdown, plain or styled HTML, a print-ready PDF or a PNG image, "
     "or copy the formatted text straight into Gmail, Google Docs or WordPress."),
    ("GitHub Flavored Markdown, maths and diagrams", "Tables, task lists, strikethrough and fenced code with syntax "
     "highlighting for almost 200 languages, plus LaTeX maths with KaTeX and Mermaid diagrams."),
    ("Share with a short link", "Turn a document into a short link anyone can open, or embed it on your own website "
     "with a single line of code."),
    ("Private and works offline", "Files are read inside your browser and never uploaded, unless you choose to create a "
     "share link. Install it as an app and it keeps working without a connection."),
    ("Saves straight back to the file", "In Chrome and Edge, edits to a file you opened are saved to the original file on "
     "your disk automatically. Everywhere else, save a copy with one click."),
]

HOME_FAQ = [
    ("How do I open an MD file online?",
     "Drag the .md file onto this page, or press Open files and choose it. It opens instantly in a formatted, readable "
     "layout with an outline of its headings. You can also paste a link to a raw .md file, such as one on GitHub, or "
     "paste the markdown text itself."),
    ("Is this markdown viewer free?",
     "Yes. It is completely free, with no sign-up, no file size limit for viewing and no watermark on exports."),
    ("Are my files uploaded to a server?",
     "No. Files are read and rendered inside your browser and stay on your device. The only time anything leaves your "
     "browser is when you choose to create a share link, which stores a copy of that one document so the link works."),
    ("Can I convert Markdown to PDF?",
     "Yes. Open the file, choose Export, then PDF, and pick Save as PDF in the print dialog. The PDF keeps selectable "
     "text and clickable links, and you can set the paper size, margins and page numbers in Settings."),
    ("Does it support GitHub Flavored Markdown?",
     "Yes: tables, task lists, strikethrough, autolinks and fenced code blocks with syntax highlighting all render the "
     "way they do on GitHub, plus LaTeX maths and Mermaid diagrams."),
    ("Can I edit the markdown file and save it?",
     "Yes. Press the pencil button, or Ctrl E, to edit with a live preview. In Chrome and Edge your changes save back "
     "to the original file automatically; in other browsers you save a copy."),
    ("Does it work offline or as a desktop app?",
     "Yes. Install it from the Install app button and it runs in its own window, works offline, and can be set as the "
     "app that opens .md files on Windows, macOS, ChromeOS and Android."),
    ("Which file types can it open?",
     "Markdown files with the .md, .markdown, .mdx and .mkd extensions, plain .txt files, and any images in the same "
     "folder that the document refers to."),
]

HOME_STEPS = [
    "Drag your .md file onto the page, or press <strong>Open files</strong> and choose it.",
    "Read it in a clean layout, with an outline of the headings in the sidebar and search with the <kbd>/</kbd> key.",
    "Press the pencil button to edit, with the source and the live preview side by side.",
    "Export it as PDF, HTML or PNG, or share it with a short link.",
]

WHAT_IS = [
    "Markdown is a simple way to format plain text. A line that starts with <code>#</code> becomes a heading, "
    "<code>**words**</code> become bold, and a line that starts with <code>-</code> becomes a bullet. Because a "
    "markdown file is just text, it opens anywhere, works well with version control, and is easy to read even "
    "before it is formatted.",
    "That is why it is used for README files on GitHub, documentation, notes apps like Obsidian, and more and more "
    "for text written by AI assistants. A markdown viewer turns that text into the formatted page it describes.",
]

# ------------------------------------------------------------------ landing pages

PAGES = {
    "/markdown-editor": {
        "title": "Online Markdown Editor with Live Preview – Free | Digitum",
        "desc": 'Free online markdown editor with live preview, formatting toolbar, synced scrolling, maths and export to PDF, HTML or PNG. No sign-up.',
        "eyebrow": "Markdown editor",
        "h1": "Online markdown editor with a <em>live preview</em>",
        "lede": "Write markdown on the left and watch it format on the right. A toolbar for headings, lists, tables, "
                "links and maths, selection and scrolling that stay in step, and one-click export. Free, private and "
                "no sign-up.",
        "sections": [
            ("Write markdown faster", None, [
                ("Formatting toolbar and shortcuts", "Headings H1 to H6, bold, italic, strikethrough, inline code, links, "
                 "images, bulleted, numbered and checklist items, quotes, code blocks, tables, dividers, maths and emoji. "
                 "Ctrl B, Ctrl I and Ctrl K work as you would expect."),
                ("Lists that continue themselves", "Press Enter in a list and the next bullet or number appears; press it "
                 "on an empty item to end the list. Tab and Shift Tab indent and outdent."),
                ("Edit, Split or Preview", "Work on the source alone, side by side with the preview, or read the result. "
                 "In split view both panes scroll together."),
                ("Select on either side", "Select a sentence in the preview and the matching markdown is selected in the "
                 "source, ready to format. Ticking a checklist box in the preview ticks it in the source."),
                ("Line numbers and counts", "Line and column, characters, words and the size of your selection, always "
                 "visible under the editor."),
                ("Never lose work", "Files opened from disk in Chrome and Edge save automatically. New documents are kept "
                 "in your browser until you save them, and your open tabs come back next time."),
            ]),
        ],
        "steps_title": "How to edit markdown online",
        "steps": [
            "Press <strong>Create a new file</strong>, or open an existing .md file.",
            "Type in the source pane, or use the toolbar to add headings, lists, tables and links.",
            "Check the live preview on the right; select text there to find it in the source.",
            "Press <kbd>Ctrl</kbd> <kbd>S</kbd> to save, or export as PDF, HTML or PNG.",
        ],
        "faq": [
            ("Is this markdown editor free?", "Yes, completely free, with no account, no limits and no watermark."),
            ("Does the editor save my work?", "Files you open from disk in Chrome or Edge save back to the file "
             "automatically a second after you stop typing. New files stay in your browser, and appear in Recent, until "
             "you save them with Ctrl S."),
            ("Can I see the preview while I type?", "Yes. Split view shows the formatted preview next to the source and "
             "updates as you type, with both panes scrolling together."),
            ("Does it support tables, maths and diagrams?", "Yes. GitHub-style tables and task lists, LaTeX maths between "
             "dollar signs, and Mermaid diagrams in a mermaid code block."),
            ("Can I use it on my phone?", "Yes. On narrow screens the editor and preview switch with the Edit and Preview "
             "tabs, and the toolbar wraps to fit."),
        ],
    },
    "/markdown-to-pdf": {
        "title": "Markdown to PDF Converter – Free, Online, No Sign-up | Digitum",
        "desc": 'Convert Markdown to PDF online, free. Selectable text, clickable links, code highlighting, tables and maths. Set paper size, margins and page numbers.',
        "eyebrow": "Markdown to PDF",
        "h1": "Convert Markdown to PDF that <em>looks the part</em>",
        "lede": "Open or paste your markdown and save it as a clean, print-ready PDF. Text stays selectable, links stay "
                "clickable, and code, tables and maths come out properly formatted. Free and private.",
        "sections": [
            ("A PDF worth sending", None, [
                ("Real text, not a screenshot", "The PDF is made by your browser's own print engine, so text can be "
                 "selected and searched, and links can be clicked."),
                ("Paper, margins and page numbers", "Pick A4 or Letter, narrow, normal or wide margins, and page numbers "
                 "at the foot of each page in Settings."),
                ("Code, tables and maths", "Syntax-highlighted code blocks, tables that do not break across pages where "
                 "they can avoid it, and LaTeX maths rendered with KaTeX."),
                ("Always light and clean", "Even if you read in dark mode, the PDF comes out in the light print layout, "
                 "without the app's buttons and panels."),
                ("Your own styling", "Add custom CSS in Settings to change fonts, colours or spacing in the PDF."),
                ("Private", "The conversion happens on your device. Nothing is uploaded."),
            ]),
        ],
        "steps_title": "How to convert Markdown to PDF",
        "steps": [
            "Drag your .md file onto the page, or paste markdown into the box below.",
            "Optionally set paper size, margins and page numbers in <strong>Settings</strong>.",
            "Press the <strong>Export</strong> button and choose <strong>PDF</strong>.",
            "In the print dialog, choose <strong>Save as PDF</strong> as the destination and save.",
        ],
        "faq": [
            ("How do I convert an MD file to PDF?", "Open the .md file here, press Export, choose PDF, then pick Save as "
             "PDF in the print dialog. The file is named after your document."),
            ("Will links work in the PDF?", "Yes. Links stay clickable and text stays selectable, because the PDF is "
             "produced from the formatted page rather than from an image."),
            ("Can I add page numbers?", "Yes. Turn on Page numbers in Settings, under PDF and print, and each page gets "
             "a number at the bottom."),
            ("Is there a file size limit?", "No. The conversion runs in your browser, so very long documents work too."),
            ("Can I export to other formats?", "Yes: Markdown, plain HTML, styled HTML and PNG are in the same Export "
             "menu."),
        ],
    },
    "/markdown-to-html": {
        "title": "Markdown to HTML Converter – Clean or Styled HTML, Free | Digitum",
        "desc": 'Convert Markdown to clean or styled HTML online, free. Copy the HTML or paste formatted text into Gmail, Docs or WordPress. Private, no sign-up.',
        "eyebrow": "Markdown to HTML",
        "h1": "Convert Markdown to <em>clean HTML</em>",
        "lede": "Turn markdown into clean, semantic HTML for your website or CMS, or into a single styled page you can "
                "send or host anywhere. Copy it, download it, or paste the formatted text straight into an editor.",
        "sections": [
            ("Four ways to get your HTML", None, [
                ("Plain HTML", "Semantic markup with no styling: headings, paragraphs, lists, tables and code, ready to "
                 "drop into a template."),
                ("Styled HTML", "One self-contained .html file with typography, highlighted code, maths and any local "
                 "images embedded, so it looks right wherever it is opened."),
                ("Copy HTML code", "Put the HTML on your clipboard to paste into a CMS's code view or a template."),
                ("Copy formatted text", "Paste the formatted result straight into Gmail, Google Docs, Notion or the "
                 "WordPress block editor, with headings, lists and links intact."),
                ("GitHub Flavored Markdown", "Tables, task lists, strikethrough and fenced code blocks convert the way "
                 "they do on GitHub."),
                ("Private", "The conversion runs in your browser. Nothing is uploaded."),
            ]),
        ],
        "steps_title": "How to convert Markdown to HTML",
        "steps": [
            "Open your .md file, or paste markdown into the box below.",
            "Press the <strong>Export</strong> button.",
            "Choose <strong>HTML</strong> for clean markup or <strong>Styled HTML</strong> for a finished page.",
            "Or choose <strong>Copy HTML code</strong> or <strong>Copy formatted text</strong> to paste it elsewhere.",
        ],
        "faq": [
            ("What is the difference between HTML and Styled HTML?", "HTML gives you bare semantic markup to style "
             "yourself. Styled HTML is a complete page with fonts, colours, highlighted code and maths built in."),
            ("Can I paste the result into WordPress or Google Docs?", "Yes. Use Copy formatted text in the Export menu "
             "and paste: headings, lists, links and tables keep their formatting."),
            ("Are images included?", "Images from the web stay as links. Images you opened alongside the markdown file "
             "are embedded into the Styled HTML file so it works on its own."),
            ("Does it keep code highlighting?", "Styled HTML keeps the syntax colours. Plain HTML keeps the language "
             "class on each code block so your own highlighter can colour it."),
        ],
    },
    "/markdown-cheat-sheet": {
        "title": "Markdown Cheat Sheet – Syntax Guide with Examples | Digitum",
        "desc": 'Markdown cheat sheet with examples: headings, bold, lists, links, images, code, tables, task lists, maths and diagrams. Try each one live.',
        "eyebrow": "Markdown cheat sheet",
        "h1": "Markdown cheat sheet, <em>with live examples</em>",
        "lede": "Every piece of markdown syntax on one page, from headings and lists to tables, maths and diagrams. "
                "Open the interactive version to edit the examples and see the result instantly.",
        "cta": ("Open the interactive cheat sheet", "/?open=cheatsheet"),
        "sections": [],
        "cheatsheet": True,
        "steps_title": None,
        "steps": [],
        "faq": [
            ("How do I make text bold in markdown?", "Wrap it in two asterisks: <code>**bold**</code>. One asterisk on "
             "each side, <code>*italic*</code>, makes it italic."),
            ("How do I make a table in markdown?", "Separate cells with pipes and put a row of dashes under the header: "
             "<code>| Name | Age |</code>, then <code>| --- | --- |</code>, then one row per line."),
            ("How do I add a line break?", "Leave a blank line to start a new paragraph. For a line break inside a "
             "paragraph, end the line with two spaces or a backslash."),
            ("How do I write maths in markdown?", "Put inline maths between single dollar signs, like "
             "<code>$E = mc^2$</code>, and a display equation between double dollar signs on their own lines."),
        ],
    },
}

CHEATSHEET_ROWS = [
    ("Heading", "# Heading 1<br>## Heading 2<br>### Heading 3"),
    ("Bold", "**bold text**"),
    ("Italic", "*italic text*"),
    ("Strikethrough", "~~struck text~~"),
    ("Inline code", "`code`"),
    ("Link", "[link text](https://example.com)"),
    ("Image", "![alt text](image.png)"),
    ("Bulleted list", "- First item<br>- Second item<br>&nbsp;&nbsp;- Nested item"),
    ("Numbered list", "1. First<br>2. Second"),
    ("Task list", "- [x] Done<br>- [ ] To do"),
    ("Quote", "&gt; A quoted line"),
    ("Divider", "---"),
    ("Code block", "```js<br>const a = 1;<br>```"),
    ("Table", "| Name | Age |<br>| --- | ---: |<br>| Ana | 31 |"),
    ("Inline maths", "$E = mc^2$"),
    ("Display maths", "$$<br>\\frac{a}{b}<br>$$"),
    ("Diagram", "```mermaid<br>graph LR<br>&nbsp;&nbsp;A --&gt; B<br>```"),
]

# ------------------------------------------------------------------ rendering

def strip_tags(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s))


def faq_html(items, title="Frequently asked questions"):
    out = ['<h2>%s</h2>' % title, '<div class="faq">']
    for q, a in items:
        out.append('<details><summary>%s</summary><p>%s</p></details>' % (html.escape(q), a))
    out.append('</div>')
    return "\n".join(out)


def faq_ld(items, url):
    return {"@type": "FAQPage", "@id": url + "#faq", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)}}
        for q, a in items]}


def steps_html(title, steps):
    if not steps:
        return ""
    return '<h2>%s</h2>\n<ol class="steps">%s</ol>' % (title, "".join("<li>%s</li>" % s for s in steps))


def howto_ld(title, steps, url):
    return {"@type": "HowTo", "@id": url + "#howto", "name": title,
            "step": [{"@type": "HowToStep", "position": i + 1, "text": strip_tags(s)} for i, s in enumerate(steps)]}


def features_html(title, items):
    cards = "".join('<div class="feat"><h3>%s</h3><p>%s</p></div>' % (html.escape(h), html.escape(p)) for h, p in items)
    return '<h2>%s</h2>\n<div class="feats">%s</div>' % (title, cards)


def tools_html(current):
    links = []
    for path, name, sub in TOOLS:
        if path == current:
            continue
        links.append('<a href="%s"><strong>%s</strong><span>%s</span></a>' % (path, name, sub))
    return '<h2>More free markdown tools</h2>\n<nav class="tools" aria-label="Markdown tools">%s</nav>' % "".join(links)


def cheatsheet_html():
    rows = "".join('<tr><th scope="row">%s</th><td><code>%s</code></td></tr>' % (n, c) for n, c in CHEATSHEET_ROWS)
    return ('<h2>Markdown syntax at a glance</h2>\n<table class="cheat"><thead><tr><th scope="col">Element</th>'
            '<th scope="col">Markdown</th></tr></thead><tbody>%s</tbody></table>' % rows)


def app_ld(url, name, desc):
    return {"@type": "WebApplication", "@id": url + "#app", "name": name, "url": url, "description": desc,
            "applicationCategory": "DeveloperApplication", "operatingSystem": "Any (web browser)",
            "browserRequirements": "Requires JavaScript. Works in Chrome, Edge, Firefox and Safari.",
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
            "image": SITE + "/og-image.png", "publisher": {"@id": ORG["@id"]}, "inLanguage": "en"}


def breadcrumb_ld(url, name):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Markdown Viewer", "item": SITE + "/"},
        {"@type": "ListItem", "position": 2, "name": name, "item": url}]}


def home():
    url = SITE + "/"
    body = "\n".join([
        features_html("Everything you need to read and write markdown", FEATURES),
        steps_html("How to open a markdown file online", HOME_STEPS),
        "<h2>What is markdown?</h2>\n" + "\n".join("<p>%s</p>" % p for p in WHAT_IS),
        faq_html(HOME_FAQ),
        tools_html("/"),
    ])
    ld = {"@context": "https://schema.org", "@graph": [
        dict(app_ld(url, "Digitum Markdown Viewer",
                    "Free online markdown viewer and editor. Open .md files, edit with live preview, and export to PDF, "
                    "HTML or PNG. Runs in your browser."),
             featureList=[h for h, _ in FEATURES], screenshot=SITE + "/og-image.png"),
        ORG,
        {"@type": "WebSite", "@id": url + "#site", "url": url, "name": "Digitum Markdown Viewer",
         "publisher": {"@id": ORG["@id"]}, "inLanguage": "en"},
        howto_ld("How to open a markdown file online", HOME_STEPS, url),
        faq_ld(HOME_FAQ, url),
    ]}
    return body, ld


def landing(path, p):
    url = SITE + path
    parts = []
    if p.get("cta"):
        parts.append('<p class="cta-row"><a class="btn primary" href="%s">%s</a></p>' % (p["cta"][1], p["cta"][0]))
    if p.get("cheatsheet"):
        parts.append(cheatsheet_html())
    for title, _, items in p["sections"]:
        parts.append(features_html(title, items))
    if p["steps"]:
        parts.append(steps_html(p["steps_title"], p["steps"]))
    parts.append(faq_html(p["faq"]))
    parts.append(tools_html(path))
    name = p["eyebrow"]
    graph = [app_ld(url, "Digitum " + name, p["desc"]), ORG, breadcrumb_ld(url, name), faq_ld(p["faq"], url)]
    if p["steps"]:
        graph.append(howto_ld(p["steps_title"], p["steps"], url))
    return "\n".join(parts), {"@context": "https://schema.org", "@graph": graph}


def ld_text(obj):
    # safe inside <script>: no "</" sequences
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def main():
    idx = ROOT / "public" / "index.html"
    s = idx.read_text()
    body, ld = home()
    s = re.sub(r"<!--seo:start-->.*?<!--seo:end-->",
               lambda m: "<!--seo:start-->\n" + body + "\n<!--seo:end-->", s, flags=re.S)
    s = re.sub(r'(<script type="application/ld\+json" id="ldjson">).*?(</script>)',
               lambda m: m.group(1) + ld_text(ld) + m.group(2), s, flags=re.S)
    idx.write_text(s)

    out = {}
    for path, p in PAGES.items():
        content, pld = landing(path, p)
        out[path] = {
            "title": p["title"], "desc": p["desc"], "eyebrow": p["eyebrow"], "h1": p["h1"],
            "lede": p["lede"], "content": content, "ld": ld_text(pld),
            "ogTitle": p["title"].split(" | ")[0],
        }
    js = ("// Generated by tools/build_seo.py. Edit the copy there and run it again.\n"
          "export const SITE = %s;\nexport const PAGES = %s;\n" % (json.dumps(SITE), json.dumps(out, indent=1, ensure_ascii=False)))
    (ROOT / "src" / "pages.js").write_text(js)

    urls = [("/", "1.0")] + [(p, "0.8") for p in PAGES]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, prio in urls:
        sm.append("  <url><loc>%s%s</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq><priority>%s</priority></url>"
                  % (SITE, path, TODAY, prio))
    sm.append("</urlset>")
    (ROOT / "public" / "sitemap.xml").write_text("\n".join(sm) + "\n")
    print("home + %d landing pages + sitemap written" % len(PAGES))


if __name__ == "__main__":
    main()
