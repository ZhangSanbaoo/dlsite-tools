importScripts('i18n.js', 'settings.js', 'collector.js');

// ---------- 当前任务状态（popup 关闭后下载仍会继续） ----------
let job = null;
// downloadId -> { item, resolve, reject }
const pendingDownloads = new Map();

const MIME_EXT = {
  'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/pjpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
  'image/webp': 'webp', 'image/avif': 'avif', 'image/svg+xml': 'svg', 'image/bmp': 'bmp',
  'image/x-ms-bmp': 'bmp', 'image/tiff': 'tif', 'image/x-icon': 'ico', 'image/vnd.microsoft.icon': 'ico',
  'image/heic': 'heic', 'image/heif': 'heif', 'image/jxl': 'jxl'
};
const EXT_RE = /\.(jpe?g|png|gif|webp|avif|svg|bmp|tiff?|ico|heic|heif|jxl)$/i;

function extFromUrl(url) {
  try {
    if (url.startsWith('data:')) {
      const m = url.match(/^data:([^;,]+)/);
      return m ? MIME_EXT[m[1].toLowerCase()] || null : null;
    }
    const m = new URL(url).pathname.match(EXT_RE);
    return m ? m[1].toLowerCase().replace('jpeg', 'jpg').replace('tiff', 'tif') : null;
  } catch { return null; }
}
function extFromMime(mime) {
  return mime ? MIME_EXT[mime.toLowerCase().split(';')[0].trim()] || null : null;
}
function extFromFilename(name) {
  const m = (name || '').match(EXT_RE);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg').replace('tiff', 'tif') : null;
}

function sanitizeFolder(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_').replace(/^\.+/, '').trim().slice(0, 120) || 'images';
}

function broadcast() {
  if (!job) return;
  chrome.runtime.sendMessage({ type: 'jobUpdate', job: publicJob() }).catch(() => {});
}

function publicJob() {
  if (!job) return null;
  return {
    folder: job.folder,
    tabId: job.tabId,
    mode: job.mode || 'browser',
    location: job.location || '',
    blocked: job.blocked || '',
    blockedDir: job.blockedDir || '',
    running: job.running,
    total: job.items.length,
    done: job.items.filter(i => i.status === 'done').length,
    failed: job.items.filter(i => i.status === 'failed').length,
    items: job.items.map(i => ({ idx: i.idx, name: i.name, finalName: i.finalName || '', url: i.url, w: i.w, h: i.h, status: i.status, error: i.error || '' })),
    firstDoneId: (job.items.find(i => i.status === 'done' && i.downloadId) || {}).downloadId || null
  };
}

// 其他下载扩展（如 IDM）会给每个下载"建议"文件名，从而覆盖 download() 里传的 filename。
// Chrome 的规则是：最后安装的、且传了建议对象的扩展获胜。所以这里必须把我们的
// 文件名再建议一次，否则会被覆盖。（IDM 卡片上因此出现的提示无害。）
chrome.downloads.onDeterminingFilename.addListener((dl, suggest) => {
  if (!job) return;
  const rec = pendingDownloads.get(dl.id);
  const item = rec ? rec.item : job.items.find(i => i.status === 'downloading' && i.lastUrl === dl.url);
  if (!item || !item.finalName) return;
  suggest({ filename: `${job.folder}/${item.finalName}`, conflictAction: 'overwrite' });
});

chrome.downloads.onChanged.addListener(delta => {
  const rec = pendingDownloads.get(delta.id);
  if (!rec) return;
  if (delta.state) {
    if (delta.state.current === 'complete') {
      pendingDownloads.delete(delta.id);
      rec.resolve();
    } else if (delta.state.current === 'interrupted') {
      pendingDownloads.delete(delta.id);
      rec.reject(new Error(delta.error ? delta.error.current : 'INTERRUPTED'));
    }
  }
});

