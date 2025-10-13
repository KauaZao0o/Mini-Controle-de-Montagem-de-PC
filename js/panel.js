// Estado da montagem
let build = {
  id: null, socket: null, cpu: null, freq: null, 
  memType: null, memConfig: null, hd: null, os: null
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
});

function initializeApp() {
  document.getElementById("pc-id").value = generateNextId();
  updateSavedCount();
  createSocketButtons();
  
  // Botão voltar
  document.getElementById('back-to-index').addEventListener('click', function() {
    window.location.href = '../index.html';
  });
}

function setupEventListeners() {
  // Step 1
  document.getElementById('step1-next').addEventListener('click', step1Next);
  
  // Step 2
  document.getElementById('step2-back').addEventListener('click', () => goTo(1));
  document.getElementById('step2-next').addEventListener('click', step2Next);
  
  // Step 3
  document.getElementById('step3-back').addEventListener('click', () => goTo(2));
  document.getElementById('step3-next').addEventListener('click', step3Next);
  
  // Step 4
  document.getElementById('step4-back').addEventListener('click', () => goTo(3));
  document.getElementById('step4-next').addEventListener('click', step4Next);
  
  // Step 5
  document.getElementById('step5-back').addEventListener('click', () => goTo(4));
  document.getElementById('step5-next').addEventListener('click', step5Next);
  
  // Step 6
  document.getElementById('step6-back').addEventListener('click', () => goTo(5));
  document.getElementById('step6-next').addEventListener('click', step6Next);
  
  // Step 7
  document.getElementById('new-build').addEventListener('click', newBuild);
  document.getElementById('download-report').addEventListener('click', downloadReport);
}

// --- Atualiza contagem de builds salvos ---
function updateSavedCount() { 
  document.getElementById('saved-count').textContent = loadSaved().length; 
}

// --- Criar botões de socket ---
function createSocketButtons() {
  const mbContainer = document.getElementById('motherboard-options');
  mbContainer.innerHTML = '';
  
  sockets.forEach((s) => {
    const b = document.createElement('button'); 
    b.type = 'button'; 
    b.className = 'option'; 
    b.textContent = s; 
    b.dataset.socket = s;
    b.addEventListener('click', () => { selectOptionGroup(mbContainer, b, 'socket'); });
    mbContainer.appendChild(b);
  });
}

// --- Seleção de opções ---
function selectOptionGroup(container, button, key) {
  Array.from(container.children).forEach(c => c.classList.remove('selected'));
  button.classList.add('selected');

  if (key === 'socket') {
    build.socket = button.dataset.socket;
    document.getElementById('current-socket').textContent = build.socket;
    document.getElementById('mem-socket').textContent = build.socket;
    build.cpu = build.freq = build.memType = build.memConfig = build.hd = build.os = null;
    clearSelection(document.getElementById('cpu-options'));
    clearSelection(document.getElementById('freq-options'));
    clearSelection(document.getElementById('memtype-options'));
    clearSelection(document.getElementById('memstick-options'));
    hide(document.getElementById('mem-config'));
  } else if (key === 'cpu') {
    build.cpu = button.dataset.cpu;
    build.freq = null; 
    clearSelection(document.getElementById('freq-options'));
  } else if (key === 'freq') {
    build.freq = button.dataset.freq;
  } else if (key === 'memtype') {
    build.memType = button.dataset.memtype;
    prepareMemSticks(build.socket, build.cpu);
    show(document.getElementById('mem-config'));
  } else if (key === 'memstick') {
    build.memConfig = button.dataset.mem;
  } else if (key === 'hd') {
    build.hd = button.dataset.hd;
  } else if (key === 'os') {
    build.os = button.dataset.os;
  }
}

function clearSelection(container) { 
  Array.from(container.children).forEach(c => c.classList.remove('selected')); 
}

function hide(el) { 
  el.classList.add('hidden'); 
}

function show(el) { 
  el.classList.remove('hidden'); 
}

// --- Navegação entre steps ---
function goTo(stepNum) {
  Array.from(document.querySelectorAll('.step')).forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + stepNum).classList.add('active');
}

// Step 1
function step1Next() {
  const id = document.getElementById('pc-id').value.trim();
  if (hasId(id)) { 
    alert('ID já existe.'); 
    return; 
  }
  if (!build.socket) { 
    alert('Escolha uma placa-mãe (socket)'); 
    return; 
  }
  build.id = id;
  populateCPUOptions(build.socket);
  goTo(2);
}

// Step 2
function step2Next() {
  if (!build.cpu) { 
    alert('Escolha o processador'); 
    return; 
  }
  populateFreqOptions(build.cpu);
  goTo(3);
}

// Step 3
function step3Next() {
  if (!build.freq) { 
    alert('Escolha a frequência'); 
    return; 
  }
  populateMemOptions(build.socket, build.cpu);
  goTo(4);
}

// Step 4
function step4Next() {
  if (!build.memType || !build.memConfig) { 
    alert('Escolha o tipo de memória e a configuração de pentes'); 
    return; 
  }
  populateHDOptions();
  goTo(5);
}

