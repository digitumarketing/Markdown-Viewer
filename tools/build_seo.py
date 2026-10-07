#!/usr/bin/env python3
"""Generates the search content for the site from one source of truth.

Writes:
  public/index.html   the home page content between <!--seo:start--> and
                      <!--seo:end-->, and its JSON-LD in <script id="ldjson">
  src/pages.js        title, meta, hero and content for every other page,
                      which the Worker serves by rewriting index.html (the
                      full viewer) or tool.html (a converter or tool)
  public/index.html,  the header navigation and Tools menu between
  public/tool.html    <!--nav:start--> and <!--nav:end-->
  public/sitemap.xml  every indexable URL

Tool page copy lives in tools/tool_pages.py.

Run after changing any copy here:  python3 tools/build_seo.py
"""
import html
import json
import pathlib
import re
import sys
from datetime import date

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from tool_pages import TOOL_PAGES  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://markdown.digitum.marketing"
ORG = {"@type": "Organization", "@id": "https://digitum.marketing/#org", "name": "Digitum Marketing",
       "url": "https://digitum.marketing/", "logo": SITE + "/brand/logo-charcoal.png"}
TODAY = date.today().isoformat()

# The Tools menu and the tool directory on every page, in three groups.
# Every tool: the Tools menu (four columns), the All tools page and the
# related-tools links all come from this list.
# (path, name, short description, directory categories, icon)
NAV = [
    ("From Markdown", "Export and publish", [
        ("/markdown-to-pdf", "Markdown to PDF", "Print-ready PDF with selectable text", "from", "pdf"),
        ("/markdown-to-html", "Markdown to HTML", "Clean or styled, self-contained HTML", "from", "code"),
        ("/markdown-to-word", "Markdown to Word", "A real .docx with Word styles", "from", "doc"),
        ("/markdown-to-google-docs", "Markdown to Google Docs", "Paste formatted into a doc", "from", "doc"),
        ("/markdown-to-excel", "Markdown to Excel", "Tables to an .xlsx workbook", "from data", "table"),
        ("/markdown-to-csv", "Markdown to CSV", "Extract tables as CSV", "from data", "table"),
        ("/markdown-to-image", "Markdown to Image", "PNG or JPG in light or dark", "from", "image"),
        ("/markdown-to-text", "Markdown to Text", "Strip the syntax, keep the words", "from", "text"),
        ("/markdown-to-epub", "Markdown to EPUB", "Build an ebook from markdown", "from", "book"),
        ("/markdown-to-latex", "Markdown to LaTeX", "A .tex document for Overleaf", "from", "sigma"),
        ("/markdown-to-confluence", "Markdown to Confluence", "Wiki markup or formatted text", "from", "chat"),
        ("/markdown-to-slack", "Markdown to Slack", "Slack's mrkdwn format", "from", "chat"),
        ("/markmap-editor", "Markmap Editor", "Markdown as a mind map", "from util", "map"),
    ]),
    ("To Markdown", "Import files", [
        ("/pdf-to-markdown", "PDF to Markdown", "Extract PDF text as markdown", "to", "pdf"),
        ("/word-to-markdown", "Word to Markdown", "Convert .docx documents", "to", "doc"),
        ("/html-to-markdown", "HTML to Markdown", "Clean markdown from HTML code", "to", "code"),
        ("/excel-to-markdown", "Excel to Markdown", "Workbooks to markdown tables", "to data", "table"),
        ("/csv-to-markdown", "CSV to Markdown", "CSV files to markdown tables", "to data", "table"),
        ("/json-to-markdown", "JSON to Markdown", "Tables and lists from JSON", "to data", "braces"),
        ("/table-to-markdown", "Table to Markdown", "Paste any table, get markdown", "to data", "table"),
        ("/image-to-markdown", "Image to Markdown", "OCR text from screenshots", "to", "image"),
        ("/epub-to-markdown", "EPUB to Markdown", "Ebooks to markdown", "to", "book"),
        ("/latex-to-markdown", "LaTeX to Markdown", "TeX to markdown, maths kept", "to", "sigma"),
        ("/rtf-to-markdown", "RTF to Markdown", "Rich text files to markdown", "to", "doc"),
        ("/text-to-markdown", "Text to Markdown", "Format plain text", "to", "text"),
    ]),
    ("Web to Markdown", "Pages, docs and chats", [
        ("/url-to-markdown", "URL to Markdown", "Any web page as markdown", "web", "link"),
        ("/paste-to-markdown", "Paste to Markdown", "From Docs, Word or the web", "web to", "clipboard"),
        ("/google-docs-to-markdown", "Google Docs to Markdown", "Convert a shared doc link", "web", "doc"),
        ("/chatgpt-to-markdown", "ChatGPT to Markdown", "Save chats as markdown", "web", "chat"),
        ("/reddit-to-markdown", "Reddit to Markdown", "Posts and comment threads", "web", "chat"),
        ("/podcast-to-markdown", "Podcast to Markdown", "Episodes and show notes", "web", "mic"),
        ("/github-readme-viewer", "GitHub README Viewer", "Any repository's README", "web util", "git"),
    ]),
    ("Markdown tools", "Read, edit and visualise", [
        ("/", "Markdown Viewer", "Open, edit and preview .md files", "util", "eye"),
        ("/markdown-editor", "Markdown Editor", "Live preview editor", "util", "edit"),
        ("/markdown-reader", "Markdown Reader", "Distraction-free reading", "util", "book"),
        ("/markdown-table-generator", "Markdown Table Generator", "Build tables visually", "util data", "table"),
        ("/markdown-compare", "Markdown Compare", "Diff two versions", "util", "diff"),
        ("/mermaid-live-editor", "Mermaid Live Editor", "Diagrams from text", "util", "map"),
        ("/discord-markdown", "Discord Markdown", "Preview Discord messages", "util", "chat"),
        ("/obsidian-markdown", "Obsidian Markdown", "Callouts and wikilinks", "util", "edit"),
        ("/markdown-cheat-sheet", "Markdown Cheat Sheet", "Syntax with examples", "util", "text"),
    ]),
]
CATEGORIES = [("all", "All"), ("to", "Convert to Markdown"), ("from", "Convert from Markdown"),
              ("web", "Web to Markdown"), ("data", "Tables & data"), ("util", "Markdown utilities")]
