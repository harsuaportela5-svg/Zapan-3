// Usuarios por defecto (Pre-cargados de fábrica para pruebas)
const usuariosPredeterminados = [
    { 
        documento: "1010101010", 
        contrasena: "1234", 
        nombre: "Carlos Mendoza", 
        casa: "Casa 42 - Manzana B", 
        parqueadero: "Parqueadero #42 (Privado) - Vehículo: XYZ-123",
        saldo: "$0 (Al día)" 
    },
    { 
        documento: "admin", 
        contrasena: "admin123", 
        nombre: "Administración Central", 
        casa: "Oficina Principal", 
        parqueadero: "Zonas de Visitantes (Control General)",
        saldo: "N/A" 
    }
];

// Inicializar la base de datos local en el navegador si no existe
if (!localStorage.getItem('usuariosPropietarios')) {
    localStorage.setItem('usuariosPropietarios', JSON.stringify(usuariosPredeterminados));
}

// Función para obtener la lista actualizada de usuarios desde LocalStorage
function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem('usuariosPropietarios'));
}

// Elementos de la interfaz (Estructura HTML)
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');
const authCard = document.getElementById('authCard');
const dashboardCard = document.getElementById('dashboardCard');

// Elementos del panel dinámico de usuario
const lblNombreUsuario = document.getElementById('lblNombreUsuario');
const lblInmueble = document.getElementById('lblInmueble');
const lblParqueadero = document.getElementById('lblParqueadero');
const lblSaldo = document.getElementById('lblSaldo');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

// Variable global para rastrear al propietario con sesión abierta
let usuarioSesionActiva = null;

// Intercambio de pestañas visuales (Ingresar / Registrarse)
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

// Lógica para registrar propietarios nuevos desde el formulario
formRegister?.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('regNombre').value.trim();
    const documento = document.getElementById('regDocumento').value.trim();
    const casa = document.getElementById('regCasa').value.trim();
    const contrasena = document.getElementById('regContrasena').value.trim();
    
    let listaUsuarios = obtenerUsuarios();
    
    // Validar si el documento ya está registrado en el almacenamiento local
    if (listaUsuarios.some(u => u.documento === documento)) {
        alert("El documento ingresado ya está registrado.");
        return;
    }
    
    // Asignar un número de parqueadero aleatorio provisional para la simulación
    const numParqueaderoAleatorio = Math.floor(Math.random() * 150) + 1;
    
    const nuevoUsuario = { 
        documento, 
        contrasena, 
        nombre, 
        casa, 
        parqueadero: `Parqueadero #${numParqueaderoAleatorio} (Asignado) - Sin Vehículo`,
        saldo: "$0 (Cuenta Nueva)" 
    };
    
    listaUsuarios.push(nuevoUsuario);
    localStorage.setItem('usuariosPropietarios', JSON.stringify(listaUsuarios));
    
    alert(`¡Registro Exitoso, ${nombre}! Parqueadero asignado temporalmente. Ya puedes ingresar.`);
    formRegister.reset();
    tabLogin.click(); // Redirige al login de inmediato
});

// Lógica para Validar el Inicio de Sesión
formLogin?.addEventListener('submit', function(e) {
    e.preventDefault();
    const txtDocumento = document.getElementById('txtUsuario').value.trim();
    const txtContrasena = document.getElementById('txtContrasena').value.trim();
    
    const listaUsuarios = obtenerUsuarios();
    const usuarioEncontrado = listaUsuarios.find(u => u.documento === txtDocumento && u.contrasena === txtContrasena);
    
    if (usuarioEncontrado) {
        usuarioSesionActiva = usuarioEncontrado;
        actualizarInterfazDashboard();
        
        // Transición visual: Oculta el login y despliega el panel privado
        authCard.classList.add('hidden');
        dashboardCard.classList.remove('hidden');
        formLogin.reset();
    } else {
        alert("Error: Documento o contraseña incorrectos.");
    }
});

// Función para renderizar los textos dinámicos del usuario en pantalla
function actualizarInterfazDashboard() {
    if (usuarioSesionActiva) {
        lblNombreUsuario.textContent = usuarioSesionActiva.nombre;
        lblInmueble.textContent = usuarioSesionActiva.casa;
        lblParqueadero.textContent = usuarioSesionActiva.parqueadero;
        lblSaldo.textContent = usuarioSesionActiva.saldo;
    }
}

// Función global corregida para registrar vehículos en tiempo real
window.registrarVehiculoSimulado = function() {
    const placa = prompt("Ingrese la placa del vehículo a registrar (Ej: ABC123):");
    if (!placa) return; // Salir si el usuario cancela el cuadro de diálogo
    
    let listaUsuarios = obtenerUsuarios();
    const index = listaUsuarios.findIndex(u => u.documento === usuarioSesionActiva.documento);
    
    if (index !== -1) {
        const parqueaderoActual = listaUsuarios[index].parqueadero;
        
        // Extraemos limpiamente el prefijo del parqueadero antes del separador " - "
        const parteParqueadero = parqueaderoActual.split(" - ")[0];
        
        // Inyectamos el nuevo formato de cadena limpia
        listaUsuarios[index].parqueadero = `${parteParqueadero} - Vehículo: ${placa.toUpperCase()}`;
        
        // Sincronizamos la base de datos local del navegador
        localStorage.setItem('usuariosPropietarios', JSON.stringify(listaUsuarios));
        
        // Actualizamos la sesión en memoria y refrescamos la vista del cliente
        usuarioSesionActiva = listaUsuarios[index];
        actualizarInterfazDashboard();
        
        alert(`¡Vehículo con placa ${placa.toUpperCase()} autorizado exitosamente en su parqueadero!`);
    }
};

// Lógica del botón Cerrar Sesión
btnCerrarSesion?.addEventListener('click', () => {
    usuarioSesionActiva = null;
    dashboardCard.classList.add('hidden');
    authCard.classList.remove('hidden');
});
