# Timeline（スケジュールアプリ）

Expo（React Native + TypeScript）製。iOS / Android / Web 共通コード。

## できること（v0.1）
- 今日・明日の予定を追加／編集／削除（時・分・長さ・色をタップで選択）
- 24時間のサークル型タイムスケジュール（現在時刻の針、重なりは内側の輪へ）
- 月カレンダー（予定のある日に色ドット、タップでその日を表示）
- ブリーフィング読み上げ：予定から読み上げ原稿を組み立て、端末の日本語音声で1文ずつ再生。読み上げ中の予定を円の上でハイライト
- 予定保存後に「▶ 読み上げる」のお知らせ
- 端末内に自動保存（AsyncStorage）

## 動かし方
```
npm install
npx expo start      # スマホの Expo Go で QR を読む
npx expo start --web
```

## 主なファイル
- `App.tsx` 画面全体
- `src/components/CircleSchedule.tsx` 円形タイムスケジュール
- `src/components/CalendarView.tsx` カレンダー
- `src/components/EventEditor.tsx` 予定入力シート
- `src/components/BriefingOverlay.tsx` 読み上げ画面
- `src/briefing.ts` 読み上げ原稿の生成と再生（AI 生成に差し替える場所）
