# DLsite Tools & Ordered Image Downloader

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

Three small tools. The UI follows your browser / DLsite language (中文 / English / 日本語).

| Tool | Type | What it does | Install |
|---|---|---|---|
| **Ordered Image Downloader** | Chrome extension | Preview, pick, drag-reorder and batch-download the images on a page in top-to-bottom order, auto-numbered `00, 01…` | [Chrome Web Store](#) (pending) · or download a [Release](../../releases), unzip, and "Load unpacked" |
| **DLsite Wishlist: Sort by Discount** | Userscript | Sort your wishlist by discount rate / sale price / amount saved across all pages, Steam-style; filter by discount; clean up purchased items | [Greasy Fork](#) (pending) · or install [`userscripts/dlsite-wishlist-sort.user.js`](userscripts/dlsite-wishlist-sort.user.js) |
| **DLsite Cart Savings Planner** | Userscript | Uses DLsite's own pricing rules to find the cheapest way to split checkout; tags every item with usable coupons and bundle status | [Greasy Fork](#) (pending) · or install [`userscripts/dlsite-cart-optimizer.user.js`](userscripts/dlsite-cart-optimizer.user.js) |

Userscripts require [Tampermonkey](https://www.tampermonkey.net/).

Details:
- [extension/ordered-image-downloader/README.en.md](extension/ordered-image-downloader/README.en.md)
- [userscripts/README.en.md](userscripts/README.en.md)

## Privacy

Everything runs locally. Nothing is collected or sent anywhere. See [PRIVACY.md](PRIVACY.md).

## Feedback

Please open an [Issue](../../issues). If DLsite changes its layout and a script breaks, attaching the page saved from `view-source:` helps a lot.

## License

MIT
