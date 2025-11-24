/* =====================================================
   MÓDULO DE REPORTES DEL RESTAURANTE
   
   Este módulo maneja:
   - Resumen de ventas diarias, semanales y mensuales
   - Reporte de platos más vendidos
   - Desempeño de meseros (ventas y mesas atendidas)
   - Control de inventario con alertas de nivel bajo
   - Exportación a Excel y PDF
===================================================== */

// Datos simulados para demostración (se reemplazarán con datos reales de otros módulos)
let datosVentas = [];
let datosProductos = [];
let datosMeseros = [];
let datosInventario = [];

/* =====================================================
   INICIALIZACIÓN DEL MÓDULO
===================================================== */

function iniciarModuloReportes() {
    // Cargar datos desde localStorage u otros módulos
    cargarDatosReportes();

    // Configurar event listeners solo la primera vez
    if (!window.reportesModuloIniciado) {
        configurarEventosReportes();
        window.reportesModuloIniciado = true;
    }

    // Actualizar el reporte actual visible
    const tabActiva = document.querySelector('.tab-btn.active');
    if (tabActiva) {
        const tabName = tabActiva.getAttribute('data-tab');
        cambiarTab(tabName);
    } else {
        // Por defecto cargar ventas
        actualizarReporteVentas('diario');
    }
}

/* =====================================================
   CONFIGURACIÓN DE EVENTOS
===================================================== */

function configurarEventosReportes() {
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.getAttribute('data-tab');
            cambiarTab(tabName);
        });
    });

    // Selectores de período
    const periodoVentas = document.getElementById('periodo-ventas');
    if (periodoVentas) {
        periodoVentas.addEventListener('change', (e) => {
            actualizarReporteVentas(e.target.value);
        });
    }

    const periodoProductos = document.getElementById('periodo-productos');
    if (periodoProductos) {
        periodoProductos.addEventListener('change', (e) => {
            actualizarReporteProductos(e.target.value);
        });
    }

    const periodoMeseros = document.getElementById('periodo-meseros');
    if (periodoMeseros) {
        periodoMeseros.addEventListener('change', (e) => {
            actualizarReporteMeseros(e.target.value);
        });
    }
}

function cambiarTab(tabName) {
    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Cargar datos del tab seleccionado
    switch(tabName) {
        case 'ventas':
            actualizarReporteVentas(document.getElementById('periodo-ventas').value);
            break;
        case 'productos':
            actualizarReporteProductos(document.getElementById('periodo-productos').value);
            break;
        case 'meseros':
            actualizarReporteMeseros(document.getElementById('periodo-meseros').value);
            break;
        case 'inventario':
            actualizarReporteInventario();
            break;
    }
}

/* =====================================================
   CARGA DE DATOS (desde otros módulos)
===================================================== */

function cargarDatosReportes() {
    // TODO: Integrar con datos reales de otros módulos
    // Por ahora usamos datos de ejemplo desde localStorage

    // Cargar ventas
    datosVentas = JSON.parse(localStorage.getItem('ventas_reportes')) || generarDatosVentasEjemplo();
    
    // Cargar productos vendidos
    datosProductos = JSON.parse(localStorage.getItem('productos_vendidos')) || generarDatosProductosEjemplo();
    
    // Cargar datos de meseros
    datosMeseros = JSON.parse(localStorage.getItem('meseros_desempeno')) || generarDatosMeserosEjemplo();
    
    // Cargar inventario
    datosInventario = JSON.parse(localStorage.getItem('inventario_insumos')) || generarDatosInventarioEjemplo();
}

// Datos de ejemplo para demostración
function generarDatosVentasEjemplo() {
    const hoy = new Date();
    const ventas = [];
    
    for (let i = 30; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        
        ventas.push({
            fecha: fecha.toISOString().split('T')[0],
            total: Math.floor(Math.random() * 5000) + 2000,
            tickets: Math.floor(Math.random() * 30) + 10,
            promedio: 0
        });
    }
    
    // Calcular promedio
    ventas.forEach(v => {
        v.promedio = Math.round(v.total / v.tickets);
    });
    
    return ventas;
}

