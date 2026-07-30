/* =========================================================
   post.js — experiência de leitura (Fase 2)
   Auto-injeta em qualquer página com .post-content:
     - barra de progresso de leitura (topo)
     - índice (TOC) automático a partir dos <h2>
     - botões flutuantes: compartilhar + voltar ao topo
   Funciona nas páginas estáticas (p/<slug>/) e na blog-post.html
   dinâmica (observa o conteúdo que chega depois via fetch).
   ========================================================= */
(function () {
  "use strict";

  /* ---- barra de progresso ---- */
  var bar = document.createElement("div");
  bar.className = "reading-progress";
  bar.innerHTML = '<span></span>';
  document.body.appendChild(bar);
  var fill = bar.firstChild;

  function onScroll() {
    var h = document.documentElement;
    var max = (h.scrollHeight - h.clientHeight) || 1;
    var pct = Math.min(100, Math.max(0, (h.scrollTop || document.body.scrollTop) / max * 100));
    fill.style.width = pct + "%";
    if (toTop) toTop.classList.toggle("is-visible", (h.scrollTop || 0) > 600);
  }

  /* ---- botões flutuantes (voltar ao topo + compartilhar) ---- */
  var fab = document.createElement("div");
  fab.className = "post-fab";
  fab.innerHTML =
    '<button type="button" class="post-fab__btn" data-share aria-label="Compartilhar">' +
      '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><g fill="currentColor">' +
      '<rect x="11" y="1" width="4" height="4"/><rect x="11" y="6" width="4" height="4"/><rect x="1" y="6" width="4" height="4"/>' +
      '<rect x="5" y="7" width="6" height="2"/><rect x="5" y="4" width="7" height="2"/><rect x="5" y="10" width="7" height="2"/>' +
      '<rect x="11" y="11" width="4" height="4"/></g></svg></button>' +
    '<button type="button" class="post-fab__btn" data-top aria-label="Voltar ao topo">' +
      '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><g fill="currentColor">' +
      '<rect x="7" y="2" width="2" height="12"/><rect x="5" y="4" width="2" height="2"/><rect x="9" y="4" width="2" height="2"/>' +
      '<rect x="3" y="6" width="2" height="2"/><rect x="11" y="6" width="2" height="2"/></g></svg></button>';
  document.body.appendChild(fab);
  var toTop = fab.querySelector("[data-top]");
  var shareBtn = fab.querySelector("[data-share]");

  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  shareBtn.addEventListener("click", function () {
    var data = { title: document.title, url: location.href };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    var done = function () { toast("Link copiado!"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(location.href).then(done, function () { toast(location.href); });
    } else { toast(location.href); }
  });

  function toast(msg) {
    var t = document.createElement("div");
    t.className = "post-toast"; t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("is-visible"); });
    setTimeout(function () { t.classList.remove("is-visible"); setTimeout(function () { t.remove(); }, 300); }, 2200);
  }

  /* ---- índice (TOC) a partir dos <h2> ---- */
  function slugify(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sec";
  }
  var tocDone = false;
  function buildTOC() {
    if (tocDone) return;
    var content = document.querySelector(".post-content");
    if (!content) return;
    var hs = content.querySelectorAll("h2");
    if (hs.length < 3) { tocDone = true; return; }  // TOC só em textos longos
    var nav = document.createElement("nav");
    nav.className = "post-toc";
    var html = '<p class="post-toc__title">Neste texto</p><ul>';
    hs.forEach(function (h, i) {
      var id = h.id || (slugify(h.textContent) + "-" + i);
      h.id = id;
      html += '<li><a href="#' + id + '">' + h.textContent.replace(/[<>&]/g, "") + '</a></li>';
    });
    nav.innerHTML = html + "</ul>";
    content.parentNode.insertBefore(nav, content);
    tocDone = true;
  }

  /* dispara agora e observa conteúdo que chega depois (página dinâmica) */
  buildTOC();
  if (!tocDone) {
    var target = document.getElementById("post-article") || document.body;
    if (window.MutationObserver) {
      var mo = new MutationObserver(function () { buildTOC(); if (tocDone) mo.disconnect(); });
      mo.observe(target, { childList: true, subtree: true });
      setTimeout(function () { mo.disconnect(); }, 8000);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();
})();
