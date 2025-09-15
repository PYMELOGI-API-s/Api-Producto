// Middleware de validación para productos

const validateProduct = (req, res, next) => {
    const { nombre, descripcion, codigoBarras, precio, stock, categoria } = req.body;
    const errors = [];
  
    // Validar campos requeridos
    if (!nombre || nombre.trim() === '') {
      errors.push('El nombre es requerido');
    } else if (nombre.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    } else if (nombre.trim().length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }
  
    if (!descripcion || descripcion.trim() === '') {
      errors.push('La descripción es requerida');
    } else if (descripcion.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    } else if (descripcion.trim().length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }
  
    if (!codigoBarras || codigoBarras.trim() === '') {
      errors.push('El código de barras es requerido');
    } else if (!/^\d{10,15}$/.test(codigoBarras.trim())) {
      errors.push('El código de barras debe contener entre 10 y 15 dígitos');
    }
  
    if (precio === undefined || precio === null) {
      errors.push('El precio es requerido');
    } else if (isNaN(precio) || parseFloat(precio) <= 0) {
      errors.push('El precio debe ser un número mayor que 0');
    } else if (parseFloat(precio) > 999999.99) {
      errors.push('El precio no puede exceder $999,999.99');
    }
  
    if (stock === undefined || stock === null) {
      errors.push('El stock es requerido');
    } else if (isNaN(stock) || parseInt(stock) < 0) {
      errors.push('El stock debe ser un número mayor o igual a 0');
    } else if (parseInt(stock) > 999999) {
      errors.push('El stock no puede exceder 999,999 unidades');
    }
  
    if (!categoria || categoria.trim() === '') {
      errors.push('La categoría es requerida');
    } else if (categoria.trim().length < 2) {
      errors.push('La categoría debe tener al menos 2 caracteres');
    } else if (categoria.trim().length > 50) {
      errors.push('La categoría no puede exceder 50 caracteres');
    }
  
    // Validar imagen si se proporciona
    if (req.body.imagen && req.body.imagen.trim() !== '') {
      const imageUrl = req.body.imagen.trim();
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      if (!urlPattern.test(imageUrl)) {
        errors.push('La imagen debe ser una URL válida que termine en .jpg, .jpeg, .png, .gif o .webp');
      }
    }
  
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos',
        message: 'Por favor, corrija los siguientes errores:',
        details: errors
      });
    }
  
    next();
  };
  
  const validateProductUpdate = (req, res, next) => {
    const { nombre, descripcion, codigoBarras, precio, stock, categoria } = req.body;
    const errors = [];
  
    // Para actualizaciones, los campos son opcionales pero deben ser válidos si se proporcionan
    
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim() === '') {
        errors.push('El nombre no puede estar vacío');
      } else if (nombre.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
      } else if (nombre.trim().length > 100) {
        errors.push('El nombre no puede exceder 100 caracteres');
      }
    }
  
    if (descripcion !== undefined) {
      if (typeof descripcion !== 'string' || descripcion.trim() === '') {
        errors.push('La descripción no puede estar vacía');
      } else if (descripcion.trim().length < 10) {
        errors.push('La descripción debe tener al menos 10 caracteres');
      } else if (descripcion.trim().length > 500) {
        errors.push('La descripción no puede exceder 500 caracteres');
      }
    }
  
    if (codigoBarras !== undefined) {
      if (typeof codigoBarras !== 'string' || !/^\d{10,15}$/.test(codigoBarras.trim())) {
        errors.push('El código de barras debe contener entre 10 y 15 dígitos');
      }
    }
  
    if (precio !== undefined) {
      if (isNaN(precio) || parseFloat(precio) <= 0) {
        errors.push('El precio debe ser un número mayor que 0');
      } else if (parseFloat(precio) > 999999.99) {
        errors.push('El precio no puede exceder $999,999.99');
      }
    }
  
    if (stock !== undefined) {
      if (isNaN(stock) || parseInt(stock) < 0) {
        errors.push('El stock debe ser un número mayor o igual a 0');
      } else if (parseInt(stock) > 999999) {
        errors.push('El stock no puede exceder 999,999 unidades');
      }
    }
  
    if (categoria !== undefined) {
      if (typeof categoria !== 'string' || categoria.trim() === '') {
        errors.push('La categoría no puede estar vacía');
      } else if (categoria.trim().length < 2) {
        errors.push('La categoría debe tener al menos 2 caracteres');
      } else if (categoria.trim().length > 50) {
        errors.push('La categoría no puede exceder 50 caracteres');
      }
    }
  
    // Validar imagen si se proporciona
    if (req.body.imagen !== undefined) {
      if (req.body.imagen !== null && req.body.imagen.trim() !== '') {
        const imageUrl = req.body.imagen.trim();
        const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
        if (!urlPattern.test(imageUrl)) {
          errors.push('La imagen debe ser una URL válida que termine en .jpg, .jpeg, .png, .gif o .webp');
        }
      }
    }
  
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos de entrada inválidos',
        message: 'Por favor, corrija los siguientes errores:',
        details: errors
      });
    }
  
    next();
  };
  
  const validateId = (req, res, next) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'El ID debe ser un número entero positivo'
      });
    }
  
    next();
  };
  
  module.exports = {
    validateProduct,
    validateProductUpdate,
    validateId
  };