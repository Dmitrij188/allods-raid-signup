const SHEET_NAME = 'Лист1';

// Google Apps Script's web app responses already include the
// `Access-Control-Allow-Origin: *` header. Attempting to call
// `setHeader()` on a TextOutput object results in a runtime error,
// so we simply return the output object directly.

function doGet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const rows = sheet.getDataRange().getValues();
    rows.shift(); // убираем заголовки
    const payload = { status: 'ok', data: rows };
    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    const payload = { status: 'error', message: String(err) };
    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);

    const row = [
      data.name,
      data.className,
      data.role,
      data.role2,
      data.role3,
      data.raidId,
      data.level || '',
      data.gearScore || '',
      data.guild || '',
      data.faction || '',
      data.server || ''
    ];

    // Гарантируем нужное количество столбцов
    const neededCols = row.length;
    const currentCols = sheet.getMaxColumns();
    if (currentCols < neededCols) {
      sheet.insertColumnsAfter(currentCols, neededCols - currentCols);
    }

    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    const payload = { status: 'error', message: String(err) };
    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Note: Apps Script does not route HTTP OPTIONS requests to this handler.
// Preflight requests will therefore not reach the script. Instead of
// relying on doOptions(), avoid custom headers in the frontend so that
// the browser sends a "simple" request without a preflight.
function doOptions() {
  // This handler will rarely be used since browsers won't
  // send preflight requests to Apps Script Web Apps.
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