function generarDatosProductosEjemplo() {
    return [
        { nombre: 'Tacos al pastor', cantidad: 156, ingresos: 14040, categoria: 'platos' },
        { nombre: 'Enchiladas', cantidad: 98, ingresos: 8330, categoria: 'platos' },
        { nombre: 'Guacamole', cantidad: 87, ingresos: 4350, categoria: 'entradas' },
        { nombre: 'Refresco', cantidad: 203, ingresos: 4060, categoria: 'bebidas' },
        { nombre: 'Flan', cantidad: 65, ingresos: 1950, categoria: 'postres' },
        { nombre: 'Nachos', cantidad: 54, ingresos: 3780, categoria: 'entradas' },
        { nombre: 'Agua de horchata', cantidad: 124, ingresos: 3100, categoria: 'bebidas' },
        { nombre: 'Pastel helado', cantidad: 43, ingresos: 1720, categoria: 'postres' }
    ];
}

function generarDatosMeserosEjemplo() {
    return [
        { nombre: 'Juan Pérez', email: 'mesero@restaurante.com', ventas: 25340, mesas: 87, promedioMesa: 291 },
        { nombre: 'María García', email: 'maria@restaurante.com', ventas: 21500, mesas: 76, promedioMesa: 283 },
        { nombre: 'Carlos López', email: 'carlos@restaurante.com', ventas: 19800, mesas: 65, promedioMesa: 305 }
    ];
}

function generarDatosInventarioEjemplo() {
    return [
        { nombre: 'Carne de res', cantidad: 15, minimo: 20, maximo: 100, unidad: 'kg' },
        { nombre: 'Tortillas', cantidad: 500, minimo: 300, maximo: 1000, unidad: 'pzas' },
        { nombre: 'Aguacate', cantidad: 8, minimo: 50, maximo: 200, unidad: 'kg' },
        { nombre: 'Refrescos', cantidad: 45, minimo: 50, maximo: 200, unidad: 'pzas' },
        { nombre: 'Queso', cantidad: 12, minimo: 10, maximo: 50, unidad: 'kg' }
    ];
}

/* =====================================================
   REPORTE DE VENTAS
===================================================== */

