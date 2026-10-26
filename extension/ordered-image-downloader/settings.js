// 共用的设置读写（popup / options / background 都会用到）
const DEFAULT_SETTINGS = {
  filterEnabled: true,   // 启用尺寸过滤
  minWidth: 100,         // 最小宽度（px）
  minHeight: 100,        // 最小高度（px）
  dedupe: true,          // 相同 URL 只保留一张
  autoScroll: true,      // 扫描前自动滚动页面，触发懒加载
  includeBackground: false, // 同时抓取 CSS 背景图
  concurrency: 3,        // 同时下载的数量
  saveMode: 'browser'    // browser = 走浏览器下载（默认）；direct = 直接写入你选的文件夹
};

function loadSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, items => resolve({ ...DEFAULT_SETTINGS, ...items }));
  });
}

function saveSettings(patch) {
  return new Promise(resolve => chrome.storage.sync.set(patch, resolve));
}

// ---------- 保存位置（文件系统访问句柄，存在 IndexedDB 里） ----------
// 仅在扩展页面（弹窗 / 设置 / 下载页）中可用，后台 Service Worker 不使用。
const DIR_DB = 'img-dl-ext', DIR_STORE = 'handles', DIR_KEY = 'parentDir';
function dirDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DIR_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DIR_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function loadDirHandle() {
  const db = await dirDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DIR_STORE, 'readonly');
    const req = tx.objectStore(DIR_STORE).get(DIR_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}
async function saveDirHandle(handle) {
  const db = await dirDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DIR_STORE, 'readwrite');
    tx.objectStore(DIR_STORE).put(handle, DIR_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function pickDirHandle() {
  const handle = await window.showDirectoryPicker({ id: 'img-dl-parent', mode: 'readwrite', startIn: 'desktop' });
  await saveDirHandle(handle);
  return handle;
}
