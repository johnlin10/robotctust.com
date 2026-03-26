import { Role } from '@/app/types/dashboard'
import { UserRole } from '@/app/types/user'

export const SUPER_ADMIN_ROLE: UserRole = 'super_admin'

export const ADMIN_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'admin_course',
  'admin_achievement',
  'admin_verifications',
  'admin_news',
]

const ROLE_PRIORITY: Role[] = [
  'super_admin',
  'admin',
  'admin_course',
  'admin_achievement',
  'admin_verifications',
  'admin_news',
  'member',
]

export function isAdminRole(roles?: UserRole[] | null): boolean {
  if (!roles || !Array.isArray(roles)) return false
  return roles.some((r) => ADMIN_ROLES.includes(r))
}

export function isSuperAdminRole(roles?: UserRole[] | null): boolean {
  if (!roles || !Array.isArray(roles)) return false
  return roles.includes(SUPER_ADMIN_ROLE)
}

export function resolvePrimaryRole(roles?: UserRole[] | null): Role {
  if (!roles || !Array.isArray(roles)) return 'member'

  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) {
      return role
    }
  }

  return 'member'
}
