// --------------------------
//   MÓDULO DE PEDIDOS
// --------------------------

document.addEventListener("DOMContentLoaded", () => {
    cargarMesas();
    cargarMenu("entradas");

    document.getElementById("categoriaSelect")
        .addEventListener("change", (e) => cargarMenu(e.target.value));

    document.getElementById("btnEnviarPedido")
        .addEventListener("click", enviarPedidoACocina);
});

// Array simulado de mesas
const mesas = [
    { id: 1, nombre: "Mesa 1" },
    { id: 2, nombre: "Mesa 2" },
    { id: 3, nombre: "Mesa 3" },
];

// Menú digital simulado
const menu = {
    entradas: [
        { id: 1, nombre: "Guacamole", precio: 50 },
        { id: 2, nombre: "Nachos", precio: 70 },
    ],
    platos: [
        { id: 3, nombre: "Tacos al pastor", precio: 90 },
        { id: 4, nombre: "Enchiladas", precio: 85 },
    ],
    bebidas: [
        { id: 5, nombre: "Agua de horchata", precio: 25 },
        { id: 6, nombre: "Refresco", precio: 20 },
    ],
    postres: [
        { id: 7, nombre: "Flan", precio: 30 },
        { id: 8, nombre: "Pastel helado", precio: 40 },
    ],
};

// Carrito del pedido actual
let pedido = [];

// --------------------------
// Cargar mesas
// --------------------------
function cargarMesas() {
    const select = document.getElementById("mesaSelect");
    select.innerHTML = "";

    mesas.forEach(m => {
        const op = document.createElement("option");
        op.value = m.id;
        op.textContent = m.nombre;
        select.appendChild(op);
    });
}

// --------------------------
// Cargar menú por categoría
// --------------------------
function cargarMenu(cat) {
    const div = document.getElementById("listaProductos");
    div.innerHTML = "";

    menu[cat].forEach(prod => {
        const cont = document.createElement("div");
        cont.innerHTML = `
            <strong>${prod.nombre}</strong> - $${prod.precio}
            <button onclick="agregarAlPedido(${prod.id}, '${prod.nombre}', ${prod.precio})">
                Añadir
            </button>
        `;
        div.appendChild(cont);
    });
}

// --------------------------
// Añadir plato al pedido
// --------------------------
function agregarAlPedido(id, nombre, precio) {
    const instrucciones = prompt("¿Instrucciones especiales? (Ej. sin picante)");

    pedido.push({
        id,
        nombre,
        precio,
        cantidad: 1,
        instrucciones: instrucciones || ""
    });

    mostrarPedido();
}

// --------------------------
// Mostrar carrito
// --------------------------
function mostrarPedido() {
    const div = document.getElementById("pedidoActual");
    div.innerHTML = "";

    if (pedido.length === 0) {
        div.innerHTML = "<p>No hay productos en el pedido.</p>";
        return;
    }

    pedido.forEach((p, index) => {
        const cont = document.createElement("div");
        cont.style.marginBottom = "10px";
        cont.innerHTML = `
            <strong>${p.nombre}</strong>
            <br>Precio: $${p.precio}
            <br>Cantidad: 
            <input type='number' value="${p.cantidad}" min="1"
                onchange="actualizarCantidad(${index}, this.value)" />
            <br>Instrucciones: ${p.instrucciones}
            <br>
            <button onclick="eliminarDelPedido(${index})">Eliminar</button>
        `;
        div.appendChild(cont);
    });
}

// --------------------------
// Actualizar cantidad
// --------------------------
function actualizarCantidad(index, nuevaCantidad) {
    pedido[index].cantidad = Number(nuevaCantidad);
}

// --------------------------
// Eliminar del pedido
// --------------------------
function eliminarDelPedido(index) {
    pedido.splice(index, 1);
    mostrarPedido();
}

// --------------------------
// Enviar a cocina
// --------------------------
function enviarPedidoACocina() {
    if (pedido.length === 0) {
        alert("No hay productos en el pedido.");
        return;
    }

    const mesa = document.getElementById("mesaSelect").value;

    const pedidoFinal = {
        mesa,
        estado: "en preparación",
        items: pedido,
        fecha: new Date().toLocaleString()
    };

    console.log("Pedido enviado:", pedidoFinal);

    alert("Pedido enviado a cocina exitosamente.");

    // Limpia el pedido
    pedido = [];
    mostrarPedido();
}
