const usuariosPredeterminados = [
    { documento: "1010101010", contrasena: "1234", nombre: "Carlos Mendoza", casa: "Casa 42 - Manzana B", parqueadero: "Parqueadero #42 (Privado) - Vehículo: XYZ-123", saldo: "$0 (Al día)" },
    { documento: "80123456", contrasena: "clave1", nombre: "María Consuelo Pinzón", casa: "Casa 105 - Manzana F", parqueadero: "Parqueadero #105 (Privado) - Sin Vehículo", saldo: "$180.000 (Mes actual pendiente)" },
    { documento: "1022394857", contrasena: "clave2", nombre: "Andrés Felipe Ospina", casa: "Casa 12 - Manzana A", parqueadero: "Sin parqueadero asignado", saldo: "$0 (Al día)" },
    { documento: "52345678", contrasena: "clave3", nombre: "Diana Marcela Pinto", casa: "Casa 112 - Manzana G", parqueadero: "Parqueadero #112 (Privado) - Vehículo: KGV-456", saldo: "$360.000 (2 meses en mora)" },
    { documento: "1013456789", contrasena: "clave4", nombre: "Jorge Eliecer Silva", casa: "Casa 67 - Manzana C", parqueadero: "Parqueadero #67 (Privado) - Vehículo: MNO-789", saldo: "$0 (Al día)" },
    { documento: "39765432", contrasena: "clave5", nombre: "Sandra Milena Gómez", casa: "Casa 89 - Manzana D", parqueadero: "Parqueadero #89 (Privado) - Sin Vehículo", saldo: "$180.000 (Mes actual pendiente)" },
    { documento: "1030987654", contrasena: "clave6", nombre: "Ricardo Antonio Cruz", casa: "Casa 5 - Manzana A", parqueadero: "Parqueadero #5 (Privado) - Vehículo: DFG-321", saldo: "$0 (Al día)" },
    { documento: "21456789", contrasena: "clave7", nombre: "Claudia Patricia Rey", casa: "Casa 143 - Manzana H", parqueadero: "Sin parqueadero asignado", saldo: "$540.000 (Acuerdo de pago activo)" },
    { documento: "1015678123", contrasena: "clave8", nombre: "Esteban Camilo Torres", casa: "Casa 21 - Manzana B", parqueadero: "Parqueadero #21 (Privado) - Vehículo: JKL-012", saldo: "$0 (Al día)" },
    { documento: "admin", contrasena: "admin123", nombre: "Administración Central", casa: "Oficina Principal", parqueadero: "Zonas de Visitantes (Control General)", saldo: "N/A" }
];

if (!localStorage.getItem('usuariosPropietarios')) {
    localStorage.setItem('usuariosPropietarios', JSON.stringify(usuariosPredeterminados));
}

function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem('usuariosPropietarios'));
}

// Elementos de la interfaz
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');
const authCard = document.getElementById('authCard');
const dashboardCard = document.getElementById('dashboardCard');
const adminCard = document.getElementById('adminCard');

// Elementos del panel de Propietario
const lblNombreUsuario = document.getElementById('lblNombreUsuario');
const lblInmueble = document.getElementById('lblInmueble');
const lblParqueadero = document.getElementById('lblParqueadero');
const lblSaldo = document.getElementById('lblSaldo');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const btnCerrarSesionAdmin = document.getElementById('btnCerrarSesionAdmin');

// Elementos del panel de Administración
const tablaAdminCuerpo = document.getElementById('tablaAdminCuerpo');
const statTotalCasas = document.getElementById('statTotalCasas');

let usuarioSesionActiva = null;

// Intercambio de pestañas visuales
tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
});

tabRegister?.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    formRegister.classList.remove('hidden');
    formLogin.classList.add('hidden');
});

// Registro de usuarios
formRegister?.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('regNombre').value.trim();
    const documento = document.getElementById('regDocumento').value.trim();
    const casa = document.getElementById('regCasa').value.trim();
    const contrasena = document.getElementById('regContrasena').value.trim();
    
    let listaUsuarios = obtenerUsuarios();
    
    if (listaUsuarios.some(u => u.documento === documento)) {
        alert("El documento ingresado ya está registrado.");
        return;
    }
    
    const numParqueaderoAleatorio = Math.floor(Math.random() * 150) + 1;
    const nuevoUsuario = { documento, contrasena, nombre, casa, parqueadero: `Parqueadero #${numParqueaderoAleatorio} (Asignado) - Sin Vehículo`, saldo: "$0 (Al día)" };
    
    listaUsuarios.push(nuevoUsuario);
    localStorage.setItem('usuariosPropietarios', JSON.stringify(listaUsuarios));
    
    alert(`¡Registro Exitoso! Inmueble ${casa} añadido al sistema.`);
    formRegister.reset();
    tabLogin.click();
});

