const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  listFiles,
  createFolder,
  deleteFile,
  moveFileToFolder,
  shareFile,
  createSheet,
  writeToSheet,
  readFromSheet,
  createDoc,
  updateDocContent,
  addLabelsToFile
} = require("./google");

const app = express();
const router = express.Router();
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get("/", (req, res) => res.send("Bear Drive Plugin is up and running!"));

// DRIVE ROUTES
router.get("/listFiles", async (req, res) => {
  try {
    const files = await listFiles();
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/createFolder", async (req, res) => {
  try {
    const { folderName, parentId } = req.body;
    const folder = await createFolder(folderName, parentId);
    res.json({ folder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/deleteFile", async (req, res) => {
  try {
    const { fileId } = req.body;
    const message = await deleteFile(fileId);
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/moveFile", async (req, res) => {
  try {
    const { fileId, folderId } = req.body;
    const result = await moveFileToFolder(fileId, folderId);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/shareFile", async (req, res) => {
  try {
    const { fileId, email } = req.body;
    const message = await shareFile(fileId, email);
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SHEETS ROUTES
router.post("/createSheet", async (req, res) => {
  try {
    const { title } = req.body;
    const sheet = await createSheet(title);
    res.json({ sheet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/writeToSheet", async (req, res) => {
  try {
    const { spreadsheetId, range, values } = req.body;
    const message = await writeToSheet(spreadsheetId, range, values);
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/readFromSheet", async (req, res) => {
  try {
    const { spreadsheetId, range } = req.body;
    const data = await readFromSheet(spreadsheetId, range);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DOCS ROUTES
router.post("/createDoc", async (req, res) => {
  try {
    const { title } = req.body;
    const doc = await createDoc(title);
    res.json({ doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/updateDocContent", async (req, res) => {
  try {
    const { docId, content } = req.body;
    const result = await updateDocContent(docId, content);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LABELS
router.post("/addLabels", async (req, res) => {
  try {
    const { fileId, labels } = req.body;
    const result = await addLabelsToFile(fileId, labels);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/listSharedDrives", async (req, res) => {
  try {
    const drives = await listSharedDrives();
    res.json({ drives });
  } catch (err) {
    res.status(500).send("Error listing shared drives: " + err.message);
  }
});

// Mount all API routes under /api
app.use("/api", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
