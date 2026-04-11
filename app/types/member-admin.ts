import { Semester } from './course-admin'
import { UserProfile } from './user' // Assuming there is a user.ts with UserProfile. If not, I will define it or use inline types.

export interface SemesterMember {
  id: string
  semester_id: string
  student_id: string
  created_at: string
}

export interface MemberUserDisplay {
  id?: string
  display_name: string | null
  username: string | null
}

export interface MemberWithUser extends SemesterMember {
  user: MemberUserDisplay | null
}

export interface SemesterWithMembers extends Semester {
  members: MemberWithUser[]
}

export interface MembersOverviewPayload {
  semesters: SemesterWithMembers[]
}