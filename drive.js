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
    q: 'trashed = false',
    pageSize: 100,
    fields: 'files(id, name, driveId, parents)',
    driveId: '0AFk-zoIrXU2KUk9PVA',
    corpora: 'drive',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });
  return res.data.files;
}

// Upload file
const uploadFile = async (filePath, fileName, parentId) => {
  const fileMetadata = {
    name: fileName,
    // 👇 Specify the destination folder in the shared drive
    parents: parentId ? [parentId] : undefined,
  };

  const media = {
    body: fs.createReadStream(filePath),
  };

  const res = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id',
    // 👇 These flags ensure shared drive compatibility
    supportsAllDrives: true,
  });

  return res.data.id;
};

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
