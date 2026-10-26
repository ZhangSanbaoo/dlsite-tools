// ==UserScript==
// @name         DLsite 收藏夹按折扣排序
// @name:en      DLsite Wishlist: Sort by Discount
// @name:ja      DLsite お気に入りを割引順に並べ替え
// @namespace    dlsite-wishlist-discount-sort
// @version      1.4.0
// @description  像 Steam 一样，把 DLsite 收藏夹按折扣力度 / 折后价 / 节省金额排序，可跨所有分页合并显示。
// @description:en  Sort your DLsite wishlist by discount rate, sale price or amount saved across all pages, Steam-style. Filter by discount, tag bundles, clean up purchased items.
// @description:ja  DLsite のお気に入りを割引率・割引後価格・値引き額で全ページ横断で並べ替え。割引率で絞り込み、購入済みの整理も。
// @author       Zhang Sanbao (张三包)
// @license      MIT
// @homepageURL  https://github.com/ZhangSanbaoo/dlsite-tools
// @supportURL   https://github.com/ZhangSanbaoo/dlsite-tools/issues
// @match        https://www.dlsite.com/*/mypage/wishlist*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ---------------------------------------------------------------- 多语言：跟随 DLsite 页面语言
  const LANG = (() => { const l = (document.documentElement.lang || navigator.language || 'en').toLowerCase(); return l.startsWith('zh') ? 'zh' : l.startsWith('ja') ? 'ja' : 'en'; })();
  const I18N = {
    zh: {"sortDiscount": "折扣力度（高 → 低）", "sortPriceAsc": "折后价（低 → 高）", "sortPriceDesc": "折后价（高 → 低）", "sortSaved": "节省金额（高 → 低）", "sortOfficial": "原价（高 → 低）", "parseFail": "无法解析列表（作品链接 {0} 个，列表项 {1} 个，标题「{2}」）。请按 F12 查看 Console 里的诊断信息", "badResp": "返回异常", "scanAllFav": "扫描全部收藏 {0} / {1}", "scanUnbought": "扫描未购买收藏 {0} / {1}", "busyFetching": "正在抓取中，请稍后再试", "noBoughtStatus": "没有已购买的收藏需要清理", "noBoughtToast": "没有已购买的收藏", "moreItems": "· …还有 {0} 件", "purgeConfirm": "将从收藏夹中删除 {0} 件已购买的作品：\n\n{1}\n\n此操作无法批量撤销，确定继续？", "cancelled": "已取消", "purging": "正在取消收藏 {0} / {1}", "purgedStatus": "已取消 {0} 件已购买作品的收藏", "purgedFail": "，{0} 件失败", "purgedToast": "已取消收藏 {0} 件", "purgedToastFail": "，失败 {0} 件", "purgeError": "清理失败：{0}", "title": "按折扣排序", "enable": "启用", "disable": "退出排序", "sort": "排序", "discount": "折扣", "all": "全部", "scopeAll": "全部分页", "scopePage": "仅当前页", "viewGrid": "图片", "viewRows": "列表", "onlyDiscount": "只看打折中", "hideBoughtTitle": "抓取时带上站内「隐藏已购买」条件", "hideBought": "隐藏已购买", "kwPlaceholder": "筛选标题 / 社团", "refreshTitle": "重新抓取所有分页（忽略缓存）", "refresh": "刷新数据", "purgeTitle": "找出已购买却还在收藏夹里的作品，确认后批量取消收藏", "purge": "清理已购买", "autoPurgeTitle": "每次抓取完成后自动取消已购买作品的收藏（不再弹确认）", "autoPurge": "抓取后自动清理", "autoPurgeConfirm": "开启后，每次抓取全部分页完成时会直接取消所有已购买作品的收藏，不再弹确认。确定开启？", "pageCount": "当前页 {0} 件", "cachedStatus": "共 {0} 件（{1} 分钟前抓取）", "boughtHidden": "；另有 {0} 件已购买未显示", "fetchingAll": "正在抓取所有分页…", "fetchingPage": "抓取分页 {0} / {1}，已获取 {2} 件", "enriching": "校正折扣信息…", "enrichingN": "校正折扣信息 {0} / {1}", "freshStatus": "共 {0} 件，刚刚抓取", "error": "出错：{0}", "fetchFailed": "抓取失败：{0}<br>可以试试「仅当前页」模式。", "endsLeft": "{0} 截止 · 还剩 {1}", "days": "{0} 天 ", "hours": "{0} 小时", "save": "省 {0}", "exclusive": "专卖", "set": "组合 {0}%OFF", "inCart": "已在购物车", "addCart": "加入购物车", "details": "详情", "added": "已加入", "addedToast": "已加入购物车", "addedCheck": "已加入购物车（请到购物车确认）", "addFail": "加入失败，已打开作品页，请在页面里加入", "rateOpt": "{0}% OFF（{1}）", "noMatch": "没有符合条件的作品", "showing": "（显示 {0} / {1}）", "pgInfo": "{0} 件中的第 <b>{1}～{2}</b> 件", "prev": "上一页", "next": "下一页", "perPage": "每页", "perPageUnit": "件"},
    en: {"sortDiscount": "Discount (high → low)", "sortPriceAsc": "Sale price (low → high)", "sortPriceDesc": "Sale price (high → low)", "sortSaved": "Amount saved (high → low)", "sortOfficial": "List price (high → low)", "parseFail": "Could not parse the list ({0} work links, {1} list items, title “{2}”). Press F12 and check the Console for diagnostics", "badResp": "unexpected response", "scanAllFav": "Scanning all favorites {0} / {1}", "scanUnbought": "Scanning unpurchased favorites {0} / {1}", "busyFetching": "Still fetching, please try again shortly", "noBoughtStatus": "No purchased favorites to clean up", "noBoughtToast": "No purchased favorites", "moreItems": "· …and {0} more", "purgeConfirm": "{0} purchased works will be removed from your favorites:\n\n{1}\n\nThis cannot be undone in bulk. Continue?", "cancelled": "Cancelled", "purging": "Removing from favorites {0} / {1}", "purgedStatus": "Removed {0} purchased works from favorites", "purgedFail": ", {0} failed", "purgedToast": "Removed {0} from favorites", "purgedToastFail": ", {0} failed", "purgeError": "Cleanup failed: {0}", "title": "Sort by discount", "enable": "Enable", "disable": "Exit", "sort": "Sort", "discount": "Discount", "all": "All", "scopeAll": "All pages", "scopePage": "This page only", "viewGrid": "Grid", "viewRows": "List", "onlyDiscount": "On sale only", "hideBoughtTitle": "Apply the site’s “hide purchased” filter when fetching", "hideBought": "Hide purchased", "kwPlaceholder": "Filter title / circle", "refreshTitle": "Re-fetch all pages (ignore cache)", "refresh": "Refresh", "purgeTitle": "Find purchased works still in favorites and remove them after confirmation", "purge": "Clean up purchased", "autoPurgeTitle": "Automatically remove purchased works after each fetch (no confirmation)", "autoPurge": "Auto clean-up after fetch", "autoPurgeConfirm": "When enabled, every full fetch will immediately remove all purchased works from favorites without confirmation. Enable?", "pageCount": "{0} on this page", "cachedStatus": "{0} items (fetched {1} min ago)", "boughtHidden": "; {0} purchased hidden", "fetchingAll": "Fetching all pages…", "fetchingPage": "Fetching page {0} / {1}, {2} items so far", "enriching": "Verifying discount info…", "enrichingN": "Verifying discount info {0} / {1}", "freshStatus": "{0} items, just fetched", "error": "Error: {0}", "fetchFailed": "Fetch failed: {0}<br>Try “This page only” mode.", "endsLeft": "ends {0} · {1} left", "days": "{0}d ", "hours": "{0}h", "save": "save {0}", "exclusive": "Exclusive", "set": "Bundle {0}% OFF", "inCart": "In cart", "addCart": "Add to cart", "details": "Details", "added": "Added", "addedToast": "Added to cart", "addedCheck": "Added to cart (please check your cart)", "addFail": "Failed to add; opened the work page, please add it there", "rateOpt": "{0}% OFF ({1})", "noMatch": "No matching works", "showing": " (showing {0} / {1})", "pgInfo": "<b>{1}–{2}</b> of {0}", "prev": "Prev", "next": "Next", "perPage": "Per page", "perPageUnit": ""},
    ja: {"sortDiscount": "割引率（高 → 低）", "sortPriceAsc": "割引後価格（低 → 高）", "sortPriceDesc": "割引後価格（高 → 低）", "sortSaved": "値引き額（高 → 低）", "sortOfficial": "定価（高 → 低）", "parseFail": "リストを解析できません（作品リンク {0} 件、リスト項目 {1} 件、タイトル「{2}」）。F12 のコンソールで診断情報を確認してください", "badResp": "不正な応答", "scanAllFav": "お気に入り全体を走査 {0} / {1}", "scanUnbought": "未購入のお気に入りを走査 {0} / {1}", "busyFetching": "取得中です。しばらくしてからお試しください", "noBoughtStatus": "整理が必要な購入済みお気に入りはありません", "noBoughtToast": "購入済みのお気に入りはありません", "moreItems": "· …ほか {0} 件", "purgeConfirm": "購入済みの作品 {0} 件をお気に入りから削除します：\n\n{1}\n\nまとめて元に戻すことはできません。続行しますか？", "cancelled": "キャンセルしました", "purging": "お気に入りから削除中 {0} / {1}", "purgedStatus": "購入済み作品 {0} 件をお気に入りから削除しました", "purgedFail": "、{0} 件失敗", "purgedToast": "{0} 件をお気に入りから削除", "purgedToastFail": "、失敗 {0} 件", "purgeError": "整理に失敗：{0}", "title": "割引順に並べ替え", "enable": "有効化", "disable": "終了", "sort": "並び順", "discount": "割引", "all": "すべて", "scopeAll": "全ページ", "scopePage": "このページのみ", "viewGrid": "画像", "viewRows": "リスト", "onlyDiscount": "割引中のみ", "hideBoughtTitle": "取得時にサイトの「購入済みを非表示」条件を付けます", "hideBought": "購入済みを非表示", "kwPlaceholder": "タイトル / サークルで絞り込み", "refreshTitle": "全ページを取得し直す（キャッシュを無視）", "refresh": "再取得", "purgeTitle": "購入済みなのにお気に入りに残っている作品を探し、確認後にまとめて削除します", "purge": "購入済みを整理", "autoPurgeTitle": "取得完了ごとに購入済み作品を自動でお気に入りから削除（確認なし）", "autoPurge": "取得後に自動整理", "autoPurgeConfirm": "有効にすると、全ページ取得が完了するたびに購入済み作品を確認なしでお気に入りから削除します。有効にしますか？", "pageCount": "このページ {0} 件", "cachedStatus": "全 {0} 件（{1} 分前に取得）", "boughtHidden": "；ほかに購入済み {0} 件は非表示", "fetchingAll": "全ページを取得中…", "fetchingPage": "ページ取得 {0} / {1}、{2} 件取得済み", "enriching": "割引情報を照合中…", "enrichingN": "割引情報を照合中 {0} / {1}", "freshStatus": "全 {0} 件、取得したばかり", "error": "エラー：{0}", "fetchFailed": "取得に失敗：{0}<br>「このページのみ」モードをお試しください。", "endsLeft": "{0} まで · 残り {1}", "days": "{0} 日 ", "hours": "{0} 時間", "save": "{0} お得", "exclusive": "専売", "set": "セット {0}%OFF", "inCart": "カート内", "addCart": "カートに入れる", "details": "詳細", "added": "追加済み", "addedToast": "カートに追加しました", "addedCheck": "カートに追加しました（カートでご確認ください）", "addFail": "追加できませんでした。作品ページを開いたのでそこから追加してください", "rateOpt": "{0}% OFF（{1}）", "noMatch": "条件に合う作品がありません", "showing": "（表示 {0} / {1}）", "pgInfo": "{0} 件中 <b>{1}～{2}</b> 件", "prev": "前へ", "next": "次へ", "perPage": "1ページ", "perPageUnit": "件"}
  };
  const T = I18N[LANG];
  const tf = (key, ...a) => T[key].replace(/\{(\d+)\}/g, (_, i) => a[i]);

  // ---------------------------------------------------------------- 常量 / 设置
  const SITE = location.pathname.split('/')[1] || 'maniax';
  const PER_PAGE = 100;
  const CONCURRENCY = 3;
  const API_BATCH = 50;
  const CACHE_TTL = 15 * 60 * 1000;

  const SORTS = {
    discount: { label: T.sortDiscount, cmp: (a, b) => b.rate - a.rate || a.price - b.price || a.idx - b.idx },
    priceAsc: { label: T.sortPriceAsc, cmp: (a, b) => a.price - b.price || b.rate - a.rate || a.idx - b.idx },
    priceDesc: { label: T.sortPriceDesc, cmp: (a, b) => b.price - a.price || b.rate - a.rate || a.idx - b.idx },
    saved: { label: T.sortSaved, cmp: (a, b) => (b.official - b.price) - (a.official - a.price) || b.rate - a.rate || a.idx - b.idx },
    official: { label: T.sortOfficial, cmp: (a, b) => b.official - a.official || b.rate - a.rate || a.idx - b.idx }
  };

  const defaults = { active: false, sort: 'discount', scope: 'all', view: 'grid', onlyDiscount: false, pageSize: 50, hideBought: true, autoPurge: false };
  const settings = Object.assign({}, defaults, GM_getValue('settings', {}));
  const saveSettings = () => GM_setValue('settings', settings);

  // ---------------------------------------------------------------- 工具
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const num = s => { const m = String(s || '').replace(/[,\s]/g, '').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : NaN; };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // 列表所在的 URL（去掉 per_page / page），作为缓存 key 和分页请求的基础
  function baseListUrl(bought = settings.hideBought) {
    let p = location.pathname.replace(/\/per_page\/\d+/g, '').replace(/\/page\/\d+/g, '').replace(/\/bought\/\d+/g, '').replace(/\/+$/, '');
    if (!p.includes('/=/') && !p.endsWith('/=')) p += '/=';
    if (bought) p += '/bought/1';   // 站内的「隐藏已购买」条件
    return location.origin + p;
  }
  const pageUrl = (n, bought) => `${baseListUrl(bought)}/per_page/${PER_PAGE}/page/${n}`;

  // ---------------------------------------------------------------- 解析页面里的作品
  // 兼容两种来源：
  //  - 服务器原始 HTML：<tile-work-item product-id=".." work-name=".." :discount="{rate: 90,endDate: '..'}"> 这样的 Vue 模板
  //  - 浏览器渲染后的 DOM：<li class="search_result_img_box_inner"> 里面是普通标签
  function parseItem(box, idx) {
    const attr = n => box.getAttribute(n);
    const link = $('a[href*="/product_id/"]', box);
    const id = attr('product-id') || (link && (link.href.match(/product_id\/([A-Z]{2}\d+)/) || [])[1]);
    if (!id) return null;
    const url = attr('product-url') || (link ? link.href : `${location.origin}/${SITE}/work/=/product_id/${id}.html`);
    const nameEl = $('.work_name a', box);
    const name = attr('work-name') || (nameEl ? nameEl.textContent.trim() : id);
    const img = $('img.thumb-img', box) || $('img[src*="_img_main"]', box) || $('img', box);
    const thumbCands = attr(':thumb-img-candidates') || '';
    const thumb = (img && img.getAttribute('src')) || (thumbCands.match(/'([^']+)'/) || [])[1] || '';
    const makerA = $('.maker_name a', box);
    const author = $('.maker_name .author', box);
    const cat = $('.work_category a', box);
    const catCls = ($('.work_category', box) || {}).className || '';
    const price = num(($('.work_price .work_price_base', box) || {}).textContent);
    const official = num(($('.strike .work_price_base', box) || {}).textContent);
    const suffix = (($('.work_price .work_price_suffix', box) || {}).textContent || '').replace(/\u00a0/g, ' ').trim();
    // 折扣：优先模板属性，其次渲染后的 .discount 标签，最后用价格反推
    const dAttr = attr(':discount') || '';
    let rate = num((dAttr.match(/rate:\s*(\d+)/) || [])[1]);
    let endText = (dAttr.match(/endDate:\s*'([^']*)'/) || [])[1] || '';
    if (isNaN(rate)) {
      const dEl = $('.discount:not(.work_price) span', box);
      if (dEl) rate = num(dEl.textContent);
      endText = (($$('.discount:not(.work_price) span', box)[1] || {}).textContent || '').trim();
    }
    if (isNaN(rate)) rate = official && price && official > price ? Math.round((1 - price / official) * 100) : 0;
    const vsd = attr(':volume-set-discount') || '';
    const setRate = num((vsd.match(/rate:\s*(\d+)/) || [])[1]);
    const excl = /exclusive/.test(attr(':exclusivity') || '') || /type_exclusive/.test(box.className || '');
    const starCls = (($('.star_rating', box) || {}).className || '').match(/star_(\d+)/);
    const rateCount = num(($('.star_rating', box) || {}).textContent);
    return {
      idx, id, name, url, thumb,
      wishNo: attr(':wish-no') || '',
      maker: makerA ? makerA.textContent.trim() : '',
      author: author ? author.textContent.trim() : '',
      category: cat ? cat.textContent.trim() : '',
      catType: (catCls.match(/type_([A-Z0-9]+)/) || [])[1] || '',
      exclusive: excl,
      price: isNaN(price) ? 0 : price,
      official: isNaN(official) ? (isNaN(price) ? 0 : price) : official,
      currency: suffix || 'JPY',
      rate,
      setRate: isNaN(setRate) ? 0 : setRate,
      endText,
      stars: starCls ? parseInt(starCls[1], 10) / 10 : 0,
      rateCount: isNaN(rateCount) ? 0 : rateCount
    };
  }
  // 不依赖固定容器：找所有指向作品页的链接，取其所在的 li / tr 作为一项
  function parseDoc(doc, offset = 0) {
    const root = $('#wishlist_work', doc) || $('#wishlist', doc) || doc;
    const seen = new Set(), items = [];
    for (const a of $$('a[href*="/product_id/"]', root)) {
      const box = a.closest('[product-id], li, tr');
      if (!box || seen.has(box)) continue;
      // 排除导航/页脚等无价格信息的链接所在的 li
      if (!box.hasAttribute('product-id') && !$('.work_price, .work_price_base, .discount', box) && !$('.work_name', box)) continue;
      seen.add(box);
      const it = parseItem(box, offset + items.length);
      if (it) items.push(it);
    }
    return items;
  }
  function diagnose(doc) {
    const info = {
      page_total: (($('.page_total', doc) || {}).textContent || '').trim(),
      wishlist_work: !!$('#wishlist_work', doc),
      product_links: $$('a[href*="/product_id/"]', doc).length,
      li_items: $$('li.search_result_img_box_inner', doc).length,
      n_worklist: !!$('.n_worklist', doc),
      title: (doc.title || '').trim()
    };
    console.warn('[DLsite wishlist sort] diagnostics', info);
    return info;
  }

  // ---------------------------------------------------------------- 抓取所有分页
  async function fetchPage(n, bought) {
    const res = await fetch(pageUrl(n, bought), { credentials: 'include' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    return doc;
  }

  async function fetchAll(onProgress, bought = settings.hideBought) {
    const first = await fetchPage(1, bought);
    const total = num(($('.page_total strong', first) || {}).textContent) || 0;
    const pages = Math.max(1, Math.ceil(total / PER_PAGE));
    const items = parseDoc(first, 0);
    if (!items.length && total > 0) {
      const d = diagnose(first);
      throw new Error(tf('parseFail', d.product_links, d.li_items, d.title));
    }
    onProgress(1, pages, items.length);
    // 顺便数一下已购买的有多少（抓一次不隐藏已购买时的总数）
    let boughtCount = 0;
    if (bought) {
      try { const d = await fetchPage(1, false); boughtCount = Math.max(0, (num(($('.page_total strong', d) || {}).textContent) || 0) - total); } catch (e) {}
    }
    const queue = []; for (let p = 2; p <= pages; p++) queue.push(p);
    const results = { 1: items };
    let done = 1;
    await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const p = queue.shift();
        let tries = 0;
        for (;;) {
          try { results[p] = parseDoc(await fetchPage(p, bought), (p - 1) * PER_PAGE); break; }
          catch (e) { if (++tries >= 3) throw e; await sleep(800 * tries); }
        }
        done++; onProgress(done, pages, Object.values(results).reduce((s, a) => s + a.length, 0));
        await sleep(120);
      }
    }));
    const all = [], seen = new Set();
    for (let p = 1; p <= pages; p++) for (const it of results[p] || []) if (!seen.has(it.id)) { seen.add(it.id); all.push(it); }
    all.forEach((it, i) => it.idx = i);
    return { total, items: all, boughtCount };
  }

  // ---------------------------------------------------------------- 商品信息接口：校正折扣率 / 价格 / 截止时间
  async function enrich(items, onProgress) {
    const ids = items.map(i => i.id);
    const byId = new Map(items.map(i => [i.id, i]));
    let done = 0;
    const batches = []; for (let i = 0; i < ids.length; i += API_BATCH) batches.push(ids.slice(i, i + API_BATCH));
    await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
      while (batches.length) {
        const b = batches.shift();
        try {
          const res = await fetch(`${location.origin}/${SITE}/product/info/ajax?product_id=${b.join(',')}`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            for (const [id, info] of Object.entries(data || {})) {
              const it = byId.get(id); if (!it || !info) continue;
              const rate = Number(info.discount_rate);
              const price = Number(info.price), official = Number(info.official_price);
              if (info.is_discount === false || info.is_discount === 0) it.rate = 0;
              if (!isNaN(rate) && rate > 0) it.rate = rate;
              if (!isNaN(price) && price > 0) it.price = price;
              if (!isNaN(official) && official > 0) it.official = official;
              if (info.discount_end_date) it.endText = String(info.discount_end_date).replace(/\s*\(JST\)/, '') + ' (JST)';
              if (info.dl_count != null) it.dlCount = Number(info.dl_count);
            }
          }
        } catch (e) { /* 接口失败就用页面上的数据 */ }
        done += b.length; onProgress(Math.min(done, ids.length), ids.length);
        await sleep(100);
      }
    }));
  }

  // ---------------------------------------------------------------- 清理已购买的收藏
  async function deleteWish(wishNo) {
    const res = await fetch(`${location.origin}/${SITE}/mypage/wishlist/ajax`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json, text/plain, */*' },
      body: `type=1&action=delete&item_id=${encodeURIComponent(wishNo)}`
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const j = await res.json().catch(() => null);
    if (!j || j.result !== true) throw new Error((j && j.msg) || T.badResp);
  }

  // 找出已购买的收藏：抓"不隐藏已购买"的全量列表，减去"隐藏已购买"的列表
  async function findBought(onProgress) {
    const all = await fetchAll((d, t, n) => onProgress(tf('scanAllFav', d, t), 0.5 * d / t), false);
    const unbought = settings.hideBought && allItems && settings.scope === 'all'
      ? { items: allItems }
      : await fetchAll((d, t, n) => onProgress(tf('scanUnbought', d, t), 0.5 + 0.5 * d / t), true);
    const keep = new Set(unbought.items.map(i => i.id));
    return all.items.filter(i => !keep.has(i.id) && i.wishNo);
  }

  async function purgeBought(auto) {
    if (loading) { toast(T.busyFetching); return; }
    loading = true;
    try {
      setProgress(0);
      const bought = await findBought((t, p) => { setStatus(t); setProgress(p); });
      if (!bought.length) { setStatus(T.noBoughtStatus); setProgress(null); toast(T.noBoughtToast); return; }
      if (!auto) {
        const preview = bought.slice(0, 5).map(i => '· ' + i.name).join('\n') + (bought.length > 5 ? '\n' + tf('moreItems', bought.length - 5) : '');
        if (!confirm(tf('purgeConfirm', bought.length, preview))) { setStatus(T.cancelled); setProgress(null); return; }
      }
      let ok = 0, fail = 0;
      const queue = bought.slice();
      await Promise.all(Array.from({ length: 2 }, async () => {
        while (queue.length) {
          const it = queue.shift();
          try { await deleteWish(it.wishNo); ok++; } catch (e) { fail++; console.warn('[DLsite wishlist sort] delete failed', it.id, e); }
          setStatus(tf('purging', ok + fail, bought.length)); setProgress((ok + fail) / bought.length);
          await sleep(150);
        }
      }));
      setProgress(null);
      setStatus(tf('purgedStatus', ok) + (fail ? tf('purgedFail', fail) : ''));
      toast(tf('purgedToast', ok) + (fail ? tf('purgedToastFail', fail) : ''));
      const c = GM_getValue(cacheKey(), null); if (c) { c.boughtCount = fail; GM_setValue(cacheKey(), c); }
    } catch (e) {
      setProgress(null); setStatus(tf('purgeError', e.message));
    } finally { loading = false; }
  }

  // ---------------------------------------------------------------- 缓存
  const cacheKey = () => 'cache:' + baseListUrl();
  function readCache() {
    const c = GM_getValue(cacheKey(), null);
    return c && Date.now() - c.ts < CACHE_TTL ? c : null;
  }
  const writeCache = data => GM_setValue(cacheKey(), { ts: Date.now(), ...data });

  // ---------------------------------------------------------------- 样式
  GM_addStyle(`
    .dws-bar { display:flex; flex-wrap:wrap; align-items:center; gap:8px 12px; padding:10px 12px; margin:10px 0;
      border:1px solid rgba(128,128,128,.35); border-radius:6px; background:rgba(128,128,128,.08); font-size:13px; }
    .dws-bar .dws-title { font-weight:700; margin-right:4px; }
    .dws-bar label { display:inline-flex; align-items:center; gap:4px; cursor:pointer; }
    .dws-bar select, .dws-bar input[type=text] { font:inherit; padding:3px 6px; border:1px solid rgba(128,128,128,.5); border-radius:4px; background:transparent; color:inherit; }
    .dws-bar input[type=text] { width:160px; }
    .dws-btn { font:inherit; padding:4px 12px; border:1px solid rgba(128,128,128,.5); border-radius:4px; background:transparent; color:inherit; cursor:pointer; }
    .dws-btn:hover { background:rgba(128,128,128,.15); }
    .dws-btn.primary { background:#1a73e8; border-color:#1a73e8; color:#fff; font-weight:700; }
    .dws-btn.primary:hover { filter:brightness(1.1); }
    .dws-btn.on { background:rgba(26,115,232,.18); border-color:#1a73e8; }
    .dws-seg { display:inline-flex; border:1px solid rgba(128,128,128,.5); border-radius:4px; overflow:hidden; }
    .dws-seg button { font:inherit; padding:4px 10px; border:none; background:transparent; color:inherit; cursor:pointer; }
    .dws-seg button.on { background:#1a73e8; color:#fff; }
    .dws-status { opacity:.8; }
    .dws-progress { flex-basis:100%; height:4px; border-radius:2px; background:rgba(128,128,128,.25); overflow:hidden; display:none; }
    .dws-progress i { display:block; height:100%; width:0; background:#1a73e8; transition:width .2s; }
    .dws-count { font-weight:700; }

    .dws-list { margin-top:8px; }
    .dws-items.dws-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:14px 12px; }
    .dws-card { position:relative; display:flex; flex-direction:column; border:1px solid rgba(128,128,128,.25); border-radius:6px; overflow:hidden; background:rgba(128,128,128,.06); }
    .dws-card:hover { border-color:rgba(128,128,128,.6); }
    .dws-thumb { position:relative; display:block; aspect-ratio:4/3; background:rgba(0,0,0,.2); }
    .dws-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
    .dws-off { position:absolute; top:0; left:0; padding:3px 8px; background:#d32f2f; color:#fff; font-weight:800; font-size:14px; border-radius:0 0 6px 0; }
    .dws-off.hi { background:#b71c1c; }
    .dws-excl { position:absolute; top:0; right:0; padding:2px 6px; background:#f9a825; color:#000; font-size:11px; font-weight:700; border-radius:0 0 0 6px; }
    .dws-set { position:absolute; left:0; bottom:0; padding:2px 6px; background:#6a1b9a; color:#fff; font-size:11px; font-weight:700; border-radius:0 6px 0 0; }
    .dws-cat { font-size:11px; text-align:center; }
    .dws-cat a { display:block; padding:3px 8px; }
    .dws-rows .dws-catline { display:none; }
    .dws-body { padding:8px 10px 10px; display:flex; flex-direction:column; gap:4px; flex:1; }
    .dws-name { font-weight:700; line-height:1.35; max-height:2.7em; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
    .dws-name a { color:inherit; text-decoration:none; }
    .dws-name a:hover { text-decoration:underline; }
    .dws-maker { font-size:12px; opacity:.75; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .dws-price { display:flex; flex-wrap:wrap; align-items:baseline; gap:2px 6px; margin-top:auto; }
    .dws-grid .dws-catline { display:none; }
    .dws-grid .dws-end { flex-basis:100%; }
    .dws-now { color:#e53935; font-weight:800; font-size:16px; }
    .dws-was { opacity:.6; text-decoration:line-through; font-size:12px; }
    .dws-save { font-size:11px; opacity:.75; }
    .dws-end { font-size:11px; opacity:.7; }
    .dws-stars { font-size:11px; opacity:.8; }
    .dws-actions { display:flex; gap:6px; margin-top:6px; }
    .dws-actions a { flex:1; text-align:center; font-size:12px; padding:5px 0; border-radius:4px; text-decoration:none; border:1px solid rgba(128,128,128,.4); color:inherit; }
    .dws-actions a.cart { background:#f9a825; border-color:#f9a825; color:#000; font-weight:700; }
    .dws-actions a:hover { filter:brightness(1.1); }

    .dws-rows .dws-card { flex-direction:row; align-items:stretch; }
    .dws-rows .dws-thumb { width:140px; flex:none; aspect-ratio:1/1; }
    .dws-rows .dws-cat { position:absolute; left:0; bottom:0; width:140px; }
    .dws-rows .dws-body { flex-direction:row; flex-wrap:wrap; align-items:center; gap:4px 16px; }
    .dws-rows .dws-main { flex:1 1 320px; min-width:0; display:flex; flex-direction:column; gap:3px; }
    .dws-rows .dws-name { -webkit-line-clamp:2; }
    .dws-rows .dws-price { margin:0; flex-direction:column; align-items:flex-end; gap:0; min-width:120px; }
    .dws-rows .dws-actions { margin:0; width:150px; flex-direction:column; }
    .dws-rows .dws-catline { font-size:11px; opacity:.7; }
    .dws-pager { display:flex; flex-wrap:wrap; align-items:center; gap:8px 16px; padding:10px 4px; font-size:13px; }
    .dws-pg-info { opacity:.85; }
    .dws-pg-nav { display:inline-flex; align-items:center; gap:4px; margin-left:auto; }
    .dws-pg { font:inherit; min-width:32px; padding:5px 10px; border:1px solid rgba(128,128,128,.45); border-radius:4px; background:transparent; color:inherit; cursor:pointer; }
    .dws-pg:hover:not(:disabled) { background:rgba(128,128,128,.15); }
    .dws-pg:disabled { opacity:.4; cursor:default; }
    .dws-pg.on { background:#1a73e8; border-color:#1a73e8; color:#fff; font-weight:700; }
    .dws-pg-dots { padding:0 4px; opacity:.6; }
    .dws-pg-size select { font:inherit; padding:3px 6px; border:1px solid rgba(128,128,128,.5); border-radius:4px; background:transparent; color:inherit; }
    .dws-empty { padding:40px; text-align:center; opacity:.7; }
    .dws-hidden { display:none !important; }
    .dws-toast { position:fixed; left:50%; bottom:40px; transform:translateX(-50%) translateY(20px); padding:10px 18px; background:#222; color:#fff;
      border-radius:6px; font-size:14px; opacity:0; pointer-events:none; transition:all .2s; z-index:99999; box-shadow:0 4px 16px rgba(0,0,0,.4); }
    .dws-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
    body.dws-active #wishlist_work, body.dws-active .global_pagination { display:none !important; }
  `);

  // ---------------------------------------------------------------- UI
  let allItems = null;   // 抓到的全部（或当前页）数据
  let bar, listEl, statusEl, progressEl, countEl, sortSel, rateSel, viewSeg, scopeSeg, onlyDiscountCb, keywordInput, activateBtn;

  function buildBar() {
    const sortBox = $('.sort_box');
    bar = document.createElement('div');
    bar.className = 'dws-bar';
    bar.innerHTML = `
      <span class="dws-title">${T.title}</span>
      <button class="dws-btn primary dws-activate">${T.enable}</button>
      <label>${T.sort} <select class="dws-sort">${Object.entries(SORTS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select></label>
      <label>${T.discount} <select class="dws-rate"><option value="">${T.all}</option></select></label>
      <span class="dws-seg dws-scope"><button data-v="all">${T.scopeAll}</button><button data-v="page">${T.scopePage}</button></span>
      <span class="dws-seg dws-view"><button data-v="grid">${T.viewGrid}</button><button data-v="rows">${T.viewRows}</button></span>
      <label><input type="checkbox" class="dws-only"> ${T.onlyDiscount}</label>
      <label title="${T.hideBoughtTitle}"><input type="checkbox" class="dws-bought"> ${T.hideBought}</label>
      <input type="text" class="dws-kw" placeholder="${T.kwPlaceholder}">
      <button class="dws-btn dws-refresh" title="${T.refreshTitle}">${T.refresh}</button>
      <button class="dws-btn dws-purge" title="${T.purgeTitle}">${T.purge}</button>
      <label title="${T.autoPurgeTitle}"><input type="checkbox" class="dws-autopurge"> ${T.autoPurge}</label>
      <span class="dws-status"></span>
      <div class="dws-progress"><i></i></div>`;
    // 放在 Vue 根节点 #wishlist 外面，避免破坏它的渲染
    const rootEl = $('#wishlist') || sortBox;
    rootEl.insertAdjacentElement('beforebegin', bar);

    activateBtn = $('.dws-activate', bar);
    sortSel = $('.dws-sort', bar); sortSel.value = settings.sort;
    scopeSeg = $('.dws-scope', bar); viewSeg = $('.dws-view', bar);
    onlyDiscountCb = $('.dws-only', bar); onlyDiscountCb.checked = settings.onlyDiscount;
    keywordInput = $('.dws-kw', bar);
    statusEl = $('.dws-status', bar); progressEl = $('.dws-progress', bar);
    syncSeg(scopeSeg, settings.scope); syncSeg(viewSeg, settings.view);

    activateBtn.addEventListener('click', () => settings.active ? deactivate() : activate());
    sortSel.addEventListener('change', () => { settings.sort = sortSel.value; saveSettings(); render(); });
    rateSel = $('.dws-rate', bar);
    rateSel.addEventListener('change', render);
    scopeSeg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      settings.scope = b.dataset.v; saveSettings(); syncSeg(scopeSeg, settings.scope);
      if (settings.active) load(false);
    });
    viewSeg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      settings.view = b.dataset.v; saveSettings(); syncSeg(viewSeg, settings.view); render();
    });
    onlyDiscountCb.addEventListener('change', () => { settings.onlyDiscount = onlyDiscountCb.checked; saveSettings(); render(); });
    const boughtCb = $('.dws-bought', bar); boughtCb.checked = settings.hideBought;
    boughtCb.addEventListener('change', () => { settings.hideBought = boughtCb.checked; saveSettings(); if (settings.active && settings.scope === 'all') load(false); });
    let kwTimer; keywordInput.addEventListener('input', () => { clearTimeout(kwTimer); kwTimer = setTimeout(render, 150); });
    $('.dws-refresh', bar).addEventListener('click', () => { if (!settings.active) activate(true); else load(true); });
    $('.dws-purge', bar).addEventListener('click', () => purgeBought(false));
    const autoCb = $('.dws-autopurge', bar); autoCb.checked = settings.autoPurge;
    autoCb.addEventListener('change', () => {
      if (autoCb.checked && !confirm(T.autoPurgeConfirm)) { autoCb.checked = false; return; }
      settings.autoPurge = autoCb.checked; saveSettings();
    });

    listEl = document.createElement('div');
    listEl.className = 'dws-list dws-hidden';
    rootEl.insertAdjacentElement('afterend', listEl);
    listEl.addEventListener('change', e => {
      const sel = e.target.closest('.dws-size'); if (!sel) return;
      settings.pageSize = parseInt(sel.value, 10); saveSettings(); curPage = 1; render(true);
    });
    listEl.addEventListener('click', e => {
      const pg = e.target.closest('.dws-pg');
      if (pg) {
        if (pg.disabled) return;
        curPage = parseInt(pg.dataset.p, 10); render(true);
        bar.scrollIntoView({ block: 'start', behavior: 'smooth' });
        return;
      }
      const a = e.target.closest('a.cart'); if (!a) return;
      e.preventDefault();
      if (a.dataset.busy) return; a.dataset.busy = '1';
      addToCart(a.dataset.id, a).finally(() => { delete a.dataset.busy; });
    });
  }

  function syncSeg(seg, v) { $$('button', seg).forEach(b => b.classList.toggle('on', b.dataset.v === v)); }
  function setStatus(t) { statusEl.textContent = t; }
  function setProgress(p) { progressEl.style.display = p == null ? 'none' : 'block'; if (p != null) $('i', progressEl).style.width = (p * 100).toFixed(1) + '%'; }

  function nativeVisible(v) {
    document.body.classList.toggle('dws-active', !v);
    listEl.classList.toggle('dws-hidden', v);
  }

  async function activate(force) {
    settings.active = true; saveSettings();
    activateBtn.textContent = T.disable; activateBtn.classList.remove('primary');
    nativeVisible(false);
    await load(!!force);
  }
  function deactivate() {
    settings.active = false; saveSettings();
    activateBtn.textContent = T.enable; activateBtn.classList.add('primary');
    nativeVisible(true); setStatus(''); setProgress(null);
  }

  let loading = false;
  async function load(force) {
    if (loading) return; loading = true;
    try {
      if (settings.scope === 'page') {
        allItems = parseDoc(document, 0);
        if (!allItems.length) diagnose(document);
        setStatus(tf('pageCount', allItems.length));
        setProgress(0.5);
        await enrich(allItems, (d, t) => setProgress(0.5 + 0.5 * d / t));
        setProgress(null);
        render();
        return;
      }
      const cached = !force && readCache();
      if (cached) {
        allItems = cached.items;
        setStatus(tf('cachedStatus', cached.total, Math.round((Date.now() - cached.ts) / 60000)) + (cached.boughtCount ? tf('boughtHidden', cached.boughtCount) : ''));
        render();
        return;
      }
      listEl.innerHTML = `<div class="dws-empty">${T.fetchingAll}</div>`;
      setProgress(0);
      const { total, items, boughtCount } = await fetchAll((d, t, n) => { setStatus(tf('fetchingPage', d, t, n)); setProgress(0.7 * d / t); });
      setStatus(T.enriching);
      await enrich(items, (d, t) => { setStatus(tf('enrichingN', d, t)); setProgress(0.7 + 0.3 * d / t); });
      allItems = items;
      writeCache({ total, items, boughtCount });
      setStatus(tf('freshStatus', total) + (boughtCount ? tf('boughtHidden', boughtCount) : ''));
      setProgress(null);
      render();
      if (settings.autoPurge && boughtCount > 0) { loading = false; await purgeBought(true); }
    } catch (e) {
      setProgress(null);
      setStatus(tf('error', e.message));
      listEl.innerHTML = `<div class="dws-empty">${tf('fetchFailed', esc(e.message))}</div>`;
    } finally { loading = false; }
  }

  // ---------------------------------------------------------------- 渲染
  function fmt(n, cur) { return `${Number(n).toLocaleString()} ${cur}`; }
  function endLabel(it) {
    const m = (it.endText || '').match(/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/);
    if (m) {
      const now = new Date();
      // 文本是 JST，没有年份：先按今年算，如果已经过去一个月以上就当作明年
      let d = new Date(`${now.getFullYear()}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}T${m[3].padStart(2, '0')}:${m[4]}:00+09:00`);
      if (d - now < -30 * 86400000) d = new Date(d.getTime() + 365 * 86400000);
      const left = d - now;
      if (left > 0) {
        const days = Math.floor(left / 86400000), hours = Math.floor((left % 86400000) / 3600000);
        return tf('endsLeft', `${m[1]}/${m[2]} ${m[3]}:${m[4]}`, (days > 0 ? tf('days', days) : '') + tf('hours', hours));
      }
    }
    return (it.endText || '').replace(/\(JST\)\s*\(JST\)/, '(JST)');
  }
  function stars(it) {
    if (!it.stars) return '';
    const full = Math.round(it.stars);
    return `${'★'.repeat(full)}${'☆'.repeat(5 - full)} (${it.rateCount})`;
  }

  function card(it, rank) {
    const off = it.rate > 0 ? `<span class="dws-off ${it.rate >= 50 ? 'hi' : ''}">${it.rate}%OFF</span>` : '';
    const was = it.rate > 0 && it.official > it.price ? `<span class="dws-was">${fmt(it.official, it.currency)}</span>` : '';
    const save = it.rate > 0 && it.official > it.price ? `<span class="dws-save">${tf('save', fmt(it.official - it.price, it.currency))}</span>` : '';
    const end = it.rate > 0 ? `<span class="dws-end">${esc(endLabel(it))}</span>` : '';
    const cartUrl = `${location.origin}/${SITE}/cart/=/product_id/${it.id}.html`;
    return `
      <div class="dws-card" data-id="${it.id}">
        <a class="dws-thumb" href="${esc(it.url)}" target="_blank" rel="noopener">
          <img loading="lazy" src="${esc(it.thumb)}" alt="">
          ${off}${it.exclusive ? `<span class="dws-excl">${T.exclusive}</span>` : ''}${it.setRate ? `<span class="dws-set">${tf('set', it.setRate)}</span>` : ''}
        </a>
        <div class="dws-cat work_category type_${esc(it.catType)} type_single"><a href="${location.origin}/${SITE}/fsr/=/work_type/${esc(it.catType)}">${esc(it.category)}</a></div>
        <div class="dws-body">
          <div class="dws-main">
            <div class="dws-name"><a href="${esc(it.url)}" target="_blank" rel="noopener">${esc(it.name)}</a></div>
            <div class="dws-maker">${esc(it.maker)}${it.author ? ' / ' + esc(it.author) : ''}</div>
            <div class="dws-stars">${stars(it)}</div>
          </div>
          <div class="dws-price"><span class="dws-now">${fmt(it.price, it.currency)}</span>${was}${save}${end}</div>
          <div class="dws-actions">
            <a class="cart" href="${cartUrl}" data-id="${it.id}">${inCart(it.id) ? T.inCart : T.addCart}</a>
            <a href="${esc(it.url)}" target="_blank" rel="noopener">${T.details}</a>
          </div>
        </div>
      </div>`;
  }

  // ---------- 购物车：尽量走 DLsite 自己的逻辑 ----------
  function vueRoot() {
    const el = $('#wishlist'); if (!el) return null;
    if (el.__vue__) return el.__vue__;
    if (el.__vue_app__ && el.__vue_app__._instance) return el.__vue_app__._instance.proxy;
    return null;
  }
  function inCart(id) {
    try { const vm = vueRoot(); if (vm && typeof vm.isInCart === 'function') return !!vm.isInCart(id); } catch (e) {}
    return false;
  }
  function nativeCartButton(id) {
    const a = $(`#wishlist_work a[href*="/product_id/${id}."]`);
    const box = a && a.closest('li, tr');
    return box ? $('.cart_button, .btn_cart, button.cart, a[class*="cart"]', box) : null;
  }
  let toastTimer;
  function toast(msg) {
    let t = $('.dws-toast');
    if (!t) { t = document.createElement('div'); t.className = 'dws-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }
  async function addToCart(id, btn) {
    // ① 当前页里有原生卡片：直接点它的按钮，和手动点一模一样
    const nb = nativeCartButton(id);
    if (nb) { nb.click(); btn.textContent = T.added; toast(T.addedToast); return; }
    // ② 调用 Vue 根组件的 addToCart
    const vm = vueRoot();
    if (vm && typeof vm.addToCart === 'function') {
      if (!addToCart.logged) { addToCart.logged = true; console.info('[DLsite wishlist sort] addToCart source:\n' + vm.addToCart.toString()); }
      try {
        const r = vm.addToCart(id);
        if (r && typeof r.then === 'function') await r;
        btn.textContent = T.added; toast(T.addedToast); return;
      } catch (e) { console.warn('[DLsite wishlist sort] vm.addToCart failed', e); }
    }
    // ③ 兜底：后台请求站内加购地址
    try {
      const res = await fetch(`${location.origin}/${SITE}/cart/=/product_id/${id}.html`, { credentials: 'include' });
      if (res.ok) { btn.textContent = T.added; toast(T.addedCheck); return; }
    } catch (e) {}
    toast(T.addFail);
    window.open(`${location.origin}/${SITE}/work/=/product_id/${id}.html`, '_blank');
  }

  let curPage = 1;
  let lastKey = '';
  let rateOptsKey = '';
  // 根据本次抓到的数据生成"折扣力度"下拉选项（90% / 80% / 75% …）
  function refreshRateOptions() {
    const counts = new Map();
    for (const it of allItems) if (it.rate > 0) counts.set(it.rate, (counts.get(it.rate) || 0) + 1);
    const rates = [...counts.keys()].sort((a, b) => b - a);
    const key = rates.join(',') + '|' + allItems.length;
    if (key === rateOptsKey) return;
    rateOptsKey = key;
    const prev = rateSel.value;
    rateSel.innerHTML = `<option value="">${T.all}</option>` + rates.map(r => `<option value="${r}">${tf('rateOpt', r, counts.get(r))}</option>`).join('');
    rateSel.value = rates.includes(Number(prev)) ? prev : '';
  }
  function render(keepPage) {
    if (!settings.active || !allItems) return;
    refreshRateOptions();
    const kw = keywordInput.value.trim().toLowerCase();
    const rateFilter = rateSel.value === '' ? null : Number(rateSel.value);
    let items = allItems.slice();
    if (settings.onlyDiscount) items = items.filter(i => i.rate > 0);
    if (rateFilter !== null) items = items.filter(i => i.rate === rateFilter);
    if (kw) items = items.filter(i => (i.name + ' ' + i.maker + ' ' + i.author + ' ' + i.id).toLowerCase().includes(kw));
    items.sort(SORTS[settings.sort].cmp);
    // 排序 / 筛选条件变了就回到第 1 页
    const key = [settings.sort, settings.onlyDiscount, rateFilter, kw, settings.pageSize, allItems.length].join('|');
    if (key !== lastKey && !keepPage) curPage = 1;
    lastKey = key;

    const size = settings.pageSize;
    const pages = Math.max(1, Math.ceil(items.length / size));
    curPage = Math.min(Math.max(1, curPage), pages);
    const slice = items.slice((curPage - 1) * size, curPage * size);

    listEl.className = 'dws-list';
    if (!items.length) { listEl.innerHTML = `<div class="dws-empty">${T.noMatch}</div>`; return; }
    const pager = pagerHtml(curPage, pages, items.length);
    listEl.innerHTML = `${pager}<div class="dws-items ${settings.view === 'rows' ? 'dws-rows' : 'dws-grid'}">${slice.map(card).join('')}</div>${pager}`;
    const n = allItems.length;
    setStatus(statusEl.textContent.replace(/[（(][^（(）)]*\d+ \/ \d+[）)]$/, '') + (items.length !== n ? tf('showing', items.length, n) : ''));
  }

  function pagerHtml(p, pages, total) {
    const from = (p - 1) * settings.pageSize + 1, to = Math.min(total, p * settings.pageSize);
    const btn = (n, label, cls = '') => `<button class="dws-pg ${cls}" data-p="${n}" ${n < 1 || n > pages || n === p && !cls ? 'disabled' : ''}>${label}</button>`;
    const nums = [];
    const add = n => { if (n >= 1 && n <= pages && !nums.includes(n)) nums.push(n); };
    add(1); add(2); for (let n = p - 2; n <= p + 2; n++) add(n); add(pages - 1); add(pages);
    nums.sort((a, b) => a - b);
    let numHtml = '', prev = 0;
    for (const n of nums) {
      if (n - prev > 1) numHtml += '<span class="dws-pg-dots">…</span>';
      numHtml += `<button class="dws-pg num ${n === p ? 'on' : ''}" data-p="${n}">${n}</button>`;
      prev = n;
    }
    return `<div class="dws-pager">
      <span class="dws-pg-info">${tf('pgInfo', total, from, to)}</span>
      <span class="dws-pg-nav">${btn(p - 1, T.prev)}${numHtml}${btn(p + 1, T.next)}</span>
      <label class="dws-pg-size">${T.perPage} <select class="dws-size">${[30, 50, 100].map(n => `<option value="${n}" ${n === settings.pageSize ? 'selected' : ''}>${n}</option>`).join('')}</select> ${T.perPageUnit}</label>
    </div>`;
  }

  // ---------------------------------------------------------------- 启动
  function init() {
    if (!$('.sort_box') || !$('#wishlist')) return;
    buildBar();
    if (settings.active) activate(false);
  }
  // 等页面完全加载且 Vue 水合完成（最多等 6 秒）再动 DOM
  function whenReady(cb) {
    const start = Date.now();
    const hydrated = () => { const r = $('#wishlist'); return r && (r.__vue__ || r.__vue_app__ || r._vnode); };
    const tick = () => {
      if (document.readyState === 'complete' && (hydrated() || Date.now() - start > 6000)) { setTimeout(cb, 300); return; }
      setTimeout(tick, 200);
    };
    tick();
  }
  whenReady(init);
})();