// 不使用 onDeterminingFilename（每个下载只允许一个扩展注册，会和 IDM 等冲突），
// 所以扩展名必须在调用 download() 之前确定好
function downloadOnce(item, url, ext) {
  item.finalName = `${item.name}.${ext}`;
  item.lastUrl = url;
  return new Promise((resolve, reject) => {
    chrome.downloads.download(
      { url, filename: `${job.folder}/${item.finalName}`, conflictAction: 'overwrite', saveAs: false },
      id => {
        if (chrome.runtime.lastError || id === undefined) {
          reject(new Error(chrome.runtime.lastError ? chrome.runtime.lastError.message : 'download failed'));
          return;
        }
        item.downloadId = id;
        pendingDownloads.set(id, { item, resolve, reject });
      }
    );
  });
}

async function fetchInBackground(url) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
}

// 通过 HEAD 请求探测 Content-Type 来确定扩展名
async function sniffExt(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', credentials: 'include' });
    if (res.ok) return extFromMime(res.headers.get('content-type'));
  } catch {}
  return null;
}

async function fetchInTab(tabId, url) {
  const [r] = await chrome.scripting.executeScript({ target: { tabId }, func: fetchImageInPage, args: [url] });
  if (!r || !r.result) throw new Error('page fetch failed');
  return r.result;
}

// 三级尝试：直接下载 → 页面内 fetch（带 Referer）→ 后台 fetch（绕过 CORS）
async function downloadItem(item) {
  item.status = 'downloading';
  item.error = '';
  broadcast();
  const errors = [];
  const isData = item.url.startsWith('data:');
  let ext = item.ext || (isData ? extFromUrl(item.url) || 'jpg' : null) || (!isData ? await sniffExt(item.url) : null);

  if (ext) {
    try {
      await downloadOnce(item, item.url, ext);
      item.status = 'done'; broadcast(); return;
    } catch (e) { errors.push(t('errDirect', e.message)); }
  } else {
    errors.push(t('errNoType'));
  }

  if (!isData) {
    // 先在页面内取（带 Referer / Cookie），再在后台取（绕过 CORS）；
    // 得到的 data URL 自带 MIME，扩展名由此确定
    for (const [label, getter] of [['errInPage', () => fetchInTab(job.tabId, item.url)], ['errBackground', () => fetchInBackground(item.url)]]) {
      try {
        const dataUrl = await getter();
        await downloadOnce(item, dataUrl, extFromUrl(dataUrl) || ext || 'jpg');
        item.status = 'done'; broadcast(); return;
      } catch (e) { errors.push(t(label, e.message)); }
    }
  }

  item.status = 'failed';
  item.error = errors.join('; ');
  broadcast();
}

async function runQueue(items) {
  if (!job) return;
  job.running = true;
  broadcast();
  const settings = await loadSettings();
  const concurrency = Math.max(1, Math.min(8, settings.concurrency || 3));
  const queue = items.slice();
  const worker = async () => {
    while (queue.length) {
      const it = queue.shift();
      await downloadItem(it);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  job.running = false;
  broadcast();
}

function padDigits(count) {
  return Math.max(2, String(Math.max(0, count - 1)).length);
}

// ---------- 直接写入模式：隐藏的后台文档负责写文件 ----------
let offscreenReady = null;
async function ensureOffscreen() {
  if (!offscreenReady) {
    offscreenReady = (async () => {
      const has = chrome.offscreen.hasDocument ? await chrome.offscreen.hasDocument() : false;
      if (!has) {
        await chrome.offscreen.createDocument({
          url: 'offscreen.html',
          reasons: ['BLOBS'],
          justification: t('offscreenJustification')
        });
      }
    })().catch(e => { offscreenReady = null; throw e; });
  }
  await offscreenReady;
}
// 让后台文档开始/继续当前任务；返回 { ok } 或 { error: 'noDir' | 'needPermission' | 文本 }
async function runDirect() {
  await ensureOffscreen();
  const settings = await loadSettings();
  const msgs = {}; for (const k of ['errDirect', 'errInPage', 'errEmpty', 'noResponse', 'errJobRunning', 'errMkdir']) msgs[k] = t(k, ['$1', '$2', '$3']);
  const snapshot = { folder: job.folder, tabId: job.tabId, concurrency: settings.concurrency, msgs, items: job.items.map(i => ({ idx: i.idx, url: i.url, name: i.name, status: i.status })) };
  const r = await chrome.runtime.sendMessage({ target: 'offscreen', type: 'runJob', job: snapshot }).catch(e => ({ error: e.message }));
  if (!r || r.error) {
    job.running = false;
    job.blocked = r ? r.error : t('errOffscreenNoResp');
    job.blockedDir = r && r.dirName || '';
    broadcast();
  } else {
    job.blocked = '';
  }
  return r;
}

// ---------- 标签页刷新 / 跳转 / 关闭时清除保存的选图状态 ----------
chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status === 'loading' || info.url) chrome.storage.session.remove('tab_' + tabId);
});
chrome.tabs.onRemoved.addListener(tabId => chrome.storage.session.remove('tab_' + tabId));

