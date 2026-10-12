# Timeline（スケジュールアプリ）

Expo（React Native + TypeScript）製。iOS / Android / Web 共通コード。

## できること（v0.1）
- 今日・明日の予定を追加／編集（時・分・長さ・色をタップで選択）
- タイムラインの各予定の × で削除、「すべて消す」でその日をまとめて削除、「元に戻す」で取り消し
- 時計と同じ並び（12時が上）のサークル型タイムスケジュール。午前／午後を切り替え、現在時刻の針つき
- 月カレンダー（予定のある日に色ドット、タップでその日を表示）
- 日記（下の「日記」タブ）：気分を5段階で選び、文章を書くと自動で保存。文章の下に写真を1日6枚まで貼れる（タップで拡大、×で外す）。前後の日へ移動、これまでの日記の一覧
- 端末内に自動保存（AsyncStorage）
- アプリについて（右上の i ボタン）：プライバシーポリシー、お問い合わせ、すべてのデータを消す

## 動かし方
```
npm install
npx expo start      # スマホの Expo Go で QR を読む
npx expo start --web
```

## iPhone のホーム画面で使う（無料・PC不要）
Webアプリ版を Vercel（無料）で公開し、Safari の「ホーム画面に追加」でアイコンから全画面で開けます。
1. Safari で vercel.com にアクセスし「Continue with GitHub」で登録（Hobby＝無料）
2. 「Add New → Project」で `timeline-schedule-app` を Import（ビルド設定は `vercel.json` から自動）
3. 「Deploy」→ できた `〜.vercel.app` を Safari で開き、共有ボタン →「ホーム画面に追加」

予定はそのiPhoneの中だけに保存されます。

## App Store に出す
手順とストア掲載文は [docs/APP_STORE.md](docs/APP_STORE.md)、プライバシーポリシーは [PRIVACY.md](PRIVACY.md)。ビルドと送信は GitHub Actions の「iOS App Store」で行います。

## 主なファイル
- `App.tsx` 画面全体
- `src/components/CircleSchedule.tsx` 円形タイムスケジュール
- `src/components/CalendarView.tsx` カレンダー
- `src/components/EventEditor.tsx` 予定入力シート
- `src/components/EventList.tsx` タイムライン（削除ボタンつき）
- `src/components/DiaryView.tsx` 日記
- `snack/App.js` Expo Snack 用の1ファイル版（`scripts/build-snack.mjs` で作る）
