import { ClubIdentity, SchoolIdentity, UserProfile } from '@/app/types/user'

type OnboardingProfileLike = {
  email?: string | null
  username?: string | null
  displayName?: string | null
  display_name?: string | null
  studentId?: string | null
  student_id?: string | null
  schoolIdentity?: SchoolIdentity | null
  school_identity?: SchoolIdentity | null
  clubIdentity?: ClubIdentity | null
  club_identity?: ClubIdentity | null
}

export function sanitizeUsernameCandidate(value?: string | null): string {
  if (!value) return ''

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function deriveDefaultUsername(profile: {
  username?: string | null
  email?: string | null
  fullName?: string | null
}): string {
  const fromUsername = sanitizeUsernameCandidate(profile.username)
  if (fromUsername) return fromUsername

  const fromFullName = sanitizeUsernameCandidate(profile.fullName)
  if (fromFullName) return fromFullName

  const emailPrefix = profile.email?.split('@')[0] ?? ''
  return sanitizeUsernameCandidate(emailPrefix) || 'member'
}

export function isUserOnboardingComplete(
  profile?: OnboardingProfileLike | UserProfile | null,
): boolean {
  if (!profile) return false

  const normalizedProfile = profile as OnboardingProfileLike
  const username = normalizedProfile.username?.trim()
  const displayName =
    normalizedProfile.displayName?.trim() ||
    normalizedProfile.display_name?.trim()
  const schoolIdentity =
    normalizedProfile.schoolIdentity || normalizedProfile.school_identity
  const clubIdentity =
    normalizedProfile.clubIdentity || normalizedProfile.club_identity
  const studentId =
    normalizedProfile.studentId?.trim() || normalizedProfile.student_id?.trim()

  if (!username || !displayName || !schoolIdentity || !clubIdentity) {
    return false
  }

  if (schoolIdentity === 'current_student' && !studentId) {
    return false
  }

  return true
}
