# DLsite Tools & Ordered Image Downloader

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

三个小工具，界面跟随浏览器 / DLsite 的语言自动切换（中文 / English / 日本語）：

| 工具 | 类型 | 作用 | 安装 |
|---|---|---|---|
| **顺序图片下载器** | Chrome 扩展 | 按页面从上到下顺序预览、挑选、拖拽排序并批量下载图片，自动按 `00, 01…` 编号 | [Chrome 应用商店](https://chromewebstore.google.com/detail/nbmhpjbgahnfbabcflpcbkppnllbiihe)（审核中）· 或下载 [Release](../../releases) 解压后"加载已解压的扩展程序" |
| **DLsite 收藏夹按折扣排序** | 油猴脚本 | 像 Steam 一样把收藏夹按折扣力度 / 折后价 / 节省金额跨分页排序，按折扣筛选，一键清理已购买 | [Greasy Fork](https://greasyfork.org/zh-CN/scripts/602350-dlsite) · 或直接安装 [`userscripts/dlsite-wishlist-sort.user.js`](userscripts/dlsite-wishlist-sort.user.js) |
| **DLsite 购物车优惠方案** | 油猴脚本 | 照搬 DLsite 自己的计价规则，算出最省钱的分单方案，给每件作品标注可用券和组合特价状态 | [Greasy Fork](https://greasyfork.org/zh-CN/scripts/602351-dlsite) · 或直接安装 [`userscripts/dlsite-cart-optimizer.user.js`](userscripts/dlsite-cart-optimizer.user.js) |

油猴脚本需要先安装 [Tampermonkey](https://www.tampermonkey.net/)。

详细说明见各目录下的 README：
- [extension/ordered-image-downloader/README.md](extension/ordered-image-downloader/README.md)
- [userscripts/README.md](userscripts/README.md)

## 隐私

所有工具都只在本地运行，不收集、不上传任何数据。详见 [PRIVACY.md](PRIVACY.md)。

## 反馈

问题和建议请提 [Issue](../../issues)。DLsite 改版导致脚本失效时，附上页面的 `view-source:` 保存文件会很有帮助。

## 许可

MIT
