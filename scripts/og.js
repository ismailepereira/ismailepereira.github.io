/* Gera a imagem de compartilhamento (Open Graph) 1200x630 com a marca.
   Uso:  NODE_PATH=<global node_modules> node scripts/og.js               */
const sharp = require("sharp");
const path = require("path");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#15243E"/>
  <rect width="1200" height="10" fill="#BE9A4E"/>
  <!-- monograma -->
  <rect x="92" y="120" width="150" height="150" rx="30" fill="#1B2C49" stroke="#BE9A4E" stroke-width="2"/>
  <text x="167" y="225" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="78">
    <tspan fill="#FFFFFF">I</tspan><tspan fill="#BE9A4E">P</tspan>
  </text>
  <!-- textos -->
  <text x="92" y="360" font-family="Georgia, serif" font-weight="700" font-size="86" fill="#FFFFFF">Ismaile Pereira</text>
  <text x="96" y="410" font-family="'Segoe UI', Arial, sans-serif" font-weight="700" font-size="26" letter-spacing="10" fill="#BE9A4E">ESTÚDIO DIGITAL</text>
  <text x="92" y="500" font-family="'Segoe UI', Arial, sans-serif" font-size="34" fill="#C7D0E0">Sites · Tráfego Pago · Social Media · Automação · MicroSaaS</text>
  <text x="92" y="560" font-family="'Segoe UI', Arial, sans-serif" font-size="26" fill="#8A93A6">Construído de ponta a ponta, com casos reais.</text>
</svg>`;

const out = path.join(__dirname, "..", "src", "img", "og.png");
sharp(Buffer.from(svg))
  .png()
  .toFile(out)
  .then(() => console.log("OG gerada ->", out))
  .catch((e) => { console.error(e); process.exit(1); });
