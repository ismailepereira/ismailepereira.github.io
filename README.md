# ismailepereira.github.io

Site profissional de **Ismaile Pereira · Estúdio Digital** — publicado em
[ismailepereira.github.io](https://ismailepereira.github.io) via GitHub Pages.

One-page estático (HTML + CSS + JS, sem build, sem dependências) com a identidade
visual da marca (azul-tinta + grafite + brass, tipografia editorial).

## O que é

Apresenta os serviços (com faixas de investimento), o portfólio de projetos reais,
o processo de trabalho e os contatos. Foco em converter visita em conversa no WhatsApp.

## Estrutura

```
.
├── index.html              página única (hero, serviços, microSaaS, portfólio, processo, contato)
├── src/
│   ├── css/
│   │   ├── tokens.css       variáveis da marca (cores, fontes, layout)
│   │   ├── base.css         reset, tipografia, utilitários
│   │   ├── components.css   nav, hero, cartões, faixas, rodapé, responsivo
│   │   └── style.css        ponto único de @import
│   ├── js/
│   │   └── main.js          menu mobile, scroll suave, reveal, ano
│   └── img/
│       ├── favicon.svg      monograma IP
│       └── og.png           imagem de compartilhamento (gerada por scripts/og.js)
└── scripts/
    └── og.js                gera src/img/og.png (Open Graph)
```

## Como rodar localmente

Sem build. Basta servir a pasta:

```bash
python -m http.server 8000
# abra http://localhost:8000
```

## Como editar

- **Textos/seções:** `index.html`
- **Cores e fontes:** `src/css/tokens.css`
- **Componentes/layout:** `src/css/components.css`
- **Imagem de compartilhamento:** rode `node scripts/og.js` após editar a marca

## Blog (SEO / pré-render)

Os posts vêm do CMS "API do Alencar". Para o Google e o compartilhamento verem o
conteúdo, cada post é **pré-renderizado** como página estática:

```bash
python build.py     # gera p/<slug>/index.html, sitemap.xml, feed.xml, robots.txt
```

Rode `build.py` **sempre que publicar/editar um post** no painel do Alencar, antes do push.
A listagem (`blog.html`) segue lendo a API ao vivo; só as páginas individuais e o sitemap
precisam do rebuild.

## Publicação

```bash
python build.py && git push   # na main — GitHub Pages atualiza em 1–2 min
```

---

Desenvolvido por [ismailepereira](https://ismailepereira.github.io/)
