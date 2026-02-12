# 中臺機器人研究社 (Robot Research Club of CTUST)

歡迎來到中臺機器人研究社的官方網站專案。本專案旨在為社團提供一個資訊整合、教學資源分享以及活動發布的平台。我們致力於透過現代化的 Web 技術，打造一個高效、美觀且易於維護的社團網站。

## 技術架構

本專案採用現代化的前端技術棧進行開發，主要核心技術如下：

### 核心框架

- **Next.js 16 (App Router)**: 使用最新的 React 框架，提供伺服器端渲染 (SSR) 與靜態生成 (SSG) 能力，優化 SEO 與載入效能。
- **TypeScript**: 全面採用 TypeScript 進行開發，確保程式碼的型別安全與可維護性。
- **React 19**: 利用最新的 React 特性，包括 Hooks 與 Server Components。

### 樣式與 UI

- **SCSS Modules**: 用於更複雜的元件樣式封裝，支援巢狀選擇器與變數管理。
- **FontAwesome**: 提供豐富的圖示支援。
- **React Spring / Framer Motion**: 處理流暢的動畫效果。
- **Tailwind CSS**: 實用優先 (Utility-first) 的 CSS 框架，用於快速構建版面。

### 3D 與互動

- **React Three Fiber (R3F)**: 在 React 中宣告式地使用 Three.js，用於網頁中的 3D 模型展示。
- **Drei**: R3F 的實用工具庫。

### 資料與狀態管理

- **Firebase**: 作為後端服務，處理使用者認證 (Authentication) 與資料庫 (Firestore) 需求。
- **React Hook Form + Yup**: 處理表單驗證與狀態管理。
- **Nuqs**: URL 查詢參數狀態管理。

### 功能模組

- **Next-Intl**: 處理多語系 (i18n) 支援。
- **FullCalendar**: 整合行事曆功能，用於展示社團課程與活動。
- **React Markdown**: 用於渲染 Markdown 格式的文件內容。

### 部署與分析

- **Vercel**: 專案部署平台。
- **Vercel Analytics & Speed Insights**: 網站流量與效能分析。

## 專案結構

本專案遵循 Feature-based 的架構設計，主要目錄結構說明如下：

- **`app/`**: Next.js App Router 的主要目錄。
  - **`components/`**: 共用元件，按功能分類 (如 `Header`, `Footer`, `Auth` 等)。
  - **`hooks/`**: 自定義 React Hooks。
  - **`contexts/`**: React Context (如 `AuthContext`, `ThemeContext`)。
  - **`utils/`**: 工具函式與服務層 (如 Firebase 服務、資料處理)。
  - **`styles/`**: 全域樣式變數與 Mixins。
  - **`(routes)`**: 各個頁面的路由目錄 (如 `about`, `blog`, `competitions` 等)。
- **`public/`**: 靜態資源檔案。
  - **`assets/`**: 包含圖片、圖示以及 Markdown 文件 (docs)。
- **`i18n/`**: 國際化設定與路由處理。
- **`types/`**: TypeScript 型別定義檔案。

## 核心功能

1. **資訊公告與部落格**: 支援 Markdown 渲染，方便發布社團公告、教學文章與競賽資訊。
2. **活動行事曆**: 整合 FullCalendar，清楚展示社團課程時間與重要活動。
3. **會員系統**: 整合 Firebase Auth，提供社員登入與個人資料管理功能。
4. **文件中心**: 集中管理社團章程、借用規則等重要文件。
5. **響應式設計**: 支援各種裝置尺寸，並提供深色/淺色主題切換。

## 開發指南

若您是社團成員並希望參與網站開發，請依照以下步驟在本地端啟動專案：

1. **安裝依賴套件**:

    ```bash
    npm install
    ```

2. **設定環境變數**:
    請參考專案中的環境變數範本 (如有)，並確保您擁有 Firebase 的相關設定金鑰。

3. **啟動開發伺服器**:

    ```bash
    npm run dev
    ```

    伺服器啟動後，請在瀏覽器中開啟 `http://localhost:3000`。

## 參與貢獻

我們非常歡迎社團成員參與網站的維護與開發！無論是修復 Bug、新增功能或是改善文件，您的貢獻都能讓社團網站變得更好。

在進行程式碼修改時，請遵循專案既定的程式碼風格與規範 (如模組化 CSS、TypeScript 型別定義等)。

---

© 中臺機器人研究社 Robot Research Club of CTUST









