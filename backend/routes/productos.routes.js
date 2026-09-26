const express = require('express');
const router = express.Router();


const { getProductos, crearProducto, editarProducto, eliminarProducto } = require('../controllers/productos.controller');

router.get('/', getProductos);
router.post('/', crearProducto);
router.put('/:id', editarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;