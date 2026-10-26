// ---------- 状态 ----------
let images = [];           // [{id, url, w, h, alt, selected}]  顺序即数组顺序
let currentTab = null;
let currentJob = null;

const $ = id => document.getElementById(id);
const pickView = $('pickView'), progressView = $('progressView');
const grid = $('grid'), pGrid = $('pGrid'), statusEl = $('status'), folderInput = $('folderName');
const confirmBtn = $('confirmBtn');

const send = msg => new Promise(resolve => chrome.runtime.sendMessage(msg, resolve));
const stateKey = () => 'tab_' + currentTab.id;

function padDigits(count) {
  return Math.max(2, String(Math.max(0, count - 1)).length);
}

// ---------- 状态持久化（每个标签页独立，页面刷新/跳转时由后台清除） ----------
async function loadState() {
  const r = await chrome.storage.session.get(stateKey());
  const st = r[stateKey()];
  return st && st.url === currentTab.url ? st : null;
}
let saveTimer = null;
function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    chrome.storage.session.set({ [stateKey()]: { url: currentTab.url, folder: folderInput.value, images } });
  }, 80);
}
function clearState() {
  return chrome.storage.session.remove(stateKey());
}

// ---------- 选图视图 ----------
async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function pageSupported() {
  return currentTab && /^(https?|file):/i.test(currentTab.url || '');
}

async function scan() {
  grid.innerHTML = '';
  $('empty').hidden = true;
  images = [];
  statusEl.textContent = t('scanningLong');
  confirmBtn.disabled = true;

  if (!pageSupported()) {
    statusEl.textContent = t('pageUnsupported');
    showEmpty(t('pageUnsupportedLong'), false);
    return;
  }

  const resp = await send({ type: 'scan', tabId: currentTab.id });
  if (!resp || resp.error) {
    statusEl.textContent = t('scanFailed');
    showEmpty(t('scanFailedLong', resp ? resp.error : t('noResponse')), true);
    return;
  }
  images = (resp.result.images || []).map((im, i) => ({ ...im, id: i, selected: true }));
  if (!images.length) {
    statusEl.textContent = t('noImages');
    showEmpty(t('noImagesLong'), true);
    saveState();
    return;
  }
  render();
  saveState();
  folderInput.focus();
}

function showEmpty(text, withScanBtn) {
  $('emptyText').textContent = text;
  $('scanBtn').hidden = !withScanBtn;
  $('empty').hidden = false;
}

function makeCard(im, extraClass) {
  const card = document.createElement('div');
  card.className = 'card ' + extraClass;
  card.dataset.id = im.id;

  const img = document.createElement('img');
  img.className = 'thumb';
  img.loading = 'lazy';
  img.src = im.url;
  img.alt = '';
  img.onerror = () => { img.style.opacity = '.3'; };

  const badge = document.createElement('div');
  badge.className = 'badge';
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.title = im.url;
  meta.textContent = (im.w && im.h ? `${im.w}×${im.h}  ` : '') + fileLabel(im.url);
  card.append(img, badge, meta);
  return card;
}

function render() {
  grid.innerHTML = '';
  $('empty').hidden = true;
  for (const im of images) {
    const card = makeCard(im, im.selected ? 'selected' : 'unselected');
    card.draggable = true;
    const check = document.createElement('div');
    check.className = 'check';
    check.textContent = '✓';
    card.appendChild(check);
    card.addEventListener('click', () => toggle(im.id));
    grid.appendChild(card);
  }
  updateNumbers();
}

function fileLabel(url) {
  if (url.startsWith('data:')) return t('inlineImage');
  try {
    const p = new URL(url).pathname.split('/').filter(Boolean).pop() || '';
    return decodeURIComponent(p).slice(0, 40);
  } catch { return ''; }
}

function toggle(id) {
  const im = images.find(x => x.id === id);
  im.selected = !im.selected;
  const card = grid.querySelector(`.card[data-id="${id}"]`);
  card.classList.toggle('selected', im.selected);
  card.classList.toggle('unselected', !im.selected);
  updateNumbers();
  saveState();
}

function updateNumbers() {
  const selected = images.filter(i => i.selected);
  const digits = padDigits(selected.length);
  let n = 0;
  for (const im of images) {
    const badge = grid.querySelector(`.card[data-id="${im.id}"] .badge`);
    if (!badge) continue;
    badge.textContent = im.selected ? String(n++).padStart(digits, '0') : '—';
  }
  statusEl.textContent = t('countStatus', [images.length, selected.length]);
  confirmBtn.disabled = selected.length === 0;
}

