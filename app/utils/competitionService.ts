/**
 * 競賽資料管理服務
 * 提供 Firestore 資料庫操作和資料轉換功能
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import {
  Competition,
  CompetitionDocument,
  CreateCompetitionInput,
  UpdateCompetitionInput,
  CompetitionFilter,
  CompetitionSort,
  CompetitionDateTime,
} from '../types/competition'

//* Firestore 集合名稱
const COLLECTION_NAME = 'competitions'

/**
 * 將日期時間字串轉換為 Firestore Timestamp
 */
function _createTimestamp(dateTime: CompetitionDateTime): CompetitionDateTime {
  if (!dateTime.date || !dateTime.time) {
    return {
      date: dateTime.date,
      time: dateTime.time,
      timestamp: null,
    }
  }

  try {
    const dateTimeString = `${dateTime.date}T${dateTime.time}:00`
    const jsDate = new Date(dateTimeString)
    return {
      date: dateTime.date,
      time: dateTime.time,
      timestamp: Timestamp.fromDate(jsDate),
    }
  } catch {
    console.error('Invalid date/time format:', dateTime)
    return {
      date: dateTime.date,
      time: dateTime.time,
      timestamp: null,
    }
  }
}

/**
 * 將 Competition 轉換為 Firestore 文件格式
 */
function _toFirestoreDocument(competition: Competition): CompetitionDocument {
  return {
    ...competition,
    timeline: competition.timeline.map((step) => ({
      ...step,
      startDateTime: _createTimestamp(step.startDateTime),
      endDateTime: _createTimestamp(step.endDateTime),
    })),
    createdAt:
      _createTimestamp(competition.createdAt).timestamp || Timestamp.now(),
    updatedAt:
      _createTimestamp(competition.updatedAt).timestamp || Timestamp.now(),
  }
}

/**
 * 將 Firestore 文件轉換為 Competition 格式
 */
function _fromFirestoreDocument(doc: DocumentData): Competition {
  const data = doc.data()
  return {
    ...data,
    id: doc.id,
    timeline:
      data.timeline?.map((step: unknown) => {
        const stepData = step as Record<string, unknown>
        const startDateTime = stepData.startDateTime as
          | Record<string, unknown>
          | undefined
        const endDateTime = stepData.endDateTime as
          | Record<string, unknown>
          | undefined

        return {
          ...stepData,
          startDateTime: {
            date: (startDateTime?.date as string | null) || null,
            time: (startDateTime?.time as string | null) || null,
            timestamp: startDateTime?.timestamp,
          },
          endDateTime: {
            date: (endDateTime?.date as string | null) || null,
            time: (endDateTime?.time as string | null) || null,
            timestamp: endDateTime?.timestamp,
          },
        }
      }) || [],
    createdAt: {
      date: data.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] || null,
      time: data.createdAt?.toDate?.()?.toTimeString?.()?.slice(0, 5) || null,
      timestamp: data.createdAt,
    },
    updatedAt: {
      date: data.updatedAt?.toDate?.()?.toISOString?.()?.split('T')[0] || null,
      time: data.updatedAt?.toDate?.()?.toTimeString?.()?.slice(0, 5) || null,
      timestamp: data.updatedAt,
    },
  } as Competition
}

/**
 * 建立查詢條件
 */
function _buildQueryConstraints(
  filter?: CompetitionFilter,
  sort?: CompetitionSort,
  limitCount?: number
): QueryConstraint[] {
  const constraints: QueryConstraint[] = []

  if (filter) {
    // 狀態過濾
    if (filter.status && filter.status.length > 0) {
      constraints.push(where('status', 'in', filter.status))
    }

    // 舉辦層級過濾
    if (filter.position && filter.position.length > 0) {
      constraints.push(where('position', 'in', filter.position))
    }

    // 發布狀態過濾
    if (filter.published !== undefined) {
      constraints.push(where('published', '==', filter.published))
    }

    // 標籤過濾（使用 array-contains-any）
    if (filter.tags && filter.tags.length > 0) {
      constraints.push(where('tags', 'array-contains-any', filter.tags))
    }

    // 日期範圍過濾（需要複合索引）
    if (filter.dateRange) {
      const startTimestamp = Timestamp.fromDate(
        new Date(filter.dateRange.start)
      )
      const endTimestamp = Timestamp.fromDate(new Date(filter.dateRange.end))
      constraints.push(where('createdAt', '>=', startTimestamp))
      constraints.push(where('createdAt', '<=', endTimestamp))
    }
  }

  // 排序
  if (sort) {
    constraints.push(orderBy(sort.field, sort.direction))
  } else {
    // 預設按優先級和建立時間排序
    constraints.push(orderBy('priority', 'asc'))
    constraints.push(orderBy('createdAt', 'desc'))
  }

  // 限制數量
  if (limitCount && limitCount > 0) {
    constraints.push(limit(limitCount))
  }

  return constraints
}

