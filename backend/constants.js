const SERVICE_STATUS = Object.freeze({
  UP: 'up',
  DOWN: 'down',
  MAINTENANCE: 'maintenance',
  UNKNOWN: 'unknown'
})

const SERVICE_TYPES = Object.freeze({
  HTTP: 'http',
  HTTPS: 'https',
  TCP: 'tcp'
})

const STATUS_STYLES = Object.freeze({
  [SERVICE_STATUS.UP]: { bg: '#d1fae5', text: '#065f46', dot: '#10b981', label: '正常运行' },
  [SERVICE_STATUS.DOWN]: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', label: '服务故障' },
  [SERVICE_STATUS.MAINTENANCE]: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', label: '维护中' },
  [SERVICE_STATUS.UNKNOWN]: { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af', label: '未知' }
})

const DEFAULT_REGIONS = Object.freeze([
  { name: '北京机房', color: '#ef4444' },
  { name: '上海机房', color: '#f59e0b' },
  { name: '广州机房', color: '#10b981' },
  { name: '深圳机房', color: '#14b8a6' },
  { name: '成都机房', color: '#06b6d4' },
  { name: '香港机房', color: '#3b82f6' },
  { name: '上海阿里云', color: '#8b5cf6' },
  { name: '杭州阿里云', color: '#a855f7' },
  { name: '北京腾讯云', color: '#ec4899' },
  { name: '广州腾讯云', color: '#f43f5e' },
  { name: '美国 AWS', color: '#6366f1' },
  { name: '新加坡 AWS', color: '#4f46e5' },
  { name: '日本 AWS', color: '#7c3aed' },
  { name: '欧洲 AWS', color: '#6d28d9' },
  { name: '其他', color: '#6b7280' }
])

const REGION_COLORS = Object.freeze([
  '#ef4444', '#f59e0b', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#6366f1', '#4f46e5', '#7c3aed', '#6d28d9', '#0ea5e9',
  '#84cc16', '#eab308', '#f97316', '#06b6d4', '#6b7280'
])

const WS_MESSAGE_TYPES = Object.freeze({
  HELLO: 'hello',
  STATUS_CHANGE: 'status_change',
  NEW_CHECK: 'new_check',
  MAINTENANCE_CHANGE: 'maintenance_change',
  SERVICE_UPDATE: 'service_update',
  SERVICE_DELETED: 'service_deleted'
})

const DEFAULT_CONFIG = Object.freeze({
  MIN_INTERVAL_SECONDS: 5,
  DEFAULT_INTERVAL_SECONDS: 30,
  DEFAULT_TIMEOUT_MS: 5000,
  DEFAULT_EXPECTED_STATUS: 200,
  DEFAULT_METHOD: 'GET',
  DEFAULT_DATA_RETENTION_DAYS: 30,
  DEFAULT_TREND_WINDOW_HOURS: 24,
  MAX_SLOTS: 96,
  MIN_SLOT_MINUTES: 5
})

const ERROR_MESSAGES = Object.freeze({
  TCP_NO_PORT: 'TCP target requires a valid port number',
  TCP_INVALID_PORT: 'TCP port must be an integer between 1 and 65535',
  INVALID_SERVICE_TYPE: 'type must be http, https, or tcp',
  MISSING_REQUIRED_FIELDS: 'name, type, target are required'
})

module.exports = {
  SERVICE_STATUS,
  SERVICE_TYPES,
  STATUS_STYLES,
  DEFAULT_REGIONS,
  REGION_COLORS,
  WS_MESSAGE_TYPES,
  DEFAULT_CONFIG,
  ERROR_MESSAGES
}
