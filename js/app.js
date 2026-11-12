const COL={rojo:'#A93A3A',azul:'#2F3FA8',marrón:'#A8742E',verde:'#2E7D4F',amarillo:'#D4A017',naranja:'#E36B2C',morado:'#7B4DAA',rosa:'#D65A8C',celeste:'#4A90C2',turquesa:'#1D9A91',negro:'#30343B',gris:'#7A8793'},HOME={x:180,y:210};
const hora=()=>new Date().toLocaleTimeString('es-UY',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
const S={tab:'map',sel:0,editing:null,radius:70,trail:false,report:false,reports:[],alerts:[],
pets:[{name:'Thor',sp:'Perro',col:'rojo',code:'A1B2C3',x:150,y:190,bat:82,trail:[],out:false,lost:false},
{name:'Mishi',sp:'Gato',col:'azul',code:'D4E5F6',x:215,y:240,bat:57,trail:[],out:false,lost:false},
{name:'Luna',sp:'Perro',col:'marrón',code:'G7H8I9',x:190,y:172,bat:34,trail:[],out:false,lost:false}]};
const dist=p=>Math.hypot(p.x-HOME.x,p.y-HOME.y);
const alerta=t=>{S.alerts.unshift({t,h:hora()});if(S.tab==='alerts')render()};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function tick(){
 S.pets.forEach(p=>{
  if(p.esc){const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy);if(d<8)p.esc=false;else{p.x+=dx/d*8;p.y+=dy/d*8}}
  else{p.x+=(Math.random()-.5)*7+(HOME.x-p.x)*.03;p.y+=(Math.random()-.5)*7+(HOME.y-p.y)*.03}
  p.x=Math.max(14,Math.min(346,p.x));p.y=Math.max(14,Math.min(406,p.y));
  p.trail.push([p.x,p.y]);if(p.trail.length>40)p.trail.shift();
  p.bat=Math.max(1,p.bat-.02);
  const fuera=dist(p)>S.radius;
  if(fuera&&!p.out){p.out=true;alerta(`${p.name} salió de la zona segura. Tocá “Ver mapa” para seguirlo.`)}
  if(!fuera&&p.out){p.out=false;alerta(`${p.name} volvió a la zona segura.`)}
  if(p.bat<20&&!p.low){p.low=true;alerta(`Batería baja en el collar de ${p.name}.`)}
 });
 if(S.tab==='map')drawMap();
 if(S.tab==='pets'||S.tab==='alerts')render();
}

function mapSVG(){
 let s=`<rect width="360" height="420" fill="var(--map)"/>`;
 [60,140,280,340].forEach(y=>s+=`<rect x="0" y="${y-5}" width="360" height="10" fill="var(--road)"/>`);
 [50,130,230,310].forEach(x=>s+=`<rect x="${x-5}" y="0" width="10" height="420" fill="var(--road)"/>`);
 s+=`<circle cx="${HOME.x}" cy="${HOME.y}" r="${S.radius}" fill="${COL.azul}" fill-opacity=".10" stroke="${COL.azul}" stroke-width="2" stroke-dasharray="6 5"/>`;
 s+=`<text x="${HOME.x}" y="${HOME.y+5}" text-anchor="middle" font-size="18">🏠</text>`;
 S.reports.forEach(r=>s+=`<text x="${r.x}" y="${r.y}" text-anchor="middle" font-size="20">⚠️</text>`);
 S.pets.forEach((p,i)=>{
  if(S.trail||i===S.sel&&p.lost)s+=`<polyline points="${p.trail.map(t=>t.join(',')).join(' ')}" fill="none" stroke="${COL[p.col]}" stroke-width="3" stroke-opacity=".6"/>`;
  const sel=i===S.sel;
  if(p.lost)s+=`<circle cx="${p.x}" cy="${p.y}" r="22" fill="none" stroke="${COL.rojo}" stroke-width="2"><animate attributeName="r" values="14;28" dur="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.4s" repeatCount="indefinite"/></circle>`;
  s+=`<g data-i="${i}" style="cursor:pointer"><circle cx="${p.x}" cy="${p.y}" r="${sel?17:13}" fill="#fff" stroke="${COL[p.col]}" stroke-width="${sel?6:5}"/><text x="${p.x}" y="${p.y+5}" text-anchor="middle" font-size="${sel?15:12}">${p.sp==='Gato'?'🐈':'🐕'}</text></g>`;
 });
 return s;
}
function drawMap(){
 const svg=$('#svg');if(!svg)return;
 svg.innerHTML=mapSVG();
 const p=S.pets[S.sel];if(!p){$('#info').innerHTML='<p>Todavía no hay collares vinculados.</p>';return}
 $('#info').innerHTML=`<div class="row"><span class="dot" style="background:${COL[p.col]}"></span><h2>${p.name}</h2><span class="pill ${p.out?'out':'ok'}">${p.out?'Fuera de la zona':'En zona segura'}</span><span class="sp row"><span class="bar"><i style="width:${p.bat}%"></i></span><small>${Math.round(p.bat)}%</small></span></div>
 <p>A ${Math.round(dist(p)*3)} m de casa · Actualizado ${hora()}</p>
 <div class="chips"><button id="bl" class="${p.lost?'warn':''}">${p.lost?'Desactivar modo perdido':'Modo perdido'}</button><button id="be">Simular escape</button></div>`;
 $('#bl').onclick=()=>{p.lost=!p.lost;alerta(p.lost?`Modo perdido activado para ${p.name}: la ubicación se envía cada 5 s y se avisa a vecinos con la app.`:`Modo perdido desactivado para ${p.name}.`);drawMap()};
 $('#be').onclick=()=>{const a=Math.random()*6.28,r=S.radius+55;p.esc=true;p.tx=Math.max(20,Math.min(340,HOME.x+Math.cos(a)*r));p.ty=Math.max(20,Math.min(400,HOME.y+Math.sin(a)*r))};
}

