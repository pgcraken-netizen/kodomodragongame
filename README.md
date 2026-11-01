# 子どもドラゴンのワクワクタウン

スマートフォン縦画面向けの協力・探検ゲーム。提供された原画を使用した開発用ドラフトです。正式な団体監修・使用許諾は別途確認が必要です。

## 起動
`python -m http.server 8000` を実行し http://localhost:8000 を開きます。ビルド不要の静的サイトです。VercelではFramework PresetをOther、ビルドなし、出力はルートに設定します。

- `index.html`：既存マップ描画と基本画面
- `adventure.js`：料理・会話・イベント定義、進行、保存、設定
- `storybook.css`：レスポンシブ表示
- `assets/`：ユーザー提供の原画と参考画像（改変なし）
- `GAME_SPEC.md`：v2.1要件・実装状況・未実装項目
- `test-game.cjs`：Playwrightによる進行テスト（PlaywrightとChromiumが必要）

## 検証
390×844と320×568のChromiumで、公演・料理3種・不足相談・薪集め・保存再開・星・設定・外部リンク確認を検証。iPhone Safari／Android実機、子どもとの試遊は未実施。

## 制限
既存の静的構成を維持しておりNext.js/Phaserへの移行は未実施。方向別スプライト、障害物経路探索、BGM、高度な星座や花火、季節演出は今後の工程です。保存はブラウザ内のみです。
