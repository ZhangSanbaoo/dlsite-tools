// ==UserScript==
// @name         DLsite 购物车优惠方案
// @name:en      DLsite Cart Savings Planner
// @name:ja      DLsite カート割引プラン
// @author       Zhang Sanbao (张三包)
// @license      MIT
// @homepageURL  https://github.com/ZhangSanbaoo/dlsite-tools
// @supportURL   https://github.com/ZhangSanbaoo/dlsite-tools/issues
// @namespace    dlsite-cart-coupon-optimizer
// @version      1.1.0
// @description  读取购物车和你持有的优惠券，按 DLsite 自己的计算规则找出最省钱的分单方案，并给每件作品标注可用的券和组合特价状态。
// @description:en  Reads your cart and coupons and, using DLsite's own pricing rules, finds the cheapest way to split checkout; tags every item with usable coupons and bundle status.
// @description:ja  カートと所持クーポンを読み取り、DLsite 自身の計算ルールで最も安くなる会計の分け方を提案。各作品に使えるクーポンとセット割の状態を表示します。
// @match        https://www.dlsite.com/*/cart
// @match        https://www.dlsite.com/*/cart/
// @match        https://www.dlsite.com/*/cart?*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ---------------------------------------------------------------- 多语言：跟随 DLsite 页面语言
  const LANG = (() => { const l = (document.documentElement.lang || navigator.language || 'en').toLowerCase(); return l.startsWith('zh') ? 'zh' : l.startsWith('ja') ? 'ja' : 'en'; })();
  const I18N = {
    zh: {"couponApiErr": "优惠券接口 HTTP {0}", "title": "购物车优惠方案", "briefSave": "拆成 {0} 单可省 <span class=\"save\">{1}</span>（{2} → {3}）", "briefNoSave": "一次结账即可（{0}），拆单没有额外优惠", "collapse": "▾ 收起", "expand": "▸ 展开", "maxOrdersPre": "最多拆成", "maxOrdersPost": "单", "laterTitle": "把「稍后再买」里的作品也纳入计算", "includeLater": "含稍后再买（{0}）", "recalc": "重新计算", "restoreTitle": "把「稍后再买」里的作品全部放回购物车", "restoreAll": "全部放回购物车", "nowOneCheckout": "现在一次结账：<b>{0}</b>", "withCoupon": "（已含券「{0}」−{1}）", "noCoupon": "（无可用券）", "splitInto": "拆成 <b>{0}</b> 单：<b>{1}</b>", "canSave": "可省 <span class=\"save\">{0}</span>", "noExtra": "拆单没有额外优惠", "orderN": "第 {0} 单", "itemsSubtotal": "{0} 件 · 小计 {1}", "useCoupon": "结账时选券：{0} <span>（−{1}）</span>", "noCouponUse": "不用券", "bundleApplied": "组合特价已套用 {0} 件", "pay": "付 {0}", "keepTitle": "把其它单的作品移到「稍后再买」，购物车里只留这一单", "keepOnly": "只保留这一单", "detailsN": "{0} 件明细", "tagBundle": "组合特价", "tagBundleShort": "组合特价未满 {0} 件", "tagCoupon": "券 −{0}", "hintBundle": "「{0}」购物车里有 {1} 件，再加 <b>{2}</b> 件对象作品即可触发。", "viewCampaign": "查看活动", "hintCoupon": "券「{0}」需要 {1} 件对象作品，购物车里只有 {2} 件，再加 <b>{3}</b> 件即可使用。", "hintsHead": "再加一点就能更省：", "note": "计算规则照搬自 DLsite 购物车页面的代码：每单只能用一张券；「指定作品 / 指定社团」类的券一单只对价格最高的一件生效；组合特价按同一单内的件数判定。请在下一步「确认购买内容」里按上面标注选择对应的券。", "restoreConfirm": "把「稍后再买」里的 {0} 件作品全部放回购物车？", "restoring": "正在放回购物车…", "alreadyOnly": "购物车里已经只剩这一单的作品了", "keepConfirm": "将把 {0} 件作品移到「稍后再买」{1}，购物车里只留第 {2} 单的 {3} 件。\n结账后回到购物车点「全部放回购物车」即可继续下一单。继续？", "keepConfirmBack": "，并把 {0} 件从「稍后再买」放回购物车", "arranging": "正在整理购物车…", "tagBundleOk": "组合特价 已满足（{0}/{1}）", "tagBundleNeed": "组合特价 差 {0} 件", "needN": "，需 {0} 件起", "singleNote": "（一单只对最贵的一件生效）", "yenOff": "−{0}円", "single": " ·单件", "fromN": " ·{0}件起", "loading": "正在读取购物车和优惠券…", "emptyCart": "购物车里没有作品", "laterHas": "，「稍后再买」里有 {0} 件", "restoringShort": "正在放回…", "computing": "正在计算 {0} 件作品 × {1} 张券的最优分单…", "error": "出错：{0}"},
    en: {"couponApiErr": "Coupon API HTTP {0}", "title": "Cart savings planner", "briefSave": "Split into {0} orders to save <span class=\"save\">{1}</span> ({2} → {3})", "briefNoSave": "One checkout is best ({0}); splitting saves nothing", "collapse": "▾ Collapse", "expand": "▸ Expand", "maxOrdersPre": "Split into at most", "maxOrdersPost": "orders", "laterTitle": "Include items in “Buy later” in the calculation", "includeLater": "Include “Buy later” ({0})", "recalc": "Recalculate", "restoreTitle": "Move everything in “Buy later” back to the cart", "restoreAll": "Move all back to cart", "nowOneCheckout": "Checkout now as one order: <b>{0}</b>", "withCoupon": " (incl. coupon “{0}” −{1})", "noCoupon": " (no usable coupon)", "splitInto": "Split into <b>{0}</b> orders: <b>{1}</b>", "canSave": "Save <span class=\"save\">{0}</span>", "noExtra": "Splitting saves nothing extra", "orderN": "Order {0}", "itemsSubtotal": "{0} items · subtotal {1}", "useCoupon": "Coupon at checkout: {0} <span>(−{1})</span>", "noCouponUse": "No coupon", "bundleApplied": "Bundle discount on {0} items", "pay": "Pay {0}", "keepTitle": "Move the other orders’ items to “Buy later”, leaving only this order in the cart", "keepOnly": "Keep only this order", "detailsN": "{0} items", "tagBundle": "Bundle", "tagBundleShort": "Bundle needs {0}", "tagCoupon": "coupon −{0}", "hintBundle": "“{0}”: {1} in cart, add <b>{2}</b> more eligible item(s) to trigger it.", "viewCampaign": "View campaign", "hintCoupon": "Coupon “{0}” needs {1} eligible items; the cart has {2}. Add <b>{3}</b> more to use it.", "hintsHead": "Add a little more to save more:", "note": "Rules are taken from DLsite’s own cart code: one coupon per order; “specific work / circle” coupons apply only to the most expensive eligible item in an order; bundle discounts depend on the item count within one order. Pick the coupon shown above on the next “Confirm purchase” page.", "restoreConfirm": "Move all {0} items in “Buy later” back to the cart?", "restoring": "Moving back to cart…", "alreadyOnly": "The cart already contains only this order’s items", "keepConfirm": "{0} item(s) will be moved to “Buy later”{1}, leaving the {3} item(s) of order {2} in the cart.\nAfter checkout, come back and click “Move all back to cart” for the next order. Continue?", "keepConfirmBack": " and {0} item(s) moved back from “Buy later”", "arranging": "Arranging the cart…", "tagBundleOk": "Bundle ✓ ({0}/{1})", "tagBundleNeed": "Bundle: {0} more needed", "needN": ", needs {0}+ items", "singleNote": " (one order: applies to the most expensive item only)", "yenOff": "−¥{0}", "single": " ·single", "fromN": " ·{0}+", "loading": "Reading cart and coupons…", "emptyCart": "The cart is empty", "laterHas": "; {0} in “Buy later”", "restoringShort": "Moving…", "computing": "Computing the best split for {0} items × {1} coupons…", "error": "Error: {0}"},
    ja: {"couponApiErr": "クーポン API HTTP {0}", "title": "カート割引プラン", "briefSave": "{0} 回に分けると <span class=\"save\">{1}</span> お得（{2} → {3}）", "briefNoSave": "1 回で会計して問題なし（{0}）。分割しても得はありません", "collapse": "▾ 閉じる", "expand": "▸ 開く", "maxOrdersPre": "最大", "maxOrdersPost": "回に分割", "laterTitle": "「あとで買う」の作品も計算に含めます", "includeLater": "「あとで買う」を含む（{0}）", "recalc": "再計算", "restoreTitle": "「あとで買う」の作品をすべてカートに戻します", "restoreAll": "すべてカートに戻す", "nowOneCheckout": "今のまま 1 回で会計：<b>{0}</b>", "withCoupon": "（クーポン「{0}」−{1} 適用済み）", "noCoupon": "（使えるクーポンなし）", "splitInto": "<b>{0}</b> 回に分割：<b>{1}</b>", "canSave": "<span class=\"save\">{0}</span> お得", "noExtra": "分割しても追加の割引はありません", "orderN": "{0} 回目", "itemsSubtotal": "{0} 件 · 小計 {1}", "useCoupon": "会計時に選ぶクーポン：{0} <span>（−{1}）</span>", "noCouponUse": "クーポンなし", "bundleApplied": "セット割適用 {0} 件", "pay": "支払 {0}", "keepTitle": "他の回の作品を「あとで買う」へ移し、この回だけをカートに残します", "keepOnly": "この回だけ残す", "detailsN": "{0} 件の内訳", "tagBundle": "セット割", "tagBundleShort": "セット割 {0} 件未満", "tagCoupon": "クーポン −{0}", "hintBundle": "「{0}」はカートに {1} 件。あと <b>{2}</b> 件の対象作品で適用されます。", "viewCampaign": "キャンペーンを見る", "hintCoupon": "クーポン「{0}」は対象 {1} 件が必要。カートには {2} 件。あと <b>{3}</b> 件で使えます。", "hintsHead": "もう少しでさらにお得：", "note": "計算ルールは DLsite のカートページのコードに準拠：1 回の会計で使えるクーポンは 1 枚、「作品指定／サークル指定」のクーポンは 1 回の会計で最も高い 1 件にのみ適用、セット割は同じ会計内の件数で判定。次の「購入内容の確認」で上記のクーポンを選んでください。", "restoreConfirm": "「あとで買う」の {0} 件をすべてカートに戻しますか？", "restoring": "カートに戻しています…", "alreadyOnly": "カートにはすでにこの回の作品しかありません", "keepConfirm": "{0} 件を「あとで買う」へ移動{1}し、{2} 回目の {3} 件だけをカートに残します。\n会計後にカートへ戻り「すべてカートに戻す」を押すと次の回に進めます。続行しますか？", "keepConfirmBack": "、「あとで買う」から {0} 件を戻", "arranging": "カートを整理中…", "tagBundleOk": "セット割 適用中（{0}/{1}）", "tagBundleNeed": "セット割 あと {0} 件", "needN": "、{0} 件以上で", "singleNote": "（1 回の会計で最も高い 1 件のみ）", "yenOff": "−{0}円", "single": " ·単品", "fromN": " ·{0}件〜", "loading": "カートとクーポンを読み込み中…", "emptyCart": "カートに作品がありません", "laterHas": "、「あとで買う」に {0} 件", "restoringShort": "戻しています…", "computing": "{0} 件 × クーポン {1} 枚で最適な分割を計算中…", "error": "エラー：{0}"}
  };
  const T = I18N[LANG];
  const tf = (key, ...a) => T[key].replace(/\{(\d+)\}/g, (_, i) => a[i]);

  const SITE = location.pathname.split('/')[1] || 'maniax';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const yen = n => Number(n).toLocaleString('ja-JP') + ' JPY';
  const settings = Object.assign({ maxOrders: 8, includeLater: false, open: false }, GM_getValue('settings', {}));
  const saveSettings = () => GM_setValue('settings', settings);

  // =====================================================================
  // 1. 读取购物车商品（和 DLsite 的 retrieveProducts 一样，从 li 的 data-* 属性读）
  // =====================================================================
  function readItems(includeLater) {
    const base = 'li.cart_list_item:not(._removed):not(.is_actioned):not(.__non_purchasable_item)';
    const sel = includeLater
      ? `#show_cart .buy_now ${base}, #show_cart .buy_later ${base}`
      : `#show_cart .buy_now ${base}`;
    return $$(sel).map(li => {
      const p = {};
      for (const a of li.attributes) {
        if (!a.name.startsWith('data-')) continue;
        const k = a.name.replace('data-', '').split('-').join('_');
        if (a.name === 'data-translation_info' || a.name === 'data-custom_genres') { try { p[k] = JSON.parse(a.value); } catch { p[k] = undefined; } }
        else p[k] = a.value;
      }
      p.id = p.workno || p.product_id; p.product_id = p.product_id || p.id;
      p.name = ($('.work_name a', li) || {}).textContent?.trim() || p.id;
      p.maker = ($('.maker_name a', li) || {}).textContent?.trim() || '';
      const img = $('.work_thumb img', li);
      let thumb = img ? img.getAttribute('src') : '';
      if (!thumb) { const c = $('.work_thumb [data-candidates]', li); if (c) { try { thumb = JSON.parse(c.dataset.candidates)[0]; } catch {} } }
      p.thumb = thumb || '';
      p.inLater = !!li.closest('.buy_later');
      p.basePrice = parseInt(p.price, 10) || 0;          // 不考虑组合特价时的价格（页面 data-price）
      p.officialPrice = parseInt(p.official_price, 10) || p.basePrice;
      p.li = li;
      return p;
    });
  }

  // =====================================================================
  // 2. 组合特价规则：页面全局变量 Bulkbuy._info（取不到就从内联脚本里解析）
  // =====================================================================
  function readBulkbuyInfo() {
    try { const w = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window; if (w.Bulkbuy && w.Bulkbuy._info) return w.Bulkbuy._info; } catch {}
    for (const s of $$('script:not([src])')) {
      const m = s.textContent.match(/_info:\s*(\{[\s\S]*?\}),\s*\n\s*_detection/);
      if (m) { try { return JSON.parse(m[1]); } catch {} }
    }
    return {};
  }

  // 照搬 Bulkbuy.sort：给定同一单里的商品，返回 { id -> 该单里的实际价格 } 以及每个活动的套用情况
  function applyBulkbuy(items, info) {
    const price = {}; const applied = {}; const groups = {};
    for (const it of items) {
      price[it.id] = it.bulkbuy_key ? parseInt(it.bulkbuy_origin_price, 10) : it.basePrice;
      if (it.bulkbuy_key && info[it.bulkbuy_key]) (groups[it.bulkbuy_key] = groups[it.bulkbuy_key] || []).push(it);
    }
    for (const [key, arr0] of Object.entries(groups)) {
      const rule = info[key];
      let arr = arr0.slice().sort((a, b) => parseInt(b.bulkbuy_origin_price, 10) - parseInt(a.bulkbuy_origin_price, 10));
      if (rule.required_worknos) {
        const req = arr.filter(i => rule.required_worknos.includes(i.id));
        if (req.length !== rule.required_worknos.length) { applied[key] = { count: arr.length, applied: 0, rule }; continue; }
        arr = req.concat(arr.filter(i => !rule.required_worknos.includes(i.id)));
      }
      let n = 0;
      if (rule.per_items && arr.length >= rule.per_items) {
        n = rule.items_or_more_flg ? arr.length : Math.floor(arr.length / rule.per_items) * rule.per_items;
        if (rule.limit_items && n > rule.limit_items) n = rule.limit_items;
      }
      for (let i = 0; i < n; i++) price[arr[i].id] = parseInt(arr[i].bulkbuy_price, 10);
      applied[key] = { count: arr.length, applied: n, rule };
    }
    return { price, applied };
  }

  // =====================================================================
  // 3. 优惠券规则：照搬 PaymentSummary 的 canUseCoupon / targetProductsForCoupon / discountAmountForCoupon
  // =====================================================================
  async function loadCoupons() {
    const res = await fetch(`${location.origin}/${SITE}/mypage/coupon/list/ajax`, { credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    if (!res.ok) throw new Error(tf('couponApiErr', res.status));
    const txt = await res.text();
    let arr; try { arr = JSON.parse(txt); } catch { arr = JSON.parse(txt.replace(/[\u0000-\u001f]/g, ' ')); }
    const seen = new Set(), out = [];
    for (const c of arr) {
      if (seen.has(c.coupon_id)) continue; seen.add(c.coupon_id);
      out.push({ ...c, condition: c.condition || c.conditions || {}, discount: Number(c.discount) });
    }
    return out;
  }

  const matchSiteId = (p, siteIds) => !siteIds || !siteIds.length ||
    siteIds.includes(String(p.site_id || '').split('-').join('')) ||
    (siteIds.includes('comic') && p.product_id.indexOf('BJ') === 0 && String(p.age_category) === '1') ||
    (siteIds.includes('garumani') && !!p.is_garumani_general);

  function matchOptionsTranslation(p, opts) {
    const ti = p.translation_info;
    if ((opts.includes('translation_translatable') || opts.includes('translation_translated')) && !ti) return false;
    if (opts.includes('translation_translatable') && opts.includes('translation_translated')) {
      if (!ti.is_translation_agree && !ti.is_parent && !ti.is_child) return false;
    } else if (opts.includes('translation_translatable')) { if (!ti.is_translation_agree) return false; }
    else if (opts.includes('translation_translated') && !ti.is_parent && !ti.is_child) return false;
    return true;
  }

  function canUseCoupon(p, c, price) {
    const cond = c.condition;
    if (p.is_noreduction) return false;
    if (p.translation_info && (p.translation_info.is_parent || p.translation_info.is_child) && p.product_id.indexOf('BJ') === 0 && String(c.trade_price_off_flg) === '1') return false;
    if (p.product_id.indexOf('RJ') !== -1 && cond.maximum_applicable_price && parseInt(cond.maximum_applicable_price, 10) < price) return false;
    if (cond.product_id && !cond.product_id.includes(p.product_id)) return false;
    if (cond.product_all && !cond.product_all.includes(p.product_id)) return false;
    if (!matchSiteId(p, cond.site_ids)) return false;
    if (cond.maker_id && !cond.maker_id.includes(p.maker_id)) return false;
    if (cond.worktype && cond.worktype.length >= 1 && !cond.worktype.includes(p.work_type)) return false;
    if (cond.options) {
      if (!matchOptionsTranslation(p, cond.options)) return false;
      if (cond.options.includes('discount') && !p.is_discount) return false;
      if (cond.options.includes('tnb_first')) {
        let bo = 0;
        if (p.book_option_id !== undefined) bo = Number(p.book_option_id);
        if (bo !== 202 || Number(p.title_volumn) !== 1 || Number(p.title_work_count) < 2) return false;
      }
    }
    if (cond.discount_campaign_ids && cond.discount_campaign_ids.length >= 1) {
      if (!p.discount_campaign_id) return false;
      if (!cond.discount_campaign_ids.includes(parseInt(p.discount_campaign_id, 10))) return false;
    }
    if (cond.regist_date && Date.parse(String(p.regist_date).split('-').join('/')) > Date.parse(String(cond.regist_date).split('-').join('/'))) return false;
    if (cond.custom_genre && !(p.custom_genres && p.custom_genres.some(g => cond.custom_genre.includes(g)))) return false;
    return true;
  }

  const isMulti = c => !c.condition.best_price_flg && c.condition_type !== 'ids' && c.condition_type !== 'makers';

  // 返回券在这一单里实际作用到的商品
  function targetProducts(items, priceMap, c) {
    const elig = items.filter(p => canUseCoupon(p, c, priceMap[p.id]));
    if (!elig.length) return [];
    if (isMulti(c)) return elig;
    let best = null;
    for (const p of elig) {
      if (!best) { best = p; continue; }
      if (priceMap[p.id] > priceMap[best.id]) best = p;
      else if (priceMap[p.id] === priceMap[best.id] && parseInt(p.point_rate, 10) < parseInt(best.point_rate, 10)) best = p;
    }
    return [best];
  }

  function calcDiscount(p, price, c) {
    if (['round', 'ceil', 'floor'].includes(p.discount_calc_type)) return price - Math[p.discount_calc_type](price * (100 - c.discount) / 100);
    return Math.floor(c.discount * price / 100);
  }
  const matchCountAndPrice = (items, priceMap, count, price) => items.filter(p => priceMap[p.id] >= (price || 1)).length >= count;

  function discountAmount(items, priceMap, c) {
    const cond = c.condition;
    if (c.is_limited_exceeded) return 0;
    if (cond.prerequisite) {
      if (cond.prerequisite.worktype_count && c.worktype_category_ids) {
        const cats = [];
        items.forEach(p => { if (priceMap[p.id] !== 0 && c.worktype_category_ids[p.work_type] !== undefined && !cats.includes(c.worktype_category_ids[p.work_type])) cats.push(c.worktype_category_ids[p.work_type]); });
        if (cond.prerequisite.worktype_count > cats.length) return 0;
      }
      if (cond.prerequisite.count && cond.prerequisite.price && !matchCountAndPrice(items, priceMap, cond.prerequisite.count, cond.prerequisite.price)) return 0;
    }
    const targets = targetProducts(items, priceMap, c);
    const sum = targets.reduce((s, p) => s + priceMap[p.id], 0);
    if (cond.price_sum && sum < cond.price_sum) return 0;
    if (cond.post_condition && cond.post_condition.count && cond.post_condition.price && !matchCountAndPrice(targets, priceMap, cond.post_condition.count, cond.post_condition.price)) return 0;
    if (c.discount_type === 'price') return Math.min(sum, c.discount);
    const raw = targets.reduce((s, p) => s + calcDiscount(p, priceMap[p.id], c), 0);
    return Math.min(sum, raw, cond.discount_limit ? Number(cond.discount_limit) : sum);
  }

  // =====================================================================
  // 4. 方案评估与搜索
  // =====================================================================
  let BULK = {}, COUPONS = [];

  // 一单：商品列表 → 小计 + 每张券能省多少
  function evalOrder(items) {
    const { price, applied } = applyBulkbuy(items, BULK);
    const subtotal = items.reduce((s, p) => s + price[p.id], 0);
    const options = [];
    for (const c of COUPONS) {
      const d = discountAmount(items, price, c);
      if (d > 0) options.push({ coupon: c, discount: d, targets: targetProducts(items, price, c).map(p => p.id) });
    }
    options.sort((a, b) => b.discount - a.discount);
    return { items, price, applied, subtotal, options };
  }

  // 多单：解决单次券的冲突，返回总价和每单选用的券
  function evalPlan(orders) {
    const evs = orders.map(evalOrder);
    const used = new Set();
    const chosen = evs.map(() => null);
    // 先按优惠额从大到小分配，单次券只能给一单
    const cands = [];
    evs.forEach((ev, oi) => ev.options.forEach(op => cands.push({ oi, op })));
    cands.sort((a, b) => b.op.discount - a.op.discount);
    for (const { oi, op } of cands) {
      if (chosen[oi]) continue;
      const single = !op.coupon.is_multiple_use;
      if (single && used.has(op.coupon.coupon_id)) continue;
      chosen[oi] = op;
      if (single) used.add(op.coupon.coupon_id);
    }
    let total = 0;
    evs.forEach((ev, oi) => { ev.coupon = chosen[oi]; ev.total = ev.subtotal - (chosen[oi] ? chosen[oi].discount : 0); total += ev.total; });
    return { orders: evs, total };
  }

  const clone = orders => orders.map(o => o.slice());
  const planKey = orders => orders.map(o => o.map(p => p.id).sort().join(',')).sort().join('|');

  function localSearch(orders, maxOrders) {
    orders = clone(orders).filter(o => o.length);
    let best = evalPlan(orders), improved = true, guard = 0;
    while (improved && guard++ < 60) {
      improved = false;
      // 单个商品移动到别的单 / 新单
      for (let oi = 0; oi < orders.length; oi++) {
        for (let ii = 0; ii < orders[oi].length; ii++) {
          const item = orders[oi][ii];
          const targets = orders.map((_, j) => j).filter(j => j !== oi);
          if (orders.length < maxOrders) targets.push(-1);
          for (const tj of targets) {
            const trial = clone(orders);
            trial[oi].splice(ii, 1);
            if (tj === -1) trial.push([item]); else trial[tj].push(item);
            const t = trial.filter(o => o.length);
            const ev = evalPlan(t);
            if (ev.total < best.total || (ev.total === best.total && t.length < orders.length)) {
              orders = t; best = ev; improved = true; break;
            }
          }
          if (improved) break;
        }
        if (improved) break;
      }
      if (improved) continue;
      // 合并两单（总价不升就合并，减少单数）
      outer: for (let a = 0; a < orders.length; a++) for (let b = a + 1; b < orders.length; b++) {
        const trial = clone(orders); trial[a] = trial[a].concat(trial[b]); trial.splice(b, 1);
        const ev = evalPlan(trial);
        if (ev.total <= best.total) { orders = trial; best = ev; improved = true; break outer; }
      }
    }
    // 超过最大单数：按代价最小合并
    while (orders.length > maxOrders) {
      let bestMerge = null;
      for (let a = 0; a < orders.length; a++) for (let b = a + 1; b < orders.length; b++) {
        const trial = clone(orders); trial[a] = trial[a].concat(trial[b]); trial.splice(b, 1);
        const ev = evalPlan(trial);
        if (!bestMerge || ev.total < bestMerge.ev.total) bestMerge = { trial, ev };
      }
      orders = bestMerge.trial; best = bestMerge.ev;
    }
    return { orders, plan: best };
  }

  function optimize(items, maxOrders) {
    const seeds = [];
    seeds.push([items.slice()]);                                   // 全部一单
    // 按"对每件作品优惠最大的券"分组
    const byCoupon = {}; const none = [];
    for (const p of items) {
      const ev = evalOrder([p]);
      if (ev.options.length) (byCoupon[ev.options[0].coupon.coupon_id] = byCoupon[ev.options[0].coupon.coupon_id] || []).push(p); else none.push(p);
    }
    const grouped = Object.values(byCoupon); if (none.length) grouped.push(none);
    if (grouped.length > 1) seeds.push(grouped);
    // 单品券对象各自一单，其余一单
    const singles = [], rest = [];
    for (const p of items) {
      const ev = evalOrder([p]);
      if (ev.options.length && !isMulti(ev.options[0].coupon)) singles.push([p]); else rest.push(p);
    }
    if (singles.length) seeds.push(singles.concat(rest.length ? [rest] : []));

    let bestRes = null; const seen = new Set();
    for (const seed of seeds) {
      const res = localSearch(seed, maxOrders);
      const k = planKey(res.orders); if (seen.has(k)) continue; seen.add(k);
      if (!bestRes || res.plan.total < bestRes.plan.total || (res.plan.total === bestRes.plan.total && res.orders.length < bestRes.orders.length)) bestRes = res;
    }
    // 单内按价格排序，单之间按金额排序
    bestRes.plan.orders.forEach(o => o.items.sort((a, b) => o.price[b.id] - o.price[a.id]));
    bestRes.plan.orders.sort((a, b) => b.total - a.total);
    return bestRes.plan;
  }

  // =====================================================================
  // 5. 购物车操作：移到稍后再买 / 放回购物车
  // =====================================================================
  async function moveItems(ids, toLater) {
    for (const id of ids) {
      const url = toLater
        ? `${location.origin}/${SITE}/cart/ajax/=/mode/move_to_buylater/product_id/${id}.html`
        : `${location.origin}/${SITE}/cart/ajax/=/mode/cart/obj_nocheck/1/product_id/${id}.html`;
      try { await fetch(url, { credentials: 'include' }); } catch (e) { console.warn('[cart planner] move failed', id, e); }
      await new Promise(r => setTimeout(r, 120));
    }
  }

  // =====================================================================
  // 6. UI
  // =====================================================================
  GM_addStyle(`
    .dco { margin: 0 0 16px; border: 1px solid rgba(128,128,128,.4); border-radius: 8px; background: rgba(128,128,128,.07); font-size: 13px; }
    .dco-bar { display:flex; align-items:center; gap:12px; padding:10px 14px; cursor:pointer; user-select:none; }
    .dco-bar:hover { background:rgba(128,128,128,.1); }
    .dco-brief .save { color:#e53935; font-weight:800; font-size:15px; }
    .dco-arrow { opacity:.7; white-space:nowrap; }
    .dco-body > .dco-head { border-top:1px solid rgba(128,128,128,.3); }
    .dco-head { display:flex; flex-wrap:wrap; align-items:center; gap:8px 14px; padding:10px 14px; border-bottom:1px solid rgba(128,128,128,.3); }
    .dco-title { font-weight:700; font-size:14px; }
    .dco-spacer { flex:1; }
    .dco-head label { display:inline-flex; align-items:center; gap:4px; }
    .dco-head input[type=number] { width:48px; font:inherit; padding:2px 4px; border:1px solid rgba(128,128,128,.5); border-radius:4px; background:transparent; color:inherit; }
    .dco-btn { font:inherit; padding:4px 12px; border:1px solid rgba(128,128,128,.5); border-radius:4px; background:transparent; color:inherit; cursor:pointer; }
    .dco-btn:hover { background:rgba(128,128,128,.15); }
    .dco-btn.primary { background:#1a73e8; border-color:#1a73e8; color:#fff; font-weight:700; }
    .dco-btn:disabled { opacity:.5; cursor:default; }
    .dco-summary { display:flex; flex-wrap:wrap; gap:8px 28px; padding:10px 14px; align-items:baseline; }
    .dco-summary b { font-size:16px; }
    .dco-summary .save { color:#e53935; font-weight:800; font-size:18px; }
    .dco-summary .dim { opacity:.7; }
    .dco-order { margin:10px 14px; border:1px solid rgba(128,128,128,.3); border-radius:6px; overflow:hidden; }
    .dco-order-head { display:flex; flex-wrap:wrap; align-items:center; gap:6px 14px; padding:8px 12px; background:rgba(128,128,128,.12); }
    .dco-order-head .n { font-weight:800; font-size:14px; }
    .dco-order-head .coupon { color:#e53935; font-weight:700; }
    .dco-order-head .total { margin-left:auto; font-weight:800; font-size:15px; }
    .dco-row { display:flex; align-items:center; gap:10px; padding:6px 12px; border-top:1px solid rgba(128,128,128,.15); }
    .dco-row img { width:48px; height:36px; object-fit:cover; border-radius:3px; flex:none; background:rgba(0,0,0,.2); }
    .dco-row .name { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .dco-row .name a { color:inherit; text-decoration:none; }
    .dco-row .name a:hover { text-decoration:underline; }
    .dco-row .p { white-space:nowrap; font-variant-numeric:tabular-nums; }
    .dco-row .p s { opacity:.55; margin-right:4px; }
    .dco-row .final { font-weight:700; min-width:80px; text-align:right; }
    .dco-tag { display:inline-block; padding:1px 6px; border-radius:3px; font-size:11px; margin-left:4px; white-space:nowrap; }
    .dco-tag.c { background:#e53935; color:#fff; }
    .dco-tag.c.off { background:transparent; color:#e53935; border:1px solid #e53935; opacity:.75; }
    .dco-tag.b { background:#6a1b9a; color:#fff; }
    .dco-tag.b.off { background:transparent; color:#9c4dcc; border:1px solid #9c4dcc; }
    .dco-tag.t { background:#f9a825; color:#000; }
    .dco-sum { padding:5px 12px; cursor:pointer; font-size:12px; opacity:.75; list-style:none; }
    .dco-sum::before { content:'▸ '; }
    details[open] > .dco-sum::before { content:'▾ '; }
    .dco-hints { padding:6px 14px 12px; }
    .dco-hints li { margin:3px 0 3px 16px; }
    .dco-status { padding:8px 14px; opacity:.8; }
    .dco-item-tags { margin-top:4px; line-height:1.9; }
    .dco-note { padding:0 14px 10px; font-size:12px; opacity:.7; }
  `);

  let panel, items, plan, baseline;

  function couponShort(c) {
    const n = c.coupon_name.replace(/【[^】]*】/g, '').trim();
    return (n.length > 24 ? n.slice(0, 24) + '…' : n) || c.coupon_name;
  }

  function render() {
    const orders = plan.orders;
    const saving = baseline.total - plan.total;
    const laterCount = $$('#show_cart .buy_later li.cart_list_item:not(._removed)').length;
    let html = `
      <div class="dco-bar dco-toggle">
        <span class="dco-title">${T.title}</span>
        <span class="dco-brief">${saving > 0 ? tf('briefSave', orders.length, yen(saving), yen(baseline.total), yen(plan.total)) : tf('briefNoSave', yen(baseline.total))}</span>
        <span class="dco-spacer"></span>
        <span class="dco-arrow">${settings.open ? T.collapse : T.expand}</span>
      </div>
      <div class="dco-body" ${settings.open ? '' : 'hidden'}>
      <div class="dco-head">
        <label>${T.maxOrdersPre} <input type="number" class="dco-max" min="1" max="30" value="${settings.maxOrders}"> ${T.maxOrdersPost}</label>
        <label title="${T.laterTitle}"><input type="checkbox" class="dco-later" ${settings.includeLater ? 'checked' : ''}> ${tf('includeLater', laterCount)}</label>
        <span class="dco-spacer"></span>
        <button class="dco-btn dco-recalc">${T.recalc}</button>
        <button class="dco-btn dco-restore" title="${T.restoreTitle}">${T.restoreAll}</button>
      </div>
      <div class="dco-summary">
        <span class="dim">${tf('nowOneCheckout', yen(baseline.total))}${baseline.orders[0].coupon ? tf('withCoupon', esc(couponShort(baseline.orders[0].coupon.coupon)), yen(baseline.orders[0].coupon.discount)) : T.noCoupon}</span>
        <span>${tf('splitInto', orders.length, yen(plan.total))}</span>
        <span>${saving > 0 ? tf('canSave', yen(saving)) : `<span class="dim">${T.noExtra}</span>`}</span>
      </div>`;

    orders.forEach((o, i) => {
      const cp = o.coupon;
      html += `<div class="dco-order">
        <div class="dco-order-head">
          <span class="n">${tf('orderN', i + 1)}</span>
          <span>${tf('itemsSubtotal', o.items.length, yen(o.subtotal))}</span>
          ${cp ? `<span class="coupon">${tf('useCoupon', esc(cp.coupon.coupon_name), yen(cp.discount))}</span>` : `<span class="dim">${T.noCouponUse}</span>`}
          ${Object.entries(o.applied).filter(([, a]) => a.applied > 0).map(([k, a]) => `<span class="dco-tag b">${tf('bundleApplied', a.applied)}</span>`).join('')}
          <span class="total">${tf('pay', yen(o.total))}</span>
          <button class="dco-btn dco-keep" data-i="${i}" title="${T.keepTitle}">${T.keepOnly}</button>
        </div>
        <details><summary class="dco-sum">${tf('detailsN', o.items.length)}</summary>
        ${o.items.map(p => {
          const price = o.price[p.id];
          const inCoupon = cp && cp.targets.includes(p.id);
          let cDisc = 0;
          if (inCoupon) {
            // 单件分摊：按比例显示（封顶时按比例）
            const raw = cp.targets.reduce((s, id) => s + calcDiscount(o.items.find(x => x.id === id), o.price[id], cp.coupon), 0);
            const own = calcDiscount(p, price, cp.coupon);
            cDisc = raw ? Math.round(cp.discount * own / raw) : 0;
          }
          const bulkApplied = p.bulkbuy_key && o.applied[p.bulkbuy_key] && price === parseInt(p.bulkbuy_price, 10) && price < parseInt(p.bulkbuy_origin_price, 10);
          const tags = [];
          if (bulkApplied) tags.push(`<span class="dco-tag b">${T.tagBundle}</span>`);
          else if (p.bulkbuy_key && BULK[p.bulkbuy_key]) tags.push(`<span class="dco-tag b off">${tf('tagBundleShort', BULK[p.bulkbuy_key].per_items)}</span>`);
          if (inCoupon) tags.push(`<span class="dco-tag c">${tf('tagCoupon', yen(cDisc))}</span>`);
          return `<div class="dco-row">
            <img loading="lazy" src="${esc(p.thumb)}" alt="">
            <div class="name"><a href="${location.origin}/${SITE}/work/=/product_id/${p.id}.html" target="_blank" rel="noopener">${esc(p.name)}</a>${tags.join('')}</div>
            <span class="p">${p.officialPrice > price ? `<s>${yen(p.officialPrice)}</s>` : ''}${yen(price)}</span>
            <span class="final">${inCoupon ? yen(price - cDisc) : ''}</span>
          </div>`;
        }).join('')}
        </details>
      </div>`;
    });

    // 提示：差几件
    const hints = [];
    const allItems = items;
    const keysInCart = [...new Set(allItems.map(p => p.bulkbuy_key).filter(k => k && BULK[k]))];
    for (const k of keysInCart) {
      const rule = BULK[k]; const n = allItems.filter(p => p.bulkbuy_key === k).length;
      if (n < rule.per_items) hints.push(tf('hintBundle', esc(rule.label), n, rule.per_items - n) + (rule.link ? ` <a href="${esc(rule.link)}" target="_blank" rel="noopener">${T.viewCampaign}</a>` : ''));
    }
    for (const c of COUPONS) {
      const cond = c.condition;
      if (!cond.post_condition || !cond.post_condition.count) continue;
      const elig = allItems.filter(p => canUseCoupon(p, c, p.basePrice));
      if (elig.length && elig.length < cond.post_condition.count) hints.push(tf('hintCoupon', esc(c.coupon_name), cond.post_condition.count, elig.length, cond.post_condition.count - elig.length));
    }
    if (hints.length) html += `<div class="dco-hints"><b>${T.hintsHead}</b><ul>${hints.map(h => `<li>${h}</li>`).join('')}</ul></div>`;
    html += `<div class="dco-note">${T.note}</div></div>`;
    panel.innerHTML = html;
    $('.dco-toggle', panel).addEventListener('click', () => {
      settings.open = !settings.open; saveSettings();
      $('.dco-body', panel).hidden = !settings.open;
      $('.dco-arrow', panel).textContent = settings.open ? T.collapse : T.expand;
    });

    $('.dco-max', panel).addEventListener('change', e => { settings.maxOrders = Math.max(1, parseInt(e.target.value, 10) || 1); saveSettings(); run(); });
    $('.dco-later', panel).addEventListener('change', e => { settings.includeLater = e.target.checked; saveSettings(); run(); });
    $('.dco-recalc', panel).addEventListener('click', run);
    $('.dco-restore', panel).addEventListener('click', async () => {
      const ids = $$('#show_cart .buy_later li.cart_list_item:not(._removed)').map(li => li.dataset.workno);
      if (!ids.length) return;
      if (!confirm(tf('restoreConfirm', ids.length))) return;
      setStatus(T.restoring); await moveItems(ids, false); location.reload();
    });
    $$('.dco-keep', panel).forEach(b => b.addEventListener('click', async () => {
      const i = parseInt(b.dataset.i, 10);
      const keep = new Set(plan.orders[i].items.map(p => p.id));
      const move = $$('#show_cart .buy_now li.cart_list_item:not(._removed)').map(li => li.dataset.workno).filter(id => !keep.has(id));
      const back = plan.orders[i].items.filter(p => p.inLater).map(p => p.id);
      if (!move.length && !back.length) { alert(T.alreadyOnly); return; }
      if (!confirm(tf('keepConfirm', move.length, back.length ? tf('keepConfirmBack', back.length) : '', i + 1, keep.size))) return;
      setStatus(T.arranging);
      await moveItems(move, true); await moveItems(back, false);
      location.reload();
    }));
  }

  function setStatus(t) { panel.innerHTML = `<div class="dco-bar"><span class="dco-title">${T.title}</span><span class="dco-brief">${esc(t)}</span></div>`; }

  // 给原生列表每件作品打标签
  function tagNativeItems() {
    for (const p of items) {
      const li = p.li; if (!li) continue;
      let box = $('.dco-item-tags', li);
      if (!box) { box = document.createElement('div'); box.className = 'dco-item-tags'; const name = $('.work_name', li); (name || li).appendChild(box); }
      const tags = [];
      if (p.bulkbuy_key && BULK[p.bulkbuy_key]) {
        const n = items.filter(x => x.bulkbuy_key === p.bulkbuy_key).length; const rule = BULK[p.bulkbuy_key];
        tags.push(`<span class="dco-tag b ${n >= rule.per_items ? '' : 'off'}" title="${esc(rule.label)}">${n >= rule.per_items ? tf('tagBundleOk', n, rule.per_items) : tf('tagBundleNeed', rule.per_items - n)}</span>`);
      }
      for (const c of COUPONS) {
        if (!canUseCoupon(p, c, p.basePrice)) continue;
        const single = !isMulti(c);
        const need = c.condition.post_condition && c.condition.post_condition.count > 1 ? tf('needN', c.condition.post_condition.count) : '';
        tags.push(`<span class="dco-tag c" title="${esc(c.coupon_name)}${esc(need)}${single ? T.singleNote : ''}">${c.discount_type === 'price' ? tf('yenOff', c.discount) : c.discount + '%'} ${esc(couponShort(c))}${single ? T.single : ''}${need ? tf('fromN', c.condition.post_condition.count) : ''}</span>`);
      }
      box.innerHTML = tags.join('');
    }
  }

  async function run() {
    try {
      setStatus(T.loading);
      BULK = readBulkbuyInfo();
      if (!COUPONS.length) COUPONS = await loadCoupons();
      items = readItems(settings.includeLater);
      if (!items.length) {
        const later = $$('#show_cart .buy_later li.cart_list_item:not(._removed)').map(li => li.dataset.workno);
        panel.innerHTML = `<div class="dco-bar"><span class="dco-title">${T.title}</span>
          <span class="dco-brief">${T.emptyCart}${later.length ? tf('laterHas', later.length) : ''}</span>
          <span class="dco-spacer"></span>
          ${later.length ? `<button class="dco-btn primary dco-restore-all">${T.restoreAll}</button>` : ''}</div>`;
        const b = $('.dco-restore-all', panel);
        if (b) b.addEventListener('click', async () => {
          b.disabled = true; b.textContent = T.restoringShort;
          await moveItems(later, false); location.reload();
        });
        return;
      }
      setStatus(tf('computing', items.length, COUPONS.length));
      await new Promise(r => setTimeout(r, 30));
      baseline = evalPlan([items.slice()]);
      plan = optimize(items, settings.maxOrders);
      render();
      tagNativeItems();
    } catch (e) {
      console.error('[cart planner]', e);
      setStatus(tf('error', e.message));
    }
  }

  function init() {
    // 只在购物车页本身运行（确认购买内容等页面的地址也以 /cart 开头）
    if (!/^\/[^/]+\/cart\/?$/.test(location.pathname)) return;
    const anchor = $('#cart_wrapper') || $('.empty_box') || $('.payment_cart_list');
    if (!anchor || !$('#show_cart')) return;
    panel = document.createElement('div'); panel.className = 'dco';
    anchor.insertAdjacentElement('beforebegin', panel);
    run();
    // 原生页面增删商品后重新计算
    let t; window.addEventListener('refreshed', () => { clearTimeout(t); t = setTimeout(run, 400); });
    try { (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window).$(window).on('refreshed', () => { clearTimeout(t); t = setTimeout(run, 400); }); } catch {}
  }
  if (document.readyState === 'complete') setTimeout(init, 300); else window.addEventListener('load', () => setTimeout(init, 300));
})();
