const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { listFiles, uploadFile } = require('./drive');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// ✅ Serve `well-known` at the expected GPT path `/.well-known`
app.use('/.well-known', express.static(path.join(__dirname, 'well-known')));
app.use('/', express.static(__dirname)); // for openapi.yaml

// 🔗 GPT Action Endpoints
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
    res.json({ fileId });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🦄 Bear Drive API running at http://localhost:${PORT}`);
});
