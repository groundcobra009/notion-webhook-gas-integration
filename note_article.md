# NotionのオートメーションとGoogleスプレッドシートを連携する完全ガイド【2025年版】

## はじめに

Notionでタスクのステータスが「完了」になったら、自動的にGoogleスプレッドシートに記録する仕組みを作ります。この記事では、実際に試行錯誤した経験を基に、**つまずきポイントと具体的な解決方法**を詳しく解説します。

**🎯 この記事で解決できること：**
- Notionの自動化でハマりがちな「Content-Type問題」
- プロパティが動的に変わる場合の対応方法
- デバッグ時に使える具体的なプロンプト例

## 完成イメージ

Notionでタスクを完了にすると、以下のようにスプレッドシートに自動記録されます：

| 記録日時 | タスク名 | 担当者 | 優先度 | ステータス | 期日 | 説明 |
|---------|---------|--------|--------|-----------|------|------|
| 2025/07/27 20:54:47 | Webサイトのコピーを改善 | keitaro.N | 高 | 完了 | 2025/07/29 | 最新の製品情報を... |

**✨ 追加機能（この記事で実装）：**
- プロパティが増減しても自動対応
- カスタムプロパティ名への対応
- 詳細なエラーログとデバッグ機能

## 必要なもの

- Notionの有料プラン（オートメーション機能を使用）
- Googleアカウント
- 基本的なプログラミング知識（コピペでもOK）

## 手順

### 1. Google Apps Script（GAS）の準備

#### 1-1. 新規プロジェクトの作成

