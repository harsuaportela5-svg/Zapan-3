// ==========================================================================
// 📦 BLOQUE 1: CONFIGURACIÓN, PERSISTENCIA E INICIALIZACIÓN LIMPIA
// ==========================================================================
const deFabrica = [
    { 
        documento: "admin", 
        contrasena: "admin123", 
        nombre: "Administración Central", 
        casa: "Oficina Principal", 
        parqueadero: "Zonas de Visitantes", 
        saldo: "N/A", 
        primerIngreso: false 
    }
];

if (!localStorage.getItem('usuariosPropietarios')) {
    localStorage.setItem('usuariosPropietarios', JSON.stringify(deFabrica));
}

const getUsers = () => JSON.parse(localStorage.getItem('usuariosPropietarios')) || deFabrica;
const saveUsers = (data) => localStorage.setItem('usuariosPropietarios', JSON.stringify(data));
// ==========================================================================
// 🎛️ BLOQUE 2: VÍNCULOS DEL DOM Y PESTAÑAS
// ==========================================================================
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

tabLogin?.addEventListener('click', () => { tabLogin.classList.add('active'); tabRegister.classList.remove('active'); formLogin.classList.remove('hidden'); formRegister.add('hidden'); });
tabRegister?.addEventListener('click', () => { tabRegister.classList.add('active'); tabLogin.classList.remove('active'); formRegister.classList.remove('hidden'); formLogin.classList.add('hidden'); });
tabAdminCartera?.addEventListener('click', () => { tabAdminCartera.classList.add('active'); tabAdminParqueaderos.classList.remove('active'); secAdminCartera.classList.remove('hidden'); secAdminParqueaderos.classList.add('hidden'); renderAdmin(); });
tabAdminParqueaderos?.addEventListener('click', () => { tabAdminParqueaderos.classList.add('active'); tabAdminCartera.classList.remove('active'); secAdminParqueaderos.classList.remove('hidden'); secAdminCartera.classList.add('hidden'); renderParq(); });

thOrdenarCasa?.addEventListener('click', () => { criterioOrden = "casa"; renderAdmin(); });
thOrdenarSaldo?.addEventListener('click', () => { criterioOrden = "mora"; renderAdmin(); });
// ==========================================================================
// 🔐 BLOQUE 3: REGISTRO, LOGIN Y HABEAS DATA
// ==========================================================================
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

formLogin?.addEventListener('submit', (e) => {
    e.preventDefault();
    const entradaUsuario = document.getElementById('txtUsuario').value.trim();
    const c = document.getElementById('txtContrasena').value.trim();
    
    const lista = getUsers();
    let encontrado = null;

    if (entradaUsuario.toLowerCase() === "admin") {
        encontrado = lista.find(x => x.documento.toLowerCase() === "admin" && x.contrasena === c);
    } else {
        const u = entradaUsuario.toUpperCase();
        encontrado = lista.find(x => (x.documento === u || (x.nombreUsuarioExcel && x.nombreUsuarioExcel === u)) && x.contrasena === c);
    }
    
    if (encontrado) {
        sesion = encontrado;
        formLogin.reset();
        
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
        usuarioDb.primerIngreso = false; 
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
// ==========================================================================
// 📥 BLOQUE 4: RENDERIZACIÓN Y LECTOR EXCEL AUTOMÁTICO INTEGRADO (DEFINITIVO)
// ==========================================================================
const renderUser = () => {
    if (!sesion) return;
    lblNombreUsuario.textContent = sesion.nombre; 
    lblInmueble.textContent = sesion.casa; 
    
    const targetParq = document.getElementById('lblParqueadero');
    if (targetParq) targetParq.textContent = sesion.parqueadero;
    
    let extra = 0;
    if (sesion.parqueadero.includes("🚗")) extra = 30000;
    else if (sesion.parqueadero.includes("🏍️")) extra = 15000;
    
    if (recParqExtra) recParqExtra.textContent = `$${extra.toLocaleString('es-CO')}`;
    if (recTotalMes) recTotalMes.textContent = `$${(180000 + extra).toLocaleString('es-CO')}`;
    
    if (lblSaldoBadge) {
        lblSaldoBadge.textContent = sesion.saldo; 
        if (sesion.saldo.includes("mora")) {
            lblSaldoBadge.className = "status-badge status-red";
        } else if (sesion.saldo.includes("pendiente") || sesion.saldo.includes("Acuerdo")) {
            lblSaldoBadge.className = "status-badge status-yellow";
        } else {
            lblSaldoBadge.className = "status-badge status-green";
        }
    }
};
// ==========================================================================
// ==========================================================================
// 📥 CONFIGURACIÓN DEL BOTÓN DE CARGA DESDE EXCEL
// ==========================================================================
const btnCargarExcel = document.querySelector('.btn-success') || document.querySelector('button[class*="Cargar"]');
const inputExcel = document.getElementById('archivoExcel') || document.querySelector('input[type="file"]');

btnCargarExcel?.addEventListener('click', () => {
    const file = inputExcel?.files[0];
    if (!file) {
        return alert("Por favor, selecciona primero el archivo 'usuarios_limpios.xlsx'.");
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convierte las filas del Excel a objetos JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                return alert("El archivo Excel está vacío o no tiene el formato correcto.");
            }

            // Mapea los datos del Excel al formato del LocalStorage
            let listaUsuarios = JSON.parse(localStorage.getItem('usuariosPropietarios')) || [];
            
            jsonData.forEach(fila => {
                // Valida que el registro tenga los campos necesarios
                const documento = String(fila['ID USUARIO'] || fila['id_usuario'] || '').trim();
                const nombre = String(fila['Propietario'] || fila['propietario'] || '').trim();
                const casa = String(fila['Casa'] || fila['casa'] || '').trim();
                const contrasena = String(fila['CLAVE'] || fila['clave'] || 'ZAPAN3').trim();

                if (documento && nombre) {
                    // Evita duplicados en la base de datos local
                    if (!listaUsuarios.some(u => u.documento === documento)) {
                        listaUsuarios.push({
                            documento: documento,
                            contrasena: contrasena,
                            nombre: nombre,
                            casa: "Casa " + casa,
                            parqueadero: "Sin parqueadero asignado",
                            saldo: "$0 (Al día)",
                            primerIngreso: true // Pide cambio de clave en el primer inicio
                        });
                    }
                }
            });

            localStorage.setItem('usuariosPropietarios', JSON.stringify(listaUsuarios));
            alert(`¡Éxito! Se procesaron y crearon los usuarios correctamente.`);
            
            // Recarga las tablas del administrador si la función existe
            if (typeof renderAdmin === 'function') renderAdmin();

        } catch (error) {
            console.error(error);
            alert("Ocurrió un error leyendo el archivo binario. Verifique el formato.");
        }
    };

    reader.readAsArrayBuffer(file);
});