// ---------- 消息处理 ----------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    switch (msg.type) {
      case 'getJob':
        sendResponse({ job: publicJob() });
        break;

      case 'scan': {
        const settings = await loadSettings();
        const [r] = await chrome.scripting.executeScript({
          target: { tabId: msg.tabId },
          func: collectImagesInPage,
          args: [settings]
        });
        sendResponse({ result: r ? r.result : { images: [] } });
        break;
      }

      case 'start': {
        if (job && job.running) { sendResponse({ error: t('errJobRunning') }); break; }
        const settings = await loadSettings();
        const digits = padDigits(msg.items.length);
        job = {
          folder: sanitizeFolder(msg.folder),
          tabId: msg.tabId,
          mode: settings.saveMode === 'browser' ? 'browser' : 'direct',
          running: false,
          items: msg.items.map((it, idx) => ({
            idx, url: it.url, w: it.w || 0, h: it.h || 0, ext: extFromUrl(it.url),
            name: String(idx).padStart(digits, '0'),
            status: 'pending', error: '', downloadId: null
          }))
        };
        if (job.mode === 'direct') {
          job.running = true;
          runDirect();                       // 后台文档会不断汇报进度
          await new Promise(r => setTimeout(r, 150));   // 让 noDir / needPermission 之类的即时错误先回来
        } else {
          runQueue(job.items);
        }
        sendResponse({ ok: true, job: publicJob() });
        break;
      }

      case 'resumeDirect': {   // 弹窗里授权完成后继续
        if (!job || job.mode !== 'direct' || job.running) { sendResponse({ job: publicJob() }); break; }
        job.running = true; job.blocked = '';
        runDirect();
        await new Promise(r => setTimeout(r, 150));
        sendResponse({ ok: true, job: publicJob() });
        break;
      }

      case 'retry': {
        if (!job) { sendResponse({ error: t('errNoRetry') }); break; }
        if (job.running) { sendResponse({ error: t('errRunning') }); break; }
        const failed = job.items.filter(i => i.status === 'failed');
        failed.forEach(i => { i.status = 'pending'; i.error = ''; });
        if (job.mode === 'direct') {
          job.running = true;
          runDirect();
          await new Promise(r => setTimeout(r, 150));
        } else {
          runQueue(failed);
        }
        sendResponse({ ok: true, job: publicJob() });
        break;
      }

      // ---- 下载页（直接写入模式）用的消息 ----
      case 'dlReport': {           // 后台文档汇报进度
        if (job && !sender.tab) {
          for (const u of msg.items || []) {
            const it = job.items[u.idx]; if (!it) continue;
            if (u.status) it.status = u.status;
            if (u.error !== undefined) it.error = u.error;
            if (u.finalName) it.finalName = u.finalName;
          }
          if (msg.running !== undefined) job.running = msg.running;
          if (msg.location !== undefined) job.location = msg.location;
          broadcast();
        }
        sendResponse({ ok: true });
        break;
      }
      case 'fetchInTab': {         // 后台文档请求在原网页里带 Referer 获取图片
        const dataUrl = await fetchInTab(msg.tabId, msg.url);
        sendResponse({ dataUrl });
        break;
      }


      case 'clearJob':
        if (job && !job.running) job = null;
        sendResponse({ ok: true });
        break;

      case 'showFolder':
        if (msg.downloadId) chrome.downloads.show(msg.downloadId);
        else chrome.downloads.showDefaultFolder();
        sendResponse({ ok: true });
        break;

      default:
        sendResponse({ error: 'unknown message' });
    }
  })().catch(e => sendResponse({ error: e.message || String(e) }));
  return true; // 异步响应
});
