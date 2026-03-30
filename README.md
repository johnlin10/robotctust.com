# 中臺機器人研究社 官方網站

> 一個由社團成員共同維護的平台，用來整合資訊、分享教學資源，以及記錄我們在機器人世界裡走過的每一步。

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?logo=supabase)](https://supabase.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)

---

## 關於這個專案

這是中臺科技大學機器人研究社的官方網站，目前持續開發中。

我們希望這個網站不只是一個公告欄，而是一個讓社員真正會用到的地方——查競賽時間、跟著課程學習、分享實作成果。每一個功能的設計，都從「社員實際需要什麼」出發。

網站本身也是我們的一個實踐場：從架構選型到 UI 細節，從認證系統到響應式設計，這個專案讓我們在社團課以外，有機會碰到真實的工程問題。

---

## 最新版本：v2.2.0

### 開發進度

| 功能模組                                   | 狀態              |
| ------------------------------------------ | ----------------- |
| 全新首頁（動態視覺、互動模組）             | ✅ 已上線         |
| 競賽資訊與報名系統                         | ✅ 已上線         |
| 社團行事曆                                 | ✅ 已上線         |
| 資訊公告（Markdown 渲染）                  | ✅ 已上線         |
| 文件中心（社章、隱私權政策等）             | ✅ 已上線         |
| 響應式設計（手機／平板／桌機）             | ✅ 全頁面覆蓋     |
| Supabase 認證系統（多角色權限、身分驗證）  | ✅ 已完成         |
| 課程系統（學期制、章節課程、審核流程）     | ✅ 已上線         |
| 管理後台（Dashboard、課程編修、社員管理）  | ✅ 已上線         |
| 使用者個人頁面（`/@username`）             | ✅ 基本頁面可訪問 |
| 經驗值與成就系統                           | 🔨 開發中 (v2.3)  |
| 社群發文平台                               | 📋 規劃中 (v2.4)  |
| 多語系支援（i18n）                         | 🔨 基礎架構已建立 |
| 3D 模型展示（React Three Fiber）           | 🔬 研究中         |

---

## 未來規劃

### v2.3 — 經驗值與成就系統

將課程認證記錄轉換為經驗值，並根據累積進度或特定課程完成情況解鎖成就徽章。讓學習過程更有目標感與成就感。

### v2.4 — 社群平台

開放社員發文，分享實作成果與學習歷程。支援點讚、留言、轉發等互動功能，並完整開放個人頁面管理。

### v2.5 — 穩定與體驗優化

全面稽核前幾個版本累積的技術債，統一介面設計語言，優化各功能模組間的整合性與使用者操作流程。

---

## 技術架構

### 核心框架

- **[Next.js 16](https://nextjs.org/)（App Router）** — SSR／SSG、路由管理、API Routes
- **[React 19](https://react.dev/)** — Server Components、Hooks
- **[TypeScript](https://www.typescriptlang.org/)** — 全面型別覆蓋，確保可維護性

### 樣式與 UI

- **SCSS Modules** — 主要樣式方案，支援巢狀選擇器與變數管理
- **Tailwind CSS v4** — 輔助使用，處理快速排版需求
- **Framer Motion / React Spring** — 動畫與首頁互動效果
- **FontAwesome & Lucide React** — 圖示系統

### 後端與資料

- **[Supabase](https://supabase.com/)** — 使用者認證（Email + Google OAuth）、PostgreSQL 資料庫、Row Level Security (RLS)
- **Firebase** — 部分舊有服務遷移中（已移除使用者管理功能）
- **React Hook Form + Yup** — 表單驗證

### 功能套件

- **FullCalendar** — 社團行事曆
- **React Markdown + Highlight.js** — Markdown 渲染與語法高亮
- **Next-Intl** — 多語系支援
- **Nuqs** — URL 查詢參數管理

### 部署與分析

- **[Vercel](https://vercel.com/)** — 部署平台
- **Vercel Analytics / Speed Insights** — 效能監控
- **Google Analytics / Search Console** — 流量分析與 SEO

### 3D（研究中）

- **React Three Fiber + Drei** — 未來用於 3D 模型展示

---

## 專案結構

```
.
├── app/
│   ├── about/             # 關於社團
│   ├── blog/              # 資訊公告
│   ├── competitions/      # 競賽資訊
│   ├── courses/           # 課程前台
│   ├── dashboard/         # 管理後台 (課程、社員、審核)
│   ├── onboarding/        # 註冊身分驗證流程
│   ├── [username]/        # 個人主頁
│   ├── components/        # 共用元件庫
│   ├── contexts/          # React Context (Auth, Theme, etc.)
│   ├── hooks/             # 自訂 Hooks
│   ├── styles/            # SCSS 變數與全域樣式
│   ├── types/             # TypeScript 型別定義
│   └── utils/             # 工具函式與服務層 (Supabase, etc.)
├── i18n/                  # 國際化配置
├── public/                # 靜態資源 (Assets, Icons)
└── README.md
```

---

## 本地端開發

本專案使用 `pnpm` 管理套件。

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev
```

開啟瀏覽器前往 `http://localhost:3000`。

**環境變數**：請參考 `.env.example`（即將提供），你需要取得 Supabase 的相關金鑰才能完整執行認證功能。

---

## 參與貢獻

如果你是社團成員，對網站有任何想法——不管是發現問題、有功能建議，還是想實際動手改——都非常歡迎。

在提交程式碼前，請留意：

- 樣式以 **SCSS Modules** 為主，輔以 **Tailwind CSS v4**
- 新增功能請搭配 **TypeScript 型別定義**
- 元件結構遵循 feature-based 目錄規則

有任何問題，也可以直接找社團幹部討論。

---

## 版本紀錄

| 版本   | 日期       | 主要更新                                     |
| ------ | ---------- | -------------------------------------------- |
| v2.2.0 | 2026-03-30 | 課程系統、後台管理、多角色權限、SEO 優化     |
| v2.1.4 | 2026-03-26 | 權限驗證重構、管理控制台初步上線             |
| v2.1.3 | 2026-03-22 | 競賽報名元件、報名狀態自動判斷               |
| v2.1.2 | 2026-03-20 | 競賽資料管理、權限系統重構                   |
| v2.1.1 | 2026-03-13 | 認證狀態穩定性修復、登出問題解決             |
| v2.1.0 | 2026-03-13 | Supabase 認證整合、個人頁面系統              |
| v2.0.3 | 2026-03-05 | 型別錯誤修復、Sitemap 更新                   |
| v2.0.2 | 2026-03-05 | 日曆效能優化（useMemo、useCallback）         |
| v2.0.1 | 2026-03-05 | 114-2 學期競賽資料、行事曆功能強化           |
| v2.0.0 | 2026-03-01 | 首頁全面改版，v2 系列正式啟動                |

---

© 中臺機器人研究社 · Robot Research Club of CTUST
