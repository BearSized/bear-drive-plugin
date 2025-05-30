
const { google } = require('googleapis');
const auth = require('../auth'); // Adjust path if needed

async function moveFileToFolder(fileId, newParentId) {
  const client = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: client });

  const file = await drive.files.get({
    fileId,
    fields: 'parents',
    supportsAllDrives: true,
  });

  const previousParents = file.data.parents.join(',');

  await drive.files.update({
    fileId,
    addParents: newParentId,
    removeParents: previousParents,
    fields: 'id, parents',
    supportsAllDrives: true,
  });

  console.log(`✅ Moved file ${fileId} to folder ${newParentId}`);
}

module.exports = { moveFileToFolder };
