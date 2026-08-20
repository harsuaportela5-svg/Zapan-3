const DEMO_USERS=[
 {id:"u1",name:"María Rodríguez",unit:"Casa 101",document:"1010101010",password:"1234",role:"owner",parking:["Carro #25"],adminDue:0,parkingDue:0},
 {id:"u2",name:"Carlos Gómez",unit:"Casa 102",document:"1020202020",password:"1234",role:"owner",parking:["Moto M-08"],adminDue:180000,parkingDue:20000},
 {id:"u3",name:"Ana Martínez",unit:"Casa 103",document:"1030303030",password:"1234",role:"owner",parking:["Carro #31","Moto M-12"],adminDue:360000,parkingDue:40000},
 {id:"u4",name:"Luis Pérez",unit:"Casa 104",document:"1040404040",password:"1234",role:"owner",parking:[],adminDue:0,parkingDue:0},
 {id:"u5",name:"Sofía Torres",unit:"Casa 105",document:"1050505050",password:"1234",role:"owner",parking:["Carro #44"],adminDue:180000,parkingDue:35000}
];
const ADMIN={id:"admin",name:"Administración",document:"admin",password:"admin123",role:"admin"};
const payments=[
 {unit:"Casa 101",date:"05/08/2026",concept:"Administración agosto",value:180000,status:"Pagado"},
 {unit:"Casa 102",date:"03/08/2026",concept:"Administración agosto",value:180000,status:"Pagado"},
 {unit:"Casa 103",date:"02/07/2026",concept:"Administración julio",value:180000,status:"Pagado"},
 {unit:"Casa 104",date:"04/08/2026",concept:"Administración agosto",value:180000,status:"Pagado"},
 {unit:"Casa 105",date:"01/08/2026",concept:"Administración agosto",value:180000,status:"Pagado"}
];
const notices=[
 {title:"Mantenimiento de zonas comunes",date:"18/08/2026",text:"El sábado se realizará mantenimiento preventivo en las zonas comunes."},
 {title:"Reunión de propietarios",date:"15/08/2026",text:"La administración publicará próximamente la fecha y agenda de la próxima reunión."},
 {title:"Recordatorio de pago",date:"10/08/2026",text:"Recuerde mantener al día la cuota de administración y los conceptos asociados a parqueaderos."}
];
const money=n=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n);
const $=s=>document.querySelector(s);
function current(){return JSON.parse(localStorage.getItem("bz_current")||"null")}
function setCurrent(u){localStorage.setItem("bz_current",JSON.stringify(u))}
function login(){
 const doc=$("#document").value.trim(), pass=$("#password").value;
 let u=DEMO_USERS.find(x=>x.document===doc&&x.password===pass);
 if(doc===ADMIN.document&&pass===ADMIN.password)u=ADMIN;
 if(!u){$("#error").textContent="Documento o contraseña incorrectos.";return}
 setCurrent(u);render();
}
function logout(){localStorage.removeItem("bz_current");render()}
function loginView(){
 return `<div class="login"><div class="login-card">
 <div class="brand"><div class="brand-mark">🌿</div><h1>Bosques de Zapan Etapa 3</h1><p>Portal de Propietarios</p></div>
 <div class="field"><label>Documento / Usuario</label><input id="document" placeholder="Ingrese su documento"></div>
 <div class="field"><label>Contraseña</label><input id="password" type="password" placeholder="Ingrese su contraseña" onkeydown="if(event.key==='Enter')login()"></div>
 <button class="primary" onclick="login()">Ingresar al portal</button><div id="error" class="error"></div>
 <div class="demo"><b>Modo demostración</b><br>Propietario: 1010101010 / 1234<br>Administración: admin / admin123</div>
 </div></div>`;
}
function shell(title,content,active){
 const u=current();
 const ownerNav=`<button class="${active==="home"?"active":""}" onclick="page('home')">🏠 Inicio</button>
 <button class="${active==="account"?"active":""}" onclick="page('account')">💳 Estado de cuenta</button>
 <button class="${active==="parking"?"active":""}" onclick="page('parking')">🚗 Parqueaderos</button>
 <button class="${active==="payments"?"active":""}" onclick="page('payments')">🧾 Historial de pagos</button>
 <button class="${active==="notices"?"active":""}" onclick="page('notices')">📢 Comunicados</button>`;
 const adminNav=`<button class="${active==="dashboard"?"active":""}" onclick="page('dashboard')">📊 Dashboard</button>
 <button class="${active==="residents"?"active":""}" onclick="page('residents')">👥 Propietarios</button>
 <button class="${active==="accounts"?"active":""}" onclick="page('accounts')">💳 Estados de cuenta</button>
 <button class="${active==="adminParking"?"active":""}" onclick="page('adminParking')">🚗 Parqueaderos</button>
 <button class="${active==="notices"?"active":""}" onclick="page('notices')">📢 Comunicados</button>`;
 return `<div class="shell"><aside class="sidebar"><div class="side-brand"><div class="mini">BZ3</div><strong>Bosques de Zapan<br>Etapa 3</strong></div><nav class="nav">${u.role==="admin"?adminNav:ownerNav}</nav><div class="side-bottom"><button class="logout" onclick="logout()">Cerrar sesión</button></div></aside>
 <main class="main"><header class="topbar"><h2>${title}</h2><div class="user-pill"><span>${u.name}</span><div class="avatar">${u.role==="admin"?"A":u.name.charAt(0)}</div></div></header><section class="content">${content}</section></main></div>`;
}
function ownerHome(){
 const u=current(), total=u.adminDue+u.parkingDue, ok=total===0;
 return shell("Inicio",`<div class="welcome"><div><h1>Hola, ${u.name.split(" ")[0]} 👋</h1><div class="muted">${u.unit} · Última actualización: demostración</div></div><span class="status ${ok?"ok":"late"}">${ok?"● AL DÍA":"● PRESENTA SALDO"}</span></div>
 <div class="grid cards">
 <div class="card stat"><div><div class="label">Administración pendiente</div><div class="value">${money(u.adminDue)}</div></div><div class="icon">🏠</div></div>
 <div class="card stat"><div><div class="label">Parqueaderos pendientes</div><div class="value">${money(u.parkingDue)}</div></div><div class="icon">🚗</div></div>
 <div class="card stat"><div><div class="label">Saldo total</div><div class="value">${money(total)}</div></div><div class="icon">💰</div></div>
 <div class="card stat"><div><div class="label">Parqueaderos asignados</div><div class="value">${u.parking.length}</div></div><div class="icon">🔑</div></div></div>
 <div class="grid info-grid"><div class="card"><div class="section-title"><h3>Resumen de cuenta</h3><button class="btn light" onclick="page('account')">Ver detalle</button></div>
 <div class="row"><span>Cuota de administración</span><strong>${money(u.adminDue)}</strong></div><div class="row"><span>Cuotas parqueadero</span><strong>${money(u.parkingDue)}</strong></div><div class="row"><span>Total pendiente</span><strong>${money(total)}</strong></div>
 <div class="progress"><span style="width:${ok?100:45}%"></span></div><small class="muted">${ok?"No tiene obligaciones vencidas en esta demostración.":"Revise el detalle de sus obligaciones pendientes."}</small></div>
 <div class="card"><div class="section-title"><h3>Últimos comunicados</h3></div>${notices.slice(0,2).map(n=>`<div class="notice"><strong>${n.title}</strong><small>${n.date}</small><div>${n.text}</div></div>`).join("")}</div></div>`);
}
function account(){
 const u=current(), total=u.adminDue+u.parkingDue;
 return shell("Estado de cuenta",`<div class="welcome"><div><h1>${u.unit}</h1><div class="muted">Estado detallado de sus obligaciones</div></div><span class="status ${total===0?"ok":"late"}">${total===0?"● AL DÍA":"● EN MORA"}</span></div>
 <div class="card"><div class="label">Saldo total pendiente</div><div class="balance">${money(total)}</div><div class="section-title"><h3>Detalle</h3></div>
 <div class="row"><span>Administración</span><strong>${money(u.adminDue)}</strong></div><div class="row"><span>Parqueaderos</span><strong>${money(u.parkingDue)}</strong></div><div class="row"><span>Total</span><strong>${money(total)}</strong></div></div>
 <div class="section-title"><h3>Información de la cuenta</h3></div><div class="card"><div class="row"><span>Inmueble</span><strong>${u.unit}</strong></div><div class="row"><span>Propietario</span><strong>${u.name}</strong></div><div class="row"><span>Documento</span><strong>••••••${u.document.slice(-4)}</strong></div><div class="row"><span>Fuente de información</span><strong>Sistema contable de la copropiedad</strong></div></div>`);
}
function parking(){
 const u=current();
 return shell("Mis parqueaderos",`<div class="welcome"><div><h1>Parqueaderos</h1><div class="muted">Espacios asociados a ${u.unit}</div></div></div>
 <div class="grid cards">${u.parking.length?u.parking.map((p,i)=>`<div class="card"><div class="stat"><div><div class="label">Espacio ${i+1}</div><div class="value" style="font-size:21px">${p}</div></div><div class="icon">${p.toLowerCase().includes("moto")?"🏍️":"🚗"}</div></div><div class="row"><span>Estado</span><span class="status ${u.parkingDue===0?"ok":"late"}">${u.parkingDue===0?"Al día":"Pendiente"}</span></div><div class="row"><span>Saldo</span><strong>${money(u.parkingDue)}</strong></div></div>`).join(""):`<div class="card empty">No tiene parqueaderos registrados.</div>`}</div>`);
}
function paymentsPage(){
 const u=current();
 const rows=payments.filter(p=>p.unit===u.unit);
 return shell("Historial de pagos",`<div class="welcome"><div><h1>Historial</h1><div class="muted">Registro de pagos asociados a ${u.unit}</div></div></div><div class="card table-wrap"><table class="table"><thead><tr><th>Fecha</th><th>Concepto</th><th>Valor</th><th>Estado</th></tr></thead><tbody>${rows.map(p=>`<tr><td>${p.date}</td><td>${p.concept}</td><td>${money(p.value)}</td><td><span class="status ok">● ${p.status}</span></td></tr>`).join("")}</tbody></table></div>`);
}
function noticesPage(){
 return shell("Comunicados",`<div class="welcome"><div><h1>Comunicados</h1><div class="muted">Información publicada por la administración</div></div></div><div class="card">${notices.map(n=>`<div class="notice"><strong>${n.title}</strong><small>${n.date}</small><p>${n.text}</p></div>`).join("")}</div>`);
}
function adminDashboard(){
 const all=DEMO_USERS, late=all.filter(u=>u.adminDue+u.parkingDue>0), total=all.reduce((s,u)=>s+u.adminDue+u.parkingDue,0);
 return shell("Dashboard administrativo",`<div class="welcome"><div><h1>Panel de administración</h1><div class="muted">Resumen general de Bosques de Zapan Etapa 3</div></div><span class="status pending">MODO DEMOSTRACIÓN</span></div>
 <div class="grid admin-kpis"><div class="card stat"><div><div class="label">Inmuebles</div><div class="value">${all.length}</div></div><div class="icon">🏠</div></div><div class="card stat"><div><div class="label">Al día</div><div class="value">${all.length-late.length}</div></div><div class="icon">🟢</div></div><div class="card stat"><div><div class="label">En mora</div><div class="value">${late.length}</div></div><div class="icon">🔴</div></div><div class="card stat"><div><div class="label">Cartera</div><div class="value" style="font-size:20px">${money(total)}</div></div><div class="icon">💰</div></div><div class="card stat"><div><div class="label">Parqueaderos</div><div class="value">${all.reduce((s,u)=>s+u.parking.length,0)}</div></div><div class="icon">🚗</div></div></div>
 <div class="section-title"><h3>Propietarios con saldo</h3><button class="btn green" onclick="page('accounts')">Ver todos</button></div><div class="card table-wrap"><table class="table"><thead><tr><th>Inmueble</th><th>Propietario</th><th>Administración</th><th>Parqueadero</th><th>Total</th><th>Estado</th></tr></thead><tbody>${late.map(u=>`<tr><td>${u.unit}</td><td>${u.name}</td><td>${money(u.adminDue)}</td><td>${money(u.parkingDue)}</td><td><strong>${money(u.adminDue+u.parkingDue)}</strong></td><td><span class="status late">● En mora</span></td></tr>`).join("")}</tbody></table></div>`);
}
function residents(){
 return shell("Propietarios",`<div class="welcome"><div><h1>Propietarios</h1><div class="muted">Base de demostración</div></div><div class="toolbar"><input id="searchResident" placeholder="Buscar casa o nombre..." oninput="filterResidents()"></div></div><div class="card table-wrap"><table class="table"><thead><tr><th>Inmueble</th><th>Propietario</th><th>Documento</th><th>Parqueaderos</th><th>Saldo</th></tr></thead><tbody id="residentRows">${DEMO_USERS.map(u=>residentRow(u)).join("")}</tbody></table></div>`);
}
function residentRow(u){return `<tr><td>${u.unit}</td><td>${u.name}</td><td>••••${u.document.slice(-4)}</td><td>${u.parking.length}</td><td>${money(u.adminDue+u.parkingDue)}</td></tr>`}
function filterResidents(){const q=$("#searchResident").value.toLowerCase();$("#residentRows").innerHTML=DEMO_USERS.filter(u=>(u.name+" "+u.unit).toLowerCase().includes(q)).map(residentRow).join("")}
function accounts(){
 return shell("Estados de cuenta",`<div class="welcome"><div><h1>Cartera y estados de cuenta</h1><div class="muted">Consulta general de obligaciones</div></div><div class="toolbar"><input id="searchAccount" placeholder="Buscar inmueble..." oninput="filterAccounts()"><select id="statusAccount" onchange="filterAccounts()"><option value="">Todos</option><option value="late">En mora</option><option value="ok">Al día</option></select></div></div><div class="card table-wrap"><table class="table"><thead><tr><th>Inmueble</th><th>Propietario</th><th>Administración</th><th>Parqueaderos</th><th>Total</th><th>Estado</th></tr></thead><tbody id="accountRows">${DEMO_USERS.map(accountRow).join("")}</tbody></table></div>`);
}
function accountRow(u){const t=u.adminDue+u.parkingDue;return `<tr data-status="${t?"late":"ok"}"><td>${u.unit}</td><td>${u.name}</td><td>${money(u.adminDue)}</td><td>${money(u.parkingDue)}</td><td><strong>${money(t)}</strong></td><td><span class="status ${t?"late":"ok"}">${t?"● EN MORA":"● AL DÍA"}</span></td></tr>`}
function filterAccounts(){const q=$("#searchAccount").value.toLowerCase(),s=$("#statusAccount").value;$("#accountRows").innerHTML=DEMO_USERS.filter(u=>(u.name+" "+u.unit).toLowerCase().includes(q)).filter(u=>!s||((u.adminDue+u.parkingDue?"late":"ok")===s)).map(accountRow).join("")}
function adminParking(){
 const total=DEMO_USERS.reduce((s,u)=>s+u.parking.length,0);
 return shell("Parqueaderos",`<div class="welcome"><div><h1>Control de parqueaderos</h1><div class="muted">${total} espacios registrados en esta demostración</div></div></div><div class="card table-wrap"><table class="table"><thead><tr><th>Inmueble</th><th>Propietario</th><th>Espacios</th><th>Saldo</th><th>Estado</th></tr></thead><tbody>${DEMO_USERS.map(u=>{const t=u.parkingDue;return `<tr><td>${u.unit}</td><td>${u.name}</td><td>${u.parking.length?u.parking.join(", "):"Sin asignación"}</td><td>${money(t)}</td><td><span class="status ${t?"late":"ok"}">${t?"● Pendiente":"● Al día"}</span></td></tr>`}).join("")}</tbody></table></div>`);
}
function page(p){
 const u=current();
 if(u.role==="admin"){
  if(p==="dashboard")return render(adminDashboard());
  if(p==="residents")return render(residents());
  if(p==="accounts")return render(accounts());
  if(p==="adminParking")return render(adminParking());
  if(p==="notices")return render(noticesPage());
  return render(adminDashboard());
 }
 if(p==="home")return render(ownerHome());
 if(p==="account")return render(account());
 if(p==="parking")return render(parking());
 if(p==="payments")return render(paymentsPage());
 if(p==="notices")return render(noticesPage());
}
function render(view){$("#app").innerHTML=view}
function start(){const u=current(); if(!u)render(loginView()); else page(u.role==="admin"?"dashboard":"home")}
start();
