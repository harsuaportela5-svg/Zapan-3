const deFabrica = [
    { documento: "1010101010", contrasena: "1234", nombre: "Carlos Mendoza", casa: "Casa 42 - Manzana B", parqueadero: "Parqueadero #42 (Privado) - Vehículo: XYZ-123", saldo: "$0 (Al día)" },
    { documento: "80123456", contrasena: "clave1", nombre: "María Consuelo Pinzón", casa: "Casa 105 - Manzana F", parqueadero: "Parqueadero #105 (Privado) - Sin Vehículo", saldo: "$180.000 (Mes actual pendiente)" },
    { documento: "1022394857", contrasena: "clave2", nombre: "Andrés Felipe Ospina", casa: "Casa 12 - Manzana A", parqueadero: "Sin parqueadero asignado", saldo: "$0 (Al día)" },
    { documento: "52345678", contrasena: "clave3", nombre: "Diana Marcela Pinto", casa: "Casa 112 - Manzana G", parqueadero: "Parqueadero #112 (Privado) - Vehículo: KGV-456", saldo: "$360.000 (2 meses en mora)" },
    { documento: "1013456789", contrasena: "clave4", nombre: "Jorge Eliecer Silva", casa: "Casa 67 - Manzana C", parqueadero: "Parqueadero #67 (Privado) - Vehículo: MNO-789", saldo: "$0 (Al día)" },
    { documento: "39765432", contrasena: "clave5", nombre: "Sandra Milena Gómez", casa: "Casa 89 - Manzana D", parqueadero: "Parqueadero #89 (Privado) - Sin Vehículo", saldo: "$180.000 (Mes actual pendiente)" },
    { documento: "1030987654", contrasena: "clave6", nombre: "Ricardo Antonio Cruz", casa: "Casa 5 - Manzana A", parqueadero: "Parqueadero #5 (Privado) - Vehículo: DFG-321", saldo: "$0 (Al día)" },
    { documento: "21456789", contrasena: "clave7", nombre: "Claudia Patricia Rey", casa: "Casa 143 - Manzana H", parqueadero: "Sin parqueadero asignado", saldo: "$540.000 (Acuerdo de pago activo)" },
    { documento: "1015678123", contrasena: "clave8", nombre: "Esteban Camilo Torres", casa: "Casa 21 - Manzana B", parqueadero: "Parqueadero #21 (Privado) - Vehículo: JKL-012", saldo: "$0 (Al día)" },
    { documento: "admin", contrasena: "admin123", nombre: "Administración Central", casa: "Oficina Principal", parqueadero: "Zonas de Visitantes", saldo: "N/A" }
];

if (!localStorage.getItem('usuariosPropietarios')) localStorage.setItem('usuariosPropietarios', JSON.stringify(deFabrica));
const getUsers = () => JSON.parse(localStorage.getItem('usuariosPropietarios'));

const tabLogin = document.getElementById('tabLogin'), tabRegister = document.getElementById('tabRegister'), formLogin = document.getElementById('formLogin'), formRegister = document.getElementById('formRegister'), authCard = document.getElementById('authCard'), dashboardCard = document.getElementById('dashboardCard'), adminCard = document.getElementById('adminCard');
const lblNombreUsuario = document.getElementById('lblNombreUsuario'), lblInmueble = document.getElementById('lblInmueble'), lblParqueadero = document.getElementById('lblParqueadero'), lblSaldo = document.getElementById('lblSaldo'), btnCerrarSesion = document.getElementById('btnCerrarSesion'), btnCerrarSesionAdmin = document.getElementById('btnCerrarSesionAdmin');
const tabAdminCartera = document.getElementById('tabAdminCartera'), tabAdminParqueaderos = document.getElementById('tabAdminParqueaderos'), secAdminCartera = document.getElementById('secAdminCartera'), secAdminParqueaderos = document.getElementById('secAdminParqueaderos'), tablaAdminCuerpo = document.getElementById('tablaAdminCuerpo'), tablaParqueaderosCuerpo = document.getElementById('tablaParqueaderosCuerpo'), statTotalCasas = document.getElementById('statTotalCasas');
let sesion = null;

tabLogin?.addEventListener('click', () => { tabLogin.classList.add('active'); tabRegister.classList.remove('active'); formLogin.classList.remove('hidden'); formRegister.classList.add('hidden'); });
tabRegister?.addEventListener('click', () => { tabRegister.classList.add('active'); tabLogin.classList.remove('active'); formRegister.classList.remove('hidden'); formLogin.classList.add('hidden'); });
tabAdminCartera?.addEventListener('click', () => { tabAdminCartera.classList.add('active'); tabAdminParqueaderos.classList.remove('active'); secAdminCartera.classList.remove('hidden'); secAdminParqueaderos.classList.add('hidden'); renderAdmin(); });
tabAdminParqueaderos?.addEventListener('click', () => { tabAdminParqueaderos.classList.add('active'); tabAdminCartera.classList.remove('active'); secAdminParqueaderos.classList.remove('hidden'); secAdminCartera.classList.add('hidden'); renderParq(); });

