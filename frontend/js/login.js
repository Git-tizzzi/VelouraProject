document.addEventListener('DOMContentLoaded', () => {
  const db = window.VelouraDB;
  if (!db) return;

  const tabs = document.querySelectorAll('.login-tab');
  const loginForm = document.getElementById('loginForm');
  const registroForm = document.getElementById('registroForm');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      const activo = tab.dataset.tab;

      if (loginForm) loginForm.classList.toggle('active', activo === 'login');
      if (registroForm) registroForm.classList.toggle('active', activo === 'registro');
    });
  });

  const normalizarRol = (rol = '') => rol.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const destinoPorRol = (rol) => {
    const rolNormalizado = normalizarRol(rol);
    if (rolNormalizado.includes('admin')) return 'index3.html';
    if (rolNormalizado.includes('vendedor')) return 'index2.html';
    return 'index1.html';
  };

  loginForm?.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const mail = document.getElementById('email')?.value.trim().toLowerCase() || '';
    const contraseña = document.getElementById('password')?.value || '';

    if (!mail || !contraseña) return;

    const usuario = db.getUsuarios().find((u) => (
      u.mail.toLowerCase() === mail && u.contraseña === contraseña
    ));

    if (!usuario) {
      alert('Correo o contraseña incorrectos.');
      return;
    }

    db.iniciarSesion(usuario);
    alert(`¡Bienvenido de nuevo, ${usuario.nombre}!`);
    window.location.href = destinoPorRol(usuario.rol);
  });

  registroForm?.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const getVal = (id) => document.getElementById(id)?.value.trim() || '';

    const nombre = getVal('regNombre');
    const dni = getVal('regDni');
    const telefono = getVal('regTelefono');
    const direccion = getVal('regDireccion');
    const mail = getVal('regEmail').toLowerCase();
    const contraseña = document.getElementById('regPassword')?.value || '';
    const contraseña2 = document.getElementById('regPassword2')?.value || '';

    if (!nombre || !dni || !telefono || !direccion || !mail || !contraseña) {
      return alert('Complete todos los campos del formulario.');
    }

    if (contraseña !== contraseña2) {
      return alert('Las contraseñas no coinciden.');
    }

    const usuarios = db.getUsuarios();
    const mailDuplicado = usuarios.some((u) => u.mail.toLowerCase() === mail);

    if (mailDuplicado) {
      alert('Ya existe una cuenta registrada con ese correo electrónico.');
      document.getElementById('regEmail')?.focus();
      return;
    }

    const nuevoUsuario = {
      id: Date.now(),
      nombre,
      rol: 'Cliente',
      mail,
      contraseña,
      dni,
      direccion,
      telefono
    };

    usuarios.push(nuevoUsuario);
    db.saveUsuarios(usuarios);
    db.iniciarSesion(nuevoUsuario);

    alert('¡Cuenta creada correctamente!');
    window.location.href = 'index1.html';
  });
});
