import { UserProfile, UserRole } from '@/app/types/user'

export const SUPER_ADMIN_ROLE: UserRole = 'super_admin'

export const ADMIN_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'admin_course',
  'admin_achievement',
  'admin_verifications',
  'admin_news',
]

export function isAdminRole(roles?: UserRole[] | null): boolean {
  if (!roles || !Array.isArray(roles)) return false
  return roles.some((r) => ADMIN_ROLES.includes(r))
}

export function isSuperAdminRole(roles?: UserRole[] | null): boolean {
  if (!roles || !Array.isArray(roles)) return false
  return roles.includes(SUPER_ADMIN_ROLE)
}
