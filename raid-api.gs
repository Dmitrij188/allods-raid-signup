const SHEET_NAME = 'Лист1';

function doGet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const rows = sheet.getDataRange().getValues();
    rows.shift(); // убираем заголовки
    return ContentService.createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput('ERROR')
      .setMimeType(ContentService.MimeType.TEXT);
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

    return ContentService.createTextOutput('OK')
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput('ERROR')
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
