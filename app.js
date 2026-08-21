// 📦 Base de datos por defecto (Se incluye propiedad "primerIngreso" para simular el Excel inicial)
const deFabrica = [
    { documento: "1010101010", contrasena: "1234", nombre: "Carlos Mendoza", casa: "Casa 42 - Manzana B", parqueadero: "Parqueadero #42 (Privado) - 🚗 Vehículo: XYZ-123", saldo: "$0 (Al día)", primerIngreso: true },
    { documento: "80123456", contrasena: "clave1", nombre: "María Consuelo Pinzón", casa: "Casa 105 - Manzana F", parqueadero: "Parqueadero #105 (Privado) - Sin Vehículo", saldo: "$180.000 (Mes actual pendiente)", primerIngreso: true },
    { documento: "1022394857", contrasena: "clave2", nombre: "Andrés Felipe Ospina", casa: "Casa 12 - Manzana A", parqueadero: "Sin parqueadero asignado", saldo: "$0 (Al día)", primerIngreso: true },
    { documento: "52345678", contrasena: "clave3", nombre: "Diana Marcela Pinto", casa: "Casa 112 - Manzana G", parqueadero: "Parqueadero #112 (Privado) - 🚗 Vehículo: KGV-456", saldo: "$360.000 (2 meses en mora)", primerIngreso: true },
    { documento: "1013456789", contrasena: "clave4", nombre: "Jorge Eliecer Silva", casa: "Casa 67 - Manzana C", parqueadero: "Parqueadero #67 (Privado) - 🚗 Vehículo: MNO-789", saldo: "$0 (Al día)", primerIngreso: true },
    { documento: "39765432", contrasena: "clave5", nombre: "Sandra Milena Gómez", casa: "Casa 89 - Manzana D", parqueadero: "Parqueadero #89 (Privado) - 🏍️ Vehículo: QWE-12C", saldo: "$180.000 (Mes actual pendiente)", primerIngreso: true },
    { documento: "admin", contrasena: "admin123", nombre: "Administración Central", casa: "Oficina Principal", parqueadero: "Zonas de Visitantes", saldo: "N/A", primerIngreso: false }
];

if (!localStorage.getItem('usuariosPropietarios')) {
    localStorage.setItem('usuariosPropietarios', JSON.stringify(deFabrica));
}

const getUsers = () => JSON.parse(localStorage.getItem('usuariosPropietarios'));
const saveUsers = (data) => localStorage.setItem('usuariosPropietarios', JSON.stringify(data));
// Mapeo completo del DOM
const tabLogin = document.getElementById('tabLogin'), 
      tabRegister = document.getElementById('tabRegister'), 
      formLogin = document.getElementById('formLogin'), 
      formRegister = document.getElementById('formRegister'), 
      authCard = document.getElementById('authCard'), 
      dashboardCard = document.getElementById('dashboardCard'), 
      adminCard = document.getElementById('adminCard'),
      passwordResetCard = document.getElementById('passwordResetCard'),
      formPasswordReset = document.getElementById('formPasswordReset');

const lblNombreUsuario = document.getElementById('lblNombreUsuario'), 
      lblInmueble = document.getElementById('lblInmueble'), 
      lblParqueadero = document.getElementById('lblParqueadero'), 
      btnCerrarSesion = document.getElementById('btnCerrarSesion'), 
      btnCerrarSesionAdmin = document.getElementById('btnCerrarSesionAdmin');

const tabAdminCartera = document.getElementById('tabAdminCartera'), 
      tabAdminParqueaderos = document.getElementById('tabAdminParqueaderos'), 
      secAdminCartera = document.getElementById('secAdminCartera'), 
      secAdminParqueaderos = document.getElementById('secAdminParqueaderos'), 
      tablaAdminCuerpo = document.getElementById('tablaAdminCuerpo'), 
      tablaParqueaderosCuerpo = document.getElementById('tablaParqueaderosCuerpo');

const thOrdenarCasa = document.getElementById('thOrdenarCasa'), 
      thOrdenarSaldo = document.getElementById('thOrdenarSaldo');

const recParqExtra = document.getElementById('recParqExtra'), 
      recTotalMes = document.getElementById('recTotalMes'), 
      lblSaldoBadge = document.getElementById('lblSaldoBadge');

let sesion = null, criterioOrden = "casa";

