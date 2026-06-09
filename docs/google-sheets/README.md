# Cadastros → Google Sheets

O formulário de cadastro do site salva os dados direto numa planilha do Google,
de graça, sem servidor. A ponte é um **Google Apps Script** publicado como Web App.

Enquanto você não configurar, o formulário **funciona mesmo assim**: ele envia o
cadastro pelo seu WhatsApp. Configurar o Sheets é opcional, mas recomendado.

## Passo a passo (5 minutos)

1. **Crie a planilha**
   - Acesse [sheets.new](https://sheets.new) e dê um nome (ex: "Cadastros do site").
   - Copie o **ID** da planilha: está na URL, entre `/d/` e `/edit`.
     Ex: `https://docs.google.com/spreadsheets/d/`**`1AbC...xyz`**`/edit`

2. **Abra o Apps Script**
   - Na planilha: menu **Extensões → Apps Script**.
   - Apague o conteúdo e cole o código de [`Code.gs`](Code.gs).
   - Na linha `var SHEET_ID = '...'`, cole o **ID** do passo 1.
   - Salve (ícone de disquete).

3. **Publique como Web App**
   - Clique em **Implantar → Nova implantação**.
   - Em "Tipo", escolha **App da Web**.
   - Configure:
     - **Executar como:** Eu (sua conta).
     - **Quem pode acessar:** **Qualquer pessoa**.
   - Clique em **Implantar** e **autorize** o acesso (é a sua própria conta).
   - Copie a **URL do app da Web** (termina em `/exec`).

4. **Plugue no site**
   - Abra `src/js/config.js`.
   - Cole a URL em `window.CADASTRO_ENDPOINT = "COLE_AQUI";`
   - Faça commit + push. Pronto: os cadastros caem na planilha.

## Testar

- Abra a URL do Web App no navegador: deve responder
  `{"ok":true,"msg":"Endpoint de cadastro ativo."}`.
- Envie um cadastro de teste pelo site e confira a aba **Cadastros** na planilha.

## Colunas gravadas

`Data/Hora · Nome · WhatsApp · E-mail · Serviço · Mensagem · Origem`

## Observações

- Sempre que **alterar o `Code.gs`**, crie uma **nova implantação** (ou
  "Gerenciar implantações → editar → nova versão") para a mudança valer.
- O honeypot do formulário (`campo "empresa"`) corta a maior parte do spam de bots.
- Quer receber um e-mail a cada cadastro? Dá pra adicionar `MailApp.sendEmail(...)`
  dentro do `doPost`. Me chame que eu incluo.

---

Desenvolvido por [ismailepereira](https://ismailepereira.github.io/)
