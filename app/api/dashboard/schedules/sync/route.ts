import { NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { adminDb } from '@/app/utils/firebaseAdmin'
import { requireAdminAccess } from '@/app/utils/auth/admin'
import { ScheduleEvent } from '@/app/types/Schedule'

type EventDateTime = {
  date: string
  time: string
}

function toTimestamp(dateTime: EventDateTime) {
  return Timestamp.fromDate(new Date(`${dateTime.date}T${dateTime.time}:00`))
}

export async function POST(request: Request) {
  const access = await requireAdminAccess({ requireSuperAdmin: true })

  if (access.status !== 'authorized') {
    return NextResponse.json(
      {
        success: 0,
        errors: [
          access.status === 'unauthenticated'
            ? '請先登入後再執行此操作'
            : '只有超級管理員可以同步課程資料',
        ],
      },
      { status: access.status === 'unauthenticated' ? 401 : 403 },
    )
  }

  try {
    const body = await request.json()
    const { events } = body as { events?: ScheduleEvent[] }

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { success: 0, errors: ['Invalid schedules payload'] },
        { status: 400 },
      )
    }

    const existingDocs = await adminDb.collection('schedules').listDocuments()
    const batch = adminDb.batch()

    existingDocs.forEach((docRef) => {
      batch.delete(docRef)
    })

    const errors: string[] = []
    let successCount = 0

    for (const event of events) {
      try {
        const docRef = adminDb.collection('schedules').doc(event.id)
        batch.set(docRef, {
          ...event,
          createdAt: toTimestamp(event.createdAt),
          updatedAt: FieldValue.serverTimestamp(),
          lastModifiedBy: access.user.id,
        })
        successCount++
      } catch (error) {
        console.error(`Error preparing schedule ${event.id}:`, error)
        errors.push(`課程 ${event.title} (${event.id}) 準備失敗`)
      }
    }

    await batch.commit()

    return NextResponse.json({ success: successCount, errors })
  } catch (error: any) {
    console.error('API class schedule sync error:', error)
    return NextResponse.json(
      {
        success: 0,
        errors: ['課程同步執行失敗：' + (error.message || '未知錯誤')],
      },
      { status: 500 },
    )
  }
}
