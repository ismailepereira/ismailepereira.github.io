#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build.py — Pré-render do blog para SEO.

Busca os posts na API do Alencar e gera, na raiz do site:
  - p/<slug>/index.html   -> página estática de cada post (conteúdo já no HTML)
  - sitemap.xml           -> mapa do site (home + pilares + posts)
  - feed.xml              -> RSS 2.0
  - robots.txt            -> aponta pro sitemap

Fluxo: publicar no painel do Alencar  ->  python build.py  ->  git push.

Sem o pré-render, os buscadores e o compartilhamento (WhatsApp/Instagram) veem a
página vazia, porque o conteúdo dos posts é carregado por JavaScript.
"""

import json
import os
import re
import sys
import html
from datetime import datetime, timezone
from email.utils import format_datetime
from urllib.request import urlopen, Request

# ─────────────────────────── CONFIG ───────────────────────────
SITE     = "https://ismailepereira.com.br"
API_BASE = "https://ismaile-pereira.ilmoretto.tech"
POSTS_URL = API_BASE + "/api/postagens"
SLUG_URL  = API_BASE + "/api/postagens/slug/"
LOCAL_JSON = "blog/posts.json"          # fallback se a API estiver fora
ROOT = os.path.dirname(os.path.abspath(__file__))
OG_DEFAULT = SITE + "/src/img/og.png"
AUTHOR = "Ismaile Pereira"

RESERVADOS = {"index", "blog", "blog-post", "servicos", "forja", "postar", "p", "src", "404"}

# Pilares (espelha src/js/blog.js) — slug -> (label, cor)
CATEGORIES = {
    "fe-missao":         ("Fé & Missão",         "#BF5A30"),
    "leitura-filosofia": ("Leitura & Filosofia", "#9C6B4A"),
    "saude-mental":      ("Saúde mental",         "#4E7C74"),
    "historia-internet": ("História & Internet",  "#77556B"),
    "memes":             ("Memes",                "#C08A2E"),
    "casos-curiosos":    ("Casos curiosos",       "#A64B57"),
    "e-se-fosse-assim":  ("E se fosse assim",      "#4A5A45"),
    "musica":            ("Música",               "#8B9A75"),
    "filmes-series":     ("Filmes & Séries",      "#2E3A2F"),
}
ALIASES = {
    "fe-e-missao": "fe-missao", "leitura-e-filosofia": "leitura-filosofia",
    "filosofia": "leitura-filosofia", "leitura": "leitura-filosofia",
    "historia-cultura-de-internet": "historia-internet",
    "historia-e-cultura-de-internet": "historia-internet",
    "cultura-de-internet": "historia-internet", "historia": "historia-internet",
    "meme": "memes", "curiosidades": "casos-curiosos", "e-se": "e-se-fosse-assim",
    "filmes-e-series": "filmes-series", "filmes": "filmes-series", "series": "filmes-series",
}


def slugify(raw):
    import unicodedata
    s = unicodedata.normalize("NFD", str(raw or "")).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s


def cat_info(raw):
    key = slugify(raw)
    key = ALIASES.get(key, key)
    if key in CATEGORIES:
        label, color = CATEGORIES[key]
        return key, label, color
    nice = key.replace("-", " ").capitalize() if key else "Diário"
    return key, nice, "#8B9A75"


def parse_date(iso):
    if not iso:
        return datetime.now(timezone.utc)
    try:
        return datetime.strptime(str(iso)[:19], "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)


MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
         "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]


def data_pt(dt):
    return "%02d de %s de %d" % (dt.day, MESES[dt.month - 1], dt.year)


def reading_time(content):
    words = len(re.sub(r"<[^>]+>", " ", content or "").split())
    return max(1, round(words / 200))


def esc(s):
    return html.escape(str(s or ""), quote=True)


def fetch_json(url):
    req = Request(url, headers={"User-Agent": "ismaile-build/1.0"})
    with urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def load_posts():
    try:
        lista = fetch_json(POSTS_URL)
        print("  API: %d posts" % len(lista))
    except Exception as e:
        print("  ! API indisponível (%s). Usando %s" % (e, LOCAL_JSON))
        with open(os.path.join(ROOT, LOCAL_JSON), encoding="utf-8") as f:
            lista = json.load(f)
    full = []
    for p in lista:
        # garante content completo (o endpoint de lista pode vir resumido)
        if not p.get("content"):
            try:
                p = fetch_json(SLUG_URL + p["slug"])
            except Exception:
                pass
        full.append(p)
    return full


# ─────────────────────────── TEMPLATE ───────────────────────────
HEAD = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} | Ismaile Pereira</title>
  <meta name="description" content="{desc}">
  <meta name="author" content="Ismaile Pereira">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="{ogimg}">
  <meta property="og:url" content="{url}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23F4F0E6'/%3E%3Cpath d='M30 62 a20 20 0 0 1 40 0 z' fill='%23BF5A30'/%3E%3Crect x='22' y='70' width='56' height='4' rx='2' fill='%232E3A2F'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&family=Press+Start+2P&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config={{theme:{{extend:{{fontFamily:{{display:['"Playfair Display"','Georgia','serif'],body:['Inter','system-ui','sans-serif'],pixel:['"Press Start 2P"','monospace']}},colors:{{cream:{{DEFAULT:'#F4F0E6',light:'#FBF9F2'}},terra:{{DEFAULT:'#BF5A30',dark:'#A24A26',light:'#D4774F'}},forest:{{DEFAULT:'#2E3A2F',light:'#4A5A45'}},sage:{{DEFAULT:'#8B9A75',soft:'#E7EADD'}}}}}}}}}}
  </script>
  <link rel="stylesheet" href="../../src/css/pixel-garden.css">
  <style>
    body{{font-family:'Inter',system-ui,sans-serif}}
    h1,h2,h3,h4{{font-family:'Playfair Display',Georgia,serif;color:#2E3A2F}}
  </style>
  <script type="application/ld+json">{jsonld}</script>
</head>
<body class="bg-cream text-forest antialiased overflow-x-hidden">
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-cream/85 border-b border-sage/10">
    <div class="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
      <a href="../../index.html" class="flex items-center gap-3" aria-label="Ismaile Pereira, início">
        <img src="../../src/img/logo.png" alt="Logo Ismaile Pereira" class="w-10 h-10 rounded-lg object-contain">
        <span>
          <span class="font-display font-bold text-forest text-base leading-none block">Ismaile Pereira</span>
          <span class="text-[10px] font-semibold tracking-[.2em] text-terra uppercase">Blog pessoal</span>
        </span>
      </a>
      <nav class="hidden md:flex items-center gap-7" aria-label="Navegação principal">
        <a href="../../index.html" class="text-sm text-forest-light hover:text-terra font-medium">Início</a>
        <a href="../../index.html#pilares" class="text-sm text-forest-light hover:text-terra font-medium">Pilares</a>
        <a href="../../blog.html" class="text-sm text-terra font-semibold">Blog</a>
        <a href="../../index.html#sobre" class="text-sm text-forest-light hover:text-terra font-medium">Sobre</a>
        <a href="../../servicos.html" class="text-sm text-sage hover:text-terra font-medium">Serviços</a>
      </nav>
      <a href="../../blog.html" class="md:inline-flex"><span class="pg-btn pg-btn--light" style="padding:8px 16px;font-size:.8rem">Voltar ao blog</span></a>
    </div>
  </header>
  <main>
    <section class="py-12 md:py-16">
      <div class="max-w-6xl mx-auto px-5">
        <div class="post-wrap mx-auto">
"""

