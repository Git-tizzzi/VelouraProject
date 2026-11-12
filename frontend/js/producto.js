document.addEventListener('DOMContentLoaded', () => {
    const db = window.VelouraDB;
    const contenedor = document.getElementById('detalle-producto');
    if (!db || !contenedor) return;

    const id = new URLSearchParams(window.location.search).get('id');
    const producto = id ? db.getProducto(id) : null;

    if (!producto) {
        contenedor.innerHTML = `
            <div class="detalle-error">
                <h2>Producto no encontrado</h2>
                <a class="btn-ver-detalle" href="index1.html">Volver al catálogo</a>
            </div>
        `;
        document.querySelector('.relacionados')?.remove();
        return;
    }

    const imagenes = producto.imagenes && producto.imagenes.length
        ? producto.imagenes
        : (producto.imagen ? [producto.imagen] : []);
    const hayStock = producto.stock > 0;
    const imagenPrincipal = imagenes[0] || '';

    contenedor.innerHTML = `
        <div class="detalle-grid">
            <div class="detalle-galeria">
                <div class="carrusel">
                    ${imagenes.length > 1 ? '<button type="button" class="carrusel-btn prev" data-dir="-1" aria-label="Imagen anterior">‹</button>' : ''}
                    <div class="carrusel-imagen">
                        ${imagenPrincipal
                            ? `<img id="carrusel-img" src="${imagenPrincipal}" alt="${producto.nombre}">`
                            : '<span class="sin-imagen">Sin imagen</span>'}
                    </div>
                    ${imagenes.length > 1 ? '<button type="button" class="carrusel-btn next" data-dir="1" aria-label="Imagen siguiente">›</button>' : ''}
                </div>
                ${imagenes.length > 1 ? `
                    <div class="carrusel-miniaturas">
                        ${imagenes.map((src, indice) => `
                            <button type="button" class="miniatura ${indice === 0 ? 'activa' : ''}">
                                <img src="${src}" alt="${producto.nombre} ${indice + 1}">
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <div class="detalle-info">
                <h1>${producto.nombre}</h1>
                <p class="detalle-precio">${producto.precioFormato}</p>
                <p class="detalle-stock">Stock disponible: ${producto.stock}</p>

                <div class="detalle-descripcion">
                    <h2>Descripción</h2>
                    <p>${producto.descripcion}</p>
                </div>

                ${producto.caracteristicas ? `
                    <div class="detalle-caracteristicas">
                        <h2>Características</h2>
                        <p>${producto.caracteristicas}</p>
                    </div>
                ` : ''}

                <div class="selector-cantidad">
                    <button type="button" id="btn-menos" ${hayStock ? '' : 'disabled'}>−</button>
                    <input type="number" id="cantidad" value="1" min="1" max="${Math.max(producto.stock, 1)}" ${hayStock ? '' : 'disabled'}>
                    <button type="button" id="btn-mas" ${hayStock ? '' : 'disabled'}>+</button>
                </div>

                <button id="btn-agregar-detalle" class="btn-carrito btn-agregar-detalle" ${hayStock ? '' : 'disabled'}>
                    ${hayStock ? 'Agregar al carrito' : 'Sin stock'}
                </button>
                <button id="btn-comprar-directo" class="btn-comprar-directo" ${hayStock ? '' : 'disabled'}>
                    Comprar ahora
                </button>
            </div>
        </div>
    `;

    const imagenCarrusel = document.getElementById('carrusel-img');
    const miniaturas = Array.from(document.querySelectorAll('.miniatura'));
    let indiceActual = 0;

    const mostrarImagen = (nuevoIndice) => {
        if (!imagenes.length || !imagenCarrusel) return;
        indiceActual = (nuevoIndice + imagenes.length) % imagenes.length;
        imagenCarrusel.src = imagenes[indiceActual];
        miniaturas.forEach((miniatura, indice) => {
            miniatura.classList.toggle('activa', indice === indiceActual);
        });
    };

    document.querySelectorAll('[data-dir]').forEach((boton) => {
        boton.addEventListener('click', () => {
            mostrarImagen(indiceActual + parseInt(boton.dataset.dir));
        });
    });

    miniaturas.forEach((miniatura, indice) => {
        miniatura.addEventListener('click', () => mostrarImagen(indice));
    });

    const inputCantidad = document.getElementById('cantidad');
    const btnMenos = document.getElementById('btn-menos');
    const btnMas = document.getElementById('btn-mas');

    const obtenerCantidad = () => {
        if (!inputCantidad) return 1;
        const valor = parseInt(inputCantidad.value) || 1;
        return Math.min(Math.max(1, valor), producto.stock);
    };

    btnMenos?.addEventListener('click', () => {
        if (!inputCantidad) return;
        inputCantidad.value = Math.max(1, obtenerCantidad() - 1);
    });

    btnMas?.addEventListener('click', () => {
        if (!inputCantidad) return;
        inputCantidad.value = Math.min(producto.stock, obtenerCantidad() + 1);
    });

    inputCantidad?.addEventListener('change', () => {
        if (!inputCantidad) return;
        inputCantidad.value = obtenerCantidad();
    });

    document.getElementById('btn-agregar-detalle')?.addEventListener('click', (evento) => {
        if (!hayStock || !window.carrito) return;
        const agregado = window.carrito.agregarProducto(producto, obtenerCantidad());
        if (agregado === false) return;

        const boton = evento.currentTarget;
        boton.textContent = '✓ Agregado';
        setTimeout(() => {
            if (boton.isConnected) boton.textContent = 'Agregar al carrito';
        }, 1500);
    });

    document.getElementById('btn-comprar-directo')?.addEventListener('click', () => {
        if (!hayStock || !window.carrito) return;
        if (window.carrito.agregarProducto(producto, obtenerCantidad()) === false) return;
        window.carrito.mostrarCarrito();
    });

    const relacionados = db.getProductos()
        .filter((p) => String(p.id) !== String(producto.id))
        .slice(0, 4);

    const contenedorRelacionados = document.getElementById('relacionados-container');

    if (contenedorRelacionados) {
        if (relacionados.length) {
            contenedorRelacionados.innerHTML = relacionados.map((p) => `
                <a class="card-relacionado" href="producto.html?id=${encodeURIComponent(p.id)}">
                    <div class="relacionado-imagen">
                        ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}">` : ''}
                    </div>
                    <div class="card-relacionado-info">
                        <h3>${p.nombre}</h3>
                        <p>${p.precioFormato}</p>
                    </div>
                </a>
            `).join('');
        } else {
            document.querySelector('.relacionados')?.remove();
        }
    }
});
