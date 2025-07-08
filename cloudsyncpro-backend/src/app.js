const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas base
app.get("/", (req, res) => {
  res.send("API CloudSyncPro funcionando ✅");
});

module.exports = app;