/**
 * 生成唯一 ID
 */
function _generateId(title: string): string {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20)
  return `${slug}-${timestamp}`
}

// === 公開 API ===

/**
 * 取得所有競賽
 */
export async function getAllCompetitions(
  filter?: CompetitionFilter,
  sort?: CompetitionSort,
  limitCount?: number
): Promise<Competition[]> {
  try {
    const constraints = _buildQueryConstraints(filter, sort, limitCount)
    const q = query(collection(db, COLLECTION_NAME), ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(_fromFirestoreDocument)
  } catch (error) {
    console.error('Error fetching competitions:', error)
    throw new Error('無法取得競賽資料')
  }
}

/**
 * 依 ID 取得單一競賽
 */
export async function getCompetitionById(
  id: string
): Promise<Competition | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return _fromFirestoreDocument(docSnap)
    }
    return null
  } catch (error) {
    console.error('Error fetching competition:', error)
    throw new Error('無法取得競賽資料')
  }
}

/**
 * 建立新競賽
 */
export async function createCompetition(
  input: CreateCompetitionInput,
  userId?: string
): Promise<string> {
  try {
    const now = new Date()
    const competition: Competition = {
      id: _generateId(input.title),
      title: input.title,
      description: input.description,
      detailMarkdown: input.detailMarkdown || '',
      position: input.position,
      status: 'draft',
      timeline: input.timeline.map((step, index) => ({
        ...step,
        id: `${step.step}-${Date.now()}-${index}`,
        order: step.order || index + 1,
      })),
      link: input.link || null,
      image: input.image || null,
      tags: input.tags || [],
      priority: input.priority || 999,
      createdAt: {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
      },
      updatedAt: {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
      },
      createdBy: userId,
      updatedBy: userId,
      published: false,
      estimatedParticipants: input.estimatedParticipants,
      registrationFee: input.registrationFee,
      rewards: input.rewards,
      contact: input.contact,
    }

    const docData = _toFirestoreDocument(competition)
    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData)

    return docRef.id
  } catch (error) {
    console.error('Error creating competition:', error)
    throw new Error('無法建立競賽')
  }
}

/**
 * 更新競賽
 */
export async function updateCompetition(
  input: UpdateCompetitionInput,
  userId?: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, input.id)
    const existingDoc = await getDoc(docRef)

    if (!existingDoc.exists()) {
      throw new Error('競賽不存在')
    }

    const updateData: Partial<CompetitionDocument> = {
      ...input,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
      timeline: undefined, // 先設為 undefined，下面會重新賦值
    }

    // 如果更新了 timeline，需要處理時間戳記
    if (input.timeline) {
      updateData.timeline = input.timeline.map((step, index) => ({
        ...step,
        id: `${step.step}-${Date.now()}-${index}`,
        order: step.order || index + 1,
        startDateTime: _createTimestamp(step.startDateTime),
        endDateTime: _createTimestamp(step.endDateTime),
      }))
    }

    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Error updating competition:', error)
    throw new Error('無法更新競賽')
  }
}

/**
 * 刪除競賽
 */
export async function deleteCompetition(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting competition:', error)
    throw new Error('無法刪除競賽')
  }
}

// === 輔助函數 ===

/**
 * 從時間線獲取競賽的具體日期
 * 優先順序：決賽 > 初賽 > 報名截止
 */
const getCompetitionDate = (comp: Competition): Date => {
  const timeline = comp.timeline

  // 尋找決賽
  const finalStep = timeline.find((step) => step.step === 'final')
  if (finalStep?.startDateTime?.date) {
    return new Date(
      `${finalStep.startDateTime.date}T${
        finalStep.startDateTime.time || '00:00'
      }:00`
    )
  }

  // 尋找初賽
  const preStep = timeline.find((step) => step.step === 'pre')
  if (preStep?.startDateTime?.date) {
    return new Date(
      `${preStep.startDateTime.date}T${
        preStep.startDateTime.time || '00:00'
      }:00`
    )
  }

  // 尋找報名
  const regStep = timeline.find((step) => step.step === 'registration')
  if (regStep?.endDateTime?.date) {
    return new Date(
      `${regStep.endDateTime.date}T${regStep.endDateTime.time || '00:00'}:00`
    )
  }

  // 預設為一個很久以前的時間，確保排在最後
  return new Date(0)
}

