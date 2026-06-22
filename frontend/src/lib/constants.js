export const SERVICE_STATUS = Object.freeze({
  UP: 'up',
  DOWN: 'down',
  MAINTENANCE: 'maintenance',
  UNKNOWN: 'unknown'
})

export const SERVICE_TYPES = Object.freeze({
  HTTP: 'http',
  HTTPS: 'https',
  TCP: 'tcp'
})

export const STATUS_STYLES = Object.freeze({
  [SERVICE_STATUS.UP]: { bg: '#d1fae5', text: '#065f46', dot: '#10b981', label: '正常运行' },
  [SERVICE_STATUS.DOWN]: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', label: '服务故障' },
  [SERVICE_STATUS.MAINTENANCE]: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', label: '维护中' },
  [SERVICE_STATUS.UNKNOWN]: { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af', label: '未知' }
})

export const WS_MESSAGE_TYPES = Object.freeze({
  HELLO: 'hello',
  STATUS_CHANGE: 'status_change',
  NEW_CHECK: 'new_check',
  MAINTENANCE_CHANGE: 'maintenance_change',
  SERVICE_UPDATE: 'service_update',
  SERVICE_DELETED: 'service_deleted'
})

export const AVAILABILITY_COLORS = Object.freeze({
  GOOD: '#10b981',
  WARN: '#f59e0b',
  BAD: '#ef4444',
  NONE: '#e5e7eb'
})

export const REGION_COLOR_PALETTE = Object.freeze([
  '#ef4444', '#f59e0b', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#6366f1', '#4f46e5', '#7c3aed', '#6d28d9', '#0ea5e9',
  '#84cc16', '#eab308', '#f97316', '#06b6d4', '#6b7280'
])

export const UNASSIGNED_REGION = '未分配'
export const DEFAULT_REGION_COLOR = '#6b7280'

export function getAvailabilityColor(availability, hasData = true) {
  if (!hasData) return AVAILABILITY_COLORS.NONE
  if (availability >= 99) return AVAILABILITY_COLORS.GOOD
  if (availability >= 80) return AVAILABILITY_COLORS.WARN
  return AVAILABILITY_COLORS.BAD
}

export function parseRegions(regionStr) {
  if (!regionStr) return []
  return regionStr.split(',').map(r => r.trim()).filter(Boolean)
}

export function serializeRegions(regions) {
  if (!regions || regions.length === 0) return ''
  return regions.map(r => r.trim()).filter(Boolean).join(',')
}

export function getRegionColor(regionName, regionsMap = {}) {
  if (!regionName) return DEFAULT_REGION_COLOR
  const found = regionsMap[regionName]
  if (found && found.color) return found.color
  const idx = Math.abs(hashCode(regionName)) % REGION_COLOR_PALETTE.length
  return REGION_COLOR_PALETTE[idx]
}

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash
}

export function buildRegionsMap(regions) {
  const map = {}
  for (const r of regions || []) {
    map[r.name] = r
  }
  return map
}
