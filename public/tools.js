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
TOOLS["xlsx-md"] = function(){
  var name = "table", sheets = null, out = mdOutput(function(){ return name; });
  var header = el("input", { type: "checkbox", checked: true });
  var align = el("select", { "aria-label": "Alignment" }, [["auto", "Numbers right"], ["left", "Left"], ["center", "Centre"], ["right", "Right"]].map(function(o){ return el("option", { value: o[0], text: o[1] }); }));
  var paste = el("textarea", { class: "pane-text", style: "min-height:180px;border-top:1px solid var(--rule)", placeholder: "…or paste cells copied from Excel or Google Sheets, or CSV text" });
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
  var fi = fileInput({ title: "Spreadsheet", label: "Open an Excel or CSV file", button: "Open file", accept: ".xlsx,.xls,.csv,.ods,.tsv", onfile: function(f){
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
  paste.value = "Channel\tVisits\tLeads\nSEO\t12400\t310\nAds\t5200\t145\nEmail\t2100\t88";
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
