import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './app/utils/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API routes：只刷新 Supabase session，跳過 intl locale routing
  if (pathname.startsWith('/api/')) {
    return await updateSession(request)
  }

  // Geo-detection：對未加 /en 前綴、且沒有語言 cookie 的請求偵測地區
  const hasEnPrefix = pathname === '/en' || pathname.startsWith('/en/')
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value

  if (!hasEnPrefix && !localeCookie) {
    const country = request.headers.get('x-vercel-ip-country')
    let shouldRedirectToEn = false

    if (country) {
      // 生產環境：依 Vercel geo header 判斷
      shouldRedirectToEn = country !== 'TW'
    } else {
      // 開發環境 fallback：依瀏覽器 Accept-Language 判斷
      const acceptLang = request.headers.get('accept-language') ?? ''
      shouldRedirectToEn = !acceptLang.toLowerCase().includes('zh')
    }

    if (shouldRedirectToEn) {
      const url = request.nextUrl.clone()
      url.pathname = pathname === '/' ? '/en' : `/en${pathname}`
      return NextResponse.redirect(url)
    }
  }

  // i18n middleware 處理 locale routing
  const response = intlMiddleware(request)

  // 鏈式執行 Supabase session 更新，將 session cookies 複製到 intl response
  return await updateSession(request, response)
}

export const config = {
  matcher: [
    // 排除 static, image, favicon 等，處理其餘所有路徑（包含 /api/* 以確保 session token 能刷新）
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt|md|json|woff|woff2|ttf|otf|map)$).*)',
  ],
}
