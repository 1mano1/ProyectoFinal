// =====================================================
// USUARIOS (SIMULACIÓN DE BASE DE DATOS)
// =====================================================
const USERS = [
    { email: 'mesero@restaurante.com', password: '123456', role: 'mesero', name: 'Juan Pérez' },
    { email: 'cajero@restaurante.com', password: '123456', role: 'cajero', name: 'Ana López' },
    { email: 'admin@restaurante.com', password: 'admin123', role: 'admin', name: 'Administrador' }
];

let currentUser = null;

document.addEventListener('deviceready', onDeviceReady, false);
document.addEventListener('DOMContentLoaded', onDeviceReady, false);

function onDeviceReady() {
    console.log("Device ready");

    const loginForm = document.getElementById('login-form');
    const btnLogout = document.getElementById('btn-logout');
    const navButtons = document.querySelectorAll('.nav-btn');
    const togglePasswordBtn = document.getElementById('toggle-password');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (btnLogout) btnLogout.addEventListener('click', handleLogout);
    if (togglePasswordBtn) togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

    navButtons.forEach(btn => btn.addEventListener('click', handleModuleClick));

    loadRememberedCredentials();
}

// =====================================================
// LOGIN
// =====================================================
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const remember = document.getElementById('remember-me').checked;

    if (!email || !password || !role) {
        return showError("Completa todos los campos.");
    }

    const user = USERS.find(u => u.email === email && u.password === password && u.role === role);

    if (!user) {
        return showError("Credenciales incorrectas.");
    }

    currentUser = user;

    // Guardar credenciales si marcó recordar
    if (remember) {
        localStorage.setItem('remember_email', email);
        localStorage.setItem('remember_password', password);
        localStorage.setItem('remember_role', role);
        localStorage.setItem('remember_me', '1');
    } else {
        localStorage.clear();
    }

    goToMenu();
}

function showError(msg) {
    const errorBox = document.getElementById('login-error');
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
}

function loadRememberedCredentials() {
    if (!localStorage.getItem('remember_me')) return;

    document.getElementById('email').value = localStorage.getItem('remember_email');
    document.getElementById('password').value = localStorage.getItem('remember_password');
    document.getElementById('role').value = localStorage.getItem('remember_role');
    document.getElementById('remember-me').checked = true;
}

function togglePasswordVisibility() {
    const input = document.getElementById('password');
    const btn = document.getElementById('toggle-password');
    if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
    } else {
        input.type = "password";
        btn.textContent = "👁";
    }
}

// =====================================================
// NAVEGACIÓN Y VISUALIZACIÓN
// =====================================================
function goToMenu() {
    document.getElementById('login-view').classList.remove('active');
    document.getElementById('menu-view').classList.add('active');

    document.getElementById('user-label').textContent =
        `${currentUser.name} (${currentUser.email})`;

    document.getElementById('role-label').textContent =
        currentUser.role === 'mesero' ? 'Mesero'
        : currentUser.role === 'cajero' ? 'Cajero'
        : 'Administrador';
}

function handleLogout() {
    currentUser = null;
    document.getElementById('menu-view').classList.remove('active');
    document.getElementById('login-view').classList.add('active');
}

function handleModuleClick(event) {
    const moduleKey = event.currentTarget.getAttribute('data-module');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Cargar módulo real
    loadModule(moduleKey);
}

// =====================================================
// SISTEMA DE MÓDULOS
// =====================================================
function loadModule(moduleKey) {
    const main = document.querySelector(".app-main");

    switch (moduleKey) {

        // =====================================================
        // MÓDULO 4 — PEDIDOS
        // =====================================================
        case "pedidos":
            main.innerHTML = `
                <div class="card card-wide">
                    <h2>Pedidos</h2>

                    <h3>Mesa:</h3>
                    <select id="mesaSelect"></select>

                    <h3>Categoría del menú</h3>
                    <select id="categoriaSelect">
                        <option value="entradas">Entradas</option>
                        <option value="platos">Platos Fuertes</option>
                        <option value="bebidas">Bebidas</option>
                        <option value="postres">Postres</option>
                    </select>

                    <div id="listaProductos"></div>

                    <h3>Pedido actual</h3>
                    <div id="pedidoActual"></div>

                    <button id="btnEnviarPedido" class="btn-primary">Enviar a cocina</button>
                </div>
            `;
            iniciarModuloPedidos();
            break;

        // =====================================================
        // MÓDULO 8 — CONFIGURACIÓN
        // =====================================================
        case "configuracion":
            main.innerHTML = `
                <div class="card card-wide">
                    <h2>Configuración del Restaurante</h2>

                    <h3>Menú del restaurante</h3>
                    <button onclick="nuevoPlato()" class="btn-primary">Agregar plato</button>
                    <div id="listaPlatos"></div>

                    <hr>

                    <h3>Impuestos y propina</h3>
                    <label>Impuesto (%):</label>
                    <input type="number" id="impuestoInput">

                    <label>Propina sugerida (%):</label>
                    <input type="number" id="propinaInput">
                    <button onclick="guardarImpuestos()" class="btn-primary">Guardar</button>

                    <hr>

                    <h3>Datos del Ticket</h3>
                    <label>Nombre del restaurante:</label>
                    <input type="text" id="nombreRestInput">

                    <label>Mensaje del ticket:</label>
                    <input type="text" id="mensajeTicketInput">

                    <button onclick="guardarTicket()" class="btn-primary">Guardar ticket</button>

                    <hr>

                    <h3>Gestión de usuarios</h3>
                    <button onclick="agregarUsuario()" class="btn-primary">Nuevo usuario</button>
                    <div id="listaUsuarios"></div>
                </div>
            `;
            iniciarConfiguracion();
            break;

        default:
            main.innerHTML = `<p>Módulo no encontrado.</p>`;
    }
}

