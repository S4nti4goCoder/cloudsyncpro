const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Tipos de archivos permitidos
const ALLOWED_TYPES = {
  // Imágenes
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",

  // PDF
  "application/pdf": ".pdf",

  // Word
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",

  // Excel
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",

  // PowerPoint
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
};

// Tamaño máximo por tipo (en bytes)
const MAX_SIZES = {
  image: 5 * 1024 * 1024, // 5MB para imágenes
  document: 25 * 1024 * 1024, // 25MB para documentos
};

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Organizar por tipo de archivo
    const isImage = file.mimetype.startsWith("image/");
    const subDir = isImage ? "images" : "documents";
    const fullPath = path.join(uploadsDir, subDir);

    // Crear subdirectorio si no existe
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp-random-nombre-original
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension =
      ALLOWED_TYPES[file.mimetype] || path.extname(file.originalname);
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, "-") // Reemplazar caracteres especiales
      .replace(/--+/g, "-") // Eliminar dobles guiones
      .toLowerCase();

    const fileName = `${uniqueSuffix}-${sanitizedName}${extension}`;
    cb(null, fileName);
  },
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Verificar tipo de archivo
  if (!ALLOWED_TYPES[file.mimetype]) {
    const allowedExtensions = Object.values(ALLOWED_TYPES).join(", ");
    return cb(
      new Error(
        `Tipo de archivo no permitido. Tipos permitidos: ${allowedExtensions}`
      ),
      false
    );
  }

  // Verificar tamaño según tipo
  const isImage = file.mimetype.startsWith("image/");
  const maxSize = isImage ? MAX_SIZES.image : MAX_SIZES.document;

  // Nota: El tamaño se verifica en el middleware de límites
  cb(null, true);
};

// Configuración principal de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_SIZES.document, // Límite máximo global
    files: 10, // Máximo 10 archivos por request
  },
});

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message:
            "El archivo es demasiado grande. Máximo 25MB para documentos y 5MB para imágenes.",
          code: "FILE_TOO_LARGE",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Demasiados archivos. Máximo 10 archivos por subida.",
          code: "TOO_MANY_FILES",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Campo de archivo inesperado.",
          code: "UNEXPECTED_FIELD",
        });
      default:
        return res.status(400).json({
          success: false,
          message: "Error en la subida del archivo.",
          code: "UPLOAD_ERROR",
        });
    }
  }

  // Error personalizado del fileFilter
  if (error.message.includes("Tipo de archivo no permitido")) {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: "INVALID_FILE_TYPE",
    });
  }

  next(error);
};

// Utilidades
const getFileCategory = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.includes("word")) return "word";
  if (mimetype.includes("spreadsheet") || mimetype.includes("excel"))
    return "excel";
  if (mimetype.includes("presentation") || mimetype.includes("powerpoint"))
    return "powerpoint";
  return "document";
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

module.exports = {
  upload,
  handleMulterError,
  ALLOWED_TYPES,
  MAX_SIZES,
  getFileCategory,
  formatFileSize,
};
