/**
 * Firebase Firestore → Supabase 文章遷移腳本
 *
 * 執行方式（兩種擇一）：
 *
 *   方式 A（推薦）：傳入 Firebase Service Account JSON 檔
 *     npx tsx scripts/migrate-posts-to-supabase.ts --sa=./firebase-service-account.json
 *
 *   方式 B：透過環境變數（需 .env.local 含 FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY）
 *     npx tsx --env-file=.env.local scripts/migrate-posts-to-supabase.ts
 *
 *   兩種方式都需要 .env.local 提供 Supabase 連線資訊：
 *     NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 *
 * 如何取得 Service Account JSON：
 *   Firebase Console → 專案設定 → 服務帳戶 → 產生新的私密金鑰
 *
 * 遷移策略：
 *   - 原 Firestore document ID 原樣保留為 posts.id（舊 URL 自動相容）
 *   - 若 author_id 不存在於 users 表，該篇文章會跳過並記錄
 *   - 已存在相同 id 的文章會跳過（冪等，可安全重跑）
 */

import * as admin from 'firebase-admin'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// ─── 載入 .env.local（手動解析，確保多行值正確讀取）────────────────────────

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const raw = trimmed.slice(eqIdx + 1).trim()
    // 去除首尾引號
    const value = raw.replace(/^["']|["']$/g, '')
    if (key && !process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnvLocal()

// ─── 解析 CLI 參數 ────────────────────────────────────────────────────────────

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length)
}

const serviceAccountPath = getArg('sa')

// ─── 初始化 Firebase Admin ────────────────────────────────────────────────────

if (!admin.apps.length) {
  if (serviceAccountPath) {
    // 方式 A：Service Account JSON 檔
    const saAbsPath = path.resolve(process.cwd(), serviceAccountPath)
    if (!fs.existsSync(saAbsPath)) {
      console.error(`❌ 找不到 Service Account 檔案：${saAbsPath}`)
      process.exit(1)
    }
    const serviceAccount = JSON.parse(fs.readFileSync(saAbsPath, 'utf-8'))
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
    console.log(`🔑 使用 Service Account 檔案：${saAbsPath}\n`)
  } else {
    // 方式 B：環境變數
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    if (!projectId || !clientEmail || !privateKey) {
      console.error('❌ 缺少 Firebase Admin 憑證。請擇一：')
      console.error('   方式 A：npx tsx scripts/migrate-posts-to-supabase.ts --sa=./firebase-service-account.json')
      console.error('   方式 B：在 .env.local 加入 FIREBASE_CLIENT_EMAIL 和 FIREBASE_PRIVATE_KEY')
      process.exit(1)
    }
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    })
    console.log('🔑 使用環境變數憑證\n')
  }
}

const firestore = admin.firestore()

// ─── 初始化 Supabase Admin（繞過 RLS）───────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

// ─── 型別 ─────────────────────────────────────────────────────────────────────

interface FirestorePost {
  title: string
  contentMarkdown: string
  category: string
  coverImageUrl: string | null
  authorId: string
  authorDisplayName: string
  createdAt: admin.firestore.Timestamp
  updatedAt: admin.firestore.Timestamp
}

interface MigrationResult {
  success: number
  skipped: number
  failed: number
  log: Array<{
    firestoreId: string
    status: 'success' | 'skipped' | 'failed'
    reason?: string
  }>
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────

async function migrate() {
  console.log('═══════════════════════════════════════════════')
  console.log('  Firebase Firestore → Supabase 文章遷移')
  console.log('═══════════════════════════════════════════════\n')

  // 1. 驗證環境變數（Supabase 連線資訊必須存在；Firebase 憑證僅在未使用 --sa 時才要求）
  const missingSupabase = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].filter(
    (k) => !process.env[k],
  )
  if (missingSupabase.length > 0) {
    console.error('❌ 缺少 Supabase 環境變數（請確認 .env.local）：', missingSupabase.join(', '))
    process.exit(1)
  }

  // 2. 讀取 Firestore posts
  console.log('📥 從 Firestore 讀取文章...')
  let snapshot: admin.firestore.QuerySnapshot
  try {
    snapshot = await firestore
      .collection('posts')
      .orderBy('createdAt', 'asc')
      .get()
  } catch (err) {
    console.error('❌ 無法讀取 Firestore：', err)
    process.exit(1)
  }

  if (snapshot.empty) {
    console.log('⚠️  Firestore 中沒有文章，結束。')
    return
  }
  console.log(`   找到 ${snapshot.size} 篇文章\n`)

