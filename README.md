# 英単語暗記アプリ

シンプルなブラウザ上で動く英単語暗記アプリ（シングルページ、ローカルストレージ保存）です。

使い方:

- `index.html` をブラウザで開くだけで動作します。
- 単語を追加、一覧表示、JSONでのエクスポート/インポート、クイズ機能を搭載しています。

ローカルでプレビューする例:

```bash
# カレントをプロジェクトルートにしてから (macOS / Linux / Windows WSL)
python3 -m http.server 5173
# ブラウザで http://localhost:5173 を開く
```

ファイル:

- [index.html](index.html)
- [src/app.js](src/app.js)
- [src/styles.css](src/styles.css)

次にやれることの提案:

- 入力補完や例文検索API連携
- 正答判定のあいまいマッチ強化
- 単語ごとの学習履歴と復習アルゴリズム（SRS）
# ankiapp
https://munno000.github.io/ankiapp/