QUICK = [("/", "Markdown Viewer"), ("/pdf-to-markdown", "PDF to Markdown"),
         ("/markdown-to-pdf", "Markdown to PDF"), ("/tools", "All tools")]

def _svg(d):
    return ('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>')
_FILE = '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'
ICONS = {
    "pdf": _svg(_FILE + '<path d="M9 13h6M9 17h4"/>'), "doc": _svg(_FILE + '<path d="M9 12h6M9 15h6M9 18h3"/>'),
    "code": _svg('<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>'), "table": _svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>'),
    "image": _svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>'),
    "text": _svg('<path d="M4 6h16M4 11h16M4 16h10"/>'), "book": _svg('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>'),
    "sigma": _svg('<path d="M18 5H6l6 7-6 7h12"/>'), "chat": _svg('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>'),
    "map": _svg('<circle cx="12" cy="12" r="2.5"/><circle cx="4.5" cy="6" r="1.8"/><circle cx="19.5" cy="6" r="1.8"/><circle cx="4.5" cy="18" r="1.8"/><circle cx="19.5" cy="18" r="1.8"/><path d="M6 7l4 3.5M18 7l-4 3.5M6 17l4-3.5M18 17l-4-3.5"/>'),
    "braces": _svg('<path d="M8 4c-2 0-2 1.5-2 3v2c0 1.5-1 3-2 3 1 0 2 1.5 2 3v2c0 1.5 0 3 2 3M16 4c2 0 2 1.5 2 3v2c0 1.5 1 3 2 3-1 0-2 1.5-2 3v2c0 1.5 0 3-2 3"/>'),
    "link": _svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    "clipboard": _svg('<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/>'),
    "mic": _svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
    "git": _svg('<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 8v8M18 11c0 4-6 3-11 6"/>'),
    "eye": _svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    "edit": _svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>'),
    "diff": _svg('<path d="M6 3v12M3 12h6M14 6h6M17 3v0M18 21V9"/><circle cx="6" cy="18" r="2"/>'),
}
ALL_TOOLS = [t for _, _, items in NAV for t in items]


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
    """Related tools from the same menu column, plus a link to every tool."""
    if current == "/":
        cols = []
        for title, sub, items in NAV:
            links = "".join('<a href="%s"><strong>%s</strong><span>%s</span></a>' % (p, n, d)
                            for p, n, d, _, _ in items if p != current)
            cols.append('<div class="tool-col"><h3>%s</h3><nav class="tools" aria-label="%s">%s</nav></div>'
                        % (title, title, links))
        return ('<h2>All free markdown tools</h2>\n<div class="tool-dir">%s</div>' % "".join(cols) +
                '\n<p><a class="all-link" href="/tools">Browse all %d tools by category →</a></p>' % len(ALL_TOOLS))
    group = next((items for _, _, items in NAV if any(p == current for p, *_ in items)), NAV[0][2])
    related = [t for t in group if t[0] != current][:8]
    if len(related) < 6:
        related += [t for t in ALL_TOOLS if t[0] != current and t not in related][:6 - len(related)]
    links = "".join('<a href="%s"><strong>%s</strong><span>%s</span></a>' % (p, n, d) for p, n, d, _, _ in related)
    return ('<h2>Related markdown tools</h2>\n<nav class="tools related" aria-label="Related tools">%s</nav>' % links +
            '\n<p><a class="all-link" href="/tools">See all %d free markdown tools →</a></p>' % len(ALL_TOOLS))