FOOT = """        </div>
      </div>
    </section>
  </main>
  <footer class="py-10 bg-forest text-cream">
    <div class="max-w-6xl mx-auto px-5">
      <div class="flex flex-wrap gap-4 justify-between items-center text-xs" style="color:rgba(244,240,230,.5)">
        <a href="../../index.html" class="hover:text-terra-light" style="color:rgba(244,240,230,.7)">← Voltar ao início</a>
        <span>&copy; {year} Ismaile Pereira · Mirante da Serra, RO</span>
      </div>
    </div>
  </footer>
  <script src="../../src/js/post.js"></script>
</body>
</html>
"""


def render_post(post, related):
    slug = post["slug"]
    key, label, color = cat_info(post.get("category"))
    dt = parse_date(post.get("createdAt"))
    upd = parse_date(post.get("updatedAt") or post.get("createdAt"))
    url = "%s/p/%s/" % (SITE, slug)
    title = post.get("title") or "Sem título"
    desc = (post.get("excerpt") or re.sub(r"<[^>]+>", " ", post.get("content") or "")[:160]).strip()
    ogimg = post.get("coverImage") or OG_DEFAULT
    rt = reading_time(post.get("content"))

    jsonld = json.dumps({
        "@context": "https://schema.org", "@type": "Article",
        "headline": title, "description": desc, "image": ogimg,
        "datePublished": dt.isoformat(), "dateModified": upd.isoformat(),
        "author": {"@type": "Person", "name": AUTHOR, "url": SITE},
        "publisher": {"@type": "Organization", "name": "Ismaile Pereira",
                       "logo": {"@type": "ImageObject", "url": SITE + "/src/img/logo.png"}},
        "articleSection": label, "mainEntityOfPage": {"@type": "WebPage", "@id": url},
    }, ensure_ascii=False)

    cover = ""
    if post.get("coverImage"):
        cover = '<div class="post-cover"><img src="%s" alt="%s"></div>' % (esc(post["coverImage"]), esc(title))

    parts = [HEAD.format(title=esc(title), desc=esc(desc), url=esc(url), ogimg=esc(ogimg), jsonld=jsonld)]
    parts.append(
        '<nav class="blog-breadcrumb"><a href="../../index.html">Início</a><span class="sep">/</span>'
        '<a href="../../blog.html">Blog</a><span class="sep">/</span><span>%s</span></nav>' % esc(title))
    parts.append('<header class="post-header">')
    parts.append('<span class="blog-tag tag--terra" style="background:%s">%s</span>' % (color, esc(label)))
    parts.append('<h1>%s</h1>' % esc(title))
    parts.append('<p class="post-date"><time datetime="%s">%s</time> · %d min de leitura</p>'
                 % (esc(post.get("createdAt")), data_pt(dt), rt))
    parts.append('</header>')
    parts.append(cover)
    parts.append('<div class="post-content">%s</div>' % (post.get("content") or ""))

    # bio do autor
    parts.append(
        '<aside class="post-author">'
        '<div class="post-author__avatar"><img src="../../src/img/ismaile.jpg" alt="Ismaile Pereira"></div>'
        '<div class="post-author__body"><h3>Ismaile Pereira</h3>'
        '<p>Missionário adventista de Mirante da Serra (RO). Escrevo sobre fé, livros, a mente e a '
        'cultura estranha da internet — este blog é meu caderno público.</p>'
        '<a href="../../index.html#sobre" class="post-author__link">Conhecer o autor →</a></div></aside>')

    # relacionados (estáticos, bom pra SEO)
    if related:
        parts.append('<section class="post-related"><h2>Continue lendo</h2><div class="blog-grid">')
        for r in related:
            rk, rl, rc = cat_info(r.get("category"))
            parts.append(
                '<a class="blog-card is-visible" href="../%s/">'
                '<div class="blog-card__body"><div class="blog-card__top">'
                '<span class="blog-tag" style="background:%s;border:2px solid #2E3A2F">%s</span></div>'
                '<h2 class="blog-card__title">%s</h2>'
                '<p class="blog-card__excerpt">%s</p>'
                '<span class="blog-card__read">Ler artigo →</span></div></a>'
                % (esc(r["slug"]), rc, esc(rl), esc(r.get("title")), esc(r.get("excerpt") or "")))
        parts.append('</div></section>')

    parts.append('<a href="../../blog.html" class="post-back">← Voltar ao blog</a>')
    parts.append(FOOT.format(year=datetime.now(timezone.utc).year))
    return "".join(parts)


