// 隐藏的后台文档：把图片直接写入用户选好的文件夹（文件系统访问 API）。
// 不经过 chrome.downloads，所以不会和 IDM 等下载扩展冲突；弹窗关掉也不影响。

const send = msg => new Promise(resolve => chrome.runtime.sendMessage(msg, resolve));

const MIME_EXT = {
  'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/pjpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
  'image/webp': 'webp', 'image/avif': 'avif', 'image/svg+xml': 'svg', 'image/bmp': 'bmp', 'image/x-ms-bmp': 'bmp',
  'image/tiff': 'tif', 'image/x-icon': 'ico', 'image/vnd.microsoft.icon': 'ico', 'image/heic': 'heic', 'image/heif': 'heif', 'image/jxl': 'jxl'
};
const EXT_RE = /\.(jpe?g|png|gif|webp|avif|svg|bmp|tiff?|ico|heic|heif|jxl)$/i;

function sniffExt(b) {
  const ascii = (o, n) => String.fromCharCode(...b.slice(o, o + n));
  if (b[0] === 0xFF && b[1] === 0xD8) return 'jpg';
  if (b[0] === 0x89 && ascii(1, 3) === 'PNG') return 'png';
  if (ascii(0, 3) === 'GIF') return 'gif';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return 'webp';
  if (ascii(4, 4) === 'ftyp') { const br = ascii(8, 4); if (/avif|avis/.test(br)) return 'avif'; if (/heic|heix|hevc|mif1|msf1/.test(br)) return 'heic'; }
  if (ascii(0, 2) === 'BM') return 'bmp';
  if (b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0) return 'ico';
  if ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2A) || (b[0] === 0x4D && b[1] === 0x4D && b[2] === 0 && b[3] === 0x2A)) return 'tif';
  if (b[0] === 0xFF && b[1] === 0x0A) return 'jxl';
  const head = ascii(0, Math.min(200, b.length)).toLowerCase();
  if (head.includes('<svg') || (head.includes('<?xml') && head.includes('svg'))) return 'svg';
  return null;
}
const extFromMime = m => m ? MIME_EXT[m.toLowerCase().split(';')[0].trim()] || null : null;
function extFromUrl(url) {
  try {
    if (url.startsWith('data:')) { const m = url.match(/^data:([^;,]+)/); return m ? extFromMime(m[1]) : null; }
    const m = new URL(url).pathname.match(EXT_RE);
    return m ? m[1].toLowerCase().replace('jpeg', 'jpg').replace('tiff', 'tif') : null;
  } catch { return null; }
}

async function dataUrlToBlob(u) { return await (await fetch(u)).blob(); }
async function fetchBytes(job, item) {
  const errors = [];
  if (item.url.startsWith('data:')) return await dataUrlToBlob(item.url);
  try {
    const res = await fetch(item.url, { credentials: 'include' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const blob = await res.blob();
    if (!blob.size) throw new Error(t('errEmpty'));
    return blob;
  } catch (e) { errors.push(t('errDirect', e.message)); }
  try {
    const r = await send({ type: 'fetchInTab', tabId: job.tabId, url: item.url });
    if (!r || !r.dataUrl) throw new Error((r && r.error) || t('noResponse'));
    return await dataUrlToBlob(r.dataUrl);
  } catch (e) { errors.push(t('errInPage', e.message)); }
  throw new Error(errors.join('; '));
}

let running = false;

async function runJob(job) {
  globalThis.__msgs = job.msgs || {};
  if (running) return { error: t('errJobRunning') };
  const parent = await loadDirHandle().catch(() => null);
  if (!parent) return { error: 'noDir' };
  const perm = await parent.queryPermission({ mode: 'readwrite' });
  if (perm !== 'granted') return { error: 'needPermission', dirName: parent.name };
  let dir;
  try { dir = await parent.getDirectoryHandle(job.folder, { create: true }); }
  catch (e) { return { error: t('errMkdir', [parent.name, job.folder, e.message]) }; }

  running = true;
  const location = `${parent.name} / ${job.folder}`;
  await send({ type: 'dlReport', items: [], running: true, location });
  const concurrency = Math.max(1, Math.min(8, job.concurrency || 3));
  const queue = job.items.filter(i => i.status !== 'done');
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await send({ type: 'dlReport', items: [{ idx: item.idx, status: 'downloading', error: '' }] });
      try {
        const blob = await fetchBytes(job, item);
        const head = new Uint8Array(await blob.slice(0, 256).arrayBuffer());
        const ext = sniffExt(head) || extFromMime(blob.type) || extFromUrl(item.url) || 'jpg';
        const finalName = `${item.name}.${ext}`;
        const fh = await dir.getFileHandle(finalName, { create: true });
        const w = await fh.createWritable(); await w.write(blob); await w.close();
        await send({ type: 'dlReport', items: [{ idx: item.idx, status: 'done', finalName }] });
      } catch (e) {
        await send({ type: 'dlReport', items: [{ idx: item.idx, status: 'failed', error: e.message || String(e) }] });
      }
    }
  }));
  running = false;
  await send({ type: 'dlReport', items: [], running: false });
  return { ok: true };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.target !== 'offscreen') return;
  if (msg.type === 'runJob') { runJob(msg.job).then(sendResponse, e => sendResponse({ error: e.message || String(e) })); return true; }
  if (msg.type === 'ping') { sendResponse({ ok: true, running }); return; }
});
