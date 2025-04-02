# AutoMedia - 社交媒體管理平台

AutoMedia 是一個基於 Next.js 和 Vercel 的社交媒體管理平台，專注於幫助用戶連接 Google 雲端硬碟、上傳視頻、查看視頻及排程發布到不同社交媒體平台。

## 功能特點

- **儀表板總覽**：查看所有排程和發布狀態
- **日曆視圖**：以日曆形式查看和管理排程發布
- **媒體庫**：管理已上傳的媒體文件
- **Google Drive 集成**：直接從 Google Drive 選擇媒體文件
- **多平台發布**：支持 YouTube、Facebook、TikTok 等平台
- **排程發布**：設置發布時間，自動發布內容

## 技術架構

### 前端

- **Next.js 15+**（App Router）
- **React 19+**
- **Tailwind CSS 3**（UI 樣式）
- **NextAuth.js**（認證系統）

### 後端

- **Next.js API 路由**
- **Vercel Serverless 函數**
- **Supabase**（PostgreSQL 數據庫）
- **Cloudinary**（媒體存儲和處理）

### 外部服務集成

- **Google Drive API**
- **YouTube Data API**
- **TikTok Content API**
- **Facebook Graph API**

## 目錄結構

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 認證相關頁面
│   ├── (dashboard)/        # 儀表板相關頁面
│   │   ├── dashboard/      # 儀表板主頁
│   │   ├── calendar/       # 日曆視圖
│   │   ├── media/          # 媒體庫
│   │   ├── drive/          # Google Drive 連接
│   │   └── create/         # 創建發布
│   ├── api/                # API 路由
│   │   ├── auth/           # 認證 API
│   │   ├── drive/          # Google Drive API
│   │   ├── media/          # 媒體 API
│   │   ├── platforms/      # 社交平台 API
│   │   └── scheduler/      # 排程 API
├── components/             # React 組件
│   ├── layout/             # 佈局組件
│   ├── ui/                 # UI 組件
│   └── forms/              # 表單組件
├── lib/                    # 工具函數和服務
└── types/                  # TypeScript 類型定義
```

## 開發環境設置

1. 克隆倉庫
   ```
   git clone https://github.com/JasonLinn/next-auto-media.git
   cd next-auto-media
   ```

2. 安裝依賴
   ```
   npm install
   ```

3. 設置環境變數
   創建 `.env.local` 文件，並添加必要的環境變數：
   ```
   # Next Auth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret

   # Social Media APIs
   YOUTUBE_API_KEY=your-youtube-api-key
   TIKTOK_API_KEY=your-tiktok-api-key
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret
   ```

4. 設置 Google OAuth
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 創建一個新項目
   - 啟用 Google Drive API 和 OAuth 2.0
   - 創建 OAuth 2.0 客戶端 ID
   - 設置授權重定向 URI 為 `http://localhost:3000/api/auth/callback/google`（開發環境）和 `https://your-domain.com/api/auth/callback/google`（生產環境）
   - 將客戶端 ID 和客戶端密鑰添加到 `.env.local` 文件中

5. 設置 Supabase
   - 創建 Supabase 項目
   - 創建以下表格：
     - `users`：存儲用戶資訊
     - `oauth_accounts`：存儲 OAuth 帳戶資訊
   - 將 Supabase URL 和匿名密鑰添加到 `.env.local` 文件中

6. 啟動開發服務器
   ```
   npm run dev
   ```

7. 在瀏覽器中訪問 [http://localhost:3000](http://localhost:3000)

## 部署

該專案可以輕鬆部署到 Vercel 平台：

1. 在 Vercel 上創建一個新項目
2. 連接到您的 GitHub 倉庫
3. 設置環境變數
4. 部署

### 特別注意事項

本項目使用 Tailwind CSS v3，需要特別注意以下事項：

1. 確保 `postcss.config.mjs` 文件配置正確：
   ```js
   export default {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   };
   ```

2. 對於第三方 CSS 文件（如 `react-calendar/dist/Calendar.css`），建議創建自定義 CSS 文件以避免 Tailwind CSS 處理問題。

## 貢獻

歡迎提交 Pull Request 和 Issue！

## 許可證

MIT

## 環境設置

### 環境變數

複製 `.env.local.example` 為 `.env.local` 並根據您的需求更新變數：

```bash
cp .env.local.example .env.local
```

主要的環境變數包括：

- `NEXTAUTH_URL`: 您的應用程式 URL（開發時可以是 ngrok URL）
- `NEXT_PUBLIC_URL`: 公共 URL，與 NEXTAUTH_URL 相同
- OAuth 相關的客戶端 ID 和密鑰
- 所有社交媒體平台的重定向 URI

### 使用 ngrok 進行開發

對於 Instagram 和 Facebook 等平台，OAuth 需要 HTTPS URL，即使在本地開發環境中也是如此。我們使用 ngrok 提供一個臨時的公共 HTTPS URL：

1. 安裝 ngrok：
   ```bash
   npm install -g ngrok
   ```

2. 設置 ngrok 授權令牌（只需做一次）：
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

3. 啟動 ngrok 隧道：
   ```bash
   ngrok http 3000
   ```

4. 使用生成的 URL 更新 `.env.local` 中的所有重定向 URI：
   ```
   NEXTAUTH_URL=https://xxxx-xxxx-xxxx.ngrok-free.app
   NEXT_PUBLIC_URL=https://xxxx-xxxx-xxxx.ngrok-free.app
   FACEBOOK_REDIRECT_URI=https://xxxx-xxxx-xxxx.ngrok-free.app/api/auth/callback/facebook
   INSTAGRAM_REDIRECT_URI=https://xxxx-xxxx-xxxx.ngrok-free.app/api/auth/callback/instagram
   ```

5. 在社交媒體平台的開發者設置中，更新授權重定向 URI：
   - Facebook 開發者平台：添加 `https://xxxx-xxxx-xxxx.ngrok-free.app/api/auth/callback/facebook`
   - Instagram Basic Display：添加 `https://xxxx-xxxx-xxxx.ngrok-free.app/api/auth/callback/instagram`

> **注意**: 每次重啟 ngrok 時，都會生成一個新的 URL，您需要更新環境變數和開發者平台設置。