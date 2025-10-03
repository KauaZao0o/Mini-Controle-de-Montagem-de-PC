// --- Dados do projeto ---
const sockets = ['775','1156','1155','1150','1151','1700','1200'];
const cpusBySocket = {
  '775':['Core2Duo','Dual Core','Core2Quad'],
  '1156':['Core i3','Core i5','Core i7'],
  '1155':['Core i3','Core i5','Core i7'],
  '1150':['Core i3','Core i5','Core i7'],
  '1151':['Core i3','Core i5','Core i7'],
  '1200':['Core i3','Core i5','Core i7','Core i9'],
  '1700':['Ryzen 3','Ryzen 5','Ryzen 7','Ryzen 9']
};

const freqByCpu = {
  'Core2Duo':['1.6','1.8','2.0','2.4','2.66'],
  'Dual Core':['1.8','2.0','2.2','2.6'],
  'Core2Quad':['2.4','2.66','2.83'],
  'Core i3':['2.4','2.6','3.0'],
  'Core i5':['2.6','2.8','3.0','3.4'],
  'Core i7':['2.8','3.0','3.6','4.0'],
  'Core i9':['3.1','3.4','3.8','4.2'],
  'Ryzen 3':['2.6','3.0','3.6'],
  'Ryzen 5':['2.8','3.2','3.6','4.0'],
  'Ryzen 7':['3.0','3.6','4.0','4.2'],
  'Ryzen 9':['3.4','3.8','4.2','4.6']
};

const memTypesBySocket = {
  '775':['DDR2','DDR3'],
  'default':['DDR4']
};

const hdOptions = ['160GB','250GB','320GB','500GB'];
const osOptions = ['Windows 10','Windows 11'];

// Estado da montagem
let build = {
  id:null, socket:null, cpu:null, freq:null, memType:null, memConfig:null, hd:null, os:null
};

// LocalStorage
const STORE_KEY = 'pc-montagens';
function loadSaved(){
  try{const raw = localStorage.getItem(STORE_KEY); return raw?JSON.parse(raw):[] }catch(e){return[]}
}
function saveBuild(b){const arr = loadSaved(); arr.push(b); localStorage.setItem(STORE_KEY, JSON.stringify(arr));}
function hasId(id){return loadSaved().some(x=>x.id===id)}

// --- Gerador automático de ID ---
function generateNextId() {
  const builds = loadSaved();
  if (builds.length === 0) return "PC001";
  const lastId = builds[builds.length - 1].id;
  const num = parseInt(lastId.replace("PC", "")) || 0;
  const nextNum = num + 1;
  return "PC" + String(nextNum).padStart(3, "0");
}

// UI
const savedCount = document.getElementById('saved-count');
function updateSavedCount(){savedCount.textContent = loadSaved().length}
updateSavedCount();

// Inicializa campo de ID com valor automático
document.getElementById("pc-id").value = generateNextId();

// Criar botões de socket
const mbContainer = document.getElementById('motherboard-options');
sockets.forEach(s=>{
  const b = document.createElement('button'); b.type='button'; b.className='option'; b.textContent=s; b.dataset.socket=s;
  b.addEventListener('click', ()=>{ selectOptionGroup(mbContainer,b,'socket'); });
  mbContainer.appendChild(b);
});

function selectOptionGroup(container,button,key){
  Array.from(container.children).forEach(c=>c.classList.remove('selected'));
  button.classList.add('selected');
  if(key==='socket'){
    build.socket = button.dataset.socket;
    document.getElementById('current-socket').textContent = build.socket;
    document.getElementById('mem-socket').textContent = build.socket;
    build.cpu = build.freq = build.memType = build.memConfig = null;
    clearSelection(document.getElementById('cpu-options'));
    clearSelection(document.getElementById('freq-options'));
    clearSelection(document.getElementById('memtype-options'));
    hide(document.getElementById('mem-config'));
  } else if(key==='cpu'){
    build.cpu = button.dataset.cpu;
    build.freq = null; clearSelection(document.getElementById('freq-options'));
  } else if(key==='freq'){
    build.freq = button.dataset.freq;
  } else if(key==='memtype'){
    build.memType = button.dataset.memtype;
  } else if(key==='memstick'){
    build.memConfig = button.dataset.mem;
  } else if(key==='hd'){
    build.hd = button.dataset.hd;
  } else if(key==='os'){
    build.os = button.dataset.os;
  }
}

function clearSelection(container){Array.from(container.children).forEach(c=>c.classList.remove('selected'))}
function hide(el){el.classList.add('hidden')}
function show(el){el.classList.remove('hidden')}

