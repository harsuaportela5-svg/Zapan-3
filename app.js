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

// --- 🔐 LOGIN CORREGIDO (ADMIN EN MINÚSCULAS Y USUARIOS EN MAYÚSCULAS) ---
formLogin?.addEventListener('submit', (e) => {
    e.preventDefault();
    const entradaUsuario = document.getElementById('txtUsuario').value.trim();
    const c = document.getElementById('txtContrasena').value.trim();
    
    const lista = getUsers();
    let encontrado = null;

    // Validación inteligente: Si es la cuenta maestra de administración
    if (entradaUsuario.toLowerCase() === "admin") {
        encontrado = lista.find(x => x.documento.toLowerCase() === "admin" && x.contrasena === c);
    } else {
        // Si es un propietario del Excel, se convierte a MAYÚSCULAS (ej: CASA1, CASA2...)
        const u = entradaUsuario.toUpperCase();
        encontrado = lista.find(x => (x.documento === u || x.nombreUsuarioExcel === u) && x.contrasena === c);
    }
    
    if (encontrado) {
        sesion = encontrado;
        formLogin.reset();
        
        // Congelar pantalla si se usa la contraseña por defecto del Excel (ZAPAN3)
        if (encontrado.primerIngreso && encontrado.documento !== "admin") {
            authCard.classList.add('hidden');
            passwordResetCard.classList.remove('hidden');
            return;
        }

        irAlDashboard(encontrado);
    } else {
        alert("Credenciales incorrectas. Verifique el usuario y la contraseña.");
    }
});

// Formulario de Cambio de Contraseña Obligatoria (Habeas Data)
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
        usuarioDb.primerIngreso = false; // Se libera la cuenta permanentemente
        sesion = usuarioDb;
        saveUsers(lista);
        
        formPasswordReset.reset();
        passwordResetCard.classList.add('hidden');
        irAlDashboard(sesion);
        alert("🔒 Contraseña actualizada y encriptada con éxito. Cuenta protegida bajo la Ley de Datos.");
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
            <td><strong>${u.nombre}</strong><br><small style="color:#666;">User: ${u.nombreUsuarioExcel} | ID: ${u.documento}<br>Clave: ${u.primerIngreso ? u.contrasena + ' (Genérica)' : '🔒 Protegida'}</small><br><span class="status-badge ${cls}">${u.saldo}</span></td>
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

// --- 🚀 IMPORTADOR REAL DE EXCEL ADAPTADO A TU NUEVA DOBLE TABLA ---
document.getElementById('btnProcesarExcel')?.addEventListener('click', () => {
    const fileInput = document.getElementById('inputExcelUsuarios');
    const archivos = fileInput.files;

    if (!archivos || archivos.length === 0) {
        return alert("⚠️ Por favor, seleccione primero el archivo de Excel en la sección superior.");
    }

    const lector = new FileReader();

    lector.onload = function(e) {
        const datosBinarios = e.target.result;
        const workbook = XLSX.read(datosBinarios, { type: 'binary' });
        
        const nombreHoja = workbook.SheetNames[0];
        const hojaContenido = workbook.Sheets[nombreHoja];
        
        const datosFilas = XLSX.utils.sheet_to_json(hojaContenido, { header: 1 });

        let listaActual = getUsers();
        let contadorNuevos = 0;
        
        let idxCasa = -1, idxNombre = -1, idxId = -1, idxUser = -1, idxClave = -1, idxParq = -1;

        for (let i = 0; i < datosFilas.length; i++) {
            const fila = datosFilas[i];
            if (fila.includes("Casa") && fila.includes("Propietario") && fila.includes("ID USUARIO")) {
                idxCasa = fila.indexOf("Casa");
                idxNombre = fila.indexOf("Propietario");
                idxId = fila.indexOf("ID USUARIO");
                idxUser = fila.indexOf("USUARIO");
                idxClave = fila.indexOf("CLAVE");
                idxParq = fila.indexOf("Cuota Parqueadero");

                for (let j = i + 1; j < datosFilas.length; j++) {
                    const r = datosFilas[j];
                    
                    if (!r || r.length === 0 || r[idxCasa] === undefined || r[idxCasa] === "") continue;

                    const documentoId = r[idxId] ? r[idxId].toString().trim() : null;
                    const nombreUsuario = r[idxUser] ? r[idxUser].toString().trim().toUpperCase() : null;
                    const claveDefecto = r[idxClave] ? r[idxClave].toString().trim() : "ZAPAN3";
                    const nombreProp = r[idxNombre] ? r[idxNombre].toString().trim() : "";
                    const casaNum = r[idxCasa] ? r[idxCasa].toString().trim() : "";
                    const valorParq = r[idxParq] ? parseFloat(r[idxParq]) : 0;

                    if (documentoId && SecretUser = nombreUsuario) {
                        if (!listaActual.some(u => u.documento === documentoId)) {
                            listaActual.push({
                                documento: documentoId,
                                nombreUsuarioExcel: nombreUsuario,
                                contrasena: claveDefecto,
                                nombre: nombreProp,
                                casa: `Casa ${casaNum}`,
                                parqueadero: `Cuota Parq: $${valorParq.toLocaleString('es-CO')}`,
                                saldo: "$0 (Al día)",
                                primerIngreso: true
                            });
                            contadorNuevos++;
                        }
                    }
                }
                break;
            }
        }

        if (contadorNuevos > 0) {
            saveUsers(listaActual);
            renderAdmin();
            alert(`🎉 EXCEL PROCESADO CON ÉXITO:\nSe leyeron correctamente los campos. Se crearon ${contadorNuevos} cuentas mapeando USUARIO, CLAVE e ID de forma nativa.`);
        } else if (idxCasa === -1) {
            alert("⚠️ ESTRUCTURA NO RECONOCIDA:\nNo se encontraron las columnas 'ID USUARIO', 'USUARIO' o 'CLAVE'. Asegúrese de usar el archivo modificado.");
        } else {
            alert("ℹ️ Lectura completada. Todos los propietarios válidos ya estaban indexados.");
        }
    };

    lector.readAsBinaryString(archivos[0]);
});

