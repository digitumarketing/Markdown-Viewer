/* Digitum markdown tools.
 *
 * tool.html is one shell for every converter and utility page. The Worker
 * sets <body data-tool="..."> and the copy; this file builds the tool itself.
 * Libraries load from jsDelivr / cdnjs only when the tool needs them, and
 * everything runs in the browser: files are never uploaded.
 */
(function(){
"use strict";

var $ = function(id){ return document.getElementById(id); };
var root = $("toolRoot");
var TOOL = document.body.getAttribute("data-tool") || "";

var CDN = {
  marked:   "https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js",
  hljs:     "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js",
  turndown: "https://cdn.jsdelivr.net/npm/turndown@7.2.0/dist/turndown.js",
  gfm:      "https://cdn.jsdelivr.net/npm/turndown-plugin-gfm@1.0.2/dist/turndown-plugin-gfm.js",
  mammoth:  "https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js",
  xlsx:     "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
  pdfjs:    "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
  pdfWorker:"https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js",
  tesseract:"https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js",
  jszip:    "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js",
  diff:     "https://cdn.jsdelivr.net/npm/diff@5.2.0/dist/diff.min.js",
  d3:       "https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js",
  mmLib:    "https://cdn.jsdelivr.net/npm/markmap-lib@0.17.2/dist/browser/index.iife.js",
  mmView:   "https://cdn.jsdelivr.net/npm/markmap-view@0.17.2/dist/browser/index.js",
  mermaid:  "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js",
  h2i:      "https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js"
};

/* ================= helpers ================= */

var loaded = {};
function loadOne(url){
  if(!loaded[url]){
    loaded[url] = new Promise(function(res, rej){
      var s = document.createElement("script");
      s.src = url;
      s.onload = function(){ res(); };
      s.onerror = function(){ delete loaded[url]; rej(new Error("Could not load a library. Check your connection and try again.")); };
      document.head.appendChild(s);
    });
  }
  return loaded[url];
}
/* loads in order, since some libraries need the one before */
function need(){
  var keys = Array.prototype.slice.call(arguments);
  return keys.reduce(function(p, k){ return p.then(function(){ return loadOne(CDN[k]); }); }, Promise.resolve());
}

function el(tag, attrs, kids){
  var e = document.createElement(tag);
  if(attrs) Object.keys(attrs).forEach(function(k){
    if(k === "text") e.textContent = attrs[k];
    else if(k === "html") e.innerHTML = attrs[k];
    else if(k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]);
    else if(attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
  });
  (kids || []).forEach(function(c){ if(c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
  return e;
}

function toast(msg){
  var t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(function(){ t.classList.remove("show"); }, 2600);
}

function debounce(fn, ms){
  var t;
  return function(){ var a = arguments, self = this; clearTimeout(t); t = setTimeout(function(){ fn.apply(self, a); }, ms); };
}

function download(data, name, type){
  var blob = data instanceof Blob ? data : new Blob([data], { type: type || "text/plain;charset=utf-8" });
  var a = el("a", { href: URL.createObjectURL(blob), download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
  toast("Downloaded " + name);
}

function copy(text, what){
  var done = function(){ toast((what || "Text") + " copied"); };
  if(navigator.clipboard && navigator.clipboard.writeText){
    return navigator.clipboard.writeText(text).then(done, function(){ fallbackCopy(text); done(); });
  }
  fallbackCopy(text); done();
}
function fallbackCopy(text){
  var t = el("textarea", { style: "position:fixed;left:-9999px" });
  t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
}

function readFile(file, as){
  return new Promise(function(res, rej){
    var r = new FileReader();
    r.onload = function(){ res(r.result); };
    r.onerror = function(){ rej(r.error); };
    if(as === "buffer") r.readAsArrayBuffer(file);
    else if(as === "url") r.readAsDataURL(file);
    else r.readAsText(file);
  });
}

function baseName(name){ return (name || "document").replace(/\.[^.]+$/, "") || "document"; }
function esc(t){ return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

/* Removes scripts and event handlers from rendered HTML. Content is parsed
   into an inert <template> first, so nothing runs before it is cleaned. */
function sanitize(frag){
  var bad = frag.querySelectorAll("script, iframe, object, embed, base, meta, link, form");
  Array.prototype.forEach.call(bad, function(n){ n.remove(); });
  var all = frag.querySelectorAll("*");
  Array.prototype.forEach.call(all, function(n){
    Array.prototype.slice.call(n.attributes).forEach(function(a){
      var name = a.name.toLowerCase(), v = (a.value || "").replace(/[\s\u0000-\u001f]/g, "").toLowerCase();
      if(name.indexOf("on") === 0) n.removeAttribute(a.name);
      else if((name === "href" || name === "src" || name === "xlink:href" || name === "action" || name === "formaction") &&
              (v.indexOf("javascript:") === 0 || v.indexOf("vbscript:") === 0 || (v.indexOf("data:") === 0 && name !== "src")))
        n.removeAttribute(a.name);
    });
  });
  return frag;
}
function setHTML(target, html){
  var tpl = document.createElement("template");
  tpl.innerHTML = html;
  sanitize(tpl.content);
  target.textContent = "";
  target.appendChild(tpl.content);
}

/* markdown -> safe, highlighted HTML inside target */
function renderMD(md, target){
  return need("marked").then(function(){
    setHTML(target, window.marked.parse(md, { gfm:true }));
    Array.prototype.forEach.call(target.querySelectorAll("li > input[type=checkbox]"), function(b){
      b.parentElement.classList.add("task"); b.disabled = true;
    });
    if(target.querySelector("pre code")){
      need("hljs").then(function(){
        Array.prototype.forEach.call(target.querySelectorAll("pre code"), function(c){
          try{ window.hljs.highlightElement(c); }catch(e){}
        });
      }).catch(function(){});
    }
  }, function(e){
    /* a library that failed to load: say so in the pane instead of throwing */
    target.innerHTML = '<div class="error-note">' + esc(e.message) + "</div>";
  });
}

/* hands a document to the viewer: it opens it as a new tab on load */
function openInEditor(md, name){
  try{
    localStorage.setItem("digitum-md-handoff", JSON.stringify({ name: (name || "Converted") + ".md", text: md, at: Date.now() }));
    location.href = "/?handoff=1";
  }catch(e){ toast("Could not open the editor here; copy the markdown instead"); }
}

/* ================= building blocks ================= */

/* A pane with a header row, used for every input and output. */
function pane(title, buttons, body, foot){
  var head = el("div", { class: "pane-head" }, [el("span", { class: "pane-title", text: title })].concat(buttons || []));
  return el("div", { class: "pane" }, [head, body].concat(foot ? [foot] : []));
}
function button(label, onclick, primary, extra){
  return el("button", Object.assign({ class: "btn" + (primary ? " primary" : ""), type: "button", onclick: onclick }, extra || {}), [label]);
}
function seg(options, value, onchange){
  var wrap = el("span", { class: "seg", role: "group" });
  options.forEach(function(o){
    var b = el("button", { type: "button", class: o[0] === value ? "on" : "", onclick: function(){
      Array.prototype.forEach.call(wrap.children, function(c){ c.classList.remove("on"); });
      b.classList.add("on"); onchange(o[0]);
    } }, [o[1]]);
    wrap.appendChild(b);
  });
  return wrap;
}

/* A file picker that also accepts drag and drop on the given zone. */
function filePicker(accept, onfile){
  var input = el("input", { type: "file", accept: accept, hidden: true });
  input.addEventListener("change", function(){ if(input.files[0]) onfile(input.files[0]); input.value = ""; });
  document.body.appendChild(input);
  return { open: function(){ input.click(); } };
}
/* only file drops are taken over; dropping text into a textarea still works */
function dropTarget(zone, onfile){
  var hasFiles = function(e){ return e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") > -1; };
  ["dragenter", "dragover"].forEach(function(t){ zone.addEventListener(t, function(e){ if(!hasFiles(e)) return; e.preventDefault(); zone.classList.add("over"); }); });
  ["dragleave", "drop"].forEach(function(t){ zone.addEventListener(t, function(){ zone.classList.remove("over"); }); });
  zone.addEventListener("drop", function(e){
    if(!hasFiles(e)) return;
    e.preventDefault();
    var f = e.dataTransfer.files[0];
    if(f) onfile(f);
  });
}

/* Markdown text on the left: textarea with Open, Sample and Clear. */
function mdInput(opts){
  var ta = el("textarea", { class: "pane-text", spellcheck: "false", placeholder: opts.placeholder || "Paste or type markdown here…", "aria-label": opts.title || "Markdown" });
  var count = el("span");
  var name = { v: "document" };
  var fire = function(){ count.textContent = ta.value.length.toLocaleString() + " characters"; opts.onchange(ta.value, name.v); };
  ta.addEventListener("input", debounce(fire, 160));
  var picker = filePicker(opts.accept || ".md,.markdown,.mdx,.txt,text/markdown,text/plain", function(f){
    readFile(f).then(function(t){ name.v = baseName(f.name); ta.value = t; fire(); });
  });
  dropTarget(ta, function(f){ readFile(f).then(function(t){ name.v = baseName(f.name); ta.value = t; fire(); }); });
  var p = pane(opts.title || "Markdown", [
    button("Open file", picker.open),
    opts.sample ? button("Sample", function(){ ta.value = opts.sample; name.v = opts.sampleName || "sample"; fire(); }) : null,
    button("Clear", function(){ ta.value = ""; fire(); ta.focus(); })
  ], ta, el("div", { class: "pane-foot" }, [count]));
  return { pane: p, ta: ta, name: name, set: function(t, n){ ta.value = t; if(n) name.v = n; fire(); }, fire: fire };
}

/* Markdown result on the right: Preview / Markdown tabs, Copy, Download, Open in editor. */
function mdOutput(getName){
  var md = "";
  var body = el("div", { class: "pane-body md" }, [el("div", { class: "empty-note", text: "The result appears here." })]);
  var src = el("textarea", { class: "pane-text", readonly: true, spellcheck: "false", hidden: true, "aria-label": "Markdown result" });
  var mode = "preview";
  var tabs = seg([["preview", "Preview"], ["source", "Markdown"]], mode, function(v){
    mode = v; body.hidden = v !== "preview"; src.hidden = v !== "source";
  });
  var wrap = el("div", { style: "display:flex;flex-direction:column;flex:1;min-height:0" }, [body, src]);
  var p = pane("Result", [
    tabs,
    button("Copy", function(){ if(md) copy(md, "Markdown"); }),
    button("Download .md", function(){ if(md) download(md, getName() + ".md", "text/markdown;charset=utf-8"); }),
    button("Open in editor", function(){ if(md) openInEditor(md, getName()); }, true)
  ], wrap);
  return {
    pane: p,
    set: function(text){
      md = text || "";
      src.value = md;
      if(!md.trim()){ body.innerHTML = '<div class="empty-note">The result appears here.</div>'; return; }
      renderMD(md, body);
    },
    note: function(html){ body.innerHTML = html; },
    get: function(){ return md; }
  };
}

function grid(left, right){ return el("div", { class: "tool-grid" }, [left, right]); }
function opts(children){ return el("div", { class: "tool-opts" }, children); }

/* File drop zone used by the PDF, Word, Excel and image tools. */
function fileInput(opts){
  var nameEl = el("span", { class: "file-name" });
  var zone = el("div", { class: "drop", tabindex: "0", role: "button", "aria-label": opts.label }, [
    el("div", {}, [el("strong", { text: opts.label }), el("span", { text: opts.hint || "or drag and drop it here" }), nameEl])
  ]);
  var picker = filePicker(opts.accept, function(f){ take(f); });
  function take(f){ nameEl.textContent = f.name; opts.onfile(f); }
  zone.addEventListener("click", picker.open);
  zone.addEventListener("keydown", function(e){ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); picker.open(); } });
  dropTarget(zone, take);
  var extra = el("div");
  return { pane: pane(opts.title, [button(opts.button || "Open file", picker.open)], el("div", { style: "display:flex;flex-direction:column;flex:1" }, [zone, extra])), extra: extra, take: take };
}

function progressBar(){
  var bar = el("div", { class: "progress", hidden: true }, [el("i")]);
  var status = el("div", { class: "status", hidden: true });
  return {
    els: [status, bar],
    set: function(text, frac){
      status.hidden = false; status.textContent = text;
      bar.hidden = frac == null; if(frac != null) bar.firstChild.style.width = Math.round(frac * 100) + "%";
    },
    done: function(){ status.hidden = true; bar.hidden = true; }
  };
}

/* ================= shared converters ================= */

/* Plain text -> markdown, by looking at the shape of each line. */
function textToMarkdown(text){
  var lines = text.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n");
  var out = [], para = [], firstHeading = true;
  var bullet = /^\s*([•●◦▪▫‣⁃■□–—*+-])\s+(.*)$/;
  var number = /^\s*(\d{1,3})[.)]\s+(.*)$/;
  var letter = /^\s*([a-z])[.)]\s+(.*)$/i;

  function linkify(s){
    return s.replace(/(^|[\s(])((?:https?:\/\/|www\.)[^\s<>()]+[^\s<>().,;:!?'"])/g, function(m, pre, url){
      return pre + "<" + (url.indexOf("www.") === 0 ? "https://" + url : url) + ">";
    }).replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.-]*\w)/g, "$1<$2>");
  }
  function flush(){
    if(para.length){ out.push(linkify(para.join(" ").replace(/\s+/g, " ").trim())); out.push(""); para = []; }
  }
  function isHeading(line, i){
    var t = line.trim();
    if(!t || t.length > 70 || /[.,;!?]$/.test(t) && !/:$/.test(t)) return false;
    var prevBlank = i === 0 || !lines[i-1].trim(), nextBlank = i === lines.length - 1 || !lines[i+1].trim();
    if(!prevBlank) return false;
    var caps = t === t.toUpperCase() && /[A-Z]/.test(t) && t.split(/\s+/).length <= 10;
    var colon = /:$/.test(t) && t.split(/\s+/).length <= 8;
    var words = t.split(/\s+/), titled = words.length <= 9 && words.filter(function(w){ return /^[A-Z0-9]/.test(w); }).length >= Math.ceil(words.length * 0.6);
    return nextBlank && (caps || colon || titled) && !bullet.test(t) && !number.test(t);
  }

  for(var i=0;i<lines.length;i++){
    var line = lines[i], t = line.trim(), m;
    if(!t){ flush(); continue; }
    if(isHeading(line, i)){
      flush();
      var h = t.replace(/:$/, "");
      if(h === h.toUpperCase() && /[A-Z]/.test(h)) h = h.toLowerCase().replace(/(^|\s)\S/g, function(c){ return c.toUpperCase(); });
      out.push((firstHeading && i < 3 ? "# " : "## ") + h); out.push("");
      firstHeading = false;
      continue;
    }
    var indent = (line.match(/^\s*/)[0].length >= 2) ? "  " : "";
    if((m = t.match(bullet)) || (m = line.match(bullet))){ flush(); out.push(indent + "- " + linkify(m[2])); if(!lines[i+1] || !lines[i+1].trim()) out.push(""); continue; }
    if((m = line.match(number))){ flush(); out.push(indent + m[1] + ". " + linkify(m[2])); if(!lines[i+1] || !lines[i+1].trim()) out.push(""); continue; }
    if((m = line.match(letter)) && t.length < 200){ flush(); out.push(indent + "- " + linkify(m[2])); continue; }
    /* a hard-wrapped line ending in a hyphen joins without a space */
    if(para.length && /[a-z]-$/.test(para[para.length - 1]) && /^[a-z]/.test(t)){
      para[para.length - 1] = para[para.length - 1].slice(0, -1) + t;
    }else para.push(t);
  }
  flush();
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

var turndownReady = null;
function turndown(){
  if(!turndownReady){
    turndownReady = need("turndown", "gfm").then(function(){
      return function(opts){
        var td = new window.TurndownService({
          headingStyle: opts && opts.heading === "setext" ? "setext" : "atx",
          bulletListMarker: (opts && opts.bullet) || "-",
          codeBlockStyle: opts && opts.code === "indented" ? "indented" : "fenced",
          emDelimiter: "*", strongDelimiter: "**", hr: "---", linkStyle: "inlined"
        });
        td.use(window.turndownPluginGfm.gfm);
        td.remove(["script", "style", "noscript", "iframe", "object", "embed", "template", "svg", "button", "form", "input", "select", "textarea"]);
        /* "- item" rather than turndown's default "-   item" */
        td.addRule("listItem", { filter: "li", replacement: function(content, node, o){
          content = content.replace(/^\n+/, "").replace(/\n+$/, "\n").replace(/\n/gm, "\n  ");
          var parent = node.parentNode, prefix = o.bulletListMarker + " ";
          if(parent.nodeName === "OL"){
            var start = parent.getAttribute("start"), idx = Array.prototype.indexOf.call(parent.children, node);
            prefix = (start ? Number(start) + idx : idx + 1) + ". ";
          }
          return prefix + content + (node.nextSibling && !/\n$/.test(content) ? "\n" : "");
        } });
        td.addRule("emptyLinks", { filter: function(n){ return n.nodeName === "A" && !n.textContent.trim() && !n.querySelector("img"); }, replacement: function(){ return ""; } });
        return td;
      };
    });
  }
  return turndownReady;
}

/* Copied rich text marks bold and italic in inline styles (Google Docs does
   this, and wraps everything in a <b style="font-weight:normal">). */
function normaliseClipboardHTML(html){
  var tpl = document.createElement("template");
  tpl.innerHTML = html;
  var f = sanitize(tpl.content);
  Array.prototype.forEach.call(f.querySelectorAll('b[id^="docs-internal-guid"], b[style*="font-weight:normal"], b[style*="font-weight: normal"]'), function(b){
    while(b.firstChild) b.parentNode.insertBefore(b.firstChild, b);
    b.remove();
  });
  Array.prototype.forEach.call(f.querySelectorAll("span[style]"), function(s){
    var st = s.getAttribute("style").toLowerCase();
    var bold = /font-weight\s*:\s*(bold|[6-9]00)/.test(st), ital = /font-style\s*:\s*italic/.test(st);
    var strike = /line-through/.test(st), mono = /font-family\s*:[^;]*(courier|consolas|mono)/.test(st);
    var wrap = function(tag){ var w = document.createElement(tag); while(s.firstChild) w.appendChild(s.firstChild); s.appendChild(w); };
    if(mono) wrap("code");
    if(strike) wrap("del");
    if(ital) wrap("em");
    if(bold) wrap("strong");
    s.removeAttribute("style");   /* so a second pass does not wrap it again */
  });
  Array.prototype.forEach.call(f.querySelectorAll("style, meta, o\\:p"), function(n){ n.remove(); });
  var div = document.createElement("div");
  div.appendChild(f);
  return div.innerHTML;
}

/* ================= tools ================= */

var TOOLS = {};

var SAMPLE_MD = "# Quarterly report\n\nOur **organic traffic** grew *32%* this quarter, driven by [new landing pages](https://digitum.marketing).\n\n## Highlights\n\n- Launched the markdown tools\n- Rebuilt the site on Cloudflare\n  - Faster pages\n  - Better rankings\n- [x] Brand kit finished\n\n## Numbers\n\n| Channel | Visits | Leads |\n| --- | ---: | ---: |\n| SEO | 12,400 | 310 |\n| Ads | 5,200 | 145 |\n| Email | 2,100 | 88 |\n\n> Keep publishing, keep measuring.\n\n```js\nconst growth = (now, before) => (now - before) / before;\n```\n";

/* ---------- Markdown to Word (.docx) ---------- */
TOOLS["md-docx"] = function(){
  var preview = el("div", { class: "pane-body md" });
  var input = mdInput({ sample: SAMPLE_MD, sampleName: "report", onchange: function(md){ renderMD(md, preview); } });
  var out = pane("Preview", [button("Download .docx", function(){
    if(!input.ta.value.trim()) return toast("Add some markdown first");
    need("marked", "jszip").then(function(){ return buildDocx(input.ta.value); })
      .then(function(blob){ download(blob, input.name.v + ".docx"); })
      .catch(function(e){ toast("Could not create the file. " + e.message); });
  }, true)], preview);
  root.appendChild(grid(input.pane, out));
  input.set(SAMPLE_MD, "report");
};

function xml(t){ return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

/* Walks rendered HTML and writes WordprocessingML. */
function buildDocx(md){
  var tpl = document.createElement("template");
  tpl.innerHTML = window.marked.parse(md, { gfm:true });
  sanitize(tpl.content);
  var rels = [], nums = [], body = [];

  function run(text, f){
    if(!text) return "";
    var pr = "";
    if(f.b) pr += "<w:b/>";
    if(f.i) pr += "<w:i/>";
    if(f.s) pr += "<w:strike/>";
    if(f.code) pr += '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/><w:shd w:val="clear" w:color="auto" w:fill="EFEAE1"/>';
    if(f.link) pr += '<w:rStyle w:val="Hyperlink"/>';
    return "<w:r>" + (pr ? "<w:rPr>" + pr + "</w:rPr>" : "") + '<w:t xml:space="preserve">' + xml(text) + "</w:t></w:r>";
  }
  function inline(node, f){
    var outp = "";
    node.childNodes.forEach(function(n){
      if(n.nodeType === 3){ outp += run(n.nodeValue.replace(/\s+/g, " "), f); return; }
      if(n.nodeType !== 1) return;
      var t = n.nodeName, g = Object.assign({}, f);
      if(t === "STRONG" || t === "B") g.b = true;
      else if(t === "EM" || t === "I") g.i = true;
      else if(t === "DEL" || t === "S") g.s = true;
      else if(t === "CODE") g.code = true;
      else if(t === "BR"){ outp += "<w:r><w:br/></w:r>"; return; }
      else if(t === "IMG"){ outp += run("[" + (n.getAttribute("alt") || "image") + "]", f); return; }
      else if(t === "INPUT"){ outp += run(n.checked ? "☑ " : "☐ ", f); return; }
      else if(t === "A" && n.getAttribute("href")){
        var id = "rId" + (rels.length + 10);
        rels.push('<Relationship Id="' + id + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="' + xml(n.getAttribute("href")) + '" TargetMode="External"/>');
        g.link = true;
        outp += '<w:hyperlink r:id="' + id + '">' + inline(n, g) + "</w:hyperlink>";
        return;
      }
      outp += inline(n, g);
    });
    return outp;
  }
  function para(content, style, extra){
    return "<w:p><w:pPr>" + (style ? '<w:pStyle w:val="' + style + '"/>' : "") + (extra || "") + "</w:pPr>" + content + "</w:p>";
  }
  function list(node, depth){
    var ordered = node.nodeName === "OL", numId;
    if(ordered){ nums.push(nums.length + 3); numId = nums[nums.length - 1]; } else numId = 1;
    Array.prototype.forEach.call(node.children, function(li){
      var inl = document.createElement("span"), subs = [];
      li.childNodes.forEach(function(c){
        if(c.nodeType === 1 && (c.nodeName === "UL" || c.nodeName === "OL")) subs.push(c);
        else if(c.nodeType === 1 && c.nodeName === "P"){ inl.appendChild(c.cloneNode(true)); inl.appendChild(document.createTextNode(" ")); }
        else inl.appendChild(c.cloneNode(true));
      });
      body.push(para(inline(inl, {}), "ListParagraph", '<w:numPr><w:ilvl w:val="' + Math.min(depth, 8) + '"/><w:numId w:val="' + numId + '"/></w:numPr>'));
      subs.forEach(function(s){ list(s, depth + 1); });
    });
  }
  function table(node){
    var rows = node.querySelectorAll("tr"), outp = '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="5000" w:type="pct"/></w:tblPr>';
    Array.prototype.forEach.call(rows, function(tr){
      outp += "<w:tr>";
      Array.prototype.forEach.call(tr.children, function(td){
        var head = td.nodeName === "TH", al = td.style.textAlign || td.getAttribute("align");
        outp += '<w:tc><w:tcPr>' + (head ? '<w:shd w:val="clear" w:color="auto" w:fill="E6E0D5"/>' : "") + "</w:tcPr>" +
          "<w:p><w:pPr>" + (al ? '<w:jc w:val="' + (al === "right" ? "right" : al === "center" ? "center" : "left") + '"/>' : "") + "</w:pPr>" +
          inline(td, { b: head }) + "</w:p></w:tc>";
      });
      outp += "</w:tr>";
    });
    body.push(outp + "</w:tbl>");
    body.push("<w:p/>");
  }
  function block(n){
    if(n.nodeType !== 1) return;
    var t = n.nodeName;
    if(/^H[1-6]$/.test(t)) body.push(para(inline(n, {}), "Heading" + t.charAt(1)));
    else if(t === "P") body.push(para(inline(n, {})));
    else if(t === "UL" || t === "OL") list(n, 0);
    else if(t === "BLOCKQUOTE") Array.prototype.forEach.call(n.children, function(c){ body.push(para(inline(c, {}), "Quote")); });
    else if(t === "PRE") n.textContent.replace(/\n$/, "").split("\n").forEach(function(l){ body.push(para(run(l || " ", { code:false }), "Code")); });
    else if(t === "TABLE") table(n);
    else if(t === "HR") body.push(para("", null, '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="D6CFC2"/></w:pBdr>'));
    else Array.prototype.forEach.call(n.childNodes, block);
  }
  Array.prototype.forEach.call(tpl.content.childNodes, block);

  var W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  var doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + W + "><w:body>" + body.join("") +
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>';

  function hStyle(n, size){
    return '<w:style w:type="paragraph" w:styleId="Heading' + n + '"><w:name w:val="heading ' + n + '"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>' +
      '<w:pPr><w:keepNext/><w:spacing w:before="' + (n < 3 ? 360 : 240) + '" w:after="120"/><w:outlineLvl w:val="' + (n - 1) + '"/></w:pPr><w:rPr><w:b/><w:color w:val="272320"/><w:sz w:val="' + size + '"/></w:rPr></w:style>';
  }
  var styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ' + W + ">" +
    '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
    hStyle(1, 40) + hStyle(2, 32) + hStyle(3, 28) + hStyle(4, 24) + hStyle(5, 22) + hStyle(6, 22) +
    '<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="567"/><w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="C8FF00"/></w:pBdr></w:pPr><w:rPr><w:i/><w:color w:val="6B645C"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Code"><w:name w:val="Code"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:shd w:val="clear" w:color="auto" w:fill="F6F3ED"/></w:pPr><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/><w:sz w:val="19"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="60"/><w:contextualSpacing/></w:pPr></w:style>' +
    '<w:style w:type="character" w:styleId="Hyperlink"><w:name w:val="Hyperlink"/><w:rPr><w:color w:val="1F5A96"/><w:u w:val="single"/></w:rPr></w:style>' +
    '<w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr><w:tblBorders>' +
    ["top", "left", "bottom", "right", "insideH", "insideV"].map(function(s){ return "<w:" + s + ' w:val="single" w:sz="4" w:space="0" w:color="D6CFC2"/>'; }).join("") +
    '</w:tblBorders><w:tblCellMar><w:left w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>';

  function lvls(fmt){
    var o = "";
    for(var i=0;i<9;i++){
      var text = fmt === "bullet" ? ["•", "◦", "▪"][i % 3] : "%" + (i + 1) + ".";
      o += '<w:lvl w:ilvl="' + i + '"><w:start w:val="1"/><w:numFmt w:val="' + (fmt === "bullet" ? "bullet" : ["decimal", "lowerLetter", "lowerRoman"][i % 3]) + '"/>' +
        '<w:lvlText w:val="' + text + '"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="' + (720 + i * 360) + '" w:hanging="360"/></w:pPr></w:lvl>';
    }
    return o;
  }
  var numbering = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering ' + W + ">" +
    '<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>' + lvls("bullet") + "</w:abstractNum>" +
    '<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>' + lvls("decimal") + "</w:abstractNum>" +
    '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>' +
    nums.map(function(id){ return '<w:num w:numId="' + id + '"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>'; }).join("") +
    "</w:numbering>";

  var zip = new window.JSZip();
  zip.file("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/></Types>', { createFolders: false });
  zip.file("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>', { createFolders: false });
  zip.file("word/_rels/document.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>' + rels.join("") + "</Relationships>", { createFolders: false });
  zip.file("word/document.xml", doc, { createFolders: false });
  zip.file("word/styles.xml", styles, { createFolders: false });
  zip.file("word/numbering.xml", numbering, { createFolders: false });
  return zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

/* ---------- Markdown to Excel ---------- */
function mdTables(md){
  var tokens = window.marked.lexer(md), tables = [], heading = "";
  var plain = function(cell){ return (cell.text || "").replace(/\*\*|__|`|~~/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\\\|/g, "|").trim(); };
  tokens.forEach(function(t){
    if(t.type === "heading") heading = t.text.replace(/[*_`~]/g, "");
    if(t.type === "table"){
      tables.push({ name: heading, align: t.align, rows: [t.header.map(plain)].concat(t.rows.map(function(r){ return r.map(plain); })) });
    }
  });
  return tables;
}
function asNumber(v){
  var s = String(v).trim();
  if(/^[-+]?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$/.test(s)) return parseFloat(s.replace(/,/g, ""));
  if(/^[-+]?\d+(\.\d+)?%$/.test(s)) return parseFloat(s) / 100;
  return v;
}
TOOLS["md-xlsx"] = function(){
  var tables = [];
  var preview = el("div", { class: "pane-body md" });
  var pick = el("select", { "aria-label": "Table for CSV" });
  var input = mdInput({ sample: SAMPLE_MD, sampleName: "report", onchange: function(md){
    need("marked").then(function(){
      tables = mdTables(md);
      pick.innerHTML = "";
      tables.forEach(function(t, i){ pick.appendChild(el("option", { value: i, text: "Table " + (i + 1) + (t.name ? " – " + t.name : "") })); });
      if(!tables.length){ preview.innerHTML = '<div class="empty-note">No markdown table found yet. Need one? Try the <a href="/markdown-table-generator">table generator</a>.</div>'; return; }
      var html = tables.map(function(t, i){
        return "<h3>Sheet " + (i + 1) + ": " + esc(sheetName(t.name, i, [])) + "</h3><table><thead><tr>" + t.rows[0].map(function(c){ return "<th>" + esc(c) + "</th>"; }).join("") +
          "</tr></thead><tbody>" + t.rows.slice(1).map(function(r){ return "<tr>" + r.map(function(c){ return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
      }).join("");
      setHTML(preview, html);
    });
  } });
  function sheetName(name, i, used){
    var n = (name || "Table " + (i + 1)).replace(/[\[\]:*?\/\\]/g, " ").trim().slice(0, 31) || "Table " + (i + 1), base = n, k = 2;
    while(used.indexOf(n) > -1){ n = base.slice(0, 28) + " " + k++; }
    used.push(n); return n;
  }
  var out = pane("Tables found", [
    button("Download .xlsx", function(){
      if(!tables.length) return toast("No table to export");
      need("xlsx").then(function(){
        var wb = window.XLSX.utils.book_new(), used = [];
        tables.forEach(function(t, i){
          var aoa = t.rows.map(function(r, ri){ return ri === 0 ? r : r.map(asNumber); });
          var ws = window.XLSX.utils.aoa_to_sheet(aoa);
          ws["!cols"] = t.rows[0].map(function(_, c){ return { wch: Math.min(60, Math.max.apply(null, t.rows.map(function(r){ return String(r[c] || "").length; })) + 2) }; });
          window.XLSX.utils.book_append_sheet(wb, ws, sheetName(t.name, i, used));
        });
        var buf = window.XLSX.write(wb, { bookType: "xlsx", type: "array" });
        download(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), input.name.v + ".xlsx");
      }).catch(function(e){ toast(e.message); });
    }, true),
    pick,
    button("Download CSV", function(){
      var t = tables[+pick.value || 0];
      if(!t) return toast("No table to export");
      var csv = t.rows.map(function(r){ return r.map(function(c){ c = String(c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(","); }).join("\r\n");
      download("﻿" + csv, input.name.v + ".csv", "text/csv;charset=utf-8");
    })
  ], preview);
  root.appendChild(grid(input.pane, out));
  input.set(SAMPLE_MD, "report");
};

/* ---------- Markdown to Image ---------- */
TOOLS["md-image"] = function(){
  var frame = el("div", { class: "frame md" });
  var holder = el("div", { class: "pane-body", style: "background:var(--panel)" }, [frame]);
  var width = el("select", { "aria-label": "Width" }, [480, 640, 800, 1000, 1200].map(function(w){ return el("option", { value: w, text: w + " px", selected: w === 800 }); }));
  var theme = el("select", { "aria-label": "Theme" }, [el("option", { value: "light", text: "Light" }), el("option", { value: "dark", text: "Dark" })]);
  var scale = el("select", { "aria-label": "Scale" }, [1, 2, 3].map(function(s){ return el("option", { value: s, text: s + "x", selected: s === 2 }); }));
  function look(){
    frame.style.width = width.value + "px";
    frame.style.maxWidth = "none";
    var dark = theme.value === "dark";
    frame.style.setProperty("--paper", dark ? "#272320" : "#EFEAE1");
    frame.style.setProperty("--panel", dark ? "#322D29" : "#E6E0D5");
    frame.style.setProperty("--ink", dark ? "#EFEAE1" : "#272320");
    frame.style.setProperty("--muted", dark ? "#A69E93" : "#6B645C");
    frame.style.setProperty("--rule", dark ? "#443D37" : "#D6CFC2");
    frame.style.setProperty("--link", dark ? "#C8FF00" : "#272320");
    frame.style.background = "var(--paper)"; frame.style.color = "var(--ink)";
  }
  [width, theme].forEach(function(s){ s.addEventListener("change", look); });
  var input = mdInput({ sample: SAMPLE_MD, sampleName: "report", onchange: function(md){ renderMD(md, frame); } });
  function shoot(kind){
    if(!input.ta.value.trim()) return toast("Add some markdown first");
    toast("Rendering image");
    need("h2i").then(function(){
      var o = { pixelRatio: +scale.value, backgroundColor: theme.value === "dark" ? "#272320" : "#EFEAE1", quality: .95 };
      var fn = kind === "jpg" ? window.htmlToImage.toJpeg : window.htmlToImage.toPng;
      return fn(frame, o).catch(function(){ o.skipFonts = true; return fn(frame, o); });
    }).then(function(url){
      return fetch(url).then(function(r){ return r.blob(); });
    }).then(function(b){ download(b, input.name.v + "." + kind); }).catch(function(e){ toast("Could not render the image. " + (e.message || "")); });
  }
  root.appendChild(opts([el("label", {}, ["Width ", width]), el("label", {}, ["Theme ", theme]), el("label", {}, ["Scale ", scale])]));
  root.appendChild(grid(input.pane, pane("Preview", [button("Download PNG", function(){ shoot("png"); }, true), button("Download JPG", function(){ shoot("jpg"); })], holder)));
  look();
  input.set(SAMPLE_MD, "report");
};

/* ---------- Markdown to Text ---------- */
function htmlToText(node, o){
  var out = [];
  function inline(n){
    var s = "";
    n.childNodes.forEach(function(c){
      if(c.nodeType === 3) s += c.nodeValue;
      else if(c.nodeType === 1){
        if(c.nodeName === "BR") s += "\n";
        else if(c.nodeName === "IMG") s += c.getAttribute("alt") || "";
        else if(c.nodeName === "INPUT") s += c.checked ? "[x] " : "[ ] ";
        else if(c.nodeName === "A"){
          var t = inline(c), href = c.getAttribute("href") || "";
          s += t + (o.links && href && href !== t && href.indexOf("#") !== 0 ? " (" + href.replace(/^mailto:/, "") + ")" : "");
        }
        else if(c.nodeName === "UL" || c.nodeName === "OL"){}
        else s += inline(c);
      }
    });
    return s;
  }
  function list(n, depth){
    var i = parseInt(n.getAttribute("start") || "1", 10);
    Array.prototype.forEach.call(n.children, function(li){
      var mark = o.bullets ? (n.nodeName === "OL" ? (i++) + ". " : "• ") : "";
      out.push(new Array(depth + 1).join("    ") + mark + inline(li).replace(/\s+/g, " ").trim());
      Array.prototype.forEach.call(li.children, function(c){ if(c.nodeName === "UL" || c.nodeName === "OL") list(c, depth + 1); });
    });
    out.push("");
  }
  Array.prototype.forEach.call(node.childNodes, function walk(n){
    if(n.nodeType !== 1) return;
    var t = n.nodeName;
    if(/^H[1-6]$/.test(t)){ out.push(inline(n).trim()); out.push(""); }
    else if(t === "P"){ out.push(inline(n).replace(/[ \t]+/g, " ").trim()); out.push(""); }
    else if(t === "UL" || t === "OL") list(n, 0);
    else if(t === "PRE"){ out.push(n.textContent.replace(/\n$/, "")); out.push(""); }
    else if(t === "BLOCKQUOTE"){ Array.prototype.forEach.call(n.childNodes, walk); }
    else if(t === "TABLE"){ Array.prototype.forEach.call(n.querySelectorAll("tr"), function(tr){ out.push(Array.prototype.map.call(tr.children, function(c){ return inline(c).trim(); }).join("\t")); }); out.push(""); }
    else if(t === "HR"){ out.push("————————"); out.push(""); }
    else Array.prototype.forEach.call(n.childNodes, walk);
  });
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
TOOLS["md-text"] = function(){
  var result = el("textarea", { class: "pane-text", readonly: true, "aria-label": "Plain text result" });
  var keepLinks = el("input", { type: "checkbox", checked: true }), keepBullets = el("input", { type: "checkbox", checked: true });
  var input = mdInput({ sample: SAMPLE_MD, sampleName: "report", onchange: convert });
  function convert(){
    need("marked").then(function(){
      var tpl = document.createElement("template");
      tpl.innerHTML = window.marked.parse(input.ta.value, { gfm:true });
      sanitize(tpl.content);
      result.value = input.ta.value.trim() ? htmlToText(tpl.content, { links: keepLinks.checked, bullets: keepBullets.checked }) : "";
    });
  }
  [keepLinks, keepBullets].forEach(function(c){ c.addEventListener("change", convert); });
  root.appendChild(opts([el("label", {}, [keepLinks, "Keep link addresses"]), el("label", {}, [keepBullets, "Keep bullets and numbers"])]));
  root.appendChild(grid(input.pane, pane("Plain text", [
    button("Copy", function(){ if(result.value) copy(result.value); }, true),
    button("Download .txt", function(){ if(result.value) download(result.value, input.name.v + ".txt"); })
  ], result)));
  input.set(SAMPLE_MD, "report");
};

/* ---------- Markmap ---------- */
TOOLS["markmap"] = function(){
  var sample = "# Digital marketing\n\n## SEO\n- Keyword research\n- On-page\n  - Titles\n  - Internal links\n- Technical\n\n## Content\n- Blog\n- Guides\n- **Free tools**\n\n## Paid\n- Search ads\n- Social ads\n\n## Email\n- Newsletter\n- Automations\n";
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "mm");
  var holder = el("div", { class: "pane-body", style: "padding:0" }, [svg]);
  var mm = null, transformer = null, err = el("div", { class: "error-note", hidden: true });
  holder.appendChild(err);
  var draw = function(md){
    need("d3", "mmLib", "mmView").then(function(){
      var M = window.markmap;
      if(!transformer) transformer = new M.Transformer();
      var data = transformer.transform(md || "# (empty)").root;
      if(!mm) mm = M.Markmap.create(svg, { autoFit: true, duration: 300 }, data);
      else { mm.setData(data); mm.fit(); }
      err.hidden = true;
    }).catch(function(e){ err.hidden = false; err.textContent = e.message; });
  };
  var input = mdInput({ sample: sample, sampleName: "mind-map", onchange: draw });
  function svgText(){
    var c = svg.cloneNode(true), box = svg.getBBox ? svg.querySelector("g").getBBox() : null;
    c.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    if(box){ c.setAttribute("viewBox", [box.x - 20, box.y - 20, box.width + 40, box.height + 40].join(" ")); c.setAttribute("width", box.width + 40); c.setAttribute("height", box.height + 40); c.querySelector("g").removeAttribute("transform"); }
    c.style.background = getComputedStyle(document.body).backgroundColor;
    return new XMLSerializer().serializeToString(c);
  }
  root.appendChild(grid(input.pane, pane("Mind map", [
    button("Fit", function(){ if(mm) mm.fit(); }),
    button("Download SVG", function(){ if(mm) download(svgText(), input.name.v + ".svg", "image/svg+xml"); }, true),
    button("Download PNG", function(){ if(mm) svgToPng(svgText(), input.name.v + ".png"); })
  ], holder)));
  input.set(sample, "mind-map");
};

function svgToPng(svgString, name, scale){
  var img = new Image(), url = URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml;charset=utf-8" }));
  img.onload = function(){
    var s = scale || 2, c = document.createElement("canvas");
    c.width = (img.naturalWidth || 800) * s; c.height = (img.naturalHeight || 600) * s;
    var ctx = c.getContext("2d");
    ctx.fillStyle = getComputedStyle(document.body).backgroundColor; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    c.toBlob(function(b){ download(b, name); }, "image/png");
  };
  img.onerror = function(){ URL.revokeObjectURL(url); toast("Could not draw the PNG; try SVG"); };
  img.src = url;
}

/* ---------- PDF to Markdown ---------- */
TOOLS["pdf-md"] = function(){
  var out = mdOutput(function(){ return name; }), name = "document";
  var prog = progressBar();
  var fi = fileInput({ title: "PDF", label: "Open a PDF", button: "Open PDF", accept: "application/pdf,.pdf", onfile: function(f){
    name = baseName(f.name);
    prog.set("Loading PDF reader…", 0);
    need("pdfjs").then(function(){
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = CDN.pdfWorker;
      return readFile(f, "buffer");
    }).then(function(buf){ return window.pdfjsLib.getDocument({ data: buf }).promise; })
      .then(function(pdf){ return pdfToMarkdown(pdf, function(i, n){ prog.set("Reading page " + i + " of " + n, i / n); }); })
      .then(function(md){
        prog.done();
        out.set(md);
        if(!md.trim()) out.note('<div class="empty-note">No text found. This looks like a scanned PDF; try <a href="/image-to-markdown">Image to Markdown</a>.</div>');
      })
      .catch(function(e){ prog.done(); out.note('<div class="error-note">' + esc(e.message || "Could not read this PDF.") + "</div>"); });
  } });
  prog.els.forEach(function(e){ fi.extra.appendChild(e); });
  root.appendChild(grid(fi.pane, out.pane));
};

function pdfToMarkdown(pdf, onpage){
  var pages = [], n = pdf.numPages;
  var chain = Promise.resolve();
  for(var p=1;p<=n;p++){
    (function(p){
      chain = chain.then(function(){ return pdf.getPage(p); }).then(function(page){ return page.getTextContent(); }).then(function(tc){
        onpage(p, n);
        /* group text items into lines by their baseline */
        var lines = [];
        tc.items.forEach(function(it){
          if(!it.str && !it.hasEOL) return;
          var size = Math.round(Math.hypot(it.transform[0], it.transform[1]) * 10) / 10 || it.height || 10;
          var x = it.transform[4], y = it.transform[5];
          var line = lines.find(function(l){ return Math.abs(l.y - y) < size * 0.4; });
          if(!line){ line = { y: y, size: size, items: [] }; lines.push(line); }
          line.size = Math.max(line.size, size);
          line.items.push({ x: x, w: it.width, s: it.str, fn: it.fontName });
        });
        lines.sort(function(a, b){ return b.y - a.y; });
        lines.forEach(function(l){
          l.items.sort(function(a, b){ return a.x - b.x; });
          var t = "", end = null;
          l.items.forEach(function(i){
            if(end !== null && i.x - end > l.size * 0.2 && !/\s$/.test(t) && !/^\s/.test(i.s)) t += " ";
            t += i.s; end = i.x + i.w;
          });
          l.text = t.replace(/\s+/g, " ").trim();
          l.x0 = l.items.length ? l.items[0].x : 0;
          l.x1 = end || 0;
        });
        var kept = lines.filter(function(l){ return l.text; });
        kept.right = Math.max.apply(null, kept.map(function(l){ return l.x1; }).concat([0]));
        pages.push(kept);
      });
    })(p);
  }
  return chain.then(function(){
    /* the most common size, by amount of text, is body text */
    var sizes = {};
    pages.forEach(function(ls){ ls.forEach(function(l){ sizes[l.size] = (sizes[l.size] || 0) + l.text.length; }); });
    var body = +Object.keys(sizes).sort(function(a, b){ return sizes[b] - sizes[a]; })[0] || 10;
    var out = [], para = [], prev = null;
    var bullet = /^([•●◦▪▫‣⁃■–-])\s*(.*)$/, number = /^(\d{1,3})[.)]\s+(.*)$/;
    function flush(){ if(para.length){ out.push(para.join(" ")); out.push(""); para = []; } }
    pages.forEach(function(lines){
      prev = null;
      lines.forEach(function(l){
        var r = l.size / body, m;
        var level = r >= 1.75 ? 1 : r >= 1.35 ? 2 : r >= 1.12 ? 3 : 0;
        if(level && l.text.length < 120){ flush(); out.push(new Array(level + 1).join("#") + " " + l.text); out.push(""); prev = l; return; }
        if((m = l.text.match(bullet))){ flush(); out.push("- " + m[2]); prev = l; return; }
        if((m = l.text.match(number))){ flush(); out.push(m[1] + ". " + m[2]); prev = l; return; }
        var gap = prev ? prev.y - l.y : 0;
        /* a new paragraph after a big gap, a change of size, or a line that
           stopped well short of the right margin (a deliberate line break) */
        var short = prev && lines.right && prev.x1 < lines.right * 0.72;
        if(prev && (gap > l.size * 1.9 || Math.abs(prev.size - l.size) > 0.5 || short)) flush();
        if(para.length && /[a-z]-$/.test(para[para.length - 1]) && /^[a-z]/.test(l.text)){
          para[para.length - 1] = para[para.length - 1].slice(0, -1) + l.text;
        }else{
          if(!para.length && out.length && /^[-\d]/.test(out[out.length - 1]) && out[out.length - 1] !== "") out.push("");
          para.push(l.text);
        }
        prev = l;
      });
      flush();
    });
    return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  });
}

/* ---------- HTML to Markdown ---------- */
TOOLS["html-md"] = function(){
  var heading = "atx", bulletChar = "-", codeStyle = "fenced";
  var out = mdOutput(function(){ return input.name.v; });
  var sample = '<h1>Release notes</h1>\n<p>Version <strong>2.0</strong> is out, with <a href="https://digitum.marketing">new tools</a>.</p>\n<h2>What changed</h2>\n<ul>\n  <li>Faster exports</li>\n  <li>Dark mode</li>\n</ul>\n<table>\n  <tr><th>Plan</th><th>Price</th></tr>\n  <tr><td>Free</td><td>$0</td></tr>\n</table>\n<pre><code class="language-js">console.log("hello");</code></pre>';
  var input = mdInput({ title: "HTML", placeholder: "Paste HTML code here…", accept: ".html,.htm,text/html", sample: sample, sampleName: "page", onchange: convert });
  function convert(){
    var v = input.ta.value;
    if(!v.trim()) return out.set("");
    turndown().then(function(make){ out.set(make({ heading: heading, bullet: bulletChar, code: codeStyle }).turndown(normaliseClipboardHTML(v))); })
      .catch(function(e){ out.note('<div class="error-note">' + esc(e.message) + "</div>"); });
  }
  root.appendChild(opts([
    el("label", {}, ["Headings ", seg([["atx", "# Heading"], ["setext", "Underlined"]], heading, function(v){ heading = v; convert(); })]),
    el("label", {}, ["Bullets ", seg([["-", "-"], ["*", "*"]], bulletChar, function(v){ bulletChar = v; convert(); })]),
    el("label", {}, ["Code ", seg([["fenced", "```"], ["indented", "Indented"]], codeStyle, function(v){ codeStyle = v; convert(); })])
  ]));
  root.appendChild(grid(input.pane, out.pane));
  input.set(sample, "page");
};

/* ---------- Word to Markdown ---------- */
TOOLS["docx-md"] = function(){
  var name = "document", out = mdOutput(function(){ return name; }), prog = progressBar();
  var fi = fileInput({ title: "Word document", label: "Open a .docx file", button: "Open .docx",
    accept: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document", onfile: function(f){
      if(!/\.docx$/i.test(f.name)) return out.note('<div class="error-note">Please choose a .docx file. Old .doc files need saving as .docx first.</div>');
      name = baseName(f.name);
      prog.set("Reading " + f.name + "…", null);
      Promise.all([need("mammoth"), turndown(), readFile(f, "buffer")]).then(function(r){
        return window.mammoth.convertToHtml({ arrayBuffer: r[2] }).then(function(res){ return r[1]().turndown(res.value); });
      }).then(function(md){ prog.done(); out.set(md); })
        .catch(function(e){ prog.done(); out.note('<div class="error-note">' + esc(e.message || "Could not read this file.") + "</div>"); });
    } });
  prog.els.forEach(function(e){ fi.extra.appendChild(e); });
  root.appendChild(grid(fi.pane, out.pane));
};

/* ---------- Excel to Markdown ---------- */
function rowsToTable(rows, o){
  rows = rows.filter(function(r){ return r.some(function(c){ return String(c).trim(); }); });
  if(!rows.length) return "";
  var cols = Math.max.apply(null, rows.map(function(r){ return r.length; }));
  rows = rows.map(function(r){ var x = r.slice(); while(x.length < cols) x.push(""); return x.map(function(c){ return String(c == null ? "" : c).replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>").trim(); }); });
  var head = o.header ? rows[0] : rows[0].map(function(_, i){ return "Column " + (i + 1); });
  var bodyRows = o.header ? rows.slice(1) : rows;
  var numeric = head.map(function(_, c){ var v = bodyRows.map(function(r){ return r[c]; }).filter(Boolean); return v.length && v.every(function(x){ return typeof asNumber(x) === "number"; }); });
  var align = head.map(function(_, c){ return o.align === "auto" ? (numeric[c] ? "right" : "left") : o.align; });
  var width = head.map(function(h, c){ return Math.max(3, h.length, Math.max.apply(null, bodyRows.map(function(r){ return r[c].length; }).concat([0]))); });
  var pad = function(s, w, a){ var n = w - s.length; return a === "right" ? new Array(n + 1).join(" ") + s : a === "center" ? new Array(Math.floor(n / 2) + 1).join(" ") + s + new Array(Math.ceil(n / 2) + 1).join(" ") : s + new Array(n + 1).join(" "); };
  var line = function(r){ return "| " + r.map(function(c, i){ return pad(c, width[i], align[i]); }).join(" | ") + " |"; };
  var sep = "| " + width.map(function(w, i){ var a = align[i]; return a === "center" ? ":" + new Array(w - 1).join("-") + ":" : a === "right" ? new Array(w).join("-") + ":" : new Array(w + 1).join("-"); }).join(" | ") + " |";
  return [line(head), sep].concat(bodyRows.map(line)).join("\n") + "\n";
}
TOOLS["xlsx-md"] = function(mode){
  var csvMode = !!(mode && mode.csv);
  var name = "table", sheets = null, out = mdOutput(function(){ return name; });
  var header = el("input", { type: "checkbox", checked: true });
  var align = el("select", { "aria-label": "Alignment" }, [["auto", "Numbers right"], ["left", "Left"], ["center", "Centre"], ["right", "Right"]].map(function(o){ return el("option", { value: o[0], text: o[1] }); }));
  var paste = el("textarea", { class: "pane-text", style: "min-height:180px;border-top:1px solid var(--rule)", "aria-label": csvMode ? "CSV text" : "Pasted cells",
    placeholder: csvMode ? "…or paste CSV text here" : "…or paste cells copied from Excel or Google Sheets, or CSV text" });
  function render(){
    var o = { header: header.checked, align: align.value };
    if(sheets){
      out.set(sheets.map(function(s){ return (sheets.length > 1 ? "## " + s.name + "\n\n" : "") + rowsToTable(s.rows, o); }).filter(Boolean).join("\n"));
    }else if(paste.value.trim()){
      var text = paste.value.replace(/\r\n?/g, "\n").replace(/\n+$/, "");
      var tab = text.indexOf("\t") > -1;
      var rows = tab ? text.split("\n").map(function(l){ return l.split("\t"); }) : parseCSV(text);
      out.set(rowsToTable(rows, o));
    }else out.set("");
  }
  var fi = fileInput({ title: csvMode ? "CSV" : "Spreadsheet", label: csvMode ? "Open a CSV file" : "Open an Excel or CSV file", button: "Open file",
    accept: csvMode ? ".csv,.tsv,text/csv,.txt" : ".xlsx,.xls,.csv,.ods,.tsv", onfile: function(f){
    name = baseName(f.name);
    Promise.all([need("xlsx"), readFile(f, "buffer")]).then(function(r){
      var wb = window.XLSX.read(r[1], { type: "array" });
      sheets = wb.SheetNames.map(function(n){ return { name: n, rows: window.XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: "" }) }; });
      paste.value = ""; render();
    }).catch(function(e){ out.note('<div class="error-note">' + esc(e.message) + "</div>"); });
  } });
  fi.extra.appendChild(paste);
  paste.addEventListener("input", debounce(function(){ sheets = null; render(); }, 150));
  [header, align].forEach(function(c){ c.addEventListener("change", render); });
  root.appendChild(opts([el("label", {}, [header, "First row is the header"]), el("label", {}, ["Alignment ", align])]));
  root.appendChild(grid(fi.pane, out.pane));
  paste.value = csvMode ? 'Channel,Visits,Leads\nSEO,"12,400",310\nAds,"5,200",145\nEmail,"2,100",88' : "Channel\tVisits\tLeads\nSEO\t12400\t310\nAds\t5200\t145\nEmail\t2100\t88";
  render();
};
function parseCSV(text){
  var rows = [], row = [], cell = "", q = false;
  for(var i=0;i<text.length;i++){
    var c = text[i];
    if(q){ if(c === '"'){ if(text[i+1] === '"'){ cell += '"'; i++; } else q = false; } else cell += c; }
    else if(c === '"') q = true;
    else if(c === "," || c === ";" && text.indexOf(",") < 0){ row.push(cell); cell = ""; }
    else if(c === "\n"){ row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  row.push(cell); rows.push(row);
  return rows;
}

/* ---------- Image to Markdown (OCR) ---------- */
TOOLS["image-md"] = function(){
  var name = "image", out = mdOutput(function(){ return name; }), prog = progressBar();
  var lang = el("select", { "aria-label": "Language of the text" }, [["eng", "English"], ["spa", "Spanish"], ["fra", "French"], ["deu", "German"], ["por", "Portuguese"], ["ita", "Italian"], ["urd", "Urdu"], ["ara", "Arabic"], ["hin", "Hindi"]].map(function(o){ return el("option", { value: o[0], text: o[1] }); }));
  var thumb = el("img", { class: "thumb", alt: "", hidden: true });
  var last = null;
  function run(f){
    last = f; name = baseName(f.name || "screenshot");
    thumb.src = URL.createObjectURL(f); thumb.hidden = false;
    prog.set("Loading text recognition…", 0);
    need("tesseract").then(function(){
      return window.Tesseract.recognize(f, lang.value, { logger: function(m){
        if(m.status === "recognizing text") prog.set("Reading text… " + Math.round(m.progress * 100) + "%", m.progress);
        else if(m.status) prog.set(m.status.charAt(0).toUpperCase() + m.status.slice(1) + "…", m.progress || 0);
      } });
    }).then(function(res){
      prog.done();
      var text = res.data.text || "";
      out.set(text.trim() ? textToMarkdown(text) : "");
      if(!text.trim()) out.note('<div class="empty-note">No text was found in this image.</div>');
    }).catch(function(e){ prog.done(); out.note('<div class="error-note">' + esc(e.message || String(e)) + "</div>"); });
  }
  var fi = fileInput({ title: "Image", label: "Open an image", hint: "or drag it here, or paste a screenshot with Ctrl V", button: "Open image", accept: "image/*", onfile: run });
  fi.extra.appendChild(thumb);
  prog.els.forEach(function(e){ fi.extra.appendChild(e); });
  lang.addEventListener("change", function(){ if(last) run(last); });
  document.addEventListener("paste", function(e){
    var items = (e.clipboardData && e.clipboardData.items) || [];
    for(var i=0;i<items.length;i++){ if(items[i].type.indexOf("image") === 0){ run(items[i].getAsFile()); e.preventDefault(); return; } }
  });
  root.appendChild(opts([el("label", {}, ["Language ", lang])]));
  root.appendChild(grid(fi.pane, out.pane));
};

/* ---------- Text to Markdown ---------- */
TOOLS["text-md"] = function(){
  var out = mdOutput(function(){ return input.name.v; });
  var sample = "WEEKLY MARKETING UPDATE\n\nThis week we focused on organic growth and the new free tools. Traffic is up\nand the first leads from the tools are coming in.\n\nWhat we shipped:\n\n• Markdown viewer and editor\n• Markdown to PDF converter\n• Paste to Markdown\n\nNext steps\n\n1. Submit the sitemap to Search Console\n2. Reach out for backlinks\n3. Write two guides\n\nQuestions? Email hello@digitum.marketing or visit www.digitum.marketing\n";
  var input = mdInput({ title: "Plain text", placeholder: "Paste plain text here…", accept: ".txt,text/plain", sample: sample, sampleName: "notes", onchange: function(t){ out.set(t.trim() ? textToMarkdown(t) : ""); } });
  root.appendChild(grid(input.pane, out.pane));
  input.set(sample, "notes");
};

/* ---------- Paste to Markdown ---------- */
TOOLS["paste-md"] = function(){
  var out = mdOutput(function(){ return "pasted"; });
  var zone = el("div", { class: "paste-zone md", contenteditable: "true", "data-placeholder": "Click here and paste (Ctrl V) formatted text from Google Docs, Word, a web page or an email…", "aria-label": "Paste area", role: "textbox", "aria-multiline": "true" });
  var convert = debounce(function(){
    if(!zone.textContent.trim() && !zone.querySelector("img")) return out.set("");
    turndown().then(function(make){ out.set(make().turndown(normaliseClipboardHTML(zone.innerHTML))); });
  }, 150);
  zone.addEventListener("paste", function(e){
    var html = e.clipboardData && e.clipboardData.getData("text/html");
    var text = e.clipboardData && e.clipboardData.getData("text/plain");
    e.preventDefault();
    if(html){
      setHTML(zone, normaliseClipboardHTML(html));
      convert();
    }else if(text){
      zone.textContent = text;
      out.set(textToMarkdown(text));
    }
  });
  zone.addEventListener("input", convert);
  root.appendChild(grid(pane("Paste here", [button("Clear", function(){ zone.innerHTML = ""; out.set(""); zone.focus(); })], zone), out.pane));
};

/* ---------- Markdown table generator ---------- */
TOOLS["table"] = function(){
  var data = [["Channel", "Visits", "Leads"], ["SEO", "12,400", "310"], ["Ads", "5,200", "145"]], align = ["left", "right", "right"];
  var table = el("table", { class: "grid" });
  var result = el("textarea", { class: "pane-text", readonly: true, style: "min-height:220px", "aria-label": "Markdown table" });
  var preview = el("div", { class: "pane-body md", style: "min-height:160px" });
  function output(){
    var text = rowsToTableAligned(data, align);
    result.value = text;
    renderMD(text, preview);
  }
  function build(){
    table.innerHTML = "";
    var tools = el("tr", { class: "col-tools" });
    align.forEach(function(a, c){
      tools.appendChild(el("th", {}, [el("span", { class: "seg" }, [["left", "⟸"], ["center", "≡"], ["right", "⟹"]].map(function(o){
        return el("button", { type: "button", class: a === o[0] ? "on" : "", title: "Align " + o[0], "aria-label": "Align column " + (c + 1) + " " + o[0], onclick: function(){ align[c] = o[0]; build(); output(); } }, [o[1]]);
      }))]));
    });
    tools.appendChild(el("th"));
    var thead = el("thead", {}, [tools]), tbody = el("tbody");
    data.forEach(function(row, r){
      var tr = el("tr");
      row.forEach(function(v, c){
        var inp = el("input", { value: v, "aria-label": (r === 0 ? "Header " : "Row " + r + " ") + "column " + (c + 1), "data-r": r, "data-c": c });
        inp.addEventListener("input", function(){ data[r][c] = inp.value; output(); });
        inp.addEventListener("keydown", function(e){
          if(e.key === "Enter"){ e.preventDefault(); if(r === data.length - 1){ addRow(); } focusCell(r + 1, c); }
        });
        inp.addEventListener("paste", function(e){
          var t = e.clipboardData.getData("text/plain");
          if(t.indexOf("\t") < 0 && t.indexOf("\n") < 0) return;
          e.preventDefault(); fillFrom(r, c, t);
        });
        tr.appendChild(el(r === 0 ? "th" : "td", {}, [inp]));
      });
      tr.appendChild(el("td", { class: "row-x" }, [r === 0 ? null : el("button", { type: "button", title: "Delete row", "aria-label": "Delete row " + r, onclick: function(){ data.splice(r, 1); build(); output(); } }, ["×"])]));
      (r === 0 ? thead : tbody).appendChild(tr);
    });
    table.appendChild(thead); table.appendChild(tbody);
  }
  function focusCell(r, c){ var i = table.querySelector('input[data-r="' + r + '"][data-c="' + c + '"]'); if(i) i.focus(); }
  function addRow(){ data.push(data[0].map(function(){ return ""; })); build(); output(); }
  function addCol(){ data.forEach(function(r, i){ r.push(i === 0 ? "Column " + (r.length + 1) : ""); }); align.push("left"); build(); output(); }
  function delCol(){ if(data[0].length < 2) return; data.forEach(function(r){ r.pop(); }); align.pop(); build(); output(); }
  function fillFrom(r0, c0, text){
    var rows = text.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").map(function(l){ return l.split("\t"); });
    rows.forEach(function(row, i){
      while(data.length <= r0 + i) data.push(data[0].map(function(){ return ""; }));
      row.forEach(function(v, j){
        while(data[0].length <= c0 + j){ data.forEach(function(rr, k){ rr.push(k === 0 ? "Column " + (rr.length + 1) : ""); }); align.push("left"); }
        data[r0 + i][c0 + j] = v.trim();
      });
    });
    build(); output();
  }
  var importBox = el("textarea", { class: "pane-text", style: "min-height:120px", placeholder: "Paste a markdown table, CSV or cells from a spreadsheet, then press Import" });
  function doImport(){
    var t = importBox.value.trim();
    if(!t) return;
    var rows;
    if(/^\s*\|/.test(t)){
      rows = t.split("\n").filter(function(l){ return l.trim(); }).map(function(l){ return l.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map(function(c){ return c.trim().replace(/\\\|/g, "|"); }); });
      var sep = rows[1] && rows[1].every(function(c){ return /^:?-{1,}:?$/.test(c); });
      if(sep){ align = rows[1].map(function(c){ return /^:-+:$/.test(c) ? "center" : /-:$/.test(c) ? "right" : "left"; }); rows.splice(1, 1); }
    }else rows = t.indexOf("\t") > -1 ? t.split("\n").map(function(l){ return l.split("\t"); }) : parseCSV(t);
    var cols = Math.max.apply(null, rows.map(function(r){ return r.length; }));
    data = rows.map(function(r){ var x = r.map(function(c){ return String(c).trim(); }); while(x.length < cols) x.push(""); return x; });
    while(align.length < cols) align.push("left");
    align = align.slice(0, cols);
    importBox.value = ""; build(); output(); toast("Imported " + data.length + " rows");
  }
  var editor = el("div", { class: "grid-wrap" }, [table]);
  root.appendChild(opts([button("+ Row", addRow), button("+ Column", addCol), button("− Column", delCol),
    button("Clear", function(){ data = data.map(function(r, i){ return r.map(function(c){ return i === 0 ? c : ""; }); }); build(); output(); })]));
  root.appendChild(el("div", { class: "tool-grid single" }, [pane("Table", [], editor)]));
  root.appendChild(el("div", { style: "height:14px" }));
  root.appendChild(grid(
    pane("Markdown", [button("Copy markdown", function(){ copy(result.value, "Markdown table"); }, true), button("Open in editor", function(){ openInEditor(result.value, "table"); })], result),
    pane("Preview", [], preview)));
  root.appendChild(el("div", { style: "height:14px" }));
  root.appendChild(el("div", { class: "tool-grid single" }, [pane("Import", [button("Import", doImport, true)], importBox)]));
  build(); output();
};
function rowsToTableAligned(data, align){
  var rows = data.map(function(r){ return r.map(function(c){ return String(c).replace(/\|/g, "\\|"); }); });
  var width = rows[0].map(function(_, c){ return Math.max(3, Math.max.apply(null, rows.map(function(r){ return (r[c] || "").length; }))); });
  var pad = function(s, w, a){ var n = w - s.length; return a === "right" ? new Array(n + 1).join(" ") + s : a === "center" ? new Array(Math.floor(n / 2) + 1).join(" ") + s + new Array(Math.ceil(n / 2) + 1).join(" ") : s + new Array(n + 1).join(" "); };
  var line = function(r){ return "| " + r.map(function(c, i){ return pad(c || "", width[i], align[i]); }).join(" | ") + " |"; };
  var sep = "| " + width.map(function(w, i){ var a = align[i]; return a === "center" ? ":" + new Array(w - 1).join("-") + ":" : a === "right" ? new Array(w).join("-") + ":" : new Array(w + 1).join("-"); }).join(" | ") + " |";
  return [line(rows[0]), sep].concat(rows.slice(1).map(line)).join("\n") + "\n";
}

/* ---------- Markdown compare ---------- */
TOOLS["compare"] = function(){
  var view = "split", ignoreWs = el("input", { type: "checkbox" });
  var A = "# Launch plan\n\nWe launch the **markdown tools** in October.\n\n- Viewer\n- Editor\n- PDF export\n\nBudget: $2,000\n";
  var B = "# Launch plan\n\nWe launch the **markdown tools** in November.\n\n- Viewer\n- Editor\n- PDF and Word export\n- Table generator\n\nBudget: $2,500\n";
  var left = mdInput({ title: "Original", placeholder: "Paste the original text…", sample: A, onchange: compare });
  var right = mdInput({ title: "Changed", placeholder: "Paste the changed text…", sample: B, onchange: compare });
  var stats = el("div", { class: "diff-stats" });
  var result = el("div", { style: "overflow:auto" });
  function compare(){
    need("diff").then(function(){
      var a = left.ta.value, b = right.ta.value, D = window.Diff;
      var parts = D.diffLines(a, b, { ignoreWhitespace: ignoreWs.checked });
      var rows = [], la = 1, lb = 1, added = 0, removed = 0;
      for(var i=0;i<parts.length;i++){
        var p = parts[i], lines = p.value.replace(/\n$/, "").split("\n");
        if(p.removed && parts[i+1] && parts[i+1].added){
          var q = parts[i+1].value.replace(/\n$/, "").split("\n"), n = Math.max(lines.length, q.length);
          for(var k=0;k<n;k++){
            var l = lines[k], r = q[k], wl = l, wr = r;
            if(l != null && r != null){
              var w = D.diffWordsWithSpace(l, r);
              wl = w.filter(function(x){ return !x.added; }).map(function(x){ return x.removed ? "<del>" + esc(x.value) + "</del>" : esc(x.value); }).join("");
              wr = w.filter(function(x){ return !x.removed; }).map(function(x){ return x.added ? "<ins>" + esc(x.value) + "</ins>" : esc(x.value); }).join("");
            }else{ wl = l == null ? null : esc(l); wr = r == null ? null : esc(r); }
            rows.push({ t: "chg", a: l != null ? la++ : "", b: r != null ? lb++ : "", l: wl, r: wr });
            if(l != null) removed++; if(r != null) added++;
          }
          i++; continue;
        }
        lines.forEach(function(line){
          if(p.added){ rows.push({ t: "add", a: "", b: lb++, l: null, r: esc(line) }); added++; }
          else if(p.removed){ rows.push({ t: "del", a: la++, b: "", l: esc(line), r: null }); removed++; }
          else rows.push({ t: "same", a: la++, b: lb++, l: esc(line), r: esc(line) });
        });
      }
      stats.innerHTML = '<span class="a">+' + added + ' added</span><span class="d">−' + removed + ' removed</span><span>' +
        (added + removed ? "" : "No differences") + "</span>";
      /* collapse long unchanged stretches, keeping three lines of context */
      var shown = rows.map(function(r, i){
        if(r.t !== "same") return true;
        for(var d=-3; d<=3; d++){ var x = rows[i+d]; if(x && x.t !== "same") return true; }
        return false;
      });
      var html = '<table class="diff">', skipping = 0;
      function flushSkip(){ if(skipping){ html += '<tr class="skip"><td colspan="' + (view === "split" ? 4 : 3) + '">' + skipping + " unchanged line" + (skipping > 1 ? "s" : "") + "</td></tr>"; skipping = 0; } }
      rows.forEach(function(r, i){
        if(!shown[i]){ skipping++; return; }
        flushSkip();
        if(view === "split"){
          html += '<tr><td class="ln">' + r.a + '</td><td class="code ' + (r.l != null && r.t !== "same" ? "del" : "") + '">' + (r.l == null ? "" : r.l || " ") +
            '</td><td class="ln">' + r.b + '</td><td class="code ' + (r.r != null && r.t !== "same" ? "add" : "") + '">' + (r.r == null ? "" : r.r || " ") + "</td></tr>";
        }else{
          if(r.t === "same") html += '<tr><td class="ln">' + r.a + '</td><td class="ln">' + r.b + '</td><td class="code">  ' + (r.l || " ") + "</td></tr>";
          else{
            if(r.l != null) html += '<tr><td class="ln">' + r.a + '</td><td class="ln"></td><td class="code del">− ' + (r.l || " ") + "</td></tr>";
            if(r.r != null) html += '<tr><td class="ln"></td><td class="ln">' + r.b + '</td><td class="code add">+ ' + (r.r || " ") + "</td></tr>";
          }
        }
      });
      flushSkip();
      result.innerHTML = html + "</table>";
    });
  }
  ignoreWs.addEventListener("change", compare);
  root.appendChild(opts([el("label", {}, ["View ", seg([["split", "Side by side"], ["inline", "Inline"]], view, function(v){ view = v; compare(); })]), el("label", {}, [ignoreWs, "Ignore whitespace"])]));
  root.appendChild(grid(left.pane, right.pane));
  root.appendChild(el("div", { style: "height:14px" }));
  root.appendChild(el("div", { class: "tool-grid single", style: "min-height:0" }, [pane("Changes", [], el("div", {}, [stats, result]))]));
  left.set(A, "original"); right.set(B, "changed");
};

/* ---------- Discord markdown ---------- */
function discordHTML(src){
  var codes = [];
  var keep = function(html){ codes.push(html); return "\u0000" + (codes.length - 1) + "\u0000"; };
  var s = src.replace(/```(\w+)?\n?([\s\S]*?)```/g, function(m, lang, code){
    var c = esc(code.replace(/\n$/, ""));
    if(window.hljs && lang){ try{ c = window.hljs.highlight(code.replace(/\n$/, ""), { language: lang, ignoreIllegals: true }).value; }catch(e){} }
    return keep("<pre><code>" + c + "</code></pre>");
  }).replace(/`([^`\n]+)`/g, function(m, c){ return keep("<code>" + esc(c) + "</code>"); });
  s = esc(s);
  var inline = function(t){
    return t
      .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>')
      .replace(/(^|[^"'>])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" rel="noopener" target="_blank">$2</a>')
      .replace(/\|\|([\s\S]+?)\|\|/g, '<span class="spoiler" title="Click to reveal">$1</span>')
      .replace(/\*\*\*([\s\S]+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__([\s\S]+?)__/g, "<u>$1</u>")
      .replace(/(^|[^*\w])\*(?!\s)([^*\n]+?)\*(?!\w)/g, "$1<em>$2</em>")
      .replace(/(^|[^_\w])_(?!\s)([^_\n]+?)_(?!\w)/g, "$1<em>$2</em>")
      .replace(/~~([\s\S]+?)~~/g, "<s>$1</s>");
  };
  var lines = s.split("\n"), out = [], i = 0;
  while(i < lines.length){
    var l = lines[i], m;
    if(/^&gt;&gt;&gt; /.test(l)){ out.push('<div class="q">' + inline([l.slice(13)].concat(lines.slice(i + 1)).join("\n")) + "</div>"); break; }
    if(/^&gt; /.test(l)){ var q = []; while(i < lines.length && /^&gt; /.test(lines[i])){ q.push(lines[i].slice(5)); i++; } out.push('<div class="q">' + inline(q.join("\n")) + "</div>"); continue; }
    if((m = l.match(/^(#{1,3}) (.+)$/))){ out.push("<h" + m[1].length + ">" + inline(m[2]) + "</h" + m[1].length + ">"); i++; continue; }
    if((m = l.match(/^-# (.+)$/))){ out.push('<div class="sub">' + inline(m[1]) + "</div>"); i++; continue; }
    if(/^\s*([-*]|\d+\.) /.test(l)){
      var ordered = /^\s*\d+\./.test(l), items = [];
      while(i < lines.length && /^\s*([-*]|\d+\.) /.test(lines[i])){ items.push("<li>" + inline(lines[i].replace(/^\s*([-*]|\d+\.) /, "")) + "</li>"); i++; }
      out.push((ordered ? "<ol>" : "<ul>") + items.join("") + (ordered ? "</ol>" : "</ul>")); continue;
    }
    out.push(inline(l)); i++;
  }
  return out.join("\n").replace(/\n(?=<(h\d|div|ul|ol|pre))/g, "").replace(/(<\/(h\d|div|ul|ol)>)\n/g, "$1").replace(/\u0000(\d+)\u0000/g, function(m, n){ return codes[+n]; });
}
TOOLS["discord"] = function(){
  var sample = "# Patch notes 🎉\n**New:** the markdown tools are live!\n\n> Try them at https://markdown.digitum.marketing\n\n- Markdown to PDF\n- Paste to Markdown\n- __Discord__ preview, of course\n\nSpoiler: ||there is a dark mode||\n-# posted by the Digitum team\n\n```js\nconsole.log(\"hello Discord\");\n```";
  var body = el("div", { class: "body" });
  var count = el("span");
  var preview = el("div", { class: "discord" }, [el("div", { class: "msg" }, [el("div", { class: "ava", text: "D" }), el("div", { style: "min-width:0;flex:1" }, [el("div", {}, [el("span", { class: "who", text: "You" }), el("span", { class: "when", text: "Today at 10:24" })]), body])])]);
  preview.addEventListener("click", function(e){ if(e.target.classList.contains("spoiler")) e.target.classList.toggle("open"); });
  var ta;
  var input = mdInput({ title: "Message", placeholder: "Type a Discord message…", sample: sample, sampleName: "message", onchange: function(v){
    setHTML(body, discordHTML(v));
    count.textContent = v.length.toLocaleString() + " / 2,000 characters" + (v.length > 2000 ? " – too long for one message" : "");
    count.style.color = v.length > 2000 ? "var(--bad)" : "";
    if(/```\w+/.test(v)) need("hljs").then(function(){ setHTML(body, discordHTML(v)); }).catch(function(){});
  } });
  ta = input.ta;
  function wrapSel(mark){
    var s = ta.selectionStart, e = ta.selectionEnd, v = ta.value, sel = v.slice(s, e) || "text";
    ta.focus(); ta.setSelectionRange(s, e);
    var ins = mark + sel + mark;
    if(!document.execCommand("insertText", false, ins)){ ta.value = v.slice(0, s) + ins + v.slice(e); }
    ta.setSelectionRange(s + mark.length, s + mark.length + sel.length);
    input.fire();
  }
  root.appendChild(opts([["**", "Bold"], ["*", "Italic"], ["__", "Underline"], ["~~", "Strike"], ["||", "Spoiler"], ["`", "Code"]].map(function(b){
    return button(b[1], function(){ wrapSel(b[0]); });
  })));
  root.appendChild(grid(input.pane, pane("Discord preview", [button("Copy message", function(){ copy(ta.value, "Message"); }, true)], el("div", { class: "pane-body", style: "padding:0;background:#313338" }, [preview]), el("div", { class: "pane-foot" }, [count]))));
  input.set(sample, "message");
};

/* ---------- Obsidian markdown ---------- */
var CALLOUTS = {
  note: ["#448AFF", "✎"], abstract: ["#00B0FF", "☰"], summary: ["#00B0FF", "☰"], tldr: ["#00B0FF", "☰"], info: ["#00B8D4", "ℹ"],
  todo: ["#00B8D4", "☑"], tip: ["#00BFA5", "🔥"], hint: ["#00BFA5", "🔥"], important: ["#00BFA5", "🔥"], success: ["#00C853", "✔"],
  check: ["#00C853", "✔"], done: ["#00C853", "✔"], question: ["#FF9100", "?"], help: ["#FF9100", "?"], faq: ["#FF9100", "?"],
  warning: ["#FF9100", "⚠"], caution: ["#FF9100", "⚠"], attention: ["#FF9100", "⚠"], failure: ["#FF5252", "✖"], fail: ["#FF5252", "✖"],
  missing: ["#FF5252", "✖"], danger: ["#FF1744", "⚡"], error: ["#FF1744", "⚡"], bug: ["#F50057", "🐞"], example: ["#7C4DFF", "☷"],
  quote: ["#9E9E9E", "❝"], cite: ["#9E9E9E", "❝"]
};
function obsidianHTML(src, target){
  var props = "";
  src = src.replace(/^---\n([\s\S]*?)\n---\n?/, function(m, yaml){
    var rows = yaml.split("\n").filter(function(l){ return /^[\w -]+:/.test(l); }).map(function(l){
      var i = l.indexOf(":"); return "<tr><td>" + esc(l.slice(0, i).trim()) + "</td><td>" + esc(l.slice(i + 1).trim().replace(/^["']|["']$/g, "")) + "</td></tr>";
    });
    props = rows.length ? '<table class="props"><tbody>' + rows.join("") + "</tbody></table>" : "";
    return "";
  });
  src = src.replace(/%%[\s\S]*?%%/g, "");
  /* leave code alone while rewriting Obsidian syntax */
  var keep = [];
  src = src.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, function(m){ keep.push(m); return "\u0001" + (keep.length - 1) + "\u0001"; });
  src = src
    .replace(/!\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g, function(m, n){ return /\.(png|jpe?g|gif|webp|svg)$/i.test(n) ? '<span class="embed">🖼 Embedded image: ' + esc(n) + "</span>" : '<span class="embed">↪ Embedded note: ' + esc(n) + "</span>"; })
    .replace(/\[\[([^\]|#]+)(#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, function(m, n, h, alias){ return '<a class="wikilink" href="#" title="' + esc(n + (h || "")) + '">' + esc(alias || (n + (h ? " › " + h.slice(1) : ""))) + "</a>"; })
    .replace(/==([^=\n]+)==/g, "<mark>$1</mark>")
    .replace(/(^|[\s(])#([A-Za-z][\w/-]*)/g, function(m, pre, tag){ return pre + '<span class="tag">#' + tag + "</span>"; })
    .replace(/\u0001(\d+)\u0001/g, function(m, i){ return keep[+i]; });
  return renderMD(src, target).then(function(){
    if(props) target.insertAdjacentHTML("afterbegin", props);
    Array.prototype.forEach.call(target.querySelectorAll("blockquote"), function(bq){
      var p = bq.firstElementChild;
      if(!p || p.nodeName !== "P") return;
      var m = p.innerHTML.match(/^\[!(\w+)\]([+-])?\s*([^\n<]*)(?:<br>|\n)?/);
      if(!m) return;
      var type = m[1].toLowerCase(), c = CALLOUTS[type] || CALLOUTS.note;
      var title = m[3].trim() || type.charAt(0).toUpperCase() + type.slice(1);
      p.innerHTML = p.innerHTML.slice(m[0].length);
      if(!p.textContent.trim() && !p.querySelector("*")) p.remove();
      var box = document.createElement(m[2] ? "details" : "div");
      box.className = "callout"; box.style.setProperty("--c", c[0]);
      if(m[2] === "+") box.open = true;
      var head = document.createElement(m[2] ? "summary" : "div");
      head.className = "callout-title"; head.setAttribute("data-icon", c[1]); head.textContent = title;
      var inner = document.createElement("div");
      while(bq.firstChild) inner.appendChild(bq.firstChild);
      box.appendChild(head); box.appendChild(inner);
      bq.replaceWith(box);
    });
    Array.prototype.forEach.call(target.querySelectorAll("a.wikilink"), function(a){ a.addEventListener("click", function(e){ e.preventDefault(); }); });
  });
}
TOOLS["obsidian"] = function(){
  var sample = "---\ntitle: Weekly review\ntags: [review, marketing]\ndate: 2026-10-06\n---\n\n# Weekly review\n\nLinked to [[Marketing plan]] and [[Q4 goals|this quarter's goals]]. #review\n\n> [!tip] Win of the week\n> The ==markdown tools== went live and got the first backlinks.\n\n> [!warning]- Watch out\n> Search Console still needs the sitemap.\n\n- [x] Ship tools\n- [ ] Write the launch post\n\n%% private note: ask about budget %%\n\n![[dashboard.png]]\n";
  var preview = el("div", { class: "pane-body md" });
  var input = mdInput({ title: "Obsidian note", sample: sample, sampleName: "note", onchange: function(v){ obsidianHTML(v, preview); } });
  root.appendChild(grid(input.pane, pane("Reading view", [button("Open in editor", function(){ openInEditor(input.ta.value, input.name.v); }, true)], preview)));
  input.set(sample, "weekly-review");
};

/* ---------- GitHub README viewer ---------- */
TOOLS["github"] = function(){
  var repo = el("input", { type: "text", placeholder: "owner/repo or a GitHub link", "aria-label": "Repository", style: "min-width:320px", value: "" });
  var branch = el("input", { type: "text", placeholder: "branch (optional)", "aria-label": "Branch", style: "width:170px" });
  var preview = el("div", { class: "pane-body md" }, [el("div", { class: "empty-note", text: "Enter a repository to read its README." })]);
  var meta = el("span", { class: "pane-title", style: "text-transform:none;letter-spacing:0" });
  var current = { md: "", name: "README" };
  function parse(v){
    v = v.trim().replace(/\.git$/, "");
    var m = v.match(/github\.com\/([^\/\s]+)\/([^\/\s#?]+)(?:\/(?:blob|tree)\/([^\/\s]+)(\/[^\s#?]*)?)?/i) ||
            v.match(/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)(\/[^\s#?]*)/i);
    if(m) return { owner: m[1], repo: m[2], ref: m[3] || branch.value.trim(), path: m[4] ? m[4].slice(1) : "" };
    m = v.match(/^([\w.-]+)\/([\w.-]+)$/);
    return m ? { owner: m[1], repo: m[2], ref: branch.value.trim(), path: "" } : null;
  }
  function load(){
    var r = parse(repo.value);
    if(!r) return toast("Enter owner/repo, like facebook/react");
    preview.innerHTML = '<div class="empty-note">Loading…</div>';
    var api = "https://api.github.com/repos/" + r.owner + "/" + r.repo + (r.path && /\.(md|markdown|mdx)$/i.test(r.path) ? "/contents/" + r.path : "/readme" + (r.path ? "/" + r.path : "")) + (r.ref ? "?ref=" + encodeURIComponent(r.ref) : "");
    fetch(api, { headers: { Accept: "application/vnd.github+json" } }).then(function(res){
      if(res.status === 404) throw new Error("No README found. Check the name, and that the repository is public.");
      if(res.status === 403) throw new Error("GitHub's rate limit was reached. Try again in a few minutes.");
      if(!res.ok) throw new Error("GitHub answered " + res.status + ".");
      return res.json();
    }).then(function(j){
      var bytes = Uint8Array.from(atob(j.content.replace(/\n/g, "")), function(c){ return c.charCodeAt(0); });
      var md = new TextDecoder().decode(bytes);
      var dl = j.download_url || "", ref = (dl.match(/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/([^\/]+)\//) || [])[1] || r.ref || "HEAD";
      var dir = j.path.indexOf("/") > -1 ? j.path.slice(0, j.path.lastIndexOf("/") + 1) : "";
      var rawBase = "https://raw.githubusercontent.com/" + r.owner + "/" + r.repo + "/" + ref + "/" + dir;
      var blobBase = "https://github.com/" + r.owner + "/" + r.repo + "/blob/" + ref + "/" + dir;
      current = { md: md, name: r.repo + "-README" };
      meta.textContent = r.owner + "/" + r.repo + " · " + j.path;
      return renderMD(md, preview).then(function(){
        Array.prototype.forEach.call(preview.querySelectorAll("img[src]"), function(img){
          var s = img.getAttribute("src");
          if(!/^(https?:|data:|\/\/)/i.test(s)) img.src = rawBase + s.replace(/^\.?\//, "");
          else if(/github\.com\/[^\/]+\/[^\/]+\/blob\//.test(s)) img.src = s.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
        });
        Array.prototype.forEach.call(preview.querySelectorAll("a[href]"), function(a){
          var h = a.getAttribute("href");
          if(h.charAt(0) === "#") return;
          if(!/^(https?:|mailto:|\/\/)/i.test(h)) a.href = blobBase + h.replace(/^\.?\//, "");
          a.target = "_blank"; a.rel = "noopener";
        });
        history.replaceState(null, "", "?repo=" + encodeURIComponent(r.owner + "/" + r.repo) + (r.ref ? "&ref=" + encodeURIComponent(r.ref) : ""));
      });
    }).catch(function(e){ preview.innerHTML = '<div class="error-note">' + esc(e.message) + "</div>"; });
  }
  repo.addEventListener("keydown", function(e){ if(e.key === "Enter") load(); });
  branch.addEventListener("keydown", function(e){ if(e.key === "Enter") load(); });
  root.appendChild(opts([repo, branch, button("Load README", load, true),
    el("span", { style: "color:var(--muted)" }, ["Try: ", el("a", { href: "?repo=facebook/react", text: "facebook/react" }), ", ", el("a", { href: "?repo=microsoft/vscode", text: "microsoft/vscode" })])]));
  root.appendChild(el("div", { class: "tool-grid single" }, [pane("README", [meta,
    button("Copy markdown", function(){ if(current.md) copy(current.md, "Markdown"); }),
    button("Open in editor", function(){ if(current.md) openInEditor(current.md, current.name); }, true)], preview)]));
  var q = new URLSearchParams(location.search);
  if(q.get("repo")){ repo.value = q.get("repo"); if(q.get("ref")) branch.value = q.get("ref"); load(); }
};

/* ---------- Mermaid live editor ---------- */
var MERMAID_EXAMPLES = {
  Flowchart: "flowchart LR\n  A[Visitor] --> B{Finds a tool?}\n  B -- Yes --> C[Uses it]\n  C --> D[Becomes a lead]\n  B -- No --> E[Leaves]",
  Sequence: "sequenceDiagram\n  participant U as User\n  participant T as Tool\n  U->>T: Paste markdown\n  T-->>U: Live preview\n  U->>T: Export PDF\n  T-->>U: File downloaded",
  Class: "classDiagram\n  class Document {\n    +String title\n    +String text\n    +render()\n  }\n  class Export {\n    +toPDF()\n    +toHTML()\n  }\n  Document --> Export",
  State: "stateDiagram-v2\n  [*] --> Draft\n  Draft --> Review\n  Review --> Draft: changes\n  Review --> Published\n  Published --> [*]",
  Gantt: "gantt\n  title Launch\n  dateFormat YYYY-MM-DD\n  section Build\n  Tools      :a1, 2026-10-01, 10d\n  SEO        :after a1, 5d\n  section Grow\n  Outreach   :2026-10-16, 14d",
  Pie: "pie title Traffic sources\n  \"Organic\" : 58\n  \"Direct\" : 22\n  \"Referral\" : 12\n  \"Social\" : 8",
  Mindmap: "mindmap\n  root((Marketing))\n    SEO\n      On-page\n      Links\n    Content\n      Guides\n      Tools\n    Paid",
  Timeline: "timeline\n  title Digitum\n  2025 : Agency founded\n  2026 : Brand kit\n       : Markdown tools"
};
TOOLS["mermaid"] = function(){
  var canvas = el("div", { class: "canvas" }), err = el("div", { class: "error-note", hidden: true });
  var theme = el("select", { "aria-label": "Theme" }, ["default", "neutral", "dark", "forest"].map(function(t){ return el("option", { value: t, text: t.charAt(0).toUpperCase() + t.slice(1) }); }));
  var example = el("select", { "aria-label": "Example" }, [el("option", { value: "", text: "Load an example…" })].concat(Object.keys(MERMAID_EXAMPLES).map(function(k){ return el("option", { value: k, text: k }); })));
  var n = 0, svgText = "";
  var input = mdInput({ title: "Mermaid", placeholder: "flowchart LR\n  A --> B", accept: ".mmd,.mermaid,.txt,.md", onchange: draw });
  function draw(){
    var code = input.ta.value.trim();
    if(!code){ canvas.innerHTML = ""; return; }
    need("mermaid").then(function(){
      window.mermaid.initialize({ startOnLoad: false, theme: theme.value, securityLevel: "strict" });
      return window.mermaid.render("mmd" + (++n), code);
    }).then(function(r){ svgText = r.svg; setHTML(canvas, r.svg); err.hidden = true; })
      .catch(function(e){ err.hidden = false; err.textContent = (e && (e.str || e.message)) || "This diagram has a syntax error."; var junk = document.getElementById("dmmd" + n); if(junk) junk.remove(); });
  }
  theme.addEventListener("change", draw);
  example.addEventListener("change", function(){ if(example.value){ input.set(MERMAID_EXAMPLES[example.value], example.value.toLowerCase()); example.value = ""; } });
  root.appendChild(opts([el("label", {}, [example]), el("label", {}, ["Theme ", theme])]));
  root.appendChild(grid(input.pane, pane("Diagram", [
    button("Download SVG", function(){ if(svgText) download(svgText, input.name.v + ".svg", "image/svg+xml"); }, true),
    button("Download PNG", function(){ if(svgText){ var svg = canvas.querySelector("svg"), b = svg.getBBox(); var c = svg.cloneNode(true); c.setAttribute("width", Math.ceil(b.width + b.x + 16)); c.setAttribute("height", Math.ceil(b.height + b.y + 16)); svgToPng(new XMLSerializer().serializeToString(c), input.name.v + ".png"); } }),
    button("Copy as markdown", function(){ copy("```mermaid\n" + input.ta.value.trim() + "\n```\n", "Markdown"); })
  ], el("div", { style: "display:flex;flex-direction:column;flex:1" }, [err, canvas]))));
  input.set(MERMAID_EXAMPLES.Flowchart, "flowchart");
};

/* ================= tables and data ================= */

/* ---------- CSV to Markdown: the spreadsheet tool, CSV first ---------- */
TOOLS["csv-md"] = function(){ TOOLS["xlsx-md"]({ csv: true }); };

/* ---------- Markdown to CSV ---------- */
function csvLine(r, sep){
  return r.map(function(c){ c = String(c); return new RegExp('["\\n' + (sep === "\t" ? "\\t" : sep) + "]").test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(sep);
}
TOOLS["md-csv"] = function(){
  var tables = [], sep = ",";
  var result = el("textarea", { class: "pane-text", readonly: true, "aria-label": "CSV result" });
  var pick = el("select", { "aria-label": "Table" });
  var input = mdInput({ sample: SAMPLE_MD, sampleName: "report", onchange: function(md){
    need("marked").then(function(){
      tables = mdTables(md);
      var keep = +pick.value || 0;
      pick.innerHTML = "";
      tables.forEach(function(t, i){ pick.appendChild(el("option", { value: i, text: "Table " + (i + 1) + (t.name ? " – " + t.name : "") })); });
      pick.value = Math.min(keep, Math.max(0, tables.length - 1));
      show();
    });
  } });
  function show(){
    var t = tables[+pick.value || 0];
    result.value = t ? t.rows.map(function(r){ return csvLine(r, sep); }).join("\n") + "\n" : "";
    if(!t && input.ta.value.trim()) result.value = "No markdown table found.";
  }
  pick.addEventListener("change", show);
  root.appendChild(opts([el("label", {}, ["Table ", pick]), el("label", {}, ["Separator ", seg([[",", "Comma"], [";", "Semicolon"], ["\t", "Tab"]], sep, function(v){ sep = v; show(); })])]));
  root.appendChild(grid(input.pane, pane("CSV", [
    button("Copy", function(){ if(tables.length) copy(result.value, "CSV"); }),
    button("Download .csv", function(){ if(tables.length) download("\ufeff" + result.value, input.name.v + (sep === "\t" ? ".tsv" : ".csv"), "text/csv;charset=utf-8"); }, true)
  ], result)));
  input.set(SAMPLE_MD, "report");
};

/* ---------- JSON to Markdown ---------- */
function jsonToMarkdown(v, mode){
  function cell(x){
    if(x === null || x === undefined) return "";
    if(typeof x === "object") return JSON.stringify(x);
    return String(x);
  }
  function isRecords(a){ return Array.isArray(a) && a.length && a.every(function(o){ return o && typeof o === "object" && !Array.isArray(o); }); }
  function table(arr){
    var keys = [];
    arr.forEach(function(o){ Object.keys(o).forEach(function(k){ if(keys.indexOf(k) < 0) keys.push(k); }); });
    return rowsToTable([keys].concat(arr.map(function(o){ return keys.map(function(k){ return cell(o[k]); }); })), { header: true, align: "auto" });
  }
  function list(x, depth){
    var pad = new Array(depth + 1).join("  ");
    if(Array.isArray(x)){
      if(!x.length) return pad + "- *(empty)*\n";
      return x.map(function(item, i){
        return typeof item === "object" && item !== null ? pad + "- **" + (i + 1) + "**\n" + list(item, depth + 1) : pad + "- " + cell(item) + "\n";
      }).join("");
    }
    if(x && typeof x === "object"){
      return Object.keys(x).map(function(k){
        var val = x[k];
        if(val && typeof val === "object") return pad + "- **" + k + "**\n" + list(val, depth + 1);
        return pad + "- **" + k + ":** " + cell(val) + "\n";
      }).join("");
    }
    return pad + "- " + cell(x) + "\n";
  }
  function section(x, level){
    if(mode === "list") return list(x, 0);
    if(isRecords(x)) return table(x);
    if(Array.isArray(x)) return list(x, 0);
    if(x && typeof x === "object"){
      var scalars = Object.keys(x).filter(function(k){ return x[k] === null || typeof x[k] !== "object"; });
      var out = "";
      if(scalars.length) out += rowsToTable([["Key", "Value"]].concat(scalars.map(function(k){ return [k, cell(x[k])]; })), { header: true, align: "left" }) + "\n";
      Object.keys(x).filter(function(k){ return scalars.indexOf(k) < 0; }).forEach(function(k){
        out += new Array(Math.min(level, 6) + 1).join("#") + " " + k + "\n\n" + section(x[k], level + 1) + "\n";
      });
      return out;
    }
    return cell(x) + "\n";
  }
  return section(v, 2).replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
TOOLS["json-md"] = function(){
  var mode = "auto", out = mdOutput(function(){ return input.name.v; });
  var sample = JSON.stringify({ campaign: "Autumn launch", budget: 2500, active: true,
    channels: [{ name: "SEO", visits: 12400, leads: 310 }, { name: "Ads", visits: 5200, leads: 145 }, { name: "Email", visits: 2100, leads: 88 }],
    owner: { name: "Digitum", site: "https://digitum.marketing" } }, null, 2);
  var input = mdInput({ title: "JSON", placeholder: "Paste JSON here…", accept: ".json,application/json,.txt", sample: sample, sampleName: "data", onchange: convert });
  function convert(){
    var t = input.ta.value.trim();
    if(!t) return out.set("");
    try{ out.set(jsonToMarkdown(JSON.parse(t), mode)); }
    catch(e){ out.note('<div class="error-note">Not valid JSON: ' + esc(e.message) + "</div>"); }
  }
  root.appendChild(opts([el("label", {}, ["Layout ", seg([["auto", "Tables where possible"], ["list", "Nested list"]], mode, function(v){ mode = v; convert(); })])]));
  root.appendChild(grid(input.pane, out.pane));
  input.set(sample, "data");
};

/* ---------- Table to Markdown: paste a table from anywhere ---------- */
TOOLS["table-md"] = function(){
  var out = mdOutput(function(){ return "table"; });
  var header = el("input", { type: "checkbox", checked: true });
  var align = el("select", { "aria-label": "Alignment" }, [["auto", "Numbers right"], ["left", "Left"], ["center", "Centre"], ["right", "Right"]].map(function(o){ return el("option", { value: o[0], text: o[1] }); }));
  var rows = null;
  var zone = el("div", { class: "paste-zone md", contenteditable: "true", role: "textbox", "aria-label": "Paste a table here",
    "data-placeholder": "Click here and paste a table copied from a web page, Excel, Google Sheets, Word, Notion or a PDF…" });
  function render(){ out.set(rows && rows.length ? rowsToTable(rows, { header: header.checked, align: align.value }) : ""); }
  function fromHTML(html){
    var tpl = document.createElement("template");
    tpl.innerHTML = html; sanitize(tpl.content);
    var t = tpl.content.querySelector("table");
    if(!t) return null;
    return Array.prototype.map.call(t.querySelectorAll("tr"), function(tr){
      var cells = [];
      Array.prototype.forEach.call(tr.children, function(td){
        var span = +td.getAttribute("colspan") || 1, txt = td.textContent.replace(/\s+/g, " ").trim();
        for(var i=0;i<span;i++) cells.push(i ? "" : txt);
      });
      return cells;
    });
  }
  function fromText(t){
    t = t.replace(/\r\n?/g, "\n").replace(/\n+$/, "");
    if(/^\s*\|/.test(t)) return t.split("\n").filter(function(l){ return l.trim() && !/^\s*\|?\s*:?-{2,}/.test(l); }).map(function(l){ return l.trim().replace(/^\||\|$/g, "").split("|").map(function(c){ return c.trim(); }); });
    if(t.indexOf("\t") > -1) return t.split("\n").map(function(l){ return l.split("\t"); });
    if(/,/.test(t)) return parseCSV(t);
    return t.split("\n").map(function(l){ return l.trim().split(/\s{2,}/); });
  }
  zone.addEventListener("paste", function(e){
    e.preventDefault();
    var html = e.clipboardData.getData("text/html"), text = e.clipboardData.getData("text/plain");
    rows = (html && fromHTML(html)) || fromText(text || "");
    zone.innerHTML = "";
    var preview = document.createElement("div");
    setHTML(preview, "<p><strong>Pasted " + rows.length + " row" + (rows.length === 1 ? "" : "s") + ".</strong> Paste again to replace it.</p>");
    zone.appendChild(preview);
    render();
  });
  [header, align].forEach(function(c){ c.addEventListener("change", render); });
  root.appendChild(opts([el("label", {}, [header, "First row is the header"]), el("label", {}, ["Alignment ", align]),
    el("span", { style: "color:var(--muted)" }, ["Need to edit cells? Use the ", el("a", { href: "/markdown-table-generator", text: "table generator" }), "."])]));
  root.appendChild(grid(pane("Paste a table", [button("Clear", function(){ zone.innerHTML = ""; rows = null; render(); zone.focus(); })], zone), out.pane));
};

/* ================= books and documents ================= */

/* ---------- EPUB to Markdown ---------- */
TOOLS["epub-md"] = function(){
  var name = "book", out = mdOutput(function(){ return name; }), prog = progressBar();
  var fi = fileInput({ title: "EPUB", label: "Open an .epub ebook", button: "Open EPUB", accept: ".epub,application/epub+zip", onfile: function(f){
    name = baseName(f.name);
    prog.set("Opening the book…", 0);
    Promise.all([need("jszip"), turndown(), readFile(f, "buffer")]).then(function(r){
      return epubToMarkdown(r[2], r[1](), function(i, n){ prog.set("Converting chapter " + i + " of " + n, i / n); });
    }).then(function(md){ prog.done(); out.set(md); })
      .catch(function(e){ prog.done(); out.note('<div class="error-note">' + esc(e.message || "Could not read this ebook.") + "</div>"); });
  } });
  prog.els.forEach(function(e){ fi.extra.appendChild(e); });
  root.appendChild(grid(fi.pane, out.pane));
};
function epubToMarkdown(buf, td, onchapter){
  var parser = new DOMParser();
  return window.JSZip.loadAsync(buf).then(function(zip){
    var file = function(p){ var f = zip.file(p) || zip.file(decodeURIComponent(p)); if(!f) throw new Error("This EPUB is missing " + p); return f.async("string"); };
    return file("META-INF/container.xml").then(function(c){
      var opfPath = parser.parseFromString(c, "application/xml").querySelector("rootfile").getAttribute("full-path");
      var dir = opfPath.indexOf("/") > -1 ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1) : "";
      return file(opfPath).then(function(opfText){
        var opf = parser.parseFromString(opfText, "application/xml");
        var title = (opf.getElementsByTagName("dc:title")[0] || {}).textContent || "";
        var author = (opf.getElementsByTagName("dc:creator")[0] || {}).textContent || "";
        var items = {};
        Array.prototype.forEach.call(opf.getElementsByTagName("item"), function(i){ items[i.getAttribute("id")] = i.getAttribute("href"); });
        var spine = Array.prototype.map.call(opf.getElementsByTagName("itemref"), function(r){ return items[r.getAttribute("idref")]; }).filter(Boolean);
        var parts = [], i = 0;
        var chain = spine.reduce(function(p, href){
          return p.then(function(){
            onchapter(++i, spine.length);
            return file(dir + href.split("#")[0]).then(function(x){
              var d = parser.parseFromString(x, "application/xhtml+xml");
              if(d.querySelector("parsererror")) d = parser.parseFromString(x, "text/html");
              var body = d.body || d.documentElement;
              Array.prototype.forEach.call(body.querySelectorAll("img, image"), function(im){ im.replaceWith(document.createTextNode(im.getAttribute("alt") ? "[" + im.getAttribute("alt") + "]" : "")); });
              var md = td.turndown(body.innerHTML || new XMLSerializer().serializeToString(body)).trim();
              if(md) parts.push(md);
            });
          });
        }, Promise.resolve());
        return chain.then(function(){
          /* skip the metadata title when the first chapter already opens with it */
          var t = title.trim(), first = (parts[0] || "").split("\n")[0].replace(/^#+\s*/, "").trim();
          var head = (t && first !== t ? "# " + t + "\n\n" : "") + (author ? "*" + author.trim() + "*\n\n" : "");
          return head + parts.join("\n\n---\n\n") + "\n";
        });
      });
    });
  });
}

/* ---------- Markdown to EPUB ---------- */
TOOLS["md-epub"] = function(){
  var title = el("input", { type: "text", "aria-label": "Book title", placeholder: "Book title", style: "min-width:220px" });
  var author = el("input", { type: "text", "aria-label": "Author", placeholder: "Author", style: "min-width:180px" });
  var preview = el("div", { class: "pane-body md" });
  var chapters = el("span", { class: "pane-title", style: "text-transform:none;letter-spacing:0" });
  var sample = "# The Markdown Book\n\nA short book written in markdown.\n\n# Chapter one\n\nEvery `#` heading starts a new chapter.\n\n- Lists work\n- So do **bold** and *italic*\n\n# Chapter two\n\n> Quotes, tables and code all carry over.\n\n| Format | Good for |\n| --- | --- |\n| EPUB | E-readers |\n";
  var input = mdInput({ sample: sample, sampleName: "book", onchange: function(md){
    renderMD(md, preview);
    var n = (md.match(/^# /gm) || []).length;
    chapters.textContent = Math.max(1, n) + " chapter" + (n === 1 ? "" : "s");
    var h = md.match(/^# (.+)$/m);
    if(h && !title.dataset.touched) title.value = h[1].trim();
  } });
  title.addEventListener("input", function(){ title.dataset.touched = "1"; });
  root.appendChild(opts([el("label", {}, ["Title ", title]), el("label", {}, ["Author ", author])]));
  root.appendChild(grid(input.pane, pane("Preview", [chapters, button("Download .epub", function(){
    if(!input.ta.value.trim()) return toast("Add some markdown first");
    need("marked", "jszip").then(function(){ return buildEpub(input.ta.value, title.value || input.name.v, author.value); })
      .then(function(b){ download(b, (title.value || input.name.v).replace(/[\\\/:*?"<>|]+/g, "-") + ".epub"); })
      .catch(function(e){ toast("Could not build the EPUB. " + e.message); });
  }, true)], preview)));
  input.set(sample, "book");
};
function xhtml(html){
  /* marked's HTML, made well-formed for EPUB readers */
  var d = document.implementation.createHTMLDocument("");
  d.body.innerHTML = html;
  sanitize(d.body);
  return new XMLSerializer().serializeToString(d.body).replace(/^<body[^>]*>|<\/body>$/g, "");
}
function buildEpub(md, title, author){
  var id = "urn:uuid:" + (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
  /* split on # headings into chapters; text before the first one is a preface */
  var parts = md.split(/^(?=# )/m).filter(function(p){ return p.trim(); });
  var chapters = parts.map(function(p, i){
    var h = p.match(/^# (.+)$/m);
    return { title: h ? h[1].replace(/[*_`]/g, "").trim() : (i ? "Chapter " + (i + 1) : "Introduction"), html: xhtml(window.marked.parse(p, { gfm:true })) };
  });
  var css = "body{font-family:serif;line-height:1.5;margin:0 5%}h1,h2,h3{font-family:sans-serif;line-height:1.2}pre{white-space:pre-wrap;font-size:.85em;background:#f4f1ea;padding:.6em}code{font-family:monospace}blockquote{margin:1em 0;padding-left:1em;border-left:3px solid #c8ff00}table{border-collapse:collapse}th,td{border:1px solid #ccc;padding:.3em .5em}img{max-width:100%}";
  var page = function(t, body){
    return '<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><meta charset="utf-8"/><title>' + xml(t) + '</title><link rel="stylesheet" href="style.css"/></head><body>' + body + "</body></html>";
  };
  var zip = new window.JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE", createFolders: false });
  zip.file("META-INF/container.xml", '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>', { createFolders: false });
  zip.file("OEBPS/style.css", css, { createFolders: false });
  chapters.forEach(function(c, i){ zip.file("OEBPS/ch" + (i + 1) + ".xhtml", page(c.title, c.html), { createFolders: false }); });
  zip.file("OEBPS/nav.xhtml", page("Contents", '<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>' +
    chapters.map(function(c, i){ return '<li><a href="ch' + (i + 1) + '.xhtml">' + xml(c.title) + "</a></li>"; }).join("") + "</ol></nav>"), { createFolders: false });
  zip.file("OEBPS/toc.ncx", '<?xml version="1.0" encoding="UTF-8"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="' + id + '"/></head><docTitle><text>' + xml(title) + "</text></docTitle><navMap>" +
    chapters.map(function(c, i){ return '<navPoint id="n' + (i + 1) + '" playOrder="' + (i + 1) + '"><navLabel><text>' + xml(c.title) + '</text></navLabel><content src="ch' + (i + 1) + '.xhtml"/></navPoint>'; }).join("") + "</navMap></ncx>", { createFolders: false });
  var modified = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  zip.file("OEBPS/content.opf", '<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/">' +
    '<dc:identifier id="bookid">' + id + "</dc:identifier><dc:title>" + xml(title) + "</dc:title><dc:language>en</dc:language>" + (author ? "<dc:creator>" + xml(author) + "</dc:creator>" : "") +
    '<meta property="dcterms:modified">' + modified + '</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/><item id="css" href="style.css" media-type="text/css"/>' +
    chapters.map(function(c, i){ return '<item id="ch' + (i + 1) + '" href="ch' + (i + 1) + '.xhtml" media-type="application/xhtml+xml"/>'; }).join("") +
    '</manifest><spine toc="ncx">' + chapters.map(function(c, i){ return '<itemref idref="ch' + (i + 1) + '"/>'; }).join("") + "</spine></package>", { createFolders: false });
  return zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
}

/* ---------- LaTeX to Markdown ---------- */
function latexToMarkdown(src){
  var keep = [];
  var stash = function(s){ keep.push(s); return "\u0002" + (keep.length - 1) + "\u0002"; };
  var s = src.replace(/\r\n?/g, "\n");
  s = s.replace(/(^|[^\\])%.*$/gm, "$1");                          /* comments */
  var title = (s.match(/\\title\{([^}]*)\}/) || [])[1], author = (s.match(/\\author\{([^}]*)\}/) || [])[1];
  var bodyM = s.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  if(bodyM) s = bodyM[1];
  /* code and maths are kept verbatim */
  s = s.replace(/\\begin\{(verbatim|lstlisting|minted)\}(?:\[[^\]]*\])?(?:\{([^}]*)\})?\n?([\s\S]*?)\\end\{\1\}/g, function(m, env, lang, code){ return stash("```" + (env === "minted" && lang ? lang : "") + "\n" + code.replace(/\n$/, "") + "\n```"); });
  s = s.replace(/\\begin\{(equation|align|gather|displaymath|multline)\*?\}([\s\S]*?)\\end\{\1\*?\}/g, function(m, env, body){ return stash("$$\n" + (env.indexOf("align") === 0 ? "\\begin{aligned}" + body.trim() + "\\end{aligned}" : body.trim()) + "\n$$"); });
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, function(m, b){ return stash("$$\n" + b.trim() + "\n$$"); });
  s = s.replace(/\$\$([\s\S]*?)\$\$/g, function(m, b){ return stash("$$\n" + b.trim() + "\n$$"); });
  s = s.replace(/\\\(([\s\S]*?)\\\)/g, function(m, b){ return stash("$" + b.trim() + "$"); });
  s = s.replace(/\$([^$\n]+)\$/g, function(m){ return stash(m); });
  /* tables */
  s = s.replace(/\\begin\{tabular\}\{[^}]*\}([\s\S]*?)\\end\{tabular\}/g, function(m, body){
    var rows = body.replace(/\\(hline|toprule|midrule|bottomrule|cline\{[^}]*\})/g, "").split(/\\\\/).map(function(r){ return r.trim(); }).filter(Boolean)
      .map(function(r){ return r.split(/(?<!\\)&/).map(function(c){ return c.trim(); }); });
    return rows.length ? stash(rowsToTable(rows, { header: true, align: "left" })) : "";
  });
  s = s.replace(/\\begin\{(table|figure|center)\*?\}(\[[^\]]*\])?|\\end\{(table|figure|center)\*?\}/g, "");
  s = s.replace(/\\caption\{([^}]*)\}/g, "*$1*").replace(/\\label\{[^}]*\}/g, "").replace(/\\includegraphics(\[[^\]]*\])?\{([^}]*)\}/g, "![]($2)");
  /* lists, innermost first */
  for(var guard = 0; guard < 6 && /\\begin\{(itemize|enumerate|description)\}/.test(s); guard++){
    s = s.replace(/\\begin\{(itemize|enumerate|description)\}((?:(?!\\begin\{(?:itemize|enumerate|description)\})[\s\S])*?)\\end\{\1\}/g, function(m, env, body){
      var n = 0;
      return "\n" + body.split(/\\item\b/).slice(1).map(function(it){
        var lab = it.match(/^\s*\[([^\]]*)\]/), text = it.replace(/^\s*\[[^\]]*\]/, "").trim().replace(/\n(?!\s*[-\d])/g, " ").replace(/\n/g, "\n  ");
        n++;
        return (env === "enumerate" ? n + ". " : "- ") + (lab ? "**" + lab[1] + "** " : "") + text;
      }).join("\n") + "\n";
    });
  }
  var heads = [["part", "#"], ["chapter", "#"], ["section", "##"], ["subsection", "###"], ["subsubsection", "####"], ["paragraph", "#####"]];
  heads.forEach(function(h){ s = s.replace(new RegExp("\\\\" + h[0] + "\\*?\\{([^}]*)\\}", "g"), "\n" + h[1] + " $1\n"); });
  s = s.replace(/\\begin\{quote\}([\s\S]*?)\\end\{quote\}/g, function(m, b){ return "\n" + b.trim().split("\n").map(function(l){ return "> " + l.trim(); }).join("\n") + "\n"; });
  s = s.replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, "\n## Abstract\n\n$1\n");
  s = s.replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, "[$2]($1)").replace(/\\url\{([^}]*)\}/g, "<$1>")
    .replace(/\\textbf\{([^}]*)\}/g, "**$1**").replace(/\\(textit|emph)\{([^}]*)\}/g, "*$2*").replace(/\\texttt\{([^}]*)\}/g, "`$1`")
    .replace(/\\underline\{([^}]*)\}/g, "$1").replace(/\\footnote\{([^}]*)\}/g, " ($1)").replace(/\\(cite|ref|eqref)\{([^}]*)\}/g, "[$2]")
    .replace(/\\(maketitle|tableofcontents|newpage|clearpage|noindent|centering|small|large|Large|normalsize|footnotesize)\b/g, "")
    .replace(/\\\\\s*/g, "  \n").replace(/\\(%|&|\$|#|_|\{|\})/g, "$1").replace(/~/g, " ").replace(/``|''/g, '"').replace(/---/g, "—").replace(/--/g, "–")
    .replace(/\\[a-zA-Z]+\*?(\[[^\]]*\])?\{([^}]*)\}/g, "$2").replace(/\\[a-zA-Z]+\*?/g, "").replace(/[{}]/g, "");
  s = s.replace(/\u0002(\d+)\u0002/g, function(m, i){ return keep[+i]; });
  s = s.split("\n").map(function(l){ return l.replace(/^[ \t]+(?![-\d>])/, ""); }).join("\n");
  var head = (title ? "# " + title.replace(/\\\\/g, " ") + "\n\n" : "") + (author ? "*" + author.replace(/\\and/g, ",").replace(/\\\\/g, " ") + "*\n\n" : "");
  return (head + s).replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
TOOLS["latex-md"] = function(){
  var out = mdOutput(function(){ return input.name.v; });
  var sample = "\\documentclass{article}\n\\title{A Short Paper}\n\\author{Digitum}\n\\begin{document}\n\\maketitle\n\\section{Introduction}\nMarkdown is \\textbf{simple} and \\emph{readable}. See \\href{https://digitum.marketing}{our site}.\n\n\\subsection{Results}\n\\begin{itemize}\n  \\item Faster writing\n  \\item Easier review\n\\end{itemize}\n\nThe growth rate is $g = \\frac{n_1 - n_0}{n_0}$.\n\\begin{equation}\nE = mc^2\n\\end{equation}\n\n\\begin{tabular}{lr}\nChannel & Leads \\\\\n\\hline\nSEO & 310 \\\\\nAds & 145 \\\\\n\\end{tabular}\n\\end{document}\n";
  var input = mdInput({ title: "LaTeX", placeholder: "Paste LaTeX here…", accept: ".tex,.latex,text/x-tex,.txt", sample: sample, sampleName: "paper", onchange: function(t){ out.set(t.trim() ? latexToMarkdown(t) : ""); } });
  root.appendChild(grid(input.pane, out.pane));
  input.set(sample, "paper");
};

/* ---------- Markdown to LaTeX ---------- */
function markdownToLatex(md, full){
  /* keep maths out of marked's hands */
  var math = [];
  md = md.replace(/\$\$([\s\S]+?)\$\$/g, function(m, b){ math.push("\\[\n" + b.trim() + "\n\\]"); return "\u0003M" + (math.length - 1) + "\u0003"; })
         .replace(/(^|[^\\$])\$(?![\s$])([^$\n]+?)(?<!\s)\$(?!\d)/g, function(m, pre, b){ math.push("$" + b + "$"); return pre + "\u0003M" + (math.length - 1) + "\u0003"; });
  var tpl = document.createElement("template");
  tpl.innerHTML = window.marked.parse(md, { gfm:true });
  sanitize(tpl.content);
  var used = {};
  var tex = function(t){
    return t.replace(/\\/g, "\\textbackslash{}").replace(/([#$%&_{}])/g, "\\$1").replace(/~/g, "\\textasciitilde{}").replace(/\^/g, "\\textasciicircum{}")
      .replace(/\u0003M(\d+)\u0003/g, function(m, i){ return math[+i]; });
  };
  function inline(n){
    var s = "";
    n.childNodes.forEach(function(c){
      if(c.nodeType === 3){ s += tex(c.nodeValue); return; }
      if(c.nodeType !== 1) return;
      var t = c.nodeName;
      if(t === "STRONG" || t === "B") s += "\\textbf{" + inline(c) + "}";
      else if(t === "EM" || t === "I") s += "\\emph{" + inline(c) + "}";
      else if(t === "DEL" || t === "S"){ used.ulem = true; s += "\\sout{" + inline(c) + "}"; }
      else if(t === "CODE") s += "\\texttt{" + tex(c.textContent) + "}";
      else if(t === "A"){ used.link = true; s += "\\href{" + (c.getAttribute("href") || "").replace(/([#%&_])/g, "\\$1") + "}{" + inline(c) + "}"; }
      else if(t === "IMG"){ used.img = true; s += "\\includegraphics[width=\\linewidth]{" + (c.getAttribute("src") || "") + "}"; }
      else if(t === "BR") s += "\\\\\n";
      else if(t === "INPUT") s += c.checked ? "$\\boxtimes$ " : "$\\square$ ";
      else if(t === "UL" || t === "OL") s += "\n" + block(c);
      else s += inline(c);
    });
    return s;
  }
  function block(n){
    var t = n.nodeName;
    if(/^H[1-6]$/.test(t)){ var cmd = ["section", "section", "subsection", "subsubsection", "paragraph", "subparagraph"][+t.charAt(1) - 1]; return "\\" + cmd + "{" + inline(n) + "}\n\n"; }
    if(t === "P") return inline(n).trim() + "\n\n";
    if(t === "UL" || t === "OL"){
      var env = t === "OL" ? "enumerate" : "itemize";
      return "\\begin{" + env + "}\n" + Array.prototype.map.call(n.children, function(li){ return "  \\item " + inline(li).trim().replace(/\n/g, "\n  "); }).join("\n") + "\n\\end{" + env + "}\n\n";
    }
    if(t === "BLOCKQUOTE") return "\\begin{quote}\n" + Array.prototype.map.call(n.children, block).join("").trim() + "\n\\end{quote}\n\n";
    if(t === "PRE"){ used.code = true; return "\\begin{verbatim}\n" + n.textContent.replace(/\n$/, "") + "\n\\end{verbatim}\n\n"; }
    if(t === "HR") return "\\noindent\\rule{\\linewidth}{0.4pt}\n\n";
    if(t === "TABLE"){
      used.table = true;
      var rows = Array.prototype.map.call(n.querySelectorAll("tr"), function(tr){ return Array.prototype.map.call(tr.children, function(c){ return inline(c).trim(); }); });
      var cols = n.querySelectorAll("tr")[0] ? Array.prototype.map.call(n.querySelectorAll("tr")[0].children, function(c){ var a = c.style.textAlign || c.getAttribute("align"); return a === "right" ? "r" : a === "center" ? "c" : "l"; }).join("") : "l";
      return "\\begin{table}[h]\n\\centering\n\\begin{tabular}{" + cols + "}\n\\toprule\n" + rows.map(function(r, i){ return r.join(" & ") + " \\\\" + (i === 0 ? "\n\\midrule" : ""); }).join("\n") + "\n\\bottomrule\n\\end{tabular}\n\\end{table}\n\n";
    }
    return Array.prototype.map.call(n.childNodes, function(c){ return c.nodeType === 1 ? block(c) : ""; }).join("");
  }
  var title = "";
  var body = Array.prototype.map.call(tpl.content.childNodes, function(c){
    if(c.nodeType !== 1) return "";
    if(full && c.nodeName === "H1" && !title){ title = inline(c); return ""; }
    return block(c);
  }).join("").trim() + "\n";
  if(!full) return body;
  var pkgs = ["\\usepackage[utf8]{inputenc}", "\\usepackage[T1]{fontenc}", "\\usepackage{amsmath,amssymb}"];
  if(used.link) pkgs.push("\\usepackage{hyperref}");
  if(used.img) pkgs.push("\\usepackage{graphicx}");
  if(used.table) pkgs.push("\\usepackage{booktabs}");
  if(used.ulem) pkgs.push("\\usepackage[normalem]{ulem}");
  return "\\documentclass{article}\n" + pkgs.join("\n") + "\n" + (title ? "\n\\title{" + title + "}\n\\date{}\n" : "") +
    "\n\\begin{document}\n" + (title ? "\\maketitle\n\n" : "\n") + body + "\n\\end{document}\n";
}
TOOLS["md-latex"] = function(){
  var full = el("input", { type: "checkbox", checked: true });
  var result = el("textarea", { class: "pane-text", readonly: true, "aria-label": "LaTeX result" });
  var sample = "# A Short Paper\n\nMarkdown is **simple** and *readable*. See [our site](https://digitum.marketing).\n\n## Results\n\n- Faster writing\n- Easier review\n\nThe growth rate is $g = \\frac{n_1 - n_0}{n_0}$, and\n\n$$\nE = mc^2\n$$\n\n| Channel | Leads |\n| --- | ---: |\n| SEO | 310 |\n| Ads | 145 |\n";
  var input = mdInput({ sample: sample, sampleName: "paper", onchange: convert });
  function convert(){ need("marked").then(function(){ result.value = input.ta.value.trim() ? markdownToLatex(input.ta.value, full.checked) : ""; }); }
  full.addEventListener("change", convert);
  root.appendChild(opts([el("label", {}, [full, "Full document (preamble and \\begin{document})"])]));
  root.appendChild(grid(input.pane, pane("LaTeX", [
    button("Copy", function(){ if(result.value) copy(result.value, "LaTeX"); }),
    button("Download .tex", function(){ if(result.value) download(result.value, input.name.v + ".tex", "application/x-tex"); }, true)
  ], result)));
  input.set(sample, "paper");
};

/* ---------- RTF to Markdown ---------- */
function rtfToMarkdown(rtf){
  var CP = "€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090‘’“”•–—˜™š›œ\u009džŸ"; /* cp1252 0x80–0x9F */
  var out = [], para = "", stack = [], st = { b: false, i: false, skip: false, uc: 1 }, open = { b: false, i: false };
  var skipDest = /^(fonttbl|colortbl|stylesheet|info|pict|object|header|footer|headerl|headerr|footerl|footerr|listtable|listoverridetable|rsidtbl|generator|xmlnstbl|themedata|colorschememapping|latentstyles|datastore|fldinst|pntext|pntxta|pntxtb|bkmkstart|bkmkend|field)$/;
  var i = 0, ignoreNext = 0, inCell = false, row = [], rows = [];
  function emit(t){
    if(st.skip || !t) return;
    var want = { b: st.b, i: st.i };
    if(open.i && !want.i){ para += "*"; open.i = false; }
    if(open.b && !want.b){ para += "**"; open.b = false; }
    if(want.b && !open.b){ para += "**"; open.b = true; }
    if(want.i && !open.i){ para += "*"; open.i = true; }
    para += t.replace(/([*_`\\])/g, "\\$1");
  }
  function close(){ if(open.i){ para += "*"; open.i = false; } if(open.b){ para += "**"; open.b = false; } }
  function endPara(){ close(); var t = para.replace(/\*\*\s*\*\*|\*\s*\*/g, "").trim(); if(t){ if(/^[•·▪◦-]\s*/.test(t)) t = "- " + t.replace(/^[•·▪◦-]\s*/, ""); out.push(t); } para = ""; }
  while(i < rtf.length){
    var c = rtf[i];
    if(c === "{"){ stack.push(Object.assign({}, st)); i++; if(rtf.substr(i, 2) === "\\*") { st.skip = true; } continue; }
    if(c === "}"){ close(); st = stack.pop() || st; i++; continue; }
    if(c === "\\"){
      var m = rtf.slice(i).match(/^\\([a-zA-Z]+)(-?\d+)? ?|^\\'([0-9a-fA-F]{2})|^\\([^a-zA-Z])/);
      if(!m){ i++; continue; }
      i += m[0].length;
      if(m[3]){ if(ignoreNext){ ignoreNext--; continue; } var code = parseInt(m[3], 16); emit(code >= 0x80 && code <= 0x9f ? CP[code - 0x80] : String.fromCharCode(code)); continue; }
      if(m[4]){ if(m[4] === "~") emit(" "); else if(m[4] === "-") {} else if(m[4] === "_") emit("-"); else if(m[4] === "*") st.skip = true; else emit(m[4]); continue; }
      var w = m[1], n = m[2] === undefined ? null : +m[2];
      if(skipDest.test(w)){ st.skip = true; continue; }
      if(w === "par" || w === "sect"){ if(inCell) para += " "; else endPara(); }
      else if(w === "line") para += "  \n";
      else if(w === "tab") emit(inCell ? " " : "\t");
      else if(w === "b") st.b = n !== 0;
      else if(w === "i") st.i = n !== 0;
      else if(w === "plain"){ st.b = false; st.i = false; }
      else if(w === "uc") st.uc = n || 1;
      else if(w === "u"){ emit(String.fromCharCode(n < 0 ? n + 65536 : n)); ignoreNext = st.uc; }
      else if(w === "bullet") emit("•");
      else if(w === "emdash") emit("—"); else if(w === "endash") emit("–");
      else if(w === "lquote" || w === "rquote") emit("'"); else if(w === "ldblquote" || w === "rdblquote") emit('"');
      else if(w === "intbl") inCell = true;
      else if(w === "cell"){ close(); row.push(para.trim()); para = ""; }
      else if(w === "row"){ rows.push(row); row = []; inCell = false; para = ""; }
      else if(w === "pard"){ if(rows.length && !inCell){ out.push(rowsToTable(rows, { header: true, align: "left" }).trim()); rows = []; } }
      continue;
    }
    if(c === "\r" || c === "\n"){ i++; continue; }
    if(ignoreNext){ ignoreNext--; i++; continue; }
    emit(c); i++;
  }
  endPara();
  if(rows.length) out.push(rowsToTable(rows, { header: true, align: "left" }).trim());
  /* consecutive bullet paragraphs form one list */
  return out.reduce(function(acc, para, k){
    return acc + (k ? (/^- /.test(para) && /^- /.test(out[k - 1]) ? "\n" : "\n\n") : "") + para;
  }, "").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
TOOLS["rtf-md"] = function(){
  var out = mdOutput(function(){ return input.name.v; });
  var sample = "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Calibri;}}\n{\\b Meeting notes}\\par\nWe agreed to launch the {\\i markdown tools} next week.\\par\n\\bullet  Publish the tools\\par\n\\bullet  Submit the sitemap\\par\nBudget: \\'80 2,500\\par\n}";
  var input = mdInput({ title: "RTF", placeholder: "Open an .rtf file, or paste raw RTF ({\\rtf1 …)", accept: ".rtf,application/rtf,text/rtf", sample: sample, sampleName: "notes", onchange: function(t){
    if(!t.trim()) return out.set("");
    if(t.trim().indexOf("{\\rtf") !== 0) return out.note('<div class="error-note">This is not RTF. RTF files start with {\\rtf1. For plain text, use <a href="/text-to-markdown">Text to Markdown</a>.</div>');
    out.set(rtfToMarkdown(t));
  } });
  root.appendChild(grid(input.pane, out.pane));
  input.set(sample, "notes");
};

/* ================= markdown to other apps ================= */

/* ---------- Markdown to Confluence wiki markup ---------- */
function markdownToConfluence(md){
  var tpl = document.createElement("template");
  tpl.innerHTML = window.marked.parse(md, { gfm:true });
  sanitize(tpl.content);
  var escW = function(t){ return t.replace(/([{}\[\]*_|^~+\-#!])/g, "\\$1"); };
  function inline(n){
    var s = "";
    n.childNodes.forEach(function(c){
      if(c.nodeType === 3){ s += escW(c.nodeValue.replace(/\n/g, " ")); return; }
      if(c.nodeType !== 1) return;
      var t = c.nodeName;
      if(t === "STRONG" || t === "B") s += "*" + inline(c) + "*";
      else if(t === "EM" || t === "I") s += "_" + inline(c) + "_";
      else if(t === "DEL" || t === "S") s += "-" + inline(c) + "-";
      else if(t === "CODE") s += "{{" + c.textContent + "}}";
      else if(t === "A") s += "[" + inline(c) + "|" + (c.getAttribute("href") || "") + "]";
      else if(t === "IMG") s += "!" + (c.getAttribute("src") || "") + "!";
      else if(t === "BR") s += "\\\\";
      else if(t === "INPUT") s += c.checked ? "(/) " : "(x) ";
      else if(t !== "UL" && t !== "OL") s += inline(c);
    });
    return s;
  }
  function list(n, marks){
    var m = marks + (n.nodeName === "OL" ? "#" : "*"), lines = [];
    Array.prototype.forEach.call(n.children, function(li){
      lines.push(m + " " + inline(li).trim());
      Array.prototype.forEach.call(li.children, function(c){ if(c.nodeName === "UL" || c.nodeName === "OL") lines.push(list(c, m)); });
    });
    return lines.join("\n");
  }
  function block(n){
    var t = n.nodeName;
    if(/^H[1-6]$/.test(t)) return "h" + t.charAt(1) + ". " + inline(n).trim();
    if(t === "P") return inline(n).trim();
    if(t === "UL" || t === "OL") return list(n, "");
    if(t === "BLOCKQUOTE") return "{quote}\n" + Array.prototype.map.call(n.children, block).join("\n\n") + "\n{quote}";
    if(t === "PRE"){ var code = n.querySelector("code"), lang = code && (code.className.match(/language-(\w+)/) || [])[1]; return "{code" + (lang ? ":language=" + lang : "") + "}\n" + n.textContent.replace(/\n$/, "") + "\n{code}"; }
    if(t === "HR") return "----";
    if(t === "TABLE") return Array.prototype.map.call(n.querySelectorAll("tr"), function(tr){
      var head = tr.parentNode.nodeName === "THEAD", sep = head ? "||" : "|";
      return sep + Array.prototype.map.call(tr.children, function(c){ return " " + (inline(c).trim() || " ") + " "; }).join(sep) + sep;
    }).join("\n");
    return "";
  }
  return Array.prototype.map.call(tpl.content.children, block).filter(Boolean).join("\n\n") + "\n";
}
function copyRichHTML(html, plain, label){
  if(window.ClipboardItem && navigator.clipboard && navigator.clipboard.write){
    return navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([plain], { type: "text/plain" }) })])
      .then(function(){ toast(label || "Copied"); }, function(){ legacy(); });
  }
  legacy();
  function legacy(){
    var box = el("div", { contenteditable: "true", style: "position:fixed;left:-9999px;top:0" });
    box.innerHTML = html; document.body.appendChild(box);
    var r = document.createRange(); r.selectNodeContents(box);
    var s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand("copy"); s.removeAllRanges(); box.remove();
    toast(label || "Copied");
  }
}
TOOLS["md-confluence"] = function(){
  var result = el("textarea", { class: "pane-text", readonly: true, "aria-label": "Confluence wiki markup" });
  var preview = el("div", { class: "pane-body md", hidden: true });
  var mode = "wiki";
  var input = mdInput({ sample: SAMPLE_MD, sampleName: "page", onchange: convert });
  function convert(){ need("marked").then(function(){ result.value = input.ta.value.trim() ? markdownToConfluence(input.ta.value) : ""; renderMD(input.ta.value, preview); }); }
  var tabs = seg([["wiki", "Wiki markup"], ["rich", "Formatted"]], mode, function(v){ mode = v; result.hidden = v !== "wiki"; preview.hidden = v !== "rich"; });
  root.appendChild(el("p", { class: "lede", style: "font-size:15px;margin:-6px 0 16px" }, ["New Confluence editor: use ", el("strong", { text: "Copy formatted" }), " and paste. Older editors and the wiki markup macro: use ", el("strong", { text: "Copy wiki markup" }), "."]));
  root.appendChild(grid(input.pane, pane("Confluence", [tabs,
    button("Copy wiki markup", function(){ if(result.value) copy(result.value, "Wiki markup"); }),
    button("Copy formatted", function(){ if(input.ta.value.trim()) copyRichHTML(preview.innerHTML, input.ta.value, "Formatted text copied. Paste it into Confluence"); }, true)
  ], el("div", { style: "display:flex;flex-direction:column;flex:1" }, [result, preview]))));
  input.set(SAMPLE_MD, "page");
};

/* ---------- Markdown to Slack mrkdwn ---------- */
function markdownToSlack(md){
  var keep = [];
  var stash = function(s){ keep.push(s); return "\u0004" + (keep.length - 1) + "\u0004"; };
  var s = md.replace(/\r\n?/g, "\n")
    .replace(/```[\w-]*\n([\s\S]*?)```/g, function(m, code){ return stash("```\n" + code.replace(/\n$/, "") + "\n```"); })
    .replace(/`([^`\n]+)`/g, function(m, c){ return stash("`" + c + "`"); });
  /* tables become monospaced blocks, since Slack has no tables */
  s = s.replace(/((?:^\|.*\|[ \t]*\n?){2,})/gm, function(t){ return stash("```\n" + t.replace(/^\|?\s*:?-{3,}.*\n?/m, "").trim() + "\n```") + "\n"; });
  s = s
    .replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, function(m, alt, url){ return stash("<" + url + "|" + (alt || "image") + ">"); })
    .replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, function(m, text, url){ return stash("<" + url + "|" + text + ">"); })
    .replace(/^#{1,6}\s+(.+?)\s*#*$/gm, function(m, t){ return stash("*" + t.replace(/\*\*/g, "") + "*"); })
    .replace(/\*\*\*(.+?)\*\*\*/g, function(m, t){ return stash("*_" + t + "_*"); })
    .replace(/(\*\*|__)(.+?)\1/g, function(m, d, t){ return stash("*" + t + "*"); })
    .replace(/(^|[^*\w])\*(?!\s)([^*\n]+?)\*(?!\w)/g, "$1_$2_")
    .replace(/~~(.+?)~~/g, "~$1~")
    .replace(/^(\s*)[-*+]\s+\[x\]\s+/gim, "$1☑ ").replace(/^(\s*)[-*+]\s+\[ \]\s+/gm, "$1☐ ")
    .replace(/^(\s*)[-*+]\s+/gm, function(m, sp){ return sp + "• "; })
    .replace(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/gm, "──────────");
  return s.replace(/\u0004(\d+)\u0004/g, function(m, i){ return keep[+i]; }).replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
function slackHTML(m){
  var keep = [], stash = function(s){ keep.push(s); return "\u0005" + (keep.length - 1) + "\u0005"; };
  var s = m.replace(/```\n?([\s\S]*?)```/g, function(x, c){ return stash("<pre>" + esc(c.replace(/\n$/, "")) + "</pre>"); })
    .replace(/`([^`\n]+)`/g, function(x, c){ return stash("<code>" + esc(c) + "</code>"); });
  s = esc(s)
    .replace(/&lt;(https?:\/\/[^|&]+)\|([^&]+)&gt;/g, '<a href="$1" target="_blank" rel="noopener">$2</a>')
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,!?])/g, "$1<b>$2</b>")
    .replace(/(^|\s|>)_([^_\n]+)_(?=\s|$|[.,!?<])/g, "$1<i>$2</i>")
    .replace(/(^|\s)~([^~\n]+)~(?=\s|$)/g, "$1<s>$2</s>")
    .replace(/^&gt; ?(.*)$/gm, '<span class="sq">$1</span>');
  return s.replace(/\u0005(\d+)\u0005/g, function(x, i){ return keep[+i]; });
}
TOOLS["md-slack"] = function(){
  var result = el("textarea", { class: "pane-text", readonly: true, style: "min-height:200px", "aria-label": "Slack message" });
  var preview = el("div", { class: "slack" });
  var input = mdInput({ sample: SAMPLE_MD, sampleName: "message", onchange: function(md){ result.value = md.trim() ? markdownToSlack(md) : ""; setHTML(preview, slackHTML(result.value)); } });
  root.appendChild(grid(input.pane, pane("Slack", [button("Copy for Slack", function(){ if(result.value) copy(result.value, "Slack message"); }, true)],
    el("div", { style: "display:flex;flex-direction:column;flex:1" }, [result, el("div", { class: "pane-body", style: "border-top:1px solid var(--rule);min-height:220px" }, [preview])]))));
  input.set(SAMPLE_MD, "message");
};

/* ---------- Markdown to Google Docs ---------- */
/* Google Docs pastes headings, lists and tables from HTML, but drops class
   based styling, so the copy carries inline styles. */
function inlineStyled(html){
  var tpl = document.createElement("template");
  tpl.innerHTML = html; sanitize(tpl.content);
  var S = {
    H1: "font-size:22pt;font-weight:700;margin:18pt 0 6pt", H2: "font-size:16pt;font-weight:700;margin:16pt 0 6pt", H3: "font-size:13pt;font-weight:700;margin:14pt 0 4pt",
    P: "margin:0 0 8pt;line-height:1.4", BLOCKQUOTE: "margin:8pt 0;padding-left:10pt;border-left:3pt solid #C8FF00;color:#555",
    PRE: "font-family:'Courier New',monospace;background:#F6F3ED;padding:8pt;font-size:10pt;white-space:pre-wrap", CODE: "font-family:'Courier New',monospace;background:#F1ECE3",
    TABLE: "border-collapse:collapse", TH: "border:1px solid #BBB;padding:4pt 6pt;background:#EEE;font-weight:700;text-align:left", TD: "border:1px solid #BBB;padding:4pt 6pt", A: "color:#1155CC"
  };
  Array.prototype.forEach.call(tpl.content.querySelectorAll("*"), function(n){ if(S[n.nodeName]) n.setAttribute("style", S[n.nodeName]); });
  var d = document.createElement("div"); d.appendChild(tpl.content);
  return d.innerHTML;
}
TOOLS["md-gdocs"] = function(){
  var preview = el("div", { class: "pane-body md" });
  var input = mdInput({ sample: SAMPLE_MD, sampleName: "document", onchange: function(md){ renderMD(md, preview); } });
  root.appendChild(el("ol", { class: "lede", style: "font-size:15px;margin:-6px 0 16px;padding-left:20px" }, [
    el("li", {}, ["Press ", el("strong", { text: "Copy for Google Docs" }), ", then paste into a document with Ctrl V."]),
    el("li", {}, ["Or press ", el("strong", { text: "Download .docx" }), " and open it in Google Drive with File › Open."])
  ]));
  root.appendChild(grid(input.pane, pane("Preview", [
    button("Copy for Google Docs", function(){
      if(!input.ta.value.trim()) return toast("Add some markdown first");
      need("marked").then(function(){ copyRichHTML(inlineStyled(window.marked.parse(input.ta.value, { gfm:true })), input.ta.value, "Copied. Paste it into Google Docs"); });
    }, true),
    button("Download .docx", function(){
      if(!input.ta.value.trim()) return toast("Add some markdown first");
      need("marked", "jszip").then(function(){ return buildDocx(input.ta.value); }).then(function(b){ download(b, input.name.v + ".docx"); });
    })
  ], preview)));
  input.set(SAMPLE_MD, "document");
};

/* ---------- ChatGPT to Markdown ---------- */
function chatToMarkdown(conv){
  /* follow the branch that was on screen, from current_node back to the root */
  var map = conv.mapping || {}, node = conv.current_node, path = [];
  while(node && map[node]){ path.unshift(map[node]); node = map[node].parent; }
  if(!path.length) path = Object.keys(map).map(function(k){ return map[k]; });
  var out = ["# " + (conv.title || "ChatGPT conversation")];
  if(conv.create_time) out.push("*" + new Date(conv.create_time * 1000).toLocaleString() + "*");
  path.forEach(function(n){
    var m = n.message;
    if(!m || !m.content || !m.author) return;
    var role = m.author.role;
    if(role !== "user" && role !== "assistant") return;
    var parts = (m.content.parts || []).filter(function(p){ return typeof p === "string"; }).join("\n\n").trim();
    if(!parts && m.content.text) parts = m.content.text;
    if(!parts) return;
    out.push("## " + (role === "user" ? "You" : "ChatGPT") + "\n\n" + parts);
  });
  return out.join("\n\n") + "\n";
}
TOOLS["chatgpt-md"] = function(){
  var out = mdOutput(function(){ return name; }), name = "chat", convs = [];
  var pick = el("select", { "aria-label": "Conversation", hidden: true });
  var zone = el("div", { class: "paste-zone md", contenteditable: "true", role: "textbox", "aria-label": "Paste a chat",
    "data-placeholder": "Select the conversation in ChatGPT, copy it (Ctrl C) and paste it here. Or open conversations.json from a ChatGPT data export." });
  var convert = debounce(function(){
    if(!zone.textContent.trim()) return out.set("");
    turndown().then(function(make){ out.set(make().turndown(normaliseClipboardHTML(zone.innerHTML)).replace(/\n{3,}/g, "\n\n")); });
  }, 150);
  zone.addEventListener("paste", function(e){
    var html = e.clipboardData.getData("text/html"), text = e.clipboardData.getData("text/plain");
    e.preventDefault();
    if(html) setHTML(zone, normaliseClipboardHTML(html)); else zone.textContent = text;
    convert();
  });
  zone.addEventListener("input", convert);
  var picker = filePicker(".json,application/json", function(f){
    readFile(f).then(function(t){
      var data = JSON.parse(t);
      convs = Array.isArray(data) ? data : [data];
      convs.sort(function(a, b){ return (b.create_time || 0) - (a.create_time || 0); });
      pick.innerHTML = "";
      convs.forEach(function(c, i){ pick.appendChild(el("option", { value: i, text: (c.title || "Untitled") + (c.create_time ? " · " + new Date(c.create_time * 1000).toLocaleDateString() : "") })); });
      pick.hidden = false;
      showConv();
      toast(convs.length + " conversation" + (convs.length === 1 ? "" : "s") + " found");
    }).catch(function(){ out.note('<div class="error-note">That file is not a ChatGPT export. Use conversations.json from Settings › Data controls › Export.</div>'); });
  });
  function showConv(){ var c = convs[+pick.value || 0]; if(!c) return; name = (c.title || "chat").replace(/[\\\/:*?"<>|]+/g, "-"); out.set(chatToMarkdown(c)); }
  pick.addEventListener("change", showConv);
  root.appendChild(opts([button("Open conversations.json", picker.open), pick,
    button("Download all as .md", function(){
      if(!convs.length) return toast("Open conversations.json first");
      download(convs.map(chatToMarkdown).join("\n\n---\n\n"), "chatgpt-conversations.md", "text/markdown;charset=utf-8");
    })]));
  root.appendChild(grid(pane("Paste a chat", [button("Clear", function(){ zone.innerHTML = ""; out.set(""); zone.focus(); })], zone), out.pane));
};

/* ================= web to markdown (through the site's Worker) ================= */

function fetchPublic(url){
  return fetch("/api/fetch?url=" + encodeURIComponent(url)).then(function(r){
    return r.json().catch(function(){ return {}; }).then(function(j){
      if(r.ok) return j;
      var why = { bad_url: "That address can't be fetched. Use a full public link starting with https://",
        unreachable: "The site could not be reached.", upstream: "The site answered with an error (" + (j.status || r.status) + "). It may be private or block automated requests.",
        unsupported_type: "That link is not a web page or feed (" + (j.contentType || "unknown type") + ").", too_large: "That page is too large to convert." }[j.error];
      throw new Error(why || "Could not fetch that address (" + r.status + ").");
    });
  });
}
function absolutise(doc, base){
  Array.prototype.forEach.call(doc.querySelectorAll("a[href]"), function(a){ try{ a.setAttribute("href", new URL(a.getAttribute("href"), base).href); }catch(e){} });
  Array.prototype.forEach.call(doc.querySelectorAll("img"), function(im){
    var src = im.getAttribute("src") || im.getAttribute("data-src") || (im.getAttribute("srcset") || "").split(/[ ,]/)[0];
    if(src){ try{ im.setAttribute("src", new URL(src, base).href); }catch(e){} }
  });
}
/* the main content of a page: <article>, <main>, or the block with the most paragraph text */
function mainContent(doc){
  Array.prototype.forEach.call(doc.querySelectorAll("script,style,noscript,iframe,svg,form,nav,footer,header,aside,[role=navigation],[role=banner],[role=contentinfo],[aria-hidden=true],.nav,.menu,.sidebar,.footer,.header,.cookie,.ads,.advert,.share,.social,.comments,#comments"), function(n){ n.remove(); });
  var pick = doc.querySelector("article") || doc.querySelector("main") || doc.querySelector("[role=main]");
  if(pick && pick.textContent.trim().length > 200) return pick;
  var best = doc.body, score = 0;
  Array.prototype.forEach.call(doc.querySelectorAll("div,section"), function(d){
    var s = Array.prototype.reduce.call(d.querySelectorAll(":scope > p"), function(t, p){ return t + p.textContent.length; }, 0);
    if(s > score){ score = s; best = d; }
  });
  return best || doc.body;
}

/* ---------- URL to Markdown ---------- */
TOOLS["url-md"] = function(){
  var addr = el("input", { type: "url", placeholder: "https://example.com/article", "aria-label": "Web page address", style: "min-width:min(520px,100%)" });
  var full = el("input", { type: "checkbox" });
  var out = mdOutput(function(){ return name; }), name = "page";
  function go(){
    var v = addr.value.trim();
    if(!v) return toast("Enter a web address");
    if(!/^https?:\/\//i.test(v)) v = "https://" + v;
    out.note('<div class="empty-note">Fetching ' + esc(v) + "…</div>");
    Promise.all([fetchPublic(v), turndown()]).then(function(r){
      var j = r[0], doc = new DOMParser().parseFromString(j.body, "text/html");
      absolutise(doc, j.url);
      var title = (doc.querySelector('meta[property="og:title"]') || {}).content || (doc.querySelector("title") || {}).textContent || "";
      var node = full.checked ? doc.body : mainContent(doc);
      var md = r[1]().turndown(node.innerHTML).replace(/\n{3,}/g, "\n\n").trim();
      if(title && md.indexOf("# ") !== 0) md = "# " + title.trim() + "\n\n" + md;
      name = (title || new URL(j.url).hostname).replace(/[\\\/:*?"<>|]+/g, "-").slice(0, 60);
      out.set(md + "\n\n---\n\nSource: <" + j.url + ">\n");
      history.replaceState(null, "", "?url=" + encodeURIComponent(j.url));
    }).catch(function(e){ out.note('<div class="error-note">' + esc(e.message) + "</div>"); });
  }
  addr.addEventListener("keydown", function(e){ if(e.key === "Enter") go(); });
  root.appendChild(opts([addr, button("Convert", go, true), el("label", {}, [full, "Whole page, not just the article"])]));
  root.appendChild(el("div", { class: "tool-grid single" }, [out.pane]));
  var q = new URLSearchParams(location.search).get("url");
  if(q){ addr.value = q; go(); }
};

/* ---------- Google Docs to Markdown ---------- */
function googleDocHTML(html){
  /* Google's export styles bold and italic through classes in a <style> block */
  var doc = new DOMParser().parseFromString(html, "text/html");
  var css = Array.prototype.map.call(doc.querySelectorAll("style"), function(s){ return s.textContent; }).join("\n");
  var bold = {}, ital = {}, strike = {}, mono = {};
  css.replace(/\.(c\d+)\{([^}]*)\}/g, function(m, cls, body){
    if(/font-weight:\s*(700|bold)/.test(body)) bold[cls] = 1;
    if(/font-style:\s*italic/.test(body)) ital[cls] = 1;
    if(/line-through/.test(body)) strike[cls] = 1;
    if(/font-family:\s*"?(Courier|Consolas|Roboto Mono|Source Code)/i.test(body)) mono[cls] = 1;
  });
  Array.prototype.forEach.call(doc.querySelectorAll("span[class]"), function(s){
    var cl = s.className.split(/\s+/);
    var wrap = function(tag){ var w = doc.createElement(tag); while(s.firstChild) w.appendChild(s.firstChild); s.appendChild(w); };
    if(cl.some(function(c){ return mono[c]; })) wrap("code");
    if(cl.some(function(c){ return strike[c]; })) wrap("del");
    if(cl.some(function(c){ return ital[c]; })) wrap("em");
    if(cl.some(function(c){ return bold[c]; })) wrap("strong");
  });
  Array.prototype.forEach.call(doc.querySelectorAll('a[href^="https://www.google.com/url"]'), function(a){
    try{ var q = new URL(a.href).searchParams.get("q"); if(q) a.setAttribute("href", q); }catch(e){}
  });
  /* the document title is a paragraph styled "title" */
  Array.prototype.forEach.call(doc.querySelectorAll("p.title"), function(p){ var h = doc.createElement("h1"); h.innerHTML = p.innerHTML; p.replaceWith(h); });
  return doc.body.innerHTML;
}
TOOLS["gdocs-md"] = function(){
  var addr = el("input", { type: "url", placeholder: "https://docs.google.com/document/d/…", "aria-label": "Google Docs link", style: "min-width:min(520px,100%)" });
  var out = mdOutput(function(){ return name; }), name = "google-doc";
  function go(){
    var m = addr.value.match(/\/document\/(?:u\/\d+\/)?d\/([A-Za-z0-9_-]{20,})/) || addr.value.trim().match(/^([A-Za-z0-9_-]{25,})$/);
    if(!m) return toast("Paste a Google Docs link");
    out.note('<div class="empty-note">Fetching the document…</div>');
    Promise.all([fetchPublic("https://docs.google.com/document/d/" + m[1] + "/export?format=html"), turndown()]).then(function(r){
      if(/accounts\.google\.com|ServiceLogin/.test(r[0].url)) throw new Error("This document is private. In Google Docs, choose Share › General access › Anyone with the link, then try again.");
      var md = r[1]().turndown(googleDocHTML(r[0].body)).replace(/\n{3,}/g, "\n\n").trim() + "\n";
      var h = md.match(/^# (.+)$/m);
      name = h ? h[1].replace(/[\\\/:*?"<>|]+/g, "-").slice(0, 60) : "google-doc";
      out.set(md);
    }).catch(function(e){ out.note('<div class="error-note">' + esc(e.message) + "</div>"); });
  }
  addr.addEventListener("keydown", function(e){ if(e.key === "Enter") go(); });
  root.appendChild(opts([addr, button("Convert", go, true)]));
  root.appendChild(el("p", { class: "lede", style: "font-size:14.5px;margin:-4px 0 14px" }, ["The document must be shared as ", el("strong", { text: "Anyone with the link" }), ". For a private document, copy its text and use ",
    el("a", { href: "/paste-to-markdown", text: "Paste to Markdown" }), "."]));
  root.appendChild(el("div", { class: "tool-grid single" }, [out.pane]));
};

/* ---------- Reddit to Markdown ---------- */
function redditToMarkdown(data, o){
  var post = data[0].data.children[0].data, out = [];
  out.push("# " + post.title);
  out.push("*r/" + post.subreddit + " · u/" + post.author + " · " + post.score + " points · " + new Date(post.created_utc * 1000).toLocaleDateString() + "*");
  if(post.url && post.url.indexOf("/comments/") < 0) out.push("<" + post.url + ">");
  if(post.selftext) out.push(post.selftext.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
  out.push("[View on Reddit](https://www.reddit.com" + post.permalink + ")");
  if(o.comments){
    out.push("## Comments");
    var n = 0;
    (function walk(list, depth){
      (list || []).forEach(function(c){
        if(c.kind !== "t1" || n >= o.max || depth > o.depth) return;
        var d = c.data;
        if(!d.body || d.body === "[deleted]") return;
        n++;
        var q = new Array(depth + 2).join("> ");
        out.push(q + "**u/" + d.author + "** · " + d.score + " points\n" + q.trim() + "\n" + d.body.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").split("\n").map(function(l){ return q + l; }).join("\n"));
        if(d.replies && d.replies.data) walk(d.replies.data.children, depth + 1);
      });
    })(data[1].data.children, 0);
  }
  return out.join("\n\n") + "\n";
}
TOOLS["reddit-md"] = function(){
  var addr = el("input", { type: "url", placeholder: "https://www.reddit.com/r/…/comments/…", "aria-label": "Reddit post link", style: "min-width:min(480px,100%)" });
  var comments = el("input", { type: "checkbox", checked: true });
  var max = el("select", { "aria-label": "Number of comments" }, [10, 25, 50, 100].map(function(n){ return el("option", { value: n, text: n + " comments", selected: n === 25 }); }));
  var out = mdOutput(function(){ return name; }), name = "reddit-post", last = null;
  function render(){ if(last) out.set(redditToMarkdown(last, { comments: comments.checked, max: +max.value, depth: 3 })); }
  function go(){
    var v = addr.value.trim();
    var m = v.match(/reddit\.com\/(r\/[^\/]+\/comments\/[a-z0-9]+(?:\/[^\/?#]*)?)/i) || v.match(/redd\.it\/([a-z0-9]+)/i);
    if(!m) return toast("Paste a link to a Reddit post");
    var api = /redd\.it/.test(v) ? "https://www.reddit.com/comments/" + m[1] + ".json?raw_json=1" : "https://www.reddit.com/" + m[1].replace(/\/$/, "") + ".json?raw_json=1&limit=200";
    out.note('<div class="empty-note">Fetching the post…</div>');
    fetchPublic(api).then(function(j){
      last = JSON.parse(j.body);
      name = (last[0].data.children[0].data.title || "reddit-post").replace(/[\\\/:*?"<>|]+/g, "-").slice(0, 60);
      render();
    }).catch(function(e){ out.note('<div class="error-note">' + esc(e.message) + " Reddit sometimes blocks automated requests; if it does, open the post, copy it, and use <a href=\"/paste-to-markdown\">Paste to Markdown</a>.</div>"); });
  }
  addr.addEventListener("keydown", function(e){ if(e.key === "Enter") go(); });
  [comments, max].forEach(function(c){ c.addEventListener("change", render); });
  root.appendChild(opts([addr, button("Convert", go, true), el("label", {}, [comments, "Include comments"]), max]));
  root.appendChild(el("div", { class: "tool-grid single" }, [out.pane]));
};

/* ---------- Podcast to Markdown ---------- */
function podcastToMarkdown(xmlText, td, limit){
  var d = new DOMParser().parseFromString(xmlText, "application/xml");
  if(d.querySelector("parsererror")) throw new Error("That address is not a podcast RSS feed.");
  var ch = d.querySelector("channel");
  if(!ch) throw new Error("That address is not a podcast RSS feed.");
  var txt = function(n, sel){ var x = n.getElementsByTagName(sel)[0]; return x ? x.textContent.trim() : ""; };
  var html2md = function(h){ return h ? td.turndown(h.indexOf("<") > -1 ? h : h.replace(/\n/g, "<br>")).trim() : ""; };
  var out = ["# " + txt(ch, "title")];
  var author = txt(ch, "itunes:author"), link = txt(ch, "link");
  if(author || link) out.push("*" + [author, link ? "<" + link + ">" : ""].filter(Boolean).join(" · ") + "*");
  var desc = txt(ch, "description") || txt(ch, "itunes:summary");
  if(desc) out.push(html2md(desc));
  var items = Array.prototype.slice.call(ch.getElementsByTagName("item"), 0, limit);
  out.push("## Episodes (" + items.length + ")");
  items.forEach(function(it){
    var title = txt(it, "title"), date = txt(it, "pubDate"), dur = txt(it, "itunes:duration");
    var enc = it.getElementsByTagName("enclosure")[0], audio = enc ? enc.getAttribute("url") : "";
    var notes = txt(it, "content:encoded") || txt(it, "description") || txt(it, "itunes:summary");
    var when = date ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";
    if(/^\d+$/.test(dur)){ var s = +dur; dur = Math.floor(s / 3600) ? Math.floor(s / 3600) + "h " + Math.floor(s % 3600 / 60) + "m" : Math.floor(s / 60) + " min"; }
    out.push("### " + title + "\n\n*" + [when, dur].filter(Boolean).join(" · ") + "*" + (audio ? " · [Audio](" + audio + ")" : "") + (txt(it, "link") ? " · [Episode page](" + txt(it, "link") + ")" : "") +
      (notes ? "\n\n" + html2md(notes) : ""));
  });
  return out.join("\n\n").replace(/\n{3,}/g, "\n\n") + "\n";
}
TOOLS["podcast-md"] = function(){
  var addr = el("input", { type: "url", placeholder: "RSS feed or Apple Podcasts link", "aria-label": "Podcast feed or Apple Podcasts link", style: "min-width:min(480px,100%)" });
  var limit = el("select", { "aria-label": "Episodes" }, [10, 25, 50, 200].map(function(n){ return el("option", { value: n, text: n === 200 ? "All episodes" : "Latest " + n, selected: n === 25 }); }));
  var out = mdOutput(function(){ return name; }), name = "podcast", feedXML = null;
  function render(){ if(feedXML) turndown().then(function(make){ try{ out.set(podcastToMarkdown(feedXML, make(), +limit.value)); }catch(e){ out.note('<div class="error-note">' + esc(e.message) + "</div>"); } }); }
  function go(){
    var v = addr.value.trim();
    if(!v) return toast("Enter a podcast feed or Apple Podcasts link");
    if(!/^https?:\/\//i.test(v)) v = "https://" + v;
    out.note('<div class="empty-note">Fetching the feed…</div>');
    var apple = v.match(/podcasts\.apple\.com\/.*\/id(\d+)/);
    var feed = apple ? fetchPublic("https://itunes.apple.com/lookup?id=" + apple[1] + "&entity=podcast").then(function(j){
      var r = JSON.parse(j.body).results || [];
      if(!r[0] || !r[0].feedUrl) throw new Error("Apple Podcasts did not list a feed for this show.");
      return r[0].feedUrl;
    }) : Promise.resolve(v);
    feed.then(fetchPublic).then(function(j){
      feedXML = j.body;
      var t = (feedXML.match(/<title>(?:<!\[CDATA\[)?([^<\]]+)/) || [])[1];
      name = (t || "podcast").replace(/[\\\/:*?"<>|]+/g, "-").trim().slice(0, 60);
      render();
    }).catch(function(e){ out.note('<div class="error-note">' + esc(e.message) + "</div>"); });
  }
  addr.addEventListener("keydown", function(e){ if(e.key === "Enter") go(); });
  limit.addEventListener("change", render);
  root.appendChild(opts([addr, button("Convert", go, true), limit]));
  root.appendChild(el("div", { class: "tool-grid single" }, [out.pane]));
};

/* ================= the All tools page ================= */
TOOLS["directory"] = function(){
  /* the cards are already in the page for search engines; this adds filtering */
  var cards = Array.prototype.slice.call(document.querySelectorAll(".dir-card"));
  var chips = document.querySelectorAll(".dir-filter button"), q = document.querySelector(".dir-search");
  var count = document.querySelector(".dir-count");
  var cat = "all";
  function apply(){
    var term = q ? q.value.trim().toLowerCase() : "", n = 0;
    cards.forEach(function(c){
      var ok = (cat === "all" || (" " + c.getAttribute("data-cat") + " ").indexOf(" " + cat + " ") > -1) && (!term || c.textContent.toLowerCase().indexOf(term) > -1);
      c.hidden = !ok; if(ok) n++;
    });
    if(count) count.textContent = n + " tool" + (n === 1 ? "" : "s");
  }
  Array.prototype.forEach.call(chips, function(b){
    b.addEventListener("click", function(){
      Array.prototype.forEach.call(chips, function(x){ x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); });
      b.classList.add("on"); b.setAttribute("aria-pressed", "true");
      cat = b.getAttribute("data-cat"); apply();
    });
  });
  if(q) q.addEventListener("input", apply);
  var noscript = root.querySelector("noscript"); if(noscript) noscript.remove();
  root.hidden = true;   /* the directory itself lives in the page content */
  /* this page is "All tools", so the breadcrumb needs no separate link to it */
  var mid = document.querySelector('.crumbs a[href="/tools"]');
  if(mid){ if(mid.nextElementSibling) mid.nextElementSibling.remove(); mid.remove(); }
  apply();
};

/* ================= boot ================= */

var themeBtn = $("themeBtn");
if(themeBtn) themeBtn.addEventListener("click", function(){
  var cur = document.documentElement.getAttribute("data-theme") ||
    (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  var next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try{ localStorage.setItem("digitum-md-theme", next); }catch(e){}
});

if(TOOLS[TOOL]){
  var noscript = root.querySelector("noscript");
  if(noscript) noscript.remove();
  try{ TOOLS[TOOL](); }
  catch(e){ root.appendChild(el("div", { class: "error-note", text: "This tool could not start: " + e.message })); }
}

window.DigitumTools = { textToMarkdown: textToMarkdown, rowsToTable: rowsToTable, discordHTML: discordHTML, sanitize: sanitize };
})();
