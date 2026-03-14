# 中臺機器人研究社 (Robot Research Club of CTUST)

歡迎來到中臺機器人研究社的官方網站專案。本專案旨在為社團提供一個資訊整合、教學資源分享以及活動發布的平台。我們致力於透過現代化的 Web 技術，打造一個高效、美觀且易於維護的社團網站。

## 技術架構

本專案採用現代化的前端技術棧進行開發，主要核心技術如下：

### 核心框架

- **Next.js 16 (App Router)**: 使用最新的 React 框架，提供伺服器端渲染 (SSR) 與靜態生成 (SSG) 能力，優化 SEO 與載入效能。
- **TypeScript**: 全面採用 TypeScript 進行開發，確保程式碼的型別安全與可維護性。
- **React 19**: 利用最新的 React 特性，包括 Hooks 與 Server Components。

### 樣式與 UI

- **Tailwind CSS v4**: 實用優先 (Utility-first) 的 CSS 框架，用於快速構建版面。目前僅少部分使用。
- **SCSS Modules**: 主要使用的樣式框架，用於更複雜的元件樣式封裝，支援巢狀選擇器與變數管理。
- **FontAwesome & Lucide React**: 提供豐富的圖示支援。
- **React Spring / Framer Motion**: 處理流暢的動畫效果與首頁視覺互動。

### 3D 與互動

目前尚未實際應用，正在學習與規劃中。

- **React Three Fiber (R3F)**: 在 React 中宣告式的使用 Three.js，用於網頁中的 3D 模型展示。
- **Drei**: R3F 的實用工具庫。

### 資料與狀態管理

- **Supabase**: 作為核心後端服務，處理使用者認證 (Authentication，支援 Google 登入與 Email 註冊) 與關聯式資料庫 (PostgreSQL)，並透過 Row Level Security (RLS) 管理資料存取權限。
- **Firebase**: (部分舊有資源或特定服務保留使用)。
- **Google Cloud**: OAuth 認證。
- **React Hook Form + Yup**: 處理表單驗證與狀態管理。
- **Nuqs**: URL 查詢參數與狀態管理。

### 功能模組

- **Next-Intl**: 處理多語系 (i18n) 支援。（尚未實作，正在規劃中）
- **FullCalendar**: 整合行事曆功能，用於展示社團課程與活動。
- **React Markdown**: 用於渲染 Markdown 格式的文件內容，並支援語法高亮 (Highlight.js)。

### 部署與分析

- **Vercel**: 網站部署平台。
- **Vercel Analytics & Speed Insights & Google Analytics**: 網站流量與效能分析。
- **Google Search Console**: 網站 SEO 優化與搜尋引擎索引管理。

## 專案結構

本專案遵循 Feature-based 的架構設計，主要目錄結構說明如下：

- **`app/`**: Next.js App Router 的主要目錄。
  - **`components/`**: 共用元件，按功能分類 (如 `Header`, `Footer`, `Auth`, `home` 等)。
  - **`hooks/`**: 自定義 React Hooks。
  - **`contexts/`**: React Context (如 `ThemeContext`)。
  - **`utils/`**: 工具函式與服務層 (如 Supabase/Firebase 服務、資料處理)。
  - **`styles/`**: 全域樣式變數與 Mixins。
  - **`[username]/`**: 使用者個人主頁 (User Profile) 與資料編輯頁面。
  - **`(routes)`**: 各個頁面的路由目錄 (如 `about`, `blog`, `competitions` 等)。
- **`public/`**: 靜態資源檔案。
  - **`assets/`**: 包含圖片、圖示以及 Markdown 文件 (docs)。
- **`i18n/`**: 國際化設定與路由處理。
- **`types/`**: TypeScript 型別定義檔案。

## 核心功能

1. **全新首頁與視覺體驗**: 更加現代語科技感的風格，使用網格與游標螢光效果提升畫面質感，增加多樣化的動態展示與互動模組。
2. **會員系統 (Supabase Auth)**: 具備獨立登入頁面，提供穩定的 Email/密碼及 Google 帳號登入與註冊機制，並包含登入狀態同步與自動路由重導向。
3. **個人主頁 (User Profiles)**: 允許使用者設定專屬的 `/[username]` 路由，支援自訂大頭貼、個人主頁背景圖片、公開狀態設定 (`is_public` RLS) ，以及未來的社群連結整合。
4. **資訊公告與部落格**: 支援 Markdown 渲染，方便發布社團公告、教學文章與競賽資訊。
5. **活動行事曆**: 整合 FullCalendar，清楚展示社團課程時間與重要活動，並具備效能優化設計。
6. **文件中心**: 集中管理社團章程、隱私權政策 (`/privacy`) 與服務條款 (`/terms`) 等重要文件，並加強了 SEO 與元資料 (Metadata) 支援。

## 開發指南

若您是社團成員並希望參與網站開發，請依照以下步驟在本地端啟動專案：

1. **安裝依賴套件**:
   (本專案採用 `pnpm` 進行套件維護及依賴管理)

    ```bash
    npm install -g pnpm
    pnpm install
    ```

2. **設定環境變數**:
    請參考專案中的環境變數範本 `.env.example` (未來將會提供)，並確保您獲得 Supabase 及 Firebase 等相關設定金鑰。

3. **啟動開發伺服器**:

    ```bash
    pnpm dev
    ```

    伺服器啟動後，請在瀏覽器中開啟 `http://localhost:3000`。

## 參與貢獻

我們非常歡迎社團成員參與網站的維護與開發！無論是修復 Bug、新增功能或是改善文件，您的貢獻都能讓社團網站變得更好。

在進行程式碼修改時，請遵循專案既定的程式碼風格與規範 (如模組化 CSS、TypeScript 型別定義等)。

---

© 中臺機器人研究社 Robotics Research Club of CTUST
