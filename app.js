// ==========================================================================
// 📦 SECCIÓN A: PERSISTENCIA LOCAL (LOCALSTORAGE) E INICIALIZACIÓN
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

// Configura la base de datos simulada la primera vez
if (!localStorage.getItem('usuariosPropietarios')) {
    localStorage.setItem('usuariosPropietarios', JSON.stringify(cuentaAdministrador));
}

const obtenerUsuarios = () => JSON.parse(localStorage.getItem('usuariosPropietarios')) || cuentaAdministrador;
const guardarUsuarios = (datos) => localStorage.setItem('usuariosPropietarios', JSON.stringify(datos));

// ==========================================================================
// 🎛️ SECCIÓN B: INTERRUPTORES DE PESTAÑAS (DOM)
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
    secAdminParqueaderos.classList.add('hidden'); 
});

tabAdminParqueaderos?.addEventListener('click', () => { 
    tabAdminParqueaderos.classList.add('active'); 
    tabAdminCartera.classList.remove('active'); 
    secAdminParqueaderos.classList.remove('hidden'); 
    secAdminCartera.classList.add('hidden'); 
});

// ==========================================================================
// 📥 SECCIÓN C: PROCESADOR EXCEL BINARIO E INTEGRACIÓN DE DATOS
// ==========================================================================
btnCargarExcel?.addEventListener('click', () => {
    const archivosSeleccionados = inputExcel?.files;
    
    // Alerta de validación inicial
    if (!archivosSeleccionados || archivosSeleccionados.length === 0) {
        return alert("Por favor, selecciona primero tu archivo corregido 'usuarios_limpios.xlsx'.");
    }

    const archivo = archivosSeleccionados[0];
    const lectorArchivo = new FileReader();

    lectorArchivo.onload = (evento) => {
        try {
            const bufferBinario = new Uint8Array(evento.target.result);
            const libroExcel = XLSX.read(bufferBinario, { type: 'array' });
            
            // Accede a la primera pestaña de la hoja de cálculo
            const nombreHoja = libroExcel.SheetNames[0];
            const contenidoHoja = libroExcel.Sheets[nombreHoja];
            
            // Mapea la estructura binaria a objetos legibles de JavaScript (JSON)
            const registrosJson = XLSX.utils.sheet_to_json(contenidoHoja);

            if (registrosJson.length === 0) {
                return alert("Error: El archivo de Excel no contiene ninguna fila válida.");
            }

            let baseDatosUsuarios = obtenerUsuarios();
            let contadorNuevosPropietarios = 0;
            
            registrosJson.forEach(columna => {
                // Filtro dinámico compatible con mayúsculas/minúsculas o variaciones de nombres
                const documentoId = String(columna['ID USUARIO'] || columna['id_usuario'] || columna['Cedula'] || '').trim();
                const nombrePropietario = String(columna['Propietario'] || columna['propietario'] || '').trim();
                const numeroCasa = String(columna['Casa'] || columna['casa'] || '').trim();
                const claveAcceso = String(columna['CLAVE'] || columna['clave'] || 'ZAPAN3').trim();

                // Registra el propietario si cuenta con cédula y nombre completos
                if (documentoId && nombrePropietario) {
                    // Evita duplicidades validando si la cédula ya existe en LocalStorage
                    if (!baseDatosUsuarios.some(u => u.documento === documentoId)) {
                        baseDatosUsuarios.push({
                            documento: documentoId,
                            contrasena: claveAcceso,
                            nombre: nombrePropietario,
                            casa: "Casa " + numeroCasa,
                            parqueadero: "Sin parqueadero asignado",
                            saldo: "$0 (Al día)",
                            primerIngreso: true // Solicita cambio de clave por seguridad en su primer login
                        });
                        contadorNuevosPropietarios++;
                    }
                }
            });

            // Guarda los cambios actualizados en el navegador
            guardarUsuarios(baseDatosUsuarios);
            alert(`¡Carga Exitosa! Se ha procesado el archivo binario. Propietarios nuevos registrados: ${contadorNuevosPropietarios}`);
            
        } catch (error) {
            console.error("Detalle del fallo en la lectura binaria:", error);
            alert("Ocurrió un error leyendo el archivo binario. Verifique el formato.");
        }
    };

    // Inicia la conversión binaria segura del archivo Excel
    lectorArchivo.readAsArrayBuffer(archivo);
});
