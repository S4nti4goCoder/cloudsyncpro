const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas existentes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const adminRoutes = require("./routes/admin.routes");

// ⭐ NUEVA RUTA: Carpetas
const folderRoutes = require("./routes/folder.routes");

// Registrar rutas existentes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

// ⭐ REGISTRAR NUEVA RUTA: Carpetas
app.use("/api/folders", folderRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API CloudSyncPro funcionando ✅");
});

// ⭐ NUEVA RUTA DE PRUEBA: Verificar endpoints de carpetas
app.get("/api/test/folders", (req, res) => {
  res.json({
    message: "🎉 Rutas de carpetas registradas correctamente",
    endpoints: {
      basic: [
        "GET /api/folders - Listar carpetas",
        "GET /api/folders/:id - Obtener carpeta específica",
        "POST /api/folders - Crear carpeta",
        "PUT /api/folders/:id - Actualizar carpeta",
        "DELETE /api/folders/:id - Eliminar carpeta",
      ],
      advanced: [
        "PUT /api/folders/:id/move - Mover carpeta",
        "GET /api/folders/:id/path - Breadcrumbs",
        "GET /api/folders/:id/stats - Estadísticas",
        "GET /api/folders/search - Búsqueda",
        "POST /api/folders/:id/duplicate - Duplicar",
      ],
      admin: [
        "GET /api/folders/admin/all - Ver todas las carpetas",
        "DELETE /api/folders/admin/:id/force - Eliminar forzosamente",
      ],
    },
    status: "ready",
  });
});

module.exports = app;