/**
 * 取得即將開始的競賽
 * 邏輯調整：
 * 1. 獲取所有已發布的競賽
 * 2. 過濾出尚未結束的競賽（基於決賽或初賽日期）
 * 3. 根據日期排序（由近到遠）
 * 4. 取前 N 個
 */
export async function getUpcomingCompetitions(
  limitCount: number = 5
): Promise<Competition[]> {
  try {
    const allCompetitions = await getAllCompetitions({ published: true })

    return allCompetitions
      .filter((comp) => {
        const compDate = getCompetitionDate(comp)
        // 過濾掉已經過去的競賽（日期在今天之前）
        // 設定比較時間為今天的 00:00:00，這樣今天的比賽也會顯示
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return compDate >= today
      })
      .sort((a, b) => {
        const dateA = getCompetitionDate(a)
        const dateB = getCompetitionDate(b)
        // 改為正序排序：日期越近的在越前面
        return dateA.getTime() - dateB.getTime()
      })
      .slice(0, limitCount)
  } catch (error) {
    console.error('Error fetching upcoming competitions:', error)
    return []
  }
}

/**
 * 取得進行中的競賽
 */
export async function getOngoingCompetitions(): Promise<Competition[]> {
  return getAllCompetitions(
    {
      status: ['ongoing'],
      published: true,
    },
    { field: 'priority', direction: 'asc' }
  )
}

/**
 * 依標籤搜尋競賽
 */
export async function searchCompetitionsByTags(
  tags: string[]
): Promise<Competition[]> {
  return getAllCompetitions(
    {
      tags,
      published: true,
    },
    { field: 'createdAt', direction: 'desc' }
  )
}

/**
 * 批量同步競賽資料到 Firestore
 * 用於將本地 Competitions.ts 的資料同步到雲端資料庫
 */
export async function batchSyncCompetitions(
  competitions: Competition[],
  userId?: string
): Promise<{ success: number; errors: string[] }> {
  const batch = writeBatch(db)
  const errors: string[] = []
  let successCount = 0

  try {
    for (const competition of competitions) {
      try {
        // 使用競賽的 ID 作為文件 ID
        const docRef = doc(db, COLLECTION_NAME, competition.id)
        const firestoreDoc = _toFirestoreDocument({
          ...competition,
          updatedBy: userId,
          updatedAt: {
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
          },
        })

        // 使用 set 覆蓋現有文件（如果存在）
        batch.set(docRef, firestoreDoc)
        successCount++
      } catch (error) {
        console.error(`Error preparing competition ${competition.id}:`, error)
        errors.push(`競賽 ${competition.title} (${competition.id}) 準備失敗`)
      }
    }

    // 執行批量寫入
    await batch.commit()

    console.log(`Successfully synced ${successCount} competitions`)
    return { success: successCount, errors }
  } catch (error) {
    console.error('Batch sync failed:', error)
    errors.push('批量同步執行失敗')
    return { success: 0, errors }
  }
}

/**
 * 取得競賽的關鍵日期（用於時間線排序）
 */
export function getCompetitionKeyDate(
  competition: Competition,
  type: 'competition' | 'registration'
): Date | null {
  const timeline = competition.timeline

  if (type === 'competition') {
    // 尋找決賽或初賽的開始時間
    const finalStep = timeline.find((step) => step.step === 'final')
    const preStep = timeline.find((step) => step.step === 'pre')
    const targetStep = finalStep || preStep

    if (targetStep?.startDateTime.date && targetStep?.startDateTime.time) {
      return new Date(
        `${targetStep.startDateTime.date}T${targetStep.startDateTime.time}:00`
      )
    }
  } else if (type === 'registration') {
    // 尋找報名階段的結束時間
    const registrationStep = timeline.find(
      (step) => step.step === 'registration'
    )

    if (
      registrationStep?.endDateTime.date &&
      registrationStep?.endDateTime.time
    ) {
      return new Date(
        `${registrationStep.endDateTime.date}T${registrationStep.endDateTime.time}:00`
      )
    }
  }

  return null
}

/**
 * 根據時間線排序競賽
 */
export function sortCompetitionsByTimeline(
  competitions: Competition[],
  sortBy: 'competition' | 'registration' = 'competition'
): Competition[] {
  return [...competitions].sort((a, b) => {
    const dateA = getCompetitionKeyDate(a, sortBy)
    const dateB = getCompetitionKeyDate(b, sortBy)

    // 沒有日期的放最後
    if (!dateA && !dateB) return 0
    if (!dateA) return 1
    if (!dateB) return -1

    return dateA.getTime() - dateB.getTime()
  })
}
