const API_URL = 'http://localhost/tienda/api.php';
let productos = [];
let carrito = [];
let categorias = [];

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sistema iniciado');
    console.log('Función agregarAlCarrito disponible:', typeof agregarAlCarrito);
    
    cargarProductos();
    cargarCategorias();
    actualizarContadorCarrito();
    
    // Hacer la función disponible globalmente
    window.agregarAlCarrito = agregarAlCarrito;
    window.cambiarCantidad = cambiarCantidad;
    window.eliminarDelCarrito = eliminarDelCarrito;
    window.toggleCarrito = toggleCarrito;
    window.abrirCheckout = abrirCheckout;
    window.procesarVenta = procesarVenta;
    window.cambiarVista = cambiarVista;
    window.cambiarTabAdmin = cambiarTabAdmin;
    window.cambiarEstadoVenta = cambiarEstadoVenta;
    window.verDetalleVenta = verDetalleVenta;
    window.abrirModalProducto = abrirModalProducto;
    window.editarProducto = editarProducto;
    window.guardarProducto = guardarProducto;
    window.eliminarProducto = eliminarProducto;
    window.cerrarModal = cerrarModal;
    window.filtrarProductos = filtrarProductos;
    window.previsualizarImagen = previsualizarImagen;
    
    console.log('Todas las funciones exportadas al scope global');
});

// Cargar productos - MEJORADO con mejor detección de errores
async function cargarProductos() {
    console.log('Intentando cargar productos...');
    console.log('URL completa:', `${API_URL}?action=productos`);
    
    try {
        const response = await fetch(`${API_URL}?action=productos`);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.get('content-type'));
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Respuesta no es JSON:', text);
            throw new Error('La respuesta no es JSON válido. Revisa la consola.');
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (data.success) {
            // Eliminar duplicados basados en ID
            const productosUnicos = [];
            const idsVistos = new Set();
            
            data.data.forEach(producto => {
                if (!idsVistos.has(producto.id)) {
                    idsVistos.add(producto.id);
                    productosUnicos.push(producto);
                }
            });
            
            productos = productosUnicos;
            console.log(`Productos únicos cargados: ${productos.length}`);
            mostrarProductos(productos);
        } else {
            throw new Error(data.error || 'No se recibió success=true');
        }
    } catch (error) {
        console.error('Error detallado:', error);
        document.getElementById('productos-grid').innerHTML = 
            `<div class="alert alert-error">
                <h3>Error al cargar productos</h3>
                <p>${error.message}</p>
                <p><strong>Pasos para solucionar:</strong></p>
                <ol style="text-align: left; margin: 10px 0;">
                    <li>Verifica que XAMPP Apache esté corriendo (verde)</li>
                    <li>Verifica que XAMPP MySQL esté corriendo (verde)</li>
                    <li>Abre: <a href="${API_URL}?action=productos" target="_blank">${API_URL}?action=productos</a></li>
                    <li>Presiona F12 y revisa la pestaña Console</li>
                </ol>
            </div>`;
    }
}

// Mostrar productos - CORREGIDO: Limpiamos el contenedor primero
function mostrarProductos(items) {
    const container = document.getElementById('productos-grid');
    
    // IMPORTANTE: Limpiar el contenedor completamente
    container.innerHTML = '';
    
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="alert alert-error">No se encontraron productos</div>';
        return;
    }
    
    console.log('Mostrando productos:', items.length);
    
    // Crear el HTML de los productos
    const productosHTML = items.map(p => {
        const stock = parseInt(p.stock);
        const sinStock = stock === 0;
        
        return `
        <div class="producto-card" data-producto-id="${p.id}">
            <img src="${p.imagen}" alt="${p.nombre}" class="producto-img" onerror="this.src='https://via.placeholder.com/400x250?text=Sin+Imagen'">
            <div class="producto-info">
                <span class="producto-categoria">${p.categoria}</span>
                <div class="producto-nombre">${p.nombre}</div>
                <div class="producto-descripcion">${p.descripcion}</div>
                <div class="producto-stock">📦 Stock: ${stock} unidades</div>
                <div class="producto-footer">
                    <div class="producto-precio">${parseFloat(p.precio).toLocaleString('es-AR')}</div>
                </div>
                <button 
                    class="btn-agregar" 
                    onclick="agregarAlCarrito(${p.id}); return false;" 
                    ${sinStock ? 'disabled' : ''}
                    type="button">
                    ${sinStock ? '❌ Sin Stock' : '🛒 Agregar al Carrito'}
                </button>
            </div>
        </div>
    `;
    }).join('');
    
    // Asignar el HTML una sola vez
    container.innerHTML = productosHTML;
    
    console.log('Productos renderizados correctamente');
}

