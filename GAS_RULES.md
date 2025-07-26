# Google Apps Script 開発ルール

## 概要
Google Apps Script（GAS）を安全かつ効率的に開発するための7つの必須ルールです。
作成者：keitaro_aigc（Notion公式アンバサダー｜satto公式エバンジェリスト）

---

## 7つの鉄則

### 第1条：APIキーやシークレットトークンはスクリプトプロパティに保存し、コードへ直書きしない

**理由**
- APIキーの漏洩による高額請求リスクを防ぐ
- 機密情報の流出を防ぐ
- コード共有時の安全性を確保

**実装方法**
```javascript
// ✅ 正しい実装
function getApiKey() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('OPENAI_API_KEY');
  
  if (!apiKey) {
    throw new Error('APIキーが設定されていません。設定メニューから登録してください。');
  }
  
  return apiKey;
}

// ❌ 絶対にやってはいけない
const API_KEY = "sk-abc123xyz..."; // 直書き禁止！
```

---

### 第2条：onOpen関数で独自メニューを追加し、利用者はメニューバーから操作できるようにする

**理由**
- 非エンジニアでも簡単に使える
- スクリプトエディタを開く必要がない
- 直感的な操作が可能

**実装方法**
```javascript
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  const menu = ui.createMenu('📊 自動化ツール');
  
  menu.addItem('📥 データを取り込む', 'importData')
      .addItem('📊 レポートを作成', 'createReport')
      .addItem('📧 メールで送信', 'sendEmail')
      .addSeparator()
      .addSubMenu(
        ui.createMenu('⚙️ 管理メニュー')
          .addItem('🔐 API設定', 'showSettingsDialog')
          .addItem('⏰ 定期実行の設定', 'manageTriggers')
      );
  
  menu.addToUi();
}
```

---

### 第3条：メニューから開く設定ダイアログでスクリプトプロパティを入力・更新できる仕組みを用意する

**理由**
- APIキーの設定をGUIで簡単に
- 技術的知識不要で設定変更可能
- ミスを防ぐバリデーション機能

**実装方法**
```javascript
function showSettingsDialog() {
  const html = HtmlService.createTemplateFromFile('settings')
    .evaluate()
    .setWidth(500)
    .setHeight(600);
    
  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ 設定');
}
```

---

### 第4条：実行トリガーをメニュー経由で作成・削除できる管理関数を用意する

**理由**
- トリガーの重複を防ぐ
- 定期実行の管理を簡単に
- エラー通知の自動化

**実装方法**
```javascript
function createTrigger(functionName, schedule, hour) {
  // 既存の同じ関数のトリガーを削除
  deleteTriggerByFunction(functionName);
  
  const builder = ScriptApp.newTrigger(functionName);
  
  switch (schedule) {
    case 'hourly':
      builder.timeBased().everyHours(1).create();
      break;
    case 'daily':
      builder.timeBased().atHour(parseInt(hour)).everyDays(1).create();
      break;
  }
}
```

---

### 第5条：V8ランタイムを必ず有効にし、Execution logのタイムラインでデバッグ効率を高める

**理由**
- 最新JavaScript機能が使える
- 実行速度が大幅に向上
- デバッグが格段に楽になる

**実装方法**
```javascript
// モダンJavaScriptの活用
const processData = (rows) => {
  console.time('データ処理');
  
  const result = rows
    .filter(row => row.value > 100)
    .map(({ name, value }) => ({ name, value: value * 2 }));
  
  console.timeEnd('データ処理');
  return result;
};
```

---

### 第6条：claspとGitでスクリプトをバージョン管理し、ローカル編集と履歴管理を徹底する

**理由**
- 変更履歴がすべて残る
- いつでも前のバージョンに戻せる
- チーム開発が可能になる

**実装方法**
```bash
# clasp設定
npm install -g @google/clasp
clasp login
clasp clone [SCRIPT_ID]

# Git管理
git init
git add .
git commit -m "初期コミット"
```

---

### 第7条：思考を途切れさせないために音声入力やAI補完を活用し、快適にコードを書く環境を整える

**理由**
- アイデアをすぐに形にできる
- エラー解決が素早い
- 開発効率が大幅に向上

**推奨ツール**
- GitHub Copilot
- ChatGPT/Claude
- 音声入力（Googleドキュメント）

---

## 統合プロンプトテンプレート

以下のプロンプトをAIに渡すことで、7つの鉄則すべてを満たしたコードを生成できます：

```
あなたはGoogle Apps Script開発アシスタントです。以下の鉄則を厳守しながら、非エンジニアが扱いやすいコードと手順を生成してください。

【必須遵守事項】
1. API・シークレットはScript Propertiesへ保存
2. onOpenで独自メニューを実装
3. 設定ダイアログからScript Propertiesを編集可能に
4. トリガー作成・削除をメニュー経由で
5. V8ランタイムを前提に
6. claspとGitでバージョン管理
7. 音声入力・AI補完を活用

【コード生成時の注意点】
- エラーハンドリングを必ず実装
- 処理進捗のログ出力
- 非エンジニアにもわかりやすいコメント
```

---

## クイックリファレンス

### よく使うコード片

**APIキー取得**
```javascript
const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
```

**ログ出力**
```javascript
console.log('処理開始:', new Date());
console.time('処理名');
// 処理
console.timeEnd('処理名');
```

**エラーハンドリング**
```javascript
try {
  // 処理
} catch (error) {
  console.error('エラー:', error);
  throw error;
}
```

---

## タグ
#GoogleAppsScript #GAS #業務効率化 #自動化 #プログラミング初心者 #非エンジニア #ChatGPT #Claude #AI活用 #V8ランタイム #clasp #Git #バージョン管理