formRegister?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('regNombre').value.trim();
    const documento = document.getElementById('regDocumento').value.trim();
    const casa = document.getElementById('regCasa').value.trim();
    const contrasena = document.getElementById('regContrasena').value.trim();
    
    let lista = getUsers();
    if (lista.some(u => u.documento === documento)) return alert("Este documento ya está registrado.");
    
    lista.push({ documento, contrasena, nombre, casa, parqueadero: "Sin parqueadero asignado", saldo: "$0 (Al día)" });
    localStorage.setItem('usuariosPropietarios', JSON.stringify(lista));
    
    alert(`¡Registro Exitoso!\nBienvenido/a ${nombre}. Ya puedes iniciar sesión.`);
    formRegister.reset();
    tabLogin.click();
});

formLogin?.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('txtUsuario').value.trim(), c = document.getElementById('txtContrasena').value.trim();
    const encontrado = getUsers().find(x => x.documento === u && x.contrasena === c);
    if (encontrado) {
        sesion = encontrado; formLogin.reset(); authCard.classList.add('hidden');
        if (encontrado.documento === "admin") { tabAdminCartera.click(); adminCard.classList.remove('hidden'); }
        else { renderUser(); dashboardCard.classList.remove('hidden'); }
    } else alert("Credenciales incorrectas.");
});

const renderUser = () => { if (sesion) { lblNombreUsuario.textContent = sesion.nombre; lblInmueble.textContent = sesion.casa; lblParqueadero.textContent = sesion.parqueadero; lblSaldo.textContent = sesion.saldo; } };

function renderAdmin() {
    const list = getUsers().filter(u => u.documento !== "admin");
    if (!tablaAdminCuerpo) return; tablaAdminCuerpo.innerHTML = "";
    list.forEach(u => {
        let cls = "status-green"; if (u.saldo.includes("mora")) cls = "status-red"; else if (u.saldo.includes("pendiente") || u.saldo.includes("Acuerdo")) cls = "status-orange";
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><strong>${u.casa}</strong><br><small style="color:#0288d1;font-weight:600;">${u.parqueadero}</small></td><td><strong>${u.nombre}</strong><br><small style="color:#666;">User: ${u.documento} | Clave: ${u.contrasena}</small><br><span class="status-badge ${cls}">${u.saldo}</span></td><td><button class="btn-manage" onclick="goCar('${u.documento}')">Gestionar</button></td>`;
        tablaAdminCuerpo.appendChild(tr);
    });
}

function renderParq() {
    if (!tablaParqueaderosCuerpo) return; tablaParqueaderosCuerpo.innerHTML = "";
    getUsers().filter(u => u.documento !== "admin").forEach(u => {
        const tiene = !u.parqueadero.toLowerCase().includes("sin parqueadero"), pts = u.parqueadero.split(" - ");
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><strong>${pts[0] || u.parqueadero}</strong><br><span class="status-badge ${tiene ? 'status-green' : 'status-orange'}">${tiene ? 'Ocupado' : 'Disponible'}</span></td><td><strong>${u.casa}</strong><br><small>${u.nombre}</small><br><small style="color:#c53030;font-weight:bold;">${pts[1] || 'Sin auto'}</small></td><td><button class="btn-manage" style="background:#2e7d32;" onclick="goParq('${u.documento}')">Cambiar</button></td>`;
        tablaParqueaderosCuerpo.appendChild(tr);
    });
}

window.goParq = (doc) => {
    let list = getUsers(); const i = list.findIndex(u => u.documento === doc); if (i === -1) return;
    const n = prompt(`Inmueble: ${list[i].casa}\nAsignación: ${list[i].parqueadero}\n\nNuevo parqueadero o 'Sin parqueadero asignado':`);
    if (n !== null) { list[i].parqueadero = n.trim(); localStorage.setItem('usuariosPropietarios', JSON.stringify(list)); alert("Sincronizado."); renderParq(); }
};

window.goCar = (doc) => {
    let list = getUsers(); const i = list.findIndex(u => u.documento === doc); if (i === -1) return;
    const op = prompt(`GESTIÓN - ${list[i].casa}\n1. Clave\n2. Parqueadero\n3. Saldo`);
    if (op === "1") { const k = prompt("Nueva clave:"); if (k) list[i].contrasena = k.trim(); }
    else if (opciosn === "2") { const p = prompt("Nuevo parqueadero:", list[i].parqueadero); if (p) list[i].parqueadero = p.trim(); }
    else if (op === "3") { const s = prompt("Nuevo saldo:", list[i].saldo); if (s) list[i].saldo = s.trim(); }
    else return;
    localStorage.setItem('usuariosPropietarios', JSON.stringify(list)); renderAdmin();
};

window.registrarVehiculoSimulado = () => {
    const pl = prompt("Placa (Ej: ABC123):"); if (!pl) return;
    let list = getUsers(); const i = list.findIndex(u => u.documento === sesion.documento);
    if (i !== -1) {
        list[i].parqueadero = `${list[i].parqueadero.split(" - ")[0]} - Vehículo: ${pl.toUpperCase()}`;
        localStorage.setItem('usuariosPropietarios', JSON.stringify(list)); sesion = list[i]; renderUser(); alert("Registrado.");
    }
};

btnCerrarSesion?.addEventListener('click', () => { sesion = null; dashboardCard.classList.add('hidden'); authCard.classList.remove('hidden'); });
btnCerrarSesionAdmin?.addEventListener('click', () => { sesion = null; adminCard.classList.add('hidden'); authCard.classList.remove('hidden'); });