// Inicio de Sesión Discriminado (Admin vs Propietario)
formLogin?.addEventListener('submit', function(e) {
    e.preventDefault();
    const txtDocumento = document.getElementById('txtUsuario').value.trim();
    const txtContrasena = document.getElementById('txtContrasena').value.trim();
    
    const listaUsuarios = obtenerUsuarios();
    const usuarioEncontrado = listaUsuarios.find(u => u.documento === txtDocumento && u.contrasena === txtContrasena);
    
    if (usuarioEncontrado) {
        usuarioSesionActiva = usuarioEncontrado;
        formLogin.reset();
        authCard.classList.add('hidden');

        if (usuarioEncontrado.documento === "admin") {
            // Desplegar Panel de Administración General
            cargarPanelAdministrador();
            adminCard.classList.remove('hidden');
        } else {
            // Desplegar Panel de Propietario Normal
            actualizarInterfazDashboard();
            dashboardCard.classList.remove('hidden');
        }
    } else {
        alert("Error: Documento o contraseña incorrectos.");
    }
});

// Renderizar Panel de Propietario
function actualizarInterfazDashboard() {
    if (usuarioSesionActiva) {
        lblNombreUsuario.textContent = usuarioSesionActiva.nombre;
        lblInmueble.textContent = usuarioSesionActiva.casa;
        lblParqueadero.textContent = usuarioSesionActiva.parqueadero;
        lblSaldo.textContent = usuarioSesionActiva.saldo;
    }
}

// NUEVA FUNCIÓN: Construir la tabla de visualización global del Administrador
function cargarPanelAdministrador() {
    const listaUsuarios = obtenerUsuarios();
    // Filtrar al admin de la lista para mostrar solo las casas reales
    const inquilinos = listaUsuarios.filter(u => u.documento !== "admin");
    
    // Actualizar métrica en el badge
    if (statTotalCasas) statTotalCasas.textContent = inquilinos.length;
    
    if (!tablaAdminCuerpo) return;
    tablaAdminCuerpo.innerHTML = ""; // Limpiar tabla previa
    
    inquilinos.forEach(usuario => {
        const fila = document.createElement('tr');
        
        // Determinar color de alerta según el estado de cuenta
        let colorClase = "status-green";
        if (usuario.saldo.includes("mora")) colorClase = "status-red";
        else if (usuario.saldo.includes("pendiente") || usuario.saldo.includes("Acuerdo")) colorClase = "status-orange";

        fila.innerHTML = `
            <td><strong>${usuario.casa}</strong></td>
            <td>${usuario.nombre}</td>
            <td><span class="status-badge ${colorClase}">${usuario.saldo}</span></td>
        `;
        tablaAdminCuerpo.appendChild(fila);
    });
}

// Función para registrar vehículos
window.registrarVehiculoSimulado = function() {
    const placa = prompt("Ingrese la placa del vehículo a registrar (Ej: ABC123):");
    if (!placa) return;
    
    let listaUsuarios = obtenerUsuarios();
    const index = listaUsuarios.findIndex(u => u.documento === usuarioSesionActiva.documento);
    
    if (index !== -1) {
        const parqueaderoActual = listaUsuarios[index].parqueadero;
        const parteParqueadero = parqueaderoActual.split(" - ");
        listaUsuarios[index].parqueadero = `${parteParqueadero[0]} - Vehículo: ${placa.toUpperCase()}`;
        
        localStorage.setItem('usuariosPropietarios', JSON.stringify(listaUsuarios));
        usuarioSesionActiva = listaUsuarios[index];
        actualizarInterfazDashboard();
        alert(`¡Vehículo registrado exitosamente!`);
    }
};

// Eventos de botones Cerrar Sesión
btnCerrarSesion?.addEventListener('click', () => { usuarioSesionActiva = null; dashboardCard.classList.add('hidden'); authCard.classList.remove('hidden'); });
btnCerrarSesionAdmin?.addEventListener('click', () => { usuarioSesionActiva = null; adminCard.classList.add('hidden'); authCard.classList.remove('hidden'); });
    
