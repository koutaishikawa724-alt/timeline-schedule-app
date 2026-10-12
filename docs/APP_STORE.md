# App Store に出すまで

アプリ側の準備（プライバシーポリシー、お問い合わせ、データ削除、提出用の設定）は済んでいます。
ここから先は Apple への登録と申請で、**iPhone だけで進められる**ように手順をまとめました。

---

## ストアに載せる内容（そのままコピーして使えます）

| 項目 | 内容 |
| --- | --- |
| App名（30文字まで） | Timeline - 円の予定と日記 |
| サブタイトル（30文字まで） | 時計で見る今日の予定と毎日の日記 |
| カテゴリ | 仕事効率化（2つ目：ライフスタイル） |
| 価格 | 無料 |
| 年齢制限 | 4+（質問はすべて「なし」） |
| プライバシーポリシーURL | https://github.com/koutaishikawa724-alt/timeline-schedule-app/blob/main/PRIVACY.md |
| サポートURL | https://github.com/koutaishikawa724-alt/timeline-schedule-app/issues |
| Appのプライバシー | 「データを収集しない」 |
| 著作権 | 2026 （あなたの名前） |

「Timeline」だけの名前はすでに使われている可能性が高いので、上のように説明をつけた名前にしています。使われていたら「Timeline - まるい予定と日記」などに変えてください。ホーム画面のアイコンの下には「Timeline」と出ます。

**キーワード（100文字まで）**

```
スケジュール,予定,日記,カレンダー,時計,タイムライン,手帳,ダイアリー,記録,今日,明日,写真日記
```

**プロモーションテキスト**

```
今日と明日の予定を、時計の形でひと目で。気分と写真で残せる日記つき。
```

**説明文**

```
Timeline は、今日と明日の予定を「時計の形」で見られるスケジュールアプリです。

■ 時計で見るスケジュール
予定が文字盤の上に色の帯で並びます。12時が上の、ふつうの時計と同じ並び。午前と午後を切り替えて、いまどの予定の時間かが針でわかります。

■ かんたんな予定入力
時間・長さ・色をタップで選ぶだけ。タイムラインの × で消せて、間違えても「元に戻す」で戻せます。

■ カレンダー
予定のある日に色の点がつきます。日付をタップすると、その日の予定を確認・追加できます。

■ 日記
5つの表情から気分を選び、その日のことを書けます。写真も1日6枚まで貼れます。書いたそばから自動で保存されます。

■ プライバシー
アカウント登録は不要です。予定・日記・写真はあなたのiPhoneの中だけに保存され、外部に送られることはありません。
```

**スクリーンショット**（6.9インチ用 1320×2868）は `docs/store-screenshots/` に4枚あります。

---

## 申請の手順

### 1. Apple Developer Program に登録する
1. App Store で「Apple Developer」アプリを入れて開く
2. 「アカウント」→ Apple ID でサインイン →「今すぐ登録」
3. 個人として登録し、年会費を支払う（金額は登録画面に出ます）

承認まで1〜2日かかることがあります。

### 2. アプリのIDを登録する（Safari で）
1. developer.apple.com/account →「Certificates, IDs & Profiles」→「Identifiers」→「＋」
2. 「App IDs」→「App」を選ぶ
3. Description に `Timeline`、Bundle ID は「Explicit」で `com.kouta.timeline` と入れて登録

同じページの「Membership details」にある **Team ID**（英数字10文字）をメモします。

### 3. App Store Connect でアプリを作る（Safari で）
1. appstoreconnect.apple.com →「アプリ」→「＋」→「新規App」
2. プラットフォーム iOS、名前は上の「App名」、言語は日本語、バンドルIDは `com.kouta.timeline`、SKU は `timeline001`
3. できたら「App情報」を開き、**Apple ID**（数字10桁ほど）をメモします

### 4. App Store Connect の API キーを作る
1. App Store Connect →「ユーザとアクセス」→「統合」→「App Store Connect API」
2. 「チームキー」で「＋」→ 名前 `EAS`、アクセスは「App Manager」
3. **Issuer ID** と **キーID** をメモし、「APIキーをダウンロード」（.p8 ファイル。1回しかダウンロードできません）
4. ファイルアプリでその .p8 を開き、`-----BEGIN PRIVATE KEY-----` から `-----END PRIVATE KEY-----` までを全部コピーします

### 5. Expo のトークンを作る
1. expo.dev で無料アカウントを作る（GitHub でログインできます）
2. 右上のアイコン →「Account settings」→「Access tokens」→「Create token」
3. 出てきたトークンをコピー（1回しか表示されません）

### 6. GitHub に秘密の値を入れる
GitHub の `timeline-schedule-app` →「Settings」→「Secrets and variables」→「Actions」→「New repository secret」で、次の5つを登録します。

| 名前 | 入れるもの |
| --- | --- |
| `EXPO_TOKEN` | 5 のトークン |
| `ASC_API_KEY_P8` | 4 でコピーした .p8 の中身 |
| `ASC_KEY_ID` | 4 のキーID |
| `ASC_ISSUER_ID` | 4 の Issuer ID |
| `APPLE_TEAM_ID` | 2 の Team ID |

これらの値は、このチャットには貼らないでください。

### 7. アプリを作って送る
1. GitHub の「Actions」タブ →「iOS App Store」→「Run workflow」
2. `asc_app_id` に 3 の Apple ID を入れて実行
3. 30分ほどで App Store Connect の「TestFlight」にビルドが届きます

### 8. 審査に出す
1. App Store Connect でアプリを開き、上の「ストアに載せる内容」を入力
2. スクリーンショット4枚をアップロード
3. 「Appのプライバシー」で「データを収集しない」を選ぶ
4. 「ビルド」で 7 で届いたものを選び、「審査用に追加」→「審査へ提出」

審査は通常1〜3日です。途中でエラーが出たら、その画面の文をそのまま教えてください。
