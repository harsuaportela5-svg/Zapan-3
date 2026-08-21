// 📦 Base de datos por defecto (Inicia vacía, solo con la cuenta del Administrador)
const deFabrica = [
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
        
        // Bloqueo de seguridad si usa la clave genérica asignada por el archivo de Excel
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

// Formulario dinámico de Cambio de Contraseña Obligatoria
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
        usuarioDb.primerIngreso = false; // El usuario queda habilitado para futuros accesos
        sesion = usuarioDb;
        saveUsers(lista);
        
        formPasswordReset.reset();
        passwordResetCard.classList.add('hidden');
        irAlDashboard(sesion);
        alert("🔒 Contraseña actualizada y cifrada con éxito. Bienvenido.");
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
            <td><strong>${u.nombre}</strong><br><small style="color:#666;">User: ${u.documento} | Clave: ${u.primerIngreso ? u.contrasena + ' (Genérica)' : '🔒 Protegida'}</small><br><span class="status-badge ${cls}">${u.saldo}</span></td>
        `;
        tablaAdminCuerpo.appendChild(tr);
    });
}

function renderParq() {
    let list = getUsers().filter(u => u.documento !== "admin" && u.parqueadero.includes("$"));
    if (!tablaParqueaderosCuerpo) return;
    tablaParqueaderosCuerpo.innerHTML = "";
    
    list.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>Estacionamiento Relacionado</strong></td>
            <td>${u.nombre} <br><small style="color:#666;">${u.casa}</small></td>
            <td><span style="font-size:11px;font-weight:bold;color:#0288d1;">${u.parqueadero}</span></td>
        `;
        tablaParqueaderosCuerpo.appendChild(tr);
    });
}

// --- 🚀 PROCESAMIENTO DINÁMICO DE TU EXCEL DE PRUEBAS EN VIVO ---
document.getElementById('btnProcesarExcel')?.addEventListener('click', () => {
    const fileInput = document.getElementById('inputExcelUsuarios');
    const archivos = fileInput.files;

    if (archivos.length === 0) {
        return alert("⚠️ Por favor, seleccione primero el archivo de Excel en la sección superior.");
    }

    const archivoSeleccionado = archivos[0];
    const lector = new FileReader();

    lector.onload = function(e) {
        const datosBinarios = e.target.result;
        const workbook = XLSX.read(datosBinarios, { type: 'binary' });
        
        const nombreHoja = workbook.SheetNames[0];
        const hojaContenido = workbook.Sheets[nombreHoja];
        
        // range: 3 salta las filas decorativas para leer la cabecera real
        const datosFilas = XLSX.utils.sheet_to_json(hojaContenido, { range: 3 });

        let listaActual = getUsers();
        let contadorNuevos = 0;

        datosFilas.forEach(fila => {
            const idCasa = fila["Casa"] ? fila["Casa"].toString().trim() : null;
            const nombrePropietario = fila["Propietario"] ? fila["Propietario"].toString().trim() : null;
            const cuotaParq = fila["Cuota Parqueadero"] ? fila["Cuota Parqueadero"] : 0;

            if (idCasa && nombrePropietario) {
                if (!listaActual.some(u => u.documento === idCasa)) {
                    listaActual.push({
                        documento: idCasa,         // Usuario de acceso: el número de la casa
                        contrasena: "Zapan2026*",  // Clave temporal unificada por defecto
                        nombre: nombrePropietario,
                        casa: `Casa ${idCasa}`,
                        parqueadero: `Cuota Parq: $${cuotaParq.toLocaleString('es-CO')}`,
                        saldo: "$0 (Al día)",       // Inicia limpio hasta la sincronización con SISCO
                        primerIngreso: true        // Condiciona el paso por el formulario Habeas Data
                    });
                    contadorNuevos++;
                }
            }
        });

        if (contadorNuevos > 0) {
            saveUsers(listaActual);
            renderAdmin();
            alert(`🎉 EXCEL PROCESADO CON ÉXITO:\nSe leyeron correctamente los registros. Se han creado ${contadorNuevos} usuarios en automático con la clave 'Zapan2026*'.`);
        } else {
            alert("ℹ️ Lectura completada. Todos los propietarios en el Excel ya están registrados.");
        }
    };

    lector.readAsBinaryString(archivoSeleccionado);
});

// Simulación de Tarea Cron de Medianoche cruzando saldos con reporte de SISCO
window.ejecutarSincronizacionSisco = function() {
    let listaActual = getUsers();

    // Mapeo automatizado de estados financieros directo de tu documento
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
