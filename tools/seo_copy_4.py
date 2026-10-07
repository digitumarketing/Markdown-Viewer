"""SEO copy for group 4. Merged by tools/seo_copy.py."""
COPY = {
    "/markdown-to-latex": {
        "title": "Markdown to LaTeX Converter – MD to TeX, Free Online | Digitum",
        "desc": "Free Markdown to LaTeX converter. Turn md to LaTeX in your browser: sections, lists, booktabs tables, links and maths, as a .tex file for Overleaf.",
        "h1": "Markdown to LaTeX <em>converter</em>",
        "lede": "This Markdown to LaTeX converter turns your notes into a complete .tex document, or just the body to paste into a paper you already have. It runs in your browser and works with Overleaf and pdflatex.",
        "about": ("Why convert Markdown to LaTeX?", [
            "Markdown is quick to write, but journals, theses and many course templates expect LaTeX. Converting "
            "<strong>Markdown to LaTeX</strong> lets you draft in plain text and still hand in a proper .tex file. "
            "Headings become <code>\\section</code> and <code>\\subsection</code>, bullet and numbered lists become "
            "<code>itemize</code> and <code>enumerate</code>, bold and italic become <code>\\textbf</code> and "
            "<code>\\emph</code>, and links use <code>\\href</code>.",
            "Maths is the part most converters get wrong. Here, anything between <code>$…$</code> or "
            "<code>$$…$$</code> is passed through untouched, so your equations stay real LaTeX. Text outside maths "
            "is escaped, so a stray <code>%</code> or <code>&amp;</code> will not break the build. In full-document "
            "mode the first heading becomes the <code>\\title</code>, and only the packages your content needs are "
            "added: <code>hyperref</code> for links, <code>graphicx</code> for images, <code>booktabs</code> for "
            "tables and <code>ulem</code> for strikethrough.",
            "Some things do not carry over. Code blocks become plain <code>verbatim</code> without syntax colours, "
            "images keep their path, so you need to upload the image files to Overleaf yourself, and citations or "
            "cross-references must be added by hand. The rest of the md to LaTeX work is automatic, so these are the "
            "only parts you need to check. Everything runs on your device: nothing is uploaded.",
            "A good workflow is to write and preview in markdown, convert, then make final tweaks in LaTeX. Untick "
            "<strong>Full document</strong> to get only the body, which you can drop between "
            "<code>\\begin{document}</code> and <code>\\end{document}</code> of a template that already has its own "
            "class and packages. Leave it ticked for a standalone file that compiles as it is with pdflatex, XeLaTeX "
            "or LuaLaTeX. Both options update as you type, and you can copy the code or download a .tex file named "
            "after your markdown file.",
        ]),
        "uses": ("Common uses for markdown to TeX conversion", [
            "Turning lecture notes written in Obsidian or a plain editor into a LaTeX handout.",
            "Starting a paper in markdown and moving it to a journal template in Overleaf.",
            "Converting a README section with tables into a booktabs table for a report.",
            "Pasting just the body into an existing thesis chapter, without a second preamble.",
            "Making a quick .tex file from AI-written notes that already use <code>$…$</code> maths.",
            "Checking how your markdown to TeX output looks before sending it to a co-author.",
        ]),
        "faq": [
            ("What is lost when I convert Markdown to LaTeX?",
             "Syntax highlighting in code blocks, image files themselves (only the path is kept), and anything "
             "markdown cannot express, such as citations, labels and cross-references. Text, structure, tables, "
             "links and maths are kept. If something looks off, fix it in the markdown and convert again rather than editing both copies."),
            ("Is my document uploaded anywhere?",
             "No. The conversion runs in your browser, so your draft stays on your device. It is free and needs no "
             "sign-up, and it works on a phone or tablet too, though a larger screen is easier for long documents. "
             "To write the markdown first, try the <a href=\"/markdown-editor\">online markdown editor</a>."),
            ("Can I get a PDF instead of LaTeX?",
             "If you do not need LaTeX itself, <a href=\"/markdown-to-pdf\">Markdown to PDF</a> makes a print-ready "
             "PDF straight away. Use the .tex output when a template or publisher asks for LaTeX source."),
        ],
    },
    "/rtf-to-markdown": {
        "title": "RTF to Markdown Converter – RTF to MD Online, Free | Digitum",
        "desc": "Free RTF to Markdown converter. Open an .rtf file from WordPad or TextEdit and get clean md with bold, italic, bullets and tables kept. Runs in your browser.",
        "h1": "RTF to Markdown <em>converter</em>",
        "lede": "Use this RTF to Markdown converter to open an .rtf file, or paste raw RTF code, and get clean markdown with the text and basic formatting kept. Nothing is uploaded.",
        "about": ("What is RTF, and why convert RTF to Markdown?", [
            "RTF (Rich Text Format) is an old, widely supported document format. WordPad, TextEdit, older versions of "
            "Word, and the export menus of many note and email apps still save .rtf files. Under the hood an RTF file "
            "is plain text full of control words such as <code>\\b</code> and <code>\\par</code>, which makes it hard "
            "to read or reuse anywhere else.",
            "When you convert RTF to Markdown, the tool reads those control words and keeps what matters: paragraphs, "
            "<strong>bold</strong>, <em>italic</em>, bullet points and simple tables. Accented letters, curly quotes, "
            "dashes and Unicode characters are decoded properly, so names and symbols come out right. Fonts, sizes, "
            "colours, page margins, headers, footers and embedded images are dropped, because markdown has no place "
            "for them.",
            "The result is a small, readable .md file you can put in a Git repository, a static site, Obsidian or a "
            "wiki. If your file is really a .docx, use <a href=\"/word-to-markdown\">Word to Markdown</a>, which also "
            "keeps headings. If it is plain text with no formatting, <a href=\"/text-to-markdown\">Text to "
            "Markdown</a> is a better fit. RTF to md conversion happens entirely in your browser, so private documents "
            "never leave your device.",
            "To use it, press <strong>Open file</strong> and choose an .rtf file, drag one onto the input box, or "
            "paste raw RTF that starts with <code>{\\rtf1</code>. The preview updates at once, and you can switch to "
            "the markdown source to check it. When it looks right, copy it, download it as a .md file, or open it in "
            "the editor to add headings and links. If you paste something that is not RTF, the tool says so rather "
            "than producing garbled output.",
        ]),
        "uses": ("Common uses for RTF to md conversion", [
            "Moving old WordPad or TextEdit notes into Obsidian or another markdown notes app.",
            "Cleaning up text exported as .rtf from a legal, medical or accounting app.",
            "Turning a rich text email draft into markdown for a ticket or a pull request.",
            "Migrating archived .rtf documents to a Git repository where diffs are readable.",
            "Pulling the text of an RTF press release into a static site or CMS.",
            "Recovering the text of an old .rtf manual or letter so it can be edited and searched again.",
        ]),
        "faq": [
            ("How do I convert RTF to Markdown on a Mac?",
             "Press <strong>Open file</strong> and pick the .rtf file, or drag it from Finder onto the input box. "
             "There is no need to change it in TextEdit first. The markdown appears straight away, and you can copy "
             "or download it. Files from Windows and macOS both work, including ones with Western European characters stored in the older code page format. Very large files with many embedded images may take a moment, since the image data has to be skipped."),
            ("Are headings detected?",
             "RTF stores headings as larger or bold text rather than as real headings, so they usually come through "
             "as bold paragraphs. Add <code>#</code> in front of them in the "
             "<a href=\"/markdown-editor\">markdown editor</a> if you need proper headings."),
            ("Is it free, and does it work on a phone?",
             "Yes to both. There is no sign-up and no file limit beyond what your browser can handle. On a phone you "
             "can open an .rtf file from your Files app."),
        ],
    },
    "/markdown-to-confluence": {
        "title": "Markdown to Confluence – Wiki Markup or Formatted Paste | Digitum",
        "desc": "Free Markdown to Confluence converter. Copy formatted text for the Confluence editor, or Confluence wiki markup with headings, tables, code and links.",
        "h1": "Markdown to Confluence <em>converter</em>",
        "lede": "Use this Markdown to Confluence converter to paste a README, notes or AI output into Confluence with headings, lists, tables and code blocks intact, either as formatted text or as wiki markup.",
        "about": ("Does Confluence support markdown?", [
            "Only partly. The Confluence editor recognises some markdown shortcuts as you type, such as <code>#</code> "
            "for a heading, but when you paste a whole document most of it stays as plain text, and tables and code "
            "blocks are often lost. Confluence markdown support also differs between Cloud and older Server and Data "
            "Center versions, which is why this tool gives you two outputs.",
            "<strong>Copy formatted</strong> puts rich text on your clipboard. Paste it into the current Confluence "
            "editor and it arrives as real headings, bullet and numbered lists, tables, links and code blocks. "
            "<strong>Copy wiki markup</strong> gives you Confluence wiki markup: <code>h2.</code> headings, "
            "<code>*bold*</code>, <code>_italic_</code>, <code>||header||</code> table rows, "
            "<code>{code:language=python}</code> blocks and <code>[text|url]</code> links. Use it in the wiki markup "
            "macro, in older editors, or in tools that still read that format.",
            "Converting Markdown to Confluence this way is useful when your source of truth is a Git repository. You "
            "can keep docs in markdown, check them in the <a href=\"/markdown-editor\">markdown editor</a>, then "
            "publish a copy to the team wiki. Task list items become <code>(/)</code> and <code>(x)</code> icons in "
            "wiki markup. Everything runs in your browser, so internal docs are not uploaded.",
            "To use it, paste your markdown on the left or open a .md file. Switch between the <strong>Wiki "
            "markup</strong> and <strong>Formatted</strong> tabs to see each version. In Confluence Cloud, click into "
            "the page body and paste the formatted copy. For wiki markup, insert the Markup macro (type "
            "<code>/markup</code>), choose Confluence Wiki as the format, and paste. Fenced code blocks keep their "
            "language, so Confluence can highlight Python, JavaScript or SQL correctly in the code macro.",
        ]),
        "uses": ("Common uses for markdown in Confluence", [
            "Publishing a GitHub README or design doc to a team Confluence space.",
            "Pasting meeting notes written in markdown into a Confluence page without retyping tables.",
            "Moving AI-generated runbooks and how-tos into the company wiki with code blocks kept.",
            "Producing Confluence wiki markup for a script or integration that posts pages.",
            "Sharing release notes in both Confluence and Slack from the same markdown source, without keeping two versions.",
            "Converting a markdown changelog into a Confluence page your support team can follow.",
        ]),
        "faq": [
            ("What is Confluence wiki markup?",
             "It is Confluence's older text syntax, for example <code>h1.</code> for headings and "
             "<code>||</code> for table headers. Newer editors hide it, but it still works through the markup macro "
             "and many import tools. Most users of Confluence Cloud never see it, but admins and plugin authors still meet it often. Pages written in wiki markup can be pasted into the macro and edited later like any other content, and they still support headings, tables and code."),
            ("Is my content sent to Atlassian or anyone else?",
             "No. Conversion happens on your device and the copy goes to your clipboard. This tool is independent and "
             "not made by Atlassian. It is free, with no sign-up."),
            ("Why did my formatted paste lose some styling?",
             "Some browsers, especially on phones, limit rich clipboard access. If the paste looks plain, try a "
             "desktop browser, or use wiki markup in the markup macro. For Word users, "
             "<a href=\"/markdown-to-word\">Markdown to Word</a> is another route."),
        ],
    },
    "/markdown-to-slack": {
        "title": "Markdown to Slack Converter – Slack mrkdwn Format | Digitum",
        "desc": "Free Markdown to Slack converter. Turn standard markdown into Slack mrkdwn with bold, italic, links, lists and code, and preview the message first.",
        "h1": "Markdown to Slack <em>converter</em>",
        "lede": "This Markdown to Slack converter rewrites standard markdown into the syntax Slack actually uses, with a live preview, so your message formats correctly the first time.",
        "about": ("How Slack markdown differs from standard markdown", [
            "Slack markdown is not the same as the markdown you write in GitHub, Obsidian or a chatbot. In the message "
            "box, Slack uses single asterisks for bold (<code>*bold*</code>), underscores for italic, single tildes "
            "for strikethrough, and has no headings or tables. Its API format, called <strong>Slack mrkdwn</strong>, "
            "writes links as <code>&lt;https://example.com|text&gt;</code> instead of "
            "<code>[text](url)</code>. Paste standard markdown and you get stray stars and brackets.",
            "Converting Markdown to Slack fixes that. Bold, italic, bold italic and strikethrough are rewritten, links "
            "and images become Slack links, bullets become <code>•</code>, and task list items become ☐ and ☑. "
            "Inline code and fenced code blocks are kept. Headings become bold lines and tables become monospaced "
            "code blocks, because Slack cannot show either. Horizontal rules become a line of box characters.",
            "The preview shows roughly how the message will look before you paste it. The output is plain text, so it "
            "works in the message box, in a webhook payload or in a bot's <code>text</code> field. Nothing is sent to "
            "Slack or anywhere else: the conversion runs in your browser. For Discord, which uses standard markdown, "
            "try the <a href=\"/discord-markdown\">Discord markdown preview</a> instead.",
            "To use it, paste your markdown or open a .md file, check the preview, and press <strong>Copy for "
            "Slack</strong>. Paste into the message box, a canvas or a workflow step. If you are posting through the "
            "API, put the output in a section block's <code>mrkdwn</code> text or the message's top-level "
            "<code>text</code>. Long messages are fine, but remember Slack trims very long posts and shows a "
            "<em>Show more</em> link, so keep updates short where you can.",
        ]),
        "uses": ("Common uses for Slack mrkdwn conversion", [
            "Posting AI-written summaries or release notes to a channel without stray asterisks.",
            "Building the <code>text</code> field for a Slack bot, webhook or workflow.",
            "Sharing a section of a README or runbook in a thread with code blocks intact.",
            "Turning a markdown status update into a formatted standup message.",
            "Sending a small table as a readable monospaced block.",
            "Reusing the same markdown for Slack and for <a href=\"/markdown-to-confluence\">Confluence pages</a>.",
        ]),
        "faq": [
            ("Is mrkdwn the same as what I type in Slack?",
             "Nearly. Bold, italic, strike and code work the same in both. The main difference is links: mrkdwn uses "
             "<code>&lt;url|text&gt;</code>, which the API turns into a link, while in the message box you usually "
             "paste a plain URL or use the link button. So if a link shows up as raw angle brackets after you paste it by hand, that is expected: the mrkdwn link form is meant for bots, webhooks and API calls. Bold, italic, lists and code look the same either way, so for a quick message the copy works well."),
            ("Can I convert Slack messages back to markdown?",
             "Not with this tool. Copy the message and paste it into <a href=\"/paste-to-markdown\">Paste to "
             "Markdown</a> to get standard markdown from formatted text."),
            ("Is it free and private?",
             "Yes. There is no sign-up, it works on mobile browsers, and your text never leaves your device. This "
             "tool is independent and not affiliated with Slack."),
        ],
    },
    "/markdown-to-google-docs": {
        "title": "Markdown to Google Docs – Paste Formatted, No Add-on | Digitum",
        "desc": "Convert markdown to Google Docs for free. Paste markdown into Google Docs with real headings, lists, tables and links, or download a .docx for Drive.",
        "h1": "Markdown to Google Docs, <em>formatted</em>",
        "lede": "Convert Markdown to Google Docs without an add-on: paste your markdown here, copy it as formatted text, and paste it into a doc with headings, lists, tables and links intact.",
        "about": ("How to paste markdown into Google Docs", [
            "If you paste markdown into Google Docs directly, you get the raw symbols: <code>##</code>, "
            "<code>**</code> and pipe tables. Google Docs can turn some markdown into formatting as you type, once "
            "you switch it on under Tools › Preferences, but that does not apply to text you paste. This tool "
            "converts the markdown first and puts formatted text on your clipboard.",
            "Press <strong>Copy for Google Docs</strong>, then paste into a document. Headings arrive as heading "
            "styles you can see in the outline, lists keep their nesting, tables get borders and a shaded header row, "
            "links stay clickable, code blocks use a monospaced font on a light background, and quotes are indented. "
            "The styling is written inline because Google Docs ignores style sheets when you paste.",
            "Prefer a file? <strong>Download .docx</strong> builds a Word document, which you can open in Google "
            "Drive with File › Open, and it converts to a Google Doc. Either way, md to Google Docs conversion happens "
            "in your browser, so drafts are not uploaded to our server. Images that point to web addresses are "
            "kept as links in the source; local image files are not included. To go the other way, use "
            "<a href=\"/google-docs-to-markdown\">Google Docs to Markdown</a>.",
            "The steps are simple. Paste your markdown on the left, or open a .md file, and check the preview on the "
            "right. Press <strong>Copy for Google Docs</strong>, switch to your document, place the cursor and press "
            "<kbd>Ctrl</kbd> <kbd>V</kbd> (<kbd>Cmd</kbd> <kbd>V</kbd> on a Mac). If you only want the text without "
            "styles, use <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>V</kbd> instead. After pasting you can apply your own "
            "theme with Format › Paragraph styles, because the headings are real heading styles.",
        ]),
        "uses": ("Common uses for markdown in Google Docs", [
            "Moving a ChatGPT or Claude answer into a doc without fixing every heading by hand.",
            "Sharing a README or technical spec with colleagues who work in Google Docs.",
            "Turning markdown meeting notes into a doc that others can comment on.",
            "Drafting a blog post in markdown and handing it to an editor in Google Docs.",
            "Converting a markdown table into a Google Docs table for a report.",
            "Pasting a markdown checklist or task list into a shared planning doc.",
        ]),
        "faq": [
            ("Why does the paste look plain on my phone?",
             "Mobile browsers and the Google Docs app often accept only plain text from the clipboard. Use "
             "<strong>Download .docx</strong> and open the file in Google Drive instead, or paste on a computer. On an iPad or Android tablet with a keyboard, the formatted paste often works in the browser version of Google Docs, so try that before falling back to the file."),
            ("Is it free, and do I need to sign in?",
             "It is free with no sign-up. The tool is independent and not made by Google; it simply produces "
             "formatting that Google Docs accepts."),
            ("Can I get a PDF too?",
             "Yes. Use <a href=\"/markdown-to-pdf\">Markdown to PDF</a> for a print-ready file, or download the "
             "doc as PDF from Google Docs after pasting."),
        ],
    },
    "/chatgpt-to-markdown": {
        "title": "ChatGPT to Markdown – Export and Save Chats as .md | Digitum",
        "desc": "Convert ChatGPT to Markdown for free. Paste a ChatGPT conversation or open conversations.json from your export and save chats as .md files, privately.",
        "h1": "ChatGPT to Markdown <em>exporter</em>",
        "lede": "Turn ChatGPT to Markdown in two ways: paste a single chat you copied, or open the conversations.json file from your data export and save any chat, or all of them, as .md files.",
        "about": ("How to export ChatGPT chats as markdown", [
            "ChatGPT shows answers with headings, lists, tables and code, but copying a chat into a notes app often "
            "loses that structure. Converting ChatGPT to Markdown keeps it in a plain, portable format you can open "
            "anywhere, search, and keep under version control.",
            "For one chat, select the conversation in ChatGPT, copy it, and paste it into the box. The formatted text "
            "is turned into markdown, with code blocks, tables and lists kept. For your whole history, "
            "<strong>export ChatGPT</strong> data from Settings › Data controls › Export data. You receive a zip by "
            "email; unzip it and open <code>conversations.json</code> here. Pick any ChatGPT conversation from the "
            "list, sorted newest first, and each one is saved with its title, date, and turns labelled "
            "<strong>You</strong> and <strong>ChatGPT</strong>. Only the branch you were viewing is kept when a "
            "reply was regenerated or edited.",
            "<strong>Download all as .md</strong> joins every conversation into one file, separated by rules, which "
            "is handy for searching an archive. Images, uploaded files and voice audio are not included, only the "
            "text. The export file is read in your browser and never sent to our server. This tool is independent "
            "and not affiliated with OpenAI.",
            "Each saved file is ordinary markdown, so it opens in any text editor, renders on GitHub, and imports "
            "into Obsidian, Logseq or Notion. Code blocks keep their language tag, which means syntax highlighting "
            "still works. Maths written by ChatGPT stays as text, usually in LaTeX form. Use <strong>Copy</strong> "
            "for a quick paste, <strong>Download .md</strong> for a file named after the chat title, or "
            "<strong>Open in editor</strong> to trim the conversation before you save it.",
        ]),
        "uses": ("Why save ChatGPT chats as markdown", [
            "Keeping a searchable archive of useful answers in Obsidian or another notes app.",
            "Moving code explanations and snippets into a project's docs folder.",
            "Backing up your chat history before deleting old conversations.",
            "Sharing a chat with a colleague as a file rather than a public link.",
            "Turning a long brainstorm into a draft you can edit in the <a href=\"/markdown-editor\">markdown editor</a>.",
            "Feeding a past conversation back into another AI tool as clean context.",
        ]),
        "faq": [
            ("Can I save ChatGPT chats on my phone?",
             "Yes. Copy the chat in your mobile browser and paste it here. The full data export is easier on a "
             "computer, since you need to unzip it first. On iPhone and Android, long-press in the chat to select text, or use the share option in the app, then paste here. Each chat converts the same way as on a desktop browser."),
            ("Can I turn the markdown into a Word or Google Doc?",
             "Yes. Download the .md, then use <a href=\"/markdown-to-word\">Markdown to Word</a> or "
             "<a href=\"/markdown-to-google-docs\">Markdown to Google Docs</a> for a formatted document."),
            ("Is it free? Is there a limit?",
             "It is free with no sign-up. Large exports can be tens of megabytes; they are processed in your browser, "
             "so a very large file may take a few seconds to open."),
        ],
    },
    "/url-to-markdown": {
        "title": "URL to Markdown – Convert Any Web Page to Markdown | Digitum",
        "desc": "Free URL to Markdown converter. Paste a link and turn any public web page to markdown, with headings, links, images and tables, minus menus and ads.",
        "h1": "URL to Markdown <em>converter</em>",
        "lede": "Paste a link into this URL to Markdown converter and get the page's main content as clean markdown, without navigation, ads, footers or cookie banners.",
        "about": ("How to convert a URL to markdown", [
            "Copying text from a website usually brings menus, share buttons and odd spacing with it. This tool fetches "
            "the page for you, finds the main content (the <code>&lt;article&gt;</code> or <code>&lt;main&gt;</code> "
            "element, or the block with the most paragraph text) and converts it. Headings, lists, links, images, "
            "tables, quotes and code blocks are kept. Relative links and image paths are turned into full addresses, "
            "and the page title and a source link are added. Tick <strong>Whole page</strong> to convert everything "
            "instead.",
            "Browsers do not let one site read another directly, so to convert a URL to markdown the page is fetched "
            "through this site's own server, then converted in your browser. That fetch only works for public "
            "<code>http</code> and <code>https</code> pages up to 4 MB. Pages behind a login, paywalls, private "
            "addresses and sites that block automated requests cannot be read. The page's JavaScript is not run, so "
            "content that only appears after scripts load may be missing. To prevent abuse there is a per-visitor "
            "limit of about 20 fetches a minute.",
            "Website to markdown conversion is useful for research notes, documentation and AI prompts, because "
            "markdown is compact and keeps the structure. If a page will not load, open it, copy the text and use "
            "<a href=\"/paste-to-markdown\">Paste to Markdown</a>. For raw HTML you already have, use "
            "<a href=\"/html-to-markdown\">HTML to Markdown</a>.",
            "You can also share a conversion. After a page converts, its address is added to this page's link, so "
            "opening that link later converts the same page again with fresh content. Use <strong>Copy</strong>, "
            "<strong>Download .md</strong> or <strong>Open in editor</strong> to keep the result.",
        ]),
        "uses": ("Common uses for web page to markdown conversion", [
            "Saving articles and blog posts to Obsidian or another markdown notes app.",
            "Giving an AI tool or LLM clean page text instead of raw HTML.",
            "Copying documentation pages into a project wiki or README.",
            "Collecting sources for research, with links back to the original page.",
            "Migrating old website content into a static site generator.",
            "Archiving a page as a small text file you can read offline.",
        ]),
        "faq": [
            ("Is the page or my link stored?",
             "The converted markdown is not saved on our server; it stays in your browser until you copy or download "
             "it. The address you entered is added to the page link so you can bookmark or share the result. Nothing is tied to an account, so there is nothing to delete later. Like any website, the fetch passes through our hosting provider's network."),
            ("Why do I get an error for some sites?",
             "The site may block automated requests, require a login, return an error, or be larger than 4 MB. "
             "If you see a rate-limit message, wait a minute and try again."),
            ("Is it free, and does it work on mobile?",
             "Yes. There is no sign-up, and you can paste a link from your phone's share menu. Download the "
             "markdown or open it in the editor to make changes."),
        ],
    },
    "/google-docs-to-markdown": {
        "title": "Google Docs to Markdown – Convert a Doc Link to MD | Digitum",
        "desc": "Convert Google Docs to Markdown free from a share link. Headings, bold, italic, lists, tables and links are kept. Google doc to md in seconds, no add-on.",
        "h1": "Google Docs to Markdown <em>converter</em>",
        "lede": "Paste a share link into this Google Docs to Markdown converter and get clean markdown with headings, formatting, lists, tables and links kept, ready for GitHub, a CMS or a static site.",
        "about": ("How to convert Google Docs to Markdown", [
            "Google Docs has a File › Download › Markdown option, but it means signing in, downloading and opening a "
            "file each time. This tool works from the link instead. "
            "It asks Google for the doc's public HTML export, reads the styles to find bold, italic, strikethrough and "
            "monospaced text, and converts it to markdown.",
            "Headings, the document title, bullet and numbered lists, tables and links all come through. Google wraps "
            "every link in a redirect, so those are turned back into the real addresses. Comments, suggestions, page "
            "headers and footers, and font choices are not part of the output. Images are linked from Google's "
            "servers, so download them if you need permanent copies.",
            "The doc must be shared as <strong>Anyone with the link</strong>, because the export is fetched through "
            "this site's server without your Google sign-in. Private docs return a sign-in page and the tool tells "
            "you so. For a private doc, select all, copy and use <a href=\"/paste-to-markdown\">Paste to "
            "Markdown</a>: the text never leaves your device that way. The conversion itself runs in your browser, "
            "and the markdown is not stored. The tool is free, needs no add-on or sign-up, and is not affiliated "
            "with Google.",
            "To use it, open the doc, choose <strong>Share</strong>, set General access to <strong>Anyone with the "
            "link</strong> as a viewer, and copy the link. Paste it here and press <strong>Convert</strong>, or press "
            "<kbd>Enter</kbd>. The markdown appears with a preview and a source tab. Copy it, download it as a .md "
            "file named after the doc's first heading, or open it in the editor to make changes before you publish. "
            "If you change the doc, convert it again to pick up the edits.",
        ]),
        "uses": ("Common uses for Google doc to md conversion", [
            "Publishing a draft written in Google Docs to a Hugo, Jekyll or Astro site.",
            "Moving a spec or proposal into a GitHub repository as a README or docs page.",
            "Pasting a doc into a CMS that accepts markdown without losing headings.",
            "Turning shared meeting notes into markdown for Obsidian or Notion.",
            "Giving an AI tool a clean copy of a doc's content and structure.",
            "Keeping a markdown copy of a shared doc in version control so changes are easy to compare.",
        ]),
        "faq": [
            ("Can I convert Google Docs to Markdown on my phone?",
             "Yes. In the Google Docs app, share the doc with link access, copy the link, and paste it here in your "
             "mobile browser. The result is the same as on a computer, and you can download the .md file or copy it into another app."),
            ("Does it work with Google Sheets or Slides?",
             "No, only Docs. For a sheet, copy the cells and use <a href=\"/table-to-markdown\">Table to "
             "Markdown</a>, or download it as .xlsx and use Excel to Markdown."),
            ("Why does it say the document is private?",
             "The link opened a Google sign-in page instead of the document. Change Share › General access to "
             "Anyone with the link, then convert again. You can switch access back afterwards."),
        ],
    },
    "/reddit-to-markdown": {
        "title": "Reddit to Markdown – Save Posts and Threads as MD | Digitum",
        "desc": "Free Reddit to Markdown converter. Paste a post link and save Reddit posts with their top comments as markdown, replies nested as quotes. No sign-up.",
        "h1": "Reddit to Markdown <em>converter</em>",
        "lede": "Paste a link into this Reddit to Markdown converter and get the post and its top comments as clean markdown, with replies nested as quotes, ready for notes, research or archiving.",
        "about": ("How to save Reddit posts as markdown", [
            "Reddit posts and comments are already written in markdown, so this tool keeps their formatting as the "
            "author wrote it. Paste a post link, either the long <code>reddit.com/r/…/comments/…</code> address or a "
            "short <code>redd.it</code> link, and press <strong>Convert</strong>.",
            "The output starts with the title, then the subreddit, author, score and date, any link the post points "
            "to, and the post text. A link back to the thread on Reddit is included. Comments follow under a "
            "<strong>Comments</strong> heading, each with its author and score. Replies are nested as quote levels, "
            "up to four levels deep, which turns a Reddit thread to markdown that still reads like a conversation. "
            "Choose 10, 25, 50 or 100 comments, or untick <strong>Include comments</strong> to save just the post. "
            "Deleted comments are skipped, and the order is the one Reddit shows by default.",
            "The thread is fetched through this site's server from Reddit's public data, then converted in your "
            "browser. Only public posts work: private and quarantined communities cannot be read, and Reddit "
            "sometimes limits automated requests. If that happens, open the post, copy it, and use "
            "<a href=\"/paste-to-markdown\">Paste to Markdown</a>. Images and videos are kept as links only. This "
            "tool is independent and not affiliated with Reddit.",
            "When the thread loads, you can change the number of comments or turn them off without fetching it "
            "again; the markdown updates straight away. Use the <strong>Preview</strong> tab to read it, or the "
            "<strong>Markdown</strong> tab to see the source. Then copy it, download a .md file named after the "
            "post title, or open it in the editor to cut it down. The quotes render as indented blocks in most "
            "markdown apps, including Obsidian and GitHub.",
        ]),
        "uses": ("Why turn a Reddit thread to markdown", [
            "Keeping a useful how-to or troubleshooting thread in your notes before it is deleted.",
            "Collecting user feedback and opinions for product or market research.",
            "Quoting a discussion in a blog post, newsletter or report with attribution.",
            "Giving an AI tool a thread's text to summarise, without page clutter.",
            "Archiving your own posts and the replies they received.",
            "Saving a long AMA or discussion so you can read it later without ads or infinite scroll.",
        ]),
        "faq": [
            ("Can I save Reddit posts on my phone?",
             "Yes. Use the Share button in the Reddit app to copy the link, then paste it here in your browser. The "
             "<strong>Download .md</strong> button saves a file to your phone. Converting on a phone works just like on a desktop. Short <code>redd.it</code> links and links copied from the old Reddit design work too, as long as they point to a post rather than a whole subreddit or a user profile."),
            ("Is it free, and is anything stored?",
             "It is free with no sign-up. The thread is fetched for you and converted in your browser; the markdown "
             "is not saved on our server."),
            ("Can I turn the thread into a PDF?",
             "Yes. Open the result in the editor or copy it, then use <a href=\"/markdown-to-pdf\">Markdown to "
             "PDF</a> for a clean, printable copy."),
        ],
    },
    "/podcast-to-markdown": {
        "title": "Podcast to Markdown – RSS Feed and Show Notes to MD | Digitum",
        "desc": "Free podcast to Markdown converter. Paste a podcast RSS feed or Apple Podcasts link and get episodes, dates, durations and show notes as markdown.",
        "h1": "Podcast to Markdown <em>converter</em>",
        "lede": "Paste a feed or Apple Podcasts link into this podcast to Markdown converter and get the show and its episodes as markdown: titles, dates, durations, links and full show notes.",
        "about": ("How podcast to markdown conversion works", [
            "Every public podcast publishes a <strong>podcast RSS</strong> feed: an XML file that lists the show and "
            "each episode with its title, date, length, audio file and description. Podcast apps read this feed. "
            "This tool reads it too and turns it into a markdown document you can search, edit and keep.",
            "Paste the feed address, or an Apple Podcasts show link, and the feed is looked up for you through "
            "Apple's public directory. The output starts with the show title, author, website and description, "
            "then an <strong>Episodes</strong> section. Each episode gets a heading, the date and duration, links "
            "to the audio file and the episode page, and the full show notes. Show notes written in HTML keep "
            "their links, lists and emphasis. Choose the latest 10, 25 or 50 episodes, or all of them, up to 200.",
            "The feed is fetched through this site's server, which accepts public feeds up to 4 MB, then converted "
            "in your browser. It does not transcribe audio: you get the text the publisher wrote. Spotify-only "
            "shows and private or paid feeds that need a login cannot be read. For any other web page about a "
            "show, try <a href=\"/url-to-markdown\">URL to Markdown</a>. This tool is independent and not "
            "affiliated with Apple or any podcast platform.",
            "Where do you find the feed? Many podcast websites have an RSS link in the footer or on a "
            "<em>Subscribe</em> page, and hosting platforms show it in the show settings. If you cannot find it, "
            "copy the show's link from Apple Podcasts instead. After the feed loads, you can change how many "
            "episodes to include without fetching it again. Copy the result, download it as a .md file named after "
            "the show, or open it in the editor.",
        ]),
        "uses": ("Common uses for show notes in markdown", [
            "Building an episode archive page for a podcast website or static site.",
            "Researching a guest by collecting every episode they appeared in.",
            "Keeping searchable notes on the shows you follow in Obsidian.",
            "Moving show notes to a new hosting platform or newsletter.",
            "Giving an AI tool the episode list and descriptions to summarise or tag.",
            "Checking a show's back catalogue for gaps, duplicate titles or missing episode descriptions.",
        ]),
        "faq": [
            ("Can I get a table of episodes?",
             "The output is a list of headings with notes. To make a table, paste the titles and dates into the "
             "<a href=\"/markdown-table-generator\">markdown table generator</a>. Feeds with a few hundred episodes usually convert in a second or two."),
            ("Is it free, and does it work on a phone?",
             "Yes. There is no sign-up. Copy a show's link from Apple Podcasts or a podcast website and paste it "
             "here in your mobile browser."),
            ("Why does a large feed fail?",
             "Feeds over 4 MB, usually long-running shows with very long show notes, are too large to fetch. "
             "Try the show's own website, or ask the publisher for a shorter feed."),
        ],
    },
}
