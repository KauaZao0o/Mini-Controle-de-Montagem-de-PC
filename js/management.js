// Função para exportar CSV por usuário
function exportUserCSV(userType) {
  const builds = loadSaved();
  if (builds.length === 0) { 
    alert("Nenhuma montagem salva para exportar."); 
    return; 
  }

  const header = [
    `"${userType}"`, "", "", "", "", "", "", "", "", "", ""
  ];

  const subHeader = [
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
    "Responsável"
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

  const csvContent = [header.join(","), subHeader.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `montagens_${userType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  alert(`CSV exportado para ${userType} com sucesso!`);
}

function loadPCList() {
  const builds = loadSaved();
  const container = document.getElementById('pc-list');
  const searchTerm = document.getElementById('search-pc').value.toLowerCase();
  
  if (builds.length === 0) {
    container.innerHTML = '<div class="empty-state">Nenhum PC cadastrado</div>';
    document.getElementById('total-pcs').textContent = '0';
    return;
  }
  
  document.getElementById('total-pcs').textContent = builds.length;
  
  const filteredBuilds = builds.filter(build => 
    build.id.toLowerCase().includes(searchTerm) ||
    build.socket.toLowerCase().includes(searchTerm) ||
    build.cpu.toLowerCase().includes(searchTerm) ||
    build.memType.toLowerCase().includes(searchTerm)
  );
  
  if (filteredBuilds.length === 0) {
    container.innerHTML = '<div class="empty-state">Nenhum PC encontrado</div>';
    return;
  }
  
  container.innerHTML = filteredBuilds.map(build => `
    <div class="pc-item">
      <div class="pc-item-content">
        <div class="pc-info">
          <div class="pc-id">${build.id}</div>
          <div class="pc-details">
            ${build.socket} | ${build.cpu} @ ${build.freq}GHz | ${build.memType} | ${build.hd}
          </div>
          <div class="pc-timestamp">
            ${new Date(build.timestamp).toLocaleString('pt-BR')}
          </div>
        </div>
        <div class="pc-actions">
          <button class="edit-btn" onclick="editPC('${build.id}')">Editar</button>
          <button class="delete-btn" onclick="deletePC('${build.id}')">Excluir</button>
        </div>
      </div>
    </div>
  `).join('');
}

function editPC(pcId) {
  const builds = loadSaved();
  const build = builds.find(b => b.id === pcId);
  
  if (!build) {
    alert('PC não encontrado!');
    return;
  }
  
  const modal = document.getElementById('edit-modal');
  const form = document.getElementById('edit-form');
  
  form.innerHTML = `
    <input type="hidden" id="edit-pc-id" value="${build.id}">
    
    <div class="form-group">
      <label>ID do PC:</label>
      <input type="text" id="edit-id" value="${build.id}">
    </div>
    
    <div class="form-group">
      <label>Socket:</label>
      <select id="edit-socket">
        ${sockets.map(s => `<option value="${s}" ${s === build.socket ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>
    
    <div class="form-group">
      <label>Processador:</label>
      <select id="edit-cpu"></select>
    </div>
    
    <div class="form-group">
      <label>Frequência (GHz):</label>
      <select id="edit-freq"></select>
    </div>
    
    <div class="form-group">
      <label>Tipo de Memória:</label>
      <select id="edit-memtype">
        ${(memTypesBySocket[build.socket] || memTypesBySocket['default']).map(m => 
          `<option value="${m}" ${m === build.memType ? 'selected' : ''}>${m}</option>`
        ).join('')}
      </select>
    </div>
    
    <div class="form-group">
      <label>Configuração de Memória:</label>
      <select id="edit-memconfig"></select>
    </div>
    
    <div class="form-group">
      <label>HD:</label>
      <select id="edit-hd">
        ${hdOptions.map(h => `<option value="${h}" ${h === build.hd ? 'selected' : ''}>${h}</option>`).join('')}
      </select>
    </div>
    
    <div class="form-group">
      <label>Sistema Operacional:</label>
      <select id="edit-os">
        ${osOptions.map(o => `<option value="${o}" ${o === build.os ? 'selected' : ''}>${o}</option>`).join('')}
      </select>
    </div>
  `;
  
  populateEditCPUOptions(build.socket, build.cpu);
  
  document.getElementById('edit-socket').addEventListener('change', function() {
    populateEditCPUOptions(this.value, '');
  });
  
  document.getElementById('edit-cpu').addEventListener('change', function() {
    populateEditFreqOptions(this.value, '');
  });
  
  modal.style.display = 'flex';
}

function populateEditCPUOptions(socket, selectedCPU) {
  const cpuSelect = document.getElementById('edit-cpu');
  const cpus = cpusBySocket[socket] || ['Generic CPU'];
  
  cpuSelect.innerHTML = cpus.map(cpu => 
    `<option value="${cpu}" ${cpu === selectedCPU ? 'selected' : ''}>${cpu}</option>`
  ).join('');
  
  populateEditFreqOptions(selectedCPU || cpus[0], '');
}

function populateEditFreqOptions(cpu, selectedFreq) {
  const freqSelect = document.getElementById('edit-freq');
  const freqs = freqByCpu[cpu] || ['2.0','3.0'];
  
  freqSelect.innerHTML = freqs.map(freq => 
    `<option value="${freq}" ${freq === selectedFreq ? 'selected' : ''}>${freq} GHz</option>`
  ).join('');
  
  populateEditMemConfigOptions(cpu, '');
}

function populateEditMemConfigOptions(cpu, selectedConfig) {
  const memConfigSelect = document.getElementById('edit-memconfig');
  const legacy = ['Core2Duo','Dual Core','Core2Quad'];
  let configs = [];
  
  if (legacy.includes(cpu)) {
    configs = ['2x2GB (total 4GB)','4x1GB (total 4GB)'];
  } else {
    configs = ['1x8GB (8GB)','2x8GB (16GB)','2x16GB (32GB)'];
  }
  
  memConfigSelect.innerHTML = configs.map(config => 
    `<option value="${config}" ${config === selectedConfig ? 'selected' : ''}>${config}</option>`
  ).join('');
}

function saveEdit() {
  const originalId = document.getElementById('edit-pc-id').value;
  const newId = document.getElementById('edit-id').value.trim();
  const socket = document.getElementById('edit-socket').value;
  const cpu = document.getElementById('edit-cpu').value;
  const freq = document.getElementById('edit-freq').value;
  const memType = document.getElementById('edit-memtype').value;
  const memConfig = document.getElementById('edit-memconfig').value;
  const hd = document.getElementById('edit-hd').value;
  const os = document.getElementById('edit-os').value;
  
  if (!newId || !socket || !cpu || !freq || !memType || !memConfig || !hd || !os) {
    alert('Preencha todos os campos!');
    return;
  }
  
  let builds = loadSaved();
  const buildIndex = builds.findIndex(b => b.id === originalId);
  
  if (buildIndex === -1) {
    alert('PC não encontrado!');
    return;
  }
  
  if (newId !== originalId && builds.some(b => b.id === newId)) {
    alert('Já existe um PC com este ID!');
    return;
  }
  
  const updatedBuild = {
    ...builds[buildIndex],
    id: newId,
    socket,
    cpu,
    freq,
    memType,
    memConfig,
    hd,
    os
  };
  
  if (updateBuild(originalId, updatedBuild)) {
    closeEditModal();
    loadPCList();
    alert('PC atualizado com sucesso!');
  }
}

function deletePC(pcId) {
  if (!confirm(`Tem certeza que deseja excluir o PC ${pcId}?`)) {
    return;
  }
  
  if (deleteBuild(pcId)) {
    loadPCList();
    alert('PC excluído com sucesso!');
  }
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  loadPCList();
  
  document.getElementById('search-pc').addEventListener('input', loadPCList);
  
  document.getElementById('edit-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeEditModal();
    }
  });
});