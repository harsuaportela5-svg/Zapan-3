// ==========================================================================
// 📦 SECCIÓN A: CONFIGURACIÓN INICIAL Y CONTROL DE PERSISTENCIA
// ==========================================================================
const cuentaAdministrador = [
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

// Comprobación y creación de la base de datos simulada en el navegador
if (!localStorage.getItem('usuariosPropietarios')) {
    localStorage.setItem('usuariosPropietarios', JSON.stringify(cuentaAdministrador));
}

const obtenerUsuarios = () => JSON.parse(localStorage.getItem('usuariosPropietarios')) || cuentaAdministrador;
const guardarUsuarios = (datos) => localStorage.setItem('usuariosPropietarios', JSON.stringify(datos));

// ==========================================================================
// 🎛️ SECCIÓN B: CAPTURA DE INTERRUPTORES Y PESTAÑAS DEL DOM
// ==========================================================================
const tabAdminCartera = document.getElementById('tabAdminCartera'), 
      tabAdminParqueaderos = document.getElementById('tabAdminParqueaderos'), 
      secAdminCartera = document.getElementById('secAdminCartera'), 
      secAdminParqueaderos = document.getElementById('secAdminParqueaderos'),
      btnCargarExcel = document.getElementById('btnProcesarExcel'),
      inputExcel = document.getElementById('archivoExcel');

tabAdminCartera?.addEventListener('click', () => { 
    tabAdminCartera.classList.add('active'); 
    tabAdminParqueaderos.classList.remove('active'); 
    secAdminCartera.classList.remove('hidden'); 
    secAdminParqueaderos.add('hidden'); 
});

tabAdminParqueaderos?.addEventListener('click', () => { 
    tabAdminParqueaderos.classList.add('active'); 
    tabAdminCartera.classList.remove('active'); 
    secAdminParqueaderos.classList.remove('hidden'); 
    secAdminCartera.classList.add('hidden'); 
});

// ==========================================================================
// 📥 SECCIÓN C: FUNCIÓN DE RENDERIZACIÓN SIN ERRORES DE SINTAXIS
// ==========================================================================
let sesion = cuentaAdministrador[0]; // Definición de sesión por defecto

const renderUser = () => {
    if (!sesion) return;
    
    const lblNombreUsuario = document.getElementById('lblNombreUsuario');
    const lblInmueble = document.getElementById('lblInmueble');
    if (lblNombreUsuario) lblNombreUsuario.textContent = sesion.nombre; 
    if (lblInmueble) lblInmueble.textContent = sesion.casa; 
    
    const targetParq = document.getElementById('lblParqueadero');
    if (targetParq) targetParq.textContent = sesion.parqueadero;
    
    let extra = 0;
    if (sesion.parqueadero.includes("🚗")) extra = 30000;
    else if (sesion.parqueadero.includes("🏍️")) extra = 15000;
    
    const recParqExtra = document.getElementById('recParqExtra');
    const recTotalMes = document.getElementById('recTotalMes');
    if (recParqExtra) recParqExtra.textContent = `$${extra.toLocaleString('es-CO')}`;
    if (recTotalMes) recTotalMes.textContent = `$${(180000 + extra).toLocaleString('es-CO')}`;
    
    const lblSaldoBadge = document.getElementById('lblSaldoBadge');
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
// 📥 SECCIÓN D: DECODIFICADOR EXCEL BINARIO E INTEGRACIÓN DE PROPIETARIOS
// ==========================================================================
btnCargarExcel?.addEventListener('click', () => {
    const archivosSeleccionados = inputExcel?.files;
    
    // Alerta protectora de campo nulo
    if (!archivosSeleccionados || archivosSeleccionados.length === 0) {
        return alert("Por favor, selecciona primero tu archivo corregido 'usuarios_limpios.xlsx'.");
    }

    const archivo = archivosSeleccionados[0];
    const lectorArchivo = new FileReader();

    lectorArchivo.onload = (evento) => {
        try {
            const bufferBinario = new Uint8Array(evento.target.result);
            
            // Decodificación de la estructura mediante la librería SheetJS del HTML
            const libroExcel = XLSX.read(bufferBinario, { type: 'array' });
            const nombreHoja = libroExcel.SheetNames[0];
            const contenidoHoja = libroExcel.Sheets[nombreHoja];
            
            // Conversión de matriz de celdas a objetos estructurados de base de datos
            const registrosJson = XLSX.utils.sheet_to_json(contenidoHoja);

            if (registrosJson.length === 0) {
                return alert("Error: El archivo de Excel no contiene ninguna fila válida.");
            }

            let baseDatosUsuarios = obtenerUsuarios();
            let contadorNuevosPropietarios = 0;
            
            registrosJson.forEach(columna => {
                // Filtro dinámico tolerante a mayúsculas/minúsculas de la primera fila
                const documentoId = String(columna['ID USUARIO'] || columna['id_usuario'] || columna['Cedula'] || columna['cedula'] || '').trim();
                const nombrePropietario = String(columna['Propietario'] || columna['propietario'] || '').trim();
                const numeroCasa = String(columna['Casa'] || columna['casa'] || '').trim();
                const claveAcceso = String(columna['CLAVE'] || columna['clave'] || 'ZAPAN3').trim();

                if (documentoId && nombrePropietario) {
                    // Verificación de duplicación de llaves primarias (Cédulas)
                    if (!baseDatosUsuarios.some(u => u.documento === documentoId)) {
                        baseDatosUsuarios.push({
                            documento: documentoId,
                            contrasena: claveAcceso,
                            nombre: nombrePropietario,
                            casa: "Casa " + numeroCasa,
                            parqueadero: "Sin parqueadero asignado",
                            saldo: "$0 (Al día)",
                            primerIngreso: true
                        });
                        contadorNuevosPropietarios++;
                    }
                }
            });

            // Guardado persistente local en el navegador
            guardarUsuarios(baseDatosUsuarios);
            alert(`¡Carga Exitosa! Se han procesado los datos binarios. Nuevos propietarios registrados: ${contadorNuevosPropietarios}`);
            
        } catch (error) {
            console.error("Detalle del fallo técnico de lectura:", error);
            alert("Ocurrió un error leyendo el archivo binario. Verifique el formato.");
        }
    };

    // Inicialización del lector de flujo binario
    lectorArchivo.readAsArrayBuffer(archivo);
});
