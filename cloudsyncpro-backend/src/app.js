const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ⭐ NUEVO: Middleware para servir archivos estáticos (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas existentes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const adminRoutes = require("./routes/admin.routes");
const folderRoutes = require("./routes/folder.routes");

// ⭐ NUEVA RUTA: Archivos
const fileRoutes = require("./routes/file.routes");

// Registrar rutas existentes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/folders", folderRoutes);

// ⭐ REGISTRAR NUEVA RUTA: Archivos
app.use("/api/files", fileRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API CloudSyncPro funcionando ✅");
});

// ⭐ NUEVA RUTA DE PRUEBA: Verificar endpoints de archivos
app.get("/api/test/files", (req, res) => {
  res.json({
    message: "🎉 Rutas de archivos registradas correctamente",
    endpoints: {
      upload: ["POST /api/files/upload - Subir archivos (múltiples)"],
      basic: [
        "GET /api/files - Listar archivos con filtros",
        "GET /api/files/:id - Obtener archivo específico",
        "PUT /api/files/:id - Actualizar nombre de archivo",
        "DELETE /api/files/:id - Eliminar archivo",
      ],
      advanced: [
        "GET /api/files/:id/download - Descargar archivo",
        "PUT /api/files/:id/move - Mover archivo a otra carpeta",
        "GET /api/files/search - Búsqueda de archivos",
        "GET /api/files/stats/user - Estadísticas de archivos",
      ],
      supported_types: [
        "PDF (.pdf)",
        "Word (.doc, .docx)",
        "Excel (.xls, .xlsx)",
        "PowerPoint (.ppt, .pptx)",
        "Imágenes (.jpg, .jpeg, .png, .gif, .webp)",
      ],
      limits: {
        max_file_size_images: "5MB",
        max_file_size_documents: "25MB",
        max_files_per_upload: 10,
      },
    },
    status: "ready",
  });
});

module.exports = app;
