# Aside 元件

通用側邊欄元件，支援導覽列與任意自訂內容，內建手機版 drawer 與桌面版 sticky 行為。

---

## 檔案結構

```
app/components/Aside/
├── Aside.tsx          # 主元件與 TypeScript 介面
├── AsideContext.tsx   # open/close 狀態管理（Context + Provider + hook）
├── Aside.module.scss  # 樣式（響應式、sticky、mobile drawer）
└── index.ts           # 統一 re-export
```

---

## 快速開始

### 導覽列模式

傳入 `items` 陣列即可渲染導覽列：

```tsx
import { Aside } from '@/app/components/Aside'
import { faHome } from '@fortawesome/free-solid-svg-icons'
;<Aside
  header={{ title: '管理後台', subtitle: '管理員' }}
  items={[
    { href: '/dashboard', label: '總覽', icon: faHome, exact: true },
    { href: '/dashboard/users', label: '使用者管理' },
  ]}
/>
```

### 自訂內容模式

傳入 `children` 渲染任意內容：

```tsx
<Aside header={{ title: '課程目錄' }}>
  <MyCustomNavTree />
</Aside>
```

### 混合模式

`items` 與 `children` 可同時使用，nav 在上、children 在下：

```tsx
<Aside header={{ title: '學習工坊' }} items={quickLinks}>
  <DetailedTreeNav />
</Aside>
```

---

## Props

### `AsideProps`

| Prop        | 型別                | 預設值 | 說明                                                      |
| ----------- | ------------------- | ------ | --------------------------------------------------------- |
| `header`    | `AsideHeaderConfig` | —      | 側邊欄標頭設定                                            |
| `items`     | `AsideNavItem[]`    | `[]`   | 導覽項目，有值才渲染 nav                                  |
| `children`  | `ReactNode`         | —      | 自訂內容，渲染於 nav 之後                                 |
| `className` | `string`            | `''`   | 附加到 `<aside>` 的 class                                 |
| `topOffset` | `number`            | `72`   | sticky 偵測的 top 偏移量，需與 CSS `--header-height` 一致 |

### `AsideHeaderConfig`

| 欄位       | 型別                              | 說明                          |
| ---------- | --------------------------------- | ----------------------------- |
| `title`    | `string`                          | 主標題（`<h1>`）              |
| `subtitle` | `string`                          | 副標題（灰色小字）            |
| `hide`     | `boolean`                         | `true` 時隱藏整個 header 區塊 |
| `backLink` | `{ label: string; href: string }` | 標頭上方的返回連結            |

### `AsideNavItem`

| 欄位    | 型別                     | 預設    | 說明                                                                |
| ------- | ------------------------ | ------- | ------------------------------------------------------------------- |
| `href`  | `string`                 | —       | 連結路徑                                                            |
| `label` | `string`                 | —       | 顯示文字                                                            |
| `icon`  | `IconDefinition \| null` | —       | FontAwesome icon（選填）                                            |
| `exact` | `boolean`                | `false` | `true` 使用 `pathname === href` 精確匹配；`false` 使用 `startsWith` |

> **`exact` 使用時機**：根路由（`/dashboard`、`/courses`）需設為 `true`，否則所有子路由都會觸發 active 狀態。子路由不需設定（預設 `startsWith` 即可）。

---

## 狀態管理

### `AsideContext`

元件需要被 `AsideProvider` 包覆才能運作。`Page` 元件已內建 `AsideProvider`，一般情況下不需手動加。

```tsx
// Page.tsx 已自動包覆
<AsideProvider>
  <div>...</div>
</AsideProvider>
```

若需要在 `Page` 以外的元件（例如 FAB 按鈕）控制開關，可將 `AsideProvider` 提升到 layout 層級：

```tsx
// layout.tsx
import { AsideProvider } from '@/app/components/Aside'

export default function Layout({ children, aside }) {
  return (
    <AsideProvider>
      {aside}
      {children}
    </AsideProvider>
  )
}
```

### `useAside()` Hook

```tsx
import { useAside } from '@/app/components/Aside'

const { isOpen, setIsOpen, toggleAside } = useAside()
```

| 回傳值        | 型別                   | 說明                                  |
| ------------- | ---------------------- | ------------------------------------- |
| `isOpen`      | `boolean`              | 目前是否展開（手機版）                |
| `setIsOpen`   | `(v: boolean) => void` | 直接設定狀態                          |
| `toggleAside` | `() => void`           | 切換開關（穩定引用，可安全傳入 deps） |

---

## 響應式行為

| 裝置            | 行為                                                                 |
| --------------- | -------------------------------------------------------------------- |
| 桌面（≥ 860px） | `position: sticky`，固定在頁面左側，跟隨捲動                         |
| 手機（< 860px） | `position: fixed` drawer，從左側滑入。點擊 toggle 按鈕或背景遮罩關閉 |

手機版 toggle 按鈕附加在側邊欄右側（`aria-expanded` / `aria-controls` 完整）。

---

## 與 Next.js Parallel Routes 整合

Dashboard 使用 `@aside` slot 依路由注入不同側邊欄，無需條件判斷：

```
app/[locale]/dashboard/
├── layout.tsx              # 接收 aside slot，傳入 <Page aside={aside}>
└── @aside/
    ├── default.tsx         # /dashboard 預設 sidebar
    ├── courses/
    │   └── default.tsx     # /dashboard/courses 的 sidebar
    └── verifications/
        └── default.tsx     # /dashboard/verifications 的 sidebar
```

每個 slot 都是 Server Component，直接 return `<Aside>`（Client Component），符合 Next.js RSC 規範。

---

## 新增一個 @aside slot

1. 在 `app/[locale]/dashboard/@aside/` 建立新資料夾（名稱對應路由段）
2. 加入 `default.tsx`，直接 return `<Aside>`
3. Next.js 自動根據目前路徑選用對應 slot

```tsx
// app/[locale]/dashboard/@aside/reports/default.tsx
import { Aside } from '@/app/components/Aside'
import { faChartBar } from '@fortawesome/free-solid-svg-icons'

export default function ReportsAsideSlot() {
  return (
    <Aside
      header={{
        title: '報表中心',
        backLink: { href: '/dashboard', label: '返回模組總覽' },
      }}
      items={[
        {
          href: '/dashboard/reports',
          label: '總覽',
          exact: true,
          icon: faChartBar,
        },
        { href: '/dashboard/reports/monthly', label: '月報表' },
      ]}
    />
  )
}
```