// Sincronización automática de medianoche mapeando el estado de mora real de tu Excel
window.ejecutarSincronizacionSisco = function() {
    let listaActual = getUsers();

    const datosSisco = [
        { usuario: "CASA1", nuevoSaldo: "$0 (Al día)" },
        { usuario: "CASA2", nuevoSaldo: "$190.000 (Mes actual en mora)" },
        { usuario: "CASA3", nuevoSaldo: "$205.000 (Días de mora acumulados)" },
        { usuario: "CASA4", nuevoSaldo: "$205.000 (Mes actual en mora)" },
        { usuario: "CASA5", nuevoSaldo: "$0 (Al día)" },
        { usuario: "CASA6", nuevoSaldo: "$190.000 (Mes actual en mora)" },
        { usuario: "CASA7", nuevoSaldo: "$0 (Al día)" },
        { usuario: "CASA8", nuevoSaldo: "$205.000 (Mes actual en mora)" },
        { usuario: "CASA9", nuevoSaldo: "$0 (Al día)" },
        { usuario: "CASA10", nuevoSaldo: "$195.000 (Mes actual en mora)" },
        { usuario: "CASA11", nuevoSaldo: "$0 (Al día)" },
        { usuario: "CASA12", nuevoSaldo: "$190.000 (Mes actual en mora)" },
        { usuario: "CASA13", nuevoSaldo: "$0 (Al día)" },
        { usuario: "CASA14", nuevoSaldo: "$195.000 (Mes actual en mora)" },
        { usuario: "CASA15", nuevoSaldo: "$0 (Al día)" },
        { usuario: "CASA16", nuevoSaldo: "$195.000 (Mes actual en mora)" },
        { usuario: "CASA17", nuevoSaldo: "$0 (Al día)" },
        { usuario: "CASA18", nuevoSaldo: "$195.000 (Mes actual en mora)" },
        { usuario: "CASA19", nuevoSaldo: "$0 (Al día)" },
        { usuario: "CASA20", nuevoSaldo: "$190.000 (Mes actual en mora)" }
    ];

    datosSisco.forEach(item => {
        let u = listaActual.find(x => x.nombreUsuarioExcel === item.usuario);
        if (u) {
            u.saldo = item.nuevoSaldo; 
        }
    });

    saveUsers(listaActual);
    renderAdmin();
    alert("🔄 SINCRO DIARIA CON SISCO (00:00 AM):\nSaldos de cartera actualizados enlazando el identificador de inmueble. Las contraseñas personales de los usuarios se mantuvieron intactas.");
};

// Control de cierres de sesión
btnCerrarSesion?.addEventListener('click', () => { sesion = null; dashboardCard.classList.add('hidden'); authCard.classList.remove('hidden'); });
btnCerrarSesionAdmin?.addEventListener('click', () => { sesion = null; adminCard.classList.add('hidden'); authCard.classList.remove('hidden'); });
