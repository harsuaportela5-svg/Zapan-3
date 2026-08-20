// Usuarios por defecto (Pre-cargados de fábrica)
const usuariosPredeterminados = [
    { documento: "1010101010", contrasena: "1234", nombre: "Carlos Mendoza", casa: "Casa 42 - Manzana B", saldo: "$0 (Al día)" },
    { documento: "admin", contrasena: "admin123", nombre: "Administración Central", casa: "Oficina Principal", saldo: "N/A" }
];

// Inicializar la base de datos local en el navegador
if (!localStorage.getItem('usuariosPropietarios')) {
    localStorage.setItem('usuariosPropietarios', JSON.stringify(usuariosPredeterminados));
}

// Obtener lista completa de usuarios (fijos + registrados)
function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem('usuariosPropietarios'));
}

// Intercambio de pestañas visuales (Login / Registro)
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');

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

// Lógica de Registro de Usuario Nuevo
formRegister?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('regNombre').value.trim();
    const documento = document.getElementById('regDocumento').value.trim();
    const casa = document.getElementById('regCasa').value.trim();
    const contrasena = document.getElementById('regContrasena').value.trim();
    
    let listaUsuarios = obtenerUsuarios();
    
    // Validar si el documento ya se registró
    if (listaUsuarios.some(u => u.documento === documento)) {
        alert("El documento ingresado ya está registrado en el sistema.");
        return;
    }
    
    // Crear el nuevo objeto de propietario simulado
    const nuevoUsuario = {
        documento: documento,
        contrasena: contrasena,
        nombre: nombre,
        casa: casa,
        saldo: "$0 (Cuenta Nueva)"
    };
    
    listaUsuarios.push(nuevoUsuario);
    localStorage.setItem('usuariosPropietarios', JSON.stringify(listaUsuarios));
    
    alert(`¡Registro Exitoso!\nBienvenido ${nombre}.\nYa puedes iniciar sesión en la pestaña Ingresar.`);
    formRegister.reset();
    tabLogin.click(); // Redirige al login automáticamente
});

// Lógica de Inicio de Sesión
formLogin?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const txtDocumento = document.getElementById('txtUsuario').value.trim();
    const txtContrasena = document.getElementById('txtContrasena').value.trim();
    
    const listaUsuarios = obtenerUsuarios();
    const usuarioEncontrado = listaUsuarios.find(u => u.documento === txtDocumento && u.contrasena === txtContrasena);
    
    if (usuarioEncontrado) {
        alert(`¡Sesión Iniciada!\n\nPropietario: ${usuarioEncontrado.nombre}\nInmueble: ${usuarioEncontrado.casa}\nEstado de cuenta: ${usuarioEncontrado.saldo}`);
    } else {
        alert("Error: Documento o contraseña incorrectos.");
    }
});
