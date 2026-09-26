document.addEventListener('DOMContentLoaded', () => {
  let editingId = null;
  let editingUsuarioId = null;

  // --- Almacenamiento local sin BD
  const storage = {
    get: (key, defaults) => JSON.parse(localStorage.getItem(key)) || defaults,
    save: (key, data) => localStorage.setItem(key, JSON.stringify(data))
  };

  const defProductos = [
    {id: 1, nombre: 'Remera Chrome Hearts', precio: 48500, precioFormato: '$48.500', descripcion: '', imagen: 'img/CH.jpg', stock: 10},
    {id: 2, nombre: 'Pantalón True Religion BC', precio: 84500, precioFormato: '$84.500', descripcion: '', imagen: 'img/TR.jpg', stock: 5},
    {id: 3, nombre: 'Campera Moncler WHITE', precio: 220000, precioFormato: '$220.000', descripcion: '', imagen: 'img/MCR.png', stock: 2}
  ];
  const defUsuarios = [{id: 1, nombre: 'admin', rol: 'Administrador', mail: 'admin@veloura.com', contraseña: '1234'}];

  const getProductos = () => storage.get('productos', defProductos);
  const saveProductos = (arr) => storage.save('productos', arr);
  const getUsuarios = () => storage.get('usuarios', defUsuarios);
  const saveUsuarios = (arr) => storage.save('usuarios', arr);

  const formatPrice = (num) => '$' + Number(num).toLocaleString('es-AR');
  const getDisplayPrice = (p) => p.precioFormato || formatPrice(p.precio);

  // --- dibujado de tablas o cards
  function renderProductos() {
    const container = document.querySelector('.productos-container');
    if (!container) return;
    
    container.innerHTML = getProductos().map(p => `
      <div class="card-producto" data-id="${p.id}">
        <div class="imagen-container"><img src="${p.imagen}" alt="${p.nombre}" class="producto-imagen"></div>
        <div class="producto-info">
          <h3 class="producto-nombre">${p.nombre}</h3>
          <p class="producto-precio">${getDisplayPrice(p)}</p>
          <button class="btn-carrito">Agregar al carrito</button>
        </div>
      </div>
    `).join('');
  }

  // boton Agregar al carrito
  document.addEventListener('click', (e) => {
    if (!e.target.matches('.btn-carrito')) return;
    const btn = e.target;
    const card = btn.closest('.card-producto');
    const nombre = card.querySelector('.producto-nombre').textContent;
    const precioText = card.querySelector('.producto-precio').textContent;
    const id = parseInt(card.dataset.id) || Date.now();

    if (window.carrito?.agregarProducto) {
      window.carrito.agregarProducto({ id, nombre, precio: parseInt(precioText.replace(/\D/g, '')) || 0, precioFormato: precioText });
    }

    btn.textContent = '✓ Agregado';
    setTimeout(() => { btn.textContent = 'Agregar al carrito'; }, 1500);
  });

// Rellena la informacion de tablas prods y usuarios.

  function renderTable(tableId, data, templateFn) {
    const table = document.getElementById(tableId);
    if (table) table.querySelector('tbody').innerHTML = data.map(templateFn).join('');
  }

  const renderVendedorTable = () => renderTable('tablaProductosVendedor', getProductos(), p => `
    <tr data-id="${p.id}">
      <td><img src="${p.imagen}" alt="${p.nombre}" style="height:60px; object-fit:cover;"></td>
      <td>${p.nombre}</td>
      <td>${getDisplayPrice(p)}</td>
      <td>${p.imagen}</td>
      <td>${p.stock ?? ''}</td>
      <td>
        <button class="btn-editar-vendedor" data-id="${p.id}">Editar</button>
        <button class="btn-eliminar-vendedor" data-id="${p.id}">Eliminar</button>
      </td>
    </tr>
  `);

  const renderUsuariosTable = () => renderTable('tablaUsuarios', getUsuarios(), u => `
    <tr data-id="${u.id}">
      <td>${u.nombre}</td><td>${u.rol}</td><td>${u.mail}</td><td>${u.contraseña}</td>
      <td>
        <button class="btn-editar-usuario" data-id="${u.id}">Editar</button>
        <button class="btn-eliminar-usuario" data-id="${u.id}">Eliminar</button>
      </td>
    </tr>
  `);

 
  function manageFormFields(fields, values = null, btnId = '', btnTexts = []) {
    fields.forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el) el.value = values ? (values[key] ?? '') : '';
    });
    const btn = document.getElementById(btnId);
    if (btn) btn.textContent = values ? btnTexts[0] : btnTexts[1];
  }

  const pFields = [['nombre','nombre'], ['precio','precio'], ['descripcion','descripcion'], ['imagen','imagen'], ['stock','stock'], ['editingId','id']];
  const uFields = [['usuarioNombre','nombre'], ['usuarioRol','rol'], ['usuarioMail','mail'], ['usuarioPassword','contraseña'], ['editingUsuarioId','id']];

  const toggleForm = (isEdit, data, fields, btnId, texts) => {
    manageFormFields(fields, isEdit ? data : null, btnId, texts);
    if (isEdit) window.scrollTo({ top: fields[0][0] === 'usuarioNombre' ? 0 : 800, behavior: 'smooth' });
  };

  // --- MANEJADORES DE ENTRADAS (SUBMITS Y CRUDS) ---
  const handleItemDelete = (confirmMsg, getFn, saveFn, renderFn, id, postRenderExtra = () => {}) => {
    if (confirm(confirmMsg)) {
      saveFn(getFn().filter(item => item.id !== id));
      renderFn();
      postRenderExtra();
    }
  };

  // Formulario de Productos
  const formProd = document.getElementById('formProductoAgregar') || document.getElementById('formProducto');
  formProd?.addEventListener('submit', (e) => {
    e.preventDefault();
    const getVal = (id) => document.getElementById(id)?.value.trim() || '';
    const nombre = getVal('nombre'), descripcion = getVal('descripcion'), imagen = getVal('imagen') || 'img/remera.jpg';
    const precio = parseFloat(getVal('precio')), stock = parseInt(getVal('stock')), editId = parseInt(getVal('editingId'));

    if (!nombre || isNaN(precio) || isNaN(stock)) return alert('Complete el nombre, precio y stock correctamente.');

    let productos = getProductos();
    const itemData = { nombre, precio, precioFormato: formatPrice(precio), descripcion, imagen, stock };

    if (editId) {
      const idx = productos.findIndex(p => p.id === editId);
      if (idx !== -1) productos[idx] = { ...productos[idx], ...itemData };
    } else {
      productos.push({ id: Date.now(), ...itemData });
    }

    saveProductos(productos);
    renderVendedorTable();
    renderProductos();
    manageFormFields(pFields, null, 'submitProducto', ['', 'Agregar producto']);
    editingId = null;

    if (!document.getElementById('tablaProductosVendedor')) window.location.href = 'index1.html';
  });

  // Tablas Delegadas (Productos)
  document.getElementById('tablaProductosVendedor')?.addEventListener('click', (e) => {
    const id = parseInt(e.target.closest('button')?.getAttribute('data-id'));
    if (!id) return;
    if (e.target.closest('.btn-editar-vendedor')) {
      const prod = getProductos().find(p => p.id === id);
      if (prod) { editingId = id; toggleForm(true, prod, pFields, 'submitProducto', ['Guardar cambios', 'Agregar producto']); }
    } else if (e.target.closest('.btn-eliminar-vendedor')) {
      handleItemDelete('¿Eliminar este producto?', getProductos(), saveProductos, renderVendedorTable, id, renderProductos);
    }
  });


  // Formulario de Usuarios
  document.getElementById('formUsuarioAgregar')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const getVal = (id) => document.getElementById(id)?.value.trim() || '';
    const nombre = getVal('usuarioNombre'), rol = getVal('usuarioRol'), mail = getVal('usuarioMail'), contraseña = getVal('usuarioPassword'), editId = parseInt(getVal('editingUsuarioId'));

    if (!nombre || !rol || !mail || !contraseña) return alert('Complete todos los campos del usuario.');

    let usuarios = getUsuarios();
    if (editId) {
      const idx = usuarios.findIndex(u => u.id === editId);
      if (idx !== -1) usuarios[idx] = { ...usuarios[idx], nombre, rol, mail, contraseña };
    } else {
      usuarios.push({ id: Date.now(), nombre, rol, mail, contraseña });
    }

    saveUsuarios(usuarios);
    renderUsuariosTable();
    manageFormFields(uFields, null, 'submitUsuario', ['', 'Agregar usuario']);
    editingUsuarioId = null;
  });

  // Tablas Usuarios
  document.getElementById('tablaUsuarios')?.addEventListener('click', (e) => {
    const id = parseInt(e.target.closest('button')?.getAttribute('data-id'));
    if (!id) return;
    if (e.target.closest('.btn-editar-usuario')) {
      const user = getUsuarios().find(u => u.id === id);
      if (user) { editingUsuarioId = id; toggleForm(true, user, uFields, 'submitUsuario', ['Guardar cambios', 'Agregar usuario']); }
    } else if (e.target.closest('.btn-eliminar-usuario')) {
      handleItemDelete('¿Eliminar este usuario?', getUsuarios(), saveUsuarios, renderUsuariosTable, id);
    }
  });

  // Inicia programa
  renderProductos();
  renderVendedorTable();
  renderUsuariosTable();
});