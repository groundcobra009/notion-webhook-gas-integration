# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Google Apps Script (GAS) project that creates a webhook integration between Notion and Google Sheets. The script receives data from Notion automations via webhook and automatically records it in a Google Spreadsheet.

## Development Commands

### Google Apps Script Development

Since this is a GAS project, there are no traditional build/test commands. Development is done through:

1. **Opening the Script Editor**: 
   - From Google Sheets: Extensions → Apps Script
   - Direct URL: script.google.com

2. **Deployment**:
   - Deploy → New deployment
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone

3. **Testing Functions**:
   - Use the built-in menu: "🔧 Notion連携設定"
   - Run `testWebhookWithSampleData()` to test webhook functionality
   - Check logs via: View → Logs in the Script Editor

## Architecture

### Main Components

1. **Menu System** (lines 8-18): Custom menu added to Google Sheets for user interaction
   - Initial setup dialog
   - Settings verification
   - Test execution
   - Webhook URL display

2. **Settings Management** (lines 227-316): Handles spreadsheet configuration
   - Uses PropertiesService to store spreadsheet ID and sheet name
   - Validates spreadsheet access
   - Auto-creates sheets if needed

3. **Webhook Handler** (`doPost` function, lines 363-439):
   - Entry point for Notion webhooks
   - Parses incoming JSON data
   - Delegates to `recordToSpreadsheet()`
   - Returns JSON response with processing status

4. **Data Processing** (`recordToSpreadsheet`, lines 442-532):
   - Extracts data from Notion's property structure
   - Maps Notion properties to spreadsheet columns
   - Handles various Notion property types via `getNotionPropertyValue()`

5. **Property Type Handler** (`getNotionPropertyValue`, lines 535-591):
   - Comprehensive handler for all Notion property types
   - Converts Notion data structures to plain text

### Data Flow

1. Notion automation triggers → Sends webhook to GAS URL
2. `doPost()` receives and validates the request
3. Data is parsed from Notion's nested structure (`data.data.properties`)
4. Each property is extracted based on its type
5. Data is formatted and appended to the Google Sheet

### Key Configuration

The script expects these Notion properties:
- タスク名 (Task Name) - title type
- 担当者 (Assignee) - people type
- 優先度 (Priority) - select type
- ステータス (Status) - status type
- 期日 (Due Date) - date type
- 期限超過 (Overdue) - formula type
- 工数レベル (Work Level) - select type
- 説明 (Description) - rich_text type

## Important Considerations

1. **Japanese UI**: All user-facing text is in Japanese. Maintain consistency when adding features.

2. **Notion Data Structure**: Notion sends data in the format:
   ```
   {
     "data": {
       "properties": {
         "PropertyName": {
           "type": "property_type",
           // type-specific data
         }
       }
     }
   }
   ```

3. **Error Handling**: The script logs extensively to console for debugging webhook issues.

4. **Time Zone**: Set to Asia/Tokyo in appsscript.json

5. **Permissions**: Web app must be deployed with "Anyone" access for Notion to send webhooks.