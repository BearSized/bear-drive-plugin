
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { listFiles, uploadFile } = require('./drive');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));
app.use('/', express.static(__dirname));

app.get('/api/list-files', async (req, res) => {
  const files = await listFiles();
  res.json({ files });
});

app.post('/api/upload-file', upload.single('file'), async (req, res) => {
  const { originalname, path: tempPath } = req.file;
  const { parentId } = req.body;
  const fileId = await uploadFile(tempPath, originalname, parentId);
  res.json({ fileId });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🦄 Bear Drive API running on port ${PORT}`));
