const express = require('express');
const cors = require('cors');
const productosRoutes = require ('./routes/productos.routes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/productos', productosRoutes);


app.get('/', (req, res) => {
  res.send('API de Veloura funcionando');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});