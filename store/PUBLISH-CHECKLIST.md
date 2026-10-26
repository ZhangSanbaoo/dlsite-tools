# 发布清单（按顺序做）

## 0. 替换占位符
全局搜索并替换：`张三包 / Zhang Sanbao` → 署名；`ZhangSanbaoo` → GitHub 用户名。
涉及：两个 .user.js、LICENSE、README*、store/*、PRIVACY.md（无占位符）。

## 1. GitHub 仓库
1. github.com 新建公开仓库 `dlsite-tools`（名字可改，改了记得同步替换链接）。
2. 把 `dlsite-tools/` 目录内容上传（网页端 "Add file → Upload files" 拖进去即可，或用 git）。
3. Releases → "Draft a new release"：tag `v1.0.0`，上传 `ordered-image-downloader.zip`（商店审核期间给人手动安装用）。
4. 确认 https://github.com/ZhangSanbaoo/dlsite-tools/blob/main/PRIVACY.md 能打开——这是商店要填的隐私政策链接。

## 2. Greasy Fork（两个脚本）
见 store/greasyfork-notes.md。记得勾「成人内容」。
发布后把 README 里 `[Greasy Fork](#)（待发布）` 的 `#` 换成实际链接。

## 3. Chrome Web Store（扩展）
1. https://chrome.google.com/webstore/devconsole 注册开发者（一次性 5 美元）。
2. "New item" → 上传 `store/ordered-image-downloader.zip`。
3. Store listing：按 store/chrome-web-store-listing.md 分别填 zh_CN / en / ja；分类选 "Productivity"（或 "Photos"）；上传 1280×800 截图至少 1 张（建议 3 张：选图界面、下载进度、设置页），图标用 icons/128.png。
4. Privacy practices：单一用途、每项权限用途、"不收集数据"、隐私政策链接——文案都在 listing 文件末尾。
5. Distribution：Public，所有地区。
6. 提交审核。含 `<all_urls>` 通常 1～7 天。被打回最常见的原因是权限说明不够具体，直接把 listing 里那段贴上去即可。
7. 通过后把 README 里的商店链接补上。

## 4. 可选：Edge 加载项
https://partner.microsoft.com/dashboard/microsoftedge 免费注册，上传同一个 zip，文案同上。

## 5. 以后更新
- 脚本：改 `@version` → 推 GitHub → Greasy Fork 自动同步（或手动粘贴）。
- 扩展：改 manifest `version` → 重新打 zip → 商店后台 "Package → Upload new package" → 再次审核。

## 已准备好的素材（store/assets）
- `icon-512.png` / `icon-128.png`：商店图标（128 必填）
- `promo-440x280.png`：小宣传图
- `screenshot-1-1280x800.png`：截图 1（选图界面）。如有余力再补：下载进度、设置页，同样做成 1280×800。
