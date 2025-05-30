const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const {
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
} = require("./google");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Admin password middleware
function requireAdminPassword(req, res, next) {
  const { password } = req.body;
  if (password !== "BearSizedAdmin") {
    return res.status(403).json({ error: "Invalid password" });
  }
  next();
}

// Routes
app.get("/api/list-files", async (req, res) => {
  try {
    const files = await listFiles();
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/create-folder", async (req, res) => {
  try {
    const { folderName, parentId } = req.body;
    const folder = await createFolder(folderName, parentId);
    res.json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/delete-file/:fileId", requireAdminPassword, async (req, res) => {
  try {
    const { fileId } = req.params;
    const result = await deleteFile(fileId);
    res.json({ message: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/move-file", async (req, res) => {
  try {
    const { fileId, folderId } = req.body;
    const result = await moveFileToFolder(fileId, folderId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/share-file", async (req, res) => {
  try {
    const { fileId, email } = req.body;
    const result = await shareFile(fileId, email);
    res.json({ message: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/label-file", async (req, res) => {
  try {
    const { fileId, labels } = req.body;
    const result = await addLabelsToFile(fileId, labels);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/create-sheet", async (req, res) => {
  try {
    const { title } = req.body;
    const sheet = await createSheet(title);
    res.json(sheet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/write-sheet", async (req, res) => {
  try {
    const { spreadsheetId, range, values } = req.body;
    const result = await writeToSheet(spreadsheetId, range, values);
    res.json({ message: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/read-sheet", async (req, res) => {
  try {
    const { spreadsheetId, range } = req.query;
    const data = await readFromSheet(spreadsheetId, range);
    res.json({ values: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/create-doc", async (req, res) => {
  try {
    const { title } = req.body;
    const doc = await createDoc(title);
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/update-doc", async (req, res) => {
  try {
    const { docId, content } = req.body;
    const result = await updateDocContent(docId, content);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/list-shared-drives", async (req, res) => {
  try {
    const drives = await listSharedDrives();
    res.json({ drives });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/validate-files", requireAdminPassword, async (req, res) => {
  try {
    const { fileIds } = req.body;
    const results = await checkMultipleFiles(fileIds);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