function actualizarReporteVentas(periodo) {
    const content = document.getElementById('ventas-content');
    if (!content) return;

    const datos = filtrarVentasPorPeriodo(periodo);
    
    const totalVentas = datos.reduce((sum, v) => sum + v.total, 0);
    const totalTickets = datos.reduce((sum, v) => sum + v.tickets, 0);
    const promedioTicket = totalTickets > 0 ? Math.round(totalVentas / totalTickets) : 0;

    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total de Ventas</div>
                <div class="stat-value">$${totalVentas.toLocaleString('es-MX')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Tickets Generados</div>
                <div class="stat-value">${totalTickets}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Ticket Promedio</div>
                <div class="stat-value">$${promedioTicket.toLocaleString('es-MX')}</div>
            </div>
        </div>

        <h4>Detalle por Día</h4>
        <div class="tabla-reporte">
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Tickets</th>
                        <th>Promedio</th>
                    </tr>
                </thead>
                <tbody>
                    ${datos.map(v => `
                        <tr>
                            <td>${formatearFecha(v.fecha)}</td>
                            <td>$${v.total.toLocaleString('es-MX')}</td>
                            <td>${v.tickets}</td>
                            <td>$${v.promedio.toLocaleString('es-MX')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function filtrarVentasPorPeriodo(periodo) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    return datosVentas.filter(v => {
        const fechaVenta = new Date(v.fecha);
        
        switch(periodo) {
            case 'diario':
                return fechaVenta.toDateString() === hoy.toDateString();
            case 'semanal':
                const hace7dias = new Date(hoy);
                hace7dias.setDate(hoy.getDate() - 7);
                return fechaVenta >= hace7dias;
            case 'mensual':
                const hace30dias = new Date(hoy);
                hace30dias.setDate(hoy.getDate() - 30);
                return fechaVenta >= hace30dias;
            default:
                return true;
        }
    });
}

/* =====================================================
   REPORTE DE PRODUCTOS
===================================================== */

function actualizarReporteProductos(periodo) {
    const content = document.getElementById('productos-content');
    if (!content) return;

    // Ordenar por cantidad vendida
    const productosOrdenados = [...datosProductos].sort((a, b) => b.cantidad - a.cantidad);

    const totalUnidades = productosOrdenados.reduce((sum, p) => sum + p.cantidad, 0);
    const totalIngresos = productosOrdenados.reduce((sum, p) => sum + p.ingresos, 0);

    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Productos Vendidos</div>
                <div class="stat-value">${totalUnidades}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Ingresos Totales</div>
                <div class="stat-value">$${totalIngresos.toLocaleString('es-MX')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Producto Top</div>
                <div class="stat-value">${productosOrdenados[0]?.nombre || 'N/A'}</div>
            </div>
        </div>

        <h4>Ranking de Productos</h4>
        <div class="tabla-reporte">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Cantidad</th>
                        <th>Ingresos</th>
                        <th>% del Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosOrdenados.map((p, i) => {
                        const porcentaje = ((p.cantidad / totalUnidades) * 100).toFixed(1);
                        return `
                            <tr>
                                <td><strong>${i + 1}</strong></td>
                                <td>${p.nombre}</td>
                                <td><span class="categoria-badge ${p.categoria}">${p.categoria}</span></td>
                                <td>${p.cantidad}</td>
                                <td>$${p.ingresos.toLocaleString('es-MX')}</td>
                                <td>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${porcentaje}%"></div>
                                    </div>
                                    ${porcentaje}%
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/* =====================================================
   REPORTE DE MESEROS
===================================================== */

function actualizarReporteMeseros(periodo) {
    const content = document.getElementById('meseros-content');
    if (!content) return;

    // Ordenar por ventas
    const meserosOrdenados = [...datosMeseros].sort((a, b) => b.ventas - a.ventas);

    const totalVentas = meserosOrdenados.reduce((sum, m) => sum + m.ventas, 0);
    const totalMesas = meserosOrdenados.reduce((sum, m) => sum + m.mesas, 0);

    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total de Ventas</div>
                <div class="stat-value">$${totalVentas.toLocaleString('es-MX')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Mesas Atendidas</div>
                <div class="stat-value">${totalMesas}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Meseros Activos</div>
                <div class="stat-value">${meserosOrdenados.length}</div>
            </div>
        </div>

        <h4>Desempeño por Mesero</h4>
        <div class="tabla-reporte">
            <table>
                <thead>
                    <tr>
                        <th>Posición</th>
                        <th>Mesero</th>
                        <th>Ventas</th>
                        <th>Mesas</th>
                        <th>Promedio/Mesa</th>
                        <th>% del Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${meserosOrdenados.map((m, i) => {
                        const porcentaje = ((m.ventas / totalVentas) * 100).toFixed(1);
                        const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
                        return `
                            <tr>
                                <td><strong>${medalla}</strong></td>
                                <td>
                                    <div>${m.nombre}</div>
                                    <small style="color: #6b7280;">${m.email}</small>
                                </td>
                                <td><strong>$${m.ventas.toLocaleString('es-MX')}</strong></td>
                                <td>${m.mesas}</td>
                                <td>$${m.promedioMesa.toLocaleString('es-MX')}</td>
                                <td>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${porcentaje}%"></div>
                                    </div>
                                    ${porcentaje}%
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/* =====================================================
   REPORTE DE INVENTARIO
===================================================== */

function actualizarReporteInventario() {
    const content = document.getElementById('inventario-content');
    if (!content) return;

    // Calcular alertas (20% de capacidad)
    const insumosConAlerta = datosInventario.map(insumo => {
        const capacidadTotal = insumo.maximo - insumo.minimo;
        const nivelCritico = insumo.minimo + (capacidadTotal * 0.2);
        const porcentaje = ((insumo.cantidad - insumo.minimo) / capacidadTotal) * 100;
        
        return {
            ...insumo,
            nivelCritico,
            porcentaje: Math.max(0, Math.min(100, porcentaje)),
            alerta: insumo.cantidad <= nivelCritico ? 'critico' : 
                    insumo.cantidad <= insumo.minimo ? 'bajo' : 'normal'
        };
    });

    const insumosCriticos = insumosConAlerta.filter(i => i.alerta === 'critico');
    const insumosBajos = insumosConAlerta.filter(i => i.alerta === 'bajo');

    content.innerHTML = `
        ${insumosCriticos.length > 0 ? `
            <div class="alerta-inventario critico">
                <strong>⚠️ Alerta Crítica:</strong> ${insumosCriticos.length} insumo(s) por debajo del 20% de capacidad
            </div>
        ` : ''}

        ${insumosBajos.length > 0 ? `
            <div class="alerta-inventario bajo">
                <strong>⚡ Alerta:</strong> ${insumosBajos.length} insumo(s) por debajo del mínimo establecido
            </div>
        ` : ''}

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Insumos</div>
                <div class="stat-value">${datosInventario.length}</div>
            </div>
            <div class="stat-card ${insumosCriticos.length > 0 ? 'alerta-stat' : ''}">
                <div class="stat-label">Nivel Crítico</div>
                <div class="stat-value">${insumosCriticos.length}</div>
            </div>
            <div class="stat-card ${insumosBajos.length > 0 ? 'alerta-stat' : ''}">
                <div class="stat-label">Nivel Bajo</div>
                <div class="stat-value">${insumosBajos.length}</div>
            </div>
        </div>

        <h4>Control de Inventario</h4>
        <div class="tabla-reporte">
            <table>
                <thead>
                    <tr>
                        <th>Insumo</th>
                        <th>Cantidad</th>
                        <th>Rango (Min-Máx)</th>
                        <th>Nivel</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${insumosConAlerta.map((insumo, i) => {
                        const estadoClass = insumo.alerta;
                        const estadoTexto = insumo.alerta === 'critico' ? '🔴 Crítico' :
                                          insumo.alerta === 'bajo' ? '🟡 Bajo' : '🟢 Normal';
                        
                        return `
                            <tr class="${estadoClass}">
                                <td><strong>${insumo.nombre}</strong></td>
                                <td>${insumo.cantidad} ${insumo.unidad}</td>
                                <td>${insumo.minimo} - ${insumo.maximo} ${insumo.unidad}</td>
                                <td>
                                    <div class="progress-bar-inv">
                                        <div class="progress-fill-inv ${estadoClass}" 
                                             style="width: ${insumo.porcentaje}%"></div>
                                    </div>
                                    ${insumo.porcentaje.toFixed(0)}%
                                </td>
                                <td><span class="estado-badge ${estadoClass}">${estadoTexto}</span></td>
                                <td>
                                    <button class="btn-icon" onclick="editarInsumo(${i})" title="Editar">✏️</button>
                                    <button class="btn-icon" onclick="eliminarInsumo(${i})" title="Eliminar">🗑️</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/* =====================================================
   GESTIÓN DE INVENTARIO
===================================================== */

let insumoEnEdicion = null;

function abrirModalInsumo(index = null) {
    const modal = document.getElementById('modal-insumo');
    const titulo = document.getElementById('modal-insumo-titulo');
    const form = document.getElementById('form-insumo');
    
    // Limpiar formulario
    form.reset();
    insumoEnEdicion = index;
    
    if (index !== null && datosInventario[index]) {
        // Modo edición
        titulo.textContent = 'Editar Insumo';
        const insumo = datosInventario[index];
        document.getElementById('insumo-nombre').value = insumo.nombre;
        document.getElementById('insumo-cantidad').value = insumo.cantidad;
        document.getElementById('insumo-unidad').value = insumo.unidad;
        document.getElementById('insumo-minimo').value = insumo.minimo;
        document.getElementById('insumo-maximo').value = insumo.maximo;
    } else {
        // Modo agregar
        titulo.textContent = 'Agregar Insumo';
        insumoEnEdicion = null;
    }
    
    modal.style.display = 'flex';
    
    // Cerrar modal al hacer clic fuera del contenido
    modal.onclick = function(event) {
        if (event.target === modal) {
            cerrarModalInsumo();
        }
    };
}

function cerrarModalInsumo() {
    const modal = document.getElementById('modal-insumo');
    modal.style.display = 'none';
    insumoEnEdicion = null;
}

function guardarInsumoModal(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('insumo-nombre').value.trim();
    const cantidad = parseFloat(document.getElementById('insumo-cantidad').value);
    const unidad = document.getElementById('insumo-unidad').value;
    const minimo = parseFloat(document.getElementById('insumo-minimo').value);
    const maximo = parseFloat(document.getElementById('insumo-maximo').value);
    
    // Validaciones
    if (!nombre) {
        alert('El nombre del insumo es obligatorio');
        return;
    }
    
    if (isNaN(cantidad) || cantidad < 0) {
        alert('La cantidad debe ser un número válido');
        return;
    }
    
    if (isNaN(minimo) || minimo < 0) {
        alert('El mínimo debe ser un número válido');
        return;
    }
    
    if (isNaN(maximo) || maximo <= minimo) {
        alert('El máximo debe ser mayor al mínimo');
        return;
    }
    
    if (!unidad) {
        alert('Debe seleccionar una unidad de medida');
        return;
    }
    
    const insumoData = {
        nombre,
        cantidad,
        unidad,
        minimo,
        maximo
    };
    
    if (insumoEnEdicion !== null) {
        // Actualizar insumo existente
        datosInventario[insumoEnEdicion] = insumoData;
    } else {
        // Agregar nuevo insumo
        datosInventario.push(insumoData);
    }
    
    guardarInventario();
    actualizarReporteInventario();
    cerrarModalInsumo();
}

function editarInsumo(index) {
    abrirModalInsumo(index);
}

// Mantener compatibilidad con el botón de agregar
function agregarInsumo() {
    abrirModalInsumo();
}

function eliminarInsumo(index) {
    if (confirm('¿Eliminar este insumo del inventario?')) {
        datosInventario.splice(index, 1);
        guardarInventario();
        actualizarReporteInventario();
    }
}

function guardarInventario() {
    localStorage.setItem('inventario_insumos', JSON.stringify(datosInventario));
}

/* =====================================================
   EXPORTACIÓN A EXCEL
===================================================== */

function exportarVentasExcel() {
    const periodo = document.getElementById('periodo-ventas').value;
    const datos = filtrarVentasPorPeriodo(periodo);
    
    let csv = 'Fecha,Total,Tickets,Promedio\n';
    datos.forEach(v => {
        csv += `${formatearFecha(v.fecha)},${v.total},${v.tickets},${v.promedio}\n`;
    });

    descargarCSV(csv, `ventas_${periodo}_${obtenerFechaActual()}.csv`);
}

function exportarProductosExcel() {
    let csv = 'Producto,Categoría,Cantidad,Ingresos\n';
    datosProductos.forEach(p => {
        csv += `${p.nombre},${p.categoria},${p.cantidad},${p.ingresos}\n`;
    });

    descargarCSV(csv, `productos_${obtenerFechaActual()}.csv`);
}

function exportarMeserosExcel() {
    let csv = 'Mesero,Email,Ventas,Mesas,Promedio por Mesa\n';
    datosMeseros.forEach(m => {
        csv += `${m.nombre},${m.email},${m.ventas},${m.mesas},${m.promedioMesa}\n`;
    });

    descargarCSV(csv, `meseros_${obtenerFechaActual()}.csv`);
}

function exportarInventarioExcel() {
    let csv = 'Insumo,Cantidad,Unidad,Mínimo,Máximo\n';
    datosInventario.forEach(i => {
        csv += `${i.nombre},${i.cantidad},${i.unidad},${i.minimo},${i.maximo}\n`;
    });

    descargarCSV(csv, `inventario_${obtenerFechaActual()}.csv`);
}

/* =====================================================
   EXPORTACIÓN A PDF
===================================================== */

function exportarVentasPDF() {
    const periodo = document.getElementById('periodo-ventas').value;
    const datos = filtrarVentasPorPeriodo(periodo);
    
    const totalVentas = datos.reduce((sum, v) => sum + v.total, 0);
    const totalTickets = datos.reduce((sum, v) => sum + v.tickets, 0);
    
    let contenido = `
        <h1 style="color: #f97316;">Reporte de Ventas</h1>
        <p><strong>Período:</strong> ${periodo}</p>
        <p><strong>Total de Ventas:</strong> $${totalVentas.toLocaleString('es-MX')}</p>
        <p><strong>Tickets:</strong> ${totalTickets}</p>
        <hr>
        <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f3f4f6;">
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Tickets</th>
                    <th>Promedio</th>
                </tr>
            </thead>
            <tbody>
                ${datos.map(v => `
                    <tr>
                        <td>${formatearFecha(v.fecha)}</td>
                        <td>$${v.total.toLocaleString('es-MX')}</td>
                        <td>${v.tickets}</td>
                        <td>$${v.promedio.toLocaleString('es-MX')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    generarPDF(contenido, `reporte_ventas_${obtenerFechaActual()}.pdf`);
}

function exportarProductosPDF() {
    const totalIngresos = datosProductos.reduce((sum, p) => sum + p.ingresos, 0);
    
    let contenido = `
        <h1 style="color: #f97316;">Reporte de Productos Más Vendidos</h1>
        <p><strong>Total de Ingresos:</strong> $${totalIngresos.toLocaleString('es-MX')}</p>
        <hr>
        <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f3f4f6;">
                    <th>#</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Ingresos</th>
                </tr>
            </thead>
            <tbody>
                ${datosProductos.map((p, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${p.nombre}</td>
                        <td>${p.categoria}</td>
                        <td>${p.cantidad}</td>
                        <td>$${p.ingresos.toLocaleString('es-MX')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    generarPDF(contenido, `reporte_productos_${obtenerFechaActual()}.pdf`);
}

function exportarMeserosPDF() {
    const totalVentas = datosMeseros.reduce((sum, m) => sum + m.ventas, 0);
    
    let contenido = `
        <h1 style="color: #f97316;">Reporte de Desempeño de Meseros</h1>
        <p><strong>Total de Ventas:</strong> $${totalVentas.toLocaleString('es-MX')}</p>
        <hr>
        <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f3f4f6;">
                    <th>Mesero</th>
                    <th>Ventas</th>
                    <th>Mesas</th>
                    <th>Promedio/Mesa</th>
                </tr>
            </thead>
            <tbody>
                ${datosMeseros.map(m => `
                    <tr>
                        <td>${m.nombre}</td>
                        <td>$${m.ventas.toLocaleString('es-MX')}</td>
                        <td>${m.mesas}</td>
                        <td>$${m.promedioMesa.toLocaleString('es-MX')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    generarPDF(contenido, `reporte_meseros_${obtenerFechaActual()}.pdf`);
}

function exportarInventarioPDF() {
    let contenido = `
        <h1 style="color: #f97316;">Reporte de Inventario</h1>
        <p><strong>Total de Insumos:</strong> ${datosInventario.length}</p>
        <hr>
        <table border="1" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f3f4f6;">
                    <th>Insumo</th>
                    <th>Cantidad</th>
                    <th>Mínimo</th>
                    <th>Máximo</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${datosInventario.map(i => {
                    const capacidadTotal = i.maximo - i.minimo;
                    const nivelCritico = i.minimo + (capacidadTotal * 0.2);
                    const estado = i.cantidad <= nivelCritico ? 'Crítico' :
                                  i.cantidad <= i.minimo ? 'Bajo' : 'Normal';
                    return `
                        <tr>
                            <td>${i.nombre}</td>
                            <td>${i.cantidad} ${i.unidad}</td>
                            <td>${i.minimo} ${i.unidad}</td>
                            <td>${i.maximo} ${i.unidad}</td>
                            <td>${estado}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    generarPDF(contenido, `reporte_inventario_${obtenerFechaActual()}.pdf`);
}

/* =====================================================
   FUNCIONES DE UTILIDAD
===================================================== */

function descargarCSV(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', nombreArchivo);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Archivo ${nombreArchivo} descargado exitosamente`);
}

function generarPDF(contenidoHTML, nombreArchivo) {
    // Crear una ventana temporal para imprimir
    const ventana = window.open('', '_blank');
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${nombreArchivo}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    padding: 8px;
                    text-align: left;
                    border: 1px solid #ddd;
                }
                th {
                    background-color: #f3f4f6;
                }
            </style>
        </head>
        <body>
            ${contenidoHTML}
            <script>
                window.onload = function() {
                    window.print();
                    // window.close(); // Opcional: cerrar la ventana después de imprimir
                }
            </script>
        </body>
        </html>
    `);
    
    ventana.document.close();
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
    return fecha.toLocaleDateString('es-MX', opciones);
}

function obtenerFechaActual() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}${mes}${dia}`;
}

/* =====================================================
   INTEGRACIÓN CON OTROS MÓDULOS
   
   Funciones para recibir datos de otros módulos:
===================================================== */

// Función para actualizar datos de ventas desde el módulo de cuentas/caja
function actualizarDatosVentas(ventaNueva) {
    datosVentas.push(ventaNueva);
    localStorage.setItem('ventas_reportes', JSON.stringify(datosVentas));
}

// Función para actualizar productos vendidos desde el módulo de pedidos
function actualizarProductosVendidos(producto) {
    const existente = datosProductos.find(p => p.nombre === producto.nombre);
    if (existente) {
        existente.cantidad += producto.cantidad;
        existente.ingresos += producto.ingresos;
    } else {
        datosProductos.push(producto);
    }
    localStorage.setItem('productos_vendidos', JSON.stringify(datosProductos));
}

// Función para actualizar desempeño de meseros
function actualizarDesempenoMesero(meseroEmail, venta, mesa) {
    const mesero = datosMeseros.find(m => m.email === meseroEmail);
    if (mesero) {
        mesero.ventas += venta;
        mesero.mesas += 1;
        mesero.promedioMesa = Math.round(mesero.ventas / mesero.mesas);
    }
    localStorage.setItem('meseros_desempeno', JSON.stringify(datosMeseros));
}
