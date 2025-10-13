// LocalStorage
const STORE_KEY = 'pc-montagens';

function loadSaved() {
  try { 
    const raw = localStorage.getItem(STORE_KEY); 
    return raw ? JSON.parse(raw) : []; 
  } catch(e) { 
    console.error('Erro ao carregar dados:', e);
    return []; 
  }
}

function saveBuild(build) { 
  const arr = loadSaved(); 
  arr.push(build); 
  localStorage.setItem(STORE_KEY, JSON.stringify(arr));
}

function updateBuild(originalId, updatedBuild) {
  let builds = loadSaved();
  const buildIndex = builds.findIndex(b => b.id === originalId);
  
  if (buildIndex === -1) return false;
  
  builds[buildIndex] = updatedBuild;
  localStorage.setItem(STORE_KEY, JSON.stringify(builds));
  return true;
}

function deleteBuild(pcId) {
  let builds = loadSaved();
  builds = builds.filter(b => b.id !== pcId);
  localStorage.setItem(STORE_KEY, JSON.stringify(builds));
  return true;
}

function hasId(id) { 
  return loadSaved().some(x => x.id === id); 
}

function generateNextId() {
  const builds = loadSaved();
  if (builds.length === 0) return "PC001";
  
  const lastId = builds[builds.length - 1].id;
  const num = parseInt(lastId.replace("PC", "")) || 0;
  const nextNum = num + 1;
  return "PC" + String(nextNum).padStart(3, "0");
}

// Checklist Storage
const CHECKLIST_STORE_KEY = 'pc_checklists';

function saveChecklistData(pcId, checklistData) {
  const existingChecklists = JSON.parse(localStorage.getItem(CHECKLIST_STORE_KEY) || '{}');
  existingChecklists[pcId] = {
    ...checklistData,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(CHECKLIST_STORE_KEY, JSON.stringify(existingChecklists));
  return true;
}

function loadChecklistData(pcId) {
  const existingChecklists = JSON.parse(localStorage.getItem(CHECKLIST_STORE_KEY) || '{}');
  return existingChecklists[pcId] || null;
}

function loadAllChecklists() {
  return JSON.parse(localStorage.getItem(CHECKLIST_STORE_KEY) || '{}');
}