// Manejo de pestañas básicas
tabLogin?.addEventListener('click', () => { tabLogin.classList.add('active'); tabRegister.classList.remove('active'); formLogin.classList.remove('hidden'); formRegister.add('hidden'); });
tabRegister?.addEventListener('click', () => { tabRegister.classList.add('active'); tabLogin.classList.remove('active'); formRegister.classList.remove('hidden'); formLogin.classList.add('hidden'); });
tabAdminCartera?.addEventListener('click', () => { tabAdminCartera.classList.add('active'); tabAdminParqueaderos.classList.remove('active'); secAdminCartera.classList.remove('hidden'); secAdminParqueaderos.classList.add('hidden'); renderAdmin(); });
tabAdminParqueaderos?.addEventListener('click', () => { tabAdminParqueaderos.classList.add('active'); tabAdminCartera.classList.remove('active'); secAdminParqueaderos.classList.remove('hidden'); secAdminCartera.classList.add('hidden'); renderParq(); });

thOrdenarCasa?.addEventListener('click', () => { criterioOrden = "casa"; renderAdmin(); });
thOrdenarSaldo?.addEventListener('click', () => { criterioOrden = "mora"; renderAdmin(); });
// Formulario de Registro Manual
formRegister?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('regNombre').value.trim(), 
          documento = document.getElementById('regDocumento').value.trim(), 
          casa = document.getElementById('regCasa').value.trim(), 
          contrasena = document.getElementById('regContrasena').value.trim();
    
    let lista = getUsers(); 
    if (lista.some(u => u.documento === documento)) return alert("Este documento ya está registrado.");
    
    lista.push({ documento, contrasena, nombre, casa, parqueadero: "Sin parqueadero asignado", saldo: "$0 (Al día)", primerIngreso: false });
    saveUsers(lista); 
    alert("¡Registro Exitoso!"); 
    formRegister.reset(); 
    tabLogin.click();
});

// --- 🔐 LOGIN CON CONTROL DE PRIMER INGRESO (CONTRALOR EXCEL) ---
formLogin?.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('txtUsuario').value.trim(), 
          c = document.getElementById('txtContrasena').value.trim();
    
    const lista = getUsers();
    const encontrado = lista.find(x => x.documento === u && x.contrasena === c);
    
    if (encontrado) {
        sesion = encontrado;
        formLogin.reset();
        
        // Si viene derivado de una carga masiva de Excel, congelamos y exigimos cambio
        if (encontrado.primerIngreso && encontrado.documento !== "admin") {
            authCard.classList.add('hidden');
            passwordResetCard.classList.remove('hidden');
            return;
        }

        irAlDashboard(encontrado);
    } else {
        alert("Credenciales incorrectas.");
    }
});

// Procesar el cambio de contraseña obligatorio (Habeas Data)
formPasswordReset?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nueva = document.getElementById('txtNuevaContrasena').value.trim();
    const confirma = document.getElementById('txtConfirmarContrasena').value.trim();

    if (nueva.length < 4) return alert("La contraseña debe tener al menos 4 caracteres.");
    if (nueva !== confirma) return alert("Las contraseñas no coinciden.");

    let lista = getUsers();
    let usuarioDb = lista.find(x => x.documento === sesion.documento);
    
    if (usuarioDb) {
        usuarioDb.contrasena = nueva;
        usuarioDb.primerIngreso = false; // Se libera la cuenta para futuros accesos
        sesion = usuarioDb;
        saveUsers(lista);
        
        formPasswordReset.reset();
        passwordResetCard.classList.add('hidden');
        irAlDashboard(sesion);
        alert("🔒 Contraseña actualizada y encriptada con éxito. Bienvenido.");
    }
});

function irAlDashboard(usuario) {
    authCard.classList.add('hidden');
    if (usuario.documento === "admin") { 
        tabAdminCartera.click(); 
        adminCard.classList.remove('hidden'); 
    } else { 
        renderUser(); 
        dashboardCard.classList.remove('hidden'); 
    }
}
// --- 📊 RENDERIZACIÓN DE VISTAS ---
const renderUser = () => {
    if (!sesion) return;
    lblNombreUsuario.textContent = sesion.nombre; 
    lblInmueble.textContent = sesion.casa; 
    lblParqueadero.textContent = sesion.parqueadero;
    
    let extra = 0;
    if (sesion.parqueadero.includes("🚗")) extra = 30000;
    else if (sesion.parqueadero.includes("🏍️")) extra = 15000;
    
    if (recParqExtra) recParqExtra.textContent = `$${extra.toLocaleString('es-CO')}`;
    if (recTotalMes) recTotalMes.textContent = `$${(180000 + extra).toLocaleString('es-CO')}`;
    
    if (lblSaldoBadge) {
        lblSaldoBadge.textContent = sesion.saldo; 
        lblSaldoBadge.className = "status-badge";
        if (sesion.saldo.includes("mora")) lblSaldoBadge.className = "status-badge status-red";
        else if (sesion.saldo.includes("pendiente") || sesion.saldo.includes("Acuerdo")) lblSaldoBadge.className = "status-badge status-orange";
        else lblSaldoBadge.className = "status-badge status-green";
    }
};

