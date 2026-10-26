# Privacy Policy / 隐私政策 / プライバシーポリシー

_Last updated: 2026-10-26_

## English

**Ordered Image Downloader** (Chrome extension), **DLsite Wishlist: Sort by Discount** and **DLsite Cart Savings Planner** (userscripts) run entirely in your browser.

- They do **not** collect, store on any server, or transmit any personal data, browsing history, or usage statistics. There is no analytics, no telemetry, no remote server operated by the author.
- **Ordered Image Downloader** reads the images on the page you are currently viewing only when you click its toolbar icon, and saves the ones you select to the folder you choose. Your settings (filters, save method) are stored locally via Chrome's extension storage. If you choose "direct write" mode, the folder you pick is remembered locally in the browser's IndexedDB; the extension can only access that folder with your explicit permission.
- Permissions used: `activeTab` / `scripting` (read images on the current page on click), `downloads` (save files), `storage` (settings), `offscreen` (write files in the background in direct-write mode), host permission `<all_urls>` (fetch image files from the sites they are hosted on; required because images are often served from a different domain than the page).
- **The DLsite userscripts** talk only to `dlsite.com` using your existing login session, in the same way the site's own pages do (reading wishlist pages, your coupon list, product info; moving cart items; removing purchased items from your wishlist when you ask). Results are cached locally in Tampermonkey storage for a short time. Nothing is sent to any third party.
- The software is open source under the MIT license; you can audit the code in this repository.

Contact: open an issue in this repository.

## 中文

**顺序图片下载器**（Chrome 扩展）、**DLsite 收藏夹按折扣排序** 与 **DLsite 购物车优惠方案**（油猴脚本）全部在你的浏览器本地运行。

- **不**收集、不在任何服务器存储、也不传输任何个人数据、浏览记录或使用统计。没有统计分析、没有遥测、作者没有任何远程服务器。
- **顺序图片下载器** 只在你点击工具栏图标时读取当前页面上的图片，并把你选中的图片保存到你指定的文件夹。设置（过滤条件、保存方式）通过 Chrome 的扩展存储保存在本地。若选择"直接写入"模式，所选文件夹会记录在浏览器本地的 IndexedDB 中，且只有在你明确授权后扩展才能访问该文件夹。
- 使用的权限：`activeTab` / `scripting`（点击时读取当前页图片）、`downloads`（保存文件）、`storage`（设置）、`offscreen`（直接写入模式下在后台写文件）、主机权限 `<all_urls>`（从图片所在的服务器获取图片文件；图片经常与页面不在同一域名，因此必需）。
- **DLsite 油猴脚本** 只与 `dlsite.com` 通信，使用你已有的登录会话，与网站页面自身的请求方式相同（读取收藏夹分页、你的优惠券列表、商品信息；移动购物车商品；在你要求时从收藏夹移除已购买作品）。结果会在 Tampermonkey 的本地存储中短期缓存。不向任何第三方发送任何内容。
- 软件以 MIT 许可证开源，代码可在本仓库审阅。

联系方式：在本仓库提 Issue。

## 日本語

**順番画像ダウンローダー**（Chrome 拡張）、**DLsite お気に入りを割引順に並べ替え**、**DLsite カート割引プラン**（ユーザースクリプト）は、すべてお使いのブラウザ内でのみ動作します。

- 個人情報、閲覧履歴、利用統計などを収集・サーバー保存・送信することは**ありません**。解析やテレメトリはなく、作者が運用するサーバーも存在しません。
- **順番画像ダウンローダー** はツールバーのアイコンをクリックしたときにのみ現在のページの画像を読み取り、選択した画像を指定フォルダに保存します。設定（フィルタ、保存方法）は Chrome の拡張ストレージにローカル保存されます。「直接書き込み」モードでは、選んだフォルダがブラウザの IndexedDB にローカル記録され、明示的な許可があるときだけアクセスできます。
- 使用する権限：`activeTab` / `scripting`（クリック時に現在ページの画像を読む）、`downloads`（保存）、`storage`（設定）、`offscreen`（直接書き込みモードでバックグラウンド保存）、ホスト権限 `<all_urls>`（画像が置かれているサーバーから画像を取得するため。画像はページと別ドメインにあることが多いため必要）。
- **DLsite ユーザースクリプト** は既存のログインセッションを使って `dlsite.com` とのみ通信し、サイト自身のページと同じ方法でリクエストします（お気に入りの各ページ、所持クーポン一覧、作品情報の取得。カート内の移動。ご自身の操作による購入済み作品のお気に入りからの削除）。結果は Tampermonkey のローカルストレージに短時間キャッシュされます。第三者への送信は一切ありません。
- MIT ライセンスのオープンソースであり、本リポジトリでコードを確認できます。

連絡先：本リポジトリの Issue へ。
