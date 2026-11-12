(function () {
  const PRODUCTOS_DEF = [
    {
      id: 1,
      nombre: 'Remera Chrome Hearts',
      precio: 48500,
      precioFormato: '$48.500',
      descripcion: '',
      caracteristicas: '',
      imagen: 'img/CH.jpg',
      imagenes: ['img/CH.jpg'],
      stock: 10
    },
    {
      id: 2,
      nombre: 'Pantalón True Religion BC',
      precio: 84500,
      precioFormato: '$84.500',
      descripcion: '',
      caracteristicas: '',
      imagen: 'img/TR.jpg',
      imagenes: ['img/TR.jpg'],
      stock: 5
    },
    {
      id: 3,
      nombre: 'Campera Moncler WHITE',
      precio: 220000,
      precioFormato: '$220.000',
      descripcion: '',
      caracteristicas: '',
      imagen: 'img/MCR.png',
      imagenes: ['img/MCR.png'],
      stock: 2
    }
  ];

  const USUARIOS_DEF = [
    {
      id: 1,
      nombre: 'admin',
      rol: 'Administrador',
      mail: 'admin@veloura.com',
      contraseña: '1234',
      dni: '',
      direccion: '',
      telefono: ''
    },
    {
      id: 2,
      nombre: 'vendedor',
      rol: 'Vendedor',
      mail: 'vendedor@veloura.com',
      contraseña: '1234',
      dni: '',
      direccion: '',
      telefono: ''
    }
  ];

  const leerLista = (clave, porDefecto) => {
    try {
      const guardado = JSON.parse(localStorage.getItem(clave));
      return Array.isArray(guardado) ? guardado : porDefecto;
    } catch (error) {
      return porDefecto;
    }
  };

  const guardarLista = (clave, datos) => {
    localStorage.setItem(clave, JSON.stringify(datos));
  };

  const formatearPrecio = (numero) => '$' + Number(numero || 0).toLocaleString('es-AR');

  const normalizarProducto = (producto) => {
    const imagenes = Array.isArray(producto.imagenes) && producto.imagenes.length
      ? producto.imagenes
      : (producto.imagen ? [producto.imagen] : []);

    return {
      ...producto,
      precio: Number(producto.precio) || 0,
      stock: Number(producto.stock) || 0,
      precioFormato: producto.precioFormato || formatearPrecio(producto.precio),
      descripcion: producto.descripcion || '',
      caracteristicas: producto.caracteristicas || '',
      imagen: producto.imagen || imagenes[0] || '',
      imagenes
    };
  };

  const normalizarUsuario = (usuario) => ({
    ...usuario,
    dni: usuario.dni || '',
    direccion: usuario.direccion || '',
    telefono: usuario.telefono || ''
  });

  const VelouraDB = {
    PRODUCTOS_DEF,
    USUARIOS_DEF,
    formatearPrecio,

    getProductos: () => leerLista('productos', PRODUCTOS_DEF).map(normalizarProducto),
    saveProductos: (lista) => guardarLista('productos', lista.map(normalizarProducto)),
    getProducto: (id) => VelouraDB.getProductos().find(p => String(p.id) === String(id)),

    getUsuarios: () => leerLista('usuarios', USUARIOS_DEF).map(normalizarUsuario),
    saveUsuarios: (lista) => guardarLista('usuarios', lista.map(normalizarUsuario)),

    getVentas: () => leerLista('ventas', []),
    saveVentas: (lista) => guardarLista('ventas', lista),

    getUsuarioLogueado: () => {
      try {
        return JSON.parse(localStorage.getItem('usuarioLogueado'));
      } catch (error) {
        return null;
      }
    },
    iniciarSesion: (usuario) => localStorage.setItem('usuarioLogueado', JSON.stringify(usuario)),
    cerrarSesion: () => localStorage.removeItem('usuarioLogueado'),

    esHoy: (fechaISO) => {
      const fecha = new Date(fechaISO);
      const hoy = new Date();
      return fecha.getFullYear() === hoy.getFullYear()
        && fecha.getMonth() === hoy.getMonth()
        && fecha.getDate() === hoy.getDate();
    }
  };

  window.VelouraDB = VelouraDB;

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-logout]').forEach((elemento) => {
      elemento.addEventListener('click', (evento) => {
        evento.preventDefault();
        VelouraDB.cerrarSesion();
        window.location.href = 'indexLog.html';
      });
    });
  });
})();
