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

const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');
const authCard = document.getElementById('authCard');
const dashboardCard = document.getElementById('dashboardCard');
const adminCard = document.getElementById('adminCard');

const lblNombreUsuario = document.getElementById('lblNombreUsuario');
const lblInmueble = document.getElementById('lblInmueble');
const lblParqueadero = document.getElementById('lblParqueadero');
const lblSaldo = document.getElementById('lblSaldo');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const btnCerrarSesionAdmin = document.getElementById('btnCerrarSesionAdmin');
const tablaAdminCuerpo = document.getElementById('tablaAdminCuerpo');
const statTotalCasas = document.getElementById('statTotalCasas');

let usuarioSesionActiva = null;

tabLogin?.addEventListener('click', () => { tabLogin.classList.add('active'); tabRegister.classList.remove('active'); formLogin.classList.remove('hidden'); formRegister.classList.add('hidden'); });
tabRegister?.addEventListener('click', () => { tabRegister.classList.add('active'); tabLogin.classList.remove('active'); formRegister.classList.remove('hidden'); formLogin.classList.add('hidden'); });

formRegister?.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('regNombre').value.trim();
    const documento = document.getElementById('regDocumento').value.trim();
    const casa = document.getElementById('regCasa').value.trim();
    const contrasena = document.getElementById('regContrasena').value.trim();
    
    let listaUsuarios = obtenerUsuarios();
    if (listaUsuarios.some(u => u.documento === documento)) { alert("El documento ya está registrado."); return; }
    
    const nuevoUsuario = { documento, contrasena, nombre, casa, parqueadero: "Sin parqueadero asignado", saldo: "$0 (Al día)" };
    listaUsuarios.push(nuevoUsuario);
    localStorage.setItem('usuariosPropietarios', JSON.stringify(listaUsuarios));
    
    alert(`¡Registro Exitoso! Casa añadida.`);
    formRegister.reset();
    tabLogin.click();
});

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
            cargarPanelAdministrador();
            adminCard.classList.remove('hidden');
        } else {
            actualizarInterfazDashboard();
            dashboardCard.classList.remove('hidden');
        }
    } else {
        alert("Error: Credenciales incorrectas.");
    }
});

function actualizarInterfazDashboard() {
    if (usuarioSesionActiva) {
        lblNombreUsuario.textContent = usuarioSesionActiva.nombre;
        lblInmueble.textContent = usuarioSesionActiva.casa;
        lblParqueadero.textContent = usuarioSesionActiva.parqueadero;
        lblSaldo.textContent = usuarioSesionActiva.saldo;
    }
}

// NUEVA FUNCIÓN: Panel de Administración con Visualización de Credenciales y Parqueaderos
function cargarPanelAdministrador() {
    const listaUsuarios = obtenerUsuarios();
    const inquilinos = listaUsuarios.filter(u => u.documento !== "admin");
    
    if (statTotalCasas) statTotalCasas.textContent = inquilinos.length;
    if (!tablaAdminCuerpo) return;
    tablaAdminCuerpo.innerHTML = ""; 
    
    inquilinos.forEach(usuario => {
        const fila = document.createElement('tr');
        
        let colorClase = "status-green";
        if (usuario.saldo.includes("mora")) colorClase = "status-red";
        else if (usuario.saldo.includes("pendiente") || usuario.saldo.includes("Acuerdo")) colorClase = "status-orange";

        fila.innerHTML = `
            <td>
                <strong>${usuario.casa}</strong><br>
                <small style="color:#0288d1; font-weight:bold;">${usuario.parqueadero}</small>
            </td>
            <td>
                <strong>${usuario.nombre}</strong><br>
                <small style="color:#666;">User: ${usuario.documento} | Clave: <strong>${usuario.contrasena}</strong></small><br>
                <span class="status-badge ${colorClase}" style="margin-top:4px;">${usuario.saldo}</span>
            </td>
            <td>
                <button class="btn-manage" onclick="gestionarCuentaPropia('${usuario.documento}')">Gestionar</button>
            </td>
        `;
        tablaAdminCuerpo.appendChild(fila);
    });
}

// NUEVA FUNCIÓN GLOBAL: Permite a la administradora cambiar Parqueaderos, Claves o Saldos
window.gestionarCuentaPropia = function(documentoUsuario) {
    let listaUsuarios = obtenerUsuarios();
    const index = listaUsuarios.findIndex(u => u.documento === documentoUsuario);
    if (index === -1) return;

    const usuario = listaUsuarios[index];
    
    // Menú de opciones de administración
    const opcion = prompt(
        `GESTIÓN DE LA ${usuario.casa.toUpperCase()}\nPropietario: ${usuario.nombre}\n\n` +
        `Seleccione una opción escribiendo el número:\n` +
        `1. Modificar Contraseña\n` +
        `2. Asignar / Cambiar Parqueadero\n` +
        `3. Actualizar Estado de Cuenta (Saldo)`
    );

    if (opcion === "1") {
        const nuevaClave = prompt(`Contraseña actual: ${usuario.contrasena}\nIngrese la nueva contraseña:`);
        if (nuevaClave) {
            listaUsuarios[index].contrasena = nuevaClave.trim();
            alert("Contraseña actualizada con éxito.");
        }
    } else if (opcion === "2") {
        const nuevoParq = prompt(`Asignación actual:\n${usuario.parqueadero}\n\nEscriba el nuevo parqueadero asignado (Ej: Parqueadero #85 (Privado) - Sin Vehículo):`);
        if (nuevoParq) {
            listaUsuarios[index].parqueadero = nuevoParq.trim();
            alert("Parqueadero reasignado correctamente.");
        }
    } else if (opcion === "3") {
        const nuevoSaldo = prompt(`Estado de cuenta actual: ${usuario.saldo}\n\nEscriba el nuevo estado (Ej: $0 (Al día) ó $180.000 (Mes actual pendiente) ó $360.000 (2 meses en mora)):`);
        if (nuevoSaldo) {
            listaUsuarios[index].saldo = nuevoSaldo.trim();
            alert("Estado financiero actualizado.");
        }
    } else {
        if(opcion !== null) alert("Opción no válida.");
        return;
    }

    // Guardar cambios y refrescar la tabla de la administradora inmediatamente
    localStorage.setItem('usuariosPropietarios', JSON.stringify(listaUsuarios));
    cargarPanelAdministrador();
};

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
    
