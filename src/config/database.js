
const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Use this if you're on Azure
    trustServerCertificate: true // Change to true for local dev / self-signed certs
  }
};

let pool;

const connectDB = async () => {
  if (pool) {
    return pool;
  }
  try {
    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log('Conectado a la base de datos');
    return pool;
  } catch (err) {
    console.error('Error de conexión a la base de datos:', err);
    // Exit process with failure
    process.exit(1);
  }
};

const getDB = () => {
    if (!pool) {
        throw new Error('La conexión a la base de datos no ha sido establecida.');
    }
    return pool;
}


module.exports = { connectDB, getDB };
