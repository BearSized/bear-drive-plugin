const { google } = require('googleapis');

const serviceAccount = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_B64, 'base64').toString('utf-8')
);

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/documents'
  ]
});

const sheets = google.sheets({ version: 'v4', auth });
const docs = google.docs({ version: 'v1', auth });

// Create a Google Sheet
async function createSheet(title = 'New Sheet') {
  const res = await sheets.spreadsheets.create({
    resource: { properties: { title } },
  });
  return res.data.spreadsheetId;
}

// Append rows to a Sheet
async function appendRows(spreadsheetId, range, values) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values,
    },
  });
}

// Read a range from a Sheet
async function readRange(spreadsheetId, range) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return res.data.values;
}

// Create a Google Doc
async function createDoc(title = 'New Document') {
  const res = await docs.documents.create({
    requestBody: { title },
  });
  return res.data.documentId;
}

// Append text to a Doc
async function appendText(documentId, text) {
  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text,
          },
        },
      ],
    },
  });
}

module.exports = {
  createSheet,
  appendRows,
  readRange,
  createDoc,
  appendText,
};