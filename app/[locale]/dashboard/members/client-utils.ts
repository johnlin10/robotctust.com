import { MembersOverviewPayload } from '@/app/types/member-admin'

export async function requestJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options)

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    throw new Error(
      payload?.error || `請求失敗 (HTTP ${response.status})`,
    )
  }

  return payload as T
}

export async function fetchMembersOverview(): Promise<MembersOverviewPayload> {
  return requestJson<MembersOverviewPayload>('/api/dashboard/members')
}
