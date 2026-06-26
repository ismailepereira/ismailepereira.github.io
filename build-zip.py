#!/usr/bin/env python3
"""
Gera um pacote (.zip) do site pronto para hospedagem (Hostinger / public_html).

- Cria uma versao NOVA numerada e datada em `versoes/ismaile-site-vN-AAAA-MM-DD.zip`
- NUNCA apaga as versoes antigas (ficam todas em `versoes/`)
- Atualiza tambem uma copia "mais recente" em `ismaile-site.zip` (raiz)

Diferenca pro site da Jessica: aqui as paginas ficam na RAIZ do projeto
(index.html, blog.html, blog-post.html), nao dentro de `src/`. Entao o script
empacota a partir da raiz, ignorando os arquivos de desenvolvimento. O conteudo
fica na raiz do zip -> e so extrair direto na `public_html`.

Uso:  python build-zip.py
"""
import os, re, zipfile, datetime, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
VDIR = os.path.join(ROOT, "versoes")
PREFIX = "ismaile-site"

# Pastas e arquivos que NAO vao pro pacote de deploy
IGNORE_DIRS  = {".git", ".github", ".claude", "docs", "scripts", "versoes",
                "node_modules", "__pycache__", ".vscode", ".idea", "venv", ".venv"}
IGNORE_FILES = {"build-zip.py", "README.md", ".gitignore", "postar.html"}
IGNORE_EXT   = {".zip", ".py", ".pyc", ".log"}

os.makedirs(VDIR, exist_ok=True)

# descobre a proxima versao a partir dos zips ja existentes
nums = []
for f in os.listdir(VDIR):
    m = re.match(rf"{PREFIX}-v(\d+)-", f)
    if m:
        nums.append(int(m.group(1)))
ver = (max(nums) + 1) if nums else 1
date = datetime.date.today().isoformat()
name = f"{PREFIX}-v{ver}-{date}.zip"
out = os.path.join(VDIR, name)

def keep(fname):
    if fname in IGNORE_FILES:
        return False
    return os.path.splitext(fname)[1].lower() not in IGNORE_EXT

# empacota a partir da raiz (estrutura pronta pra public_html)
count = 0
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            if not keep(f):
                continue
            full = os.path.join(root, f)
            z.write(full, os.path.relpath(full, ROOT))
            count += 1

# copia "mais recente" na raiz (conveniencia)
shutil.copy(out, os.path.join(ROOT, f"{PREFIX}.zip"))

kb = os.path.getsize(out) / 1024
print(f"OK -> versoes/{name}")
print(f"     {count} arquivos, {kb:.1f} KB")
print(f"Copia mais recente: {PREFIX}.zip")
print("Versoes guardadas:")
for f in sorted(os.listdir(VDIR)):
    if f.endswith(".zip"):
        print("  -", f)
