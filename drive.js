const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// ✅ Safely load and parse service account credentials
if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable.");
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} catch (err) {
  throw new Error("Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON: " + err.message);
}

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

async function listFiles() {
  const res = await drive.files.list({ pageSize: 10 });
  return res.data.files;
}

async function uploadFile(filePath, fileName, parentId) {
  const fileMetadata = { name: fileName };
  if (parentId) fileMetadata.parents = [parentId];

  const media = { body: fs.createReadStream(filePath) };

  const res = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id'
  });

  return res.data.id;
}

module.exports = { listFiles, uploadFile };
