const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./src/config/database');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
const productRoutes = require('./src/routes/productRoutes');

app.use('/api/productos', productRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Productos - Sistema de Inventario',
    version: '1.0.0',
    endpoints: {
      productos: '/api/productos',
      documentacion: '/api/productos/docs'
    }
  });
});

// Middleware para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

const startServer = async () => {
  await connectDB();
  return app.listen(port, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
      console.log(`📊 API de productos disponible en http://localhost:${port}/api/productos`);
  });
};

// Si no estamos en modo de prueba, iniciamos el servidor directamente
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
