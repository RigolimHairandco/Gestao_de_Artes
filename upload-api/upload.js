const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const app = express();
const port = 3000;

// Configura o Multer
const upload = multer({ storage: multer.memoryStorage() });

// Inicializa o GCS
const storage = new Storage({
  keyFilename: 'upload-client-key.json', // Nome do arquivo da chave de serviço
});
const bucketName = 'NOME_DO_BUCKET'; // 🔁 Substitua pelo nome do seu bucket real
const bucket = storage.bucket(bucketName);

// Endpoint para upload
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('Nenhum arquivo enviado');

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', err => res.status(500).send(err));
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).send({ url: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Upload API rodando em http://localhost:${port}`);
});
