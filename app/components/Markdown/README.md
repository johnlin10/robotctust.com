# Markdown 組件

這是一個功能完整的 Markdown 渲染和編輯器組件集合，支持實時預覽、語法高亮、自動保存等功能。

## 功能特色

### MarkdownRenderer (渲染器)

- ✅ 將 Markdown 文本轉換為 HTML 結構
- ✅ 支持從文件路徑讀取 `.md` 文件
- ✅ 語法高亮顯示
- ✅ 支持 GitHub Flavored Markdown (GFM)
- ✅ 支持表格、任務列表、程式碼區塊
- ✅ 深色模式支持
- ✅ 自定義樣式

### MarkdownEditor (編輯器)

- ✅ 完整的編輯功能（顯示、編輯、保存、取消）
- ✅ 實時預覽（寬屏時分屏顯示）
- ✅ 自動保存功能
- ✅ 全屏編輯模式
- ✅ 快捷鍵支持
- ✅ 變更追蹤
- ✅ 響應式設計

## 安裝依賴

```bash
npm install react-markdown remark-gfm rehype-highlight rehype-raw
```

## 基本使用

### 1. 僅顯示 Markdown (MarkdownRenderer)

```tsx
import { MarkdownRenderer } from './components/Markdown';

// 從字符串渲染
<MarkdownRenderer 
  content="# Hello\n\nThis is **bold** text." 
  className="custom-style"
/>

// 從文件路徑渲染
<MarkdownRenderer 
  filePath="/path/to/your/file.md" 
  className="custom-style"
/>
```

### 2. 完整編輯功能 (MarkdownEditor)

```tsx
import { MarkdownEditor } from './components/Markdown';

const MyComponent = () => {
  const handleSave = async (content: string) => {
    // 保存邏輯 - 可以是 API 調用或本地存儲
    console.log('Saving content:', content);
    await fetch('/api/save-markdown', {
      method: 'POST',
      body: JSON.stringify({ content }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const handleCancel = () => {
    console.log('Edit cancelled');
  };

  return (
    <MarkdownEditor
      initialContent="# 初始內容\n\n開始編輯..."
      onSave={handleSave}
      onCancel={handleCancel}
      autoSave={true}
      autoSaveInterval={30000} // 30秒自動保存
      className="h-96"
    />
  );
};
```

## 組件屬性

### MarkdownRenderer

| 屬性 | 類型 | 必需 | 默認值 | 說明 |
|------|------|------|--------|------|
| `content` | `string` | 否 | - | 要渲染的 Markdown 內容 |
| `filePath` | `string` | 否 | - | 要讀取的 .md 文件路徑 |
| `className` | `string` | 否 | `''` | 自定義 CSS 類名 |

### MarkdownEditor

| 屬性 | 類型 | 必需 | 默認值 | 說明 |
|------|------|------|--------|------|
| `initialContent` | `string` | 否 | `''` | 初始的 Markdown 內容 |
| `filePath` | `string` | 否 | - | 從文件路徑讀取初始內容 |
| `onSave` | `(content: string) => Promise<void> \| void` | 否 | - | 保存時的回調函數 |
| `onCancel` | `() => void` | 否 | - | 取消編輯時的回調函數 |
| `className` | `string` | 否 | `''` | 自定義 CSS 類名 |
| `readOnly` | `boolean` | 否 | `false` | 是否為只讀模式 |
| `autoSave` | `boolean` | 否 | `false` | 是否啟用自動保存 |
| `autoSaveInterval` | `number` | 否 | `30000` | 自動保存間隔（毫秒） |

## 快捷鍵

在編輯模式下支持以下快捷鍵：

- **Ctrl/Cmd + S**: 保存內容
- **Escape**: 取消編輯並恢復原始內容
- **Tab**: 插入兩個空格（用於縮進）

## 功能詳解

### 實時預覽

- 在寬屏（≥1024px）時，編輯器會自動分屏顯示編輯器和預覽
- 在窄屏時，可以通過按鈕切換編輯和預覽模式
- 預覽會實時更新，反映編輯器中的變更

### 自動保存

- 啟用自動保存後，在指定間隔內如果有未保存的變更會自動觸發保存
- 自動保存狀態會在工具欄中顯示
- 手動保存會重置自動保存計時器

### 全屏模式

- 點擊全屏按鈕可以將編輯器展開到全屏
- 全屏模式下可以更專注地進行編輯
- 再次點擊可以退出全屏模式

### 變更追蹤

- 編輯器會追蹤內容是否有變更
- 有未保存變更時會在工具欄顯示提示
- 保存按鈕只在有變更時才可點擊

## 樣式自定義

組件使用 Tailwind CSS 構建，支持深色模式。你可以通過以下方式自定義樣式：

1. **傳入自定義 className**

```tsx
<MarkdownRenderer 
  content="# Hello" 
  className="my-custom-class" 
/>
```

2. **覆蓋默認樣式**

```css
.markdown-content {
  /* 自定義渲染器樣式 */
}

.markdown-content h1 {
  color: #333;
}
```

## 依賴說明

- **react-markdown**: 核心 Markdown 到 React 組件的轉換
- **remark-gfm**: GitHub Flavored Markdown 支持（表格、任務列表等）
- **rehype-highlight**: 程式碼語法高亮
- **rehype-raw**: 支持 HTML 標籤在 Markdown 中使用
- **highlight.js**: 語法高亮樣式（已包含 GitHub Dark 主題）

## 瀏覽器兼容性

- Chrome/Edge: ✅ 完全支持
- Firefox: ✅ 完全支持  
- Safari: ✅ 完全支持
- 移動端瀏覽器: ✅ 響應式支持

## 示例

查看 `example.tsx` 文件以獲取完整的使用示例，包括：

- 基本渲染器使用
- 完整編輯器功能
- 從文件路徑讀取
- 各種配置選項的演示

## 注意事項

1. 當使用 `filePath` 屬性時，確保文件可以通過 HTTP 請求訪問
2. 自動保存功能需要提供 `onSave` 回調函數
3. 全屏模式使用 `fixed` 定位，確保 z-index 層級正確
4. 組件需要在客戶端環境中運行（使用 `'use client'` 標記）
