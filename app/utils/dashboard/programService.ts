import { createAdminClient } from '@/app/utils/supabase/admin'
import { Program } from '@/app/types/course-admin'

const COLLECTION_NAME = 'programs'

export async function fetchAllPrograms(): Promise<Program[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from(COLLECTION_NAME)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data || []) as Program[]
}

export async function fetchProgramById(id: string): Promise<Program | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from(COLLECTION_NAME)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as Program | null
}

export async function createProgram(input: {
  name: string
  language: string | null
  code_content: string
}): Promise<Program> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from(COLLECTION_NAME)
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Program
}

export async function updateProgram(
  id: string,
  input: {
    name?: string
    language?: string | null
    code_content?: string
  }
): Promise<Program> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from(COLLECTION_NAME)
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Program
}

export async function deleteProgram(id: string): Promise<void> {
  const admin = createAdminClient()
  
  // 檢查是否有課程內容正在使用此程式
  const { count, error: countError } = await admin
    .from('course_contents')
    .select('*', { count: 'exact', head: true })
    .eq('program_id', id)

  if (countError) throw new Error(countError.message)
  if (count && count > 0) {
    throw new Error(`無法刪除：仍有 ${count} 個課程內容區塊正在引用此程式檔案。`)
  }

  const { error } = await admin.from(COLLECTION_NAME).delete().eq('id', id)
  if (error) throw new Error(error.message)
}
