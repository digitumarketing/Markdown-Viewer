"""SEO copy for group 3. Merged by tools/seo_copy.py."""
COPY = {
    "/obsidian-markdown": {
        "title": "Obsidian Markdown Viewer: Callouts & Wikilinks | Digitum",
        "desc": "Preview Obsidian markdown online: callouts, wikilinks, highlights, tags and properties render like reading view. Open your notes free, with no install.",
        "h1": "Obsidian markdown viewer for <em>notes and callouts</em>",
        "lede": "Paste a note or open a .md file and see Obsidian markdown rendered the way Obsidian's reading view shows it, with callouts, wikilinks, highlights and tags.",
        "about": ("What is Obsidian markdown?", [
            "Obsidian markdown is the flavour of markdown used by the Obsidian notes app. It is ordinary CommonMark and "
            "GitHub Flavored Markdown with a few extras on top: <strong>obsidian callouts</strong> such as "
            "<code>&gt; [!tip]</code>, <strong>obsidian wikilinks</strong> such as <code>[[Note]]</code>, "
            "<code>==highlights==</code>, inline <code>#tags</code>, <code>%%comments%%</code> and YAML properties at the top of a note.",
            "Your Obsidian notes are plain .md files on disk, so you can open them anywhere. The catch is that most other "
            "viewers do not know the extras. A callout shows up as a quote that starts with <code>[!note]</code>, and a "
            "wikilink shows as square brackets. This page reads the extras and renders them, so a note looks right when you "
            "are away from your own computer, or when you want to show it to someone who does not use Obsidian.",
            "Nothing is uploaded. The note is rendered in your browser, and it works on a phone or tablet as well as a "
            "desktop. When you want a file to share, open the note in the editor and export it, or send it through "
            "<a href=\"/markdown-to-pdf\">Markdown to PDF</a> for a printable copy.",
        ]),
        "uses": ("Common uses for an Obsidian markdown viewer", [
            "Read a note from your vault on a work computer or a borrowed laptop where you cannot install Obsidian or sync your vault.",
            "Check how callouts, highlights and folded sections will look before you send a note to a colleague who reads it elsewhere.",
            "Share a meeting note with a client or teammate who has never used Obsidian, as a tidy PDF or a single HTML page.",
            "Look over Obsidian notes synced to a phone through a cloud drive, where a full vault app is slow to open or not installed.",
            "Proofread a note with its properties table shown at the top, so titles, dates and tags are easy to check before you publish.",
            "Turn a note into a clean document by opening it in the <a href=\"/markdown-editor\">online markdown editor</a>, tidying the wording and exporting it.",
        ]),
        "faq": [
            ("Is my note uploaded anywhere?",
             "No. The Obsidian markdown is parsed and rendered in your browser. Nothing is sent to a server, nothing is stored, and there is no account or sign-up. Close the tab and the note is gone from the page."),
            ("What happens to embeds like <code>![[image.png]]</code>?",
             "They are shown as labelled references to the embedded image or note, because the files live in your vault, not online. To show the picture itself, replace the embed with a normal markdown image that points to a web address."),
            ("Will the exported file keep callouts?",
             "Export keeps the rendered look in PDF and HTML. If you paste the note into a tool that only knows standard "
             "markdown, callouts become plain quotes and wikilinks stay as text in brackets."),
        ],
    },

    "/github-readme-viewer": {
        "title": "GitHub README Viewer: Read Any Repo's README | Digitum",
        "desc": "Free GitHub README viewer. Type owner/repo or paste a link to view the GitHub README.md rendered with images, tables and code. No sign-up or install.",
        "h1": "GitHub README viewer for <em>any public repo</em>",
        "lede": "This GitHub README viewer loads a repository's README.md and renders it with images, tables, badges and code, so you can read it, copy it or open it in the editor.",
        "about": ("What does a GitHub README viewer do?", [
            "A README is the front page of a repository. It is usually a <strong>README.md</strong> file in markdown, and it "
            "explains what the project is, how to install it and how to use it. GitHub shows it below the file list, but "
            "sometimes you want the README on its own: to read it without the clutter, to copy its markdown, or to edit "
            "and export it.",
            "This readme viewer asks GitHub's public API for the repository's README, decodes it and renders it as GitHub "
            "Flavored Markdown. Relative image paths and links are rewritten to point back at the repository, so screenshots "
            "load and links open the right file. You can name a branch or tag, or paste a link to any other .md file in the repo.",
            "The request goes from your browser straight to GitHub; this site does not store the repository or what you "
            "read. Only public repositories work, and GitHub limits anonymous requests to about 60 an hour per network, so "
            "a busy office may hit the limit and need to wait a few minutes. If you only want to preview your own README.md before "
            "pushing, paste it into the <a href=\"/markdown-reader\">markdown reader</a> instead; no request to GitHub is needed.",
        ]),
        "uses": ("Common uses for the GitHub README viewer", [
            "View a GitHub README on a phone without the file list, the sidebar and the rest of the repository page around it.",
            "Copy a well-written project's README markdown as a starting point for the structure of your own documentation.",
            "Read the README of a release branch or tag to see the install instructions that match the version you are actually using.",
            "Export a README as a PDF for offline reading on a train, or to attach to a security, licence or vendor review.",
            "Open a README in the <a href=\"/markdown-editor\">markdown editor</a> to draft wording changes, fix broken links and check the preview before you open a pull request.",
            "Compare two versions of a README, say the main branch and a release tag, with <a href=\"/markdown-compare\">Markdown compare</a> after copying both.",
        ]),
        "faq": [
            ("Is the GitHub README viewer free?",
             "Yes. It is free with no account and no sign-up, and you do not need a GitHub login either. It works in any modern browser, including Safari and Chrome on mobile."),
            ("Why do I see a rate limit message?",
             "GitHub allows a limited number of anonymous API requests per hour from one network, and everyone on a shared office "
             "or school connection counts towards the same limit. Wait a few minutes and press <strong>Load README</strong> again."),
            ("Can I share a link to a README?",
             "Yes. After loading, the page address includes <code>?repo=owner/repo</code>, so you can copy it and anyone "
             "who opens it can view GitHub README content for that repository straight away."),
        ],
    },

    "/mermaid-live-editor": {
        "title": "Mermaid Live Editor: Draw Diagrams from Text | Digitum",
        "desc": "Free Mermaid live editor: write a mermaid diagram in text and see it drawn as you type. Flowcharts, Gantt and sequence charts. Export SVG or PNG.",
        "h1": "Mermaid live editor: <em>diagrams from text</em>",
        "lede": "Type Mermaid syntax in this Mermaid live editor and the diagram redraws as you type, with themes, examples and SVG or PNG download.",
        "about": ("What is a Mermaid live editor?", [
            "Mermaid is a small text language for diagrams. You write <code>A --&gt; B</code> and get two boxes joined by "
            "an arrow. A Mermaid live editor puts the text on one side and the drawing on the other, and redraws on every "
            "change, so you see mistakes at once instead of after a commit.",
            "This mermaid editor covers the diagram types people use most: flowcharts, sequence diagrams, class and state "
            "diagrams, entity relationship diagrams, Gantt charts, pie charts, mind maps, timelines and git graphs. Pick an "
            "example to start, change the text, and choose a default, neutral, dark or forest theme to match where the diagram will appear. When the syntax is wrong, the error message from Mermaid "
            "is shown above the drawing.",
            "When the mermaid diagram is ready, download it as SVG for sharp print and docs, or PNG for slides and chat. "
            "You can also copy it as a fenced <code>mermaid</code> code block and paste it into a README, a wiki or a note; "
            "GitHub, GitLab and Obsidian draw it in place. Everything runs in your browser and nothing is uploaded.",
        ]),
        "uses": ("Common uses for a Mermaid live editor", [
            "Sketch a flowchart of a sign-up or checkout process for a team discussion, and change it live while people talk.",
            "Draw a sequence diagram of an API call between a browser, a server and a database before writing the code, so the team agrees on the order of steps.",
            "Plan a project as a Gantt chart that lives in the same repository as the work, so the plan is updated in the same pull request.",
            "Make a pie or other Mermaid chart for a monthly report, then download it as PNG for slides or SVG for print.",
            "Fix a diagram that fails to render on GitHub or GitLab by pasting it here and reading the exact error message.",
            "Lay out a topic as a mind map with the Mermaid mindmap type, or try <a href=\"/markmap-editor\">Markmap</a> to turn a plain markdown outline into an interactive one.",
        ]),
        "faq": [
            ("Is this Mermaid live editor free?",
             "Yes, it is free, needs no sign-up, and works on desktop and mobile browsers. Your diagram text stays in your browser and is not uploaded, which matters when a diagram shows internal systems."),
            ("How do I put the diagram in a README?",
             "Press <strong>Copy as markdown</strong> to get a fenced <code>mermaid</code> block and paste it into the "
             "file. Preview the whole document in the <a href=\"/markdown-editor\">markdown editor</a>, which draws Mermaid too."),
            ("Why is my diagram not drawing?",
             "Usually a syntax error, such as a missing arrow, an unclosed bracket or a label with special characters that needs "
             "quotes. The message above the canvas names the problem; fix it and the drawing comes back. Check that the first "
             "line names the diagram type, such as <code>flowchart LR</code> or <code>sequenceDiagram</code>."),
        ],
    },

    "/csv-to-markdown": {
        "title": "CSV to Markdown Table Converter, Free & Private | Digitum",
        "desc": "Convert CSV to Markdown in your browser. Open a .csv file or paste text and get an aligned CSV to markdown table for READMEs and docs. Free, no sign-up.",
        "h1": "CSV to Markdown <em>table converter</em>",
        "lede": "Convert CSV to Markdown in one step: open a .csv file or paste comma-separated text and copy a clean, aligned markdown table.",
        "about": ("Why convert CSV to Markdown?", [
            "CSV is the plainest way to move rows of data between apps, but it is hard to read: every value is squeezed "
            "between commas. Markdown tables are just as plain, yet they read well as text and render as real tables on "
            "GitHub, GitLab, in wikis and in note apps. Converting CSV to Markdown gives you a table you can drop straight "
            "into a README, a pull request or a report.",
            "This CSV to markdown table converter reads the file the way a spreadsheet would. Quoted values that contain "
            "commas or line breaks stay in one cell, doubled quotes become single quotes, and files that use semicolons "
            "are detected. Pipe characters inside cells are escaped so they do not break the table, and line breaks in a "
            "cell become <code>&lt;br&gt;</code>.",
            "You choose whether the first row is a header and how columns line up: numbers right-aligned, or everything "
            "left, centred or right. The output is padded so the columns line up in plain text too, which makes diffs in "
            "Git easy to read. Copy the result, download it as a .md file, or open it in the editor to keep writing around it. "
            "It all runs in your browser, so a CSV to md conversion of customer or sales data never leaves your computer.",
        ]),
        "uses": ("Common uses for CSV to Markdown", [
            "Put a small dataset, a changelog summary or a benchmark result in a GitHub README so it renders as a real table.",
            "Paste an export from Google Analytics, Search Console or another reporting tool into a pull request, an issue or a project status update.",
            "Add a price list or feature matrix to a static site built with Hugo, Jekyll, Astro or another markdown-based generator.",
            "Share a short weekly report in a wiki, a Notion page or a forum that renders markdown tables, without attaching a spreadsheet nobody opens.",
            "Turn a database query result saved as CSV into documentation that sits next to the code and the SQL that produced it, so readers can see real sample rows.",
            "Tidy the table afterwards in the <a href=\"/markdown-table-generator\">markdown table generator</a> to rename columns, add or delete rows, or fix a typo.",
        ]),
        "faq": [
            ("Is my CSV file uploaded?",
             "No. The CSV to Markdown conversion runs in your browser. The file is never sent to a server, nothing is stored, and there is no sign-up. It also works on a phone: open the .csv from your files app or paste the text."),
            ("What is lost when I convert?",
             "Only things CSV does not hold anyway, such as colours, fonts and formulas. Every value is kept as text exactly as it appears in the file, and completely empty rows are dropped so the table stays compact."),
            ("Can I convert a tab-separated file?",
             "Yes. Open a .tsv file, or paste text with tabs, such as cells copied from a spreadsheet, and it is read as columns. For whole .xlsx workbooks with several sheets, use <a href=\"/excel-to-markdown\">Excel to Markdown</a>."),
        ],
    },

    "/markdown-to-csv": {
        "title": "Markdown to CSV: Markdown Table to CSV Converter | Digitum",
        "desc": "Convert a markdown table to CSV online. Pick any table, choose comma, semicolon or tab, and download Markdown to CSV for Excel or Sheets. Free, private.",
        "h1": "Markdown to CSV <em>table extractor</em>",
        "lede": "Paste a document and turn any table in it from Markdown to CSV, ready for Excel, Google Sheets or a database import.",
        "about": ("Why convert Markdown to CSV?", [
            "Markdown tables are great for reading, but you cannot sort, filter, sum or chart them. A spreadsheet can. "
            "Converting a markdown table to CSV moves the data into a format that every spreadsheet, database and "
            "reporting tool can open, without retyping a single cell or fighting with copy and paste.",
            "This tool finds every table in the markdown you paste, including tables deep inside a long README, a meeting "
            "note or a report, and lists them by the heading they sit under. Pick one, choose the separator, and the CSV "
            "appears on the right. Bold, italic, code and links are reduced to their plain text, and escaped pipes become "
            "normal pipe characters. Cells that contain the separator, a quote or a line break are wrapped in quotes so they "
            "stay in one column when the file is opened.",
            "Downloads include a byte order mark, which tells Excel the file is UTF-8, so accents, currency signs and other "
            "symbols show correctly instead of turning into odd characters. Choose semicolon if your Excel uses a comma as "
            "the decimal mark, which is common in much of Europe, or tab for a .tsv file that pastes cleanly into any spreadsheet. You can also copy the CSV text straight from the result box instead of downloading a file. Column alignment from the markdown "
            "is not stored, because CSV has no place for it. The md to csv conversion happens in your browser; nothing is uploaded.",
        ]),
        "uses": ("Common uses for Markdown to CSV", [
            "Pull a comparison table out of a README so you can sort it by price, rating or date in Google Sheets or Numbers.",
            "Move a table written by ChatGPT, Claude or another assistant into a spreadsheet where you can check the numbers.",
            "Import a table of contacts, products or URLs from documentation into a database or a CRM.",
            "Chart monthly numbers that were kept in a markdown report or a changelog, once they sit in proper spreadsheet cells.",
            "Hand data to a colleague who works in Excel; for a full workbook with a sheet per table use <a href=\"/markdown-to-excel\">Markdown to Excel</a>.",
            "Round-trip a table: edit it as CSV in a spreadsheet, then bring it back with <a href=\"/csv-to-markdown\">CSV to Markdown</a>.",
        ]),
        "faq": [
            ("What if my markdown has several tables?",
             "Every table is listed in the <strong>Table</strong> menu, numbered and named after the heading above it. Pick "
             "one and the CSV updates. Download each table you need in turn; the file is named after your document, so rename it if you save several."),
            ("Is Markdown to CSV free to use?",
             "Yes, free with no account or sign-up. It works in desktop and mobile browsers, and your data stays on your "
             "device because the conversion runs locally."),
            ("Why does Excel put everything in one column?",
             "Your Excel probably expects semicolons, because your region uses a comma for decimals. Choose "
             "<strong>Semicolon</strong> as the separator and download again, or import the file with Excel's text import and pick comma. Google Sheets detects the separator on its own."),
        ],
    },

    "/json-to-markdown": {
        "title": "JSON to Markdown Converter: Tables & Lists | Digitum",
        "desc": "Convert JSON to Markdown online: arrays of objects become a JSON to markdown table, nested objects become sections and lists. Free, private, no sign-up.",
        "h1": "JSON to Markdown <em>tables and lists</em>",
        "lede": "Paste an API response or open a .json file, and this JSON to Markdown converter turns it into tables and lists people can read.",
        "about": ("Why convert JSON to Markdown?", [
            "JSON is built for programs. Braces, quotes and commas make it hard for a person to scan, and it does not "
            "render nicely in a README, a ticket or a chat. Converting JSON to Markdown keeps the same data but lays it out "
            "for people: rows of records become tables and nested settings become headings and lists.",
            "In the default layout, an array of objects becomes a JSON to markdown table with one column for every key "
            "found in any record, so a field missing from one record simply leaves an empty cell. Number columns are "
            "right-aligned, and columns are padded so the table also reads well as plain text. Simple values of an object go into a Key/Value table, and each nested object gets its own "
            "heading, one level deeper each time. Arrays that do not hold records become bullet lists. If you prefer an "
            "outline, switch to <strong>Nested list</strong> and the whole document becomes indented bullets with bold keys.",
            "Values inside table cells that are themselves objects or arrays are written as compact JSON, so nothing is "
            "dropped; <code>null</code> becomes an empty cell. Invalid JSON is not guessed at: the parse error is shown so "
            "you can fix a trailing comma or a missing quote. The json to md conversion happens in your browser, which "
            "matters when the data contains customer details, tokens or API keys.",
        ]),
        "uses": ("Common uses for JSON to Markdown", [
            "Document an API by turning a sample response into a readable table for the reference docs, so readers see real field names and example values.",
            "Paste a config file into a pull request description as headings and key-value tables that reviewers can scan in seconds.",
            "Share a database or CMS export with a non-technical colleague in a wiki page or a support ticket, where raw JSON would be ignored.",
            "Summarise test results, survey answers or log entries stored as JSON for a weekly report that managers can read without a code editor.",
            "Get spreadsheet data out of JSON: convert, then use <a href=\"/markdown-to-csv\">Markdown to CSV</a> on the table. For data that is already CSV, use <a href=\"/csv-to-markdown\">CSV to Markdown</a> instead.",
            "Read a large API payload more easily in the <a href=\"/markdown-reader\">markdown reader</a> after converting.",
        ]),
        "faq": [
            ("Is my JSON sent to a server?",
             "No. JSON to Markdown runs entirely in your browser. Nothing is uploaded or logged, and the tool is free with "
             "no sign-up. It works on mobile browsers too, though long files are easier to handle on a larger screen."),
            ("What does an empty array become?",
             "In list mode it shows as <em>(empty)</em>, so you can see the key exists. Inside a table cell it is written as <code>[]</code>, and an empty object as <code>{}</code>."),
            ("Can I open a .json file from my computer?",
             "Yes. Press <strong>Open file</strong> or drop the file on the input box. The file is read locally, and the result can be copied, downloaded as a .md file or opened in the editor."),
        ],
    },

    "/table-to-markdown": {
        "title": "Table to Markdown: Paste a Table, Get Markdown | Digitum",
        "desc": "Convert a table to markdown by pasting it: HTML table to markdown from web pages, or cells from Excel, Sheets, Word or Notion. Free, private, instant.",
        "h1": "Table to Markdown <em>from any app</em>",
        "lede": "Copy a table from a web page, a spreadsheet, Word or Notion and paste it here: table to markdown in one step, with the columns lined up.",
        "about": ("How to convert a table to markdown from anywhere", [
            "Writing a markdown table by hand is slow: every row needs pipes in the right places and a separator line under "
            "the header. Copying is faster. Most apps put two versions of a table on the clipboard when you copy it: a rich "
            "HTML version and a plain text version. This tool reads the HTML first, so an HTML table to markdown conversion "
            "keeps every row and column exactly as it was on the page. Cells that span several columns are expanded with "
            "empty cells, so the result stays a proper grid.",
            "When there is no HTML, the plain text is used. Tab-separated cells from Excel or Google Sheets, comma-separated "
            "text and an existing pipe table are all recognised, and as a last resort columns are split on runs of two or "
            "more spaces. That last case covers many tables copied out of a PDF or a terminal, though you may want to check "
            "the columns afterwards.",
            "Only the cell text is kept. Links, bold, colours, images and cell borders are dropped so the table to markdown "
            "result stays short and readable, and pipe characters inside cells are escaped. You choose whether the first "
            "row is a header and how columns align: numbers right, or everything left, centred or right. Need to change a cell, add a "
            "row or sort the table? Open the result in the <a href=\"/markdown-table-generator\">markdown table generator</a>, "
            "or copy it and paste it wherever you write markdown. Nothing you paste leaves your browser.",
        ]),
        "uses": ("Common uses for Table to Markdown", [
            "Copy a comparison or pricing table from a website into your notes or a research document, with the columns kept in order.",
            "Move a range of cells from Excel or Google Sheets into a GitHub issue or pull request, without saving a file first.",
            "Convert a table from a Word report or a Google Doc into markdown documentation that lives next to your code.",
            "Take a table out of Notion or Confluence for a README, a wiki or a static site when you move your documentation.",
            "Rescue a table from a PDF by selecting it in your PDF reader and pasting it here; for the whole document try <a href=\"/pdf-to-markdown\">PDF to Markdown</a>.",
            "Clean up a messy, badly aligned pipe table you were sent in a chat or an email by pasting it back in and copying the tidy version.",
        ]),
        "faq": [
            ("Does table to markdown work on a phone?",
             "Yes, as long as your phone's browser or app can copy a table. Tap the paste box, choose Paste, and the markdown appears. It is "
             "free, with no sign-up or app to install."),
            ("Is the pasted table uploaded?",
             "No. The clipboard is read in your browser and nothing is sent to a server, so tables with salaries, "
             "customer names or internal figures stay private. Press <strong>Clear</strong> to empty the paste box when you are done."),
            ("How do I convert a whole web page?",
             "Use <a href=\"/html-to-markdown\">HTML to Markdown</a> or <a href=\"/url-to-markdown\">URL to Markdown</a> "
             "to keep the text, headings and links as well as the tables."),
        ],
    },

    "/epub-to-markdown": {
        "title": "EPUB to Markdown Converter: Ebooks to MD Online | Digitum",
        "desc": "Convert EPUB to Markdown in your browser. Chapters in reading order, with headings, lists, tables and links kept. Free EPUB to MD, nothing uploaded.",
        "h1": "EPUB to Markdown <em>ebook converter</em>",
        "lede": "Open an .epub file and this EPUB to Markdown converter gives you the whole book as one markdown file, chapter by chapter in reading order.",
        "about": ("Why convert EPUB to Markdown?", [
            "An EPUB is a zip file full of web pages, style sheets, fonts and images. That is perfect for an e-reader but "
            "awkward when you want to quote a passage, search the text, feed it to a notes app or edit it. When you convert "
            "EPUB to markdown, you get a single plain text file you can open in any editor, put under version control, "
            "search with ordinary tools or paste into Obsidian.",
            "The converter reads the book's spine, the list that sets the reading order, so chapters appear in the same "
            "order an e-reader shows them, separated by a horizontal rule. The title and author from the book's metadata "
            "go at the top. Headings, paragraphs, lists, tables, links, bold and italic come across as markdown. Images are "
            "replaced by their alt text so the file stays small, and styling such as fonts, colours and page breaks is "
            "dropped. A progress bar shows each chapter as it is converted.",
            "The book is unpacked in your browser; it is never uploaded. That makes this EPUB to MD tool safe for drafts "
            "and private manuscripts. Books with DRM, such as most titles bought from big ebook stores, are encrypted and "
            "cannot be read by this or any other converter. DRM-free books, public-domain titles and your own exports work well. Because markdown is plain text, even a long "
            "novel usually comes out well under a megabyte.",
        ]),
        "uses": ("Common uses for EPUB to Markdown", [
            "Pull quotes and passages from a DRM-free book into your notes app for study, teaching or research.",
            "Edit your own self-published ebook as plain text, fix typos in one place, then rebuild it after the changes with the reverse tool.",
            "Search a long book for a phrase, a character or a name with your usual text editor, then jump straight to every match.",
            "Put a public-domain book from a free library under version control, or publish it chapter by chapter on a static site.",
            "Read the book as a clean, distraction-free page in the <a href=\"/markdown-reader\">markdown reader</a>, with the same light and dark themes as the rest of the site.",
            "Make a quick printable copy of a DRM-free book with <a href=\"/markdown-to-pdf\">Markdown to PDF</a>, for reading with a pen in hand.",
        ]),
        "faq": [
            ("Is EPUB to Markdown free?",
             "Yes. It is free, needs no account or sign-up, and works in desktop and mobile browsers. Big books with many "
             "chapters just take a few seconds longer, and the progress bar shows which chapter is being converted. Very large "
             "illustrated books depend on your device's memory."),
            ("Can I turn the markdown back into an EPUB?",
             "Yes. Edit the file, then use <a href=\"/markdown-to-epub\">Markdown to EPUB</a>; every <code>#</code> heading "
             "becomes a chapter with its own entry in the table of contents."),
            ("What about footnotes?",
             "Footnotes come across as text and links where the book has them, but the pop-up behaviour you get on an "
             "e-reader is lost. The footnote text usually lands at the end of its chapter or in a notes chapter, as it does in the book itself."),
        ],
    },

    "/markdown-to-epub": {
        "title": "Markdown to EPUB: Create an Ebook, Free Online | Digitum",
        "desc": "Convert Markdown to EPUB online. Every # heading becomes a chapter with a table of contents, title and author. Free md to EPUB 3 for Kobo and Apple Books.",
        "h1": "Markdown to EPUB <em>ebook maker</em>",
        "lede": "Write or paste a book, add a title and author, and this Markdown to EPUB tool builds a standard EPUB 3 file with chapters and a table of contents.",
        "about": ("How to create an EPUB from markdown", [
            "Markdown is a comfortable way to write a long text: no styling menus, just headings, paragraphs and lists. "
            "The hard part has always been getting it onto an e-reader without installing a publishing tool. This page does "
            "that step. Every top-level <code>#</code> heading starts a new chapter, and any text before the first heading "
            "becomes an introduction. The preview on the right shows the chapter count as you type.",
            "When you create an EPUB from markdown here, you get a real EPUB 3 package: a chapter file for each section, a "
            "navigation file plus an older-style table of contents for older readers, a simple serif stylesheet, and the "
            "title and author in the book's metadata. Lists, quotes, code blocks, tables, links, bold and italic all carry "
            "over. The file opens in Apple Books, Kobo, Google Play Books and Calibre.",
            "The md to epub build happens in your browser, so your manuscript is never uploaded. The title is filled in from "
            "the first heading until you type your own. Images are not packed into the file; pictures linked from the web "
            "may show on readers that are online, so for a fully offline book add them afterwards in Calibre. There is no "
            "cover page yet, so add one there too if you need it: open the book in Calibre, use the metadata editor to "
            "choose a cover image, and save. Calibre can also convert the book to other ebook formats.",
        ]),
        "uses": ("Common uses for Markdown to EPUB", [
            "Read a long draft on an e-reader to catch pacing problems, repeated words and typos you miss on a bright screen.",
            "Turn a series of blog posts or newsletter issues into a small ebook to give subscribers as a thank-you or a lead magnet.",
            "Package course notes, a staff handbook or a product manual for offline reading on a tablet or phone.",
            "Send documentation or long articles to your Kindle with Amazon's Send to Kindle, which accepts EPUB files and converts them for the device.",
            "Share a short story or a chapter draft with beta readers in a format their phones and e-readers open without any extra app.",
            "Make a print version too with <a href=\"/markdown-to-pdf\">Markdown to PDF</a>, or a Word file for an editor with <a href=\"/markdown-to-word\">Markdown to Word</a>.",
        ]),
        "faq": [
            ("Is Markdown to EPUB free?",
             "Yes, free with no sign-up and no watermark in the book. It works in desktop and mobile browsers, and the "
             ".epub file downloads straight to your device."),
            ("Do ## subheadings make chapters?",
             "No. Only top-level <code>#</code> headings start chapters; <code>##</code> and lower stay as headings inside "
             "a chapter, so you can structure each chapter freely. If your file uses <code>##</code> for chapters, change them to <code>#</code> before you download."),
            ("Can I check the book before I download it?",
             "Yes. The preview shows the rendered text and the chapter count. After downloading, open the file in Apple Books, Calibre or another reader to page through it."),
        ],
    },

    "/latex-to-markdown": {
        "title": "LaTeX to Markdown Converter: TeX to MD with Maths | Digitum",
        "desc": "Convert LaTeX to Markdown online. Sections, lists, tables and links convert, and equations stay as $ and $$ maths. Free LaTeX to MD, nothing uploaded.",
        "h1": "LaTeX to Markdown <em>converter</em>, maths included",
        "lede": "Paste a .tex document and this LaTeX to Markdown converter returns headings, lists and tables, with every equation kept as LaTeX maths.",
        "about": ("Why convert LaTeX to Markdown?", [
            "LaTeX is the standard for papers and theses, but it is heavy for a blog post, a README, a wiki or a set of "
            "notes. Markdown is lighter, and many markdown renderers, including GitHub and Obsidian, now display "
            "<code>$…$</code> and <code>$$…$$</code> maths. Converting tex to markdown lets you reuse the words and the "
            "equations without the preamble, the packages and the build step.",
            "The converter reads the document body and keeps the title and author as a heading and a byline. "
            "<code>\\section</code> and its smaller cousins become <code>##</code>, <code>###</code> and so on; itemize, "
            "enumerate and description become lists, even nested ones; tabular becomes a markdown table; and verbatim, "
            "lstlisting and minted become fenced code blocks. Bold, italic, typewriter text, links and URLs convert too, "
            "and the abstract gets its own heading. The result is previewed next to the source as you edit, with the maths rendered, so you can spot anything that did not convert. You can paste the source or open a .tex file, then copy the markdown, download it as a .md file or open it in the editor.",
            "Equation, align, gather and inline maths are kept exactly as written, so the result renders in any viewer "
            "with maths support. Things markdown cannot express are simplified: footnotes go in brackets, citations and "
            "references show their keys, and layout commands, comments and unknown macros are dropped while their text is "
            "kept. The latex to md conversion runs in your browser, so unpublished work stays on your computer.",
        ]),
        "uses": ("Common uses for LaTeX to Markdown", [
            "Turn a published paper into a blog post or a project page that renders maths, without retyping the equations.",
            "Move lecture notes from LaTeX into Obsidian or another markdown notes app, where they can be linked, tagged and searched with the rest of your notes.",
            "Put the abstract and key equations of a thesis in a GitHub README next to the code and data that go with it.",
            "Share a derivation in a wiki, a forum or a chat that understands markdown and maths, instead of posting a screenshot of a PDF.",
            "Check the equations render, and fix any that do not, by opening the result in the <a href=\"/markdown-editor\">markdown editor</a>.",
            "Go the other way later with <a href=\"/markdown-to-latex\">Markdown to LaTeX</a>, when a markdown draft needs to become a paper for a journal.",
        ]),
        "faq": [
            ("Is LaTeX to Markdown free and private?",
             "Yes. It is free with no sign-up, and the .tex file is converted in your browser, so nothing is uploaded. It "
             "also runs on a phone or tablet, which is handy for a quick check away from your desk."),
            ("What happens to figures?",
             "<code>\\includegraphics</code> becomes a markdown image with the same file path, and the caption stays as "
             "italic text. Copy the image files next to the markdown so they load, and convert PDF or EPS figures to PNG or SVG."),
            ("Does it follow <code>\\input</code> or <code>\\include</code>?",
             "No. Paste each file's content in turn, or combine them into one document first, then convert it in one go. Bibliography files (.bib) are not read, so citations stay as their keys."),
        ],
    },
}
