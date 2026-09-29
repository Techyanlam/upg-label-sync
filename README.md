# UPG 物流標籤產生器 - Lark 同步版

物流標籤產生工具，支援自動同步到 Lark Base。

## 功能

- 📦 生成物流標籤（85×60mm 格式）
- 🔄 自動同步到 Lark Base
- 📥 從 Lark 載入最新記錄
- 🖨️ 一鍵列印標籤

## 安裝

```bash
# 1. 複製專案
git clone <your-repo-url>
cd upg-label-sync

# 2. 安裝依賴
npm install

# 3. 設定環境變數
cp .env.example .env
# 編輯 .env 檔案，填入你的 Lark API 憑證
```

## 設定 Lark API

1. 到 [Lark 開發者後台](https://open.larksuite.com/app) 建立應用
2. 取得 App ID 和 App Secret
3. 在 `.env` 檔案填入：

```env
LARK_APP_ID=your_app_id
LARK_APP_SECRET=your_app_secret
LARK_BASE_TOKEN=your_base_token
LARK_TABLE_ID=your_table_id
```

## 執行

```bash
npm start
```

開啟瀏覽器訪問 `http://localhost:3000`

## 使用方式

1. 填寫客戶資料（或按「從 Lark 載入」取得最新記錄）
2. 按「生成並列印標籤」產生標籤
3. 按「同步到 Lark」將記錄儲存到 Lark Base

## 技術棧

- **後端**: Node.js + Express
- **前端**: HTML + JavaScript
- **API**: Lark Open API
- **條碼**: JsBarcode

## License

MIT
