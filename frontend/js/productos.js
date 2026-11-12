document.addEventListener('DOMContentLoaded', () => {
  const db = window.VelouraDB;
  if (!db) return;

  let editingId = null;
  let editingUsuarioId = null;

  const getVal = (id) => document.getElementById(id)?.value.trim() || '';

  const crearListaImagenes = (imagenPrincipal, imagenesAdicionales) => {
    const adicionales = (imagenesAdicionales || '')
      .split('\n')
      .map((linea) => linea.trim())
      .filter(Boolean);

    return [...new Set([imagenPrincipal, ...adicionales].filter(Boolean))];
  };

  function renderProductos() {
    const container = document.querySelector('.productos-container');
    if (!container) return;

    const productos = db.getProductos();

    if (!productos.length) {
      container.innerHTML = '<p class="sin-productos">No hay productos cargados.</p>';
      return;
    }

    container.innerHTML = productos.map((p) => `
      <div class="card-producto" data-id="${p.id}">
        <a class="card-producto-link" href="producto.html?id=${encodeURIComponent(p.id)}">
          <div class="imagen-container">
            ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}" class="producto-imagen">` : ''}
          </div>
        </a>
        <div class="producto-info">
          <h3 class="producto-nombre">${p.nombre}</h3>
          <p class="producto-precio">${p.precioFormato}</p>
          <p class="producto-stock">Stock: ${p.stock}</p>
          <button class="btn-carrito" ${p.stock <= 0 ? 'disabled' : ''}>${p.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}</button>
          <a class="btn-ver-detalle" href="producto.html?id=${encodeURIComponent(p.id)}">Ver detalle</a>
        </div>
      </div>
    `).join('');
  }

  function renderTable(tableId, data, templateFn) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = data.map(templateFn).join('');
  }

  const renderVendedorTable = () => renderTable('tablaProductosVendedor', db.getProductos(), (p) => `
    <tr data-id="${p.id}">
      <td>${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}" style="height:60px; object-fit:cover;">` : ''}</td>
      <td>${p.nombre}</td>
      <td>${p.precioFormato}</td>
      <td>${p.imagen}</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn-editar-vendedor" data-id="${p.id}">Editar</button>
        <button class="btn-eliminar-vendedor" data-id="${p.id}">Eliminar</button>
      </td>
    </tr>
  `);

  const renderUsuariosTable = () => renderTable('tablaUsuarios', db.getUsuarios(), (u) => `
    <tr data-id="${u.id}">
      <td>${u.nombre}</td>
      <td>${u.rol}</td>
      <td>${u.mail}</td>
      <td>${u.dni}</td>
      <td>${u.direccion}</td>
      <td>${u.telefono}</td>
      <td>${u.contraseña}</td>
      <td>
        <button class="btn-editar-usuario" data-id="${u.id}">Editar</button>
        <button class="btn-eliminar-usuario" data-id="${u.id}">Eliminar</button>
      </td>
    </tr>
  `);

  function manageFormFields(fields, values = null, btnId = '', btnTexts = []) {
    fields.forEach(([id, key]) => {
      const element = document.getElementById(id);
      if (element) element.value = values ? (values[key] ?? '') : '';
    });
    const boton = document.getElementById(btnId);
    if (boton) boton.textContent = values ? btnTexts[0] : btnTexts[1];
  }

  const pFields = [
    ['nombre', 'nombre'],
    ['precio', 'precio'],
    ['stock', 'stock'],
    ['descripcion', 'descripcion'],
    ['caracteristicas', 'caracteristicas'],
    ['imagen', 'imagen'],
    ['imagenes', 'imagenes'],
    ['editingId', 'id']
  ];

  const uFields = [
    ['usuarioNombre', 'nombre'],
    ['usuarioRol', 'rol'],
    ['usuarioMail', 'mail'],
    ['usuarioPassword', 'contraseña'],
    ['usuarioDni', 'dni'],
    ['usuarioDireccion', 'direccion'],
    ['usuarioTelefono', 'telefono'],
    ['editingUsuarioId', 'id']
  ];

  const toggleForm = (isEdit, data, fields, btnId, texts) => {
    manageFormFields(fields, isEdit ? data : null, btnId, texts);
    if (isEdit) {
      window.scrollTo({
        top: fields[0][0] === 'usuarioNombre' ? 0 : 800,
        behavior: 'smooth'
      });
    }
  };

  const handleItemDelete = (confirmMsg, getFn, saveFn, renderFn, id, postRenderExtra = () => {}) => {
    if (confirm(confirmMsg)) {
      saveFn(getFn().filter((item) => item.id !== id));
      renderFn();
      postRenderExtra();
    }
  };

  const formProd = document.getElementById('formProductoAgregar');
  formProd?.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const nombre = getVal('nombre');
    const precio = parseFloat(getVal('precio'));
    const stock = parseInt(getVal('stock'));
    const descripcion = getVal('descripcion');
    const caracteristicas = getVal('caracteristicas');
    const imagen = getVal('imagen');
    const imagenesAdicionales = getVal('imagenes');
    const editId = parseInt(getVal('editingId'));

    if (!nombre || Number.isNaN(precio) || Number.isNaN(stock)) {
      return alert('Complete el nombre, precio y stock correctamente.');
    }
    if (!imagen) {
      return alert('Ingrese la ruta o URL de la imagen principal.');
    }
    if (stock < 0) {
      return alert('El stock no puede ser negativo.');
    }

    const imagenes = crearListaImagenes(imagen, imagenesAdicionales);
    const productos = db.getProductos();
    const itemData = {
      nombre,
      precio,
      precioFormato: db.formatearPrecio(precio),
      descripcion,
      caracteristicas,
      imagen,
      imagenes,
      stock
    };

    if (editId) {
      const indice = productos.findIndex((p) => p.id === editId);
      if (indice !== -1) productos[indice] = { ...productos[indice], ...itemData };
    } else {
      productos.push({ id: Date.now(), ...itemData });
    }

    db.saveProductos(productos);
    renderVendedorTable();
    renderProductos();
    manageFormFields(pFields, null, 'submitProducto', ['Guardar cambios', 'Agregar producto']);
    editingId = null;
  });

  document.getElementById('tablaProductosVendedor')?.addEventListener('click', (evento) => {
    const id = parseInt(evento.target.closest('button')?.getAttribute('data-id'));
    if (!id) return;

    if (evento.target.closest('.btn-editar-vendedor')) {
      const producto = db.getProducto(id);
      if (producto) {
        editingId = id;
        const datosFormulario = {
          ...producto,
          imagenes: (producto.imagenes || []).filter((img) => img !== producto.imagen).join('\n')
        };
        toggleForm(true, datosFormulario, pFields, 'submitProducto', ['Guardar cambios', 'Agregar producto']);
      }
    } else if (evento.target.closest('.btn-eliminar-vendedor')) {
      handleItemDelete('¿Eliminar este producto?', db.getProductos, db.saveProductos, renderVendedorTable, id, renderProductos);
    }
  });

  document.getElementById('formUsuarioAgregar')?.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const nombre = getVal('usuarioNombre');
    const rol = getVal('usuarioRol');
    const mail = getVal('usuarioMail');
    const contraseña = getVal('usuarioPassword');
    const dni = getVal('usuarioDni');
    const direccion = getVal('usuarioDireccion');
    const telefono = getVal('usuarioTelefono');
    const editId = parseInt(getVal('editingUsuarioId'));

    if (!nombre || !rol || !mail || !contraseña) {
      return alert('Complete nombre, rol, mail y contraseña del usuario.');
    }

    const usuarios = db.getUsuarios();
    const mailNormalizado = mail.toLowerCase();
    const mailDuplicado = usuarios.some((u) => (
      u.mail.toLowerCase() === mailNormalizado && (!editId || u.id !== editId)
    ));

    if (mailDuplicado) {
      return alert('Ya existe un usuario con ese correo electrónico.');
    }

    if (editId) {
      const indice = usuarios.findIndex((u) => u.id === editId);
      if (indice !== -1) {
        usuarios[indice] = { ...usuarios[indice], nombre, rol, mail, contraseña, dni, direccion, telefono };
      }
    } else {
      usuarios.push({ id: Date.now(), nombre, rol, mail, contraseña, dni, direccion, telefono });
    }

    db.saveUsuarios(usuarios);
    renderUsuariosTable();
    manageFormFields(uFields, null, 'submitUsuario', ['Guardar cambios', 'Agregar usuario']);
    editingUsuarioId = null;
  });

  document.getElementById('tablaUsuarios')?.addEventListener('click', (evento) => {
    const id = parseInt(evento.target.closest('button')?.getAttribute('data-id'));
    if (!id) return;

    if (evento.target.closest('.btn-editar-usuario')) {
      const usuario = db.getUsuarios().find((u) => u.id === id);
      if (usuario) {
        editingUsuarioId = id;
        toggleForm(true, usuario, uFields, 'submitUsuario', ['Guardar cambios', 'Agregar usuario']);
      }
    } else if (evento.target.closest('.btn-eliminar-usuario')) {
      handleItemDelete('¿Eliminar este usuario?', db.getUsuarios, db.saveUsuarios, renderUsuariosTable, id);
    }
  });

  renderProductos();
  renderVendedorTable();
  renderUsuariosTable();
});
