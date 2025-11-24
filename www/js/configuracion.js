// --------------------------
//     MÓDULO 8 CONFIGURACIÓN
// --------------------------

document.addEventListener("DOMContentLoaded", () => {
    cargarPlatos();
    cargarUsuarios();
    cargarImpuestos();
    cargarTicket();
});

// Base de datos simulada
let platos = JSON.parse(localStorage.getItem("platos")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [
    { nombre: "Admin", rol: "Administrador" }
];

// --------------------------
//   PLATOS
// --------------------------
function cargarPlatos() {
    const div = document.getElementById("listaPlatos");
    div.innerHTML = "";

    if (platos.length === 0) {
        div.innerHTML = "<p>No hay platos registrados.</p>";
        return;
    }

    platos.forEach((p, index) => {
        const cont = document.createElement("div");
        cont.innerHTML = `
            <strong>${p.nombre}</strong> - $${p.precio}
            <br>Categoría: ${p.categoria}
            <br>Descripción: ${p.descripcion}
            <br>
            <button onclick="editarPlato(${index})">Editar</button>
            <button onclick="eliminarPlato(${index})">Eliminar</button>
            <hr>
        `;
        div.appendChild(cont);
    });
}

function mostrarFormularioNuevoPlato() {
    const nombre = prompt("Nombre del plato:");
    const precio = prompt("Precio:");
    const categoria = prompt("Categoría:");
    const descripcion = prompt("Descripción:");

    platos.push({ nombre, precio, categoria, descripcion });
    localStorage.setItem("platos", JSON.stringify(platos));

    cargarPlatos();
}

function editarPlato(index) {
    const p = platos[index];

    const nombre = prompt("Nuevo nombre:", p.nombre);
    const precio = prompt("Nuevo precio:", p.precio);
    const categoria = prompt("Nueva categoría:", p.categoria);
    const descripcion = prompt("Nueva descripción:", p.descripcion);

    platos[index] = { nombre, precio, categoria, descripcion };
    localStorage.setItem("platos", JSON.stringify(platos));

    cargarPlatos();
}

function eliminarPlato(index) {
    platos.splice(index, 1);
    localStorage.setItem("platos", JSON.stringify(platos));
    cargarPlatos();
}

// --------------------------
//   IMPUESTOS Y PROPINA
// --------------------------
function guardarImpuestos() {
    const impuesto = document.getElementById("impuestoInput").value;
    const propina = document.getElementById("propinaInput").value;

    localStorage.setItem("configImpuestos", JSON.stringify({ impuesto, propina }));
    alert("Configuración guardada correctamente.");
}

function cargarImpuestos() {
    const data = JSON.parse(localStorage.getItem("configImpuestos"));
    if (data) {
        document.getElementById("impuestoInput").value = data.impuesto;
        document.getElementById("propinaInput").value = data.propina;
    }
}

// --------------------------
//   PERSONALIZACIÓN TICKET
// --------------------------
function guardarTicket() {
    const nombre = document.getElementById("nombreRestInput").value;
    const mensaje = document.getElementById("mensajeTicketInput").value;

    localStorage.setItem("configTicket", JSON.stringify({ nombre, mensaje }));
    alert("Ticket actualizado.");
}

function cargarTicket() {
    const data = JSON.parse(localStorage.getItem("configTicket"));
    if (data) {
        document.getElementById("nombreRestInput").value = data.nombre;
        document.getElementById("mensajeTicketInput").value = data.mensaje;
    }
}

// --------------------------
//   USUARIOS
// --------------------------
function cargarUsuarios() {
    const div = document.getElementById("listaUsuarios");
    div.innerHTML = "";

    usuarios.forEach((u, index) => {
        const cont = document.createElement("div");

        cont.innerHTML = `
            <strong>${u.nombre}</strong>
            <br>Rol: ${u.rol}
            <br>
            <button onclick="editarUsuario(${index})">Editar</button>
            <button onclick="eliminarUsuario(${index})">Eliminar</button>
            <hr>
        `;
        div.appendChild(cont);
    });
}

function agregarUsuario() {
    const nombre = prompt("Nombre:");
    const rol = prompt("Rol (Mesero, Cajero, Administrador):");

    usuarios.push({ nombre, rol });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    cargarUsuarios();
}

function editarUsuario(index) {
    const u = usuarios[index];

    const nombre = prompt("Nuevo nombre:", u.nombre);
    const rol = prompt("Nuevo rol:", u.rol);

    usuarios[index] = { nombre, rol };
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    cargarUsuarios();
}

function eliminarUsuario(index) {
    usuarios.splice(index, 1);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    cargarUsuarios();
}
