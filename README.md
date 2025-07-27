# Notion Webhook to Google Sheets Integration

🔗 Automatically sync Notion database changes to Google Sheets using Webhook and Google Apps Script.

[日本語版はこちら](#日本語)

## ✨ Features

- 🔄 **Dynamic property detection** - Automatically adapts to Notion property changes
- 📊 **Automatic header generation** - Updates spreadsheet headers dynamically
- 🚀 **Easy setup with GUI menu** - User-friendly interface in Google Sheets
- 🧪 **Built-in testing functions** - Test with sample data before going live
- 📝 **Supports all Notion property types** - Title, select, date, formula, and more
- 🔍 **Detailed logging** - Easy debugging with comprehensive logs

## 📋 Requirements

- Google account
- Notion account (Paid plan with automation feature)
- Google Sheets

## 🚀 Quick Start

### 1. Setup Google Apps Script

1. Open [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Copy the content from `src/コード.js` and paste it
4. Save the project (Ctrl+S)

### 2. Initial Configuration

1. Open your Google Sheets
2. Reload the page (F5)
3. You'll see "🔧 Notion連携設定" menu
4. Click "📝 初期設定" to start setup

### 3. Deploy as Web App

1. In GAS editor: Deploy → New deployment
2. Type: Web app
3. Execute as: Me
4. Who has access: Anyone
5. Deploy and copy the URL (ending with `/exec`)

### 4. Configure Notion Automation

1. Open your Notion database
2. Click ⚡ icon → New automation
3. Trigger: When property "Status" is set to "Complete"
4. Action: Send webhook
5. URL: Your GAS deployment URL
6. Header (optional due to Notion bug):
   - Key: `ContentType` (no hyphen!)
   - Value: `application/json`

## 🎮 Usage

### Menu Functions

- **📝 初期設定** - Configure spreadsheet ID and sheet name
- **✅ 設定確認** - Check current settings
- **🧪 基本テスト実行** - Test with sample data
- **🔄 動的プロパティテスト** - Test dynamic property detection
- **🔗 Webhook URLを表示** - Display deployment URL

### Supported Notion Property Types

| Property Type | Description | Example |
|---|---|---|
| title | Page title | Task name |
| rich_text | Formatted text | Description |
| select | Single select | Priority |
| multi_select | Multiple select | Tags |
| status | Status property | Complete/In Progress |
| people | Person property | Assignee |
| date | Date property | Due date |
| number | Number property | Progress % |
| checkbox | Checkbox | Is urgent |
| url | URL property | Link |
| email | Email property | Contact |
| phone_number | Phone property | Phone |
| formula | Formula result | Calculated value |

## ⚠️ Important Notes

### Content-Type Header Issue

Due to a Notion bug (as of July 2025), using the correct header `Content-Type` prevents activation.

**Workarounds:**
- Use `ContentType` (without hyphen)
- Or don't set any header

### Webhook URL

- Must end with `/exec` (not `/dev`)
- Use the production URL from deployment

## 🐛 Troubleshooting

### Data not recording?

1. Check GAS execution logs
2. Verify spreadsheet ID in settings
3. Confirm Notion webhook is enabled
4. Check if all properties are selected in Notion

### "Enable" button not working?

- Check Content-Type spelling
- Ensure data properties are selected

## 🛠️ Advanced Features

### Dynamic Property Handling

The script automatically handles:
- New properties added to Notion
- Properties removed from Notion
- Property name changes
- Property type changes

### Custom Property Mapping

You can map Notion property names to custom column headers:

```javascript
// Example mapping
{
  "Task Name": "タスク名",
  "Assignee": "担当者",
  "Priority": "優先度"
}
```

## 📚 Documentation

- [Notion API Documentation](https://developers.notion.com/)
- [Google Apps Script Reference](https://developers.google.com/apps-script)
- [Detailed Setup Guide (Japanese)](note_article.md)

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<a id="日本語"></a>

# Notion Webhook → Google Sheets 連携

📊 Notionのデータベース更新をGoogleスプレッドシートに自動記録するGoogle Apps Script（GAS）スクリプトです。

## 🌟 こんな時に便利です

### 📈 タスク管理の可視化
- **Notionでタスクを完了** → **自動的にスプレッドシートに記録**
- 完了タスクの統計分析（担当者別、期間別、優先度別など）
- チームの生産性をグラフ化して共有

### 📊 レポート作成の自動化
- **日次・週次・月次のタスク完了レポート**を自動生成
- Googleスプレッドシートの関数でKPIを自動計算
- 経営陣向けのダッシュボード作成

### 🔄 他システムとの連携
- スプレッドシートを経由して**会計システムに工数データを連携**
- **Slack通知**と組み合わせてタスク完了を即座に共有
- Power BIやTableauなどのBIツールでデータ分析

### 👥 チーム管理
- メンバーごとのタスク完了数を可視化
- 期限超過タスクの自動検出とアラート
- プロジェクト別の進捗管理

## 💡 具体的な活用例

**例1: フリーランスの案件管理**
```
Notion: 案件ステータスを「完了」に変更
↓
自動記録: 案件名、金額、工数、完了日
↓
スプレッドシート: 月別売上集計、請求書作成
```

**例2: 開発チームのスプリント管理**
```
Notion: タスクを「Done」に移動
↓
自動記録: タスク名、担当者、ストーリーポイント、完了時刻
↓
スプレッドシート: ベロシティ計算、バーンダウンチャート生成
```

**例3: カスタマーサポートの対応記録**
```
Notion: チケットを「解決済み」に変更
↓
自動記録: 問い合わせ内容、対応者、対応時間、カテゴリ
↓
スプレッドシート: 対応時間分析、FAQ作成の参考データ
```

## 🎯 主な機能

✅ **動的プロパティ検出**
- Notionのプロパティ変更に自動対応
- プロパティの増減・型変更に対応
- カスタムフィールドも自動で列追加

✅ **自動ヘッダー生成**
- スプレッドシートのヘッダーを動的に更新
- 新しいプロパティを自動的に列として追加
- 既存データを保持したまま構造変更に対応

✅ **直感的なメニューインターフェース**
- スプレッドシート上にメニューを追加
- 初期設定から動作確認まで簡単操作
- 技術知識不要で誰でも使える

✅ **包括的なテスト機能**
- 基本テストと動的プロパティテスト
- 本番前の動作確認が可能
- サンプルデータで安全に検証

✅ **詳細なロギング**
- 受信データの記録
- エラーの追跡が容易
- トラブルシューティングを簡単に

## 📋 必要なもの

- Googleアカウント
- Notionアカウント（オートメーション機能が使える有料プラン）
- Googleスプレッドシート

## 🚀 セットアップ手順

### 1. GASプロジェクトの準備

1. [Google Apps Script](https://script.google.com/)を開く
2. 新しいプロジェクトを作成
3. `src/コード.js`の内容をコピーして貼り付け

### 2. 初期設定

1. コードを保存（Ctrl+S）
2. スプレッドシートを開いてリロード（F5）
3. メニューに「🔧 Notion連携設定」が表示される
4. 「📝 初期設定」から設定を開始

### 3. Webアプリとしてデプロイ

1. GASエディタで「デプロイ」→「新しいデプロイ」
2. 種類：ウェブアプリ
3. 実行ユーザー：自分
4. アクセス：全員
5. デプロイして表示されるURLをコピー

### 4. Notion側の設定

1. データベースで「⚡オートメーション」を作成
2. トリガー：ステータスが「完了」に変更
3. アクション：Webhookを送信
4. URL：GASのデプロイURL
5. ヘッダー（オプション）：
   - キー：`ContentType`（ハイフンなし）
   - 値：`application/json`

## 🎮 使い方

### メニュー機能

- **📝 初期設定** - スプレッドシートIDとシート名を設定
- **✅ 設定確認** - 現在の設定を確認
- **🧪 基本テスト実行** - サンプルデータで動作確認
- **🔄 動的プロパティテスト** - 様々なプロパティ構成でテスト
- **🔗 Webhook URLを表示** - デプロイURLを確認

### 対応しているNotionプロパティタイプ

- ✅ タイトル（title）
- ✅ リッチテキスト（rich_text）
- ✅ セレクト（select）
- ✅ マルチセレクト（multi_select）
- ✅ ステータス（status）
- ✅ 人物（people）
- ✅ 日付（date）
- ✅ 数値（number）
- ✅ チェックボックス（checkbox）
- ✅ URL
- ✅ メール（email）
- ✅ 電話番号（phone_number）
- ✅ 数式（formula）

## ⚠️ 注意事項

### Content-Typeヘッダーについて

Notionのバグにより、正しいヘッダー名 `Content-Type` を使用すると有効化できない問題があります。

**回避方法：**
- `ContentType`（ハイフンなし）を使用
- またはヘッダーを設定しない

### Webhook URLについて

- URLは必ず `/exec` で終わる形式を使用
- `/dev` で終わるURLは開発用で本番では使用不可

## 🐛 トラブルシューティング

### データが記録されない場合

1. GASエディタで「実行数」を確認
2. エラーログをチェック
3. スプレッドシートIDが正しいか確認
4. Notion側でWebhookが有効になっているか確認

### 「有効化」ボタンが押せない

- Content-Typeヘッダーのスペルを確認
- データが選択されているか確認

## 🚀 さらなる活用アイデア

### 📧 メール通知の追加
```javascript
// タスク完了時に管理者にメール通知
function sendNotification(taskData) {
  MailApp.sendEmail({
    to: "manager@example.com",
    subject: `タスク完了: ${taskData.taskName}`,
    body: `担当者: ${taskData.assignee}\n完了日時: ${new Date()}`
  });
}
```

### 📊 月次レポートの自動生成
```javascript
// 月末に自動でレポートシートを作成
function createMonthlyReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName("Notion_タスク記録");
  const reportSheet = ss.insertSheet(`${new Date().getMonth() + 1}月レポート`);
  
  // ピボットテーブルやグラフを自動生成
  // ...
}
```

### 🔗 Slack連携
```javascript
// Slackに完了通知を送信
function postToSlack(taskData) {
  const webhookUrl = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK');
  UrlFetchApp.fetch(webhookUrl, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      text: `✅ タスク完了: ${taskData.taskName} (担当: ${taskData.assignee})`
    })
  });
}
```

## 🎓 学習リソース

### Notion × GAS 連携を深く理解する
- [Notion公式: データベースオートメーション](https://www.notion.so/ja/help/database-automations)
- [GAS公式: Webhookの処理](https://developers.google.com/apps-script/guides/web)
- [実践的なGAS開発パターン](https://github.com/tanaikech/taking-advantage-of-google-apps-script)

### コミュニティ
- [Notion日本語コミュニティ](https://www.facebook.com/groups/notion.jp)
- [GAS活用コミュニティ](https://groups.google.com/g/google-apps-script-community)

## 📝 詳細なセットアップガイド

より詳しい説明は[note記事](note_article.md)を参照してください。

## 📚 参考資料

- [Notion API Documentation](https://developers.notion.com/)
- [Google Apps Script Reference](https://developers.google.com/apps-script)

## 📄 ライセンス

MIT License

## 🤝 貢献

プルリクエストを歓迎します！お気軽にご提案ください。

---

💡 **ヒント**: 初回設定で不明な点があれば、各メニューの「設定確認」や「テスト実行」を活用してください！

*Last updated: 2025/07/27*