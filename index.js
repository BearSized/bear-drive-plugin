const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const {
  listFiles,
  uploadFile,
  downloadFile,
  deleteFile,
  createFolder,
  shareFile,
} = require('./drive');

const {
  createSheet,
  writeToSheet,
  readFromSheet,
  createDoc
} = require('./googleDocsSheets'); // ✅ Combined module for Sheets and Docs

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Static files
app.use('/.well-known', express.static(path.join(__dirname, 'well-known')));
app.use('/', express.static(__dirname));

// File Endpoints
app.get('/api/list-files', async (req, res) => {
  try {
    const files = await listFiles();
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list files', details: err.message });
  }
});

app.post('/api/upload-file', upload.single('file'), async (req, res) => {
  try {
    const { originalname, path: tempPath } = req.file;
    const { parentId } = req.body;
    const fileId = await uploadFile(tempPath, originalname, parentId);
    fs.unlinkSync(tempPath);
    res.json({ fileId });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

app.get('/api/download-file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const destPath = path.join(__dirname, 'downloads', `${fileId}`);
    await downloadFile(fileId, destPath);
    res.download(destPath, () => {
      fs.unlinkSync(destPath);
    });
  } catch (err) {
    res.status(500).json({ error: 'Download failed', details: err.message });
  }
});

app.delete('/api/delete-file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    await deleteFile(fileId);
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed', details: err.message });
  }
});

app.post('/api/create-folder', async (req, res) => {
  try {
    const { folderName, parentId } = req.body;
    const folderId = await createFolder(folderName, parentId);
    res.json({ folderId });
  } catch (err) {
    res.status(500).json({ error: 'Folder creation failed', details: err.message });
  }
});

app.post('/api/share-file', async (req, res) => {
  try {
    const { fileId, email } = req.body;
    await shareFile(fileId, email);
    res.json({ message: 'File shared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Sharing failed', details: err.message });
  }
});

// Google Sheets
app.post('/api/create-sheet', async (req, res) => {
  try {
    const { title } = req.body;
    const spreadsheetId = await createSheet(title);
    res.json({ spreadsheetId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create sheet', details: err.message });
  }
});

app.post('/api/write-sheet', async (req, res) => {
  try {
    const { spreadsheetId, range, values } = req.body;
    await writeToSheet(spreadsheetId, range, values);
    res.json({ message: 'Data written successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write to sheet', details: err.message });
  }
});

app.get('/api/read-sheet', async (req, res) => {
  try {
    const { spreadsheetId, range } = req.query;
    const values = await readFromSheet(spreadsheetId, range);
    res.json({ values });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read from sheet', details: err.message });
  }
});

// Google Docs
app.post('/api/create-doc', async (req, res) => {
  try {
    const { title } = req.body;
    const docId = await createDoc(title);
    res.json({ docId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create doc', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🦄 Bear Drive API running at http://localhost:${PORT}`);
});

const { exportGoogleDoc } = require('./googleDocsSheets');

app.get('/api/export-doc/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const docContent = await exportGoogleDoc(fileId);
    res.send(docContent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export document', details: err.message });
  }
});
