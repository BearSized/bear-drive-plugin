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

// DRIVE
async function listFiles() {
  const res = await drive.files.list({
    pageSize: 100,
    fields: "files(id, name, mimeType, parents)",
    q: "'0AJHu2oOZaS13Uk9PVA' in parents and trashed = false",
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
  const res = await drive.permissions.create({
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
  const res = await drive.drives.list({
    pageSize: 100
  });
  return res.data.drives;
}

// SHEETS
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

// DOCS
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
  listSharedDrives
};
