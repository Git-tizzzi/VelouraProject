document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const usuariosPorDefecto = [
    { id: 1, nombre: 'admin', rol: 'Administrador', mail: 'admin@veloura.com', contraseña: '1234' },
    { id: 2, nombre: 'vendedor', rol: 'Vendedor', mail: 'vendedor@veloura.com', contraseña: '1234' }
  ];

  const normalizarRol = (rol = '') => rol.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const destinoPorRol = rol => {
    const rolNormalizado = normalizarRol(rol);
    if (rolNormalizado.includes('admin')) return 'index3.html';
    if (rolNormalizado.includes('vendedor')) return 'index2.html';
    return 'index1.html';
  };

  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || usuariosPorDefecto;
    const nombre = document.getElementById('usuario').value.trim().toLowerCase();
    const mail = document.getElementById('email').value.trim().toLowerCase();
    const contraseña = document.getElementById('password').value;
    const usuario = usuarios.find(u =>
      u.nombre.toLowerCase() === nombre &&
      u.mail.toLowerCase() === mail &&
      u.contraseña === contraseña
    );

    if (!usuario) {
      alert('Datos incorrectos. Revisá el usuario, mail y contraseña.');
      return;
    }

    localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
    alert(`¡Bienvenido de nuevo, ${usuario.nombre}!`);
    window.location.href = destinoPorRol(usuario.rol);
  });
});