// Cargar categorías - MEJORADO
async function cargarCategorias() {
    try {
        const response = await fetch(`${API_URL}?action=categorias`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Respuesta de categorías no es JSON');
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            categorias = data.data;
            const select = document.getElementById('categoria-filtro');
            select.innerHTML = '<option value="">Todas las categorías</option>' +
                categorias.map(c => `<option value="${c}">${c}</option>`).join('');
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Filtrar productos
function filtrarProductos() {
    const busqueda = document.getElementById('busqueda').value.toLowerCase();
    const categoria = document.getElementById('categoria-filtro').value;
    
    let productosFiltrados = productos;
    
    if (categoria) {
        productosFiltrados = productosFiltrados.filter(p => p.categoria === categoria);
    }
    
    if (busqueda) {
        productosFiltrados = productosFiltrados.filter(p => 
            p.nombre.toLowerCase().includes(busqueda) || 
            p.descripcion.toLowerCase().includes(busqueda)
        );
    }
    
    mostrarProductos(productosFiltrados);
}

// Agregar al carrito - CORREGIDO con mejor depuración
function agregarAlCarrito(id) {
    console.log('=== AGREGANDO AL CARRITO ===');
    console.log('ID recibido:', id, 'Tipo:', typeof id);
    console.log('Lista de productos:', productos);
    
    // Asegurarse de que id sea número
    const productoId = parseInt(id);
    console.log('ID convertido:', productoId);
    
    const producto = productos.find(p => {
        console.log('Comparando:', p.id, 'con', productoId, '- Match:', p.id == productoId);
        return parseInt(p.id) === productoId;
    });
    
    console.log('Producto encontrado:', producto);
    
    if (!producto) {
        console.error('Producto no encontrado con ID:', productoId);
        alert('Error: Producto no encontrado');
        return;
    }
    
    if (producto.stock === 0 || producto.stock === '0') {
        console.log('Sin stock disponible');
        alert('Este producto no tiene stock disponible');
        return;
    }
    
    const itemExistente = carrito.find(item => parseInt(item.id) === productoId);
    console.log('Item existente en carrito:', itemExistente);
    
    if (itemExistente) {
        const stockDisponible = parseInt(producto.stock);
        if (itemExistente.cantidad < stockDisponible) {
            itemExistente.cantidad++;
            console.log('Cantidad incrementada:', itemExistente.cantidad);
        } else {
            alert('No hay más stock disponible');
            return;
        }
    } else {
        const nuevoItem = {
            id: productoId,
            nombre: producto.nombre,
            precio: parseFloat(producto.precio),
            imagen: producto.imagen,
            cantidad: 1,
            stock: parseInt(producto.stock)
        };
        console.log('Agregando nuevo item:', nuevoItem);
        carrito.push(nuevoItem);
    }
    
    console.log('Carrito actualizado:', carrito);
    actualizarCarrito();
    mostrarNotificacion('✅ Producto agregado al carrito');
}

// Actualizar carrito
function actualizarCarrito() {
    const container = document.getElementById('carrito-items');
    
    if (carrito.length === 0) {
        container.innerHTML = '<div class="carrito-vacio">Tu carrito está vacío</div>';
        document.getElementById('carrito-total').textContent = '$0';
        actualizarContadorCarrito();
        return;
    }
    
    container.innerHTML = carrito.map((item, index) => `
        <div class="carrito-item">
            <img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-img" onerror="this.src='https://via.placeholder.com/80?text=Sin+Imagen'">
            <div class="carrito-item-info">
                <div class="carrito-item-nombre">${item.nombre}</div>
                <div class="carrito-item-precio">$${item.precio.toLocaleString('es-AR')}</div>
                <div class="cantidad-controls">
                    <button class="btn-cantidad" onclick="cambiarCantidad(${index}, -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button class="btn-cantidad" onclick="cambiarCantidad(${index}, 1)">+</button>
                </div>
                <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('carrito-total').textContent = `$${total.toLocaleString('es-AR')}`;
    actualizarContadorCarrito();
}

// Cambiar cantidad
function cambiarCantidad(index, delta) {
    const item = carrito[index];
    const nuevaCantidad = item.cantidad + delta;
    
    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(index);
        return;
    }
    
    if (nuevaCantidad > item.stock) {
        alert('No hay suficiente stock');
        return;
    }
    
    item.cantidad = nuevaCantidad;
    actualizarCarrito();
}

// Eliminar del carrito
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

// Actualizar contador
function actualizarContadorCarrito() {
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    document.getElementById('carrito-count').textContent = `(${total})`;
}

// Toggle carrito
function toggleCarrito() {
    const sidebar = document.getElementById('carrito-sidebar');
    sidebar.classList.toggle('active');
}

// Abrir checkout
function abrirCheckout() {
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('checkout-total').textContent = `$${total.toLocaleString('es-AR')}`;
    
    document.getElementById('checkout-modal').classList.add('active');
    toggleCarrito();
}

// Procesar venta
async function procesarVenta(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    const ventaData = {
        cliente_nombre: formData.get('nombre'),
        cliente_email: formData.get('email'),
        cliente_telefono: formData.get('telefono'),
        direccion_envio: formData.get('direccion'),
        metodo_pago: formData.get('metodo_pago'),
        total: total,
        items: carrito.map(item => ({
            producto_id: item.id,
            cantidad: item.cantidad,
            precio: item.precio
        }))
    };
    
    try {
        const response = await fetch(`${API_URL}?action=venta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ventaData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('¡Compra realizada con éxito! ID de venta: ' + data.id);
            carrito = [];
            actualizarCarrito();
            cerrarModal('checkout-modal');
            form.reset();
            // CORREGIDO: Solo recargar productos una vez
            await cargarProductos();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la venta');
    }
}

// Cambiar vista
function cambiarVista(vista) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(vista + '-view').classList.add('active');
    event.target.classList.add('active');
    
    if (vista === 'admin') {
        cargarEstadisticas();
    }
}

// Cambiar tab admin
function cambiarTabAdmin(tab) {
    document.querySelectorAll('.tab-admin-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-admin-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById('tab-' + tab).classList.add('active');
    event.target.classList.add('active');
    
    if (tab === 'estadisticas') cargarEstadisticas();
    if (tab === 'ventas') cargarVentas();
    if (tab === 'productos') cargarProductosAdmin();
}

// Cargar estadísticas
async function cargarEstadisticas() {
    try {
        const response = await fetch(`${API_URL}?action=estadisticas`);
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data;
            document.getElementById('total-ventas').textContent = stats.total_ventas;
            document.getElementById('ingresos-totales').textContent = 
                '$' + parseFloat(stats.ingresos_totales).toLocaleString('es-AR');
            document.getElementById('productos-vendidos').textContent = stats.productos_vendidos;
            document.getElementById('producto-popular').textContent = stats.producto_popular;
            document.getElementById('stock-bajo').textContent = stats.stock_bajo;
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// Cargar ventas
async function cargarVentas() {
    try {
        const response = await fetch(`${API_URL}?action=ventas`);
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('ventas-tbody');
            tbody.innerHTML = data.data.map(v => `
                <tr>
                    <td>#${v.id}</td>
                    <td>${v.cliente_nombre}</td>
                    <td>$${parseFloat(v.total).toLocaleString('es-AR')}</td>
                    <td>
                        <select class="estado-select" onchange="cambiarEstadoVenta(${v.id}, this.value)">
                            <option value="pendiente" ${v.estado === 'pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
                            <option value="confirmada" ${v.estado === 'confirmada' ? 'selected' : ''}>✅ Confirmada</option>
                            <option value="enviada" ${v.estado === 'enviada' ? 'selected' : ''}>📦 Enviada</option>
                            <option value="entregada" ${v.estado === 'entregada' ? 'selected' : ''}>🎉 Entregada</option>
                            <option value="cancelada" ${v.estado === 'cancelada' ? 'selected' : ''}>❌ Cancelada</option>
                        </select>
                    </td>
                    <td>${v.metodo_pago || 'N/A'}</td>
                    <td>${new Date(v.created_at).toLocaleString('es-AR')}</td>
                    <td>
                        <button class="btn-action" onclick="verDetalleVenta(${v.id})">👁️ Ver</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error al cargar ventas:', error);
    }
}

// Cambiar estado de venta
async function cambiarEstadoVenta(id, estado) {
    try {
        const response = await fetch(`${API_URL}?action=venta_estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, estado })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Estado actualizado correctamente');
        } else {
            alert('Error al actualizar estado');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Ver detalle de venta
async function verDetalleVenta(id) {
    try {
        const response = await fetch(`${API_URL}?action=venta_detalle&id=${id}`);
        const data = await response.json();
        
        if (data.success) {
            const venta = data.data;
            document.getElementById('detalle-venta-info').innerHTML = `
                <p><strong>ID:</strong> #${venta.id}</p>
                <p><strong>Cliente:</strong> ${venta.cliente_nombre}</p>
                <p><strong>Email:</strong> ${venta.cliente_email}</p>
                <p><strong>Teléfono:</strong> ${venta.cliente_telefono}</p>
                <p><strong>Dirección:</strong> ${venta.direccion_envio}</p>
                <p><strong>Estado:</strong> ${venta.estado}</p>
                <p><strong>Método de pago:</strong> ${venta.metodo_pago}</p>
                <p><strong>Fecha:</strong> ${new Date(venta.created_at).toLocaleString('es-AR')}</p>
                <p><strong>Total:</strong> $${parseFloat(venta.total).toLocaleString('es-AR')}</p>
            `;
            
            document.getElementById('detalle-venta-items').innerHTML = venta.items.map(item => `
                <div class="detalle-item">
                    <img src="${item.producto_imagen}" alt="${item.producto_nombre}" onerror="this.src='https://via.placeholder.com/60'">
                    <div>
                        <div>${item.producto_nombre}</div>
                        <small>Cantidad: ${item.cantidad} x $${parseFloat(item.precio_unitario).toLocaleString('es-AR')}</small>
                    </div>
                    <div class="detalle-subtotal">$${parseFloat(item.subtotal).toLocaleString('es-AR')}</div>
                </div>
            `).join('');
            
            document.getElementById('detalle-venta-modal').classList.add('active');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar productos admin
async function cargarProductosAdmin() {
    try {
        const response = await fetch(`${API_URL}?action=productos`);
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.getElementById('productos-tbody');
            tbody.innerHTML = data.data.map(p => `
                <tr>
                    <td>${p.id}</td>
                    <td><img src="${p.imagen}" alt="${p.nombre}" style="width:50px; height:50px; object-fit:cover;" onerror="this.src='https://via.placeholder.com/50'"></td>
                    <td>${p.nombre}</td>
                    <td>${p.categoria}</td>
                    <td>$${parseFloat(p.precio).toLocaleString('es-AR')}</td>
                    <td>${p.stock}</td>
                    <td>
                        <button class="btn-action" onclick="editarProducto(${p.id})">✏️ Editar</button>
                        <button class="btn-action btn-danger" onclick="eliminarProducto(${p.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Abrir modal producto
function abrirModalProducto() {
    document.getElementById('producto-form').reset();
    document.getElementById('producto-id').value = '';
    document.getElementById('producto-modal-title').textContent = 'Nuevo Producto';
    document.getElementById('producto-modal').classList.add('active');
    
    // Limpiar preview de imagen si existe
    const preview = document.getElementById('imagen-preview');
    if (preview) {
        preview.style.display = 'none';
    }
}

// Función para previsualizar imagen
function previsualizarImagen() {
    const url = document.getElementById('producto-imagen').value;
    let preview = document.getElementById('imagen-preview');
    
    // Crear elemento de preview si no existe
    if (!preview) {
        preview = document.createElement('img');
        preview.id = 'imagen-preview';
        preview.style.maxWidth = '200px';
        preview.style.marginTop = '10px';
        preview.style.border = '1px solid #ddd';
        preview.style.borderRadius = '4px';
        preview.style.display = 'none';
        
        const imagenInput = document.getElementById('producto-imagen');
        imagenInput.parentNode.appendChild(preview);
    }
    
    if (url && url.trim()) {
        preview.src = url;
        preview.style.display = 'block';
        preview.onerror = function() {
            preview.style.display = 'none';
            alert('La URL de la imagen no es válida o no se puede cargar');
        };
    } else {
        preview.style.display = 'none';
    }
}

// Editar producto - CORREGIDO
async function editarProducto(id) {
    // Buscar el producto en la lista global
    let producto = productos.find(p => p.id === id);
    
    // Si no está en la lista, buscarlo en la API
    if (!producto) {
        try {
            const response = await fetch(`${API_URL}?action=productos`);
            const data = await response.json();
            if (data.success) {
                producto = data.data.find(p => p.id === id);
            }
        } catch (error) {
            console.error('Error al buscar producto:', error);
            alert('No se pudo cargar el producto');
            return;
        }
    }
    
    if (!producto) {
        alert('Producto no encontrado');
        return;
    }
    
    // Rellenar el formulario
    document.getElementById('producto-id').value = producto.id;
    document.getElementById('producto-nombre').value = producto.nombre;
    document.getElementById('producto-descripcion').value = producto.descripcion;
    document.getElementById('producto-precio').value = producto.precio;
    document.getElementById('producto-stock').value = producto.stock;
    document.getElementById('producto-categoria').value = producto.categoria;
    document.getElementById('producto-imagen').value = producto.imagen;
    
    document.getElementById('producto-modal-title').textContent = 'Editar Producto';
    document.getElementById('producto-modal').classList.add('active');
}

// Guardar producto - CORREGIDO con mejor manejo de errores
async function guardarProducto(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const id = formData.get('id');
    
    // Validar URL de imagen
    const imagenUrl = formData.get('imagen');
    if (!imagenUrl || !imagenUrl.trim()) {
        alert('Por favor ingresa una URL de imagen válida');
        return;
    }
    
    const productoData = {
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        precio: parseFloat(formData.get('precio')),
        stock: parseInt(formData.get('stock')),
        categoria: formData.get('categoria'),
        imagen: imagenUrl.trim()
    };
    
    // Si es edición, agregar el ID
    if (id && id.trim()) {
        productoData.id = parseInt(id);
    }
    
    const url = `${API_URL}?action=producto`;
    const method = id ? 'PUT' : 'POST';
    
    console.log('Enviando datos:', productoData);
    console.log('Método:', method);
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoData)
        });
        
        const data = await response.json();
        console.log('Respuesta del servidor:', data);
        
        if (data.success) {
            mostrarNotificacion(id ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
            cerrarModal('producto-modal');
            form.reset();
            
            // Recargar productos
            await cargarProductos();
            
            // Solo cargar admin si estamos en esa vista
            if (document.getElementById('tab-productos').classList.contains('active')) {
                await cargarProductosAdmin();
            }
        } else {
            alert('Error: ' + (data.error || 'Error desconocido'));
            console.error('Error del servidor:', data);
        }
    } catch (error) {
        console.error('Error en la petición:', error);
        alert('Error al guardar producto. Revisa la consola para más detalles.');
    }
}

// Eliminar producto - CORREGIDO
async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
        const response = await fetch(`${API_URL}?action=producto`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Producto eliminado');
            // CORREGIDO: Recargar productos solo una vez
            await cargarProductos();
            // Solo cargar admin si estamos en esa vista
            if (document.getElementById('tab-productos').classList.contains('active')) {
                await cargarProductosAdmin();
            }
        } else {
            alert('Error al eliminar');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cerrar modal
function cerrarModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Notificación
function mostrarNotificacion(mensaje) {
    const div = document.createElement('div');
    div.className = 'alert alert-success';
    div.textContent = mensaje;
    div.style.position = 'fixed';
    div.style.top = '20px';
    div.style.right = '20px';
    div.style.zIndex = '9999';
    
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 3000);
}