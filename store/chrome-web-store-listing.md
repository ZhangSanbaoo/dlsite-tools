# Chrome Web Store 商店文案（三语）

商店后台可以为每种语言单独填写。扩展本身已含 `_locales`（zh_CN 默认 / en / ja），商店会按用户语言显示对应的名称与描述。

---
## zh_CN

**名称**：顺序图片下载器

**简短描述（≤132 字符）**：
按页面顺序预览、挑选、拖拽排序并批量下载当前页图片，自动按 00、01… 编号到你命名的文件夹。

**详细描述**：
一键把网页上的图片按从上到下的顺序批量保存，并保证文件名顺序和页面一致。

功能
• 点击图标即扫描当前页：自动滚动触发懒加载，列出所有图片，默认全选
• 点击取消不要的图，拖动调整顺序，编号实时预览
• 输入文件夹名，图片保存到该文件夹，命名为 00、01、02…（超过 100 张自动用三位数，以此类推）
• 保留原始格式（jpg / png / webp / gif…），无扩展名的按文件内容自动补全
• 下载在后台进行，关闭弹窗不中断；失败的图片一键重试，编号不变
• 选图状态按标签页保留，直到页面刷新
• 可选"直接写入文件夹"模式：不经过浏览器下载列表，与下载管理器互不干扰
• 设置：尺寸过滤、去重、自动滚动、CSS 背景图、并发数
• 界面语言：中文 / English / 日本語，随 Chrome 语言自动切换

隐私
完全本地运行，不收集、不上传任何数据。开源（MIT）：https://github.com/ZhangSanbaoo/dlsite-tools

---
## en

**Name**: Ordered Image Downloader

**Short description (≤132 chars)**:
Preview, pick, drag-reorder and batch-download a page's images in top-to-bottom order, auto-numbered 00, 01… into a folder you name.

**Detailed description**:
Save all images on a web page in one go, in the exact order they appear, with filenames that keep that order.

Features
• Click the icon to scan the current page: auto-scrolls to trigger lazy loading, lists every image, all selected by default
• Click to deselect, drag to reorder, numbers preview live
• Type a folder name; images are saved there as 00, 01, 02… (three digits automatically beyond 100, and so on)
• Keeps original formats (jpg / png / webp / gif…); extension-less URLs are typed from file content
• Downloads run in the background; closing the popup doesn't stop them; retry failed images with numbers unchanged
• Selection state is kept per tab until the page reloads
• Optional "direct write" mode bypasses the browser download list and doesn't interfere with download managers
• Settings: size filter, de-duplication, auto-scroll, CSS backgrounds, parallelism
• UI in English / 中文 / 日本語, following Chrome's language

Privacy
Runs entirely locally; collects and sends nothing. Open source (MIT): https://github.com/ZhangSanbaoo/dlsite-tools

---
## ja

**名前**：順番画像ダウンローダー

**短い説明（132 文字以内）**：
ページの画像を上から順にプレビュー・選択・並べ替えて一括保存。指定フォルダに 00、01… と自動連番。

**詳しい説明**：
ウェブページの画像を表示順どおりに一括保存し、ファイル名でもその順番を保ちます。

機能
• アイコンをクリックで現在のページを走査：自動スクロールで遅延読み込みを発火させ、全画像を一覧表示（既定で全選択）
• クリックで除外、ドラッグで並べ替え、番号をリアルタイム表示
• フォルダ名を入力すると、その中に 00、01、02… の名前で保存（100 枚超は自動で 3 桁…）
• 元の形式を維持（jpg / png / webp / gif…）。拡張子のない URL はファイル内容から判定
• ダウンロードはバックグラウンドで続行、ポップアップを閉じても中断しない。失敗分は番号を変えずに再試行
• 選択状態はページ再読み込みまでタブごとに保持
• 任意の「直接書き込み」モード：ブラウザのダウンロード一覧を経由せず、ダウンローダーと干渉しない
• 設定：サイズ除外、重複除外、自動スクロール、CSS 背景、同時数
• UI は日本語 / English / 中文、Chrome の言語に追従

プライバシー
完全にローカルで動作し、データの収集・送信は行いません。オープンソース（MIT）：https://github.com/ZhangSanbaoo/dlsite-tools

---
## 商店后台"权限用途说明"（Privacy practices 页，英文填写即可）

- **activeTab / scripting**: Reads the images on the page the user is viewing, only when the user clicks the extension icon, so they can be listed and downloaded.
- **downloads**: Saves the selected images into the folder the user named.
- **storage**: Stores the user's settings (filters, save method) and the per-tab selection state.
- **offscreen**: In the optional "direct write" mode, writes files into the user-chosen folder in the background so downloads continue after the popup closes.
- **Host permission <all_urls>**: Image files are frequently served from a different domain than the page (CDNs). The extension must be able to fetch them from wherever they are hosted; it only does so for the images the user selected.
- **Single purpose**: Download the images of the current page in order, numbered.
- **Remote code**: No. **Data usage**: No user data is collected or transmitted.
- **Privacy policy URL**: https://github.com/ZhangSanbaoo/dlsite-tools/blob/main/PRIVACY.md
