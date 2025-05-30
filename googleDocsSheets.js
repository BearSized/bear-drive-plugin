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

app.post('/api/create-sheet-in-folder', async (req, res) => {
  try {
    const { title, parentFolderId } = req.body;
    const sheet = await createSheet(title, parentFolderId);
    res.json({ spreadsheetId: sheet.spreadsheetId, url: sheet.spreadsheetUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create sheet in folder', details: err.message });
  }
});

async function appendToSheet(sheetId, range, values) {
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values }
  });
}

async function createGoogleSheet(title, parentFolderId = null) {
  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  // Step 1: Create the sheet
  const sheetRes = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title }
    }
  });

  const sheetId = sheetRes.data.spreadsheetId;

  // Step 2: Move it to the correct folder if parent specified
  if (parentFolderId) {
    await drive.files.update({
      fileId: sheetId,
      addParents: parentFolderId,
      removeParents: 'root',
      fields: 'id, parents',
      supportsAllDrives: true
    });
  }

  return sheetRes.data;
}

module.exports = {
  createGoogleDoc,
  writeToDoc,
  exportGoogleDoc,
  createGoogleSheet, // ← used by /create-sheet-in-folder
  createSheet: createGoogleSheet, // ← backward compatible for old route
  writeToSheet,
  readFromSheet,
  appendToSheet
};