// Step 5
function step5Next() {
  if (!build.hd) { 
    alert('Escolha o HD'); 
    return; 
  }
  populateOSOptions();
  goTo(6);
}

// Step 6
function step6Next() {
  if (!build.os) { 
    alert('Escolha o sistema operacional'); 
    return; 
  }
  build.sku = generateSKU(build);
  build.timestamp = new Date().toISOString();
  saveBuild(build);
  updateSavedCount();
  showReport();
  goTo(7);
}

// Nova montagem
function newBuild() {
  build = {
    id: null, socket: null, cpu: null, freq: null, 
    memType: null, memConfig: null, hd: null, os: null
  };
  
  clearSelection(document.getElementById('motherboard-options'));
  clearSelection(document.getElementById('cpu-options'));
  clearSelection(document.getElementById('freq-options'));
  clearSelection(document.getElementById('memtype-options'));
  clearSelection(document.getElementById('memstick-options'));
  clearSelection(document.getElementById('hd-options'));
  clearSelection(document.getElementById('os-options'));
  
  hide(document.getElementById('mem-config'));
  document.getElementById('pc-id').value = generateNextId();
  goTo(1);
}

// --- Populadores de opções ---
function populateCPUOptions(socket) {
  const container = document.getElementById('cpu-options'); 
  container.innerHTML = '';
  const list = cpusBySocket[socket] || ['Generic CPU'];
  
  list.forEach(cpu => {
    const b = document.createElement('button'); 
    b.type = 'button'; 
    b.className = 'option'; 
    b.textContent = cpu; 
    b.dataset.cpu = cpu;
    b.addEventListener('click', () => selectOptionGroup(container, b, 'cpu'));
    container.appendChild(b);
  });
  
  document.getElementById('current-socket').textContent = socket;
}

function populateFreqOptions(cpu) {
  const container = document.getElementById('freq-options'); 
  container.innerHTML = '';
  const list = freqByCpu[cpu] || ['2.0','3.0'];
  
  list.forEach(f => {
    const b = document.createElement('button'); 
    b.type = 'button'; 
    b.className = 'option'; 
    b.textContent = f + ' GHz'; 
    b.dataset.freq = f;
    b.addEventListener('click', () => selectOptionGroup(container, b, 'freq'));
    container.appendChild(b);
  });
}

function populateMemOptions(socket, cpu) {
  const container = document.getElementById('memtype-options'); 
  container.innerHTML = '';
  const types = memTypesBySocket[socket] || memTypesBySocket['default'];
  
  types.forEach(m => {
    const b = document.createElement('button'); 
    b.type = 'button'; 
    b.className = 'option'; 
    b.textContent = m; 
    b.dataset.memtype = m;
    b.addEventListener('click', () => selectOptionGroup(container, b, 'memtype'));
    container.appendChild(b);
  });
  
  hide(document.getElementById('mem-config'));
}

function prepareMemSticks(socket, cpu) {
  const container = document.getElementById('memstick-options'); 
  container.innerHTML = '';
  const legacy = ['Core2Duo','Dual Core','Core2Quad'];
  let opts = [];
  
  if (legacy.includes(cpu)) {
    opts = ['2x2GB (total 4GB)','4x1GB (total 4GB)'];
  } else {
    opts = ['1x8GB (8GB)','2x8GB (16GB)','2x16GB (32GB)'];
  }
  
  opts.forEach(o => {
    const b = document.createElement('button'); 
    b.className = 'option'; 
    b.textContent = o; 
    b.dataset.mem = o;
    b.addEventListener('click', () => selectOptionGroup(container, b, 'memstick'));
    container.appendChild(b);
  });
}

function populateHDOptions() {
  const container = document.getElementById('hd-options'); 
  container.innerHTML = '';
  
  hdOptions.forEach(h => {
    const b = document.createElement('button'); 
    b.className = 'option'; 
    b.textContent = h; 
    b.dataset.hd = h;
    b.addEventListener('click', () => selectOptionGroup(container, b, 'hd'));
    container.appendChild(b);
  });
}

function populateOSOptions() {
  const container = document.getElementById('os-options'); 
  container.innerHTML = '';
  
  osOptions.forEach(o => {
    const b = document.createElement('button'); 
    b.className = 'option'; 
    b.textContent = o; 
    b.dataset.os = o;
    b.addEventListener('click', () => selectOptionGroup(container, b, 'os'));
    container.appendChild(b);
  });
}

// --- Exibir relatório final ---
function showReport() {
  const r = document.getElementById('report'); 
  r.innerHTML = '';
  const sku = generateSKU(build);
  
  const html = `
    <div><strong>ID:</strong> ${build.id}</div>
    <div><strong>Placa-mãe (socket):</strong> ${build.socket}</div>
    <div><strong>Processador:</strong> ${build.cpu} @ ${build.freq} GHz</div>
    <div><strong>Memória:</strong> ${build.memType} — ${build.memConfig}</div>
    <div><strong>HD:</strong> ${build.hd}</div>
    <div><strong>Sistema Operacional:</strong> ${build.os}</div>
    <div><strong>SKU:</strong> ${sku}</div>
    <div class="small muted">Salvo em: ${new Date().toLocaleString()}</div>
  `;
  
  r.innerHTML = html;
}

