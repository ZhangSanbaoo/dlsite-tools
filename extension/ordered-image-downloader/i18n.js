// 多语言：跟随 Chrome 界面语言（_locales/zh_CN, _locales/en）
function t(key, subs) {
  const arr = subs === undefined ? [] : (Array.isArray(subs) ? subs.map(String) : [String(subs)]);
  // offscreen 文档没有 chrome.i18n：用后台塞进来的字典（globalThis.__msgs）
  if (!chrome.i18n) {
    let s = (globalThis.__msgs && globalThis.__msgs[key]) || key;
    arr.forEach((v, i) => { s = s.split('$' + (i + 1)).join(v); });
    return s;
  }
  return chrome.i18n.getMessage(key, arr.length ? arr : undefined) || key;
}
// 把 HTML 里带 data-i18n / data-i18n-placeholder / data-i18n-title 的元素替换成当前语言
function localizeHtml(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.documentElement.lang = chrome.i18n.getUILanguage();
}
if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => localizeHtml());
