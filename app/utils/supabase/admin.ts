import { createClient } from '@supabase/supabase-js'

/**
 * 建立繞過 RLS 的 Supabase admin client（使用 service role key）。
 * 僅限在伺服器端使用，絕對不能暴露於客戶端。
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