// ---------- 拖拽排序 ----------
let dragId = null;
grid.addEventListener('dragstart', e => {
  const card = e.target.closest('.card');
  if (!card) return;
  dragId = Number(card.dataset.id);
  card.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(dragId));
});
grid.addEventListener('dragover', e => {
  e.preventDefault();
  if (dragId === null) return;
  const target = e.target.closest('.card');
  const dragging = grid.querySelector('.card.dragging');
  if (!target || !dragging || target === dragging) return;
  const rect = target.getBoundingClientRect();
  const before = (e.clientY - rect.top) / rect.height < 0.5
    ? (e.clientX - rect.left) / rect.width < 0.75
    : (e.clientX - rect.left) / rect.width < 0.25;
  if (before) grid.insertBefore(dragging, target);
  else grid.insertBefore(dragging, target.nextSibling);
});
grid.addEventListener('drop', e => e.preventDefault());
grid.addEventListener('dragend', () => {
  const dragging = grid.querySelector('.card.dragging');
  if (dragging) dragging.classList.remove('dragging');
  dragId = null;
  const byId = new Map(images.map(i => [i.id, i]));
  images = [...grid.querySelectorAll('.card')].map(c => byId.get(Number(c.dataset.id)));
  updateNumbers();
  saveState();
});

// ---------- 按钮 ----------
$('selectAllBtn').addEventListener('click', () => { images.forEach(i => i.selected = true); render(); saveState(); });
$('selectNoneBtn').addEventListener('click', () => { images.forEach(i => i.selected = false); render(); saveState(); });
$('rescanBtn').addEventListener('click', scan);
$('scanBtn').addEventListener('click', scan);
$('settingsBtn').addEventListener('click', () => chrome.runtime.openOptionsPage());
folderInput.addEventListener('input', () => { folderInput.classList.remove('invalid'); saveState(); });
folderInput.addEventListener('keydown', e => { if (e.key === 'Enter') confirmBtn.click(); });

confirmBtn.addEventListener('click', async () => {
  const folder = folderInput.value.trim();
  if (!folder) {
    folderInput.classList.add('invalid');
    folderInput.focus();
    folderInput.placeholder = t('folderNameFirst');
    return;
  }
  const items = images.filter(i => i.selected).map(i => ({ url: i.url, w: i.w, h: i.h }));
  if (!items.length) return;
  confirmBtn.disabled = true;
  // 直接写入模式：趁这次点击（用户手势）把文件夹权限确认好
  const settings = await loadSettings();
  if (settings.saveMode !== 'browser') {
    const ok = await ensureDirPermission();
    if (!ok) { confirmBtn.disabled = false; return; }
  }
  const resp = await send({ type: 'start', folder, tabId: currentTab.id, items });
  if (!resp || resp.error) {
    alert(t('cannotStart', resp ? resp.error : t('noResponse')));
    confirmBtn.disabled = false;
    return;
  }
  showProgress(resp.job);
});

$('jobBannerBtn').addEventListener('click', () => { if (currentJob) showProgress(currentJob); });

// 直接写入模式的文件夹与权限检查。必须在用户点击的事件里调用（requestPermission 需要用户手势）。
async function ensureDirPermission() {
  let handle = null;
  try { handle = await loadDirHandle(); } catch {}
  if (!handle) {
    if (confirm(t('noDirConfirm'))) chrome.runtime.openOptionsPage();
    return false;
  }
  let perm = await handle.queryPermission({ mode: 'readwrite' });
  if (perm !== 'granted') {
    try { perm = await handle.requestPermission({ mode: 'readwrite' }); } catch (e) { perm = 'denied'; }
    if (perm !== 'granted') {
      if (confirm(t('needPermConfirm', handle.name))) chrome.runtime.openOptionsPage();
      return false;
    }
  }
  return true;
}

// 进度页里的"被卡住"提示（没选文件夹 / 需要授权）
async function handleBlocked(job) {
  const gate = $('pGate');
  if (!job.blocked) { gate.hidden = true; return; }
  gate.hidden = false;
  const btn = $('pGateBtn'), txt = $('pGateText');
  if (job.blocked === 'noDir') {
    txt.textContent = t('noDirShort');
    btn.textContent = t('goPickDir');
    btn.onclick = () => chrome.runtime.openOptionsPage();
  } else if (job.blocked === 'needPermission') {
    txt.textContent = t('needPermShort', job.blockedDir);
    btn.textContent = t('grantAccessTo', job.blockedDir);
    btn.onclick = async () => {
      if (await ensureDirPermission()) { const r = await send({ type: 'resumeDirect' }); if (r && r.job) renderProgress(r.job); }
    };
  } else {
    txt.textContent = t('errorPrefix', job.blocked);
    btn.textContent = t('retry');
    btn.onclick = async () => { const r = await send({ type: 'resumeDirect' }); if (r && r.job) renderProgress(r.job); };
  }
}

