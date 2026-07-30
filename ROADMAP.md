# ROADMAP — ismailepereira.com.br (blog pessoal)

> Blog pessoal no estilo **Pixel Garden**, consumindo o CMS headless "API do Alencar"
> (`ismaile-pereira.ilmoretto.tech`). Ordenado por **impacto real**, não por facilidade.
> Legenda de esforço: 🟩 rápido · 🟨 médio · 🟥 maior.

---

## ✅ Fase 0 — Publicar o que já está pronto
O blog já funciona: home nova, 9 pilares, filtro por categoria, posts vindo da API.
- [ ] `git push origin main` → GitHub Pages atualiza o domínio em 1–2 min. 🟩
- [ ] Confirmar que `ismailepereira.com.br` está apontado nas *Settings → Pages* (HTTPS ligado). 🟩
- [ ] Publicar os primeiros posts reais pelo painel do Alencar, usando os slugs de pilar
      (`fe-missao`, `leitura-filosofia`, `saude-mental`, `historia-internet`, `memes`,
      `casos-curiosos`, `e-se-fosse-assim`, `musica`, `filmes-series`). 🟩

---

## 🟠 Fase 1 — Ser encontrado (SEO & descoberta) · ✅ ENTREGUE (30/07)
**Problema:** os posts eram carregados por JavaScript. Google, WhatsApp e Instagram enxergavam
a página **vazia**. Resolvido com pré-render estático (`build.py`).

- [x] **Pré-render dos posts** (`build.py`): gera `p/<slug>/index.html` com conteúdo, `og:image`
      e JSON-LD a partir da API — o painel do Alencar segue como fonte. 🟥
- [x] **`sitemap.xml`** (home + 9 pilares + todos os posts). 🟨
- [x] **Feed RSS 2.0** (`/feed.xml`). 🟨
- [x] **`robots.txt`** apontando pro sitemap. 🟩
- [x] **`og:image` por post** (capa do post, fallback `src/img/og.png`). 🟨

**Novo fluxo de publicação:** escrever no painel do Alencar → `python build.py` → `git push`.

**Ainda em aberto (refino):**
- [ ] Rodar `build.py` automático via GitHub Action (pra não depender de rodar na mão). 🟨
- [ ] Capa `og:image` gerada por pilar (bonita) pra posts sem imagem. 🟨

**Resultado:** blog que aparece no Google e mostra card certo quando compartilhado.

---

## 🟠 Fase 2 — Experiência de leitura · ✅ ENTREGUE (30/07)
Fazer quem chega ler até o fim e clicar no próximo. (`src/js/post.js`, em todas as páginas de post.)
- [x] Página de post: **barra de progresso** de leitura + **botão compartilhar** + **voltar ao topo**. 🟨
- [x] **Índice (TOC)** automático nos textos longos (aparece com 3+ `<h2>`). 🟨
- [x] **Página 404** no estilo pixel (`404.html`). 🟩
- [~] **Capa padrão por pilar** — já existe a capa decorativa por cor/ícone no `blog.js`;
      falta uma versão mais caprichada (fica junto do refino da Fase 1). 🟩

---

## 🟡 Fase 3 — Reter e crescer audiência
- [ ] **Captura de e-mail** ("receba os novos textos") — reaproveitar `lead.js` + Firebase do site da Jéssica. 🟨
- [ ] **Analytics** (Plausible ou GA4) — saber o que as pessoas realmente leem. 🟩
- [ ] **Home com destaque**: um post em destaque no topo + botão **"Surpreenda-me"** (post aleatório),
      que combina com os pilares "Casos curiosos" e "E se fosse assim". 🟨
- [ ] **Posts relacionados** já existem — refinar pra priorizar o mesmo pilar. 🟩

---

## 🟢 Fase 4 — Identidade & conforto
- [ ] **Modo noturno** (o Pixel Garden fica ótimo em tema escuro; leitura noturna pede). 🟨
- [ ] **Página "Sobre" dedicada** (`/sobre`) — a história de missionário/leitor rende conexão. 🟩
- [ ] **Acessibilidade**: revisar contraste e a fonte pixel de 8px (tags/rodapé) pra legibilidade. 🟨
- [ ] **PWA** pra leitura offline (já dominado no D&D Toolkit). 🟨

---

## ♾️ Fase 5 — Conteúdo & curadoria (contínuo)
Sem isso, o blog fica bonito e vazio.
- [ ] **Tom por pilar** definido (fé x memes x filosofia pedem vozes diferentes). 🟩
- [ ] **Calendário editorial** leve — 1 post fixo/semana por um pilar rotativo. 🟩
- [ ] **Séries** (ex.: "E se fosse assim" numerado) pra criar hábito de retorno. 🟨
- [ ] Revisitar/atualizar posts antigos que forem bem (bom pra SEO). 🟩

---

### Ordem recomendada
**0 → 1 → 2 → 3 → 4**, com a **Fase 5 rodando em paralelo desde o dia 1**
(conteúdo é o que dá vida; o resto é infraestrutura pra esse conteúdo ser visto).
