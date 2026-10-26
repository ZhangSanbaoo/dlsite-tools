const fields = ['filterEnabled', 'minWidth', 'minHeight', 'dedupe', 'autoScroll', 'includeBackground', 'concurrency', 'saveMode'];
let savedTimer = null;

function flashSaved() {
  const el = document.getElementById('saved');
  el.textContent = t('saved');
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => { el.textContent = ''; }, 1200);
}

function syncSub() {
  document.getElementById('filterSizes').hidden = !document.getElementById('filterEnabled').checked;
  const direct = document.getElementById('saveMode').value === 'direct';
  document.getElementById('dirRow').hidden = !direct;
  document.getElementById('noteDirect').hidden = !direct;
  document.getElementById('noteBrowser').hidden = direct;
}
async function refreshDirName() {
  const nameEl = document.getElementById('dirName'), grantBtn = document.getElementById('grantDirBtn');
  try {
    const h = await loadDirHandle();
    if (!h) { nameEl.textContent = t('notChosen'); grantBtn.hidden = true; return; }
    const perm = await h.queryPermission({ mode: 'readwrite' });
    nameEl.textContent = h.name + (perm === 'granted' ? t('granted') : t('notGranted'));
    grantBtn.hidden = perm === 'granted';
    grantBtn.onclick = async () => { try { await h.requestPermission({ mode: 'readwrite' }); } catch {} refreshDirName(); };
  } catch { nameEl.textContent = t('notChosen'); grantBtn.hidden = true; }
}
document.getElementById('pickDirBtn').addEventListener('click', async () => {
  if (!('showDirectoryPicker' in window)) { alert(t('noFsApi')); return; }
  try { await pickDirHandle(); await refreshDirName(); flashSaved(); } catch {}
});
refreshDirName();

(async () => {
  const s = await loadSettings();
  for (const f of fields) {
    const el = document.getElementById(f);
    if (el.type === 'checkbox') el.checked = !!s[f];
    else el.value = s[f];
    el.addEventListener('change', async () => {
      let v;
      if (el.type === 'checkbox') v = el.checked;
      else if (el.tagName === 'SELECT') v = el.value;
      else {
        v = parseInt(el.value, 10);
        if (isNaN(v)) v = DEFAULT_SETTINGS[f];
        if (el.min !== '') v = Math.max(parseInt(el.min, 10), v);
        if (el.max !== '') v = Math.min(parseInt(el.max, 10), v);
        el.value = v;
      }
      await saveSettings({ [f]: v });
      syncSub();
      flashSaved();
    });
  }
  syncSub();
})();
