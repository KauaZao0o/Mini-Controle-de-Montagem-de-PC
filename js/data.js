// --- Dados do projeto ---
const sockets = ['775','1156','1155','1150','1151','1700','1200'];

const cpusBySocket = {
  '775': ['Core2Duo','Dual Core','Core2Quad'],
  '1156': ['Core i3','Core i5','Core i7'],
  '1155': ['Core i3','Core i5','Core i7'],
  '1150': ['Core i3','Core i5','Core i7'],
  '1151': ['Core i3','Core i5','Core i7'],
  '1200': ['Core i3','Core i5','Core i7','Core i9'],
  '1700': ['Ryzen 3','Ryzen 5','Ryzen 7','Ryzen 9']
};

const freqByCpu = {
  'Core2Duo': ['1.6','1.8','2.0','2.4','2.66'],
  'Dual Core': ['1.8','2.0','2.2','2.6'],
  'Core2Quad': ['2.4','2.66','2.83'],
  'Core i3': ['2.4','2.6','3.0'],
  'Core i5': ['2.6','2.8','3.0','3.4'],
  'Core i7': ['2.8','3.0','3.6','4.0'],
  'Core i9': ['3.1','3.4','3.8','4.2'],
  'Ryzen 3': ['2.6','3.0','3.6'],
  'Ryzen 5': ['2.8','3.2','3.6','4.0'],
  'Ryzen 7': ['3.0','3.6','4.0','4.2'],
  'Ryzen 9': ['3.4','3.8','4.2','4.6']
};

const memTypesBySocket = {
  '775': ['DDR2','DDR3'],
  'default': ['DDR4']
};

const hdOptions = ['160GB','250GB','320GB','500GB'];
const osOptions = ['Windows 10','Windows 11'];

// Funções auxiliares para geração de SKU
function getSocketIndex(socket) { 
  return sockets.indexOf(socket); 
}

function getCpuIndex(cpu, socket) { 
  return (cpusBySocket[socket] || []).indexOf(cpu); 
}

function getFreqIndex(freq, cpu) { 
  return (freqByCpu[cpu] || []).indexOf(freq); 
}

function getMemTypeIndex(memType, socket) { 
  return (memTypesBySocket[socket] || memTypesBySocket['default']).indexOf(memType); 
}

function getMemConfigIndex(memConfig, cpu) {
  const legacy = ['Core2Duo','Dual Core','Core2Quad'];
  let list = legacy.includes(cpu) ? 
    ['2x2GB (total 4GB)','4x1GB (total 4GB)'] : 
    ['1x8GB (8GB)','2x8GB (16GB)','2x16GB (32GB)'];
  return list.indexOf(memConfig);
}

function getHdIndex(hd) { 
  return hdOptions.indexOf(hd); 
}

function getOsIndex(os) { 
  return osOptions.indexOf(os); 
}

function generateSKU(build) {
  if (!build.socket || !build.cpu || !build.freq || !build.memType || !build.memConfig || !build.hd || !build.os) return '';
  
  return '' +
    getSocketIndex(build.socket) +
    getCpuIndex(build.cpu, build.socket) +
    getFreqIndex(build.freq, build.cpu) +
    getMemTypeIndex(build.memType, build.socket) +
    getMemConfigIndex(build.memConfig, build.cpu) +
    getHdIndex(build.hd) +
    getOsIndex(build.os);
}