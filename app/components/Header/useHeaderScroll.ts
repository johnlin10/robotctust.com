'use client'

import { useHeaderScroll as useHeaderScrollContext } from '../../contexts/HeaderContext'

/**
 * Header 滾動狀態管理 Hook (向下相容版本)
 *
 * @deprecated 請直接使用 useHeaderScroll() 或 useHeaderState() from HeaderContext
 * @returns isCompact - Header是否應該處於緊湊模式
 */
export function useHeaderScroll(): boolean {
  return useHeaderScrollContext()
}

// 重新匯出 HeaderContext 的 hooks 以便使用
export {
  useHeaderState,
  useHeaderScroll as useHeaderScrollFromContext,
} from '../../contexts/HeaderContext'
