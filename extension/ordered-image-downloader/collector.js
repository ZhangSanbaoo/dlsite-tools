// 注入到网页中执行的函数：滚动触发懒加载，然后按 DOM 顺序收集图片。
// 必须是自包含的（不能引用外部变量），因为它是通过 chrome.scripting.executeScript 注入的。
async function collectImagesInPage(settings) {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // 1) 自动滚动，触发懒加载
  if (settings.autoScroll) {
    const startY = window.scrollY;
    const step = Math.max(200, Math.floor(window.innerHeight * 0.9));
    let y = 0, iters = 0;
    while (y < document.documentElement.scrollHeight && iters < 120) {
      window.scrollTo(0, y);
      await sleep(110);
      y += step;
      iters++;
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await sleep(350);
    window.scrollTo(0, startY);
    await sleep(200);
  }

  // 2) 工具函数
  const resolve = u => {
    if (!u) return null;
    u = u.trim();
    if (!u || /^(blob:|javascript:|about:)/i.test(u)) return null;
    try { return new URL(u, document.baseURI).href; } catch { return null; }
  };

  // 从 srcset 中选出描述符最大的那一张
  const bestFromSrcset = srcset => {
    if (!srcset) return null;
    let best = null, bestScore = -1;
    for (const part of srcset.split(',')) {
      const seg = part.trim().split(/\s+/);
      if (!seg[0]) continue;
      let score = 1;
      if (seg[1]) {
        const m = seg[1].match(/^([\d.]+)([wx])$/);
        if (m) score = m[2] === 'w' ? parseFloat(m[1]) : parseFloat(m[1]) * 1000;
      }
      if (score > bestScore) { bestScore = score; best = seg[0]; }
    }
    return best;
  };

  const pickImgUrl = img => {
    const cands = [];
    cands.push(bestFromSrcset(img.getAttribute('srcset') || img.getAttribute('data-srcset')));
    const pic = img.parentElement && img.parentElement.tagName === 'PICTURE' ? img.parentElement : null;
    if (pic) {
      for (const s of pic.querySelectorAll('source')) {
        cands.push(bestFromSrcset(s.getAttribute('srcset') || s.getAttribute('data-srcset')));
      }
    }
    for (const a of ['data-original', 'data-src', 'data-lazy-src', 'data-lazy', 'data-url', 'data-echo']) {
      cands.push(img.getAttribute(a));
    }
    cands.push(img.currentSrc, img.getAttribute('src'));
    for (const c of cands) {
      const r = resolve(c);
      if (r) return r;
    }
    return null;
  };

  const bgUrls = el => {
    const bg = getComputedStyle(el).backgroundImage;
    if (!bg || bg === 'none') return [];
    const out = [];
    const re = /url\((['"]?)(.*?)\1\)/g;
    let m;
    while ((m = re.exec(bg))) { const r = resolve(m[2]); if (r) out.push(r); }
    return out;
  };

  // 3) 按文档顺序遍历（含 shadow DOM）
  const results = [];
  const seen = new Set();
  const push = (url, w, h, alt, kind) => {
    if (!url) return;
    if (settings.dedupe && seen.has(url)) return;
    if (settings.filterEnabled && w > 0 && h > 0 && (w < settings.minWidth || h < settings.minHeight)) return;
    seen.add(url);
    results.push({ url, w, h, alt: alt || '', kind });
  };

  const walk = root => {
    for (const el of root.querySelectorAll('*')) {
      if (el.tagName === 'IMG') {
        const url = pickImgUrl(el);
        const rect = el.getBoundingClientRect();
        // 只有当前真正加载的就是我们选中的 URL 时，naturalWidth 才可信；
        // 否则（懒加载占位图、srcset 里选了更大的一张）用布局尺寸/属性尺寸
        const natural = el.currentSrc && resolve(el.currentSrc) === url;
        let w = natural ? el.naturalWidth : 0;
        let h = natural ? el.naturalHeight : 0;
        if (!w || !h) { w = Math.round(rect.width) || el.width || 0; h = Math.round(rect.height) || el.height || 0; }
        push(url, w, h, el.alt, 'img');
      } else if (settings.includeBackground) {
        const rect = el.getBoundingClientRect();
        for (const u of bgUrls(el)) push(u, Math.round(rect.width), Math.round(rect.height), '', 'bg');
      }
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  walk(document);

  return { title: document.title, images: results };
}

// 注入到网页中执行：在页面上下文里 fetch 图片（会带上 Referer / Cookie），返回 data URL
async function fetchImageInPage(url) {
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