1. [Google Apps Script](https://script.google.com/)にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「Notion連携」などに変更

#### 1-2. コードの貼り付け

**🔧 具体的なプロンプト例：**
```
Claude Codeに以下のように依頼してコードを生成してもらいました：

"Google Apps ScriptでNotionのWebhookを受信してGoogleスプレッドシートに記録するスクリプトを作成してください。プロパティが動的に変わっても対応できるようにしてください。"
```

以下のコードをすべてコピーして、GASエディタの`コード.gs`に貼り付けます：

```javascript
// ===== Notion Webhook → Google Sheets 連携スクリプト =====
// 作成日: 2025年7月
// 機能: NotionのオートメーションからWebhookを受信してGoogleスプレッドシートに記録

// ===== メニュー関連 =====

// スプレッドシートを開いたときにメニューを追加
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 Notion連携設定')
    .addItem('📝 初期設定', 'showSettingsDialog')
    .addItem('✅ 設定確認', 'checkCurrentSettings')
    .addSeparator()
    .addItem('🧪 基本テスト実行', 'testWebhookWithSampleData')
    .addItem('🔄 動的プロパティテスト', 'testDynamicPropertiesWithVariousData')
    .addSeparator()
    .addItem('🔗 Webhook URLを表示', 'showWebhookUrl')
    .addItem('📊 受信ログを確認', 'showRecentLogs')
    .addToUi();
}

// 現在のスプレッドシートIDを取得
function getCurrentSpreadsheetId() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet().getId();
  } catch (e) {
    return '';
  }
}

// 設定を保存
function saveSettings(spreadsheetId, sheetName) {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  try {
    // スプレッドシートの存在確認
    const ss = SpreadsheetApp.openById(spreadsheetId);
    console.log('スプレッドシート確認OK:', ss.getName());
    
    // 設定をプロパティに保存
    scriptProperties.setProperties({
      'SPREADSHEET_ID': spreadsheetId,
      'SHEET_NAME': sheetName
    });
    
    // シートの準備
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      setupSheetHeaders(sheet);
      console.log('新規シート作成:', sheetName);
    }
    
    return '✅ 設定を保存しました！シート「' + sheetName + '」の準備が完了しました。';
    
  } catch (error) {
    console.error('設定保存エラー:', error);
    throw new Error('スプレッドシートIDが無効です。正しいIDを入力してください。');
  }
}

// 設定を取得
function getSettings() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return {
    spreadsheetId: scriptProperties.getProperty('SPREADSHEET_ID') || '',
    sheetName: scriptProperties.getProperty('SHEET_NAME') || 'Notion_タスク記録'
  };
}

// 動的にプロパティからデータを構築
function buildDynamicData(properties) {
  const headers = [];
  const values = [];
  const types = {};
  
  // プロパティマッピング設定を取得
  const mappingSettings = getPropertyMappingSettings();
  
  // プロパティを処理
  Object.keys(properties).forEach(propertyName => {
    const property = properties[propertyName];
    const value = getNotionPropertyValue(property);
    
    // 表示名を決定（設定があれば使用、なければプロパティ名をそのまま使用）
    const displayName = mappingSettings[propertyName] || propertyName;
    
    headers.push(displayName);
    values.push(value);
    types[displayName] = property.type;
    
    console.log(`プロパティ処理: ${propertyName} (${property.type}) -> ${displayName} = ${value}`);
  });
  
  return {
    headers: headers,
    values: values,
    types: types
  };
}

// シートのヘッダーを動的に更新
function updateSheetHeaders(sheet, dynamicHeaders) {
  const fullHeaders = ['記録日時', ...dynamicHeaders];
  
  // 既存のヘッダーを取得
  const lastCol = sheet.getLastColumn();
  let existingHeaders = [];
  if (lastCol > 0) {
    const existingRange = sheet.getRange(1, 1, 1, lastCol);
    existingHeaders = existingRange.getValues()[0];
  }
  
  // ヘッダーが変更されている場合のみ更新
  const headersChanged = !arraysEqual(existingHeaders, fullHeaders);
  
  if (headersChanged || existingHeaders.length === 0) {
    console.log('ヘッダーを更新します:', fullHeaders);
    
    // ヘッダー行をクリア
    if (sheet.getLastColumn() > 0) {
      sheet.getRange(1, 1, 1, sheet.getLastColumn()).clearContent();
    }
    
    // 新しいヘッダーを設定
    sheet.getRange(1, 1, 1, fullHeaders.length).setValues([fullHeaders]);
    
    // ヘッダーの書式設定
    const headerRange = sheet.getRange(1, 1, 1, fullHeaders.length);
    headerRange.setBackground('#1a73e8');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    
    // 動的な列幅設定
    setDynamicColumnWidths(sheet, fullHeaders);
    
    // シートの保護（ヘッダー行）
    try {
      const protection = headerRange.protect().setDescription('ヘッダー行の保護');
      protection.setWarningOnly(true);
    } catch (e) {
      console.log('ヘッダー保護の設定をスキップしました:', e.message);
    }
  } else {
    console.log('ヘッダーに変更がないため、更新をスキップします');
  }
}

// 配列の比較
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// 動的な列幅設定
function setDynamicColumnWidths(sheet, headers) {
  headers.forEach((header, index) => {
    const colIndex = index + 1;
    
    // ヘッダー名に基づいて列幅を設定
    if (header === '記録日時') {
      sheet.setColumnWidth(colIndex, 150);
    } else if (header.includes('名') || header.includes('タイトル') || header.includes('説明')) {
      sheet.setColumnWidth(colIndex, 250);
    } else if (header.includes('日') || header.includes('期限')) {
      sheet.setColumnWidth(colIndex, 120);
    } else if (header.includes('URL') || header.includes('リンク')) {
      sheet.setColumnWidth(colIndex, 200);
    } else {
      sheet.setColumnWidth(colIndex, 120);
    }
  });
}

// プロパティマッピング設定を取得
function getPropertyMappingSettings() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const mappingJson = scriptProperties.getProperty('PROPERTY_MAPPING');
    return mappingJson ? JSON.parse(mappingJson) : {};
  } catch (e) {
    console.log('プロパティマッピング設定の取得に失敗:', e.message);
    return {};
  }
}

// レガシー関数の互換性維持
function setupSheetHeaders(sheet) {
  const legacyHeaders = [
    'タスク名',
    '担当者',
    '優先度',
    'ステータス',
    '期日',
    '期限超過',
    '工数レベル',
    '説明'
  ];
  
  updateSheetHeaders(sheet, legacyHeaders);
}

// POSTリクエストを処理（Notionからの受信）
function doPost(e) {
  const startTime = new Date();
  
  try {
    console.log('========== Webhook受信開始 ==========');
    console.log('受信時刻:', startTime.toLocaleString('ja-JP'));
    console.log('e:', e);
    console.log('e.postData:', e.postData);
    console.log('e.postData.contents の長さ:', e.postData?.contents?.length || 0);
    
    // 設定を取得
    const settings = getSettings();
    if (!settings.spreadsheetId) {
      throw new Error('スプレッドシートIDが設定されていません。初期設定を行ってください。');
    }
    
    // リクエストデータの解析
    let requestData = {};
    
    // JSONとして解析を試みる
    if (e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
        console.log('JSONデータとして解析成功');
        console.log('データ構造:', Object.keys(requestData));
        if (requestData.data) {
          console.log('data プロパティあり:', Object.keys(requestData.data));
          if (requestData.data.properties) {
            console.log('properties プロパティあり:', Object.keys(requestData.data.properties));
          }
        }
      } catch (jsonError) {
        console.log('JSON解析失敗:', jsonError);
        requestData = {
          error: 'JSON解析エラー',
          rawData: e.postData.contents
        };
      }
    } else {
      console.log('postDataまたはcontentsが存在しません');
    }
    
    // スプレッドシートに記録
    const result = recordToSpreadsheet(requestData, settings);
    
    // 処理時間を計算
    const endTime = new Date();
    const processingTime = endTime - startTime;
    
    console.log('処理完了。処理時間:', processingTime + 'ms');
    console.log('========== Webhook受信終了 ==========');
    
    // 成功レスポンスを返す
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'データを記録しました',
        recordId: result.row,
        processingTime: processingTime + 'ms',
        timestamp: endTime.toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('❌ エラー発生:', error);
    console.error('スタックトレース:', error.stack);
    
    // エラーレスポンスを返す
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// スプレッドシートに記録
function recordToSpreadsheet(data, settings) {
  console.log('--- recordToSpreadsheet開始 ---');
  console.log('受信データ:', JSON.stringify(data));
  
  // スプレッドシートとシートを取得
  const spreadsheet = SpreadsheetApp.openById(settings.spreadsheetId);
  let sheet = spreadsheet.getSheetByName(settings.sheetName);
  
  // Notionのデータ構造を解析
  let properties = {};
  
  // data.data.properties の構造を確認
  if (data.data && data.data.properties) {
    properties = data.data.properties;
    console.log('Notionの標準形式を検出');
    console.log('プロパティ一覧:', Object.keys(properties));
  } else if (data.properties) {
    properties = data.properties;
    console.log('プロパティを直接検出');
  } else {
    console.log('プロパティが見つかりません。データ構造:', JSON.stringify(data));
    properties = {};
  }
  
  // 動的にヘッダーとデータを構築
  const dynamicData = buildDynamicData(properties);
  console.log('動的データ構築結果:', dynamicData);
  
  // シートが存在しない場合は作成、または既存シートのヘッダーを更新
  if (!sheet) {
    console.log('シートが存在しないため作成:', settings.sheetName);
    sheet = spreadsheet.insertSheet(settings.sheetName);
  }
  
  // ヘッダーの更新または作成
  updateSheetHeaders(sheet, dynamicData.headers);
  
  // 記録日時を先頭に追加
  const recordDate = new Date();
  const rowData = [recordDate, ...dynamicData.values];
  
  console.log('記録する行データ:', rowData);
  
  // データを追加
  const lastRow = sheet.getLastRow() + 1;
  sheet.getRange(lastRow, 1, 1, rowData.length).setValues([rowData]);
  
  // 新しい行に書式を適用
  const newRowRange = sheet.getRange(lastRow, 1, 1, rowData.length);
  newRowRange.setBorder(true, true, true, true, true, true);
  
  // 日付列のフォーマット
  sheet.getRange(lastRow, 1).setNumberFormat('yyyy/mm/dd hh:mm:ss');
  
  // 日付プロパティの列にもフォーマットを適用
  dynamicData.headers.forEach((header, index) => {
    if (dynamicData.types[header] === 'date' && dynamicData.values[index]) {
      sheet.getRange(lastRow, index + 2).setNumberFormat('yyyy/mm/dd');
    }
  });
  
  console.log('記録完了 - 行番号:', lastRow);
  console.log('--- recordToSpreadsheet終了 ---');
  
  return {
    success: true,
    row: lastRow,
    spreadsheet: spreadsheet.getName(),
    sheet: sheet.getName(),
    headers: ['記録日時', ...dynamicData.headers],
    detectedProperties: Object.keys(properties)
  };
}

// Notionのプロパティ値を取得するヘルパー関数
function getNotionPropertyValue(property) {
  if (!property) return '';
  
  // プロパティタイプに応じて値を取得
  switch (property.type) {
    case 'title':
      return property.title?.[0]?.plain_text || '';
      
    case 'rich_text':
      return property.rich_text?.[0]?.plain_text || '';
      
    case 'select':
      return property.select?.name || '';
      
    case 'multi_select':
      return property.multi_select?.map(item => item.name).join(', ') || '';
      
    case 'status':
      return property.status?.name || '';
      
    case 'people':
      return property.people?.map(person => person.name).join(', ') || '';
      
    case 'date':
      return property.date?.start || '';
      
    case 'number':
      return property.number || '';
      
    case 'checkbox':
      return property.checkbox ? '✓' : '';
      
    case 'url':
      return property.url || '';
      
    case 'email':
      return property.email || '';
      
    case 'phone_number':
      return property.phone_number || '';
      
    case 'formula':
      // 数式の結果に応じて処理
      if (property.formula?.type === 'string') {
        return property.formula.string || '';
      } else if (property.formula?.type === 'number') {
        return property.formula.number || '';
      } else if (property.formula?.type === 'boolean') {
        return property.formula.boolean ? '✓' : '';
      }
      return '';
      
    default:
      // その他のタイプは文字列として返す
      return JSON.stringify(property);
  }
}

// Webhook URLを取得
function getWebhookUrl() {
  try {
    const url = ScriptApp.getService().getUrl();
    return url || 'デプロイが必要です';
  } catch (e) {
    return 'デプロイが必要です';
  }
}

// テスト実行
function testWebhookWithSampleData() {
  const ui = SpreadsheetApp.getUi();
  const settings = getSettings();
  
  if (!settings.spreadsheetId) {
    ui.alert(
      '⚠️ 設定が必要です',
      '先に初期設定を行ってください。',
      ui.ButtonSet.OK
    );
    return;
  }
  
  // Notionから送信される可能性のあるデータ形式でテスト
  const testData = {
    'data': {
      'properties': {
        'タスク名': {
          'type': 'title',
          'title': [{
            'plain_text': '【テスト】タスク_' + new Date().toLocaleString('ja-JP')
          }]
        },
        '担当者': {
          'type': 'people',
          'people': [{
            'name': 'テストユーザー'
          }]
        },
        '優先度': {
          'type': 'select',
          'select': {
            'name': '高'
          }
        },
        'ステータス': {
          'type': 'status',
          'status': {
            'name': '完了'
          }
        },
        '期日': {
          'type': 'date',
          'date': {
            'start': new Date().toISOString().split('T')[0]
          }
        }
      }
    }
  };
  
  try {
    const result = recordToSpreadsheet(testData, settings);
    
    ui.alert(
      '✅ テスト成功',
      'テストデータを記録しました！\n\n' +
      '▫️ 行番号: ' + result.row + '\n' +
      '▫️ シート: ' + result.sheet + '\n' +
      '▫️ 検出プロパティ: ' + result.detectedProperties.join(', ') + '\n' +
      '▫️ ヘッダー: ' + result.headers.join(', ') + '\n\n' +
      'スプレッドシートを確認してください。',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert(
      '❌ エラー',
      'テストデータの記録に失敗しました。\n\n' + error.toString(),
      ui.ButtonSet.OK
    );
  }
}

// 動的プロパティ機能のテスト（異なるプロパティ構成で検証）
function testDynamicPropertiesWithVariousData() {
  const ui = SpreadsheetApp.getUi();
  const settings = getSettings();
  
  if (!settings.spreadsheetId) {
    ui.alert(
      '⚠️ 設定が必要です',
      '先に初期設定を行ってください。',
      ui.ButtonSet.OK
    );
    return;
  }
  
  // 様々なプロパティタイプでテスト
  const testCases = [
    {
      name: 'ケース1: 基本プロパティ',
      data: {
        'data': {
          'properties': {
            'プロジェクト名': {
              'type': 'title',
              'title': [{ 'plain_text': 'テストプロジェクト' }]
            },
            'URL': {
              'type': 'url',
              'url': 'https://example.com'
            },
            'チェック': {
              'type': 'checkbox',
              'checkbox': true
            },
            '数値': {
              'type': 'number',
              'number': 100
            }
          }
        }
      }
    },
    {
      name: 'ケース2: 追加プロパティ',
      data: {
        'data': {
          'properties': {
            'プロジェクト名': {
              'type': 'title',
              'title': [{ 'plain_text': 'テストプロジェクト2' }]
            },
            'メール': {
              'type': 'email',
              'email': 'test@example.com'
            },
            'カテゴリ': {
              'type': 'multi_select',
              'multi_select': [
                { 'name': 'カテゴリA' },
                { 'name': 'カテゴリB' }
              ]
            },
            '新しいフィールド': {
              'type': 'rich_text',
              'rich_text': [{ 'plain_text': '動的に追加されたフィールド' }]
            }
          }
        }
      }
    }
  ];
  
  let results = [];
  
  try {
    for (const testCase of testCases) {
      console.log(`実行中: ${testCase.name}`);
      const result = recordToSpreadsheet(testCase.data, settings);
      results.push({
        name: testCase.name,
        result: result
      });
    }
    
    let message = '✅ 動的プロパティテスト成功\n\n';
    results.forEach(r => {
      message += `${r.name}:\n`;
      message += `  行番号: ${r.result.row}\n`;
      message += `  ヘッダー数: ${r.result.headers.length}\n`;
      message += `  プロパティ: ${r.result.detectedProperties.join(', ')}\n\n`;
    });
    
    ui.alert('動的プロパティテスト結果', message, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert(
      '❌ エラー',
      '動的プロパティテストに失敗しました。\n\n' + error.toString(),
      ui.ButtonSet.OK
    );
  }
}
```

### 2. 初期設定

#### 2-1. スプレッドシートの準備

1. 記録用のGoogleスプレッドシートを新規作成または既存のものを開く
2. スプレッドシートのURLから以下の部分（ID）をコピー：
   ```
   https://docs.google.com/spreadsheets/d/【ここがID】/edit
   例：1X6L6h89_cw-Pm3CiExouTY4oV0usOBI96iNl73c8g3Y
   ```

#### 2-2. GASでの設定

1. GASのコードを保存（Ctrl+S または Cmd+S）
2. スプレッドシートをリロード（F5）
3. メニューに「🔧 Notion連携設定」が表示される
4. 「Notion連携設定」→「📝 初期設定」をクリック
5. スプレッドシートIDが自動入力されるので、「設定を保存」をクリック

**🚨 つまづきポイント：メニューが表示されない**
- **原因**: コードの貼り付けミスまたは保存忘れ
- **解決**: F12で開発者ツールを開き、エラーがないか確認。GAS側でも実行ログをチェック

### 3. Webアプリとしてデプロイ

#### 3-1. デプロイ手順

1. GASエディタで「デプロイ」→「新しいデプロイ」
2. 歯車アイコン→「ウェブアプリ」を選択
3. 以下の設定を行う：
   - **説明**: Notion Webhook受信
   - **実行ユーザー**: 自分
   - **アクセスできるユーザー**: 全員
4. 「デプロイ」をクリック
5. 表示されたURLをコピー（重要！）

⚠️ **注意**: URLは必ず `/exec` で終わる形式になります
```
正しい例：https://script.google.com/macros/s/AKfycby.../exec
間違い例：https://script.google.com/macros/s/AKfycby.../dev
```

**🚨 つまづきポイント：認証エラー**
- **原因**: 初回デプロイ時の認証が必要
- **解決**: 「認証を確認」をクリックし、自分のGoogleアカウントで認証

### 4. Notionでオートメーションを設定

#### 4-1. オートメーションの作成

1. Notionのデータベースを開く
2. 右上の「⚡」アイコンをクリック
3. 「新規オートメーション」を選択

#### 4-2. トリガーの設定

1. **トリガー**: 「プロパティの編集」を選択
2. **プロパティ**: 「ステータス」を選択
3. **条件**: 「Complete に設定」または「完了 に設定」

**🚨 つまづきポイント：トリガーが反応しない**
- **原因**: ステータスプロパティの名前や選択肢の設定ミス
- **解決**: 正確なプロパティ名と選択肢名を確認

#### 4-3. Webhookアクションの設定

1. **アクション**: 「Webhookを送信する」を選択
2. **URL**: GASでコピーしたURLを貼り付け

## 🚨 最重要：Content-Typeヘッダーの落とし穴

**これが最も詰まりやすいポイントです！**

### 問題：Content-Typeを正しく入力するとエラーになる

Notionのバグ（2025年7月時点）により、以下の現象が発生します：

- ❌ `Content-Type` と正しく入力 → エラーで「有効化」ボタンが押せない
- ⭕ `ContentType`（ハイフンなし）→ 正常に動作
- ⭕ ヘッダーなし → 正常に動作

### 解決方法

**🔧 具体的なプロンプト例（ChatGPTやClaudeに質問する場合）：**
```
NotionのWebhookで「Content-Type: application/json」を設定しようとすると「有効化」ボタンが押せなくなります。どのような回避方法がありますか？
```

以下のいずれかの方法で設定：

#### 方法1：ContentType（ハイフンなし）を使用
1. カスタムヘッダーを追加
2. キー：`ContentType`（ハイフンなし）
3. 値：`application/json`

#### 方法2：ヘッダーなしで進める（推奨）
1. カスタムヘッダーを追加しない
2. そのまま進める（GAS側で適切に処理されます）

### 4-4. 送信するデータの選択

「コンテンツ」セクションで、送信したいプロパティにチェック：
- ✅ **すべての既存のプロパティを選択する（推奨）**
- または個別に必要なプロパティを選択

**🚨 つまづきポイント：データが送信されない**
- **原因**: プロパティの選択漏れ
- **解決**: 「すべての既存のプロパティを選択する」にチェック

### 4-5. 有効化

「有効化」ボタンをクリックして保存

## 5. 動作確認とデバッグ

### 5-1. 基本的なテスト

1. スプレッドシートのメニューから「Notion連携設定」→「🧪 基本テスト実行」
2. テストデータがスプレッドシートに記録されることを確認

### 5-2. 動的プロパティのテスト

1. 「Notion連携設定」→「🔄 動的プロパティテスト」を実行
2. 異なるプロパティ構成でヘッダーが自動更新されることを確認

### 5-3. 実際のWebhookテスト

1. Notionでタスクのステータスを「Complete」または「完了」に変更
2. スプレッドシートに自動的にデータが記録される

**🚨 つまづきポイント：データが記録されない**

**🔧 デバッグ用プロンプト例：**
```
NotionのWebhookを送信してもGoogleスプレッドシートにデータが記録されません。GASのログを確認する方法と、よくある原因を教えてください。
```

**解決手順：**
1. GASエディタで「実行数」をクリック
2. 失敗した実行の詳細を確認
3. エラーメッセージから原因を特定

**よくあるエラーパターン：**
- スプレッドシートIDの設定ミス → 「設定確認」で確認
- 権限エラー → 再デプロイで解決
- JSON解析エラー → Notionの送信データ形式を確認

## 🔧 高度な機能：動的プロパティ対応

### プロパティが増減する場合の自動対応

この実装では、Notionのプロパティが変わっても自動的に対応します：

1. **新しいプロパティ追加** → 自動的に新しい列として追加
2. **プロパティ削除** → 該当列は空になるが、エラーにならない
3. **プロパティ名変更** → 新しい名前で列が作成される

### カスタムプロパティ名の設定

**🔧 プロンプト例：**
```
Notionのプロパティ名「Task Name」を日本語の「タスク名」として表示したい場合、どのようにマッピング設定を追加すればよいですか？
```

GASの管理画面で以下のような設定が可能です：
```javascript
// プロパティマッピング例
{
  "Task Name": "タスク名",
  "Assignee": "担当者", 
  "Priority": "優先度"
}
```

## 🔧 技術的な詳細：JSONデータの処理

### Notionから送信されるデータ構造

Notionのオートメーションは、以下のような階層構造のJSONを送信します：

```json
{
  "source": {
    "type": "automation",
    "automation_id": "..."
  },
  "data": {
    "object": "page",
    "properties": {
      "タスク名": {
        "type": "title",
        "title": [{
          "plain_text": "Webサイトのコピーを改善"
        }]
      },
      "担当者": {
        "type": "people", 
        "people": [{
          "name": "keitaro.N"
        }]
      },
      "優先度": {
        "type": "select",
        "select": {
          "name": "高"
        }
      }
    }
  }
}
```

### 対応しているプロパティタイプ

| プロパティタイプ | 説明 | 取得方法 |
|---|---|---|
| title | タイトル | `property.title[0].plain_text` |
| rich_text | リッチテキスト | `property.rich_text[0].plain_text` |
| select | セレクト | `property.select.name` |
| multi_select | マルチセレクト | `property.multi_select.map(item => item.name).join(', ')` |
| status | ステータス | `property.status.name` |
| people | 人物 | `property.people.map(person => person.name).join(', ')` |
| date | 日付 | `property.date.start` |
| number | 数値 | `property.number` |
| checkbox | チェックボックス | `property.checkbox ? '✓' : ''` |
| url | URL | `property.url` |
| email | メール | `property.email` |
| phone_number | 電話番号 | `property.phone_number` |
| formula | 数式 | 結果のタイプに応じて処理 |

## トラブルシューティング

### よくある問題と解決方法

#### 1. 「有効化」ボタンが押せない
- **原因**: Content-Typeのスペル、またはデータ未選択
- **解決**: `ContentType`（ハイフンなし）を使用、またはヘッダーを削除

#### 2. データが記録されない
**🔧 デバッグプロンプト：**
```
GASでWebhookを受信しているかログで確認する方法を教えてください。またNotionからデータが送信されているか確認する方法も知りたいです。
```

- **確認手順**:
  1. GASエディタで「実行数」をクリック
  2. doPost関数の実行履歴を確認
  3. コンソールログでデータ受信を確認

#### 3. 新しいプロパティが反映されない
- **原因**: Notionの送信設定でプロパティが選択されていない
- **解決**: オートメーション設定で「すべての既存のプロパティを選択する」にチェック

#### 4. 文字化けが発生する
- **原因**: 文字エンコーディングの問題
- **解決**: ContentTypeヘッダーに `charset=utf-8` を追加

#### 5. パフォーマンスの問題
**🔧 最適化プロンプト：**
```
GASでスプレッドシートに大量データを書き込む際のパフォーマンス最適化方法を教えてください。バッチ処理や非同期処理の実装方法も知りたいです。
```

- **対策**: バッチ処理の実装やセル範囲の最適化

## まとめ

この連携により、Notionでのタスク管理とGoogleスプレッドシートでのデータ分析を組み合わせることができます。最初の設定は少し複雑ですが、一度設定すれば自動的に動作し続けます。

**特に重要なポイント：**
- ✅ Content-Typeヘッダーの罠に注意（`ContentType`またはヘッダーなし）
- ✅ URLは必ず `/exec` で終わる形式を使用
- ✅ 動的プロパティ対応で将来の変更にも対応
- ✅ 詳細なログ機能でトラブルシューティングが容易

**🔧 さらなる活用アイデア：**
```
このWebhook連携を応用して、Slackへの通知機能や、他のサービスとの連携を実装したい場合のアプローチを教えてください。
```

この仕組みを応用すれば、Slack通知、メール送信、他のAPIとの連携など、様々な自動化が可能です。ぜひ活用してみてください！

## 参考リンク

- [Notion データベースオートメーション公式ガイド](https://www.notion.so/ja/help/database-automations)
- [Google Apps Script公式ドキュメント](https://developers.google.com/apps-script)
- [NotionAPI公式ドキュメント](https://developers.notion.com/)

## 更新履歴

- **2025/07/27**: 動的プロパティ対応機能を追加
- **2025/07/27**: Content-Type問題の詳細解説を追加
- **2025/07/27**: 具体的なプロンプト例を追加

---

*この記事が役立ったら、ぜひシェアしてください！質問があればコメント欄でお気軽にどうぞ。技術的な疑問点は具体的なプロンプト例も参考にして、AIアシスタントに質問してみてください。*