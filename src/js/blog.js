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
  var API_BASE   = "https://ismaile-pereira.ilmoretto.tech";  // API do Alencar (Vercel). Use "" para voltar ao JSON local.
  var LOCAL_URL  = "blog/posts.json";
  var POSTS_URL  = API_BASE ? API_BASE + "/api/postagens" : LOCAL_URL;
  var SLUG_URL   = API_BASE ? API_BASE + "/api/postagens/slug/" : null;

  var CACHE_KEY  = "blogPostsCache";
  var CACHE_TTL  = 5 * 60 * 1000;  // 5 min
  var SITE_URL   = location.origin + location.pathname.replace(/[^/]*$/, "");
  var WA_NUMBER  = "5569999688625";

  /* ─── Pilares do blog pessoal ───
     A `key` é o slug normalizado da categoria (sem acento, minúsculo).
     Ao publicar no CMS do Alencar, use estes valores no campo "categoria":
       fe-missao · leitura-filosofia · saude-mental · historia-internet ·
       memes · casos-curiosos · e-se-fosse-assim · musica · filmes-series
     `color` é usado na capa decorativa quando o post não tem imagem. */
  var CATEGORIES = {
    "fe-missao":          { label: "Fé & Missão",        cls: "tag--terra",  color: "#BF5A30", icon: "cross" },
    "leitura-filosofia":  { label: "Leitura & Filosofia", cls: "tag--clay",   color: "#9C6B4A", icon: "book"  },
    "saude-mental":       { label: "Saúde mental",        cls: "tag--teal",   color: "#4E7C74", icon: "heart" },
    "historia-internet":  { label: "História & Internet",  cls: "tag--plum",   color: "#77556B", icon: "globe" },
    "memes":              { label: "Memes",               cls: "tag--gold",   color: "#C08A2E", icon: "meme"  },
    "casos-curiosos":     { label: "Casos curiosos",      cls: "tag--berry",  color: "#A64B57", icon: "curio" },
    "e-se-fosse-assim":   { label: "E se fosse assim",     cls: "tag--forest", color: "#4A5A45", icon: "spark" },
    "musica":             { label: "Música",              cls: "tag--sage",   color: "#8B9A75", icon: "music" },
    "filmes-series":      { label: "Filmes & Séries",     cls: "tag--ink",    color: "#2E3A2F", icon: "film"  }
  };
  /* Apelidos: rótulos que o CMS pode devolver escritos por extenso */
  var CAT_ALIASES = {
    "fe-e-missao": "fe-missao",
    "leitura-e-filosofia": "leitura-filosofia", "filosofia": "leitura-filosofia", "leitura": "leitura-filosofia",
    "historia-cultura-de-internet": "historia-internet", "historia-e-cultura-de-internet": "historia-internet",
    "cultura-de-internet": "historia-internet", "historia": "historia-internet",
    "meme": "memes", "casos-curiosos": "casos-curiosos", "curiosidades": "casos-curiosos",
    "e-se": "e-se-fosse-assim", "filmes-e-series": "filmes-series", "filmes": "filmes-series", "series": "filmes-series"
  };
  function catSlug(raw) {
    return String(raw || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function categoryInfo(raw) {
    if (!raw) return { label: "Diário", cls: "tag--sage", color: "#8B9A75", icon: "leaf" };
    var key = catSlug(raw);
    if (CAT_ALIASES[key]) key = CAT_ALIASES[key];
    if (CATEGORIES[key]) return CATEGORIES[key];
    var nice = key.replace(/-/g, " ").replace(/^\w/, function (c) { return c.toUpperCase(); });
    return { label: nice || String(raw), cls: "tag--sage", color: "#8B9A75", icon: "leaf" };
  }

  /* ────────────────── ÍCONES PIXEL (8-bit, inline) ────────────────── */
  function px(name) {
    var s = {
      clock: '<rect x="5" y="2" width="6" height="2"/><rect x="3" y="4" width="2" height="2"/><rect x="11" y="4" width="2" height="2"/><rect x="2" y="6" width="2" height="4"/><rect x="12" y="6" width="2" height="4"/><rect x="3" y="10" width="2" height="2"/><rect x="11" y="10" width="2" height="2"/><rect x="5" y="12" width="6" height="2"/><rect x="7" y="5" width="2" height="4"/><rect x="9" y="7" width="2" height="2"/>',
      arrow: '<rect x="2" y="7" width="8" height="2"/><rect x="8" y="5" width="2" height="2"/><rect x="10" y="7" width="2" height="2"/><rect x="8" y="9" width="2" height="2"/><rect x="6" y="3" width="2" height="2"/><rect x="6" y="11" width="2" height="2"/>',
      leaf: '<rect x="7" y="2" width="2" height="12"/><rect x="3" y="5" width="4" height="2"/><rect x="1" y="6" width="2" height="2"/><rect x="9" y="8" width="4" height="2"/><rect x="13" y="9" width="2" height="2"/>',
      msg: '<rect x="2" y="3" width="12" height="2"/><rect x="2" y="5" width="2" height="6"/><rect x="12" y="5" width="2" height="6"/><rect x="2" y="11" width="8" height="2"/><rect x="5" y="13" width="2" height="2"/><rect x="5" y="7" width="2" height="2"/><rect x="9" y="7" width="2" height="2"/>',
      cross: '<rect x="7" y="1" width="2" height="13"/><rect x="4" y="4" width="8" height="2"/>',
      book:  '<rect x="2" y="3" width="5" height="11"/><rect x="9" y="3" width="5" height="11"/><rect x="7" y="4" width="2" height="10"/>',
      heart: '<rect x="3" y="4" width="3" height="2"/><rect x="10" y="4" width="3" height="2"/><rect x="2" y="6" width="12" height="2"/><rect x="3" y="8" width="10" height="2"/><rect x="5" y="10" width="6" height="2"/><rect x="7" y="12" width="2" height="2"/>',
      globe: '<rect x="5" y="2" width="6" height="2"/><rect x="3" y="4" width="10" height="2"/><rect x="2" y="6" width="12" height="4"/><rect x="3" y="10" width="10" height="2"/><rect x="5" y="12" width="6" height="2"/>',
      meme:  '<rect x="4" y="2" width="8" height="2"/><rect x="2" y="4" width="2" height="8"/><rect x="12" y="4" width="2" height="8"/><rect x="4" y="12" width="8" height="2"/><rect x="5" y="6" width="2" height="2"/><rect x="9" y="6" width="2" height="2"/><rect x="5" y="9" width="6" height="2"/>',
      curio: '<rect x="3" y="2" width="6" height="2"/><rect x="1" y="4" width="2" height="6"/><rect x="9" y="4" width="2" height="6"/><rect x="3" y="10" width="6" height="2"/><rect x="10" y="11" width="2" height="2"/><rect x="12" y="13" width="2" height="2"/>',
      spark: '<rect x="7" y="1" width="2" height="5"/><rect x="7" y="10" width="2" height="5"/><rect x="1" y="7" width="5" height="2"/><rect x="10" y="7" width="5" height="2"/><rect x="7" y="7" width="2" height="2"/>',
      music: '<rect x="10" y="2" width="2" height="9"/><rect x="5" y="4" width="2" height="9"/><rect x="7" y="2" width="5" height="2"/><rect x="3" y="11" width="4" height="3"/><rect x="10" y="9" width="4" height="3"/>',
      film:  '<rect x="2" y="2" width="12" height="2"/><rect x="2" y="12" width="12" height="2"/><rect x="2" y="4" width="2" height="8"/><rect x="12" y="4" width="2" height="8"/><rect x="6" y="5" width="4" height="6"/>'
    };
    return '<svg class="px-ic" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><g fill="currentColor">' + (s[name] || "") + '</g></svg>';
  }

  /* Capa decorativa Pixel Garden (sol + plantinha) quando não há imagem */
  function decorCover(post) {
    var info = categoryInfo(post.category || post.categoria);
    var c = info.color || "#BF5A30";
    /* Painel pixel: fundo tonalizado com a cor do pilar + o ícone da categoria
       grande e centralizado, como um "brasão" de 8-bit. */
    return ''
      + '<div class="blog-card__cover blog-card__cover--decor" style="background:' + c + '14">'
      +   '<svg viewBox="0 0 120 80" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges" aria-hidden="true">'
      +     '<g fill="' + c + '" opacity="0.14">'
      +       '<rect x="6" y="8" width="6" height="6"/><rect x="108" y="12" width="6" height="6"/><rect x="14" y="62" width="6" height="6"/><rect x="100" y="60" width="6" height="6"/>'
      +     '</g>'
      +     '<g transform="translate(44,24) scale(2)" fill="' + c + '">' + (px_raw(info.icon) || px_raw("leaf")) + '</g>'
      +   '</svg>'
      + '</div>';
  }
  /* Retorna só os <rect> de um ícone (para uso dentro de outro <svg>) */
  function px_raw(name) {
    var m = px(name).match(/<g[^>]*>([\s\S]*?)<\/g>/);
    return m ? m[1] : "";
  }

  /* ────────────────── ELEMENTOS ────────────────── */
  var blogGrid       = document.getElementById("blog-grid");
  var blogLoading    = document.getElementById("blog-loading");
  var homeGrid       = document.getElementById("home-grid");
  var homeLoading    = document.getElementById("home-loading");
  var filterLabel    = document.getElementById("blog-filter-label");
  var HOME_LIMIT     = 6;
  var activeCat      = getParam("cat");   // filtro de pilar na blog.html
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
  function getParam(name) { return new URLSearchParams(location.search).get(name); }
  function postMatchesCat(post, wantSlug) {
    var raw = post.category || post.categoria;
    var key = catSlug(raw);
    if (CAT_ALIASES[key]) key = CAT_ALIASES[key];
    return key === wantSlug;
  }

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
    if (s === 0) s = "0";
    if (!s) return "";
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
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
    var slug = encodeURIComponent(post.slug);
    var hasContent = post.content && String(post.content).replace(/<[^>]+>/g, "").trim().length > 0;
    var readMeta = hasContent ? ' · ' + readingTime(post.content) + ' min' : '';
    return ''
      + '<a class="blog-card" href="blog-post.html?slug=' + slug + '">'
      +   postCover(post)
      +   '<div class="blog-card__body">'
      +     '<div class="blog-card__top">' + cardTag(post)
      +       '<span class="blog-card__meta">' + px("clock") + '<time datetime="' + escapeHTML(post.createdAt) + '">' + formatDate(post.createdAt) + '</time>' + readMeta + '</span>'
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
      +   '<div class="post-author__avatar"><img src="src/img/ismaile.jpg" alt="Ismaile Pereira" loading="lazy" /></div>'
      +   '<div class="post-author__body">'
      +     '<p class="post-author__eyebrow">' + px("leaf") + ' Quem escreveu isto</p>'
      +     '<h3>Ismaile Pereira</h3>'
      +     '<p>Missionário adventista de Mirante da Serra (RO). Escrevo sobre fé, livros, a mente e a cultura estranha da internet — este blog é meu caderno público.</p>'
      +     '<a href="index.html#sobre" class="post-author__link">Conhecer o autor ' + px("arrow") + '</a>'
      +   '</div>'
      + '</aside>';
  }

  function postCtaHTML(post) {
    var info = categoryInfo(post.category || post.categoria);
    var catSlugVal = "";
    var raw = post.category || post.categoria;
    if (raw) { catSlugVal = catSlug(raw); if (CAT_ALIASES[catSlugVal]) catSlugVal = CAT_ALIASES[catSlugVal]; }
    var catLink = catSlugVal ? ('blog.html?cat=' + encodeURIComponent(catSlugVal)) : 'blog.html';
    return ''
      + '<section class="post-cta">'
      +   '<div class="post-cta__inner">'
      +     '<p class="post-cta__eyebrow">' + px("leaf") + ' Gostou desta ideia?</p>'
      +     '<h3>Tem mais de onde veio.</h3>'
      +     '<p class="post-cta__sub">Se este texto te pegou, provavelmente você vai curtir o resto do que ando escrevendo por aqui.</p>'
      +     '<div class="post-cta__actions">'
      +       '<a href="' + catLink + '" class="pg-btn pg-btn--light">Mais sobre ' + escapeHTML(info.label) + '</a>'
      +       '<a href="blog.html" class="pg-btn pg-btn--ghost">Ver todos os textos</a>'
      +     '</div>'
      +   '</div>'
      + '</section>';
  }

  /* ────────────────── LISTAGEM ────────────────── */
  function renderPostList(posts) {
    if (!blogGrid) return;
    hide(blogLoading); show(blogGrid);
    posts = (posts || []).slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    /* Filtro por pilar (?cat= na blog.html) */
    if (activeCat) {
      var info = categoryInfo(activeCat);
      if (filterLabel) filterLabel.innerHTML = '<span class="blog-tag ' + info.cls + '">' + escapeHTML(info.label) + '</span> <a href="blog.html" class="blog-filter__clear">✕ limpar filtro</a>';
      posts = posts.filter(function (p) { return postMatchesCat(p, activeCat); });
      if (posts.length === 0) {
        blogGrid.innerHTML = '<div class="blog-empty"><div class="blog-empty__icon">' + px(info.icon || "leaf") + '</div><h2>Ainda não há textos em “' + escapeHTML(info.label) + '”</h2><p>Esse pilar está esperando o primeiro texto. Volte em breve.</p><a href="blog.html" class="pg-btn pg-btn--light">Ver todos os textos</a></div>';
        return;
      }
    } else if (filterLabel) {
      filterLabel.innerHTML = "";
    }

    if (posts.length === 0) {
      blogGrid.innerHTML = '<div class="blog-empty"><div class="blog-empty__icon">' + px("leaf") + '</div><h2>Em breve, os primeiros textos</h2><p>Estou preparando textos sobre fé, livros, a mente e a cultura da internet.</p></div>';
      return;
    }
    blogGrid.innerHTML = posts.map(postCardHTML).join("");
    revealCards(blogGrid);
  }

  function renderHomeList(posts) {
    if (!homeGrid) return;
    hide(homeLoading); show(homeGrid);
    posts = (posts || []).slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }).slice(0, HOME_LIMIT);
    if (posts.length === 0) {
      homeGrid.innerHTML = '<div class="blog-empty"><div class="blog-empty__icon">' + px("leaf") + '</div><h2>Os primeiros textos vêm aí</h2><p>Assim que o primeiro sair, ele aparece aqui.</p></div>';
      return;
    }
    homeGrid.innerHTML = posts.map(postCardHTML).join("");
    revealCards(homeGrid);
  }

  function fetchPosts() {
    var targets = [];
    if (blogGrid) targets.push(renderPostList);
    if (homeGrid) targets.push(renderHomeList);
    if (!targets.length) return;
    var apply = function (data) { targets.forEach(function (fn) { fn(data); }); };
    var cached = readCache(); if (cached) apply(cached);
    fetch(POSTS_URL)
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) { writeCache(data); apply(data); })
      .catch(function (err) {
        console.warn("[Blog] erro:", err);
        if (!cached) { if (blogGrid) renderError(blogGrid, blogLoading); if (homeGrid) renderError(homeGrid, homeLoading); }
      });
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
  else if (blogGrid || homeGrid) fetchPosts();
})();
