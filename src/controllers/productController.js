const { getDB } = require('../config/database');
const sql = require('mssql');

const productController = {
  // Obtener todos los productos con filtros
  getAllProducts: async (req, res) => {
    try {
      const { categoria, precio_min, precio_max, stock_min, search, page = 1, limit = 10 } = req.query;
      const pool = getDB();
      const request = pool.request();
      
      let whereClauses = [];
      
      if (categoria) {
        whereClauses.push("categoria LIKE @categoria");
        request.input('categoria', sql.VarChar, `%${categoria}%`);
      }
      if (precio_min) {
        whereClauses.push("precio >= @precio_min");
        request.input('precio_min', sql.Float, parseFloat(precio_min));
      }
      if (precio_max) {
        whereClauses.push("precio <= @precio_max");
        request.input('precio_max', sql.Float, parseFloat(precio_max));
      }
      if (stock_min) {
        whereClauses.push("stock >= @stock_min");
        request.input('stock_min', sql.Int, parseInt(stock_min));
      }
      if (search) {
        whereClauses.push("(nombre LIKE @search OR descripcion LIKE @search)");
        request.input('search', sql.VarChar, `%${search}%`);
      }

      const whereCondition = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

      // Count total items for pagination
      const countQuery = `SELECT COUNT(*) as total FROM Producto ${whereCondition}`;
      const countResult = await request.query(countQuery);
      const totalItems = countResult.recordset[0].total;

      // Get paginated data using a more compatible method
      const offset = (page - 1) * limit;
      const dataQuery = `
        WITH NumberedProducts AS (
            SELECT *, ROW_NUMBER() OVER (ORDER BY id) AS row_num
            FROM Producto
            ${whereCondition}
        )
        SELECT *
        FROM NumberedProducts
        WHERE row_num > ${offset} AND row_num <= ${offset} + ${parseInt(limit)};
      `;

      const result = await request.query(dataQuery);

      res.json({
        success: true,
        data: result.recordset,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
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
      console.error("Error en getAllProducts:", error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener productos',
        message: error.message
      });
    }
  },

  // Obtener producto por ID
  getProductById: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDB();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Producto WHERE id = @id');

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado',
          message: `No existe un producto con ID ${id}`
        });
      }

      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      console.error("Error en getProductById:", error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener producto',
        message: error.message
      });
    }
  },

  // Obtener producto por código de barras
  getProductByBarcode: async (req, res) => {
    try {
      const { codigoBarras } = req.params;
      const pool = getDB();
      const result = await pool.request()
        .input('codigoBarras', sql.VarChar, codigoBarras)
        .query('SELECT * FROM Producto WHERE codigoBarras = @codigoBarras');

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado',
          message: `No existe un producto con código de barras ${codigoBarras}`
        });
      }

      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      console.error("Error en getProductByBarcode:", error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener producto',
        message: error.message
      });
    }
  },

  // Crear nuevo producto
  createProduct: async (req, res) => {
    try {
      const { nombre, descripcion, codigoBarras, precio, stock, categoria, imagen } = req.body;
      const pool = getDB();

      const existingProduct = await pool.request()
        .input('codigoBarras', sql.VarChar, codigoBarras)
        .query('SELECT * FROM Producto WHERE codigoBarras = @codigoBarras');

      if (existingProduct.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Código de barras duplicado',
          message: `Ya existe un producto con el código de barras ${codigoBarras}`
        });
      }

      const result = await pool.request()
        .input('nombre', sql.VarChar, nombre)
        .input('descripcion', sql.VarChar, descripcion)
        .input('codigoBarras', sql.VarChar, codigoBarras)
        .input('precio', sql.Decimal(10, 2), precio)
        .input('stock', sql.Int, stock)
        .input('categoria', sql.VarChar, categoria)
        .input('imagen', sql.VarChar, imagen)
        .query('INSERT INTO Producto (nombre, descripcion, codigoBarras, precio, stock, categoria, imagen) OUTPUT INSERTED.* VALUES (@nombre, @descripcion, @codigoBarras, @precio, @stock, @categoria, @imagen)');

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error("Error en createProduct:", error);
      res.status(500).json({
        success: false,
        error: 'Error al crear producto',
        message: error.message
      });
    }
  },

  // Actualizar producto
  updateProduct: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { nombre, descripcion, codigoBarras, precio, stock, categoria, imagen } = req.body;
      const pool = getDB();

      if (codigoBarras) {
        const existingProduct = await pool.request()
            .input('codigoBarras', sql.VarChar, codigoBarras)
            .input('id', sql.Int, id)
            .query('SELECT * FROM Producto WHERE codigoBarras = @codigoBarras AND id != @id');
        if (existingProduct.recordset.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Código de barras duplicado',
            message: `Ya existe otro producto con el código de barras ${codigoBarras}`
          });
        }
      }

      const setClauses = [];
      const request = pool.request();
      request.input('id', sql.Int, id);

      if(nombre) {
        setClauses.push("nombre = @nombre");
        request.input('nombre', sql.VarChar, nombre);
      }
      if(descripcion) {
        setClauses.push("descripcion = @descripcion");
        request.input('descripcion', sql.VarChar, descripcion);
      }
      if(codigoBarras) {
        setClauses.push("codigoBarras = @codigoBarras");
        request.input('codigoBarras', sql.VarChar, codigoBarras);
      }
      if(precio !== undefined) {
        setClauses.push("precio = @precio");
        request.input('precio', sql.Decimal(10, 2), precio);
      }
      if(stock !== undefined) {
        setClauses.push("stock = @stock");
        request.input('stock', sql.Int, stock);
      }
      if(categoria) {
        setClauses.push("categoria = @categoria");
        request.input('categoria', sql.VarChar, categoria);
      }
      if(imagen !== undefined) {
        setClauses.push("imagen = @imagen");
        request.input('imagen', sql.VarChar, imagen);
      }

      if (setClauses.length === 0) {
        const result = await pool.request().input('id', sql.Int, id).query('SELECT * FROM Producto WHERE id = @id');
        if (result.recordset.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Producto no encontrado',
            message: `No existe un producto con ID ${id}`
          });
        }
        return res.json({
            success: true,
            message: 'No se realizaron cambios en el producto.',
            data: result.recordset[0]
        });
      }

      let query = `UPDATE Producto SET ${setClauses.join(', ')} OUTPUT INSERTED.* WHERE id = @id`;

      const result = await request.query(query);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado',
          message: `No existe un producto con ID ${id}`
        });
      }

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error("Error en updateProduct:", error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar producto',
        message: error.message
      });
    }
  },

  // Eliminar producto
  deleteProduct: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pool = getDB();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Producto OUTPUT DELETED.* WHERE id = @id');

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          error: 'Producto no encontrado',
          message: `No existe un producto con ID ${id}`
        });
      }

      res.json({
        success: true,
        message: 'Producto eliminado exitosamente',
        data: result.recordset[0]
      });
    } catch (error) {
      console.error("Error en deleteProduct:", error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar producto',
        message: error.message
      });
    }
  },
  
  // Obtener categorías disponibles
  getCategories: async (req, res) => {
    try {
        const pool = getDB();
        const result = await pool.request()
            .query('SELECT categoria as nombre, COUNT(*) as cantidad FROM Producto GROUP BY categoria');
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error("Error en getCategories:", error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener categorías',
            message: error.message
        });
    }
  },

  // Obtener estadísticas de productos
  getProductStats: async (req, res) => {
    try {
        const pool = getDB();
        const statsQuery = `
            SELECT
                (SELECT COUNT(*) FROM Producto) as totalProducts,
                (SELECT SUM(stock) FROM Producto) as totalStock,
                (SELECT AVG(precio) FROM Producto) as averagePrice,
                (SELECT COUNT(*) FROM Producto WHERE stock < 10) as lowStockProducts,
                (SELECT COUNT(DISTINCT categoria) FROM Producto) as totalCategories;
        `;
        const mostExpensiveQuery = 'SELECT TOP 1 id, nombre, precio FROM Producto ORDER BY precio DESC';
        const cheapestQuery = 'SELECT TOP 1 id, nombre, precio FROM Producto ORDER BY precio ASC';

        const [statsResult, mostExpensiveResult, cheapestResult] = await Promise.all([
            pool.request().query(statsQuery),
            pool.request().query(mostExpensiveQuery),
            pool.request().query(cheapestQuery)
        ]);

        const stats = statsResult.recordset[0];

        res.json({
            success: true,
            data: {
                totalProducts: stats.totalProducts,
                totalStock: stats.totalStock,
                averagePrice: Math.round(stats.averagePrice * 100) / 100,
                lowStockProducts: stats.lowStockProducts,
                totalCategories: stats.totalCategories,
                mostExpensive: mostExpensiveResult.recordset[0] || null,
                cheapest: cheapestResult.recordset[0] || null
            }
        });

    } catch (error) {
        console.error("Error en getProductStats:", error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas',
            message: error.message
        });
    }
  }
};

module.exports = productController;