// Navegação
function goTo(stepNum){
  Array.from(document.querySelectorAll('.step')).forEach(s=>s.classList.remove('active'));
  document.getElementById('step-'+stepNum).classList.add('active');
}

// Step1
document.getElementById('step1-next').addEventListener('click', ()=>{
  const id = document.getElementById('pc-id').value.trim();
  if (hasId(id)) { alert('ID já existe.'); return }
  const socket = build.socket;
  if(!socket){alert('Escolha uma placa-mãe (socket)'); return}
  build.id = id;
  populateCPUOptions(socket);
  goTo(2);
});

document.getElementById('step2-back').addEventListener('click', ()=>goTo(1));
document.getElementById('step2-next').addEventListener('click', ()=>{
  if(!build.cpu){alert('Escolha o processador'); return}
  populateFreqOptions(build.cpu);
  goTo(3);
});

document.getElementById('step3-back').addEventListener('click', ()=>goTo(2));
document.getElementById('step3-next').addEventListener('click', ()=>{
  if(!build.freq){alert('Escolha a frequência'); return}
  populateMemOptions(build.socket, build.cpu);
  goTo(4);
});

document.getElementById('step4-back').addEventListener('click', ()=>goTo(3));
document.getElementById('step4-next').addEventListener('click', ()=>{
  if(!build.memType || !build.memConfig){alert('Escolha o tipo de memória e a configuração de pentes'); return}
  populateHDOptions();
  goTo(5);
});

document.getElementById('step5-back').addEventListener('click', ()=>goTo(4));
document.getElementById('step5-next').addEventListener('click', ()=>{
  if(!build.hd){alert('Escolha o HD'); return}
  populateOSOptions();
  goTo(6);
});

document.getElementById('step6-back').addEventListener('click', ()=>goTo(5));
document.getElementById('step6-next').addEventListener('click', ()=>{
  if(!build.os){alert('Escolha o sistema operacional'); return}
  saveBuild({...build, timestamp: new Date().toISOString()});
  updateSavedCount();
  showReport();
  goTo(7);
});

document.getElementById('new-build').addEventListener('click', ()=>{
  build = {id:null,socket:null,cpu:null,freq:null,memType:null,memConfig:null,hd:null,os:null};
  clearSelection(mbContainer); clearSelection(document.getElementById('cpu-options'));
  clearSelection(document.getElementById('freq-options'));
  clearSelection(document.getElementById('memtype-options'));
  clearSelection(document.getElementById('memstick-options'));
  hide(document.getElementById('mem-config'));
  // gera novo ID
  document.getElementById('pc-id').value = generateNextId();
  goTo(1);
});

document.getElementById('download-report').addEventListener('click', ()=>{
  const builds = loadSaved();
  if (builds.length === 0) {
    alert("Nenhuma montagem salva para exportar.");
    return;
  }

  const header = [
    "Carimbo de data/hora",
    "ID",
    "Placa-mãe (socket)",
    "Processador",
    "Frequência (GHz)",
    "Tipo de memória",
    "Configuração de memória",
    "HD",
    "Sistema Operacional"
  ];

  const rows = builds.map(b => {
    const timestamp = new Date(b.timestamp).toLocaleString("pt-BR");
    return [
      `"${timestamp}"`,
      `"${b.id}"`,
      `"${b.socket}"`,
      `"${b.cpu}"`,
      `"${b.freq}"`,
      `"${b.memType}"`,
      `"${b.memConfig}"`,
      `"${b.hd}"`,
      `"${b.os}"`
    ].join(",");
  });

  const csvContent = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "montagens.csv";
  a.click();
  URL.revokeObjectURL(url);
});

// --- Populadores de opções ---
function populateCPUOptions(socket){
  const container = document.getElementById('cpu-options'); container.innerHTML='';
  const list = cpusBySocket[socket] || ['Generic CPU'];
  list.forEach(cpu=>{
    const b = document.createElement('button'); b.type='button'; b.className='option'; b.textContent=cpu; b.dataset.cpu=cpu;
    b.addEventListener('click', ()=>{ selectOptionGroup(container,b,'cpu') });
    container.appendChild(b);
  });
  document.getElementById('current-socket').textContent = socket;
}

function populateFreqOptions(cpu){
  const container = document.getElementById('freq-options'); container.innerHTML='';
  const list = freqByCpu[cpu] || ['2.0','3.0'];
  list.forEach(f=>{
    const b = document.createElement('button'); b.type='button'; b.className='option'; b.textContent=f+' GHz'; b.dataset.freq=f;
    b.addEventListener('click', ()=>{ selectOptionGroup(container,b,'freq') });
    container.appendChild(b);
  });
}

