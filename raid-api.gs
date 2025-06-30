const SHEET_NAME = 'Лист1';

function addCors(output) {
  return output
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function doGet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const rows = sheet.getDataRange().getValues();
    rows.shift(); // убираем заголовки
    const payload = { status: 'ok', data: rows };
    return addCors(
      ContentService.createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON)
    );
  } catch (err) {
    const payload = { status: 'error', message: String(err) };
    return addCors(
      ContentService.createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON)
    );
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
    return addCors(
      ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON)
    );
  } catch (err) {
    const payload = { status: 'error', message: String(err) };
    return addCors(
      ContentService.createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON)
    );
  }
}

function doOptions() {
  return addCors(
    ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON)
  );
}
