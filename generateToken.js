const { GoogleAuth } = require("google-auth-library");
const express = require("express");
const app = express();

app.get("/token", async (req, res) => {
  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });

  const client = await auth.getClient();
  const url = await client.getAccessToken();
  res.json({ token: url.token });
});

app.listen(3000, () => {
  console.log("Token server running on http://localhost:3000");
});