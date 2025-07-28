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

// Caminho do arquivo da chave
const keyPath = "./gcp-key.json";

// Cria o arquivo da chave se não existir
if (!fs.existsSync(keyPath)) {
  fs.writeFileSync(keyPath, process.env.GCP_SERVICE_KEY);
}

// Inicializa o cliente do Storage com a chave
const storage = new Storage({ keyFilename: keyPath });

// Nome do bucket CORRETO
const bucketName = "imagens-gestor-artes";

// Configuração de CORS para permitir acesso do GitHub Pages
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
    console.error(err);
    return res.status(500).send({ error: err.message });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
