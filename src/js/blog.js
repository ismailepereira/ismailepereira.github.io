/* =========================================================
   Blog — Ismaile Pereira · Presença Digital
   Estilo "Pixel Garden" (8-bit + line art)
   Baseado no contrato da API do Alencar (psi-landing-page):
     GET /api/postagens            -> lista
     GET /api/postagens/slug/:slug -> post
   Schema do post: slug, title, excerpt, content(HTML),
                   category, coverImage, createdAt, updatedAt
   --------------------------------------------------------
   FONTE DE DADOS:
   - Deixe API_BASE = "" para usar o JSON local (blog/posts.json).
   - Para plugar a API do Alencar (uma instância sua), basta:
       var API_BASE = "https://painel.SEU-DOMINIO.com.br";
     O resto do código funciona sem mudar mais nada.
   ========================================================= */
(function () {
  "use strict";

  /* ────────────────── CONFIG ────────────────── */
  var API_BASE   = "";                         // "" = usa JSON local | ex: "https://painel.seudominio.com.br"
  var LOCAL_URL  = "blog/posts.json";
  var POSTS_URL  = API_BASE ? API_BASE + "/api/postagens" : LOCAL_URL;
  var SLUG_URL   = API_BASE ? API_BASE + "/api/postagens/slug/" : null;

  var CACHE_KEY  = "blogPostsCache";
  var CACHE_TTL  = 5 * 60 * 1000;  // 5 min
  var SITE_URL   = location.origin + location.pathname.replace(/[^/]*$/, "");
  var WA_NUMBER  = "5569999688625";

  /* Categorias do nicho + cor da tag (fallback se a API não devolver) */
  var CATEGORIES = {
    "sites":      { label: "Sites",       cls: "tag--terra"  },
    "seo":        { label: "Google / SEO", cls: "tag--forest" },
    "whatsapp":   { label: "WhatsApp",    cls: "tag--sage"   },
    "negocios":   { label: "Negócios",    cls: "tag--terra"  },
    "bastidores": { label: "Bastidores",  cls: "tag--forest" },
    "ia":         { label: "IA",          cls: "tag--sage"   }
  };
  function categoryInfo(raw) {
    if (!raw) return { label: "Presença Digital", cls: "tag--sage" };
    var key = String(raw).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return CATEGORIES[key] || { label: String(raw), cls: "tag--sage" };
  }

  /* ────────────────── ÍCONES PIXEL (8-bit, inline) ────────────────── */
  function px(name) {
    var s = {
      clock: '<rect x="5" y="2" width="6" height="2"/><rect x="3" y="4" width="2" height="2"/><rect x="11" y="4" width="2" height="2"/><rect x="2" y="6" width="2" height="4"/><rect x="12" y="6" width="2" height="4"/><rect x="3" y="10" width="2" height="2"/><rect x="11" y="10" width="2" height="2"/><rect x="5" y="12" width="6" height="2"/><rect x="7" y="5" width="2" height="4"/><rect x="9" y="7" width="2" height="2"/>',
      arrow: '<rect x="2" y="7" width="8" height="2"/><rect x="8" y="5" width="2" height="2"/><rect x="10" y="7" width="2" height="2"/><rect x="8" y="9" width="2" height="2"/><rect x="6" y="3" width="2" height="2"/><rect x="6" y="11" width="2" height="2"/>',
      leaf: '<rect x="7" y="2" width="2" height="12"/><rect x="3" y="5" width="4" height="2"/><rect x="1" y="6" width="2" height="2"/><rect x="9" y="8" width="4" height="2"/><rect x="13" y="9" width="2" height="2"/>',
      msg: '<rect x="2" y="3" width="12" height="2"/><rect x="2" y="5" width="2" height="6"/><rect x="12" y="5" width="2" height="6"/><rect x="2" y="11" width="8" height="2"/><rect x="5" y="13" width="2" height="2"/><rect x="5" y="7" width="2" height="2"/><rect x="9" y="7" width="2" height="2"/>'
    };
    return '<svg class="px-ic" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><g fill="currentColor">' + (s[name] || "") + '</g></svg>';
  }

  /* Capa decorativa Pixel Garden (sol + plantinha) quando não há imagem */
  function decorCover(post) {
    var info = categoryInfo(post.category || post.categoria);
    var sun = info.cls === "tag--forest" ? "#4A5A45" : (info.cls === "tag--sage" ? "#8B9A75" : "#BF5A30");
    return ''
      + '<div class="blog-card__cover blog-card__cover--decor">'
      +   '<svg viewBox="0 0 120 80" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" aria-hidden="true">'
      +     '<rect width="120" height="80" fill="#FBF9F2"/>'
      +     '<g fill="' + sun + '">'
      +       '<rect x="78" y="16" width="10" height="10"/><rect x="74" y="20" width="4" height="4"/><rect x="88" y="20" width="4" height="4"/><rect x="80" y="10" width="6" height="4"/><rect x="80" y="28" width="6" height="4"/>'
      +     '</g>'
      +     '<g fill="#8B9A75">'
      +       '<rect x="24" y="46" width="4" height="22"/><rect x="16" y="50" width="6" height="6"/><rect x="30" y="54" width="6" height="6"/>'
      +       '<rect x="52" y="52" width="4" height="16"/><rect x="46" y="56" width="5" height="5"/><rect x="57" y="58" width="5" height="5"/>'
      +     '</g>'
      +     '<g fill="' + sun + '"><rect x="50" y="46" width="4" height="6"/><rect x="48" y="44" width="8" height="4"/></g>'
      +     '<rect x="0" y="68" width="120" height="3" fill="#8B9A75"/>'
      +   '</svg>'
      + '</div>';
  }

  /* ────────────────── ELEMENTOS ────────────────── */
  var blogGrid       = document.getElementById("blog-grid");
  var blogLoading    = document.getElementById("blog-loading");
  var postArticle    = document.getElementById("post-article");
  var postLoading    = document.getElementById("post-loading");
  var relatedSection = document.getElementById("post-related");
  var relatedGrid    = document.getElementById("post-related-grid");

  /* ────────────────── HELPERS ────────────────── */
  function show(el) { if (el) el.style.display = ""; }
  function hide(el) { if (el) el.style.display = "none"; }

  function formatDate(iso) {
    try { return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }); }
    catch (e) { return ""; }
  }
  function getSlugFromURL() { return new URLSearchParams(location.search).get("slug"); }

  function readingTime(html) {
    if (!html) return 1;
    var words = (String(html).replace(/<[^>]+>/g, " ").match(/\S+/g) || []).length;
    return Math.max(1, Math.round(words / 200));
  }

  function sanitizeHTML(html) {
    if (typeof DOMPurify !== "undefined") {
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ["p","br","strong","em","b","i","u","s","h1","h2","h3","h4","h5","h6","ul","ol","li","blockquote","a","img","span","div","sub","sup","hr","pre","code","figure","figcaption"],
        ALLOWED_ATTR: ["href","src","alt","title","target","rel","class","loading"],
        FORBID_TAGS: ["script","style","iframe"],
        FORBID_ATTR: ["onerror","onload","onclick","style"]
      });
    }
    var tmp = document.createElement("div"); tmp.textContent = html; return "<p>" + tmp.innerHTML + "</p>";
  }
  function escapeHTML(s) {
    if (!s) return ""; var d = document.createElement("span"); d.textContent = s; return d.innerHTML;
  }

  /* Revela os cards (fade/slide). rAF para a animação + setTimeout de
     segurança para garantir visibilidade mesmo se o rAF estiver suspenso
     (aba aberta em segundo plano). */
  function revealCards(container) {
    if (!container) return;
    var cards = container.querySelectorAll(".blog-card");
    cards.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 0.06 + "s"; });
    var go = function () { cards.forEach(function (el) { el.classList.add("is-visible"); }); };
    requestAnimationFrame(go);
    setTimeout(go, 300);
  }

  /* ────────────────── CACHE ────────────────── */
  function readCache() {
    try { var raw = localStorage.getItem(CACHE_KEY); if (!raw) return null; var o = JSON.parse(raw); if (Date.now() - o.t > CACHE_TTL) return null; return o.data; }
    catch (e) { return null; }
  }
  function writeCache(data) { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: data })); } catch (e) {} }

  /* Busca post por slug no JSON local (quando não há API dedicada) */
  function findBySlug(list, slug) {
    if (!list) return null;
    for (var i = 0; i < list.length; i++) { if (list[i].slug === slug) return list[i]; }
    return null;
  }

  /* ────────────────── JSON-LD ────────────────── */
  function injectArticleSchema(post) {
    var url = SITE_URL + "blog-post.html?slug=" + encodeURIComponent(post.slug);
    var schema = {
      "@context": "https://schema.org", "@type": "Article",
      "headline": post.title, "description": post.excerpt || "",
      "image": post.coverImage || post.image || (SITE_URL + "src/img/og.png"),
      "datePublished": post.createdAt, "dateModified": post.updatedAt || post.createdAt,
      "author": { "@type": "Person", "name": "Ismaile Pereira", "url": SITE_URL + "index.html" },
      "publisher": { "@type": "Organization", "name": "Ismaile Pereira · Presença Digital", "logo": { "@type": "ImageObject", "url": SITE_URL + "src/img/logo.png" } },
      "mainEntityOfPage": { "@type": "WebPage", "@id": url }
    };
    var ex = document.getElementById("ld-article"); if (ex) ex.remove();
    var tag = document.createElement("script"); tag.type = "application/ld+json"; tag.id = "ld-article"; tag.textContent = JSON.stringify(schema);
    document.head.appendChild(tag);
  }

  /* ────────────────── COMPONENTES ────────────────── */
  function postCover(post) {
    var img = post.coverImage || post.image;
    if (img) return '<div class="blog-card__cover"><img loading="lazy" src="' + escapeHTML(img) + '" alt="' + escapeHTML(post.title) + '" /></div>';
    return decorCover(post);
  }
  function cardTag(post) {
    var info = categoryInfo(post.category || post.categoria);
    return '<span class="blog-tag ' + info.cls + '">' + escapeHTML(info.label) + '</span>';
  }
  function postCardHTML(post) {
    var slug = encodeURIComponent(post.slug), rt = readingTime(post.content);
    return ''
      + '<a class="blog-card" href="blog-post.html?slug=' + slug + '">'
      +   postCover(post)
      +   '<div class="blog-card__body">'
      +     '<div class="blog-card__top">' + cardTag(post)
      +       '<span class="blog-card__meta">' + px("clock") + '<time datetime="' + escapeHTML(post.createdAt) + '">' + formatDate(post.createdAt) + '</time> · ' + rt + ' min</span>'
      +     '</div>'
      +     '<h2 class="blog-card__title">' + escapeHTML(post.title) + '</h2>'
      +     (post.excerpt ? '<p class="blog-card__excerpt">' + escapeHTML(post.excerpt) + '</p>' : '')
      +     '<span class="blog-card__read">Ler artigo ' + px("arrow") + '</span>'
      +   '</div>'
      + '</a>';
  }

  function authorBioHTML() {
    return ''
      + '<aside class="post-author">'
      +   '<div class="post-author__avatar"><img src="src/img/logo.png" alt="Ismaile Pereira" loading="lazy" /></div>'
      +   '<div class="post-author__body">'
      +     '<p class="post-author__eyebrow">' + px("leaf") + ' Sobre o autor</p>'
      +     '<h3>Ismaile Pereira</h3>'
      +     '<p>Crio sites profissionais, rápidos e posicionados no Google para negócios de todo o Brasil — de Mirante da Serra (RO), 100% online.</p>'
      +     '<a href="index.html#sobre" class="post-author__link">Conhecer minha história ' + px("arrow") + '</a>'
      +   '</div>'
      + '</aside>';
  }

  function postCtaHTML(post) {
    var msg = "Olá Ismaile! Vim pelo blog (artigo: " + (post.title || "") + ") e quero um orçamento.";
    var wa = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
    return ''
      + '<section class="post-cta">'
      +   '<div class="post-cta__inner">'
      +     '<p class="post-cta__eyebrow">' + px("msg") + ' Bora conversar?</p>'
      +     '<h3>Se este texto fez sentido, posso colocar seu negócio no mapa.</h3>'
      +     '<p class="post-cta__sub">Site profissional, rápido e posicionado no Google — atendimento 100% online pra todo o Brasil.</p>'
      +     '<div class="post-cta__actions">'
      +       '<a href="' + wa + '" target="_blank" rel="noopener" class="pg-btn pg-btn--light">' + px("msg") + ' Falar no WhatsApp</a>'
      +       '<a href="index.html#servicos" class="pg-btn pg-btn--ghost">Ver serviços</a>'
      +     '</div>'
      +   '</div>'
      + '</section>';
  }

  /* ────────────────── LISTAGEM ────────────────── */
  function renderPostList(posts) {
    if (!blogGrid) return;
    hide(blogLoading); show(blogGrid);
    if (!posts || posts.length === 0) {
      blogGrid.innerHTML = '<div class="blog-empty"><div class="blog-empty__icon">' + px("leaf") + '</div><h2>Em breve, novos conteúdos</h2><p>Estou preparando artigos sobre sites, Google e como vender mais pela internet.</p></div>';
      return;
    }
    posts = posts.slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    blogGrid.innerHTML = posts.map(postCardHTML).join("");
    revealCards(blogGrid);
  }

  function fetchPosts() {
    if (!blogGrid) return;
    var cached = readCache(); if (cached) renderPostList(cached);
    fetch(POSTS_URL)
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) { writeCache(data); renderPostList(data); })
      .catch(function (err) { console.warn("[Blog] erro:", err); if (!cached) renderError(blogGrid, blogLoading); });
  }

  /* ────────────────── POST INDIVIDUAL ────────────────── */
  function renderPost(post) {
    if (!postArticle) return;
    hide(postLoading); show(postArticle);

    document.title = post.title + " | Blog · Ismaile Pereira";
    var md = document.querySelector('meta[name="description"]'); if (md && post.excerpt) md.setAttribute("content", post.excerpt);
    var ot = document.querySelector('meta[property="og:title"]'); if (ot) ot.setAttribute("content", post.title);
    var od = document.querySelector('meta[property="og:description"]'); if (od && post.excerpt) od.setAttribute("content", post.excerpt);
    var oi = document.querySelector('meta[property="og:image"]'); if (oi && (post.coverImage || post.image)) oi.setAttribute("content", post.coverImage || post.image);

    injectArticleSchema(post);

    var rt = readingTime(post.content), info = categoryInfo(post.category || post.categoria);
    var cover = (post.coverImage || post.image) ? '<div class="post-cover"><img src="' + escapeHTML(post.coverImage || post.image) + '" alt="' + escapeHTML(post.title) + '" /></div>' : "";

    postArticle.innerHTML = ''
      + '<nav class="blog-breadcrumb"><a href="index.html">Início</a><span class="sep">/</span><a href="blog.html">Blog</a><span class="sep">/</span><span>' + escapeHTML(post.title) + '</span></nav>'
      + '<header class="post-header">'
      +   '<span class="blog-tag ' + info.cls + '">' + escapeHTML(info.label) + '</span>'
      +   '<h1>' + escapeHTML(post.title) + '</h1>'
      +   '<p class="post-date">' + px("clock") + '<time datetime="' + escapeHTML(post.createdAt) + '">' + formatDate(post.createdAt) + '</time> · ' + rt + ' min de leitura</p>'
      + '</header>'
      + cover
      + '<div class="post-content">' + sanitizeHTML(post.content) + '</div>'
      + authorBioHTML()
      + postCtaHTML(post)
      + '<a href="blog.html" class="post-back">' + px("arrow") + ' Voltar ao blog</a>';

    loadRelated(post);
  }

  function loadRelated(currentPost) {
    if (!relatedSection || !relatedGrid) return;
    var render = function (data) {
      if (!data || data.length === 0) return;
      var cat = (currentPost.category || "").toLowerCase();
      var others = data.filter(function (p) { return p.slug !== currentPost.slug; });
      var same = others.filter(function (p) { return (p.category || "").toLowerCase() === cat; });
      var pick = (same.length >= 2 ? same : others).slice(0, 3);
      if (pick.length === 0) return;
      relatedGrid.innerHTML = pick.map(postCardHTML).join("");
      show(relatedSection);
      revealCards(relatedGrid);
    };
    var cached = readCache();
    if (cached) render(cached);
    else fetch(POSTS_URL).then(function (r) { return r.ok ? r.json() : []; }).then(function (data) { writeCache(data); render(data); }).catch(function () {});
  }

  function fetchPost(slug) {
    if (!postArticle) return;
    if (SLUG_URL) {
      fetch(SLUG_URL + encodeURIComponent(slug))
        .then(function (r) { if (r.status === 404) { renderNotFound(); return null; } if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (data) { if (data) renderPost(data); })
        .catch(function (err) { console.warn("[Blog] erro post:", err); renderError(postArticle, postLoading); });
    } else {
      var cached = readCache();
      var handle = function (list) { var p = findBySlug(list, slug); if (p) renderPost(p); else renderNotFound(); };
      if (cached) { handle(cached); return; }
      fetch(POSTS_URL)
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (data) { writeCache(data); handle(data); })
        .catch(function (err) { console.warn("[Blog] erro post:", err); renderError(postArticle, postLoading); });
    }
  }

  /* ────────────────── ESTADOS ────────────────── */
  function renderError(container, loadingEl) {
    if (loadingEl) hide(loadingEl); if (!container) return; show(container);
    container.innerHTML = '<div class="blog-error"><h2>Ops, algo deu errado</h2><p>Não foi possível carregar o conteúdo. Tente novamente em alguns instantes.</p><a href="blog.html" class="pg-btn">Voltar ao blog</a></div>';
  }
  function renderNotFound() {
    if (postLoading) hide(postLoading); if (!postArticle) return; show(postArticle);
    postArticle.innerHTML = '<div class="blog-error"><h2>Artigo não encontrado</h2><p>O artigo que você procura não existe ou foi removido.</p><a href="blog.html" class="pg-btn">Voltar ao blog</a></div>';
  }

  /* ────────────────── INIT ────────────────── */
  var slug = getSlugFromURL();
  if (slug && postArticle) fetchPost(slug);
  else if (blogGrid)       fetchPosts();
})();