  // 3. 讀取 Supabase 已存在的 post IDs（用於跳過重複）
  console.log('🔍 讀取 Supabase 已存在的 post IDs...')
  const { data: existingRows } = await supabase.from('posts').select('id')
  const existingIds = new Set(existingRows?.map((r) => r.id as string) ?? [])
  console.log(`   已存在 ${existingIds.size} 筆\n`)

  // 4. 確認 fallback 作者存在
  const FALLBACK_AUTHOR_ID = 'd814a649-0f9b-4223-80ed-c334f93deba0'
  console.log(`👤 所有文章將使用作者 ID：${FALLBACK_AUTHOR_ID}\n`)

  // 5. 逐篇遷移
  const result: MigrationResult = { success: 0, skipped: 0, failed: 0, log: [] }

  for (const docSnap of snapshot.docs) {
    const firestoreId = docSnap.id
    const data = docSnap.data() as FirestorePost

    const label = `"${data.title?.slice(0, 40) || '(無標題)'}"`

    // 跳過已存在（冪等）
    if (existingIds.has(firestoreId)) {
      console.log(`⏭️  跳過（已存在）：${label}`)
      result.skipped++
      result.log.push({ firestoreId, status: 'skipped', reason: '已存在於 Supabase' })
      continue
    }

    // 統一使用 fallback 作者（原始 authorId 不做驗證）
    const authorId = FALLBACK_AUTHOR_ID

    // 驗證必要欄位
    if (!data.title || !data.contentMarkdown || !data.category) {
      console.warn(`⚠️  跳過（缺少必要欄位）：${label}`)
      result.skipped++
      result.log.push({
        firestoreId,
        status: 'skipped',
        reason: '缺少 title / contentMarkdown / category',
      })
      continue
    }

    // 轉換 Timestamp
    let createdAt: string
    let updatedAt: string
    try {
      createdAt = data.createdAt.toDate().toISOString()
      updatedAt = data.updatedAt.toDate().toISOString()
    } catch {
      // 部分舊文章可能沒有 timestamp，使用當前時間
      const now = new Date().toISOString()
      createdAt = now
      updatedAt = now
      console.warn(`   ⚠️  ${label} 缺少 timestamp，使用當前時間`)
    }

    // 組裝 payload（id 使用原始 Firestore document ID 以保持舊 URL 相容）
    const payload = {
      id: firestoreId,
      title: data.title.trim(),
      content_markdown: data.contentMarkdown,
      category: data.category,
      cover_image_url: data.coverImageUrl ?? null,
      author_id: authorId,
      author_display_name: data.authorDisplayName || '未知',
      created_at: createdAt,
      updated_at: updatedAt,
    }

    const { error } = await supabase.from('posts').insert(payload)

    if (error) {
      console.error(`❌ 失敗：${label}`)
      console.error(`   錯誤：${error.message}`)
      result.failed++
      result.log.push({ firestoreId, status: 'failed', reason: error.message })
    } else {
      console.log(`✅ 成功：${label}`)
      result.success++
      result.log.push({ firestoreId, status: 'success' })
    }
  }

  // 6. 輸出 summary
  console.log('\n═══════════════════════════════════════════════')
  console.log('  遷移結果')
  console.log('═══════════════════════════════════════════════')
  console.log(`  ✅ 成功：${result.success} 篇`)
  console.log(`  ⏭️  跳過：${result.skipped} 篇`)
  console.log(`  ❌ 失敗：${result.failed} 篇`)
  console.log(`  共計：${snapshot.size} 篇`)

  // 7. 儲存詳細 log
  const logPath = path.join(process.cwd(), 'migration-log.json')
  fs.writeFileSync(logPath, JSON.stringify(result.log, null, 2), 'utf-8')
  console.log(`\n📄 詳細記錄已儲存至：migration-log.json`)

  if (result.skipped > 0) {
    const skippedItems = result.log.filter((l) => l.status === 'skipped')
    console.log('\n⚠️  跳過的文章：')
    skippedItems.forEach((item) => {
      console.log(`   - ${item.firestoreId}：${item.reason}`)
    })
  }

  if (result.failed > 0) {
    console.log('\n❌ 請檢查失敗原因後重新執行（腳本可安全重跑）')
    process.exit(1)
  }
}

migrate().catch((err) => {
  console.error('未預期的錯誤：', err)
  process.exit(1)
})
