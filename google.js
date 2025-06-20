// FILE: google.js
const { google } = require("googleapis");
const auth = require("./auth");

const drive = google.drive({
  version: "v3",
  auth,
  params: {
    supportsAllDrives: true
  }
});
const sheets = google.sheets({ version: "v4", auth });
const docs = google.docs({ version: "v1", auth });

async function listFiles() {
  const res = await drive.files.list({
    q: "trashed = false",
    fields: "files(id, name, mimeType)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });
  return res.data.files;
}
async function createFolder(name, parentId) {
  const fileMetadata = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: parentId ? [parentId] : []
  };
  const res = await drive.files.create({
    resource: fileMetadata,
    fields: "id, name",
    supportsAllDrives: true
  });
  return res.data;
}

async function deleteFile(fileId) {
  await drive.files.delete({ fileId, supportsAllDrives: true });
  return "File deleted successfully";
}

async function moveFileToFolder(fileId, folderId) {
  const file = await drive.files.get({
    fileId,
    fields: "parents",
    supportsAllDrives: true
  });
  const previousParents = file.data.parents.join(",");
  const res = await drive.files.update({
    fileId,
    addParents: folderId,
    removeParents: previousParents,
    fields: "id, parents",
    supportsAllDrives: true
  });
  return res.data;
}

async function shareFile(fileId, email) {
  await drive.permissions.create({
    fileId,
    resource: {
      type: "user",
      role: "writer",
      emailAddress: email
    },
    fields: "id",
    supportsAllDrives: true
  });
  return "File shared with " + email;
}

async function addLabelsToFile(fileId, labels) {
  const res = await drive.files.update({
    fileId,
    resource: {
      properties: labels
    },
    fields: "id, properties",
    supportsAllDrives: true
  });
  return res.data;
}

async function listSharedDrives() {
  const res = await drive.drives.list({ pageSize: 100 });
  return res.data.drives;
}

async function createSheet(title) {
  const resource = { properties: { title } };
  const res = await sheets.spreadsheets.create({ resource });
  return res.data;
}

async function writeToSheet(spreadsheetId, range, values) {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    resource: { values }
  });
  return "Sheet updated successfully";
}

async function readFromSheet(spreadsheetId, range) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return res.data.values;
}

async function createDoc(title) {
  const res = await docs.documents.create({ requestBody: { title } });
  return res.data;
}

async function updateDocContent(docId, content) {
  const res = await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content
          }
        }
      ]
    }
  });
  return res.data;
}

async function checkFileExists(fileId) {
  try {
    const file = await drive.files.get({
      fileId,
      fields: "id, name",
      supportsAllDrives: true
    });
    return { fileId, exists: true, name: file.data.name };
  } catch (error) {
    return { fileId, exists: false, error: error.message };
  }
}

async function checkMultipleFiles(fileIds) {
  const results = [];
  for (const id of fileIds) {
    const result = await checkFileExists(id);
    results.push(result);
  }
  return results;
}

module.exports = {
  listFiles,
  createFolder,
  deleteFile,
  moveFileToFolder,
  shareFile,
  addLabelsToFile,
  createSheet,
  writeToSheet,
  readFromSheet,
  createDoc,
  updateDocContent,
  listSharedDrives,
  checkFileExists,
  checkMultipleFiles
};
