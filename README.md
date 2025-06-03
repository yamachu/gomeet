# Go Meet

SlackからGoogle MeetのURLを即時取得できるSlackアプリケーションです。

---

## 概要

- SlackのショートカットからGoogle Meetを作成し、URLを返します
- 各ユーザーのGoogleアカウント権限でMeetを作成します
- Google認証はSlack上のフォーム入力のみで完結します

## セットアップ手順

1. **Google Cloud ConsoleでOAuthクライアント作成**
    - リダイレクトURIを登録
    - スコープに `https://www.googleapis.com/auth/calendar.events` などを追加
2. **環境変数の設定**
    - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SALT`
3. **Slack CLIでショートカットトリガーを作成**
    - `slack trigger create --trigger-def triggers/gomeet-code_trigger.ts ` など

---

## 使い方

1. Slackのショートカットから「Go Meet」を起動
2. 初回はGoogle認証URLが案内されるので、認証を行う
3. 認証後、リダイレクト先で表示された認可コードを「Go Meet Code」フォームに入力
4. 2回目以降は即座にGoogle MeetのURLが返ってきます

---

## セキュリティ・運用上の注意

- 認可コードは**必ず自分だけのフォームで入力**してください（他人に見せない）

---

## LICENSE

MIT
