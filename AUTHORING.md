# 教材の書き方（執筆ガイド）

このサイトはビルド不要の静的HTMLです。共通の見た目と動きは `assets/style.css` と `assets/app.js` にあり、各ページはHTMLに決まったクラスや `data-*` 属性を付けるだけで使えます。

## 章ページの雛形

```html
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>無線通信の基礎｜LTE Study</title>
  <link rel="stylesheet" href="../assets/style.css">
</head>
<body data-root="../" data-chapter="01">
<div class="page">
<main>
  <header class="chapter-hero">
    <div class="eyebrow">CHAPTER 01</div>
    <h1>無線通信の基礎</h1>
    <p class="lead">この章で何がわかるかを1〜2文で。</p>
    <div class="goals"><h2>この章のゴール</h2><ul><li>…</li></ul></div>
  </header>

  <h2>1. 見出し</h2>
  <p>本文…</p>

  <!-- 図・コンポーネント（下記） -->

  <h2>まとめ</h2>
  <h2>用語</h2>
  <dl class="terms"><dt>UE</dt><dd>User Equipment。端末のこと。</dd></dl>

  <h2>確認クイズ</h2>
  <div class="quiz" data-quiz="01"></div>

  <section class="sources"><h2>参考・出典</h2><ul><li><a href="…">…</a></li></ul><p>確認日: 2026-09</p></section>
</main>
</div>
<script src="../assets/data/quiz/ch01.js"></script>
<script src="../assets/app.js"></script>
</body>
</html>
```

- ヘッダー・サイドナビ・「学習済みにする」ボタン・前後ページャーは `app.js` が自動生成します。
- `data-root` はルートへの相対パス（`chapters/`, `tools/` 配下は `../`、ルートは空）。
- ツールページやサイドナビ不要のページは `data-chapter` を付けず、必要なら `data-layout="wide"`。

## コンポーネント

| 用途 | 書き方 |
|---|---|
| 注意書き | `<div class="callout">`（`.tip` `.warn` `.danger` `.robot`）、`<span class="title">見出し</span>` |
| カード | `<div class="card-grid"><div class="card">…</div></div>` |
| バッジ | `<span class="badge ok">対応</span>`（`accent` `ok` `warn` `bad`） |
| 表 | `<div class="table-wrap"><table>…</table></div>` |
| 折りたたみ | `<details class="more"><summary>もっと詳しく</summary>…</details>` |
| 図 | `<figure class="figure"><div class="hint">操作ヒント</div><svg viewBox="…">…</svg><figcaption>…</figcaption></figure>` |
| ターミナル | `<div class="terminal">`（行は `.in` `.out` `.note` `.err`） |
| チェックリスト | `<ul data-checklist="一意なID"><li>…</li></ul>`（状態を保存） |

### クリックで解説（hotspots）

```html
<figure class="figure" data-hotspots data-hs-default="ue">
  <svg viewBox="0 0 800 240">
    <g data-hs="ue"><rect class="box" …/><text …>端末</text></g>
    <g data-hs="enb">…</g>
  </svg>
  <div class="hs-panel"></div>
  <template data-hs-content="ue"><h4>UE（端末）</h4><p>…</p></template>
  <template data-hs-content="enb"><h4>eNodeB</h4><p>…</p></template>
</figure>
```

### ステップ再生（stepper）

```html
<figure class="figure" data-stepper data-interval="3500">
  <svg viewBox="…">
    <g data-show-at="1,2">ステップ1・2だけ表示</g>
    <g data-show-from="3">ステップ3以降に表示</g>
    <g data-dim-at="1">ステップ1では薄く表示</g>
  </svg>
  <div class="stepper-controls-slot"></div>  <!-- 省略時は最初の .step の直前 -->
  <div class="step" data-title="セルサーチ"><h4>① セルサーチ</h4><p>…</p></div>
  <div class="step" data-title="…">…</div>
</figure>
```

ステップ変更時に `stepchange` イベント（`e.detail.step` は1始まり）が発火するので、独自アニメーションもつなげられます。

### タブ

```html
<div data-tabs>
  <div class="tab-list"><button data-tab="a">A</button><button data-tab="b">B</button></div>
  <div data-tab-panel="a">…</div><div data-tab-panel="b">…</div>
</div>
```

## SVGの色

テーマ（ライト/ダーク）に追従させるため、色は必ずCSS変数で指定します：`fill="var(--c1)"`。
系列色：`--c1` 端末/UE（青）、`--c2` 基地局/RAN（紫）、`--c3` コア網/EPC（緑）、`--c4` インターネット/外部（橙）、`--c5` SIM/セキュリティ（桃）、`--c6` 補助（灰）。
他に `--text` `--text-muted` `--surface` `--surface-2` `--border` `--accent` `--ok` `--warn` `--bad`。
共通クラス：`.box`（薄い箱）、`.line`（線、`.dash` で点線）、`text.t-muted`、`text.t-small`。SVG内の文字は 12〜14px を基本にし、スマホ幅でも読めるよう `viewBox` 幅は 800 前後までに収めます。

## クイズデータ

`assets/data/quiz/chXX.js` に章ごとに書きます。

```js
(window.QUIZ = window.QUIZ || []).push(
  { id: "01-1", ch: "01", type: "single", q: "問題文", choices: ["A", "B", "C", "D"], answer: 1, explain: "解説（HTML可）" },
  { id: "01-2", ch: "01", type: "tf", q: "正誤を問う文", answer: false, explain: "…" },
  { id: "01-3", ch: "01", type: "order", q: "正しい順に並べよ", choices: ["1番目", "2番目", "3番目"], explain: "…" }
);
```

- `id` はサイト全体で一意（`章-番号`、ドットは使わない）。
- `single` の選択肢は表示時にシャッフルされるので、解説で「選択肢B」のように位置で参照しない。
- `order` は `choices` を**正しい順**で書く（表示時にシャッフル）。

## 事実情報の扱い

周波数バンド、各国の認証制度、キャリアの停波予定などは変わります。出典を `.sources` に書き、確認日を記載してください。
