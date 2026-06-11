const STORAGE_KEY = "aid-planner-matters-v1";
const LAST_OPENED_KEY = "aid-planner-last-opened-v1";

function readStore() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveMatterToDevice(matter) {
  if (!matter?.matterId) return;
  const store = readStore();
  store[matter.matterId] = matter;
  writeStore(store);
}

export function loadMatterFromDevice(matterId) {
  if (!matterId) return null;
  const store = readStore();
  return store[matterId] || null;
}

export function listLocalMatters() {
  const store = readStore();
  return Object.values(store).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

export function deleteLocalMatter(matterId) {
  const store = readStore();
  delete store[matterId];
  writeStore(store);
  if (getLastOpenedMatterId() === matterId) {
    window.localStorage.removeItem(LAST_OPENED_KEY);
  }
}

export function getLastOpenedMatterId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(LAST_OPENED_KEY) || "";
}

export function setLastOpenedMatterId(matterId) {
  if (typeof window === "undefined" || !matterId) return;
  window.localStorage.setItem(LAST_OPENED_KEY, matterId);
}
