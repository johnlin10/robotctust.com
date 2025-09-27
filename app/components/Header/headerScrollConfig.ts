/**
 * Header 滾動行為配置
 * 定義滾動觸發的閾值和行為參數
 */
export const HEADER_SCROLL_CONFIG = {
  //* 向下滾動多少像素後觸發縮小狀態
  SCROLL_DOWN_THRESHOLD: 60,

  //* 向上滾動多少像素後取消縮小狀態
  SCROLL_UP_THRESHOLD: 120,

  //* 滾動到頂部多少像素內時強制恢復完整狀態
  TOP_RESTORE_THRESHOLD: 12,

  //* 滾動方向檢測的最小距離
  MIN_SCROLL_DELTA: 5,

  //* 節流延遲（毫秒）
  THROTTLE_DELAY: 16,
} as const

/**
 * 導航自動居中配置
 * 定義導航項目自動居中的行為參數
 */
export const NAV_AUTO_CENTER_CONFIG = {
  //* 滾動停止後自動歸位的延遲時間（毫秒）
  AUTO_CENTER_DELAY: 3000,

  //* 滾動偏移閾值，小於此值不執行居中（像素）
  SCROLL_OFFSET_THRESHOLD: 5,

  //* 點擊後居中的延遲時間（毫秒）
  CLICK_CENTER_DELAY: 250,

  //* 路由變化後居中的延遲時間（毫秒）
  ROUTE_CENTER_DELAY: 200,
} as const

export type HeaderScrollConfig = typeof HEADER_SCROLL_CONFIG
export type NavAutoCenterConfig = typeof NAV_AUTO_CENTER_CONFIG
