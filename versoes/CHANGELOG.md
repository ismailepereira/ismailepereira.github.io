# Versões do pacote de deploy — Ismaile Pereira · Presença Digital

Cada `ismaile-site-vN-AAAA-MM-DD.zip` (nesta pasta) é um pacote pronto para subir
na hospedagem. O conteúdo fica na **raiz do zip** → é só extrair direto na
`public_html`. **As versões antigas são sempre mantidas.** A mais recente também
fica como `../ismaile-site.zip`.

Para gerar uma versão nova: `python build-zip.py` (na raiz do projeto).

---

## v1 — 2026-06-26
- Site institucional "Presença Digital" (home): hero, problema, serviços, como
  funciona, portfólio, sobre e CTA — com fundo de partículas (Three.js) e
  animações de scroll (GSAP).
- **Blog novo** em estilo "Pixel Garden" (8-bit + line art): listagem
  (`blog.html`) e post individual (`blog-post.html`).
  - Posts em `blog/posts.json` (mesmo contrato da API do Alencar; constante
    `API_BASE` trocável em `src/js/blog.js` para plugar um CMS no futuro).
  - Cache, tempo de leitura, JSON-LD (SEO), sanitização (DOMPurify) e
    posts relacionados.
- Sistema visual do blog em `src/css/pixel-garden.css`.
- Link de **Blog** na navegação e no rodapé.
- Espaçamento da home enxugado (respiro mais proporcional entre seções).
- WhatsApp flutuante e CTAs apontando para o WhatsApp.
