const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Decode the base64-encoded service account JSON
const serviceAccount = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_B64, 'base64').toString('utf-8')
);

// Authenticate with Google Drive API
const auth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  ['https://www.googleapis.com/auth/drive']
);

const drive = google.drive({ version: 'v3', auth });

// List files
async function listFiles() {
  const res = await drive.files.list({
    pageSize: 100,
    fields: 'files(id, name)',
  });
  return res.data.files;
}

// Upload file
async function uploadFile(filePath, fileName, parentId) {
  const fileMetadata = {
    name: fileName,
    parents: parentId ? [parentId] : [],
  };
  const media = {
    body: fs.createReadStream(filePath),
  };
  const res = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });
  return res.data.id;
}

// Download file
async function downloadFile(fileId, destPath) {
  const dest = fs.createWriteStream(destPath);
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );
  await new Promise((resolve, reject) => {
    res.data
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .pipe(dest);
  });
}

// Delete file
async function deleteFile(fileId) {
  await drive.files.delete({ fileId });
}

// Create folder
async function createFolder(folderName, parentId) {
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentId ? [parentId] : [],
  };
  const res = await drive.files.create({
    resource: fileMetadata,
    fields: 'id',
  });
  return res.data.id;
}

// Share file or folder
async function shareFile(fileId, email) {
  const permissions = {
    type: 'user',
    role: 'writer',
    emailAddress: email,
  };
  await drive.permissions.create({
    fileId: fileId,
    resource: permissions,
    fields: 'id',
  });
}

module.exports = {
  listFiles,
  uploadFile,
  downloadFile,
  deleteFile,
  createFolder,
  shareFile,
};
