document.addEventListener('DOMContentLoaded', () => {
  const db = window.VelouraDB;
  if (!db) return;

  const setTexto = (id, valor) => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor;
  };

  const usuario = db.getUsuarioLogueado();
  setTexto('admin-nombre', usuario ? usuario.nombre : 'Sesión no iniciada');
  setTexto('admin-correo', usuario ? usuario.mail : '');

  const botones = document.querySelectorAll('.admin-nav-btn');
  const paneles = document.querySelectorAll('.admin-panel');

  const mostrarSeccion = (seccion) => {
    botones.forEach((boton) => boton.classList.toggle('active', boton.dataset.section === seccion));
    paneles.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === seccion));
  };

  botones.forEach((boton) => {
    boton.addEventListener('click', () => {
      mostrarSeccion(boton.dataset.section);
      actualizarResumen();
      renderVentas();
    });
  });

  const actualizarResumen = () => {
    const ventasHoy = db.getVentas().filter((venta) => db.esHoy(venta.fecha));
    const ingresosHoy = ventasHoy.reduce((suma, venta) => suma + Number(venta.total || 0), 0);

    setTexto('stat-usuarios', db.getUsuarios().length);
    setTexto('stat-productos', db.getProductos().length);
    setTexto('stat-ventas', ventasHoy.length);
    setTexto('stat-ingresos', db.formatearPrecio(ingresosHoy));
  };

  const renderVentas = () => {
    const tbody = document.querySelector('#tablaVentas tbody');
    if (!tbody) return;

    const hoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    setTexto('fecha-ventas', `Fecha: ${hoy}`);

    const ventasHoy = db.getVentas().filter((venta) => db.esHoy(venta.fecha));

    if (!ventasHoy.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="tabla-vacia">No hay operaciones registradas hoy.</td></tr>';
      return;
    }

    tbody.innerHTML = ventasHoy.map((venta) => {
      const hora = new Date(venta.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      const cliente = venta.cliente?.nombre || 'Invitado';
      const productos = (venta.items || [])
        .map((item) => `${item.cantidad}× ${item.nombre}`)
        .join('<br>');
      const total = venta.totalFormato || db.formatearPrecio(venta.total);
      const entrega = venta.entrega === 'domicilio' ? 'Envío a domicilio' : 'Retiro en el local';

      return `
        <tr>
          <td>${hora}</td>
          <td>${cliente}</td>
          <td>${productos}</td>
          <td>${total}</td>
          <td>${entrega}</td>
        </tr>
      `;
    }).join('');
  };

  document.getElementById('btn-actualizar-ventas')?.addEventListener('click', () => {
    actualizarResumen();
    renderVentas();
  });

  document.getElementById('formCorreo')?.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const usuarios = db.getUsuarios();
    const tipo = document.getElementById('destinatarios')?.value;
    const destinatarios = usuarios
      .filter((usuario) => (
        tipo === 'todos' ||
        (tipo === 'clientes' && !/admin|vendedor/i.test(usuario.rol || '')) ||
        (tipo === 'equipo' && /admin|vendedor/i.test(usuario.rol || ''))
      ))
      .map((usuario) => usuario.mail)
      .join(',');

    if (!destinatarios) {
      return alert('No hay usuarios registrados para este grupo.');
    }

    const asunto = encodeURIComponent(document.getElementById('asunto')?.value || '');
    const mensaje = encodeURIComponent(document.getElementById('mensaje')?.value || '');
    window.location.href = `mailto:${destinatarios}?subject=${asunto}&body=${mensaje}`;
  });

  actualizarResumen();
  renderVentas();
});
