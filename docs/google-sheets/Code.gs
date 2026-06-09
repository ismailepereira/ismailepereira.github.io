/**
 * Recebe os cadastros do site e salva numa planilha do Google Sheets.
 * Cole este código em Extensões → Apps Script da sua planilha e publique
 * como Web App (ver README.md desta pasta).
 */

// 1) Cole aqui o ID da sua planilha (está na URL, entre /d/ e /edit).
var SHEET_ID = 'COLE_O_ID_DA_PLANILHA_AQUI';

// 2) Nome da aba onde os dados serão gravados (criada automaticamente).
var ABA = 'Cadastros';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // evita gravações simultâneas
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(ABA) || ss.insertSheet(ABA);

    // Cria o cabeçalho na primeira vez.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Data/Hora', 'Nome', 'WhatsApp', 'E-mail', 'Serviço', 'Mensagem', 'Origem']);
      sheet.getRange('A1:G1').setFontWeight('bold');
    }

    var p = (e && e.parameter) ? e.parameter : {};
    sheet.appendRow([
      new Date(),
      p.nome || '',
      p.whatsapp || '',
      p.email || '',
      p.servico || '',
      p.mensagem || '',
      p.origem || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Permite um teste rápido abrindo a URL no navegador.
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, msg: 'Endpoint de cadastro ativo.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
