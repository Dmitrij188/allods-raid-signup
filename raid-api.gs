const SHEET_NAME = 'Лист1';

function withCors(output) {
  return output
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  rows.shift();
  const out = ContentService.createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
  return withCors(out);
}

function doPost(e) {
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
  sheet.appendRow(row);
  const out = ContentService.createTextOutput('OK')
    .setMimeType(ContentService.MimeType.TEXT);
  return withCors(out);
}

function doOptions() {
  const out = ContentService.createTextOutput('');
  return withCors(out);
}
