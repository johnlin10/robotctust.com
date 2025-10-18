# useWebSupport Hook 使用範例

## 基本介紹

`useWebSupport` 是一個用於檢測瀏覽器功能支援的自定義 Hook。它可以檢測各種 Web API 是否可用，並根據檢測結果來決定是否顯示相關功能。

## 使用方式

### 1. 檢測單一功能

```tsx
import useWebSupport from '@/app/hooks/useWebSupport';

function MyComponent() {
  // 檢測是否支援 Web Share API
  const supportsShare = useWebSupport('share');
  
  return (
    <div>
      {supportsShare ? (
        <button onClick={handleShare}>分享</button>
      ) : (
        <button onClick={handleCopyLink}>複製連結</button>
      )}
    </div>
  );
}
```

### 2. 檢測多個功能

```tsx
import useWebSupport from '@/app/hooks/useWebSupport';

function MyComponent() {
  // 同時檢測多個功能
  const supports = useWebSupport(['share', 'clipboard', 'notification']);
  
  return (
    <div>
      {supports.share && <button>分享</button>}
      {supports.clipboard && <button>複製</button>}
      {supports.notification && <button>訂閱通知</button>}
    </div>
  );
}
```

### 3. 條件渲染按鈕組

```tsx
import useWebSupport from '@/app/hooks/useWebSupport';

function ShareButtons() {
  const supportsShare = useWebSupport('share');
  
  const actions = [
    { icon: faLink, label: '複製連結', onClick: handleCopy },
    // 只在支援時加入系統分享按鈕
    ...(supportsShare 
      ? [{ icon: faShare, label: '分享', onClick: handleShare }]
      : []
    ),
  ];
  
  return <ActionBar actions={actions} />;
}
```

## 支援的功能檢測

目前支援以下功能檢測（部分為預留擴展）：

| 功能名稱 | 說明 | 狀態 |
|---------|------|------|
| `share` | Web Share API (navigator.share) | ✅ 已實作 |
| `clipboard` | Clipboard API | 🔄 預留 |
| `notification` | Notification API | 🔄 預留 |
| `geolocation` | Geolocation API | 🔄 預留 |
| `webRTC` | WebRTC | 🔄 預留 |

## 技術細節

### SSR 與 Hydration 支援

Hook 特別設計來避免 Hydration Mismatch 錯誤：

1. **首次渲染**（SSR + 初次客戶端渲染）
   - 始終返回 `false` 或 `{}`
   - 確保伺服器和客戶端的初始 HTML 完全一致

2. **客戶端 mount 後**
   - 透過 `useEffect` 進行實際的功能檢測
   - 更新狀態，觸發重新渲染
   - 此時才顯示依賴瀏覽器功能的 UI 元素

3. **為什麼這樣設計？**
   ```
   SSR 渲染：supportsShare = false → 不渲染分享按鈕
   客戶端初次渲染：supportsShare = false → 不渲染分享按鈕 ✅ 一致
   客戶端 mount 後：supportsShare = true → 渲染分享按鈕 ✅ 正確
   ```

⚠️ **重要提示**：這意味著支援的功能按鈕可能會在頁面載入後才出現（輕微的延遲），這是為了避免 hydration 錯誤的必要權衡。

### 效能最佳化

- 使用 `useState` 初始化為一致的預設值
- 使用 `useEffect` 僅在客戶端執行檢測
- 避免不必要的重複檢測
- 依賴項正確設定，避免無限迴圈

### 錯誤處理

所有檢測都包含 try-catch 錯誤處理，確保即使檢測失敗也不會導致應用崩潰。

## 未來擴展

如需新增更多功能檢測，只需：

1. 在 `WebSupportFeatures` 介面中新增屬性
2. 在 `_detectFeatureSupport` 函數的 switch 中新增對應的檢測邏輯

例如，新增 Service Worker 檢測：

```typescript
interface WebSupportFeatures {
  // ... 現有功能
  serviceWorker: boolean;  // 新增
}

const _detectFeatureSupport = (feature: SupportFeature): boolean => {
  // ...
  case 'serviceWorker':
    return 'serviceWorker' in navigator;
  // ...
}
```