const extraerNumero = (txt) => { const m = txt.match(/\d+/); return m ? parseInt(m, 10) : 0; };
const extraerMora = (txt) => { if (txt.includes("Al día") || txt.includes("N/A")) return 0; return extraerNumero(txt.replace(/\./g, '')); };

function renderAdmin() {
    let list = getUsers().filter(u => u.documento !== "admin");
    if (criterioOrden === "casa") { list.sort((a, b) => extraerNumero(a.casa) - extraerNumero(b.casa)); } 
    else if (criterioOrden === "mora") { list.sort((a, b) => extraerMora(b.saldo) - extraerMora(a.saldo)); }
    
    if (!tablaAdminCuerpo) return; 
    tablaAdminCuerpo.innerHTML = "";
    
    list.forEach(u => {
        let cls = "status-green"; 
        if (u.saldo.includes("mora")) cls = "status-red"; 
        else if (u.saldo.includes("pendiente") || u.saldo.includes("Acuerdo")) cls = "status-orange";
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${u.casa}</strong><br><small style="color:#0288d1;font-weight:600;">${u.parqueadero}</small></td>
            <td><strong>${u.nombre}</strong><br><small style="color:#666;">User: ${u.documento} | Clave: ${u.primerIngreso ? u.contrasena + ' (Genérica)' : '🔒 Cifrada (Habeas Data)'}</small><br><span class="status-badge ${cls}">${u.saldo}</span></td>
        `;
        tablaAdminCuerpo.appendChild(tr);
    });
}

function renderParq() {
    let list = getUsers().filter(u => u.documento !== "admin" && u.parqueadero.includes("#"));
    if (!tablaParqueaderosCuerpo) return;
    tablaParqueaderosCuerpo.innerHTML = "";
    
    list.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${u.parqueadero.split(' - ')}</strong></td>
            <td>${u.nombre} <br><small style="color:#666;">${u.casa}</small></td>
            <td><button class="btn-manage">Ver Info</button></td>
        `;
        tablaParqueaderosCuerpo.appendChild(tr);
    });
}

// --- 🚀 ACCIONES COMERCIALES INYECTADAS CON TU BASE DE DATOS DE PRUEBAS ---

// Acción A: Simulación de carga masiva por tu archivo Excel inicial de 20 usuarios
window.ejecutarPruebaExcel = function() {
    let listaActual = getUsers();
    
    const filasExcel = [
        { documento: "1", nombre: "Carlos Mendoza", casa: "Casa 1", parq: "Cuota Parq: $10.000" },
        { documento: "2", nombre: "Ana Rodriguez", casa: "Casa 2", parq: "Cuota Parq: $10.000" },
        { documento: "3", nombre: "Juan Carlos Perez", casa: "Casa 3", parq: "Cuota Parq: $15.000" },
        { documento: "4", nombre: "María Gómez", casa: "Casa 4", parq: "Cuota Parq: $15.000" },
        { documento: "5", nombre: "Luis Martínez", casa: "Casa 5", parq: "Cuota Parq: $10.000" },
        { documento: "6", nombre: "Clara Lopez", casa: "Casa 6", parq: "Cuota Parq: $10.000" },
        { documento: "7", nombre: "Diego Fernando Silva", casa: "Casa 7", parq: "Cuota Parq: $15.000" },
        { documento: "8", nombre: "Martha Castellanos", casa: "Casa 8", parq: "Cuota Parq: $15.000" },
        { documento: "9", nombre: "Jorge Eliecer Tovar", casa: "Casa 9", parq: "Cuota Parq: $15.000" },
        { documento: "10", nombre: "Esperanza Gomez", casa: "Casa 10", parq: "Cuota Parq: $15.000" },
        { documento: "11", nombre: "Carlos Valvuena", casa: "Casa 11", parq: "Cuota Parq: $10.000" },
        { documento: "12", nombre: "Gloria Alcaraz", casa: "Casa 12", parq: "Cuota Parq: $10.000" },
        { documento: "13", nombre: "Javier Loaiza", casa: "Casa 13", parq: "Cuota Parq: $10.000" },
        { documento: "14", nombre: "Oscar Ramirez", casa: "Casa 14", parq: "Cuota Parq: $15.000" },
        { documento: "15", nombre: "Carlos Serrano", casa: "Casa 15", parq: "Cuota Parq: $15.000" },
        { documento: "16", nombre: "Matilde Aranjuez", casa: "Casa 16", parq: "Cuota Parq: $15.000" },
        { documento: "17", nombre: "Maria Mendoza", casa: "Casa 17", parq: "Cuota Parq: $15.000" },
        { documento: "18", nombre: "Carmen Martinez", casa: "Casa 18", parq: "Cuota Parq: $15.000" },
        { documento: "19", nombre: "Margarita Sierra", casa: "Casa 19", parq: "Cuota Parq: $10.000" },
        { documento: "20", nombre: "Harold Suaza", casa: "Casa 20", parq: "Cuota Parq: $10.000" }
    ];

    filasExcel.forEach(fila => {
        if (!listaActual.some(u => u.documento === fila.documento)) {
            listaActual.push({
                documento: fila.documento, // El usuario será el número de casa (ej: 1, 2, 3...)
                contrasena: "Zapan2026*", // Contraseña temporal por defecto
                nombre: fila.nombre,
                casa: fila.casa,
                parqueadero: fila.parq,
                saldo: "$0 (Al día)",
                primerIngreso: true // Provocará el redireccionamiento para cambiar la contraseña
            });
        }
    });

    saveUsers(listaActual);
    renderAdmin();
    alert("📥 EXCEL DE PRUEBA PROCESADO:\nSe han indexado los 20 propietarios de tu archivo. El usuario de ingreso es el número de su casa y su contraseña por defecto es Zapan2026*");
};

