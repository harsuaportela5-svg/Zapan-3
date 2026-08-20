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

// Elementos del panel de usuario
const lblNombreUsuario = document.getElementById('lblNombreUsuario');
const lblInmueble = document.getElementById('lblInmueble');
const lblParqueadero = document.getElementById('lblParqueadero');
const lblSaldo = document.getElementById('lblSaldo');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

// Variable global para mantener el rastro del usuario logueado en la sesión actual
let usuarioSesionActiva = null;

// Cambiar de pestañas
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

// Registro de usuarios nuevos
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
    
    // Asignar un número de parqueadero aleatorio de prueba al registrarse
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
    tabLogin.click();
});

// Inicio de Sesión
formLogin?.addEventListener('submit', function(e) {
    e.preventDefault();
    const txtDocumento = document.getElementById('txtUsuario').value.trim();
    const txtContrasena = document.getElementById('txtContrasena').value.trim();
    
    const listaUsuarios = obtenerUsuarios();
    const usuarioEncontrado = listaUsuarios.find(u => u.documento === txtDocumento && u.contrasena === txtContrasena);
    
    if (usuarioEncontrado) {
        usuarioSesionActiva = usuarioEncontrado;
        actualizarInterfazDashboard();
        
        authCard.classList.add('hidden');
        dashboardCard.classList.remove('hidden');
        formLogin.reset();
    } else {
        alert("Error: Documento o contraseña incorrectos.");
    }
});

// Función para refrescar los textos en pantalla
function actualizarInterfazDashboard() {
    if (usuarioSesionActiva) {
        lblNombreUsuario.textContent = usuarioSesionActiva.nombre;
        lblInmueble.textContent = usuarioSesionActiva.casa;
        lblParqueadero.textContent = usuarioSesionActiva.parqueadero;
        lblSaldo.textContent = usuarioSesionActiva.saldo;
    }
}

// Simulación de Registro de Vehículo desde el panel
window.registrarVehiculoSimulado = function() {
    const placa = prompt("Ingrese la placa del vehículo a registrar (Ej: ABC123):");
    if (!placa) return;
    
    let listaUsuarios = obtenerUsuarios();
    // Encontrar al usuario en la base de datos real del LocalStorage
    const index = listaUsuarios.findIndex(u => u.documento === usuarioSesionActiva.documento);
    
    if (index !== -1) {
        // Extraer solo la parte del número del parqueadero original
        const parteParqueadero = listaUsuarios[index].parqueadero.split(" - ")[0];
        listaUsuarios[index].parqueadero = `${parteParqueadero} - Vehículo: ${placa.toUpperCase()}`;
        
        // Guardar cambios en el almacenamiento del navegador
        localStorage.setItem('usuariosPropietarios', JSON.stringify(listaUsuarios));
        
        // Actualizar la sesión activa y la pantalla
        usuarioSesionActiva = listaUsuarios[index];
        actualizarInterfazDashboard();
        
        alert("¡Vehículo autorizado y registrado exitosamente en su parqueadero!");
    }
};

// Cerrar Sesión
btnCerrarSesion?.addEventListener('click', () => {
    usuarioSesionActiva = null;
    dashboardCard.classList.add('hidden');
    authCard.classList.remove('hidden');
});