def directory_html():
    """The All tools page: filter chips, search and a card per tool (all in the HTML for crawlers)."""
    chips = "".join('<button type="button" data-cat="%s" class="%s" aria-pressed="%s">%s</button>'
                    % (k, "on" if k == "all" else "", "true" if k == "all" else "false", n) for k, n in CATEGORIES)
    names = dict(CATEGORIES)
    cards = []
    for p, n, d, cats, icon in ALL_TOOLS:
        first = cats.split()[0]
        cards.append('<a class="dir-card" href="%s" data-cat="%s"><span class="ico">%s</span><strong>%s</strong>'
                     '<span>%s</span><em class="badge">%s</em></a>' % (p, cats, ICONS.get(icon, ICONS["text"]), n, d, names[first]))
    return ('<div class="dir-bar"><div class="dir-filter" role="group" aria-label="Filter by category">%s</div>'
            '<input class="dir-search" type="search" placeholder="Search tools" aria-label="Search tools">'
            '<span class="dir-count" aria-live="polite">%d tools</span></div>'
            '<div class="dir-grid">%s</div>' % (chips, len(ALL_TOOLS), "".join(cards)))


def itemlist_ld(url):
    return {"@type": "ItemList", "@id": url + "#tools", "name": "Free markdown tools", "numberOfItems": len(ALL_TOOLS),
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "url": SITE + p}
                                for i, (p, n, d, c, ic) in enumerate(ALL_TOOLS)]}