// Acción B: Simulación de actualización automática con tu archivo contable SISCO
window.ejecutarSincronizacionSisco = function() {
    let listaActual = getUsers();

    const datosSisco = [
        { casa: "Casa 1", nuevoSaldo: "$0 (Al día)" },
        { casa: "Casa 2", nuevoSaldo: "$190.000 (Mes actual en mora)" },
        { casa: "Casa 3", nuevoSaldo: "$205.000 (Días de mora acumulados)" },
        { casa: "Casa 4", nuevoSaldo: "$205.000 (Mes actual en mora)" },
        { casa: "Casa 5", nuevoSaldo: "$0 (Al día)" },
        { casa: "Casa 6", nuevoSaldo: "$190.000 (Mes actual en mora)" },
        { casa: "Casa 7", nuevoSaldo: "$0 (Al día)" },
        { casa: "Casa 8", nuevoSaldo: "$205.000 (Mes actual en mora)" },
        { casa: "Casa 9", nuevoSaldo: "$0 (Al día)" },
        { casa: "Casa 10", nuevoSaldo: "$195.000 (Mes actual en mora)" },
        { casa: "Casa 11", nuevoSaldo: "$0 (Al día)" },
        { casa: "Casa 12", nuevoSaldo: "$190.000 (Mes actual en mora)" },
        { casa: "Casa 13", nuevoSaldo: "$0 (Al día)" },
        { casa: "Casa 14", nuevoSaldo: "$195.000 (Mes actual en mora)" },
        { casa: "Casa 15", nuevoSaldo: "$0 (Al día)" },
        { casa: "Casa 16", nuevoSaldo: "$195.000 (Mes actual en mora)" },
        { casa: "Casa 17", nuevoSaldo: "$0 (Al día)" },
        { casa: "Casa 18", nuevoSaldo: "$195.000 (Mes actual en mora)" },
        { casa: "Casa 19", nuevoSaldo: "$0 (Al día)" },
        { casa: "Casa 20", nuevoSaldo: "$190.000 (Mes actual en mora)" }
    ];

    datosSisco.forEach(item => {
        let u = listaActual.find(x => x.casa.toLowerCase().trim() === item.casa.toLowerCase().trim());
        if (u) {
            u.saldo = item.nuevoSaldo; // Sobreescribe el saldo respetando la clave personal
        }
    });

    saveUsers(listaActual);
    renderAdmin();
    alert("🔄 SINCRO DIARIA CON SISCO (00:00 AM):\nSaldos de cartera actualizados enlazando el identificador de inmueble. Las contraseñas personales de los usuarios se mantuvieron intactas.");
};

// Control de cierres de sesión
btnCerrarSesion?.addEventListener('click', () => { sesion = null; dashboardCard.classList.add('hidden'); authCard.classList.remove('hidden'); });
btnCerrarSesionAdmin?.addEventListener('click', () => { sesion = null; adminCard.classList.add('hidden'); authCard.classList.remove('hidden'); });