function render(){
 const v=$('#view');
 $('#nav').innerHTML=[['map','Mapa'],['pets','Collares'],['alerts','Alertas'+(S.alerts.length?` (${S.alerts.length})`:'')],['add','Vincular']].map(([k,l])=>`<button data-t="${k}" class="${S.tab===k?'on':''}">${l}</button>`).join('');
 document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{S.tab=b.dataset.t;render()});
 if(S.tab==='map'){
  v.innerHTML=`<svg id="svg" viewBox="0 0 360 420" role="img" aria-label="Mapa del barrio con la ubicación de las mascotas"></svg>
  <div class="card" id="info"></div>
  <div class="card"><div class="row"><h2>Zona segura</h2><b class="sp" id="rv">${S.radius*3} m</b></div>
  <input type="range" id="rad" min="30" max="150" value="${S.radius}" aria-label="Radio de la zona segura">
  <div class="chips"><button id="bt" class="${S.trail?'on':''}">Ver recorrido</button><button id="br" class="${S.report?'on':''}">${S.report?'Tocá el mapa para marcar':'Reportar perro suelto'}</button></div>
  <p>La zona segura se centra en tu casa. Si el collar sale del círculo, recibís una alerta.</p></div>`;
  $('#rad').oninput=e=>{S.radius=+e.target.value;$('#rv').textContent=S.radius*3+' m';drawMap()};
  $('#bt').onclick=()=>{S.trail=!S.trail;render()};
  $('#br').onclick=()=>{S.report=!S.report;render()};
  $('#svg').onclick=e=>{
   const g=e.target.closest('[data-i]');
   if(g){S.sel=+g.dataset.i;drawMap();return}
   if(S.report){const pt=$('#svg').createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform($('#svg').getScreenCTM().inverse());
    S.reports.push({x:q.x,y:q.y});S.report=false;alerta('Reporte enviado: perro suelto marcado en el mapa. Los vecinos con la app reciben el aviso.');render()}};
  drawMap();
 }
 if(S.tab==='pets'){
  v.innerHTML=S.pets.map((p,i)=>`<div class="card">
  <div class="row"><span class="dot" style="background:${COL[p.col]};width:22px;height:22px"></span>
  <div><h2>${esc(p.name)} <small style="font-weight:400;color:var(--mute)">${esc(p.sp)}</small></h2><p>Collar ${esc(p.col)} · código ${esc(p.code)}</p></div>
  <div class="sp" style="text-align:right"><div class="bar" style="margin-left:auto"><i style="width:${p.bat}%;background:${p.bat<20?'var(--warn)':'var(--ok)'}"></i></div><small>${Math.round(p.bat)}%</small></div></div>
  ${S.editing===i?`<form data-edit-form="${i}" novalidate>
  <label for="edit-name-${i}">Nombre</label><input id="edit-name-${i}" name="name" value="${esc(p.name)}" autocomplete="off">
  <label for="edit-type-${i}">Tipo</label><select id="edit-type-${i}" name="sp"><option${p.sp==='Perro'?' selected':''}>Perro</option><option${p.sp==='Gato'?' selected':''}>Gato</option></select>
  <label for="edit-color-${i}">Color del collar</label><select id="edit-color-${i}" name="col">${Object.keys(COL).map(c=>`<option value="${c}"${p.col===c?' selected':''}>${c[0].toUpperCase()+c.slice(1)}</option>`).join('')}</select>
  <label for="edit-code-${i}">Código del chip (6 caracteres)</label><input id="edit-code-${i}" name="code" value="${esc(p.code)}" maxlength="6" autocomplete="off">
  <p data-edit-error style="color:var(--warn);min-height:20px"></p>
  <div class="chips"><button class="on" type="submit">Guardar cambios</button><button type="button" data-cancel="${i}">Cancelar</button></div></form>`
  :`<div class="chips"><button data-v="${i}">Ver mapa</button><button data-edit="${i}">Editar</button><button class="warn" data-delete="${i}">Borrar</button></div>`}</div>`).join('')||'<div class="card"><p>No hay collares vinculados.</p></div>';
  v.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{S.sel=+b.dataset.v;S.tab='map';render()});
  v.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{S.editing=+b.dataset.edit;render()});
  v.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>{S.editing=null;render()});
  v.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{
   const i=+b.dataset.delete,p=S.pets[i];
   if(!window.confirm(`¿Querés borrar el collar de ${p.name}?`))return;
   S.pets.splice(i,1);
   if(S.sel>i)S.sel--;
   else if(S.sel===i)S.sel=Math.min(i,S.pets.length-1);
   S.editing=null;
   alerta(`Collar de ${p.name} borrado.`);
   render();
  });
  v.querySelectorAll('[data-edit-form]').forEach(form=>form.onsubmit=e=>{
   e.preventDefault();
   const i=+form.dataset.editForm,p=S.pets[i];
   const name=form.querySelector('[name="name"]').value.trim(),code=form.querySelector('[name="code"]').value.trim().toUpperCase();
   const error=form.querySelector('[data-edit-error]');
   if(!name){error.textContent='Escribí el nombre de tu mascota.';return}
   if(!/^[A-Z0-9]{6}$/.test(code)){error.textContent='El código debe tener 6 letras o números.';return}
   if(S.pets.some((pet,index)=>index!==i&&pet.code===code)){error.textContent='Ese chip ya está vinculado.';return}
   p.name=name;p.sp=form.querySelector('[name="sp"]').value;p.col=form.querySelector('[name="col"]').value;p.code=code;
   S.editing=null;
   alerta(`Datos del collar de ${p.name} actualizados.`);
   render();
  });
 }
 if(S.tab==='alerts'){
  v.innerHTML=`<div class="card"><h2>Alertas</h2>${S.alerts.map(a=>`<div class="al">${a.t}<time>${a.h}</time></div>`).join('')||'<p>Sin alertas. Probá “Simular escape” en el mapa.</p>'}</div>`;
 }
 if(S.tab==='add'){
  v.innerHTML=`<div class="card"><div class="row"><span class="chip" id="preview" style="--chip:${COL.rojo}"></span><div><h2>Vincular un collar nuevo</h2><p>Encendé el chip GPS y buscá el código en el estuche.</p></div></div>
  <label>Color del collar</label><div class="sw" id="sw" role="group" aria-label="Elegí el color del collar">${Object.keys(COL).map(c=>`<button type="button" data-c="${c}" style="--swatch:${COL[c]}" class="${c==='rojo'?'on':''}" aria-label="${c[0].toUpperCase()+c.slice(1)}" aria-pressed="${c==='rojo'}" title="${c[0].toUpperCase()+c.slice(1)}"></button>`).join('')}</div><p>Color seleccionado: <span id="colorName">Rojo</span></p>
  <label for="nm">Nombre de la mascota</label><input id="nm" placeholder="Ej.: Rocky" autocomplete="off">
  <label for="sp">Tipo</label><select id="sp"><option>Perro</option><option>Gato</option></select>
  <label for="cd">Código del chip (6 caracteres)</label><input id="cd" maxlength="6" placeholder="A1B2C3" autocomplete="off">
  <p id="err" style="color:var(--warn);min-height:20px"></p>
  <button id="go" class="on" style="width:100%">Vincular collar</button></div>`;
  let col='rojo';
  document.querySelectorAll('#sw button').forEach(b=>b.onclick=()=>{
   col=b.dataset.c;
   document.querySelectorAll('#sw button').forEach(x=>{const selected=x===b;x.classList.toggle('on',selected);x.setAttribute('aria-pressed',selected)});
   $('#preview').style.setProperty('--chip',COL[col]);
   $('#colorName').textContent=col[0].toUpperCase()+col.slice(1);
  });
  $('#go').onclick=()=>{
   const n=$('#nm').value.trim(),c=$('#cd').value.trim().toUpperCase();
   if(!n)return $('#err').textContent='Escribí el nombre de tu mascota.';
   if(!/^[A-Z0-9]{6}$/.test(c))return $('#err').textContent='El código debe tener 6 letras o números.';
   if(S.pets.some(p=>p.code===c))return $('#err').textContent='Ese chip ya está vinculado.';
   S.pets.push({name:n,sp:$('#sp').value,col,code:c,x:HOME.x+(Math.random()*30-15),y:HOME.y+(Math.random()*30-15),bat:100,trail:[],out:false,lost:false});
   S.sel=S.pets.length-1;alerta(`Collar ${col} vinculado a ${n}.`);S.tab='map';render()};
 }
}
render();setInterval(tick,1500);