def nav_html():
    """Header links and the Tools menu, shared by index.html and tool.html."""
    quick = "".join('<a class="nav-link" href="%s">%s</a>' % (p, n) for p, n in QUICK)
    cols = []
    for title, sub, items in NAV:
        links = "".join('<a href="%s" role="menuitem">%s</a>' % (p, n) for p, n, *_ in items)
        cols.append('<div class="mega-col"><div class="mega-h">%s</div><div class="mega-sub">%s</div>%s</div>'
                    % (title, sub, links))
    return ('<nav class="site-nav" aria-label="Main">' + quick +
            '<button class="nav-link nav-tools" id="toolsBtn" aria-haspopup="true" aria-expanded="false" '
            'aria-controls="megaMenu">Tools <svg width="10" height="10" viewBox="0 0 10 10" fill="none" '
            'stroke="currentColor" stroke-width="1.5"><path d="M2 3.5l3 3 3-3"/></svg></button>'
            '<div class="mega" id="megaMenu" role="menu" hidden>' + "".join(cols) +
            '<div class="mega-all"><span>%d free tools, all in your browser</span><a href="/tools" role="menuitem">All tools →</a></div>'
            % len(ALL_TOOLS) + '</div></nav>')


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
    items = [{"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"}]
    if url != SITE + "/tools":
        items.append({"@type": "ListItem", "position": 2, "name": "All tools", "item": SITE + "/tools"})
    items.append({"@type": "ListItem", "position": len(items) + 1, "name": name, "item": url})
    return {"@type": "BreadcrumbList", "itemListElement": items}


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
    if p.get("directory"):
        return directory_html(), {"@context": "https://schema.org", "@graph": [
            {"@type": "CollectionPage", "@id": url + "#page", "url": url, "name": p["title"].split(" | ")[0],
             "description": p["desc"], "isPartOf": {"@id": SITE + "/#site"}, "mainEntity": {"@id": url + "#tools"}},
            itemlist_ld(url), ORG, breadcrumb_ld(url, "All tools")]}
    for title, _, items in p.get("sections", []):
        parts.append(features_html(title, items))
    if p.get("features"):
        parts.append(features_html("Why use this " + p["eyebrow"].lower() + " tool", p["features"]))
    if p.get("steps"):
        parts.append(steps_html(p["steps_title"], p["steps"]))
    if p.get("faq"):
        parts.append(faq_html(p["faq"]))
    parts.append(tools_html(path))
    name = p["eyebrow"]
    graph = [app_ld(url, "Digitum " + name, p["desc"]), ORG, breadcrumb_ld(url, name)]
    if p.get("faq"):
        graph.append(faq_ld(p["faq"], url))
    if p.get("steps"):
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
    nav = nav_html()
    s = re.sub(r"<!--nav:start-->.*?<!--nav:end-->", lambda m: "<!--nav:start-->" + nav + "<!--nav:end-->", s, flags=re.S)
    idx.write_text(s)
    tool_shell = ROOT / "public" / "tool.html"
    if tool_shell.exists():
        t = tool_shell.read_text()
        t = re.sub(r"<!--nav:start-->.*?<!--nav:end-->", lambda m: "<!--nav:start-->" + nav + "<!--nav:end-->", t, flags=re.S)
        tool_shell.write_text(t)

    all_pages = dict(PAGES)
    for k, v in PAGES.items():
        v.setdefault("shell", "app")
    all_pages.update(TOOL_PAGES)
    for path, p in all_pages.items():
        assert len(p["desc"]) <= 160, (path, len(p["desc"]))

    out = {}
    for path, p in all_pages.items():
        content, pld = landing(path, p)
        out[path] = {
            "title": p["title"], "desc": p["desc"], "eyebrow": p["eyebrow"], "h1": p["h1"],
            "lede": p["lede"], "content": content, "ld": ld_text(pld),
            "ogTitle": p["title"].split(" | ")[0],
            "shell": p.get("shell", "app"), "tool": p.get("tool", ""),
        }
    js = ("// Generated by tools/build_seo.py. Edit the copy there and run it again.\n"
          "export const SITE = %s;\nexport const PAGES = %s;\n" % (json.dumps(SITE), json.dumps(out, indent=1, ensure_ascii=False)))
    (ROOT / "src" / "pages.js").write_text(js)

    urls = [("/", "1.0")] + [(p, "0.8") for p in all_pages]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, prio in urls:
        sm.append("  <url><loc>%s%s</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq><priority>%s</priority></url>"
                  % (SITE, path, TODAY, prio))
    sm.append("</urlset>")
    (ROOT / "public" / "sitemap.xml").write_text("\n".join(sm) + "\n")
    print("home + %d pages + nav + sitemap written" % len(all_pages))


if __name__ == "__main__":
    main()
