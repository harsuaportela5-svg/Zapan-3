const usuariosPredeterminados = [
    { documento: "1010101010", contrasena: "1234", nombre: "Carlos Mendoza", casa: "Casa 42 - Manzana B", saldo: "$0 (Al día)" },
    { documento: "admin", contrasena: "admin123", nombre: "Administración Central", casa: "Oficina Principal", saldo: "N/A" }
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
const lblSaldo = document.getElementById('lblSaldo');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

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
    
    const nuevoUsuario = { documento, contrasena, nombre, casa, saldo: "$0 (Cuenta Nueva)" };
    listaUsuarios.push(nuevoUsuario);
    localStorage.setItem('usuariosPropietarios', JSON.stringify(listaUsuarios));
    
    alert(`¡Registro Exitoso, ${nombre}! Ya puedes ingresar.`);
    formRegister.reset();
    tabLogin.click();
});

// Inicio de Sesión e inyección de datos en el Panel
formLogin?.addEventListener('submit', function(e) {
    e.preventDefault();
    const txtDocumento = document.getElementById('txtUsuario').value.trim();
    const txtContrasena = document.getElementById('txtContrasena').value.trim();
    
    const listaUsuarios = obtenerUsuarios();
    const usuarioEncontrado = listaUsuarios.find(u => u.documento === txtDocumento && u.contrasena === txtContrasena);
    
    if (usuarioEncontrado) {
        // 1. Inyectar datos dinámicos en el HTML
        lblNombreUsuario.textContent = usuarioEncontrado.nombre;
        lblInmueble.textContent = usuarioEncontrado.casa;
        lblSaldo.textContent = usuarioEncontrado.saldo;
        
        // 2. Ocultar Login y Mostrar Panel
        authCard.classList.add('hidden');
        dashboardCard.classList.remove('hidden');
        formLogin.reset();
    } else {
        alert("Error: Documento o contraseña incorrectos.");
    }
});

// Cerrar Sesión
btnCerrarSesion?.addEventListener('click', () => {
    dashboardCard.classList.add('hidden');
    authCard.classList.remove('hidden');
});
