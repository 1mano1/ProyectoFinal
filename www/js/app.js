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
    const moduleTitle = document.getElementById('module-title');
    const moduleMessage = document.getElementById('module-message');

    // Marcar botón activo
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    let nombreModulo = '';
    switch (moduleKey) {
        case 'mesas':
            nombreModulo = 'Mesas';
            break;
        case 'pedidos':
            nombreModulo = 'Pedidos';
            break;
        case 'cuentas':
            nombreModulo = 'Cuentas / Cierre de cuentas';
            break;
        case 'reportes':
            nombreModulo = 'Reportes';
            break;
        case 'configuracion':
            nombreModulo = 'Configuración';
            break;
        default:
            nombreModulo = 'Módulo';
    }

    // Actualizar título y mensaje si existen en el DOM (no se encuentran tras
    // reemplazar `main.innerHTML` en algunos módulos).
    if (moduleTitle) {
        moduleTitle.textContent = nombreModulo;
    }
    if (moduleMessage) {
        moduleMessage.textContent =
            `Seleccionaste el módulo: ${nombreModulo}. ` +
            'Esta sección será desarrollada en otros apartados del proyecto.';
    }

    // Renderizar el contenido completo del módulo (si existe una implementación)
    if (typeof loadModule === 'function') {
        loadModule(moduleKey);
    }
}
/* =====================================================
   MÓDULOS DEL SISTEMA (PEDIDOS Y CONFIGURACIÓN)
   TODO SE RENDERIZA EN EL MAIN DE index.html
===================================================== */

function loadModule(moduleKey) {
    const main = document.querySelector('.app-main');

    switch (moduleKey) {

        /* ============================================
            MÓDULO 3: MESAS
        ============================================ */
        case 'mesas':
            main.innerHTML = `
                <div class="card card-wide">
                    <h2>Gestión de Mesas</h2>

                    <div id="mesasContainer" class="mesas-grid"></div>

                    <hr>

                    <h3>Acciones con Mesas</h3>
                    <label>Mesa 1:</label>
                    <select id="mesaA"></select>

                    <label>Mesa 2:</label>
                    <select id="mesaB"></select>

                    <button class="btn-primary" onclick="combinarMesas()">Combinar Mesas</button>
                    <button class="btn-primary" onclick="dividirMesa()">Dividir Mesa</button>
                </div>
            `;

            iniciarModuloMesas();
            break;


        /* ============================================
           MÓDULO 4: PEDIDOS
        ============================================ */
        case 'pedidos':
            main.innerHTML = `
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
            main.innerHTML = `
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
            main.innerHTML = `
                <div class="card card-wide">
                    <h2>Módulo no encontrado</h2>
                </div>
            `;
    }
}

/* =====================================================
   MÓDULO 3: MESAS
===================================================== */

let mesasData = JSON.parse(localStorage.getItem("mesasData")) || [
    { id: 1, nombre: "Mesa 1", estado: "disponible", clientes: 0, mesero: "" },
    { id: 2, nombre: "Mesa 2", estado: "disponible", clientes: 0, mesero: "" },
    { id: 3, nombre: "Mesa 3", estado: "disponible", clientes: 0, mesero: "" },
    { id: 4, nombre: "Mesa 4", estado: "disponible", clientes: 0, mesero: "" }
];

function guardarMesas() {
    localStorage.setItem("mesasData", JSON.stringify(mesasData));
}

function iniciarModuloMesas() {
    renderMesas();
    llenarSelectsMesas();
}

function renderMesas() {
    const cont = document.getElementById("mesasContainer");

    cont.innerHTML = mesasData.map(m => `
        <div class="mesa-card mesa-${m.estado}">
            <h3>${m.nombre}</h3>
            <p><strong>Estado:</strong> ${m.estado}</p>
            <p><strong>Clientes:</strong> ${m.clientes}</p>
            <p><strong>Mesero:</strong> ${m.mesero || "No asignado"}</p>

            <button onclick="asignarClientes(${m.id})">Asignar Clientes</button>
            <button onclick="asignarMesero(${m.id})">Asignar Mesero</button>
            <button onclick="cambiarEstadoMesa(${m.id})">Cambiar Estado</button>
        </div>
    `).join("");
}

/* -------- ASIGNAR CLIENTES -------- */

function asignarClientes(id) {
    const mesa = mesasData.find(m => m.id === id);
    const clientes = prompt("Cantidad de clientes:", mesa.clientes);

    if (clientes !== null) {
        mesa.clientes = Number(clientes);
        mesa.estado = clientes > 0 ? "ocupada" : "disponible";
        guardarMesas();
        renderMesas();
    }
}

/* -------- ASIGNAR MESERO -------- */

function asignarMesero(id) {
    const mesa = mesasData.find(m => m.id === id);
    const mesero = prompt("Nombre del mesero asignado:", mesa.mesero);

    if (mesero !== null) {
        mesa.mesero = mesero;
        if (mesa.clientes > 0) mesa.estado = "ocupada";
        guardarMesas();
        renderMesas();
    }
}

/* -------- CAMBIAR ESTADO -------- */

function cambiarEstadoMesa(id) {
    const mesa = mesasData.find(m => m.id === id);

    const opciones = ["disponible", "ocupada", "en espera"];
    const nuevoEstado = prompt(
        "Estado:\n1. Disponible\n2. Ocupada\n3. En espera",
        "1"
    );

    if (nuevoEstado >= 1 && nuevoEstado <= 3) {
        mesa.estado = opciones[nuevoEstado - 1];
        guardarMesas();
        renderMesas();
    }
}

/* -------- COMBINAR / DIVIDIR MESAS -------- */

function llenarSelectsMesas() {
    const a = document.getElementById("mesaA");
    const b = document.getElementById("mesaB");

    const options = mesasData.map(m => `<option value="${m.id}">${m.nombre}</option>`).join("");

    a.innerHTML = options;
    b.innerHTML = options;
}

function combinarMesas() {
    const idA = Number(document.getElementById("mesaA").value);
    const idB = Number(document.getElementById("mesaB").value);

    if (idA === idB) {
        alert("No puedes combinar la misma mesa.");
        return;
    }

    const mesaA = mesasData.find(m => m.id === idA);
    const mesaB = mesasData.find(m => m.id === idB);

    mesaA.clientes += mesaB.clientes;
    mesaB.clientes = 0;
    mesaB.estado = "disponible";

    guardarMesas();
    renderMesas();
    alert("Mesas combinadas correctamente.");
}

function dividirMesa() {
    const idA = Number(document.getElementById("mesaA").value);

    const mesaA = mesasData.find(m => m.id === idA);

    if (mesaA.clientes === 0) {
        alert("La mesa no tiene clientes para dividir.");
        return;
    }

    const clientesDiv = Math.floor(mesaA.clientes / 2);

    mesaA.clientes -= clientesDiv;

    // Buscar una mesa disponible
    const mesaLibre = mesasData.find(m => m.estado === "disponible" && m.clientes === 0);

    if (!mesaLibre) {
        alert("No hay mesas libres para dividir.");
        return;
    }

    mesaLibre.clientes = clientesDiv;
    mesaLibre.estado = "ocupada";
    mesaLibre.mesero = mesaA.mesero;

    guardarMesas();
    renderMesas();
    alert("Mesa dividida correctamente.");
}

document.getElementById("btn-probar-mesas").addEventListener("click", () => {
    document.getElementById("mensaje-prueba-mesas").innerText =
        "El módulo de mesas está funcionando correctamente.";
    console.log("Prueba de mesas ejecutada");
});


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
