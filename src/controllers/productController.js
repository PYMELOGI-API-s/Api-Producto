// Simulación de base de datos en memoria (reemplazar con DB real)
let products = [
    {
      id: 1,
      nombre: "Laptop HP Pavilion",
      descripcion: "Laptop para uso profesional con procesador Intel i7",
      codigoBarras: "1234567890123",
      precio: 899.99,
      stock: 15,
      categoria: "Electrónicos",
      imagen: "https://example.com/laptop.jpg",
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    },
    {
      id: 2,
      nombre: "Mouse Logitech MX",
      descripcion: "Mouse inalámbrico ergonómico para oficina",
      codigoBarras: "2345678901234",
      precio: 79.99,
      stock: 50,
      categoria: "Accesorios",
      imagen: "https://example.com/mouse.jpg",
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    },
    {
      id: 3,
      nombre: "Teclado Mecánico",
      descripcion: "Teclado mecánico RGB para gaming",
      codigoBarras: "3456789012345",
      precio: 129.99,
      stock: 25,
      categoria: "Gaming",
      imagen: "https://example.com/teclado.jpg",
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    }
  ];
  
  let nextId = 4;
  
  const productController = {
    // Obtener todos los productos con filtros
    getAllProducts: (req, res) => {
      try {
        let filteredProducts = [...products];
        const { categoria, precio_min, precio_max, stock_min, search, page = 1, limit = 10 } = req.query;
  
        // Filtro por categoría
        if (categoria) {
          filteredProducts = filteredProducts.filter(p => 
            p.categoria.toLowerCase().includes(categoria.toLowerCase())
          );
        }
  
        // Filtro por rango de precio
        if (precio_min) {
          filteredProducts = filteredProducts.filter(p => p.precio >= parseFloat(precio_min));
        }
        if (precio_max) {
          filteredProducts = filteredProducts.filter(p => p.precio <= parseFloat(precio_max));
        }
  
        // Filtro por stock mínimo
        if (stock_min) {
          filteredProducts = filteredProducts.filter(p => p.stock >= parseInt(stock_min));
        }
  
        // Búsqueda por nombre o descripción
        if (search) {
          filteredProducts = filteredProducts.filter(p => 
            p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.descripcion.toLowerCase().includes(search.toLowerCase())
          );
        }
  
        // Paginación
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
        res.json({
          success: true,
          data: paginatedProducts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredProducts.length / limit),
            totalItems: filteredProducts.length,
            itemsPerPage: parseInt(limit)
          },
          filters: {
            categoria,
            precio_min,
            precio_max,
            stock_min,
            search
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Error al obtener productos',
          message: error.message
        });
      }
    },
  
    // Obtener producto por ID
    getProductById: (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const product = products.find(p => p.id === id);
  
        if (!product) {
          return res.status(404).json({
            success: false,
            error: 'Producto no encontrado',
            message: `No existe un producto con ID ${id}`
          });
        }
  
        res.json({
          success: true,
          data: product
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Error al obtener producto',
          message: error.message
        });
      }
    },
  
    // Obtener producto por código de barras
    getProductByBarcode: (req, res) => {
      try {
        const { codigoBarras } = req.params;
        const product = products.find(p => p.codigoBarras === codigoBarras);
  
        if (!product) {
          return res.status(404).json({
            success: false,
            error: 'Producto no encontrado',
            message: `No existe un producto con código de barras ${codigoBarras}`
          });
        }
  
        res.json({
          success: true,
          data: product
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Error al obtener producto',
          message: error.message
        });
      }
    },
  
    // Crear nuevo producto
    createProduct: (req, res) => {
      try {
        const { nombre, descripcion, codigoBarras, precio, stock, categoria, imagen } = req.body;
  
        // Verificar que el código de barras no exista
        const existingProduct = products.find(p => p.codigoBarras === codigoBarras);
        if (existingProduct) {
          return res.status(400).json({
            success: false,
            error: 'Código de barras duplicado',
            message: `Ya existe un producto con el código de barras ${codigoBarras}`
          });
        }
  
        const newProduct = {
          id: nextId++,
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          codigoBarras: codigoBarras.trim(),
          precio: parseFloat(precio),
          stock: parseInt(stock),
          categoria: categoria.trim(),
          imagen: imagen?.trim() || null,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString()
        };
  
        products.push(newProduct);
  
        res.status(201).json({
          success: true,
          message: 'Producto creado exitosamente',
          data: newProduct
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Error al crear producto',
          message: error.message
        });
      }
    },
  
    // Actualizar producto
    updateProduct: (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const productIndex = products.findIndex(p => p.id === id);
  
        if (productIndex === -1) {
          return res.status(404).json({
            success: false,
            error: 'Producto no encontrado',
            message: `No existe un producto con ID ${id}`
          });
        }
  
        const { nombre, descripcion, codigoBarras, precio, stock, categoria, imagen } = req.body;
  
        // Verificar código de barras único (si se está cambiando)
        if (codigoBarras && codigoBarras !== products[productIndex].codigoBarras) {
          const existingProduct = products.find(p => p.codigoBarras === codigoBarras && p.id !== id);
          if (existingProduct) {
            return res.status(400).json({
              success: false,
              error: 'Código de barras duplicado',
              message: `Ya existe otro producto con el código de barras ${codigoBarras}`
            });
          }
        }
  
        // Actualizar solo los campos proporcionados
        const updatedProduct = {
          ...products[productIndex],
          ...(nombre && { nombre: nombre.trim() }),
          ...(descripcion && { descripcion: descripcion.trim() }),
          ...(codigoBarras && { codigoBarras: codigoBarras.trim() }),
          ...(precio !== undefined && { precio: parseFloat(precio) }),
          ...(stock !== undefined && { stock: parseInt(stock) }),
          ...(categoria && { categoria: categoria.trim() }),
          ...(imagen !== undefined && { imagen: imagen?.trim() || null }),
          fechaActualizacion: new Date().toISOString()
        };
  
        products[productIndex] = updatedProduct;
  
        res.json({
          success: true,
          message: 'Producto actualizado exitosamente',
          data: updatedProduct
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Error al actualizar producto',
          message: error.message
        });
      }
    },
  
    // Eliminar producto
    deleteProduct: (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const productIndex = products.findIndex(p => p.id === id);
  
        if (productIndex === -1) {
          return res.status(404).json({
            success: false,
            error: 'Producto no encontrado',
            message: `No existe un producto con ID ${id}`
          });
        }
  
        const deletedProduct = products.splice(productIndex, 1)[0];
  
        res.json({
          success: true,
          message: 'Producto eliminado exitosamente',
          data: deletedProduct
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Error al eliminar producto',
          message: error.message
        });
      }
    },
  
    // Obtener categorías disponibles
    getCategories: (req, res) => {
      try {
        const categories = [...new Set(products.map(p => p.categoria))];
        const categoriesWithCount = categories.map(categoria => ({
          nombre: categoria,
          cantidad: products.filter(p => p.categoria === categoria).length
        }));
  
        res.json({
          success: true,
          data: categoriesWithCount
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Error al obtener categorías',
          message: error.message
        });
      }
    },
  
    // Obtener estadísticas de productos
    getProductStats: (req, res) => {
      try {
        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        const averagePrice = products.length > 0 
          ? products.reduce((sum, p) => sum + p.precio, 0) / products.length 
          : 0;
        const lowStockProducts = products.filter(p => p.stock < 10).length;
        const categories = [...new Set(products.map(p => p.categoria))].length;
  
        const mostExpensive = products.reduce((max, p) => p.precio > max.precio ? p : max, products[0]);
        const cheapest = products.reduce((min, p) => p.precio < min.precio ? p : min, products[0]);
  
        res.json({
          success: true,
          data: {
            totalProducts,
            totalStock,
            averagePrice: Math.round(averagePrice * 100) / 100,
            lowStockProducts,
            totalCategories: categories,
            mostExpensive: mostExpensive ? {
              id: mostExpensive.id,
              nombre: mostExpensive.nombre,
              precio: mostExpensive.precio
            } : null,
            cheapest: cheapest ? {
              id: cheapest.id,
              nombre: cheapest.nombre,
              precio: cheapest.precio
            } : null
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Error al obtener estadísticas',
          message: error.message
        });
      }
    }
  };
  
  module.exports = productController;