// =====================================================
// MÓDULO 4 — LÓGICA DE PEDIDOS
// =====================================================
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
    document.getElementById("mesaSelect").innerHTML =
        mesas.map(m => `<option value="${m.id}">${m.nombre}</option>`).join("");
}

function cargarMenu(cat) {
    const div = document.getElementById("listaProductos");
    div.innerHTML = menu[cat].map(p => `
        <div class="item">
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
        <div class="item">
            <strong>${p.nombre}</strong> - $${p.precio}
            <br>Cantidad: 
            <input type="number" min="1" value="${p.cantidad}" 
                onchange="actualizarCantidad(${i}, this.value)">
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

    alert("Pedido enviado a cocina.");
    pedido = [];
    mostrarPedido();
}

// =====================================================
// MÓDULO 8 — CONFIGURACIÓN
// =====================================================
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

// ---------- PLATOS ----------
function cargarPlatos() {
    const div = document.getElementById("listaPlatos");

    div.innerHTML = platos.map((p, i) => `
        <div class="item">
            <strong>${p.nombre}</strong> — $${p.precio}
            <br>${p.descripcion}
            <button onclick="editarPlato(${i})">Editar</button>
            <button onclick="eliminarPlato(${i})">Eliminar</button>
        </div>
    `).join("");
}

function nuevoPlato() {
    const nombre = prompt("Nombre del plato:");
    const precio = prompt("Precio:");
    const descripcion = prompt("Descripción:");

    platos.push({ nombre, precio, descripcion });
    localStorage.setItem("platos", JSON.stringify(platos));
    cargarPlatos();
}

function editarPlato(i) {
    platos[i].nombre = prompt("Nuevo nombre:", platos[i].nombre);
    platos[i].precio = prompt("Nuevo precio:", platos[i].precio);
    platos[i].descripcion = prompt("Nueva descripción:", platos[i].descripcion);

    localStorage.setItem("platos", JSON.stringify(platos));
    cargarPlatos();
}

function eliminarPlato(i) {
    platos.splice(i, 1);
    localStorage.setItem("platos", JSON.stringify(platos));
    cargarPlatos();
}

// ---------- IMPUESTOS ----------
function guardarImpuestos() {
    const impuesto = document.getElementById("impuestoInput").value;
    const propina = document.getElementById("propinaInput").value;

    localStorage.setItem("impuestos", JSON.stringify({ impuesto, propina }));
    alert("Guardado correctamente.");
}

function cargarImpuestos() {
    const data = JSON.parse(localStorage.getItem("impuestos"));
    if (data) {
        document.getElementById("impuestoInput").value = data.impuesto;
        document.getElementById("propinaInput").value = data.propina;
    }
}

// ---------- TICKET ----------
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

// ---------- USUARIOS ----------
function cargarUsuarios() {
    const div = document.getElementById("listaUsuarios");

    div.innerHTML = usuarios.map((u, i) => `
        <div class="item">
            <strong>${u.nombre}</strong> (${u.rol})
            <button onclick="editarUsuario(${i})">Editar</button>
            <button onclick="eliminarUsuario(${i})">Eliminar</button>
        </div>
    `).join("");
}

function agregarUsuario() {
    const nombre = prompt("Nombre del usuario:");
    const rol = prompt("Rol:");

    usuarios.push({ nombre, rol });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    cargarUsuarios();
}

function editarUsuario(i) {
    usuarios[i].nombre = prompt("Nuevo nombre:", usuarios[i].nombre);
    usuarios[i].rol = prompt("Nuevo rol:", usuarios[i].rol);

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    cargarUsuarios();
}

function eliminarUsuario(i) {
    usuarios.splice(i, 1);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    cargarUsuarios();
}
