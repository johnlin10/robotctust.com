import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { ScheduleEvent } from '../types/Schedule'

const COLLECTION_NAME = 'schedules'

/**
 * 將 ScheduleEvent 轉換為 Firestore 格式
 */
function convertToFirestoreFormat(event: ScheduleEvent) {
  return {
    ...event,
    createdAt: Timestamp.fromDate(
      new Date(`${event.createdAt.date}T${event.createdAt.time}:00`)
    ),
    updatedAt: Timestamp.fromDate(
      new Date(`${event.updatedAt.date}T${event.updatedAt.time}:00`)
    ),
  }
}

/**
 * 將 Firestore 格式轉換為 ScheduleEvent
 */
function convertFromFirestoreFormat(doc: {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: () => any
}): ScheduleEvent {
  const data = doc.data()

  return {
    ...data,
    id: doc.id,
    createdAt: {
      date: data.createdAt.toDate().toISOString().split('T')[0],
      time: data.createdAt.toDate().toTimeString().slice(0, 5),
    },
    updatedAt: {
      date: data.updatedAt.toDate().toISOString().split('T')[0],
      time: data.updatedAt.toDate().toTimeString().slice(0, 5),
    },
  } as ScheduleEvent
}

/**
 * 取得所有課程事件
 */
export async function getAllClassEvents(): Promise<ScheduleEvent[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('startDateTime.date', 'asc'),
      orderBy('startDateTime.time', 'asc')
    )

    const querySnapshot = await getDocs(q)
    const events: ScheduleEvent[] = []

    querySnapshot.forEach((doc) => {
      events.push(convertFromFirestoreFormat(doc))
    })

    return events
  } catch (error) {
    console.error('Error getting class events:', error)
    throw new Error('取得課程資料失敗')
  }
}

/**
 * 取得已發布的課程事件
 */
export async function getPublishedClassEvents(): Promise<ScheduleEvent[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('published', '==', true),
      orderBy('startDateTime.date', 'asc'),
      orderBy('startDateTime.time', 'asc')
    )

    const querySnapshot = await getDocs(q)
    const events: ScheduleEvent[] = []

    querySnapshot.forEach((doc) => {
      events.push(convertFromFirestoreFormat(doc))
    })

    return events
  } catch (error) {
    console.error('Error getting published class events:', error)
    throw new Error('取得已發布課程資料失敗')
  }
}

/**
 * 新增或更新課程事件
 */
export async function saveClassEvent(
  event: ScheduleEvent,
  userId: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, event.id)
    const firestoreData = convertToFirestoreFormat({
      ...event,
      updatedAt: {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
      },
    })

    await setDoc(docRef, {
      ...firestoreData,
      lastModifiedBy: userId,
    })
  } catch (error) {
    console.error('Error saving class event:', error)
    throw new Error('儲存課程資料失敗')
  }
}

/**
 * 刪除課程事件
 */
export async function deleteClassEvent(eventId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, eventId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting class event:', error)
    throw new Error('刪除課程資料失敗')
  }
}

/**
 * 批量同步課程事件到 Firestore
 */
export async function batchSyncClassEvents(
  events: ScheduleEvent[],
  userId: string
): Promise<{ success: number; errors: string[] }> {
  const result = {
    success: 0,
    errors: [] as string[],
  }

  for (const event of events) {
    try {
      await saveClassEvent(event, userId)
      result.success++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤'
      result.errors.push(`${event.title}: ${errorMessage}`)
    }
  }

  return result
}

/**
 * 刪除所有課程事件
 */
export async function deleteAllClassEvents(): Promise<void> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))
    const batch = writeBatch(db)

    querySnapshot.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref)
    })

    await batch.commit()
  } catch (error) {
    console.error('Error deleting all class events:', error)
    throw new Error('刪除所有課程資料失敗')
  }
}

/**
 * 強制完全同步課程事件到 Firestore
 * 此函數會先刪除所有現有的課程事件，然後添加新的事件
 */
export async function forceSyncClassEvents(
  events: ScheduleEvent[],
  userId: string
): Promise<{ success: number; errors: string[] }> {
  const result = {
    success: 0,
    errors: [] as string[],
  }

  try {
    // 第一步：刪除所有現有的課程事件
    await deleteAllClassEvents()

    // 第二步：批量添加新的課程事件
    const batch = writeBatch(db)

    for (const event of events) {
      try {
        const docRef = doc(db, COLLECTION_NAME, event.id)
        const firestoreData = convertToFirestoreFormat({
          ...event,
          updatedAt: {
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
          },
        })

        batch.set(docRef, {
          ...firestoreData,
          lastModifiedBy: userId,
        })
        result.success++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知錯誤'
        result.errors.push(`${event.title}: ${errorMessage}`)
      }
    }

    // 執行批量寫入
    await batch.commit()

    return result
  } catch (error) {
    console.error('Error force syncing class events:', error)
    result.errors.push('強制同步執行失敗')
    return { success: 0, errors: result.errors }
  }
}

/**
 * 取得課程統計資訊
 */
export async function getClassEventStatistics() {
  try {
    const events = await getAllClassEvents()

    const stats = {
      total: events.length,
      published: events.filter((e) => e.published).length,
      unpublished: events.filter((e) => e.published === false).length,
      byType: {
        class: events.filter((e) => e.type === 'class').length,
        competition: events.filter((e) => e.type === 'competition').length,
        activity: events.filter((e) => e.type === 'activity').length,
      },
    }

    return stats
  } catch (error) {
    console.error('Error getting class event statistics:', error)
    throw new Error('取得課程統計資料失敗')
  }
}
