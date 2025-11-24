// Usuarios de ejemplo (simulación de base de datos)
const USERS = [
    {
        email: 'mesero@restaurante.com',
        password: '123456',
        role: 'mesero',
        name: 'Juan Pérez'
    },
    {
        email: 'cajero@restaurante.com',
        password: '123456',
        role: 'cajero',
        name: 'Ana López'
    },
    {
        email: 'admin@restaurante.com',
        password: 'admin123',
        role: 'admin',
        name: 'Administrador'
    }
];

let currentUser = null;
let cuentasMesas = [];
let mesaCuentaActual = null;
let cierresRegistrados = [];
let moduloCuentasIniciado = false;
let moduloCorteIniciado = false;
let resumenCorteActual = null;

document.addEventListener('deviceready', onDeviceReady, false);
// Para probar en navegador también:
document.addEventListener('DOMContentLoaded', onDeviceReady, false);

function onDeviceReady() {
    console.log('Device listo');

    const loginForm = document.getElementById('login-form');
    const btnLogout = document.getElementById('btn-logout');
    const navButtons = document.querySelectorAll('.nav-btn');
    const togglePasswordBtn = document.getElementById('toggle-password');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (btnLogout) {
        btnLogout.addEventListener('click', handleLogout);
    }
    navButtons.forEach(btn => {
        btn.addEventListener('click', handleModuleClick);
    });
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }

    // Intentar cargar credenciales guardadas
    loadRememberedCredentials();

    // Inicializar mA3dulos financieros
    inicializarDatosFinancieros();
    inicializarModuloCuentas();
    inicializarCorteCaja();
}

/* ---------- LOGIN ---------- */

function handleLogin(event) {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const rememberMe = document.getElementById('remember-me');
    const errorBox = document.getElementById('login-error');

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const role = roleSelect.value;

    if (!email || !password || !role) {
        showError('Por favor, completa todos los campos.');
        return;
    }

    const user = USERS.find(
        (u) => u.email === email && u.password === password && u.role === role
    );

    if (!user) {
        showError('Credenciales incorrectas o rol no coincide.');
        return;
    }

    // Limpiar error
    errorBox.classList.add('hidden');
    errorBox.textContent = '';

    currentUser = user;

    // Recordar credenciales
    if (rememberMe.checked) {
        localStorage.setItem('remember_email', email);
        localStorage.setItem('remember_password', password);
        localStorage.setItem('remember_role', role);
        localStorage.setItem('remember_me', '1');
    } else {
        localStorage.removeItem('remember_email');
        localStorage.removeItem('remember_password');
        localStorage.removeItem('remember_role');
        localStorage.removeItem('remember_me');
    }

    goToMenu();
}

function showError(message) {
    const errorBox = document.getElementById('login-error');
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
    errorBox.classList.add('error');
}

function loadRememberedCredentials() {
    const rememberFlag = localStorage.getItem('remember_me');
    if (!rememberFlag) return;

    const email = localStorage.getItem('remember_email') || '';
    const password = localStorage.getItem('remember_password') || '';
    const role = localStorage.getItem('remember_role') || '';

    document.getElementById('email').value = email;
    document.getElementById('password').value = password;
    document.getElementById('role').value = role;
    document.getElementById('remember-me').checked = true;
}

/* Mostrar / ocultar contraseña */

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('toggle-password');

    if (!passwordInput) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁';
    }
}

/* ---------- NAVEGACIÓN ---------- */

function goToMenu() {
    const loginView = document.getElementById('login-view');
    const menuView = document.getElementById('menu-view');
    const userLabel = document.getElementById('user-label');
    const roleLabel = document.getElementById('role-label');

    if (currentUser) {
        userLabel.textContent = `${currentUser.name} (${currentUser.email})`;

        let roleText = '';
        switch (currentUser.role) {
            case 'mesero':
                roleText = 'Mesero';
                break;
            case 'cajero':
                roleText = 'Cajero';
                break;
            case 'admin':
                roleText = 'Administrador';
                break;
            default:
                roleText = currentUser.role;
        }
        roleLabel.textContent = roleText;
    }

    loginView.classList.remove('active');
    menuView.classList.add('active');
}

function handleLogout() {
    currentUser = null;

    const loginView = document.getElementById('login-view');
    const menuView = document.getElementById('menu-view');

    menuView.classList.remove('active');
    loginView.classList.add('active');

    // Limpiar selección de menú
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const moduleTitle = document.getElementById('module-title');
    const moduleMessage = document.getElementById('module-message');
    moduleTitle.textContent = 'Menú Principal';
    moduleMessage.textContent = 'Selecciona un módulo en la barra superior para continuar.';
}

/* Cuando se selecciona un módulo de la barra superior */