function updateBanner() {
  const b = $('jobBanner');
  if (!currentJob || currentJob.tabId !== currentTab.id) { b.hidden = true; return; }
  const j = currentJob;
  $('jobBannerText').textContent = j.running
    ? t('bannerRunning', [j.folder, j.done + j.failed, j.total])
    : (j.failed ? t('bannerDoneFailed', [j.folder, j.done, j.failed]) : t('bannerDone', [j.folder, j.done]));
  b.hidden = false;
}

// ---------- 进度视图 ----------
function showProgress(job) {
  pickView.hidden = true;
  progressView.hidden = false;
  pGrid.innerHTML = '';
  renderProgress(job);
}

function showPick() {
  progressView.hidden = true;
  pickView.hidden = false;
  updateBanner();
}

function renderProgress(job) {
  if (!job) return;
  currentJob = job;
  $('pFolder').textContent = job.folder;
  const finished = job.done + job.failed;
  const pending = job.total - finished;
  const pct = job.total ? Math.round(finished / job.total * 100) : 0;
  const bar = $('pBar');
  bar.style.width = pct + '%';
  bar.classList.toggle('hasFail', job.failed > 0);
  bar.classList.toggle('allDone', !job.running && job.failed === 0 && job.total > 0);

  $('pTitle').textContent = job.running ? t('downloading') : (job.failed ? t('doneWithFail') : t('allDone'));
  $('pCount').textContent = `${finished} / ${job.total}（${pct}%）`;
  $('pDone').textContent = job.done;
  $('pFailed').textContent = job.failed;
  $('pPending').textContent = pending;
  const direct = job.mode === 'direct';
  handleBlocked(job);
  $('retryBtn').hidden = job.running || job.failed === 0;
  $('openFolderBtn').hidden = direct || job.done === 0;
  $('openFolderBtn').dataset.downloadId = job.firstDoneId || '';
  $('pHint').hidden = !job.running;
  $('pHint').textContent = direct ? t('hintDirect', job.location || job.folder) : t('hintBackground');

  // 卡片：首次创建，之后只更新状态
  const digits = padDigits(job.total);
  for (const it of job.items) {
    let card = pGrid.querySelector(`.card[data-id="${it.idx}"]`);
    if (!card) {
      card = makeCard({ id: it.idx, url: it.url, w: it.w, h: it.h }, 'pcard');
      const state = document.createElement('div');
      state.className = 'state';
      card.appendChild(state);
      card.querySelector('.badge').textContent = String(it.idx).padStart(digits, '0');
      pGrid.appendChild(card);
    }
    card.classList.remove('pending', 'downloading', 'done', 'failed');
    card.classList.add(it.status);
    const state = card.querySelector('.state');
    const meta = card.querySelector('.meta');
    if (it.status === 'done') { state.textContent = '✓'; card.title = it.url; }
    else if (it.status === 'failed') { state.textContent = '✗'; card.title = it.error; }
    else state.textContent = '';
    if (it.status === 'failed') { meta.classList.add('err'); meta.textContent = t('failedPrefix', it.error); meta.title = it.error; }
    else { meta.classList.remove('err'); meta.textContent = it.finalName || ''; meta.title = it.url; }
  }
}

$('retryBtn').addEventListener('click', async () => {
  const resp = await send({ type: 'retry' });
  if (resp && resp.job) renderProgress(resp.job);
});
$('openFolderBtn').addEventListener('click', () => {
  const id = Number($('openFolderBtn').dataset.downloadId) || null;
  send({ type: 'showFolder', downloadId: id });
});
$('backBtn').addEventListener('click', showPick);

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type !== 'jobUpdate') return;
  currentJob = msg.job;
  if (!progressView.hidden) renderProgress(msg.job);
  else updateBanner();
});

// ---------- 启动 ----------
(async () => {
  currentTab = await getActiveTab();
  if (!currentTab) return;
  const resp = await send({ type: 'getJob' });
  currentJob = resp && resp.job;

  // 本标签页有正在进行的下载：直接看进度
  if (currentJob && currentJob.tabId === currentTab.id && currentJob.running) {
    showProgress(currentJob);
    return;
  }

  // 有保存的状态：直接恢复，不重新扫描
  const st = await loadState();
  if (st) {
    images = st.images || [];
    folderInput.value = st.folder || '';
    if (images.length) render();
    else {
      statusEl.textContent = t('noImages');
      showEmpty(t('noImagesLong'), true);
    }
    updateBanner();
    return;
  }
  updateBanner();
  scan();
})();
