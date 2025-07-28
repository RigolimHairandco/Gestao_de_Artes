import express from "express";
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import fs from "fs";
import path from "path";

const app = express();
const port = 3000;
const upload = multer({ dest: "uploads/" });

const keyPath = "./gcp-key.json";
fs.writeFileSync(keyPath, process.env.GCP_SERVICE_KEY);

const storage = new Storage({ keyFilename: keyPath });
const bucketName = "rigolim-upload-artes"; // ajuste se for diferente

// Middleware CORS para permitir acesso do GitHub Pages
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://rigolimhairandco.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("Nenhum arquivo enviado.");

  const destination = file.originalname;
  const blob = storage.bucket(bucketName).file(destination);

  try {
    await blob.save(fs.readFileSync(file.path));
    fs.unlinkSync(file.path);
    return res.status(200).send({
      message: "Upload realizado com sucesso.",
      gcs_url: `https://storage.googleapis.com/${bucketName}/${destination}`
    });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