function handleModuleClick(event) {
    const moduleKey = event.currentTarget.getAttribute('data-module');

    // Marcar botón activo
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Ocultar todas las secciones de módulos estáticos
    document.querySelectorAll('.module-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Verificar si existe una sección estática para este módulo
    const moduleSection = document.getElementById(`mod-${moduleKey}`);
    
    if (moduleSection) {
        // Módulo estático (reportes, cuentas, config)
        moduleSection.classList.remove('hidden');
        
        // Si es el módulo de reportes, inicializar
        if (moduleKey === 'reportes' && typeof iniciarModuloReportes === 'function') {
            iniciarModuloReportes();
        }
        if (moduleKey === 'cuentas') {
            inicializarModuloCuentas(true);
        }
        if (moduleKey === 'corte') {
            inicializarCorteCaja();
        }
    } else {
        // Módulo dinámico (pedidos, etc.) - llamar a loadModule
        if (typeof loadModule === 'function') {
            loadModule(moduleKey);
        }
    }
}
/* =====================================================
   MÓDULOS DEL SISTEMA (PEDIDOS Y CONFIGURACIÓN)
   TODO SE RENDERIZA EN EL MAIN DE index.html
===================================================== */

function loadModule(moduleKey) {
    const main = document.querySelector('.app-main');
    
    // Ocultar la tarjeta principal si existe
    const cardWide = main.querySelector('.card.card-wide:not(.module-section)');
    if (cardWide) {
        cardWide.style.display = 'none';
    }

    // Buscar o crear el contenedor dinámico
    let dynamicContainer = document.getElementById('dynamic-module-container');
    if (!dynamicContainer) {
        dynamicContainer = document.createElement('div');
        dynamicContainer.id = 'dynamic-module-container';
        main.appendChild(dynamicContainer);
    }

    switch (moduleKey) {

        /* ============================================
           MÓDULO 4: PEDIDOS
        ============================================ */
        case 'pedidos':
            dynamicContainer.innerHTML = `
                <div class="card card-wide">
                    <h2>Pedidos</h2>

                    <h3>Seleccionar Mesa</h3>
                    <select id="mesaSelect"></select>

                    <h3>Menú Digital</h3>
                    <select id="categoriaSelect">
                        <option value="entradas">Entradas</option>
                        <option value="platos">Platos Fuertes</option>
                        <option value="bebidas">Bebidas</option>
                        <option value="postres">Postres</option>
                    </select>

                    <div id="listaProductos"></div>

                    <h3>Pedido actual</h3>
                    <div id="pedidoActual"></div>

                    <button id="btnEnviarPedido" class="btn-primary">Enviar a Cocina</button>
                </div>
            `;

            iniciarModuloPedidos();
            break;

        /* ============================================
           MÓDULO 8: CONFIGURACIÓN
        ============================================ */
        case 'configuracion':
            dynamicContainer.innerHTML = `
                <div class="card card-wide">
                    <h2>Configuración del Restaurante</h2>

                    <h3>Menú del Restaurante</h3>
                    <button class="btn-primary" onclick="nuevoPlato()">Agregar Plato</button>
                    <div id="listaPlatos"></div>

                    <hr>

                    <h3>Impuestos y Propinas</h3>
                    <label>Impuesto (%):</label>
                    <input type="number" id="impuestoInput">

                    <label>Propina sugerida (%):</label>
                    <input type="number" id="propinaInput">
                    <button class="btn-primary" onclick="guardarImpuestos()">Guardar</button>

                    <hr>

                    <h3>Ticket</h3>
                    <label>Nombre del restaurante:</label>
                    <input type="text" id="nombreRestInput">

                    <label>Mensaje del ticket:</label>
                    <input type="text" id="mensajeTicketInput">
                    <button class="btn-primary" onclick="guardarTicket()">Guardar</button>

                    <hr>

                    <h3>Gestión de Usuarios</h3>
                    <button class="btn-primary" onclick="agregarUsuario()">Nuevo Usuario</button>
                    <div id="listaUsuarios"></div>
                </div>
            `;

            iniciarConfiguracion();
            break;

        default:
            dynamicContainer.innerHTML = `
                <div class="card card-wide">
                    <h2>Módulo no encontrado</h2>
                    <p>El módulo "${moduleKey}" no está disponible.</p>
                </div>
            `;
    }
}

/* =====================================================
     MÓDULO 4: LÓGICA DE PEDIDOS
===================================================== */

let pedido = [];

const mesas = [
    { id: 1, nombre: "Mesa 1" },
    { id: 2, nombre: "Mesa 2" },
    { id: 3, nombre: "Mesa 3" }
];

const menu = {
    entradas: [
        { id: 1, nombre: "Guacamole", precio: 50 },
        { id: 2, nombre: "Nachos", precio: 70 }
    ],
    platos: [
        { id: 3, nombre: "Tacos al pastor", precio: 90 },
        { id: 4, nombre: "Enchiladas", precio: 85 }
    ],
    bebidas: [
        { id: 5, nombre: "Refresco", precio: 20 },
        { id: 6, nombre: "Agua de horchata", precio: 25 }
    ],
    postres: [
        { id: 7, nombre: "Flan", precio: 30 },
        { id: 8, nombre: "Pastel helado", precio: 40 }
    ]
};

function iniciarModuloPedidos() {
    cargarMesas();
    cargarMenu("entradas");

    document.getElementById("categoriaSelect")
        .addEventListener("change", e => cargarMenu(e.target.value));

    document.getElementById("btnEnviarPedido")
        .addEventListener("click", enviarPedido);
}

function cargarMesas() {
    const select = document.getElementById("mesaSelect");
    select.innerHTML = mesas.map(m => `<option value="${m.id}">${m.nombre}</option>`).join("");
}

function cargarMenu(cat) {
    const div = document.getElementById("listaProductos");
    div.innerHTML = menu[cat].map(p => `
        <div>
            <strong>${p.nombre}</strong> - $${p.precio}
            <button onclick="agregarAlPedido(${p.id}, '${p.nombre}', ${p.precio})">Añadir</button>
        </div>
    `).join("");
}

function agregarAlPedido(id, nombre, precio) {
    const instrucciones = prompt("Instrucciones especiales:");
    pedido.push({ id, nombre, precio, cantidad: 1, instrucciones });
    mostrarPedido();
}

function mostrarPedido() {
    const div = document.getElementById("pedidoActual");

    if (pedido.length === 0) {
        div.innerHTML = "<p>No hay productos.</p>";
        return;
    }

    div.innerHTML = pedido.map((p, i) => `
        <div>
            <strong>${p.nombre}</strong> - $${p.precio}
            <br>Cantidad: <input type="number" min="1" value="${p.cantidad}" onchange="actualizarCantidad(${i}, this.value)">
            <br>Notas: ${p.instrucciones}
            <button onclick="eliminarDelPedido(${i})">Eliminar</button>
        </div>
    `).join("");
}

function actualizarCantidad(i, cantidad) {
    pedido[i].cantidad = Number(cantidad);
}

function eliminarDelPedido(i) {
    pedido.splice(i, 1);
    mostrarPedido();
}

function enviarPedido() {
    if (pedido.length === 0) {
        alert("No hay nada para enviar.");
        return;
    }

    alert("Pedido enviado a cocina correctamente.");
    pedido = [];
    mostrarPedido();
}

/* =====================================================
   MÓDULO 8: CONFIGURACIÓN
===================================================== */

let platos = JSON.parse(localStorage.getItem("platos")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [
    { nombre: "Admin", rol: "Administrador" }
];

function iniciarConfiguracion() {
    cargarPlatos();
    cargarUsuarios();
    cargarImpuestos();
    cargarTicket();
}

/* ---------- PLATOS ---------- */

function cargarPlatos() {
    const div = document.getElementById("listaPlatos");
    if (!div) return;

    div.innerHTML = platos.map((p, i) => `
        <div>
            <strong>${p.nombre}</strong> $${p.precio}
            <br>${p.descripcion}
            <button onclick="editarPlato(${i})">Editar</button>
            <button onclick="eliminarPlato(${i})">Eliminar</button>
        </div>
    `).join("");
}

function nuevoPlato() {
    const nombre = prompt("Nombre:");
    const precio = prompt("Precio:");
    const descripcion = prompt("Descripción:");

    platos.push({ nombre, precio, descripcion });
    localStorage.setItem("platos", JSON.stringify(platos));
    cargarPlatos();
}

function editarPlato(i) {
    const p = platos[i];
    p.nombre = prompt("Nuevo nombre:", p.nombre);
    p.precio = prompt("Nuevo precio:", p.precio);
    p.descripcion = prompt("Nueva descripción:", p.descripcion);

    localStorage.setItem("platos", JSON.stringify(platos));
    cargarPlatos();
}

function eliminarPlato(i) {
    platos.splice(i, 1);
    localStorage.setItem("platos", JSON.stringify(platos));
    cargarPlatos();
}

/* ---------- IMPUESTOS ---------- */

function guardarImpuestos() {
    const impuesto = document.getElementById("impuestoInput").value;
    const propina = document.getElementById("propinaInput").value;

    localStorage.setItem("impuestos", JSON.stringify({ impuesto, propina }));
    alert("Guardado.");
}

function cargarImpuestos() {
    const data = JSON.parse(localStorage.getItem("impuestos"));
    if (data) {
        document.getElementById("impuestoInput").value = data.impuesto;
        document.getElementById("propinaInput").value = data.propina;
    }
}

/* ---------- TICKET ---------- */

function guardarTicket() {
    const nombre = document.getElementById("nombreRestInput").value;
    const mensaje = document.getElementById("mensajeTicketInput").value;

    localStorage.setItem("ticket", JSON.stringify({ nombre, mensaje }));
    alert("Ticket actualizado.");
}

function cargarTicket() {
    const data = JSON.parse(localStorage.getItem("ticket"));
    if (data) {
        document.getElementById("nombreRestInput").value = data.nombre;
        document.getElementById("mensajeTicketInput").value = data.mensaje;
    }
}

/* ---------- USUARIOS ---------- */

function cargarUsuarios() {
    const div = document.getElementById("listaUsuarios");
    if (!div) return;

    div.innerHTML = usuarios.map((u, i) => `
        <div>
            <strong>${u.nombre}</strong> (${u.rol})
            <button onclick="editarUsuario(${i})">Editar</button>
            <button onclick="eliminarUsuario(${i})">Eliminar</button>
        </div>
    `).join("");
}

function agregarUsuario() {
    const nombre = prompt("Nombre:");
    const rol = prompt("Rol:");

    usuarios.push({ nombre, rol });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    cargarUsuarios();
}

function editarUsuario(i) {
    const u = usuarios[i];
    u.nombre = prompt("Nuevo nombre:", u.nombre);
    u.rol = prompt("Nuevo rol:", u.rol);

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    cargarUsuarios();
}

function eliminarUsuario(i) {
    usuarios.splice(i, 1);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    cargarUsuarios();
}

/* =====================================================
   MA"DULO 5: CUENTAS Y CIERRE
===================================================== */

const CUENTAS_STORAGE_KEY = 'cuentas_mesas';
const CIERRES_STORAGE_KEY = 'cierres_caja';

function inicializarDatosFinancieros() {
    cuentasMesas = JSON.parse(localStorage.getItem(CUENTAS_STORAGE_KEY)) || crearCuentasDemo();
    cierresRegistrados = JSON.parse(localStorage.getItem(CIERRES_STORAGE_KEY)) || crearCierresDemo();
}

function crearCuentasDemo() {
    return [
        {
            id: 'mesa-1',
            nombre: 'Mesa 1',
            comensales: 3,
            estado: 'ocupada',
            descuento: { tipo: 'ninguno', valor: 0 },
            propina: { activa: true, tipo: 'porcentaje', valor: 10 },
            items: [
                { nombre: 'Tacos al pastor', categoria: 'comida', cantidad: 3, precio: 90 },
                { nombre: 'Refresco', categoria: 'bebida', cantidad: 3, precio: 22 },
                { nombre: 'Flan de cajeta', categoria: 'postre', cantidad: 1, precio: 35 }
            ]
        },
        {
            id: 'mesa-2',
            nombre: 'Mesa 2',
            comensales: 2,
            estado: 'ocupada',
            descuento: { tipo: 'promo10', valor: 10 },
            propina: { activa: true, tipo: 'porcentaje', valor: 12 },
            items: [
                { nombre: 'Enchiladas verdes', categoria: 'comida', cantidad: 2, precio: 85 },
                { nombre: 'Agua de horchata', categoria: 'bebida', cantidad: 2, precio: 25 }
            ]
        },
        {
            id: 'mesa-3',
            nombre: 'Mesa 3',
            comensales: 4,
            estado: 'libre',
            descuento: { tipo: 'ninguno', valor: 0 },
            propina: { activa: true, tipo: 'porcentaje', valor: 10 },
            items: []
        }
    ];
}

function crearCierresDemo() {
    const hoy = new Date();
    const fecha = hoy.toISOString();
    return [
        {
            idMesa: 'mesa-4',
            mesa: 'Mesa 4',
            fechaCierre: fecha,
            subtotal: 420,
            descuentoMonto: 20,
            propinaMonto: 50,
            totalCobrado: 450,
            comensales: 3,
            metodoPago: 'tarjeta',
            referencia: 'AUT-1930',
            descuentoTipo: 'monto',
            items: [
                { nombre: 'Guacamole', categoria: 'comida', cantidad: 2, precio: 50 },
                { nombre: 'Arrachera', categoria: 'comida', cantidad: 1, precio: 220 },
                { nombre: 'Limonada', categoria: 'bebida', cantidad: 3, precio: 35 }
            ]
        }
    ];
}

function guardarCuentas() {
    localStorage.setItem(CUENTAS_STORAGE_KEY, JSON.stringify(cuentasMesas));
}

function guardarCierres() {
    localStorage.setItem(CIERRES_STORAGE_KEY, JSON.stringify(cierresRegistrados));
}

function inicializarModuloCuentas(forceRefresh = false) {
    const selectMesa = document.getElementById('mesa-cuenta');
    if (!selectMesa) return;

    if (!moduloCuentasIniciado || forceRefresh) {
        cargarOpcionesMesas();
    }

    if (!moduloCuentasIniciado) {
        const btnCargar = document.getElementById('btn-cargar-cuenta');
        const comensalesInput = document.getElementById('cuenta-comensales');
        const btnDesc = document.getElementById('btn-aplicar-descuento');
        const btnPropina = document.getElementById('btn-actualizar-propina');
        const btnTicket = document.getElementById('btn-generar-ticket');
        const btnCerrar = document.getElementById('btn-cerrar-cuenta');

        if (selectMesa) {
            selectMesa.addEventListener('change', () => seleccionarMesaParaCuenta(selectMesa.value));
        }
        if (btnCargar) {
            btnCargar.addEventListener('click', () => {
                seleccionarMesaParaCuenta(selectMesa.value);
            });
        }
        if (comensalesInput) {
            comensalesInput.addEventListener('input', manejarComensales);
        }
        if (btnDesc) {
            btnDesc.addEventListener('click', aplicarDescuentoActual);
        }
        if (btnPropina) {
            btnPropina.addEventListener('click', actualizarPropinaDesdeUI);
        }
        if (btnTicket) {
            btnTicket.addEventListener('click', generarTicketConsumo);
        }
        if (btnCerrar) {
            btnCerrar.addEventListener('click', cerrarCuentaSeleccionada);
        }

        moduloCuentasIniciado = true;
    }

    // Seleccionar la primera mesa con consumo
    if (!mesaCuentaActual && cuentasMesas.length > 0) {
        seleccionarMesaParaCuenta(cuentasMesas[0].id);
    } else {
        renderizarCuentaActual();
    }
}

function cargarOpcionesMesas() {
    const selectMesa = document.getElementById('mesa-cuenta');
    if (!selectMesa) return;

    selectMesa.innerHTML = '<option value="">Seleccione una mesa</option>';
    cuentasMesas.forEach(m => {
        const estado = m.estado === 'libre' ? 'libre' : 'ocupada';
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = `${m.nombre} (${estado})`;
        selectMesa.appendChild(option);
    });
    if (mesaCuentaActual) {
        selectMesa.value = mesaCuentaActual.id;
    }
}

function seleccionarMesaParaCuenta(idMesa) {
    if (!idMesa) {
        mesaCuentaActual = null;
        renderizarCuentaActual();
        return;
    }
    mesaCuentaActual = cuentasMesas.find(m => m.id === idMesa) || null;
    renderizarCuentaActual();
}

function manejarComensales(event) {
    if (!mesaCuentaActual) return;
    const valor = Math.max(1, Number(event.target.value) || 1);
    mesaCuentaActual.comensales = valor;
    renderizarCuentaActual();
}

function aplicarDescuentoActual() {
    if (!mesaCuentaActual) return;
    const tipo = document.getElementById('tipo-descuento').value;
    let valor = Number(document.getElementById('valor-descuento').value) || 0;

    if (tipo === 'promo10') valor = 10;
    if (tipo === 'happyhour') valor = 15;

    mesaCuentaActual.descuento = { tipo, valor };
    guardarCuentas();
    mostrarMensajeCuenta('Descuento aplicado.', 'success');
    renderizarCuentaActual();
}

function actualizarPropinaDesdeUI() {
    if (!mesaCuentaActual) return;
    const activa = document.getElementById('propina-activa').checked;
    const tipo = document.getElementById('propina-tipo').value;
    const valor = Number(document.getElementById('propina-valor').value) || 0;
    mesaCuentaActual.propina = { activa, tipo, valor };
    guardarCuentas();
    mostrarMensajeCuenta('Propina actualizada.', 'success');
    renderizarCuentaActual();
}

function renderizarCuentaActual() {
    const lista = document.getElementById('lista-cuenta');
    const resumenCat = document.getElementById('consumo-categorias');
    const estadoPill = document.getElementById('estado-mesa-label');
    const comensalesInput = document.getElementById('cuenta-comensales');
    const montoPago = document.getElementById('monto-pago');

    if (!lista || !resumenCat) return;

    if (!mesaCuentaActual) {
        lista.innerHTML = '<li class="cuenta-item">Selecciona una mesa para ver el consumo.</li>';
        resumenCat.innerHTML = '';
        if (estadoPill) {
            estadoPill.textContent = 'Sin mesa';
            estadoPill.classList.remove('pill-success');
            estadoPill.classList.add('pill-warning');
        }
        return;
    }

    if (mesaCuentaActual.items.length === 0) {
        lista.innerHTML = '<li class="cuenta-item">No hay productos en la cuenta.</li>';
    } else {
        lista.innerHTML = mesaCuentaActual.items.map(item => `
            <li class="cuenta-item">
                <div>
                    <strong>${item.nombre}</strong>
                    <small>${item.categoria || 'consumo'} · x${item.cantidad}</small>
                </div>
                <div>
                    <strong>$${(item.precio * item.cantidad).toFixed(2)}</strong>
                    <small>$${item.precio.toFixed(2)} c/u</small>
                </div>
            </li>
        `).join('');
    }

    const totales = calcularTotalesCuenta(mesaCuentaActual);
    const subtotalEl = document.getElementById('subtotal-cuenta');
    const descuentoEl = document.getElementById('descuento-cuenta');
    const propinaEl = document.getElementById('propina-cuenta');
    const totalEl = document.getElementById('total-cuenta');
    const porPersonaEl = document.getElementById('total-por-persona');

    if (subtotalEl) subtotalEl.textContent = formatoMoneda(totales.subtotal);
    if (descuentoEl) descuentoEl.textContent = formatoMoneda(totales.descuento);
    if (propinaEl) propinaEl.textContent = formatoMoneda(totales.propina);
    if (totalEl) totalEl.textContent = formatoMoneda(totales.total);
    if (porPersonaEl) porPersonaEl.textContent = totales.porPersona.toFixed(2);

    if (comensalesInput) {
        comensalesInput.value = totales.comensales;
    }
    if (montoPago) {
        montoPago.value = totales.total.toFixed(2);
    }

    if (estadoPill) {
        estadoPill.textContent = mesaCuentaActual.estado === 'libre' ? 'Libre' : 'En consumo';
        estadoPill.classList.remove('pill-warning', 'pill-success');
        estadoPill.classList.add(mesaCuentaActual.estado === 'libre' ? 'pill-success' : 'pill-warning');
    }

    resumenCat.innerHTML = construirResumenCategorias(mesaCuentaActual);
    actualizarTicketPreview(mesaCuentaActual, totales);
}

function construirResumenCategorias(mesa) {
    if (!mesa || mesa.items.length === 0) return '';
    const resumen = {};
    mesa.items.forEach(i => {
        const cat = i.categoria || 'otros';
        resumen[cat] = (resumen[cat] || 0) + (i.precio * i.cantidad);
    });
    return Object.keys(resumen).map(cat => `
        <span class="categoria-tag">${cat}: ${formatoMoneda(resumen[cat])}</span>
    `).join('');
}

function calcularTotalesCuenta(mesa) {
    const subtotal = mesa.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const desc = mesa.descuento || { tipo: 'ninguno', valor: 0 };
    let descuento = 0;

    if (desc.tipo === 'porcentaje') {
        descuento = subtotal * (desc.valor / 100);
    } else if (desc.tipo === 'monto') {
        descuento = desc.valor;
    } else if (desc.tipo === 'promo10') {
        descuento = subtotal * 0.10;
    } else if (desc.tipo === 'happyhour') {
        const bebidas = mesa.items.filter(i => i.categoria === 'bebida');
        const totalBebidas = bebidas.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
        descuento = totalBebidas * 0.15;
    }

    descuento = Math.min(descuento, subtotal);
    const base = subtotal - descuento;

    const prop = mesa.propina || { activa: true, tipo: 'porcentaje', valor: 10 };
    let propina = 0;
    if (prop.activa) {
        propina = prop.tipo === 'porcentaje' ? base * (prop.valor / 100) : prop.valor;
    }

    const total = base + propina;
    const comensales = Math.max(1, Number(mesa.comensales) || 1);
    return {
        subtotal,
        descuento,
        base,
        propina,
        total,
        comensales,
        porPersona: total / comensales
    };
}

function formatoMoneda(valor) {
    return `$${Number(valor || 0).toFixed(2)}`;
}

function mostrarMensajeCuenta(texto, tipo = 'info') {
    const box = document.getElementById('mensaje-cuenta');
    if (!box) return;
    box.textContent = texto;
    box.classList.remove('hidden');
    box.classList.remove('error', 'success');
    if (tipo === 'success') {
        box.classList.add('success');
    } else if (tipo === 'error') {
        box.classList.add('error');
    }
}

function actualizarTicketPreview(mesa, totales, textoTicket) {
    const pre = document.getElementById('ticket-preview');
    if (!pre || !mesa) return;
    const ticketTexto = textoTicket || construirTicketTexto(mesa, totales);
    pre.textContent = ticketTexto;
}

function construirTicketTexto(mesa, totales) {
    const fecha = new Date().toLocaleString('es-MX');
    const lineas = [
        'Restaurante - Ticket de consumo',
        `Fecha: ${fecha}`,
        `Mesa: ${mesa.nombre}`,
        `Comensales: ${totales.comensales}`,
        '-----------------------------',
        'Detalle:'
    ];
    mesa.items.forEach(item => {
        lineas.push(`${item.cantidad} x ${item.nombre} (${item.categoria || 'general'}) -> ${formatoMoneda(item.precio * item.cantidad)}`);
    });
    lineas.push(`Subtotal: ${formatoMoneda(totales.subtotal)}`);
    lineas.push(`Descuento: -${formatoMoneda(totales.descuento)}`);
    lineas.push(`Propina: ${formatoMoneda(totales.propina)}`);
    lineas.push(`TOTAL: ${formatoMoneda(totales.total)}`);
    const pagoEl = document.getElementById('tipo-pago');
    const refEl = document.getElementById('referencia-pago');
    const metodo = pagoEl ? pagoEl.value : 'sin pago';
    const ref = refEl ? refEl.value : 'N/A';
    lineas.push(`Pago: ${metodo} (${ref})`);
    lineas.push('Gracias por su visita');
    return lineas.join('\\n');
}

function generarTicketConsumo() {
    if (!mesaCuentaActual) {
        alert('Selecciona una mesa primero.');
        return;
    }
    const totales = calcularTotalesCuenta(mesaCuentaActual);
    const ticketTexto = construirTicketTexto(mesaCuentaActual, totales);
    actualizarTicketPreview(mesaCuentaActual, totales, ticketTexto);

    const w = window.open('', '_blank');
    if (w) {
        w.document.write(`<pre>${ticketTexto}</pre>`);
        w.document.close();
        w.focus();
        w.print();
    } else {
        alert('Ticket generado. Imprime o comparte desde la vista previa.');
    }
}

function cerrarCuentaSeleccionada() {
    if (!mesaCuentaActual) {
        alert('Selecciona una mesa primero.');
        return;
    }
    if (!mesaCuentaActual.items || mesaCuentaActual.items.length === 0) {
        alert('No hay consumo registrado para esta mesa.');
        return;
    }

    const totales = calcularTotalesCuenta(mesaCuentaActual);
    const metodoPago = document.getElementById('tipo-pago').value;
    const ref = document.getElementById('referencia-pago').value.trim();
    const confirmacion = confirm(`Cerrar cuenta de ${mesaCuentaActual.nombre} por ${formatoMoneda(totales.total)} con ${metodoPago}?`);
    if (!confirmacion) return;

    const cierre = {
        idMesa: mesaCuentaActual.id,
        mesa: mesaCuentaActual.nombre,
        fechaCierre: new Date().toISOString(),
        subtotal: Number(totales.subtotal.toFixed(2)),
        descuentoMonto: Number(totales.descuento.toFixed(2)),
        propinaMonto: Number(totales.propina.toFixed(2)),
        totalCobrado: Number(totales.total.toFixed(2)),
        comensales: totales.comensales,
        metodoPago,
        referencia: ref,
        descuentoTipo: (mesaCuentaActual.descuento && mesaCuentaActual.descuento.tipo) ? mesaCuentaActual.descuento.tipo : 'ninguno',
        items: mesaCuentaActual.items
    };

    registrarCierreCaja(cierre);

    mesaCuentaActual.estado = 'libre';
    mesaCuentaActual.items = [];
    mesaCuentaActual.descuento = { tipo: 'ninguno', valor: 0 };
    guardarCuentas();
    cargarOpcionesMesas();
    renderizarCuentaActual();
    mostrarMensajeCuenta('Cuenta cerrada, ticket listo y mesa liberada.', 'success');
}

function registrarCierreCaja(cierre) {
    cierresRegistrados.push(cierre);
    guardarCierres();

    // Integrar con módulo de reportes si existe
    if (typeof actualizarDatosVentas === 'function') {
        actualizarDatosVentas({
            fecha: cierre.fechaCierre.split('T')[0],
            total: cierre.totalCobrado,
            tickets: 1,
            promedio: cierre.totalCobrado
        });
    }
    if (typeof actualizarProductosVendidos === 'function') {
        cierre.items.forEach(item => {
            actualizarProductosVendidos({
                nombre: item.nombre,
                categoria: item.categoria || 'otros',
                cantidad: item.cantidad,
                ingresos: item.precio * item.cantidad
            });
        });
    }
    if (typeof actualizarDesempenoMesero === 'function' && currentUser) {
        actualizarDesempenoMesero(currentUser.email, cierre.totalCobrado, cierre.mesa);
    }

    inicializarCorteCaja();
}

/* =====================================================
   MA"DULO 6: CORTE DE CAJA (FIN DE DÍA)
===================================================== */

function inicializarCorteCaja() {
    const btnExcel = document.getElementById('btn-corte-excel');
    const btnPdf = document.getElementById('btn-corte-pdf');
    const btnCorreo = document.getElementById('btn-enviar-correo');
    const btnNube = document.getElementById('btn-guardar-nube');
    const efectivoContado = document.getElementById('monto-efectivo-contado');

    if (!moduloCorteIniciado) {
        if (btnExcel) btnExcel.addEventListener('click', exportarCorteExcel);
        if (btnPdf) btnPdf.addEventListener('click', exportarCortePDF);
        if (btnCorreo) btnCorreo.addEventListener('click', enviarCorteCorreo);
        if (btnNube) btnNube.addEventListener('click', guardarCorteNube);
        if (efectivoContado) efectivoContado.addEventListener('input', actualizarDiferenciaCaja);
        moduloCorteIniciado = true;
    }

    renderizarCorteCaja();
}

function obtenerCierresHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    return cierresRegistrados.filter(c => c.fechaCierre.startsWith(hoy));
}

function renderizarCorteCaja() {
    const cierresHoy = obtenerCierresHoy();
    const ingresos = { efectivo: 0, tarjeta: 0, transferencia: 0 };
    const categorias = { comida: 0, bebida: 0, otros: 0 };
    let propinas = 0;

    const efectivoEl = document.getElementById('corte-efectivo');
    const tarjetaEl = document.getElementById('corte-tarjeta');
    const transferenciaEl = document.getElementById('corte-transferencia');
    const totalEl = document.getElementById('corte-total-ventas');
    const comidaEl = document.getElementById('corte-comida');
    const bebidaEl = document.getElementById('corte-bebida');
    const otrosEl = document.getElementById('corte-otros');
    const propinasEl = document.getElementById('corte-propinas');
    const netoEl = document.getElementById('corte-neto');
    const lista = document.getElementById('lista-cierres-dia');

    if (!efectivoEl || !tarjetaEl || !transferenciaEl || !totalEl || !comidaEl || !bebidaEl || !otrosEl || !propinasEl || !netoEl || !lista) {
        return;
    }

    cierresHoy.forEach(c => {
        if (ingresos[c.metodoPago] !== undefined) {
            ingresos[c.metodoPago] += c.totalCobrado;
        }
        propinas += c.propinaMonto || 0;
        c.items.forEach(item => {
            const cat = item.categoria === 'bebida' ? 'bebida' : (item.categoria === 'comida' ? 'comida' : 'otros');
            categorias[cat] += (item.precio * item.cantidad);
        });
    });

    const totalVentas = cierresHoy.reduce((sum, c) => sum + c.totalCobrado, 0);
    const neto = totalVentas - propinas;

    efectivoEl.textContent = formatoMoneda(ingresos.efectivo);
    tarjetaEl.textContent = formatoMoneda(ingresos.tarjeta);
    transferenciaEl.textContent = formatoMoneda(ingresos.transferencia);
    totalEl.textContent = formatoMoneda(totalVentas);

    comidaEl.textContent = formatoMoneda(categorias.comida);
    bebidaEl.textContent = formatoMoneda(categorias.bebida);
    otrosEl.textContent = formatoMoneda(categorias.otros);

    propinasEl.textContent = formatoMoneda(propinas);
    netoEl.textContent = formatoMoneda(neto);

    if (cierresHoy.length === 0) {
        lista.innerHTML = '<div class="cierre-card">No hay cierres registrados hoy.</div>';
    } else {
        lista.innerHTML = cierresHoy.map(c => `
            <div class="cierre-card">
                <h4>${c.mesa}</h4>
                <div class="row"><span>Pago</span><strong>${c.metodoPago}</strong></div>
                <div class="row"><span>Total</span><strong>${formatoMoneda(c.totalCobrado)}</strong></div>
                <div class="row"><span>Propina</span><strong>${formatoMoneda(c.propinaMonto)}</strong></div>
                <div class="row"><span>Fecha</span><span>${new Date(c.fechaCierre).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span></div>
            </div>
        `).join('');
    }

    resumenCorteActual = {
        cierres: cierresHoy,
        ingresosPorPago: ingresos,
        categorias,
        propinas,
        totalVentas,
        neto
    };

    actualizarDiferenciaCaja();
}

function actualizarDiferenciaCaja() {
    if (!resumenCorteActual) return;
    const esperado = resumenCorteActual.ingresosPorPago.efectivo || 0;
    const contadoInput = document.getElementById('monto-efectivo-contado');
    const contado = contadoInput ? (Number(contadoInput.value) || 0) : 0;
    const diferencia = contado - esperado;
    const pill = document.getElementById('diferencia-caja');
    if (pill) {
        pill.textContent = formatoMoneda(diferencia);
        pill.classList.remove('pill-warning', 'pill-success');
        pill.classList.add(diferencia === 0 ? 'pill-success' : 'pill-warning');
    }
}

function exportarCorteExcel() {
    if (!resumenCorteActual) return;
    let csv = 'Concepto,Valor\\n';
    csv += `Efectivo,${resumenCorteActual.ingresosPorPago.efectivo}\\n`;
    csv += `Tarjeta,${resumenCorteActual.ingresosPorPago.tarjeta}\\n`;
    csv += `Transferencia,${resumenCorteActual.ingresosPorPago.transferencia}\\n`;
    csv += `Total Ventas,${resumenCorteActual.totalVentas}\\n`;
    csv += `Propinas,${resumenCorteActual.propinas}\\n`;
    csv += `Neto,${resumenCorteActual.neto}\\n\\n`;
    csv += 'Ventas por categoria,Total\\n';
    csv += `Comida,${resumenCorteActual.categorias.comida}\\n`;
    csv += `Bebida,${resumenCorteActual.categorias.bebida}\\n`;
    csv += `Otros,${resumenCorteActual.categorias.otros}\\n\\n`;
    csv += 'Cierres,Total,Propina,Metodo,Fecha\\n';
    resumenCorteActual.cierres.forEach(c => {
        csv += `${c.mesa},${c.totalCobrado},${c.propinaMonto},${c.metodoPago},${c.fechaCierre}\\n`;
    });
    if (typeof descargarCSV === 'function') {
        descargarCSV(csv, `corte_caja_${obtenerFechaActual()}.csv`);
    } else {
        alert('No se pudo exportar a CSV (descargarCSV no disponible).');
    }
}

function exportarCortePDF() {
    if (!resumenCorteActual) return;
    const contenido = `
        <h1 style="color:#ea580c;">Corte de Caja</h1>
        <p><strong>Total ventas:</strong> ${formatoMoneda(resumenCorteActual.totalVentas)}</p>
        <p><strong>Propinas:</strong> ${formatoMoneda(resumenCorteActual.propinas)}</p>
        <p><strong>Neto:</strong> ${formatoMoneda(resumenCorteActual.neto)}</p>
        <h3>Ingresos por pago</h3>
        <ul>
            <li>Efectivo: ${formatoMoneda(resumenCorteActual.ingresosPorPago.efectivo)}</li>
            <li>Tarjeta: ${formatoMoneda(resumenCorteActual.ingresosPorPago.tarjeta)}</li>
            <li>Transferencia: ${formatoMoneda(resumenCorteActual.ingresosPorPago.transferencia)}</li>
        </ul>
        <h3>Ventas por categoria</h3>
        <ul>
            <li>Comida: ${formatoMoneda(resumenCorteActual.categorias.comida)}</li>
            <li>Bebida: ${formatoMoneda(resumenCorteActual.categorias.bebida)}</li>
            <li>Otros: ${formatoMoneda(resumenCorteActual.categorias.otros)}</li>
        </ul>
    `;
    if (typeof generarPDF === 'function') {
        generarPDF(contenido, `corte_caja_${obtenerFechaActual()}.pdf`);
    } else {
        alert('No se pudo generar PDF (generarPDF no disponible).');
    }
}

function enviarCorteCorreo() {
    if (!resumenCorteActual) return;
    const correo = document.getElementById('correo-corte').value.trim();
    if (!correo) {
        alert('Escribe un correo para enviar el reporte.');
        return;
    }
    const envios = JSON.parse(localStorage.getItem('corte_envios')) || [];
    envios.push({
        correo,
        fecha: new Date().toISOString(),
        resumen: resumenCorteActual
    });
    localStorage.setItem('corte_envios', JSON.stringify(envios));
    alert('Reporte de corte enviado (simulado).');
}

function guardarCorteNube() {
    if (!resumenCorteActual) return;
    localStorage.setItem('corte_nube', JSON.stringify({
        fecha: new Date().toISOString(),
        resumen: resumenCorteActual
    }));
    alert('Reporte almacenado en la nube (localStorage).');
}
