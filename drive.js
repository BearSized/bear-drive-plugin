const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// ✅ Load base64-encoded credentials from environment
const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
if (!b64) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_B64 environment variable.");
}

let serviceAccount;
try {
  const jsonString = Buffer.from(b64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(jsonString);

  // 🔥 Fix escaped newlines in private key
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
} catch (err) {
  throw new Error("Invalid base64 or JSON in GOOGLE_SERVICE_ACCOUNT_B64: " + err.message);
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
