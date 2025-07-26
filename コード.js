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
    .addItem('🧪 テスト実行', 'testWebhookWithSampleData')
    .addSeparator()
    .addItem('🔗 Webhook URLを表示', 'showWebhookUrl')
    .addItem('📊 受信ログを確認', 'showRecentLogs')
    .addToUi();
}

// ===== 設定画面 =====

// 設定ダイアログを表示
function showSettingsDialog() {
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h3 {
            color: #1a73e8;
            margin-top: 0;
          }
          .form-group {
            margin: 20px 0;
          }
          label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
          }
          input[type="text"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          }
          input[type="text"]:focus {
            outline: none;
            border-color: #1a73e8;
          }
          .help-text {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          .button-group {
            margin-top: 30px;
            display: flex;
            gap: 10px;
          }
          button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s;
          }
          .btn-primary {
            background: #1a73e8;
            color: white;
          }
          .btn-primary:hover {
            background: #1557b0;
          }
          .btn-secondary {
            background: #f8f9fa;
            color: #333;
            border: 1px solid #dadce0;
          }
          .btn-secondary:hover {
            background: #e8eaed;
          }
          #message {
            margin-top: 20px;
            padding: 10px;
            border-radius: 4px;
            display: none;
          }
          .success {
            background: #e6f4ea;
            color: #137333;
            border: 1px solid #137333;
          }
          .error {
            background: #fce8e6;
            color: #c5221f;
            border: 1px solid #c5221f;
          }
          .loading {
            display: none;
            color: #666;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h3>🚀 Notion Webhook 連携設定</h3>
          <p>Notionからのデータを記録するスプレッドシートを設定します。</p>
          
          <div class="form-group">
            <label for="spreadsheetId">スプレッドシートID:</label>
            <input type="text" id="spreadsheetId" placeholder="例: 1X6L6h89_cw-Pm3CiExouTY4oV0usOBI96iNl73c8g3Y">
            <div class="help-text">
              現在開いているスプレッドシートのIDが自動入力されています
            </div>
          </div>
          
          <div class="form-group">
            <label for="sheetName">シート名:</label>
            <input type="text" id="sheetName" value="Notion_タスク記録" placeholder="例: Notion_タスク記録">
            <div class="help-text">
              データを記録するシート名（存在しない場合は自動作成されます）
            </div>
          </div>
          
          <div class="button-group">
            <button class="btn-primary" onclick="saveSettings()">
              💾 設定を保存
            </button>
            <button class="btn-secondary" onclick="google.script.host.close()">
              キャンセル
            </button>
          </div>
          
          <div id="message"></div>
          <div class="loading" id="loading">処理中...</div>
        </div>
        
        <script>
          // 初期化
          window.onload = function() {
            // 現在のスプレッドシートIDを取得
            google.script.run.withSuccessHandler(function(id) {
              if (id) {
                document.getElementById('spreadsheetId').value = id;
              }
            }).getCurrentSpreadsheetId();
            
            // 保存済みの設定を読み込み
            google.script.run.withSuccessHandler(function(settings) {
              if (settings.spreadsheetId) {
                document.getElementById('spreadsheetId').value = settings.spreadsheetId;
              }
              if (settings.sheetName) {
                document.getElementById('sheetName').value = settings.sheetName;
              }
            }).getSettings();
          };
          
          // 設定を保存
          function saveSettings() {
            const spreadsheetId = document.getElementById('spreadsheetId').value.trim();
            const sheetName = document.getElementById('sheetName').value.trim();
            const messageDiv = document.getElementById('message');
            const loadingDiv = document.getElementById('loading');
            
            // バリデーション
            if (!spreadsheetId || !sheetName) {
              showMessage('すべての項目を入力してください。', 'error');
              return;
            }
            
            // 処理中表示
            loadingDiv.style.display = 'block';
            messageDiv.style.display = 'none';
            
            // 保存処理
            google.script.run
              .withSuccessHandler(function(result) {
                loadingDiv.style.display = 'none';
                showMessage(result, 'success');
                setTimeout(function() {
                  google.script.host.close();
                }, 2000);
              })
              .withFailureHandler(function(error) {
                loadingDiv.style.display = 'none';
                showMessage('エラー: ' + error, 'error');
              })
              .saveSettings(spreadsheetId, sheetName);
          }
          
          // メッセージ表示
          function showMessage(text, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = text;
            messageDiv.className = type;
            messageDiv.style.display = 'block';
          }
        </script>
      </body>
    </html>
  `)
  .setWidth(600)
  .setHeight(500);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Notion連携設定');
}

// ===== 設定管理 =====

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

// 設定を確認
function checkCurrentSettings() {
  const settings = getSettings();
  const ui = SpreadsheetApp.getUi();
  
  if (!settings.spreadsheetId) {
    ui.alert(
      '⚠️ 設定が必要です',
      'スプレッドシートIDが設定されていません。\n\n「Notion連携設定」→「初期設定」から設定してください。',
      ui.ButtonSet.OK
    );
    return;
  }
  
  try {
    const ss = SpreadsheetApp.openById(settings.spreadsheetId);
    const sheet = ss.getSheetByName(settings.sheetName);
    
    let message = '📋 現在の設定\n\n';
    message += '▫️ スプレッドシート: ' + ss.getName() + '\n';
    message += '▫️ シート名: ' + settings.sheetName + '\n';
    message += '▫️ シートの状態: ' + (sheet ? '✅ 準備完了' : '⚠️ 未作成（自動作成されます）') + '\n';
    
    if (sheet) {
      const lastRow = sheet.getLastRow();
      message += '▫️ 記録済みデータ: ' + (lastRow > 1 ? (lastRow - 1) + '件' : 'なし') + '\n';
    }
    
    message += '\n✅ 設定は正常です！';
    
    ui.alert('設定確認', message, ui.ButtonSet.OK);
    
  } catch (error) {
    ui.alert(
      '❌ エラー',
      'スプレッドシートにアクセスできません。\n\n' + error.toString(),
      ui.ButtonSet.OK
    );
  }
}

// ===== シート設定 =====

// シートのヘッダーを設定
function setupSheetHeaders(sheet) {
  const headers = [
    '記録日時',
    'タスク名',
    '担当者',
    '優先度',
    'ステータス',
    '期日',
    '期限超過',
    '工数レベル',
    '説明'
  ];
  
  // ヘッダー設定
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // ヘッダーの書式設定
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1a73e8');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // 列幅の設定
  sheet.setColumnWidth(1, 150); // 記録日時
  sheet.setColumnWidth(2, 250); // タスク名
  sheet.setColumnWidth(3, 120); // 担当者
  sheet.setColumnWidth(4, 100); // 優先度
  sheet.setColumnWidth(5, 100); // ステータス
  sheet.setColumnWidth(6, 120); // 期日
  sheet.setColumnWidth(7, 100); // 期限超過
  sheet.setColumnWidth(8, 120); // 工数レベル
  sheet.setColumnWidth(9, 350); // 説明
  
  // シートの保護（ヘッダー行）
  const protection = headerRange.protect().setDescription('ヘッダー行の保護');
  protection.setWarningOnly(true);
}

// ===== Webhook処理 =====

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
  
  // シートが存在しない場合は作成
  if (!sheet) {
    console.log('シートが存在しないため作成:', settings.sheetName);
    sheet = spreadsheet.insertSheet(settings.sheetName);
    setupSheetHeaders(sheet);
  }
  
  // 記録日時
  const recordDate = new Date();
  
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
  
  // 各フィールドの値を取得
  console.log('タスク名を取得中...');
  const taskName = getNotionPropertyValue(properties['タスク名']) || 
                   getNotionPropertyValue(properties['title']) || 
                   '名称未設定';
  console.log('タスク名:', taskName);
  
  const assignee = getNotionPropertyValue(properties['担当者']);
  console.log('担当者:', assignee);
  
  const priority = getNotionPropertyValue(properties['優先度']);
  const status = getNotionPropertyValue(properties['ステータス']) || 'Complete';
  const dueDate = getNotionPropertyValue(properties['期日']);
  const overdue = getNotionPropertyValue(properties['期限超過']);
  const workLevel = getNotionPropertyValue(properties['工数レベル']);
  const taskType = getNotionPropertyValue(properties['タスクの種類']);
  const description = getNotionPropertyValue(properties['説明']);
  
  // 記録する行データ
  const rowData = [
    recordDate,
    taskName,
    assignee,
    priority,
    status,
    dueDate,
    overdue,
    workLevel || taskType,  // 工数レベルまたはタスクの種類
    description
  ];
  
  console.log('記録する行データ:', rowData);
  
  // データを追加
  const lastRow = sheet.getLastRow() + 1;
  sheet.getRange(lastRow, 1, 1, rowData.length).setValues([rowData]);
  
  // 新しい行に書式を適用
  const newRowRange = sheet.getRange(lastRow, 1, 1, rowData.length);
  newRowRange.setBorder(true, true, true, true, true, true);
  
  // 日付列のフォーマット
  sheet.getRange(lastRow, 1).setNumberFormat('yyyy/mm/dd hh:mm:ss');
  if (dueDate) {
    sheet.getRange(lastRow, 6).setNumberFormat('yyyy/mm/dd');
  }
  
  console.log('記録完了 - 行番号:', lastRow);
  console.log('--- recordToSpreadsheet終了 ---');
  
  return {
    success: true,
    row: lastRow,
    spreadsheet: spreadsheet.getName(),
    sheet: sheet.getName()
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

// ===== ユーティリティ関数 =====

// Webhook URLを表示
function showWebhookUrl() {
  const ui = SpreadsheetApp.getUi();
  const url = getWebhookUrl();
  
  if (url.includes('デプロイが必要')) {
    ui.alert(
      '⚠️ デプロイが必要です',
      'Webアプリとしてデプロイする必要があります。\n\n' +
      '1. デプロイ → 新しいデプロイ\n' +
      '2. 種類：ウェブアプリ\n' +
      '3. 実行ユーザー：自分\n' +
      '4. アクセス：全員\n' +
      '5. デプロイをクリック',
      ui.ButtonSet.OK
    );
  } else {
    // HTMLでURLを表示（コピーしやすいように）
    const html = HtmlService.createHtmlOutput(`
      <div style="padding: 20px;">
        <h3>🔗 Webhook URL</h3>
        <p>以下のURLをNotionのWebhook設定に貼り付けてください：</p>
        <div style="background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <code style="word-break: break-all; font-family: monospace; font-size: 12px;">
            ${url}
          </code>
        </div>
        <p style="color: #666; font-size: 12px;">
          ※ URLをトリプルクリックで全選択できます
        </p>
      </div>
    `)
    .setWidth(600)
    .setHeight(250);
    
    ui.showModalDialog(html, 'Webhook URL');
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
        },
        '期限超過': {
          'type': 'formula',
          'formula': {
            'type': 'string',
            'string': ''
          }
        },
        '工数レベル': {
          'type': 'select',
          'select': {
            'name': '中'
          }
        },
        '説明': {
          'type': 'rich_text',
          'rich_text': [{
            'plain_text': 'これはテストデータです。Notionから送信されるデータ形式を模擬しています。'
          }]
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
      '▫️ シート: ' + result.sheet + '\n\n' +
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

// 最近のログを表示
function showRecentLogs() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    '📊 ログの確認方法',
    'GASエディタで以下の手順でログを確認できます：\n\n' +
    '1. 拡張機能 → Apps Script を開く\n' +
    '2. 実行数 をクリック\n' +
    '3. 最近の実行を確認\n' +
    '4. 詳細をクリックしてログを表示\n\n' +
    '※ Webhook受信時のログはdoPost関数で確認できます',
    ui.ButtonSet.OK
  );
}

// GETリクエストへの対応（ブラウザアクセス時）
function doGet(e) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Notion Webhook 受信サーバー</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 40px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 40px;
          }
          h1 {
            color: #1a73e8;
            margin: 0 0 20px 0;
            font-size: 28px;
          }
          .status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #e8f5e9;
            color: #2e7d32;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            margin-bottom: 30px;
          }
          .status::before {
            content: "●";
            color: #4caf50;
          }
          .url-box {
            background: #f8f9fa;
            border: 1px solid #dadce0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .url-label {
            font-weight: bold;
            color: #3c4043;
            margin-bottom: 10px;
            display: block;
          }
          code {
            display: block;
            background: white;
            padding: 12px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            word-break: break-all;
            color: #1a73e8;
            border: 1px solid #dadce0;
          }
          .instructions {
            background: #e3f2fd;
            border-left: 4px solid #1976d2;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
          }
          .instructions h3 {
            margin: 0 0 10px 0;
            color: #1976d2;
          }
          .instructions ol {
            margin: 10px 0;
            padding-left: 20px;
          }
          .instructions li {
            margin: 8px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Notion Webhook 受信サーバー</h1>
          <div class="status">稼働中</div>
          
          <p>このサーバーはNotionからのWebhookを受信してGoogleスプレッドシートに記録します。</p>
          
          <div class="url-box">
            <span class="url-label">Webhook URL:</span>
            <code>${ScriptApp.getService().getUrl()}</code>
          </div>
          
          <div class="instructions">
            <h3>📋 使用方法</h3>
            <ol>
              <li>上記のURLをコピーします</li>
              <li>Notionのデータベースでオートメーションを作成</li>
              <li>アクションで「Webhookを送信する」を選択</li>
              <li>URLに上記のアドレスを貼り付け</li>
              <li>必要に応じてヘッダーに <code>ContentType: application/json</code> を追加</li>
              <li>送信するプロパティを選択して保存</li>
            </ol>
          </div>
          
          <div class="footer">
            <p>問題が発生した場合は、スプレッドシートのメニューから「Notion連携設定」→「設定確認」を実行してください。</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setTitle('Notion Webhook 受信サーバー')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

// ===== 初回実行時のセットアップ =====

// 初回セットアップの確認
function checkFirstTimeSetup() {
  const settings = getSettings();
  if (!settings.spreadsheetId) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      '🎉 Notion連携スクリプトへようこそ！',
      '初回セットアップを開始しますか？',
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.YES) {
      showSettingsDialog();
    }
  }
}