function populateMemOptions(socket, cpu){
  const container = document.getElementById('memtype-options'); container.innerHTML='';
  const types = memTypesBySocket[socket] || memTypesBySocket['default'];
  types.forEach(m=>{
    const b = document.createElement('button'); b.type='button'; b.className='option'; b.textContent=m; b.dataset.memtype=m;
    b.addEventListener('click', ()=>{ selectOptionGroup(container,b,'memtype'); prepareMemSticks(socket,cpu); show(document.getElementById('mem-config')) });
    container.appendChild(b);
  });
  hide(document.getElementById('mem-config'));
}

function prepareMemSticks(socket, cpu){
  const container = document.getElementById('memstick-options'); container.innerHTML='';
  const legacy = ['Core2Duo','Dual Core','Core2Quad'];
  if(legacy.includes(cpu)){
    const opts = ['2x2GB (total 4GB)','4x1GB (total 4GB)'];
    opts.forEach(o=>{ const b=document.createElement('button'); b.className='option'; b.textContent=o; b.dataset.mem=o; b.addEventListener('click', ()=>selectOptionGroup(container,b,'memstick')); container.appendChild(b)});
  } else {
    const opts = ['1x8GB (8GB)','2x8GB (16GB)','2x16GB (32GB)'];
    opts.forEach(o=>{ const b=document.createElement('button'); b.className='option'; b.textContent=o; b.dataset.mem=o; b.addEventListener('click', ()=>selectOptionGroup(container,b,'memstick')); container.appendChild(b)});
  }
}

function populateHDOptions(){
  const container = document.getElementById('hd-options'); container.innerHTML='';
  hdOptions.forEach(h=>{const b=document.createElement('button'); b.className='option'; b.textContent=h; b.dataset.hd=h; b.addEventListener('click', ()=>selectOptionGroup(container,b,'hd')); container.appendChild(b)});
}

function populateOSOptions(){
  const container = document.getElementById('os-options'); container.innerHTML='';
  osOptions.forEach(o=>{const b=document.createElement('button'); b.className='option'; b.textContent=o; b.dataset.os=o; b.addEventListener('click', ()=>selectOptionGroup(container,b,'os')); container.appendChild(b)});
}

function showReport(){
  const r = document.getElementById('report'); r.innerHTML='';
  const html = `
    <div><strong>ID:</strong> ${build.id}</div>
    <div><strong>Placa-mãe (socket):</strong> ${build.socket}</div>
    <div><strong>Processador:</strong> ${build.cpu} @ ${build.freq} GHz</div>
    <div><strong>Memória:</strong> ${build.memType} — ${build.memConfig}</div>
    <div><strong>HD:</strong> ${build.hd}</div>
    <div><strong>Sistema Operacional:</strong> ${build.os}</div>
    <div class="small muted">Salvo em: ${new Date().toLocaleString()}</div>
  `;
  r.innerHTML = html;
}

// Busca
function findBuildById(id){
  const arr = loadSaved();
  return arr.find(x => x.id.toLowerCase() === id.toLowerCase()) || null;
}

function showSearchResult(found){
  const el = document.getElementById('search-result');
  if(!found){ el.style.display='block'; el.innerHTML = '<div class="small muted">Nenhum registro encontrado para esse ID.</div>'; return }
  el.style.display='block';
  el.innerHTML = `
    <div><strong>ID:</strong> ${found.id}</div>
    <div><strong>Socket:</strong> ${found.socket}</div>
    <div><strong>CPU:</strong> ${found.cpu} @ ${found.freq} GHz</div>
    <div><strong>Memória:</strong> ${found.memType} — ${found.memConfig}</div>
    <div><strong>HD:</strong> ${found.hd}</div>
    <div><strong>SO:</strong> ${found.os}</div>
    <div class="small muted">Salvo em: ${new Date(found.timestamp).toLocaleString()}</div>
  `;
}

document.getElementById('search-btn').addEventListener('click', ()=>{
  const q = document.getElementById('search-id').value.trim();
  if(!q){ alert('Digite um ID para pesquisar'); return }
  const found = findBuildById(q);
  showSearchResult(found);
});

document.getElementById('search-id').addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ document.getElementById('search-btn').click(); } });

updateSavedCount();



function login() {
  const usuario = document.getElementById("usuario").value;

  // Lista de usuários permitidos
  const usuariosPermitidos = ["admin", "teste"];

  if (usuariosPermitidos.includes(usuario)) {
    window.location.href = "pages/painel.html"; // redireciona para outra página
  } else {
    alert("Selecione um usuário válido!");
  }
}

// Isso daqui permite o enter ao realizar o login
document.getElementById("usuario").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    login();
  }
});
