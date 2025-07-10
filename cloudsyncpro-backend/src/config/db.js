const mysql = require("mysql2/promise");
require("dotenv").config();

// Validar variables de entorno obligatorias
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_NAME"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Variables de entorno faltantes:", missingVars.join(", "));
  console.error(
    "💡 Asegúrate de tener un archivo .env con las variables necesarias"
  );
  process.exit(1);
}

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cloudsyncpro_db_react",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Configuraciones adicionales para mejorar la conexión
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(
      `✅ Conexión a MySQL exitosa: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`
    );
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error.message);
    console.error(
      "💡 Verifica que MySQL esté corriendo y las credenciales sean correctas"
    );
    return false;
  }
};

// Probar conexión al inicializar (solo en desarrollo)
if (process.env.NODE_ENV !== "production") {
  testConnection();
}

module.exports = pool;
