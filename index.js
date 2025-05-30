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

// Routes
app.get("/api/list-files", async (req, res) => {
  const files = await listFiles();
  res.json({ files });
});

app.post("/api/create-folder", async (req, res) => {
  const { folderName, parentId } = req.body;
  const folder = await createFolder(folderName, parentId);
  res.json(folder);
});

app.delete("/api/delete-file/:fileId", async (req, res) => {
  const { fileId } = req.params;
  const result = await deleteFile(fileId);
  res.json({ message: result });
});

app.post("/api/move-file", async (req, res) => {
  const { fileId, folderId } = req.body;
  const result = await moveFileToFolder(fileId, folderId);
  res.json(result);
});

app.post("/api/share-file", async (req, res) => {
  const { fileId, email } = req.body;
  const result = await shareFile(fileId, email);
  res.json({ message: result });
});

app.post("/api/label-file", async (req, res) => {
  const { fileId, labels } = req.body;
  const result = await addLabelsToFile(fileId, labels);
  res.json(result);
});

app.post("/api/create-sheet", async (req, res) => {
  const { title } = req.body;
  const sheet = await createSheet(title);
  res.json(sheet);
});

app.post("/api/write-sheet", async (req, res) => {
  const { spreadsheetId, range, values } = req.body;
  const result = await writeToSheet(spreadsheetId, range, values);
  res.json({ message: result });
});

app.get("/api/read-sheet", async (req, res) => {
  const { spreadsheetId, range } = req.query;
  const data = await readFromSheet(spreadsheetId, range);
  res.json({ values: data });
});

app.post("/api/create-doc", async (req, res) => {
  const { title } = req.body;
  const doc = await createDoc(title);
  res.json(doc);
});

app.post("/api/update-doc", async (req, res) => {
  const { docId, content } = req.body;
  const result = await updateDocContent(docId, content);
  res.json(result);
});

app.get("/api/list-shared-drives", async (req, res) => {
  const drives = await listSharedDrives();
  res.json({ drives });
});

app.post("/api/validate-files", async (req, res) => {
  const { fileIds } = req.body;
  const results = await checkMultipleFiles(fileIds);
  res.json({ results });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
