# Timeline（スケジュールアプリ）

Expo（React Native + TypeScript）製。iOS / Android / Web 共通コード。

## できること（v0.1）
- 今日・明日の予定を追加／編集／削除（時・分・長さ・色をタップで選択）
- 24時間のサークル型タイムスケジュール（現在時刻の針、重なりは内側の輪へ）
- 月カレンダー（予定のある日に色ドット、タップでその日を表示）
- ブリーフィング読み上げ：読み上げサーバーがあれば Claude が原稿を書き、OpenAI TTS の声で再生。無ければアプリ内テンプレート＋端末の日本語音声。読み上げ中の予定を円の上でハイライト
- 予定保存後に「▶ 読み上げる」のお知らせ
- 端末内に自動保存（AsyncStorage）

## 動かし方
```
npm install
npx expo start      # スマホの Expo Go で QR を読む
npx expo start --web
```

## AI ナレーション（読み上げサーバー）
APIキーはアプリに入れず、`server/` の小さなサーバーだけが持ちます。

```
cd server
npm install
cp .env.example .env   # ANTHROPIC_API_KEY と OPENAI_API_KEY を記入
node --env-file=.env --import tsx src/index.ts
```
アプリ側はルートの `.env` に `EXPO_PUBLIC_BRIEFING_API_URL=http://<PCのIP>:8787` を書いて `npx expo start`。
サーバーに届かない・失敗したときは自動でテンプレート原稿＋端末音声に切り替わります。
APIを使わずに動作確認するには `BRIEFING_MOCK=1 MOCK_AUDIO=1 npx tsx src/index.ts`。

- 原稿: `claude-opus-5-5`（effort low、構造化出力で1文ずつ、拒否時は自動フォールバック）
- 音声: `gpt-4o-mini-tts`（低めで落ち着いたナレーター調の指示付き）

## 主なファイル
- `App.tsx` 画面全体
- `src/components/CircleSchedule.tsx` 円形タイムスケジュール
- `src/components/CalendarView.tsx` カレンダー
- `src/components/EventEditor.tsx` 予定入力シート
- `src/components/BriefingOverlay.tsx` 読み上げ画面
- `src/briefing.ts` 読み上げ原稿（サーバー呼び出し／テンプレート）と再生
- `server/src/index.ts` 読み上げサーバー（Claude で原稿、OpenAI TTS で音声）
