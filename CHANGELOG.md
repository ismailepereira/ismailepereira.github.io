# CHANGELOG — ismailepereira.com.br

## 2026-07-30 — Reestruturação: site pessoal → blog

Transformação da home (antes uma landing de venda de sites) em **blog pessoal**
no estilo visual **Pixel Garden** (8-bit + line art, paleta cream/terra/forest/sage),
consumindo o CMS headless "API do Alencar" já plugado (`ismaile-pereira.ilmoretto.tech`).

**Backup:** `versoes/2026-07-30-blog-pessoal/` (index, blog, blog-post, postar, blog.js, pixel-garden.css originais).

Mudanças:
- `index.html` — reescrito como home de blog pessoal (hero pessoal, grade de 9 pilares,
  últimos escritos via API, sobre pessoal). Visual unificado ao Pixel Garden do blog.
- `servicos.html` — **novo**: conteúdo comercial antigo (serviços, portfólio, CTA WhatsApp)
  movido para cá, acessível por link discreto.
- `src/js/blog.js` — categorias trocadas pelos 9 pilares (Fé & Missão, Leitura & Filosofia,
  Saúde mental, História & Internet, Memes, Casos curiosos, E se fosse assim, Música,
  Filmes & Séries) + aliases; ícones pixel por categoria; capa decorativa por cor do pilar;
  render da home (`#home-grid`, últimos 6); filtro por pilar (`?cat=` na blog.html);
  bio do autor e CTA reescritos (pessoal, sem venda de site).
- `src/css/pixel-garden.css` — cores de tag novas (clay/teal/plum/gold/berry/ink),
  `.pilar-grid`/`.pilar-card`, `.pilar-frame`, barra de filtro e chips.
- `blog.html` — hero + nav + footer pessoais; chips de categoria; barra de filtro.
- `blog-post.html` — nav + footer pessoais; float de WhatsApp removido.
- `postar.html` — lista de categorias do editor atualizada para os 9 pilares.
