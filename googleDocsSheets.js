const { google } = require('googleapis');
const auth = require('./auth');

// Create a new Google Doc
async function createGoogleDoc(title) {
  const docs = google.docs({ version: 'v1', auth });
  const res = await docs.documents.create({ requestBody: { title } });
  return res.data;
}

// Write content to a Google Doc
async function writeToDoc(docId, content) {
  const docs = google.docs({ version: 'v1', auth });
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [{ insertText: { text: content, location: { index: 1 } } }]
    }
  });
}

// Create a new Google Sheet
async function createGoogleSheet(title) {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.create({ requestBody: { properties: { title } } });
  return res.data;
}

// Append data to a Sheet
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
  createGoogleSheet,
  appendToSheet
};
