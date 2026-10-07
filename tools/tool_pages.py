"""Copy for the converter and utility tool pages. Read by build_seo.py.

Each entry: title (<= 65 chars), desc (<= 160), eyebrow, h1 (may hold one <em>),
lede, features [(heading, text)], steps_title, steps [html], faq [(q, html answer)].
"shell": "tool" pages run public/tools.js with the given "tool" id;
"shell": "app" pages are the full viewer with this copy.
"""

TOOL_PAGES = {
    # ---------------------------------------------------------------- from markdown
    "/markdown-to-word": {
        "shell": "tool", "tool": "md-docx",
        "title": "Markdown to Word Converter – MD to DOCX Online, Free | Digitum",
        "desc": "Convert Markdown to a Word document (.docx) online. Headings, lists, tables, links and code keep their "
                "formatting. Free, private, no sign-up.",
        "eyebrow": "Markdown to Word",
        "h1": "Convert Markdown to a <em>Word document</em>",
        "lede": "Paste or open markdown and download a real .docx file that opens in Microsoft Word, Google Docs, "
                "Pages and LibreOffice, with proper headings, lists and tables.",
        "features": [
            ("Real Word styles", "Headings use Word's Heading 1 to Heading 6 styles, so the navigation pane and a "
             "table of contents work straight away."),
            ("Lists and tables", "Bulleted and numbered lists, nested items and tables with a header row come across "
             "as real Word lists and tables."),
            ("Links, bold, italic and code", "Inline formatting is kept, links stay clickable, and code is set in a "
             "monospaced font."),
            ("Private", "The .docx file is built in your browser. Nothing is uploaded."),
        ],
        "steps_title": "How to convert Markdown to Word",
        "steps": ["Paste your markdown, or open a .md file.", "Check the preview on the right.",
                  "Press <strong>Download .docx</strong>.", "Open the file in Word or Google Docs."],
        "faq": [
            ("Does the Word file keep headings?", "Yes. Each markdown heading becomes a Word heading style, so you can "
             "add a table of contents in Word with one click."),
            ("Can I open the result in Google Docs?", "Yes. Upload the .docx to Google Drive and open it with Google "
             "Docs; headings, lists and tables are kept."),
            ("Are images included?", "Images are written as links with their alt text, because markdown usually "
             "points to images by address rather than containing them."),
        ],
    },
    "/markdown-to-excel": {
        "shell": "tool", "tool": "md-xlsx",
        "title": "Markdown Table to Excel – Convert MD Tables to XLSX & CSV | Digitum",
        "desc": "Convert markdown tables to Excel (.xlsx) or CSV online. Every table becomes its own sheet, with numbers "
                "kept as numbers. Free and private.",
        "eyebrow": "Markdown to Excel",
        "h1": "Turn markdown tables into an <em>Excel sheet</em>",
        "lede": "Paste markdown with one or more tables and download an .xlsx workbook, one sheet per table, or a CSV "
                "file. Numbers stay numbers, so you can sum and sort them straight away.",
        "features": [
            ("One sheet per table", "A document with several tables becomes a workbook with a sheet for each, named "
             "after the heading above it."),
            ("Numbers stay numbers", "Values like 1,250 or 3.5 are written as numbers, not text, so formulas work."),
            ("CSV too", "Prefer CSV? Download the first table, or any table, as a CSV file."),
            ("Private", "The workbook is created in your browser."),
        ],
        "steps_title": "How to convert a markdown table to Excel",
        "steps": ["Paste markdown that contains a table, or open a .md file.", "Check the tables found on the right.",
                  "Press <strong>Download .xlsx</strong> or <strong>Download CSV</strong>.", "Open it in Excel, Numbers or Google Sheets."],
        "faq": [
            ("What if my markdown has no table?", "The tool tells you no table was found. Use the "
             "<a href=\"/markdown-table-generator\">Markdown table generator</a> to make one."),
            ("Does it keep column alignment?", "Right-aligned columns (<code>---:</code>) are right-aligned in Excel too."),
            ("Can I go the other way?", "Yes, <a href=\"/excel-to-markdown\">Excel to Markdown</a> turns a spreadsheet "
             "into markdown tables."),
        ],
    },
    "/markdown-to-image": {
        "shell": "tool", "tool": "md-image",
        "title": "Markdown to Image – Convert MD to PNG or JPG Online | Digitum",
        "desc": "Convert Markdown to a PNG or JPG image online. Choose width, theme and scale, then download a crisp "
                "image of your formatted text. Free and private.",
        "eyebrow": "Markdown to Image",
        "h1": "Turn markdown into a <em>shareable image</em>",
        "lede": "Render markdown as a clean PNG or JPG for slides, social posts, docs or chat. Pick the width, light "
                "or dark theme and resolution, then download.",
        "features": [
            ("PNG or JPG", "Transparent-free, sharp images at 1x, 2x or 3x scale for retina screens."),
            ("Light or dark", "Render in the brand's light or dark theme to match where the image is going."),
            ("Code, tables and maths", "Syntax-highlighted code, tables and formatted text come out exactly as in the "
             "preview."),
            ("Private", "The image is drawn in your browser."),
        ],
        "steps_title": "How to convert Markdown to an image",
        "steps": ["Paste or open your markdown.", "Choose the width, theme and scale.", "Check the preview.",
                  "Press <strong>Download PNG</strong> or <strong>Download JPG</strong>."],
        "faq": [
            ("What size is the image?", "The width you choose, from 480 to 1200 pixels, times the scale; the height "
             "follows the content."),
            ("Can I make the background transparent?", "The image uses the page colour so text stays readable on any "
             "background. Use PNG for the sharpest result."),
            ("Can I export a whole document?", "Yes. For long documents a <a href=\"/markdown-to-pdf\">PDF</a> is often "
             "easier to read."),
        ],
    },
    "/markdown-to-text": {
        "shell": "tool", "tool": "md-text",
        "title": "Markdown to Plain Text – Strip Markdown Formatting Online | Digitum",
        "desc": "Convert Markdown to plain text online. Removes #, *, links and other syntax while keeping paragraphs, "
                "lists and line breaks readable. Free and instant.",
        "eyebrow": "Markdown to Text",
        "h1": "Strip markdown down to <em>plain text</em>",
        "lede": "Remove the markdown syntax and keep the words. Headings, lists and paragraphs stay readable, links "
                "can keep their address, and the result is ready to paste anywhere.",
        "features": [
            ("Clean, readable output", "Headings become plain lines, lists keep their bullets or numbers, and "
             "paragraphs keep their spacing."),
            ("Choose what to keep", "Keep link addresses in brackets, keep bullet characters, or strip everything."),
            ("Instant", "The text updates as you type or paste."),
            ("Copy or download", "Copy to the clipboard or download a .txt file."),
        ],
        "steps_title": "How to convert Markdown to plain text",
        "steps": ["Paste markdown or open a .md file.", "Pick the options you want.",
                  "Press <strong>Copy</strong> or <strong>Download .txt</strong>."],
        "faq": [
            ("What happens to links?", "By default the link text is kept and the address is added in brackets. Turn "
             "that off to keep only the text."),
            ("Does it handle tables?", "Yes. Table cells are separated by tabs, so they paste neatly into a "
             "spreadsheet."),
            ("Can I convert plain text to markdown?", "Yes, with <a href=\"/text-to-markdown\">Text to Markdown</a>."),
        ],
    },
    "/markmap-editor": {
        "shell": "tool", "tool": "markmap",
        "title": "Markmap Editor – Turn Markdown into a Mind Map Online | Digitum",
        "desc": "Free online Markmap editor. Write markdown headings and lists and see them as an interactive mind map. "
                "Zoom, fold branches and export to SVG or PNG.",
        "eyebrow": "Markmap editor",
        "h1": "Turn markdown into an <em>interactive mind map</em>",
        "lede": "Write headings and bullet points on the left and watch them grow into a mind map on the right. Fold "
                "branches, zoom in, and export the map as SVG or PNG.",
        "features": [
            ("Live mind map", "Every heading and list item becomes a branch, and the map redraws as you type."),
            ("Fold and zoom", "Click a node to fold its branch, scroll to zoom and drag to move around."),
            ("Export", "Download the map as an SVG for crisp printing or a PNG for slides."),
            ("Links and formatting", "Bold, italic, code and links inside items show up on the map."),
        ],
        "steps_title": "How to make a mind map from markdown",
        "steps": ["Write a <code>#</code> heading for the centre of the map.",
                  "Add <code>##</code> headings or bullet points for branches.",
                  "Nest bullets to add sub-branches.", "Press <strong>Download SVG</strong> or <strong>PNG</strong>."],
        "faq": [
            ("What is Markmap?", "Markmap is an open source way of drawing a markdown outline as a mind map. Headings "
             "and list items become the branches."),
            ("Can I fold branches?", "Yes. Click any node with children to fold or unfold it."),
            ("Can I edit the markdown later?", "Yes. Copy the source, or open it in the "
             "<a href=\"/markdown-editor\">Markdown editor</a>."),
        ],
    },
    # ---------------------------------------------------------------- to markdown
    "/pdf-to-markdown": {
        "shell": "tool", "tool": "pdf-md",
        "title": "PDF to Markdown Converter – Extract PDF Text as MD, Free | Digitum",
        "desc": "Convert PDF to Markdown online. Extracts text with headings, paragraphs and lists, ready to edit. Runs "
                "in your browser, so your PDF is never uploaded.",
        "eyebrow": "PDF to Markdown",
        "h1": "Convert PDF to <em>editable markdown</em>",
        "lede": "Drop in a PDF and get markdown back, with headings worked out from the text size, paragraphs joined "
                "up and bullet lists recognised. Your file never leaves your device.",
        "features": [
            ("Headings from font size", "Larger text becomes # and ## headings, so the structure of the document "
             "survives."),
            ("Paragraphs joined up", "Lines broken by the PDF layout are joined back into paragraphs."),
            ("Lists recognised", "Lines that start with bullets or numbers become markdown lists."),
            ("Private", "The PDF is read in your browser with PDF.js. Nothing is uploaded."),
        ],
        "steps_title": "How to convert PDF to Markdown",
        "steps": ["Drop a PDF onto the page, or press <strong>Open PDF</strong>.", "Wait a moment while each page is read.",
                  "Check and tidy the markdown on the right.", "Copy it, download a .md file, or open it in the editor."],
        "faq": [
            ("Does it work with scanned PDFs?", "Scanned pages are images with no text inside. Use "
             "<a href=\"/image-to-markdown\">Image to Markdown</a>, which reads text from images."),
            ("Are tables converted?", "Text in tables is extracted in reading order. Complex tables may need a little "
             "tidying; the <a href=\"/markdown-table-generator\">table generator</a> helps."),
            ("Is my PDF uploaded?", "No. It is read entirely in your browser."),
        ],
    },
    "/html-to-markdown": {
        "shell": "tool", "tool": "html-md",
        "title": "HTML to Markdown Converter – Clean MD from HTML Online | Digitum",
        "desc": "Convert HTML to Markdown online. Paste HTML code or a page's source and get clean GitHub Flavored "
                "Markdown with tables, lists, links and code blocks. Free.",
        "eyebrow": "HTML to Markdown",
        "h1": "Convert HTML to <em>clean markdown</em>",
        "lede": "Paste HTML and get tidy GitHub Flavored Markdown back: headings, lists, links, images, tables and "
                "code blocks, with scripts, styles and clutter left out.",
        "features": [
            ("GitHub Flavored Markdown", "Tables, task lists, strikethrough and fenced code blocks are supported."),
            ("Choose your style", "ATX (#) or underlined headings, - or * bullets, fenced or indented code."),
            ("Clutter removed", "Scripts, styles, navigation and comments are dropped."),
            ("Instant and private", "Converts as you paste, in your browser."),
        ],
        "steps_title": "How to convert HTML to Markdown",
        "steps": ["Paste HTML code into the box, or open an .html file.", "Pick heading and list styles if you like.",
                  "Copy the markdown or download a .md file."],
        "faq": [
            ("Can I convert a web page?", "Copy the part of the page you want and use "
             "<a href=\"/paste-to-markdown\">Paste to Markdown</a>, or paste the page's HTML source here."),
            ("Are tables supported?", "Yes, HTML tables become markdown tables with a header row."),
            ("What about inline styles?", "Styling such as colours and fonts has no markdown equivalent, so it is left "
             "out; bold, italic and links are kept."),
        ],
    },
    "/word-to-markdown": {
        "shell": "tool", "tool": "docx-md",
        "title": "Word to Markdown Converter – DOCX to MD Online, Free | Digitum",
        "desc": "Convert Word documents (.docx) to Markdown online. Keeps headings, lists, tables, links, bold and "
                "italic. Runs in your browser, nothing is uploaded.",
        "eyebrow": "Word to Markdown",
        "h1": "Convert Word documents to <em>markdown</em>",
        "lede": "Drop in a .docx file and get clean markdown, with Word's headings, lists, tables, links and "
                "formatting carried across. Ideal for moving documents into GitHub, Notion or a static site.",
        "features": [
            ("Headings and structure", "Word heading styles become # headings, so the document outline is kept."),
            ("Lists and tables", "Bulleted and numbered lists and tables convert to their markdown equivalents."),
            ("Formatting and links", "Bold, italic and hyperlinks are kept."),
            ("Private", "The .docx is read in your browser with Mammoth. Nothing is uploaded."),
        ],
        "steps_title": "How to convert Word to Markdown",
        "steps": ["Drop a .docx file onto the page, or press <strong>Open .docx</strong>.",
                  "Check the markdown on the right.", "Copy it, download a .md file, or open it in the editor."],
        "faq": [
            ("Does it support .doc files?", "Only the modern .docx format. Open an old .doc in Word or LibreOffice and "
             "save it as .docx first."),
            ("Are images kept?", "Images are embedded in the markdown as data so nothing is lost, which can make the "
             "file large. You can replace them with links afterwards."),
            ("Can I go back to Word?", "Yes, with <a href=\"/markdown-to-word\">Markdown to Word</a>."),
        ],
    },
    "/excel-to-markdown": {
        "shell": "tool", "tool": "xlsx-md",
        "title": "Excel to Markdown Table Converter – XLSX & CSV to MD | Digitum",
        "desc": "Convert Excel, CSV or Google Sheets data to a Markdown table online. Paste cells or open an .xlsx file, "
                "choose alignment and copy the table. Free.",
        "eyebrow": "Excel to Markdown",
        "h1": "Convert Excel to a <em>markdown table</em>",
        "lede": "Open an .xlsx or .csv file, or paste cells copied from Excel or Google Sheets, and get a neat "
                "markdown table you can drop into a README, a doc or a chat.",
        "features": [
            ("Paste straight from a spreadsheet", "Copy cells in Excel or Google Sheets and paste; the columns are "
             "detected automatically."),
            ("Every sheet", "Workbooks with several sheets give you a table for each one."),
            ("Neat columns", "Columns are padded so the markdown lines up and is easy to read as text."),
            ("Private", "Files are read in your browser with SheetJS."),
        ],
        "steps_title": "How to convert Excel to Markdown",
        "steps": ["Open an .xlsx, .xls or .csv file, or paste copied cells.", "Choose alignment and whether the first "
                  "row is a header.", "Copy the markdown table or download a .md file."],
        "faq": [
            ("Can I paste from Google Sheets?", "Yes. Copy the cells and paste them into the box; tabs between cells "
             "are detected."),
            ("What about merged cells and formulas?", "Merged cells are filled with their value and formulas are "
             "replaced by their results."),
            ("Can I edit the table visually?", "Yes, open it in the <a href=\"/markdown-table-generator\">Markdown "
             "table generator</a>."),
        ],
    },
    "/image-to-markdown": {
        "shell": "tool", "tool": "image-md",
        "title": "Image to Markdown – OCR Text from Images to MD, Free | Digitum",
        "desc": "Convert images and screenshots to Markdown with OCR. Reads text from PNG, JPG and scanned pages in your "
                "browser and turns it into editable markdown. Free.",
        "eyebrow": "Image to Markdown",
        "h1": "Extract text from images into <em>markdown</em>",
        "lede": "Drop in a screenshot, photo or scanned page and the text is read with OCR and turned into markdown "
                "you can edit. It all runs in your browser.",
        "features": [
            ("OCR in your browser", "Text recognition runs on your device with Tesseract. The image is never uploaded."),
            ("Screenshots and scans", "Works with PNG, JPG, WebP and scanned documents."),
            ("Paragraphs and lists", "Line breaks are tidied into paragraphs, and bullet points into a markdown list."),
            ("Several languages", "Read English, Spanish, French, German, Portuguese, Italian or Urdu text."),
        ],
        "steps_title": "How to convert an image to Markdown",
        "steps": ["Drop an image onto the page, paste a screenshot, or press <strong>Open image</strong>.",
                  "Choose the language of the text.", "Wait while the text is read; progress is shown.",
                  "Copy or download the markdown."],
        "faq": [
            ("How accurate is it?", "Clear, printed text at a good resolution is read very accurately. Handwriting and "
             "low-quality photos are harder."),
            ("Is the image uploaded?", "No. OCR runs in your browser; only the language data is downloaded once."),
            ("Can I convert a scanned PDF?", "Take a screenshot or export the page as an image, then drop it here."),
        ],
    },
    "/text-to-markdown": {
        "shell": "tool", "tool": "text-md",
        "title": "Text to Markdown Converter – Format Plain Text as MD | Digitum",
        "desc": "Convert plain text to Markdown online. Detects headings, bullet and numbered lists, links and "
                "paragraphs, and formats them as clean markdown. Free and instant.",
        "eyebrow": "Text to Markdown",
        "h1": "Turn plain text into <em>formatted markdown</em>",
        "lede": "Paste notes, an email or text copied from anywhere, and get markdown with headings, lists, links and "
                "paragraphs worked out for you.",
        "features": [
            ("Headings detected", "Short title lines, lines in capitals and lines ending in a colon become headings."),
            ("Lists detected", "Lines starting with •, -, *, numbers or letters become markdown lists."),
            ("Links made clickable", "Web addresses and email addresses become links."),
            ("Paragraphs tidied", "Hard-wrapped lines are joined back into paragraphs."),
        ],
        "steps_title": "How to convert text to Markdown",
        "steps": ["Paste your text into the box.", "Check the formatted preview.", "Copy the markdown or open it in the editor."],
        "faq": [
            ("Will it change my words?", "No. Only formatting is added; the text itself is left as it is."),
            ("Can I convert formatted text from a web page or Word?", "For that, use "
             "<a href=\"/paste-to-markdown\">Paste to Markdown</a>, which keeps the original formatting."),
            ("Can I go back to plain text?", "Yes, with <a href=\"/markdown-to-text\">Markdown to Text</a>."),
        ],
    },
    "/paste-to-markdown": {
        "shell": "tool", "tool": "paste-md",
        "title": "Paste to Markdown – Convert Copied Text to MD Instantly | Digitum",
        "desc": "Paste formatted text from Google Docs, Word, a web page or an email and get clean Markdown instantly. "
                "Keeps headings, lists, links, tables and code. Free.",
        "eyebrow": "Paste to Markdown",
        "h1": "Paste anything, get <em>clean markdown</em>",
        "lede": "Copy formatted text from Google Docs, Word, Notion, a web page or an email, paste it here, and get "
                "markdown with the headings, lists, links and tables kept.",
        "features": [
            ("Works with any source", "Google Docs, Microsoft Word, Notion, Confluence, web pages, Gmail and Outlook."),
            ("Formatting kept", "Headings, bold, italic, lists, links, tables and code blocks convert to markdown."),
            ("Instant", "The markdown appears the moment you paste."),
            ("Private", "Conversion happens in your browser."),
        ],
        "steps_title": "How to convert pasted text to Markdown",
        "steps": ["Copy formatted text from any app or web page.", "Click the paste box and press <kbd>Ctrl</kbd> <kbd>V</kbd>.",
                  "Copy the markdown, download it, or open it in the editor."],
        "faq": [
            ("Why does my paste come out as plain text?", "Some apps only copy plain text. Try copying from the app's "
             "web version, or use <a href=\"/text-to-markdown\">Text to Markdown</a>."),
            ("Does it keep images?", "Images from the web keep their address. Images that only exist in your clipboard "
             "cannot be linked and are left out."),
            ("Can I convert HTML code?", "Yes, paste it into <a href=\"/html-to-markdown\">HTML to Markdown</a>."),
        ],
    },
    # ---------------------------------------------------------------- tools
    "/markdown-reader": {
        "shell": "app",
        "title": "Markdown Reader – Read MD Files Online with an Outline | Digitum",
        "desc": "Free online markdown reader. Open .md files and read them in clean typography with an outline, search, "
                "dark mode and print layout. Nothing is uploaded.",
        "eyebrow": "Markdown reader",
        "h1": "A calm, readable <em>markdown reader</em>",
        "lede": "Open a .md file and read it the way it was meant to look: clean typography, a clickable outline, "
                "search, reading progress and a dark mode for late nights.",
        "features": [
            ("Made for reading", "Comfortable line length, generous spacing and the Outfit typeface, with adjustable "
             "text size and width in Settings."),
            ("Outline and search", "Jump between sections from the outline, and search the document with the / key."),
            ("Pick up where you left off", "Recent files remember how far you read."),
            ("Dark mode and print", "Switch themes in one click, or print a clean copy."),
        ],
        "steps_title": "How to read a markdown file online",
        "steps": ["Drag a .md file onto the page, or press <strong>Open files</strong>.",
                  "Use the outline in the sidebar to jump between sections.",
                  "Adjust text size and width in <strong>Settings</strong>."],
        "faq": [
            ("Can I read a folder of markdown files?", "Yes. Press Open folder and every .md file in it is listed, with "
             "the [ and ] keys to move between them."),
            ("Does it remember where I stopped?", "Yes. Reopen a file from Recent and it scrolls back to where you were."),
            ("Can I edit too?", "Yes, press the pencil to switch to the <a href=\"/markdown-editor\">editor</a>."),
        ],
    },
    "/markdown-table-generator": {
        "shell": "tool", "tool": "table",
        "title": "Markdown Table Generator – Create MD Tables Online, Free | Digitum",
        "desc": "Create markdown tables visually. Edit cells like a spreadsheet, add rows and columns, set alignment, "
                "paste from Excel and copy the markdown. Free.",
        "eyebrow": "Markdown table generator",
        "h1": "Build markdown tables <em>like a spreadsheet</em>",
        "lede": "Type into a grid, add or remove rows and columns, set each column's alignment, and copy perfectly "
                "formatted markdown. Paste from Excel or edit an existing markdown table.",
        "features": [
            ("Spreadsheet-style editing", "Click a cell and type; Tab and Enter move between cells."),
            ("Rows, columns and alignment", "Add, remove and reorder rows and columns, and align each column left, "
             "centre or right."),
            ("Import", "Paste cells from Excel or Google Sheets, or paste a markdown table to edit it."),
            ("Neat output", "The markdown is padded so the columns line up as plain text too."),
        ],
        "steps_title": "How to make a markdown table",
        "steps": ["Set the number of rows and columns, or paste existing data.", "Type into the cells.",
                  "Pick an alignment for each column.", "Press <strong>Copy markdown</strong>."],
        "faq": [
            ("What is the markdown table syntax?", "Cells are separated by pipes, and a row of dashes under the header "
             "row marks it as a table: <code>| A | B |</code> then <code>| --- | --- |</code>."),
            ("How do I align a column?", "Add colons to the dash row: <code>:---</code> left, <code>:---:</code> "
             "centre, <code>---:</code> right. The alignment buttons do this for you."),
            ("Can I put a pipe inside a cell?", "Yes, it is escaped as <code>\\|</code> automatically."),
        ],
    },
    "/markdown-compare": {
        "shell": "tool", "tool": "compare",
        "title": "Markdown Compare – Diff Two MD Files Online, Free | Digitum",
        "desc": "Compare two markdown files or texts online. See added and removed lines and words side by side or "
                "inline, and compare the rendered result. Free and private.",
        "eyebrow": "Markdown compare",
        "h1": "Compare two markdown files <em>side by side</em>",
        "lede": "Paste or open two versions and see exactly what changed: added and removed lines, changed words "
                "highlighted, in a side-by-side or inline view.",
        "features": [
            ("Line and word changes", "Changed lines are paired, and the words that changed inside them are "
             "highlighted."),
            ("Side by side or inline", "Read the two versions next to each other, or as one list of changes."),
            ("Ignore whitespace", "Optionally ignore changes that are only spaces or line endings."),
            ("Private", "The comparison runs in your browser."),
        ],
        "steps_title": "How to compare two markdown files",
        "steps": ["Paste or open the original on the left.", "Paste or open the changed version on the right.",
                  "Read the changes below; switch between side by side and inline."],
        "faq": [
            ("Can I compare any text, not just markdown?", "Yes. It works with any plain text, code or configuration "
             "file."),
            ("Does it show word changes?", "Yes. Inside a changed line, the words that were added or removed are "
             "highlighted."),
            ("Are my files uploaded?", "No. Both texts stay in your browser."),
        ],
    },
    "/discord-markdown": {
        "shell": "tool", "tool": "discord",
        "title": "Discord Markdown Preview & Formatting Guide – Free | Digitum",
        "desc": "Preview Discord markdown before you send it. Bold, italic, underline, spoilers, code blocks, quotes, "
                "headings, subtext and masked links, with a quick reference.",
        "eyebrow": "Discord markdown",
        "h1": "Preview <em>Discord formatting</em> before you send",
        "lede": "Write a message with Discord's markdown and see exactly how it will look in a channel: bold, "
                "underline, spoilers, code blocks, quotes, headings and more.",
        "features": [
            ("Discord's own rules", "Underline with __text__, spoilers with ||text||, subtext with -# and masked "
             "links, the way Discord renders them."),
            ("Formatting buttons", "Wrap selected text in bold, italic, underline, strikethrough, spoiler or code with "
             "one click."),
            ("Character count", "See how close you are to Discord's 2,000 character message limit."),
            ("Copy and paste", "Copy the message and paste it straight into Discord."),
        ],
        "steps_title": "How to format a Discord message",
        "steps": ["Type your message, or select text and press a formatting button.",
                  "Check the preview, which looks like a Discord channel.",
                  "Press <strong>Copy message</strong> and paste it into Discord."],
        "faq": [
            ("How do I underline text in Discord?", "Wrap it in two underscores: <code>__underlined__</code>."),
            ("How do I make a spoiler?", "Wrap it in two pipes: <code>||spoiler||</code>. Readers click it to reveal "
             "the text."),
            ("How do I make a code block?", "Put three backticks on the lines before and after the code, optionally "
             "with a language name for colours."),
            ("Does Discord support headings?", "Yes, lines starting with <code>#</code>, <code>##</code> or "
             "<code>###</code>, and <code>-#</code> for small subtext."),
        ],
    },
    "/obsidian-markdown": {
        "shell": "tool", "tool": "obsidian",
        "title": "Obsidian Markdown Viewer – Preview Callouts & Wikilinks | Digitum",
        "desc": "Preview Obsidian-flavoured markdown online: callouts, [[wikilinks]], ==highlights==, #tags, comments "
                "and task lists. Open a note or a whole vault folder.",
        "eyebrow": "Obsidian markdown",
        "h1": "Read Obsidian notes <em>outside Obsidian</em>",
        "lede": "Open an Obsidian note and see it rendered the way Obsidian shows it: callouts, wikilinks, "
                "highlights, tags and comments, without installing anything.",
        "features": [
            ("Callouts", "<code>&gt; [!note]</code>, tip, warning, danger and the other callout types, with their "
             "icons and colours."),
            ("Wikilinks and embeds", "<code>[[Note]]</code> and <code>[[Note|alias]]</code> links, and "
             "<code>![[image.png]]</code> embeds shown as references."),
            ("Highlights, tags and comments", "<code>==highlight==</code>, <code>#tags</code>, and "
             "<code>%%comments%%</code> hidden as in reading view."),
            ("Front matter", "YAML properties at the top of a note are shown as a properties table."),
        ],
        "steps_title": "How to view an Obsidian note online",
        "steps": ["Paste the note, or open the .md file from your vault.", "Read the rendered note on the right.",
                  "Export it, or open it in the editor."],
        "faq": [
            ("Can I open a whole vault?", "Open notes one at a time here, or use Open folder in the "
             "<a href=\"/\">Markdown viewer</a> to browse a vault."),
            ("Are wikilinks clickable?", "They are shown as links with the note name; since your vault is not online, "
             "they do not lead anywhere."),
            ("Which callout types are supported?", "note, abstract, info, todo, tip, success, question, warning, "
             "failure, danger, bug, example and quote, plus their aliases."),
        ],
    },
    "/github-readme-viewer": {
        "shell": "tool", "tool": "github",
        "title": "GitHub README Viewer – Preview Any Repo's README Online | Digitum",
        "desc": "View any GitHub repository's README rendered online. Enter owner/repo or a GitHub link and read the "
                "README with images, tables and code, then edit or export it.",
        "eyebrow": "GitHub README viewer",
        "h1": "Read any GitHub <em>README</em>",
        "lede": "Enter a repository like <code>facebook/react</code> or paste a GitHub link, and read its README "
                "rendered with images, tables, badges and code, then edit it or export it.",
        "features": [
            ("Any public repository", "Type owner/repo, paste a GitHub URL, or a link to any markdown file in a repo."),
            ("Images and links fixed", "Relative image paths and links are pointed at the repository, so pictures "
             "load and links work."),
            ("Pick a branch", "Read the README of the default branch, or name another branch or tag."),
            ("Edit or export", "Open the README in the editor, or export it as PDF or HTML."),
        ],
        "steps_title": "How to view a GitHub README",
        "steps": ["Type <code>owner/repo</code> or paste a GitHub link.", "Press <strong>Load README</strong>.",
                  "Read it, or open it in the editor to change or export it."],
        "faq": [
            ("Does it work with private repositories?", "No, only public repositories, because it reads files through "
             "GitHub's public API."),
            ("Can I preview my own README before pushing?", "Yes, paste it into the <a href=\"/markdown-editor\">"
             "Markdown editor</a>, which renders GitHub Flavored Markdown."),
            ("Can I open a file other than the README?", "Yes, paste a link to any .md file in the repository."),
        ],
    },
    "/mermaid-live-editor": {
        "shell": "tool", "tool": "mermaid",
        "title": "Mermaid Live Editor – Draw Diagrams from Text Online | Digitum",
        "desc": "Free Mermaid live editor. Write flowcharts, sequence diagrams, Gantt charts and more in text and see "
                "them drawn instantly. Export to SVG or PNG.",
        "eyebrow": "Mermaid live editor",
        "h1": "Draw diagrams from text with <em>Mermaid</em>",
        "lede": "Write a flowchart, sequence diagram, Gantt chart, class diagram or pie chart in Mermaid syntax and "
                "watch it draw as you type. Export it as SVG or PNG.",
        "features": [
            ("Live drawing", "The diagram redraws as you type, with clear error messages when the syntax is wrong."),
            ("Examples to start from", "Flowchart, sequence, class, state, Gantt, pie, mind map and timeline examples."),
            ("Themes", "Default, neutral, dark and forest themes."),
            ("Export", "Download SVG for print and docs, or PNG for slides and chat."),
        ],
        "steps_title": "How to make a Mermaid diagram",
        "steps": ["Pick an example to start from, or write your own.", "Edit the text and watch the diagram update.",
                  "Choose a theme.", "Press <strong>Download SVG</strong> or <strong>PNG</strong>."],
        "faq": [
            ("What is Mermaid?", "Mermaid is a text language for diagrams. GitHub, GitLab, Notion and Obsidian render "
             "it inside markdown code blocks marked <code>mermaid</code>."),
            ("Can I use the diagram in markdown?", "Yes. Put the text in a code block marked mermaid; the "
             "<a href=\"/\">Markdown viewer</a> draws it too."),
            ("Which diagram types are supported?", "Flowcharts, sequence, class, state, entity relationship, Gantt, "
             "pie, mind map, timeline, git graph and more."),
        ],
    },
}
