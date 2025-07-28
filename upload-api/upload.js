// upload.js
import express from "express";
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ dest: "uploads/" });

// Grava a chave de autenticação
const keyPath = "./gcp-key.json";
if (!fs.existsSync(keyPath)) {
  fs.writeFileSync(keyPath, process.env.GCP_SERVICE_KEY);
}

const storage = new Storage({ keyFilename: keyPath });
const bucketName = "rigolim-upload-artes";

// Configuração de CORS
app.use(cors({
  origin: "https://rigolimhairandco.github.io",
  methods: ["POST"],
  allowedHeaders: ["Content-Type"]
}));

// Rota de upload
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
  console.log(`Servidor rodando na porta ${port}`);
});
