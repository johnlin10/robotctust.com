import { useState, useEffect } from 'react'

/**
 * 瀏覽器功能支援檢測介面
 */
interface WebSupportFeatures {
  share: boolean // navigator.share API
  clipboard: boolean // Clipboard API (預留)
  notification: boolean // Notification API (預留)
  geolocation: boolean // Geolocation API (預留)
  webRTC: boolean // WebRTC (預留)
}

/**
 * 可檢測的功能類型
 */
export type SupportFeature = keyof WebSupportFeatures

/**
 * 檢測瀏覽器是否支援特定功能
 * @param feature - 要檢測的功能名稱
 * @returns 是否支援該功能
 */
const _detectFeatureSupport = (feature: SupportFeature): boolean => {
  if (typeof window === 'undefined') return false

  try {
    switch (feature) {
      case 'share':
        return (
          typeof navigator !== 'undefined' &&
          typeof navigator.share === 'function'
        )

      case 'clipboard':
        return (
          typeof navigator !== 'undefined' &&
          typeof navigator.clipboard !== 'undefined'
        )

      case 'notification':
        return typeof window.Notification !== 'undefined'

      case 'geolocation':
        return (
          typeof navigator !== 'undefined' &&
          typeof navigator.geolocation !== 'undefined'
        )

      case 'webRTC':
        return (
          typeof window.RTCPeerConnection !== 'undefined' ||
          typeof window.webkitRTCPeerConnection !== 'undefined'
        )

      default:
        return false
    }
  } catch (error) {
    console.error(`檢測 ${feature} 功能時發生錯誤:`, error)
    return false
  }
}

/**
 * 自定義 Hook：檢測瀏覽器功能支援
 *
 * @example
 * ```tsx
 * // 檢測單一功能
 * const supportsShare = useWebSupport('share');
 *
 * // 檢測多個功能
 * const supports = useWebSupport(['share', 'clipboard']);
 * // returns: { share: boolean, clipboard: boolean }
 * ```
 *
 * @param features - 要檢測的功能，可以是單一功能或功能陣列
 * @returns 如果傳入單一功能，返回 boolean；如果傳入陣列，返回物件
 *
 * @note 為避免 Hydration Mismatch，此 Hook 在首次渲染時會返回 false/{}，
 *       然後在客戶端 mount 後才進行實際檢測並更新狀態。
 */
function useWebSupport(feature: SupportFeature): boolean
function useWebSupport(features: SupportFeature[]): Partial<WebSupportFeatures>
function useWebSupport(
  featuresOrFeature: SupportFeature | SupportFeature[]
): boolean | Partial<WebSupportFeatures> {
  // 儲存檢測結果
  const [support, setSupport] = useState<boolean | Partial<WebSupportFeatures>>(
    () => {
      // 初始值始終返回 false/{}，確保 SSR 和首次客戶端渲染一致
      return Array.isArray(featuresOrFeature) ? {} : false
    }
  )

  useEffect(() => {
    // 在客戶端 mount 後執行實際檢測
    if (Array.isArray(featuresOrFeature)) {
      const result: Partial<WebSupportFeatures> = {}
      featuresOrFeature.forEach((feature) => {
        result[feature] = _detectFeatureSupport(feature)
      })
      setSupport(result)
    } else {
      setSupport(_detectFeatureSupport(featuresOrFeature))
    }
  }, [featuresOrFeature])

  return support
}

export default useWebSupport
