# Greasy Fork 发布备注

两个脚本的元数据已包含 `@name:en / @name:ja / @description:en / @description:ja / @license MIT / @homepageURL / @supportURL`，Greasy Fork 会自动识别为多语言。

发布前把脚本里的 `张三包 / Zhang Sanbao` 和 `ZhangSanbaoo` 替换成真实值。

发布时：
1. 「发布脚本」→「粘贴代码」，或选择「从 URL 同步」填 GitHub 的 raw 链接（之后推送到 GitHub 就自动更新）：
   - https://raw.githubusercontent.com/ZhangSanbaoo/dlsite-tools/main/userscripts/dlsite-wishlist-sort.user.js
   - https://raw.githubusercontent.com/ZhangSanbaoo/dlsite-tools/main/userscripts/dlsite-cart-optimizer.user.js
2. **勾选「成人内容」**（DLsite maniax 为 R18 站点，不勾会被下架）。
3. 「附加信息」可直接粘贴 userscripts/README.md 对应章节（Greasy Fork 支持多语言附加信息，可分别粘贴 zh / en / ja）。
4. 每次改版本号（`@version`）并推送，Greasy Fork 同步后用户会收到更新。