// --- Export CSV ---
function downloadReport() {
  const builds = loadSaved();
  if (builds.length === 0) { 
    alert("Nenhuma montagem salva para exportar."); 
    return; 
  }

  // Determina o tipo de usuário baseado na página atual ou parâmetro
  let userType = 'ADMINISTRADOR';
  if (window.location.pathname.includes('painel.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    userType = urlParams.get('user') || 'ADMINISTRADOR';
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
    "Sistema Operacional",
    "SKU",
    "Usuário"
  ];

  const rows = builds.map(b => {
    const timestamp = new Date(b.timestamp).toLocaleString("pt-BR");
    const sku = generateSKU(b);
    return [
      `"${timestamp}"`,
      `"${b.id}"`,
      `"${b.socket}"`,
      `"${b.cpu}"`,
      `"${b.freq}"`,
      `"${b.memType}"`,
      `"${b.memConfig}"`,
      `"${b.hd}"`,
      `"${b.os}"`,
      `"${sku}"`,
      `"${userType}"`
    ].join(",");
  });

  const csvContent = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `montagens_${userType.toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Checklist Functions ---
function setupChecklistListeners() {
  document.getElementById('checklist-btn').addEventListener('click', goToChecklist);
  document.getElementById('checklist-back').addEventListener('click', backToReport);
  document.getElementById('save-checklist').addEventListener('click', saveChecklist);
  document.getElementById('print-checklist').addEventListener('click', printChecklist);
}

function goToChecklist() {
  goTo(8);
  // Configura a lógica dos radio buttons após ir para o checklist
  setTimeout(setupRadioButtonLogic, 100);
}

function backToReport() {
  goTo(7);
}

// Nova função para controlar a lógica dos radio buttons
function setupRadioButtonLogic() {
  // Adiciona event listeners para todos os radio buttons S
  const radioSButtons = document.querySelectorAll('input[type="radio"][value="S"]');
  const radioNButtons = document.querySelectorAll('input[type="radio"][value="N"]');
  
  radioSButtons.forEach(radio => {
    radio.addEventListener('change', function() {
      const name = this.name;
      const emFaltaRadio = document.querySelector(`input[name="${name}"][value="EM_FALTA"]`);
      if (emFaltaRadio) {
        emFaltaRadio.disabled = true;
        emFaltaRadio.checked = false;
      }
    });
  });
  
  radioNButtons.forEach(radio => {
    radio.addEventListener('change', function() {
      const name = this.name;
      const emFaltaRadio = document.querySelector(`input[name="${name}"][value="EM_FALTA"]`);
      if (emFaltaRadio) {
        emFaltaRadio.disabled = false;
      }
    });
  });
}

function saveChecklist() {
  const checklistData = {
    triagem: {
      fonte: getRadioValue('fonte'),
      cooler: getRadioValue('cooler'),
      pasta: getRadioValue('pasta'),
      memoria: getRadioValue('memoria'),
      limpeza: getRadioValue('limpeza')
    },
    montagem: {
      bateria: getRadioValue('bateria'),
      config_bios: getRadioValue('config_bios'),
      sistema: getRadioValue('sistema'),
      drivers: getRadioValue('drivers'),
      trava_hd: getRadioValue('trava_hd'),
      audio: getRadioValue('audio'),
      rede: getRadioValue('rede'),
      dvd: getRadioValue('dvd')
    },
    pcId: build.id,
    timestamp: new Date().toISOString()
  };

  // Salvar no localStorage
  const existingChecklists = JSON.parse(localStorage.getItem('pc_checklists') || '{}');
  existingChecklists[build.id] = checklistData;
  localStorage.setItem('pc_checklists', JSON.stringify(existingChecklists));

  alert('Checklist salvo com sucesso!');
}

function getRadioValue(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : null;
}

function printChecklist() {
  const checklistContent = document.getElementById('step-8').innerHTML;
  const originalContent = document.body.innerHTML;
  
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="text-align: center; color: #10b981;">Checklist - MONTAGEM DE CPU</h1>
      <div style="margin-bottom: 20px;">
        <strong>ID do PC:</strong> ${build.id}<br>
        <strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}
      </div>
      ${checklistContent}
    </div>
  `;
  
  window.print();
  document.body.innerHTML = originalContent;
  initializeApp(); // Re-inicializa a aplicação
}

// Atualize a função initializeApp para incluir os listeners da checklist:
function initializeApp() {
  document.getElementById("pc-id").value = generateNextId();
  updateSavedCount();
  createSocketButtons();
  setupChecklistListeners(); // ← ADICIONE ESTA LINHA
  
  // Botão voltar
  document.getElementById('back-to-index').addEventListener('click', function() {
    window.location.href = '../index.html';
  });
}