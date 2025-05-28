const { google } = require('googleapis');
const auth = require('./auth');

// Google Docs
async function createGoogleDoc(title) {
  const docs = google.docs({ version: 'v1', auth });
  const res = await docs.documents.create({ requestBody: { title } });
  return res.data;
}

async function writeToDoc(docId, content) {
  const docs = google.docs({ version: 'v1', auth });
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [{ insertText: { text: content, location: { index: 1 } } }]
    }
  });
}

async function exportGoogleDoc(fileId, mimeType = 'text/plain') {
  const client = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: client });

  const res = await drive.files.export({
    fileId,
    mimeType
  }, { responseType: 'stream' });

  return new Promise((resolve, reject) => {
    let data = '';
    res.data.on('data', chunk => data += chunk);
    res.data.on('end', () => resolve(data));
    res.data.on('error', reject);
  });
}

// Google Sheets
async function createGoogleSheet(title) {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.create({ requestBody: { properties: { title } } });
  return res.data;
}

async function appendToSheet(sheetId, range, values) {
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values }
  });
}

module.exports = {
  createGoogleDoc,
  writeToDoc,
  exportGoogleDoc,
  createGoogleSheet,
  appendToSheet
};
