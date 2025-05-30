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

// List files in a specific shared drive
async function listFiles(driveId = '0AFk-zoIrXU2KUk9PVA') {
  const res = await drive.files.list({
    q: 'trashed = false',
    pageSize: 100,
    fields: 'files(id, name, driveId, parents)',
    driveId,
    corpora: 'drive',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });
  return res.data.files;
}

// Upload file to shared drive
const uploadFile = async (filePath, fileName, parentId = null) => {
  const fileMetadata = {
    name: fileName,
    parents: parentId ? [parentId] : undefined,
  };

  const media = {
    body: fs.createReadStream(filePath),
  };

  const res = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id',
    supportsAllDrives: true,
  });

  return res.data.id;
};

// Download file by ID
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

// Delete file by ID
async function deleteFile(fileId) {
  await drive.files.delete({
    fileId,
    supportsAllDrives: true,
  });
}

// Create a folder in shared drive
async function createFolder(folderName, parentId = null, driveId = '0AFk-zoIrXU2KUk9PVA') {
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentId ? [parentId] : undefined,
  };

  const res = await drive.files.create({
    resource: fileMetadata,
    fields: 'id',
    supportsAllDrives: true,
    driveId,
    includeItemsFromAllDrives: true,
  });

  return res.data.id;
}

// Share file or folder with a user
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
    supportsAllDrives: true,
  });
}

async function moveFileToFolder(fileId, targetFolderId) {
  const file = await drive.files.get({
    fileId,
    fields: 'parents',
    supportsAllDrives: true,
  });

  const previousParents = file.data.parents.join(',');

  const res = await drive.files.update({
    fileId,
    addParents: targetFolderId,
    removeParents: previousParents,
    fields: 'id, parents',
    supportsAllDrives: true,
  });

  return res.data;
}

// Example usage
moveFileToFolder('1QyyO3DPIQ6V-O3cjsMVgFnJd90_SkhOTkgfHIf7-Jv4', '10oC82CAODfzfYhnpJfPgtpZd22TMAEbX');

module.exports = {
  listFiles,
  uploadFile,
  downloadFile,
  deleteFile,
  createFolder,
  shareFile,
};
