"""SEO copy for group 2. Merged by tools/seo_copy.py."""
COPY = {
    "/pdf-to-markdown": {
        "title": "PDF to Markdown Converter – Free, Private, Online | Digitum",
        "desc": "Free PDF to Markdown converter. Turn a PDF into editable .md with headings, paragraphs and lists, right in your browser. No upload, no sign-up.",
        "h1": "PDF to Markdown <em>converter</em>",
        "lede": "This PDF to Markdown converter reads the text of your PDF and rebuilds it as clean markdown, with headings, paragraphs and lists. The file is read in your browser and never uploaded.",
        "about": ("What is a PDF to Markdown converter?", [
            "A PDF stores text as positioned pieces on a page, not as headings and paragraphs. A PDF to Markdown converter "
            "reads those pieces and works the structure back out, so you get a document you can edit, search, version and "
            "reuse instead of a fixed page layout.",
            "This tool uses PDF.js to read each page, groups the text into lines, and then looks at size and spacing. Text "
            "that is clearly larger than the body becomes a <code>#</code>, <code>##</code> or <code>###</code> heading. "
            "Lines that start with a bullet or a number become list items. Lines broken by the page width are joined into "
            "paragraphs, and words split by a hyphen at the end of a line are put back together. A progress bar shows "
            "which page is being read, so long documents are easy to follow.",
            "Some things do not carry across. Bold and italic, links, images, colours and page headers are not kept, and "
            "tables come out as lines of text in reading order. Pages with two or more columns may need tidying. Scanned "
            "PDFs contain pictures of pages rather than text, so they need OCR instead. When you convert PDF to Markdown "
            "here, the result opens on the right, where you can check it, copy it, download a <code>.md</code> file or "
            "open it in the <a href=\"/markdown-editor\">markdown editor</a> to finish it off.",
        ]),
        "uses": ("Common uses for PDF to MD conversion", [
            "Move a report, white paper or handbook into a wiki, a Git repository or a static site generator.",
            "Pull the text out of a PDF manual so you can quote it, search it and keep it up to date.",
            "Turn a PDF handout, course pack or guide into notes for Obsidian, Notion or Logseq.",
            "Prepare a clean text version of a long document to paste into ChatGPT, Claude or another AI tool.",
            "Recover the wording of an old document when the original Word or Google Docs file has been lost.",
            "Make a PDF easier to read on a phone by converting it to markdown that reflows to fit the screen.",
        ]),
        "faq": [
            ("Is the PDF to Markdown converter free?",
             "Yes. It is free with no sign-up, no page limit and no watermark. Because the work happens in your browser, "
             "large PDFs only take as long as your device needs to read them, and nothing is queued on a server."),
            ("Which formatting is kept when I convert PDF to Markdown?",
             "Headings (worked out from text size), paragraphs, bulleted and numbered lists are kept. Bold, italic, links, "
             "images and table borders are not, because a PDF does not store them in a way that can be read back "
             "reliably. Expect to add those by hand where they matter."),
            ("Can I turn the markdown back into a PDF?",
             "Yes. Edit the markdown, then use <a href=\"/markdown-to-pdf\">Markdown to PDF</a> to make a clean, "
             "print-ready PDF with selectable text. Both tools work in a mobile browser as well as on a computer."),
        ],
    },
    "/html-to-markdown": {
        "title": "HTML to Markdown Converter – Paste Code, Get MD | Digitum",
        "desc": "Free HTML to Markdown converter. Paste HTML or open an .html file and get clean GitHub Flavored Markdown with tables, links and code blocks.",
        "h1": "HTML to Markdown <em>converter</em>",
        "lede": "Paste code into this HTML to Markdown converter and get tidy GitHub Flavored Markdown back, with headings, lists, links, images, tables and code blocks kept.",
        "about": ("Why convert HTML to Markdown?", [
            "HTML is written for browsers. It is full of tags, classes and wrappers that make a document hard to read and "
            "hard to edit by hand. Markdown keeps the same structure, headings, lists, links and emphasis, in plain text "
            "that people can read and Git can compare line by line. It is also much shorter, which helps when the text "
            "is going into a prompt or a pull request.",
            "When you convert HTML to Markdown here, each element is mapped to its markdown equivalent. "
            "<code>&lt;h2&gt;</code> becomes <code>##</code>, <code>&lt;strong&gt;</code> becomes <code>**bold**</code>, "
            "<code>&lt;a&gt;</code> becomes a markdown link, and <code>&lt;pre&gt;</code> becomes a fenced code block. "
            "HTML tables become markdown tables with a header row, and task lists and strikethrough are supported. "
            "Scripts, styles, comments and navigation are dropped, and inline styling such as colours and fonts is left "
            "out because markdown has no way to express it.",
            "You can choose how the output looks: <code>#</code> or underlined headings, <code>-</code> or "
            "<code>*</code> bullets, and fenced or indented code. The HTML to MD conversion updates as you type, and "
            "nothing is sent to a server. If you need the reverse, <a href=\"/markdown-to-html\">Markdown to HTML</a> "
            "turns markdown back into clean or styled HTML.",
        ]),
        "uses": ("Common uses for an HTML to Markdown converter", [
            "Move blog posts out of WordPress or another CMS into a static site generator such as Hugo, Jekyll or Astro.",
            "Turn an HTML email or newsletter template into markdown you can store, edit and reuse.",
            "Clean up HTML exported from a wiki or help centre before adding it to a docs repository.",
            "Convert a saved web page into tidy notes for Obsidian or another markdown app.",
            "Strip the markup from HTML snippets before pasting them into a README, a GitHub issue or a forum post.",
            "Give an AI tool clean markdown instead of raw HTML, so it reads the content and uses fewer tokens.",
        ]),
        "faq": [
            ("Can I convert a whole web page by its address?",
             "This tool works on HTML you paste or open as a file. To convert a live page from its link, use "
             "<a href=\"/url-to-markdown\">URL to Markdown</a>, which fetches the page and keeps the main content "
             "without menus and footers."),
            ("Is the HTML to Markdown converter free and private?",
             "Yes. It is free, needs no account, and the conversion runs in your browser, so your HTML is never uploaded. "
             "You can also open a saved .html or .htm file with <strong>Open file</strong> or drag it onto the box. "
             "It works on a phone too, although pasting long code is easier on a computer."),
            ("What happens to HTML that has no markdown equivalent?",
             "Layout elements such as <code>&lt;div&gt;</code> and <code>&lt;span&gt;</code> are unwrapped and their text "
             "is kept. Forms, scripts and styles are removed. Relative links and image paths are kept exactly as written, "
             "so check they still point somewhere useful. The result is plain markdown you can edit straight away."),
        ],
    },
    "/word-to-markdown": {
        "title": "Word to Markdown Converter – DOCX to MD, No Upload | Digitum",
        "desc": "Convert Word to Markdown free. Open a .docx file and get clean markdown with headings, lists, tables and links. DOCX to MD in your browser.",
        "h1": "Word to Markdown <em>converter</em>",
        "lede": "Drop a .docx file into this Word to Markdown converter and get clean markdown with your headings, lists, tables, links, bold and italic carried across.",
        "about": ("Why convert Word to Markdown?", [
            "Word documents are good for printing and tracked changes, but they are awkward in a Git repository, a "
            "documentation site or a notes app. Markdown is plain text, so it is easy to compare, search and publish, "
            "and it opens in any editor on any device. Converting means you only have to write the document once.",
            "This tool reads the .docx file in your browser with Mammoth, which looks at Word's styles rather than how "
            "the text looks. That is why using real heading styles in Word matters: Heading 1 becomes <code>#</code>, "
            "Heading 2 becomes <code>##</code>, and so on. Bulleted and numbered lists, tables, hyperlinks, bold and "
            "italic are kept. Fonts, colours, page layout, headers, footers, comments and tracked changes are not, "
            "because markdown has no place for them. Accept or reject tracked changes in Word before you convert.",
            "Images are embedded in the markdown as data, so nothing goes missing, but they make the file large. You can "
            "swap them for links afterwards. Once the DOCX to markdown conversion is done, copy the result, download a "
            "<code>.md</code> file, or open it in the editor. To check the new markdown against an older version, try "
            "<a href=\"/markdown-compare\">Markdown Compare</a>.",
        ]),
        "uses": ("Common uses for Word to Markdown conversion", [
            "Publish a Word document as a page on a static site, a GitHub wiki or a documentation portal.",
            "Move policies, specs and how-to guides from shared drives into a docs-as-code repository.",
            "Turn a manuscript or article draft into markdown for a blog, Ghost or a newsletter tool.",
            "Bring meeting notes, minutes and reports into Obsidian, Notion or another markdown notes app you already use.",
            "Keep documentation under version control so every change can be reviewed in a pull request.",
            "Convert a CV written in Word into markdown for a personal website, a portfolio or a GitHub profile page.",
        ]),
        "faq": [
            ("How do I convert Word to Markdown?",
             "Drop the .docx file onto the page or press <strong>Open .docx</strong>. The markdown appears on the right "
             "a moment later. Check it in the Preview and Markdown tabs, then copy it, download it or open it in the editor."),
            ("Why are my headings coming out as plain text?",
             "The DOCX to MD conversion uses Word's heading styles. If a title was only made bigger and bold, it is "
             "treated as a normal paragraph. Apply Heading 1, Heading 2 and so on in Word and convert again. The Navigation pane in Word "
             "shows which lines already use heading styles."),
            ("Is my Word document uploaded, and is it free?",
             "No upload: the file is read in your browser and stays on your device. It is free, with no sign-up and no "
             "file limit, and it works in mobile browsers too. Because nothing leaves your device, it suits contracts, HR "
             "documents and other confidential files."),
        ],
    },
    "/excel-to-markdown": {
        "title": "Excel to Markdown Table Converter – XLSX & CSV | Digitum",
        "desc": "Convert Excel to Markdown in seconds. Open an .xlsx or CSV file, or paste cells, and get a neat Excel to Markdown table. Free, private, no sign-up.",
        "h1": "Excel to Markdown <em>table converter</em>",
        "lede": "Open a workbook or paste cells, and this Excel to Markdown converter gives you a neat table you can drop into a README, a doc or a chat.",
        "about": ("How Excel to Markdown conversion works", [
            "Markdown tables are plain text: cells separated by pipes, with a row of dashes under the header. They are "
            "easy to read but slow to type by hand, and one missing pipe breaks the whole table. Converting a "
            "spreadsheet to markdown does the tedious part for you, including escaping pipes inside cells and lining "
            "the columns up so the table is readable even as raw text.",
            "You can open an <code>.xlsx</code>, <code>.xls</code>, <code>.ods</code> or <code>.csv</code> file, or paste "
            "cells copied from Excel or Google Sheets. For an XLSX to Markdown conversion, every sheet in the workbook "
            "becomes its own table under a heading with the sheet's name. The values you see in Excel are used, so "
            "formulas are replaced by their results and merged cells are filled with their value. Line breaks inside a "
            "cell become <code>&lt;br&gt;</code>, and completely empty rows are skipped. Dates and numbers appear as they are "
            "formatted in the sheet.",
            "Choose whether the first row is the header and how columns are aligned. The default puts numbers on the right "
            "and text on the left, the way a spreadsheet does. Formatting such as colours, borders, fonts and charts is "
            "not carried across. To go the other way, <a href=\"/markdown-to-excel\">Markdown to Excel</a> turns markdown "
            "tables back into a workbook, and the <a href=\"/markdown-table-generator\">table generator</a> lets you edit "
            "the result cell by cell.",
        ]),
        "uses": ("Common uses for an Excel to Markdown table", [
            "Add a pricing, feature or comparison table to a GitHub README without typing pipes by hand.",
            "Share a small data summary in a pull request, issue or code review where markdown renders.",
            "Put spreadsheet results, test figures or budgets into documentation written in markdown.",
            "Post a tidy table on Reddit, GitLab or a forum that supports markdown tables.",
            "Give an AI assistant tabular data in a format it reads well, instead of a loose paste of cells.",
            "Keep reference tables in Obsidian or another notes app as plain text you can search.",
        ]),
        "faq": [
            ("How do I convert Excel to Markdown?",
             "Open the .xlsx file, or select the cells in Excel, copy them with <kbd>Ctrl</kbd> <kbd>C</kbd> and paste "
             "them into the box. The Excel to Markdown table appears straight away, ready to copy, download or open in "
             "the editor. In Google Sheets, select the range and copy it in the same way."),
            ("Is my spreadsheet uploaded?",
             "No. The file is read in your browser with SheetJS and never leaves your device. The tool is free, needs "
             "no account and also works in a mobile browser. That makes it fine for internal figures you would rather not "
             "send to an online service."),
            ("Can I convert a CSV file?",
             "Yes, open it here or use <a href=\"/csv-to-markdown\">CSV to Markdown</a>. Commas and semicolons are both "
             "recognised as separators, and quoted cells containing commas are handled correctly."),
        ],
    },
    "/image-to-markdown": {
        "title": "Image to Markdown – OCR Screenshots to Text in MD | Digitum",
        "desc": "Convert image to Markdown with OCR in your browser. Read text from screenshots, photos and scans and get editable markdown. Free, no upload.",
        "h1": "Image to Markdown <em>with OCR</em>",
        "lede": "This image to Markdown tool reads the text in a screenshot, photo or scanned page with OCR and turns it into markdown you can edit.",
        "about": ("How image to Markdown conversion works", [
            "A screenshot or a scan is just pixels: you cannot select, copy or search the words in it. OCR, short for "
            "optical character recognition, finds the letters in those pixels and turns them back into text. This tool "
            "then tidies that text into markdown, joining broken lines into paragraphs, turning bullet points into a "
            "list and making web addresses into links.",
            "Recognition runs on your own device with Tesseract.js. The first time you use a language, its data file is "
            "downloaded once; your image is never uploaded. You can read English, Spanish, French, German, Portuguese, "
            "Italian, Urdu, Arabic or Hindi text. Pick the language before you start, or change it afterwards and the "
            "same image is read again. A thumbnail of the image and a progress bar show what is happening.",
            "Results are best with clear, printed text at a good size, such as a screenshot of a web page or a sharp "
            "scan. Handwriting, low light and curved pages are harder, so check the result before you use it. Headings are not detected from font size, so "
            "add <code>#</code> marks yourself where you need them. Image to "
            "text conversion keeps the words only: pictures, colours and layout are not reproduced. For PDFs that "
            "already contain text, <a href=\"/pdf-to-markdown\">PDF to Markdown</a> is faster and more accurate.",
        ]),
        "uses": ("Common uses for screenshot to Markdown", [
            "Grab the text from a screenshot of a slide, an article or a chat message without retyping it.",
            "Turn a photo of printed notes, a handout or a whiteboard list into editable markdown.",
            "Read the pages of a scanned PDF after exporting each page as an image.",
            "Copy the text out of an image-only social media post, poster or infographic.",
            "Capture error messages and log output from screenshots shared in support tickets, so you can search for them.",
            "Digitise recipes, letters and printed receipts so they can be searched and kept as notes.",
        ]),
        "faq": [
            ("How do I convert a screenshot to Markdown?",
             "Take the screenshot, click this page and press <kbd>Ctrl</kbd> <kbd>V</kbd>. You can also drag an image "
             "onto the page or press <strong>Open image</strong>. The text is read and shown as markdown, ready to copy "
             "or download as a .md file."),
            ("Does image to Markdown work on a phone?",
             "Yes. Open the page in your mobile browser, press <strong>Open image</strong> and pick a photo or "
             "screenshot. Reading takes a little longer on a phone, and the progress bar shows how far it has got."),
            ("Is the image to text tool free?",
             "Yes, completely free with no sign-up and no limit on the number of images. You can open the result in the "
             "editor to format it, or export it with <a href=\"/markdown-to-word\">Markdown to Word</a>. Each image is read "
             "separately, so convert several pages one at a time and join the markdown in the editor."),
        ],
    },
    "/text-to-markdown": {
        "title": "Text to Markdown Converter – Format TXT as MD Free | Digitum",
        "desc": "Convert text to Markdown online. Paste plain text or open a .txt file and get headings, lists, links and paragraphs as clean markdown. Free.",
        "h1": "Text to Markdown <em>formatter</em>",
        "lede": "Paste notes, an email or any plain writing into this text to Markdown formatter, and get headings, lists, links and paragraphs worked out for you.",
        "about": ("What does a text to Markdown converter do?", [
            "Plain text has structure that a person can see but software cannot: a title in capitals, a line ending in "
            "a colon, a list of lines starting with dashes. A text to Markdown converter reads those clues and adds the "
            "markdown marks, so the same words render as a proper document with real headings and lists.",
            "Here, a short line on its own that is in capitals, ends with a colon or reads like a title becomes a "
            "heading, and a title in capitals is changed to title case. A heading at the very top becomes the main "
            "<code>#</code> title, and later ones become <code>##</code> sections. Lines starting with <code>•</code>, "
            "<code>-</code>, <code>*</code>, numbers or letters become bulleted or numbered lists, with indented lines "
            "nested. Web and email addresses become links. Lines that were hard-wrapped, as in many emails and old "
            "text files, are joined back into paragraphs.",
            "Your words are never changed: only formatting is added. If you paste from Word, Google Docs or a web page and "
            "want the existing bold, italic and links kept, use <a href=\"/paste-to-markdown\">Paste to Markdown</a> "
            "instead, because plain text to Markdown conversion only sees the characters. When you are done, copy the "
            "result, download it, or open it in the <a href=\"/markdown-editor\">markdown editor</a> to keep writing. "
            "Everything happens in your browser.",
        ]),
        "uses": ("Common uses for plain text to Markdown", [
            "Turn rough meeting notes, typed quickly in a notes app, into a tidy document with headings, lists and clickable links.",
            "Clean up an email thread or newsletter so it can be published as a blog post.",
            "Do a quick TXT to MD conversion of old notes before moving them into Obsidian or Logseq.",
            "Format a changelog or release notes written as plain text for a GitHub release.",
            "Fix text copied from a PDF or a terminal where every line is broken in the wrong place, and join it up again.",
            "Prepare structured text for an AI prompt, a knowledge base or a help centre article.",
        ]),
        "faq": [
            ("How do I convert text to Markdown?",
             "Paste the text into the left box or open a .txt file. The markdown appears on the right as you type. "
             "Switch between Preview and Markdown to check it, then copy it or download it. If a line becomes a heading when it "
             "should not, end it with a full stop and it stays part of the text."),
            ("Can I convert a .txt file to .md?",
             "Yes. Press <strong>Open file</strong> or drag the .txt file onto the box, then press "
             "<strong>Download .md</strong>. The TXT to MD conversion happens in your browser, so nothing is uploaded "
             "and the file name is kept. Files saved by Notepad, TextEdit and other plain "
             "text editors all work."),
            ("Is it free, and does it work on mobile?",
             "Yes to both. There is no sign-up or limit, and the page works in any modern mobile browser. Paste from "
             "your notes app and copy the markdown back."),
        ],
    },
    "/paste-to-markdown": {
        "title": "Paste to Markdown – Rich Text to MD Converter, Free | Digitum",
        "desc": "Paste to Markdown from Google Docs, Word, Notion, email or the web and get clean markdown instantly. Rich text to markdown with tables kept.",
        "h1": "Paste to Markdown, <em>formatting kept</em>",
        "lede": "Paste to Markdown takes formatted text copied from Google Docs, Word, Notion, a web page or an email and turns it into clean markdown on the spot.",
        "about": ("How paste to Markdown works", [
            "When you copy formatted text, your browser puts two versions on the clipboard: plain text and HTML. This tool "
            "reads the HTML version, so the headings, bold, italic, lists, links, tables and code that you see in the "
            "original are carried across. That makes it the quickest way to turn rich text to markdown without saving or "
            "exporting a file first. It also works for text copied from Outlook, Gmail and Confluence.",
            "The pasted HTML is cleaned before it is converted. Google Docs and Word add a lot of hidden styling, such as "
            "spans with fonts and sizes, and those are removed so the markdown stays short and readable. Images from the "
            "web keep their address. Colours, fonts, comments and page layout are dropped, since markdown has no "
            "equivalent. You can also type into the paste box to fix a word, and the markdown updates.",
            "If the app you copied from only puts plain text on the clipboard, the tool falls back to working out headings "
            "and lists from the text itself. A simple copy and paste is all it takes, and the conversion runs entirely in "
            "your browser. For HTML code rather than formatted text, use "
            "<a href=\"/html-to-markdown\">HTML to Markdown</a>; for a whole shared document, "
            "<a href=\"/google-docs-to-markdown\">Google Docs to Markdown</a> works from the link.",
        ]),
        "uses": ("Common uses for formatted text to Markdown", [
            "Move a section of a Google Doc into a README, a docs site or a static blog without losing its headings and links.",
            "Convert part of a web article, with its links, into notes for Obsidian or Logseq.",
            "Turn a formatted email into markdown for a support ticket or a wiki page.",
            "Copy a table from a web page or a document and get it back as a markdown table.",
            "Bring Notion or Confluence content into a Git repository without going through a separate export step.",
            "Clean up formatted text before pasting it into ChatGPT, Claude or another AI tool.",
        ]),
        "faq": [
            ("How do I paste to Markdown?",
             "Copy the formatted text in its app, click the paste box on this page and press <kbd>Ctrl</kbd> "
             "<kbd>V</kbd> (<kbd>Cmd</kbd> <kbd>V</kbd> on a Mac). The markdown appears on the right straight away, with "
             "buttons to copy it, download it or open it in the editor. Press <strong>Clear</strong> to start again "
             "with a new paste."),
            ("Which formatting is kept when I copy and paste?",
             "Headings, bold, italic, strikethrough, bulleted and numbered lists, links, tables and code blocks. Fonts, "
             "colours, highlights and comments are removed, because markdown cannot show them. Nested lists keep their "
             "indentation, and the first row of a table becomes the markdown header row."),
            ("Is pasted text sent anywhere?",
             "No. The rich text to markdown conversion happens in your browser and nothing is uploaded. It is free, "
             "needs no account, and works on mobile wherever the browser pastes formatted text."),
        ],
    },
    "/markdown-table-generator": {
        "title": "Markdown Table Generator – Build MD Tables Visually | Digitum",
        "desc": "Free markdown table generator. Type into a grid, set column alignment, paste from Excel and copy a neat markdown table. No sign-up needed.",
        "h1": "Markdown table generator, <em>like a spreadsheet</em>",
        "lede": "This markdown table generator lets you type into a grid, add rows and columns, set each column's alignment and copy perfectly formatted markdown.",
        "about": ("Why use a markdown table generator?", [
            "A markdown table is simple in principle: pipes between cells and a row of dashes under the header. In "
            "practice, typing one by hand is fiddly. One missing pipe breaks the table, columns drift out of line, and "
            "changing a single cell can mean re-spacing every row. A markdown table maker removes all of that.",
            "Here you edit a grid like a small spreadsheet. <kbd>Tab</kbd> moves to the next cell and <kbd>Enter</kbd> "
            "moves down, adding a row at the bottom. Buttons add rows and columns, and the arrows above each column set "
            "its alignment, which adds the right colons to the dash row. Pipes inside cells are escaped for you, and the "
            "output is padded so the columns line up as plain text, which keeps diffs easy to read.",
            "To create a markdown table from existing data, paste cells copied from Excel or Google Sheets straight into "
            "the grid, or use the Import box for CSV or an existing markdown table you want to change. A live preview shows "
            "how the table will render, and <strong>Open in editor</strong> takes it into the full editor. For whole "
            "workbooks, <a href=\"/excel-to-markdown\">Excel to Markdown</a> converts every sheet at once, and the "
            "<a href=\"/markdown-cheat-sheet\">markdown cheat sheet</a> covers the rest of the syntax.",
        ]),
        "uses": ("Common uses for a markdown table", [
            "Compare features, plans or prices in a GitHub README or a product page.",
            "List options, parameters and default values in API or project documentation.",
            "Summarise test results or benchmarks in a pull request or an issue so reviewers can scan them.",
            "Keep a reading list, tracker or schedule in Obsidian, Notion or another notes app.",
            "Fix a broken table copied from an old document by importing it and copying it out again.",
            "Post a neat table in a forum, a Reddit comment or a chat that renders markdown.",
        ]),
        "faq": [
            ("How do I create a markdown table?",
             "Type your headers in the top row and your data below. Add rows with <strong>+ Row</strong> or "
             "<kbd>Enter</kbd>, add columns with <strong>+ Column</strong>, then press <strong>Copy markdown</strong>. "
             "The markdown table generator is free and works on a phone too."),
            ("Can I edit a markdown table I already have?",
             "Yes. Paste it into the Import box and press <strong>Import</strong>. The cells and the column alignment are "
             "read back into the grid so you can change them and copy the new version."),
            ("Do markdown tables work everywhere?",
             "Tables are part of GitHub Flavored Markdown, so they work on GitHub, GitLab, Obsidian, Reddit and most "
             "modern editors. Some older or minimal markdown renderers show them as plain text. Discord does not render "
             "tables, so wrap the table in a code block there to keep the columns lined up."),
        ],
    },
    "/markdown-compare": {
        "title": "Markdown Compare – Diff Two Files Side by Side | Digitum",
        "desc": "Markdown compare tool: diff two versions side by side or inline, with changed words highlighted. Compare markdown files in your browser, free.",
        "h1": "Markdown compare, <em>side by side</em>",
        "lede": "Use this markdown compare tool to paste or open two versions and see exactly what changed, with added and removed lines and the changed words highlighted.",
        "about": ("What is a markdown diff?", [
            "A diff is a list of the differences between two versions of a text. Because markdown is plain text, a markdown "
            "diff shows real changes, a reworded sentence, a new list item or a changed link, instead of the hidden "
            "formatting noise you get when comparing Word files or PDFs.",
            "This markdown compare tool lines up the two versions and marks every line that was added, removed or "
            "changed. Inside a changed line, the exact words that differ are highlighted, so a small edit in a long "
            "paragraph is easy to spot. Long stretches with no changes are folded away, leaving three lines of context "
            "around each change, and a summary shows how many lines were added and removed. Line numbers for both "
            "versions are shown next to every line. The sample, a short launch plan with a few edits, shows how changes "
            "are marked before you paste your own.",
            "Read the result side by side, with the original on the left and the new version on the right, or inline as a "
            "single list. Tick <strong>Ignore whitespace</strong> to skip changes that are only spaces or line endings. You "
            "can compare markdown files by opening them, or paste text from anywhere, including code and configuration "
            "files. Both versions stay in your browser. When you are happy with the final version, read it in the "
            "<a href=\"/markdown-reader\">markdown reader</a> or export it with <a href=\"/markdown-to-pdf\">Markdown "
            "to PDF</a>.",
        ]),
        "uses": ("Common uses for comparing markdown", [
            "Check what changed between two drafts of a README, a blog post or a set of docs.",
            "Review edits from a colleague who sent back a copy instead of opening a pull request.",
            "Compare an AI-rewritten version of a document with your original, word by word.",
            "Spot differences between two copies of the same note synced from different devices, before you keep one.",
            "Check the output of a converter against a version you have already edited by hand.",
            "Compare configuration, YAML front matter or changelog files before you publish them.",
        ]),
        "faq": [
            ("How do I compare two markdown files?",
             "Paste or open the original on the left and the changed version on the right. The differences appear "
             "below at once. Switch between <strong>Side by side</strong> and <strong>Inline</strong> to read them. You can also drag a file onto either box, or press "
             "<strong>Open file</strong>."),
            ("Does it compare the rendered result or the source?",
             "It compares the markdown source, which shows every change, including ones that would be hard to see in the "
             "rendered page, such as a changed link address, image path or heading level. To see how a version looks, paste it "
             "into the <a href=\"/markdown-editor\">markdown editor</a>."),
            ("Is this markdown compare tool free?",
             "Yes. It is free, needs no sign-up, has no size limit beyond what your browser can handle, and works on a "
             "phone, where the inline view is easiest to read on a narrow screen."),
        ],
    },
    "/discord-markdown": {
        "title": "Discord Markdown Preview – Text Formatting Guide | Digitum",
        "desc": "Discord markdown preview and formatting guide. Write bold, underline, spoilers, code blocks, headings and subtext and see them before you send.",
        "h1": "Discord markdown <em>preview</em>",
        "lede": "Write a message with Discord markdown and see exactly how it will look in a channel before you send it: bold, underline, spoilers, code blocks, quotes and headings.",
        "about": ("How Discord markdown works", [
            "Discord formatting is based on markdown, with a few rules of its own. <code>**bold**</code>, "
            "<code>*italic*</code> and <code>~~strikethrough~~</code> work as usual, and <code>***bold italic***</code> "
            "combines them. Two underscores, <code>__like this__</code>, give underlined text rather than bold. Two "
            "pipes, <code>||like this||</code>, hide text as a spoiler that readers click to reveal.",
            "Discord also supports block formatting. Lines starting with <code>#</code>, <code>##</code> or "
            "<code>###</code> become headings, and <code>-#</code> makes small grey subtext. A line starting with "
            "<code>&gt;</code> is a quote, and <code>&gt;&gt;&gt;</code> quotes everything after it. Lines starting with "
            "<code>-</code> or a number make lists. Three backticks make a code block, and adding a language name such as "
            "<code>js</code> or <code>py</code> after them turns on syntax colours. Masked links, "
            "<code>[text](https://…)</code>, show text instead of the address.",
            "This Discord markdown preview renders your message the way a Discord channel does, on Discord's dark "
            "background, so you can check your Discord text formatting before posting an announcement or patch notes. "
            "The buttons wrap selected text in the right marks, and a counter shows how close you are to the 2,000 "
            "character limit. Spoilers in the preview can be clicked to reveal them, just as in the app. For general markdown syntax, see the <a href=\"/markdown-cheat-sheet\">markdown cheat "
            "sheet</a>; for Slack's version, use <a href=\"/markdown-to-slack\">Markdown to Slack</a>.",
        ]),
        "uses": ("Common uses for the Discord markdown preview", [
            "Draft server announcements and patch notes with headings, lists and quotes before posting them.",
            "Check that a spoiler hides exactly the right part of a message, such as a plot twist or an answer, and nothing more.",
            "Format code snippets with syntax colours for a help or support channel, and check the language name works.",
            "Write server rules and welcome messages that stay readable on mobile as well as desktop.",
            "Keep long messages under Discord's 2,000 character limit, or see where to split them.",
            "Learn Discord formatting by trying each mark and seeing the result straight away.",
        ]),
        "faq": [
            ("Why does my Discord formatting not show up?",
             "Check that the marks touch the text, with no space inside: <code>**bold**</code> works, "
             "<code>** bold **</code> may not. Headings need a space after the <code>#</code> and must start the line. "
             "Formatting also does not work inside code blocks or inline code. Marks can be combined, as in "
             "<code>__**bold underline**__</code>. Markdown tables are not rendered by Discord, so put a table in a "
             "code block to keep its columns lined up."),
            ("Is the Discord markdown preview free and private?",
             "Yes. It is free, needs no Discord login or bot, and your message stays in your browser until you press "
             "<strong>Copy message</strong> and paste it into Discord yourself. Copying keeps the raw markdown, so Discord applies the formatting "
             "when you send. It works in a phone browser too."),
        ],
    },
}
