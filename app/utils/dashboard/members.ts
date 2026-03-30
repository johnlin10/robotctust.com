import { createClient } from '@/app/utils/supabase/server'
import { MembersOverviewPayload, MemberUserDisplay } from '@/app/types/member-admin'

export async function getMembersOverview(): Promise<MembersOverviewPayload> {
  const supabase = await createClient()

  // 取得所有學期
  const { data: semesters, error: semestersError } = await supabase
    .from('semesters')
    .select('*')
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false })

  if (semestersError) throw semestersError

  // 取得所有學期成員
  const { data: members, error: membersError } = await supabase
    .from('semester_members')
    .select('*')
    .order('created_at', { ascending: false })

  if (membersError) throw membersError

  // 由於在 Supabase schema 中 student_id 的關聯可能未設定明確的外鍵約束，我們手動 Join 資料。
  const studentIds = Array.from(new Set(members.map((m: any) => m.student_id).filter(Boolean)))
  
  let users: any[] = []
  if (studentIds.length > 0) {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, student_id, display_name, username')
      .in('student_id', studentIds)
    
    if (usersError) throw usersError
    users = usersData || []
  }
  
  const userMap = new Map<string, MemberUserDisplay>()
  users.forEach((u) => {
    userMap.set(u.student_id, {
      id: u.id,
      display_name: u.display_name,
      username: u.username,
    })
  })

  const payload: MembersOverviewPayload = {
    semesters: (semesters || []).map((semester: any) => {
      const semesterMembers = members.filter((m: any) => m.semester_id === semester.id)
      return {
        ...semester,
        members: semesterMembers.map((m: any) => ({
          ...m,
          user: userMap.get(m.student_id) || null,
        })),
      }
    }),
  }

  return payload
}

export async function addSemesterMembers(semester_id: string, student_ids: string[]) {
  const supabase = await createClient()
  
  // 清理並去除重複的學號
  const uniqueIds = Array.from(
    new Set(student_ids.map((id) => id.trim()).filter((id) => id.length > 0))
  )

  if (uniqueIds.length === 0) return []

  // 防止重複加入：先取得當前該學期的學號名單
  const { data: existing } = await supabase
    .from('semester_members')
    .select('student_id')
    .eq('semester_id', semester_id)
    .in('student_id', uniqueIds)

  const existingIds = new Set(existing?.map((e: any) => e.student_id) || [])
  const idsToAdd = uniqueIds.filter((id) => !existingIds.has(id))

  if (idsToAdd.length === 0) return []

  const rows = idsToAdd.map((id) => ({
    semester_id,
    student_id: id,
  }))

  const { data, error } = await supabase
    .from('semester_members')
    .insert(rows)
    .select()

  console.log(error)

  if (error) throw error
  return data
}

export async function deleteSemesterMember(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('semester_members')
    .delete()
    .eq('id', id)
    
  if (error) throw error
}
