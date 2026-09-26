const db = require('../db/connection');

const getProductos = (req, res) => {
  const sql = 'SELECT * FROM productos';

  db.query(sql, (err, resultados) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al obtener los productos' });
    }
    res.json(resultados);
  });
};

const crearProducto = (req, res) => {
  const { nombre, descripcion, caracteristicas, precio, stock } = req.body;

  const sql = `INSERT INTO productos (nombre, descripcion, caracteristicas, precio, stock)
               VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [nombre, descripcion, caracteristicas, precio, stock], (err, resultado) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al crear el producto' });
    }
    res.status(201).json({ id: resultado.insertId, nombre, descripcion, caracteristicas, precio, stock });
  });
};

const editarProducto = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, caracteristicas, precio, stock } = req.body;

  const sql = `UPDATE productos
               SET nombre = ?, descripcion = ?, caracteristicas = ?, precio = ?, stock = ?
               WHERE id = ?`;

  db.query(sql, [nombre, descripcion, caracteristicas, precio, stock, id], (err, resultado) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al editar el producto' });
    }
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto actualizado correctamente' });
  });
};

const eliminarProducto = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM productos WHERE id = ?';

  db.query(sql, [id], (err, resultado) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al eliminar el producto' });
    }
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado correctamente' });
  });
};

module.exports = { getProductos, crearProducto, editarProducto, eliminarProducto };

