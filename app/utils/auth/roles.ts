import {
  DashboardModule,
  MODULE_PERMISSIONS_MAP,
  Role,
} from '@/app/types/dashboard'
import { UserRole } from '@/app/types/user'

export const SUPER_ADMIN_ROLE: UserRole = 'super_admin'

export const ADMIN_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'admin_course',
  'admin_achievement',
  'admin_verifications',
  'admin_news',
  'admin_accounts',
]

const ROLE_PRIORITY: Role[] = [
  'super_admin',
  'admin',
  'admin_course',
  'admin_achievement',
  'admin_verifications',
  'admin_news',
  'admin_accounts',
  'member',
]

export function normalizeRoles(roles?: UserRole[] | null): UserRole[] {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return ['member']
  }

  const uniqueRoles = new Set<UserRole>()
  for (const role of roles) {
    if (ROLE_PRIORITY.includes(role as Role)) {
      uniqueRoles.add(role)
    }
  }

  if (uniqueRoles.size === 0) {
    return ['member']
  }

  return ROLE_PRIORITY.filter((role) => uniqueRoles.has(role as UserRole))
}

export function isAdminRole(roles?: UserRole[] | null): boolean {
  return normalizeRoles(roles).some((role) => ADMIN_ROLES.includes(role))
}

export function isSuperAdminRole(roles?: UserRole[] | null): boolean {
  return normalizeRoles(roles).includes(SUPER_ADMIN_ROLE)
}

export function resolvePrimaryRole(roles?: UserRole[] | null): Role {
  return normalizeRoles(roles)[0] as Role
}

export function getModulesForRoles(
  roles?: UserRole[] | null,
): DashboardModule[] {
  const modules = new Set<DashboardModule>()

  for (const role of normalizeRoles(roles)) {
    for (const module of MODULE_PERMISSIONS_MAP[role as Role] || []) {
      modules.add(module)
    }
  }

  return Array.from(modules)
}

export function canAccessModuleByRoles(
  roles: UserRole[] | null | undefined,
  module: DashboardModule,
): boolean {
  return getModulesForRoles(roles).includes(module)
}
