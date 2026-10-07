/* Header navigation and the Tools menu, shared by the viewer and the tool pages. */
(function(){
  "use strict";
  var btn = document.getElementById("toolsBtn"), menu = document.getElementById("megaMenu");
  if(!btn || !menu) return;
  /* the header has a backdrop filter (and in the app, hidden overflow), which
     would trap a fixed-position menu inside it, so the menu lives on <body> */
  document.body.appendChild(menu);

  /* mark the page we are on */
  var here = location.pathname.replace(/\/+$/, "") || "/";
  Array.prototype.forEach.call(document.querySelectorAll(".site-nav a, #megaMenu a"), function(a){
    var p = a.getAttribute("href");
    if(p === here) a.setAttribute("aria-current", "page");
  });

  function place(){
    var bar = btn.closest(".site-head, .topbar") || btn;
    document.documentElement.style.setProperty("--mega-top", (bar.getBoundingClientRect().bottom + 6) + "px");
  }
  function open(){
    place();
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    var first = menu.querySelector("a");
    if(first) first.focus({ preventScroll:true });
  }
  function close(focusBtn){
    if(menu.hidden) return false;
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    if(focusBtn) btn.focus();
    return true;
  }

  btn.addEventListener("click", function(e){ e.stopPropagation(); if(!close()) open(); });
  document.addEventListener("mousedown", function(e){
    if(!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) close();
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && close(true)) e.stopPropagation();
  }, true);
  menu.addEventListener("keydown", function(e){
    if(e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    var links = Array.prototype.slice.call(menu.querySelectorAll("a"));
    var i = links.indexOf(document.activeElement);
    links[(i + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length].focus();
  });
  window.addEventListener("resize", function(){ if(!menu.hidden) place(); });
})();
