const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProduct, validateProductUpdate } = require('../middleware/validation');

// Documentación de la API
router.get('/docs', (req, res) => {
  res.json({
    title: 'API de Productos - Documentación',
    version: '1.0.0',
    endpoints: [
      {
        method: 'GET',
        path: '/api/productos',
        description: 'Obtener todos los productos',
        query_params: {
          categoria: 'Filtrar por categoría',
          precio_min: 'Precio mínimo',
          precio_max: 'Precio máximo',
          stock_min: 'Stock mínimo',
          search: 'Buscar por nombre o descripción'
        }
      },
      {
        method: 'GET',
        path: '/api/productos/:id',
        description: 'Obtener un producto por ID'
      },
      {
        method: 'GET',
        path: '/api/productos/codigo/:codigoBarras',
        description: 'Obtener un producto por código de barras'
      },
      {
        method: 'POST',
        path: '/api/productos',
        description: 'Crear un nuevo producto',
        body: {
          nombre: 'string (requerido)',
          descripcion: 'string (requerido)',
          codigoBarras: 'string (requerido, único)',
          precio: 'number (requerido, > 0)',
          stock: 'number (requerido, >= 0)',
          categoria: 'string (requerido)',
          imagen: 'string (URL opcional)'
        }
      },
      {
        method: 'PUT',
        path: '/api/productos/:id',
        description: 'Actualizar un producto existente'
      },
      {
        method: 'DELETE',
        path: '/api/productos/:id',
        description: 'Eliminar un producto'
      },
      {
        method: 'GET',
        path: '/api/productos/categorias',
        description: 'Obtener todas las categorías disponibles'
      },
      {
        method: 'GET',
        path: '/api/productos/stats',
        description: 'Obtener estadísticas de productos'
      }
    ]
  });
});

// Rutas CRUD para productos
router.get('/', productController.getAllProducts);
router.get('/stats', productController.getProductStats);
router.get('/categorias', productController.getCategories);
router.get('/codigo/:codigoBarras', productController.getProductByBarcode);
router.get('/:id', productController.getProductById);
router.post('/', validateProduct, productController.createProduct);
router.put('/:id', validateProductUpdate, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;