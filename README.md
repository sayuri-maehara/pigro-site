# Pigro株式会社 コーポレートサイト

1ページ完結型（LP形式）のコーポレートサイト。Vercel 無料枠での公開を想定しています。

## ファイル構成

```
pigro-site/
├── index.html              トップページ（全セクション）
├── privacy.html            プライバシーポリシー
├── api/
│   └── contact.js          お問い合わせフォームの送信処理（Vercel Functions）
└── assets/
    ├── yasutake.jpg        代表写真（900px・JPG）
    ├── yasutake.webp       代表写真（WebP・軽量版）
    ├── yasutake@1x.jpg     代表写真（450px・予備）
    ├── ogp.png             SNS/LINE共有用画像（1200×630）
    ├── favicon.svg         ファビコン
    └── apple-touch-icon.png
```

---

## 1. フォームを動かす（必須・最初にやること）

HTMLだけではメールは送信できません。以下のどちらかを選んでください。

### 方式A：Vercel Functions + Resend（推奨）

1. https://resend.com で無料アカウントを作成し、API キーを取得
2. Resend の「Domains」で `pigro-fukuoka.com` を追加し、表示される **SPF / DKIM の DNS レコードをお名前.com に登録**
   （※ MX レコードは触らないこと。追加するのは TXT と CNAME のみ）
3. Vercel のプロジェクト → Settings → Environment Variables に以下を登録

| 変数名 | 値 |
|---|---|
| `RESEND_API_KEY` | Resend の API キー |
| `MAIL_FROM` | `Pigro お問い合わせ <noreply@pigro-fukuoka.com>` |
| `MAIL_TO` | `pigro@pigro-fukuoka.com` |

4. 再デプロイして完了

> ドメイン認証が終わるまでは `MAIL_FROM` を `onboarding@resend.dev` にしておけば動作確認できます。

**なぜ送信元を `noreply@` にするのか**：送信元を `pigro@pigro-fukuoka.com` に偽装すると SPF / DKIM の検証に失敗し、迷惑メールフォルダに入ります。送信元は専用アドレス、返信先（Reply-To）にお問い合わせ者のアドレスを入れる構成にしています。

### 方式B：Web3Forms（最速・5分／サーバー不要）

1. https://web3forms.com でメールアドレスを登録し、Access Key を取得
2. `index.html` の末尾スクリプト内、`var ENDPOINT = '/api/contact';` を
   `var ENDPOINT = 'https://api.web3forms.com/submit';` に変更
3. 同じ `fetch` の `body` に `access_key` を追加

```js
body: JSON.stringify(Object.assign({ access_key: 'ここにAccess Key' }, data))
```

この場合、自動返信メールは Web3Forms 側の設定画面から有効にしてください。`api/` フォルダは不要です。

---

## 2. Vercel へデプロイ

1. このフォルダごと GitHub にプッシュ（または Vercel の画面にドラッグ＆ドロップ）
2. Vercel（`berob-sales-tool` org）で New Project → インポート
3. Framework Preset は **Other**、Build Command は空欄のままで OK
4. デプロイ完了後、`〇〇.vercel.app` で表示を確認

## 3. 独自ドメインを接続

1. Vercel → Settings → Domains → `pigro-fukuoka.com` と `www.pigro-fukuoka.com` を追加
2. 表示される DNS レコードをお名前.com の「ネームサーバー/DNS設定」に登録
3. **作業前に必ず、現在の DNS 設定をスクリーンショットで控えること**
4. **MX レコードは絶対に削除・変更しないこと**（メールが止まります）。追加するのは A レコードと CNAME レコードのみ

---

## 公開前チェックリスト

- [ ] フォームからテスト送信し、社内通知メールと自動返信メールの両方が届くか確認
- [ ] 迷惑メールフォルダに入っていないか確認
- [ ] スマホ実機で、下部固定バーの「電話する」がタップ発信できるか確認
- [ ] 電気通信媒介業の届出番号 `J2500301` を届出受理通知の原本と照合
- [ ] 人材サービス総合サイトに自社の情報が掲載されているか確認（未掲載ならリンクを外す）
- [ ] LINE に URL を貼って、OGP 画像が表示されるか確認
- [ ] プライバシーポリシーの文面を社労士・弁護士等に確認
- [ ] Google Search Console にサイトを登録
- [ ] 地図に表示される場所が正しいか確認（現行サイトの埋め込みURLを流用しています）
- [ ] 公式LINEのURL `https://lin.ee/iLw0kzs` が有効か確認
- [ ] Instagram のリンクを残すか判断（投稿が営業に使える内容かどうかで決める）

## 配色

濃紺をベースに、ベージュを差し色にしています。濃紺を大面積に敷くと古い印象になるため、
**地は明るいまま（`--paper`）に保ち、濃紺は文字・ヘッダー・フッター・中間CTAに限定**しています。

| 変数 | 色 | 用途 |
|---|---|---|
| `--navy` | `#14213D` | 文字色、ボタン、中間CTA、ロゴ |
| `--navy-deep` | `#0C1629` | フッター |
| `--paper` | `#FAF8F3` | ページ全体の地色 |
| `--sand` | `#EDE5D5` | ベージュの面（引用、対応エリア、まとめ文） |
| `--sand-2` | `#DED2B9` | 見出しの下線、罫線、装飾 |
| `--accent` | `#8A6C3A` | 小さなラベル文字（コントラスト確保のため濃いめ） |

ベージュは面と装飾にだけ使い、本文の文字色には使っていません。薄いベージュ文字は読みづらくなるためです。

## 写真を後から足すとき

現在は代表写真のみを使用しています。追加する場合の推奨箇所と手順です。

**優先度の高い順**

1. 事業内容の各柱（3枚）… 商談中の様子、決済端末の実物、求人媒体の管理画面など
2. 会社概要のそば（1枚）… 事務所やビル入口。地図とセットで実在性が伝わる
3. ヒーロー右側（1枚）… ここに写真を置く場合は、線のアニメーションと差し替える

**手順**

1. スマホで撮影 → 横位置、明るい場所で
2. `assets/` に置く（ファイル名は半角英数字。例 `office.jpg`）
3. 1200px 幅程度に縮小してから配置する（そのままだと重い）
4. `<img src="/assets/office.jpg" alt="説明文" loading="lazy">` の形で挿入

ストック写真は使わないでください。他社サイトと同じ画像になり、かえって信頼を損ないます。
撮れる写真がないうちは、余白のままにしておくほうが良い状態です。

## 修正したくなったときのメモ

| やりたいこと | 場所 |
|---|---|
| 電話番号・住所を変える | `index.html` を `092-401-3675` で検索、全箇所置換 |
| キャッチコピーを変える | `index.html` の `<h1>` 内 |
| 事業内容の文章を変える | `index.html` の `<!-- ===== 事業内容 ===== -->` 以下 |
| 色を変える | `index.html` 冒頭の `:root{ }` 内。`--navy` が濃紺、`--sand` がベージュ |
| LINEのURLを変える | `index.html` を `lin.ee` で検索（3か所） |
| 地図を差し替える | Googleマップ →「共有」→「地図を埋め込む」で出る URL を `map-frame` 内の iframe に貼る |
| 写真を追加する | 下記「写真を後から足すとき」を参照 |
| 代表写真を差し替える | `assets/yasutake.jpg` と `.webp` を同名で上書き |