def pick_related(post, allposts, n=3):
    key, _, _ = cat_info(post.get("category"))
    others = [p for p in allposts if p.get("slug") != post.get("slug")]
    same = [p for p in others if cat_info(p.get("category"))[0] == key]
    pool = same if len(same) >= 2 else others
    return pool[:n]


def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    print("→ Buscando posts...")
    posts = load_posts()
    posts = [p for p in posts if p.get("slug")]
    posts.sort(key=lambda p: parse_date(p.get("createdAt")), reverse=True)

    built = []
    for p in posts:
        slug = p["slug"]
        if slug in RESERVADOS:
            print("  ! slug reservado ignorado: %s" % slug)
            continue
        write("p/%s/index.html" % slug, render_post(p, pick_related(p, posts)))
        built.append(p)
    print("→ %d páginas de post geradas em p/<slug>/" % len(built))

    # ── sitemap.xml ──
    urls = [(SITE + "/", "1.0"), (SITE + "/blog.html", "0.9"), (SITE + "/servicos.html", "0.5")]
    for key in CATEGORIES:
        urls.append((SITE + "/blog.html?cat=" + key, "0.6"))
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, pr in urls:
        sm.append("  <url><loc>%s</loc><priority>%s</priority></url>" % (esc(loc), pr))
    for p in built:
        lm = parse_date(p.get("updatedAt") or p.get("createdAt")).date().isoformat()
        sm.append("  <url><loc>%s/p/%s/</loc><lastmod>%s</lastmod><priority>0.8</priority></url>"
                  % (SITE, esc(p["slug"]), lm))
    sm.append("</urlset>")
    write("sitemap.xml", "\n".join(sm) + "\n")
    print("→ sitemap.xml (%d URLs)" % (len(urls) + len(built)))

    # ── feed.xml (RSS 2.0) ──
    rss = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<rss version="2.0"><channel>',
           '<title>Ismaile Pereira · Blog</title>',
           '<link>%s/</link>' % SITE,
           '<description>Fé, livros, a mente e a cultura estranha da internet.</description>',
           '<language>pt-BR</language>']
    for p in built[:30]:
        dt = parse_date(p.get("createdAt"))
        rss.append("<item><title>%s</title><link>%s/p/%s/</link>"
                   "<guid>%s/p/%s/</guid><pubDate>%s</pubDate>"
                   "<description>%s</description></item>"
                   % (esc(p.get("title")), SITE, esc(p["slug"]), SITE, esc(p["slug"]),
                      format_datetime(dt), esc(p.get("excerpt") or "")))
    rss.append("</channel></rss>")
    write("feed.xml", "\n".join(rss) + "\n")
    print("→ feed.xml (%d itens)" % min(len(built), 30))

    # ── robots.txt ──
    write("robots.txt", "User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n" % SITE)
    print("→ robots.txt")
    print("✓ build concluído.")


if __name__ == "__main__":
    main()
