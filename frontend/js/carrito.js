class Carrito {
    constructor() {
        this.items = this.cargarDelLocalStorage();
        this.initEventListeners();
        this.actualizarUI();
    }

    cargarDelLocalStorage() {
        try {
            const carritoGuardado = JSON.parse(localStorage.getItem('carrito'));
            return Array.isArray(carritoGuardado) ? carritoGuardado : [];
        } catch (error) {
            return [];
        }
    }

    guardarEnLocalStorage() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
    }

    getStock(id) {
        const producto = window.VelouraDB?.getProducto(id);
        return producto ? Number(producto.stock) || 0 : null;
    }

    initEventListeners() {
        document.addEventListener('click', (evento) => {
            const boton = evento.target.closest('.btn-carrito');
            if (!boton || boton.disabled) return;

            const card = boton.closest('.card-producto');
            if (!card) return;

            const id = card.dataset.id;
            const producto = window.VelouraDB?.getProducto(id);
            const nombre = card.querySelector('.producto-nombre')?.textContent || '';
            const precioTexto = card.querySelector('.producto-precio')?.textContent || '';

            const datosProducto = producto || {
                id,
                nombre,
                precio: parseInt(precioTexto.replace(/\D/g, '')) || 0,
                precioFormato: precioTexto,
                stock: null
            };

            this.agregarProducto(datosProducto, 1);

            boton.textContent = '✓ Agregado';
            setTimeout(() => {
                if (boton.isConnected && !boton.disabled) boton.textContent = 'Agregar al carrito';
            }, 1500);
        });

        document.getElementById('btn-carrito-header')?.addEventListener('click', () => {
            this.mostrarCarrito();
        });

        document.getElementById('cerrar-carrito')?.addEventListener('click', () => {
            this.cerrarCarrito();
        });

        document.getElementById('modal-carrito')?.addEventListener('click', (evento) => {
            if (evento.target.id === 'modal-carrito') {
                this.cerrarCarrito();
            }
        });

        document.getElementById('btn-comprar')?.addEventListener('click', () => {
            this.finalizarCompra();
        });
    }

    agregarProducto(producto, cantidad = 1) {
        const stockProducto = producto.stock !== undefined && producto.stock !== null
            ? Number(producto.stock)
            : this.getStock(producto.id);

        const maximo = stockProducto === null || Number.isNaN(stockProducto)
            ? Infinity
            : Math.max(0, stockProducto);
        const cantidadPedida = Math.max(1, parseInt(cantidad) || 1);

        if (maximo <= 0) {
            alert('No hay stock disponible de este producto.');
            return false;
        }

        const productoExistente = this.items.find((item) => String(item.id) === String(producto.id));

        if (productoExistente) {
            const nuevaCantidad = Math.min(productoExistente.cantidad + cantidadPedida, maximo);
            if (nuevaCantidad === productoExistente.cantidad) {
                alert(`Solo hay ${maximo} unidades disponibles.`);
                return false;
            }
            productoExistente.cantidad = nuevaCantidad;
            productoExistente.stock = Number.isFinite(maximo) ? maximo : (producto.stock ?? null);
        } else {
            this.items.push({
                ...producto,
                stock: Number.isFinite(maximo) ? maximo : (producto.stock ?? null),
                cantidad: Math.min(cantidadPedida, maximo)
            });
        }

        this.guardarEnLocalStorage();
        this.actualizarUI();
        return true;
    }

    eliminarProducto(index) {
        this.items.splice(index, 1);
        this.guardarEnLocalStorage();
        this.actualizarUI();
    }

    cambiarCantidad(index, cantidad) {
        const item = this.items[index];
        if (!item) return;

        let nuevaCantidad = parseInt(cantidad);
        if (Number.isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
            this.eliminarProducto(index);
            return;
        }

        const stock = this.getStock(item.id);
        const maximo = stock === null ? Infinity : Math.max(0, stock);

        if (nuevaCantidad > maximo) {
            nuevaCantidad = maximo;
            alert(`Solo hay ${maximo} unidades disponibles.`);
        }

        if (nuevaCantidad <= 0) {
            this.eliminarProducto(index);
            return;
        }

        item.cantidad = nuevaCantidad;
        this.guardarEnLocalStorage();
        this.actualizarUI();
    }

    calcularTotal() {
        return '$' + this.calcularTotalNumero().toLocaleString('es-AR');
    }

    calcularTotalNumero() {
        return this.items.reduce((suma, item) => suma + (Number(item.precio) * item.cantidad), 0);
    }

    actualizarUI() {
        this.actualizarContador();
        this.actualizarItemsCarrito();
        this.actualizarTotal();
    }

    actualizarContador() {
        const contador = document.getElementById('contador-carrito');
        if (!contador) return;
        contador.textContent = this.items.reduce((suma, item) => suma + item.cantidad, 0);
    }

    actualizarItemsCarrito() {
        const container = document.getElementById('items-carrito');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
            return;
        }

        container.innerHTML = this.items.map((item, index) => {
            const stock = this.getStock(item.id);
            const atributoMax = stock === null ? '' : `max="${stock}"`;

            return `
                <div class="item-carrito">
                    <div class="item-info">
                        <p class="item-nombre">${item.nombre}</p>
                        <p class="item-precio">${item.precioFormato || window.VelouraDB?.formatearPrecio(item.precio)}</p>
                        <div class="item-cantidad">
                            <button class="btn-cantidad" onclick="carrito.cambiarCantidad(${index}, ${item.cantidad - 1})">−</button>
                            <input type="number" class="cantidad-input" value="${item.cantidad}"
                                   ${atributoMax} min="1" onchange="carrito.cambiarCantidad(${index}, this.value)">
                            <button class="btn-cantidad" onclick="carrito.cambiarCantidad(${index}, ${item.cantidad + 1})">+</button>
                        </div>
                    </div>
                    <button class="btn-eliminar" onclick="carrito.eliminarProducto(${index})">Eliminar</button>
                </div>
            `;
        }).join('');
    }

    actualizarTotal() {
        const total = document.getElementById('total-precio');
        if (total) total.textContent = this.calcularTotal();
    }

    mostrarCarrito() {
        const modal = document.getElementById('modal-carrito');
        if (modal) modal.style.display = 'block';
    }

    cerrarCarrito() {
        const modal = document.getElementById('modal-carrito');
        if (modal) modal.style.display = 'none';
    }

    finalizarCompra() {
        if (this.items.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }

        const db = window.VelouraDB;
        const tipoEntrega = document.getElementById('tipo-entrega')?.value === 'domicilio'
            ? 'domicilio'
            : 'local';
        const usuario = db?.getUsuarioLogueado() || null;

        const venta = {
            id: Date.now(),
            fecha: new Date().toISOString(),
            items: this.items.map((item) => ({
                id: item.id,
                nombre: item.nombre,
                precio: Number(item.precio),
                cantidad: item.cantidad
            })),
            total: this.calcularTotalNumero(),
            totalFormato: this.calcularTotal(),
            entrega: tipoEntrega,
            cliente: usuario ? {
                nombre: usuario.nombre,
                mail: usuario.mail,
                dni: usuario.dni || '',
                direccion: usuario.direccion || '',
                telefono: usuario.telefono || ''
            } : null
        };

        if (db) {
            const ventas = db.getVentas();
            ventas.push(venta);
            db.saveVentas(ventas);

            const productos = db.getProductos();
            this.items.forEach((item) => {
                const producto = productos.find((p) => String(p.id) === String(item.id));
                if (producto) {
                    producto.stock = Math.max(0, Number(producto.stock) - item.cantidad);
                }
            });
            db.saveProductos(productos);
        }

        const entregaTexto = tipoEntrega === 'domicilio' ? 'Envío a domicilio' : 'Retiro en el local';
        alert(`¡Compra realizada! Total: ${this.calcularTotal()}\nEntrega: ${entregaTexto}\n\nGracias por su compra.`);

        this.items = [];
        this.guardarEnLocalStorage();
        this.actualizarUI();
        this.cerrarCarrito();
    }
}

let carrito;
document.addEventListener('DOMContentLoaded', () => {
    carrito = new Carrito();
    window.carrito = carrito;
});
