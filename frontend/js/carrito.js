
class Carrito {
    constructor() {
        this.items = this.cargarDelLocalStorage();
        this.initEventListeners();
        this.actualizarUI();
    }

    
    cargarDelLocalStorage() {
        const carritoGuardado = localStorage.getItem('carrito');
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    }

    guardarEnLocalStorage() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
    }

    
    initEventListeners() {
        
        document.querySelectorAll('.btn-carrito').forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.card-producto');
                const nombre = card.querySelector('.producto-nombre').textContent;
                const precio = card.querySelector('.producto-precio').textContent;
                const precioNumero = parseInt(precio.replace(/\D/g, ''));
                
                this.agregarProducto({
                    id: index,
                    nombre: nombre,
                    precio: precioNumero,
                    precioFormato: precio
                });
                
                
                btn.textContent = '✓ Agregado';
                setTimeout(() => {
                    btn.textContent = 'Agregar al carrito';
                }, 1500);
            });
        });

    
        document.getElementById('btn-carrito-header').addEventListener('click', () => {
            this.mostrarCarrito();
        });

        document.getElementById('cerrar-carrito').addEventListener('click', () => {
            this.cerrarCarrito();
        });

       
        document.getElementById('modal-carrito').addEventListener('click', (e) => {
            if (e.target.id === 'modal-carrito') {
                this.cerrarCarrito();
            }
        });

      
        document.getElementById('btn-comprar').addEventListener('click', () => {
            if (this.items.length > 0) {
                alert(`¡Compra realizada! Total: ${this.calcularTotal()}\n\nGracias por su compra.`);
                this.items = [];
                this.guardarEnLocalStorage();
                this.actualizarUI();
                this.cerrarCarrito();
            } else {
                alert('Tu carrito está vacío');
            }
        });
    }

   
    agregarProducto(producto) {
        const productoExistente = this.items.find(item => item.id === producto.id);
        
        if (productoExistente) {
            productoExistente.cantidad++;
        } else {
            this.items.push({
                ...producto,
                cantidad: 1
            });
        }
        
        this.guardarEnLocalStorage();
        this.actualizarUI();
    }

    
    eliminarProducto(index) {
        this.items.splice(index, 1);
        this.guardarEnLocalStorage();
        this.actualizarUI();
    }

    
    cambiarCantidad(index, cantidad) {
        cantidad = parseInt(cantidad);
        if (cantidad <= 0) {
            this.eliminarProducto(index);
        } else {
            this.items[index].cantidad = cantidad;
            this.guardarEnLocalStorage();
            this.actualizarUI();
        }
    }

   
    calcularTotal() {
        const total = this.items.reduce((suma, item) => suma + (item.precio * item.cantidad), 0);
        return '$' + total.toLocaleString('es-AR');
    }

  
    calcularTotalNumero() {
        return this.items.reduce((suma, item) => suma + (item.precio * item.cantidad), 0);
    }

   
    actualizarUI() {
        this.actualizarContador();
        this.actualizarItemsCarrito();
        this.actualizarTotal();
    }

    
    actualizarContador() {
        const contador = this.items.reduce((suma, item) => suma + item.cantidad, 0);
        document.getElementById('contador-carrito').textContent = contador;
    }

  
    actualizarItemsCarrito() {
        const container = document.getElementById('items-carrito');
        
        if (this.items.length === 0) {
            container.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
            return;
        }

        container.innerHTML = this.items.map((item, index) => `
            <div class="item-carrito">
                <div class="item-info">
                    <p class="item-nombre">${item.nombre}</p>
                    <p class="item-precio">${item.precioFormato}</p>
                    <div class="item-cantidad">
                        <button class="btn-cantidad" onclick="carrito.cambiarCantidad(${index}, ${item.cantidad - 1})">−</button>
                        <input type="number" class="cantidad-input" value="${item.cantidad}" 
                               onchange="carrito.cambiarCantidad(${index}, this.value)" min="1">
                        <button class="btn-cantidad" onclick="carrito.cambiarCantidad(${index}, ${item.cantidad + 1})">+</button>
                    </div>
                </div>
                <button class="btn-eliminar" onclick="carrito.eliminarProducto(${index})">Eliminar</button>
            </div>
        `).join('');
    }

    
    actualizarTotal() {
        document.getElementById('total-precio').textContent = this.calcularTotal();
    }

    
    mostrarCarrito() {
        document.getElementById('modal-carrito').style.display = 'block';
    }

    
    cerrarCarrito() {
        document.getElementById('modal-carrito').style.display = 'none';
    }
}


let carrito;
document.addEventListener('DOMContentLoaded', () => {
    carrito = new Carrito();
});
