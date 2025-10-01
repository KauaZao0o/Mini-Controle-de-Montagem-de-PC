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
// sockets modernos => DDR4 (simplificação)
'default':['DDR4']
};


const hdOptions = ['160GB','250GB','320GB','500GB'];
const osOptions = ['Windows 10','Windows 11'];


// Estado da montagem
let build = {
id:null, socket:null, cpu:null, freq:null, memType:null, memConfig:null, hd:null, os:null
};


// Helper: localStorage para armazenar IDs e builds
const STORE_KEY = 'pc-montagens';
function loadSaved(){
try{const raw = localStorage.getItem(STORE_KEY); return raw?JSON.parse(raw):[] }catch(e){return[]}
}
function saveBuild(b){const arr = loadSaved(); arr.push(b); localStorage.setItem(STORE_KEY, JSON.stringify(arr));}
function hasId(id){return loadSaved().some(x=>x.id===id)}


// UI referências
const savedCount = document.getElementById('saved-count');
function updateSavedCount(){savedCount.textContent = loadSaved().length}
updateSavedCount();

    // Dica: clique direto nas opções — o fluxo é com "um toque". O botão "Confirmar..." avança quando tudo estiver selecionado.