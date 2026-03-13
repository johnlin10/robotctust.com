import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * [Middleware] 更新 session
 * @param {NextRequest} request - NextRequest 物件
 * @returns {NextResponse} NextResponse 物件
 */
export async function updateSession(request: NextRequest) {
  // 建立 NextResponse 物件
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 建立 Supabase Server Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISH_KEY!,
    {
      cookies: {
        // 獲取所有 cookies
        getAll() {
          return request.cookies.getAll()
        },
        // 設定所有 cookies
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // 取得使用者以重新整理 auth token，並在 session 過期時重新處理
  // 這是一個防止使用者隨機登出的重要安全機制
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return supabaseResponse
}
