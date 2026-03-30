import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'

interface RouteParams {
  params: Promise<{ slug: string }>
}

/**
 * [GET] 獲取當前使用者的課程審核狀態
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { slug: course_id } = await params;
  try {
    const supabase = await createClient()

    // 取得當前登入使用者
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 查詢審核狀態
    const { data, error } = await supabase
      .from('course_verifications')
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching verification status:', error)
      return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
    }

    return NextResponse.json({ verification: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * [POST] 提交課程審核請求
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { slug: course_id } = await params;
  try {
    const supabase = await createClient()

    // 取得當前登入使用者
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 檢查是否已經有進行中的審核
    const { data: existing, error: queryError } = await supabase
      .from('course_verifications')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .in('status', ['pending', 'approved'])
      .maybeSingle()

    if (queryError) {
      console.error('Error checking existing verifications:', queryError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existing) {
      if (existing.status === 'approved') {
        return NextResponse.json({ error: '此課程已通過審核' }, { status: 400 })
      }
      return NextResponse.json({ error: '已有待審核的請求' }, { status: 400 })
    }

    // 新增審核請求
    const { data, error: insertError } = await supabase
      .from('course_verifications')
      .insert({
        user_id: user.id,
        course_id,
        status: 'pending',
      })
      .select('id, status, created_at')
      .single()

    if (insertError) {
      console.error('Error inserting verification:', insertError)
      return NextResponse.json({ error: 'Failed to submit verification' }, { status: 500 })
    }

    return NextResponse.json({ success: true, verification: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
