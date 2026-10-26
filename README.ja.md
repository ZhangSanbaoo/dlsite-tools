# DLsite Tools & 順番画像ダウンローダー

[中文](README.md) · [English](README.en.md) · [日本語](README.ja.md)

3 つの小さなツール。UI はブラウザ／DLsite の言語に合わせて切り替わります（中文 / English / 日本語）。

| ツール | 種類 | 内容 | インストール |
|---|---|---|---|
| **順番画像ダウンローダー** | Chrome 拡張 | ページ内の画像を上から順にプレビュー・選択・ドラッグで並べ替えて一括ダウンロード。`00, 01…` と自動連番 | [Chrome ウェブストア](https://chromewebstore.google.com/detail/nbmhpjbgahnfbabcflpcbkppnllbiihe)（審査中）・または [Release](../../releases) を展開して「パッケージ化されていない拡張機能を読み込む」 |
| **DLsite お気に入りを割引順に並べ替え** | ユーザースクリプト | お気に入りを割引率／割引後価格／値引き額で全ページ横断で並べ替え。割引率で絞り込み、購入済みの整理も | [Greasy Fork](https://greasyfork.org/ja/scripts/602350-dlsite) ・または [`userscripts/dlsite-wishlist-sort.user.js`](userscripts/dlsite-wishlist-sort.user.js) |
| **DLsite カート割引プラン** | ユーザースクリプト | DLsite 自身の計算ルールで最も安くなる会計の分け方を提案。各作品に使えるクーポンとセット割の状態を表示 | [Greasy Fork](https://greasyfork.org/ja/scripts/602351-dlsite) ・または [`userscripts/dlsite-cart-optimizer.user.js`](userscripts/dlsite-cart-optimizer.user.js) |

ユーザースクリプトには [Tampermonkey](https://www.tampermonkey.net/) が必要です。

詳細：
- [extension/ordered-image-downloader/README.ja.md](extension/ordered-image-downloader/README.ja.md)
- [userscripts/README.ja.md](userscripts/README.ja.md)

## プライバシー

すべてローカルで動作し、データの収集・送信は一切行いません。[PRIVACY.md](PRIVACY.md) を参照。

## フィードバック

[Issue](../../issues) へどうぞ。DLsite の改修でスクリプトが動かなくなった場合は、`view-source:` で保存したページを添付していただけると助かります。

## ライセンス

MIT
