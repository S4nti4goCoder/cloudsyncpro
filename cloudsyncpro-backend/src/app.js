const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API CloudSyncPro funcionando ✅");
});

const userRoutes = require("./routes/user.routes");
app.use("/api/user", userRoutes);

app.use("/api/dashboard", require("./routes/dashboard.routes"));

module.exports = app;
