import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../App.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import Modal from '../components/Modal.jsx'
import MiniAvailabilityBars from '../components/MiniAvailabilityBars.jsx'
import { AvailabilityTrendChart, HourSelector } from '../components/Charts.jsx'
import { RegionTag, RegionTagList } from '../components/Region.jsx'
import {
  formatRelativeTime
} from '../lib/utils'
import {
  parseRegions, getRegionColor, buildRegionsMap,
  UNASSIGNED_REGION
} from '../lib/constants'

function ServiceCard({ service, onClick, selected, regionsMap }) {
  const statusColor = {
    up: '#10b981', down: '#ef4444', maintenance: '#f59e0b', unknown: '#9ca3af'
  }[service.summary?.status] || '#9ca3af'

  const avail = service.summary?.availability ?? 0
  const availColor = avail >= 99 ? '#059669' : avail >= 95 ? '#d97706' : '#dc2626'

  const serviceRegions = parseRegions(service.region)
  const primaryRegionColor = serviceRegions.length > 0
    ? getRegionColor(serviceRegions[0], regionsMap)
    : '#e5e7eb'

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 14, padding: 20,
        border: selected ? `2px solid ${statusColor}` : `2px solid ${primaryRegionColor}40`,
        borderTop: `4px solid ${primaryRegionColor}`,
        boxShadow: selected ? `0 4px 20px ${statusColor}33` : '0 1px 3px rgba(0,0,0,0.06)',
        cursor: 'pointer', transition: 'all 0.2s',
        minWidth: 280, flex: '1 1 320px',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ flex: 1, marginRight: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{service.name}</h3>
          <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
            {service.type.toUpperCase()} · {service.target}{service.type === 'tcp' && service.port ? `:${service.port}` : ''}
          </div>
        </div>
        <StatusBadge status={service.summary?.status} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <RegionTagList regionStr={service.region} regionsMap={regionsMap} size="sm" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div style={{ background: '#f9fafb', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>可用率</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: availColor }}>
            {avail.toFixed(2)}%
          </div>
        </div>
        <div style={{ background: '#f9fafb', padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>平均响应</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#4f46e5' }}>
            {service.summary?.avgResponseTime || 0}ms
          </div>
        </div>
      </div>

      <MiniAvailabilityBars serviceId={service.id} />

      {service.summary?.lastCheck && (
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 10 }}>
          上次检测: {formatRelativeTime(service.summary.lastCheck)}
        </div>
      )}
    </div>
  )
}

function RegionDistributionMap({ regionStats, regionsMap, selectedRegion, onSelectRegion }) {
  const sortedRegions = [...regionStats].sort((a, b) => b.total - a.total)

  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 20,
      border: '1px solid #e5e7eb', marginBottom: 20
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, flexWrap: 'wrap', gap: 12
      }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>地域分布概览</h3>
          <p style={{ fontSize: 13, color: '#6b7280' }}>点击区域可钻取查看该地域的服务列表</p>
        </div>
        {selectedRegion && (
          <button
            onClick={() => onSelectRegion(null)}
            style={{
              padding: '6px 14px', borderRadius: 6,
              background: '#f3f4f6', border: '1px solid #d1d5db',
              color: '#4b5563', cursor: 'pointer', fontSize: 13, fontWeight: 500
            }}
          >
            清除地域筛选
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12
      }}>
        {sortedRegions.map(rs => {
          const color = getRegionColor(rs.name, regionsMap)
          const healthRate = rs.total > 0 ? (rs.up / rs.total) * 100 : 0
          const isSelected = selectedRegion === rs.name
          const hasIssue = rs.down > 0

          return (
            <div
              key={rs.name}
              onClick={() => onSelectRegion(isSelected ? null : rs.name)}
              style={{
                padding: 16, borderRadius: 12,
                background: isSelected ? `${color}15` : '#fafafa',
                border: `2px solid ${isSelected ? color : '#e5e7eb'}`,
                cursor: 'pointer', transition: 'all 0.2s',
                position: 'relative', overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${color}10`
                e.currentTarget.style.borderColor = `${color}60`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isSelected ? `${color}15` : '#fafafa'
                e.currentTarget.style.borderColor = isSelected ? color : '#e5e7eb'
              }}
            >
              {hasIssue && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 0, height: 0,
                  borderTop: '36px solid #ef4444',
                  borderLeft: '36px solid transparent'
                }}>
                  <span style={{
                    position: 'absolute', top: -32, right: 4,
                    color: '#fff', fontSize: 12, fontWeight: 700
                  }}>!</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{
                  width: 12, height: 12, borderRadius: '50%', background: color
                }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{rs.name}</span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>服务数</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1f2937' }}>{rs.total}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>健康率</div>
                  <div style={{
                    fontSize: 22, fontWeight: 800,
                    color: rs.down > 0 ? '#dc2626' : rs.maintenance > 0 ? '#d97706' : '#059669'
                  }}>
                    {healthRate.toFixed(0)}%
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {rs.up > 0 && (
                  <span style={{
                    padding: '2px 8px', fontSize: 11, borderRadius: 999,
                    background: '#d1fae5', color: '#065f46', fontWeight: 600
                  }}>正常 {rs.up}</span>
                )}
                {rs.down > 0 && (
                  <span style={{
                    padding: '2px 8px', fontSize: 11, borderRadius: 999,
                    background: '#fee2e2', color: '#991b1b', fontWeight: 600
                  }}>故障 {rs.down}</span>
                )}
                {rs.maintenance > 0 && (
                  <span style={{
                    padding: '2px 8px', fontSize: 11, borderRadius: 999,
                    background: '#fef3c7', color: '#92400e', fontWeight: 600
                  }}>维护 {rs.maintenance}</span>
                )}
                {rs.unknown > 0 && (
                  <span style={{
                    padding: '2px 8px', fontSize: 11, borderRadius: 999,
                    background: '#f3f4f6', color: '#4b5563', fontWeight: 600
                  }}>未知 {rs.unknown}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RegionFilterBar({ allRegions, regionStats, regionsMap, selectedRegion, onSelectRegion }) {
  const sorted = [...allRegions].sort((a, b) => {
    const sa = regionStats.find(r => r.name === a)?.total || 0
    const sb = regionStats.find(r => r.name === b)?.total || 0
    return sb - sa
  })

  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '12px 16px',
      border: '1px solid #e5e7eb', marginBottom: 16,
      display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center'
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', marginRight: 4 }}>
        地域筛选:
      </span>
      <RegionTag
        name="全部"
        regionsMap={{}}
        active={selectedRegion === null}
        onClick={() => onSelectRegion(null)}
        size="md"
      />
      {sorted.map(r => (
        <RegionTag
          key={r}
          name={r}
          regionsMap={regionsMap}
          active={selectedRegion === r}
          onClick={() => onSelectRegion(selectedRegion === r ? null : r)}
          size="md"
        />
      ))}
    </div>
  )
}

function ServiceDetailPanel({ service, onClose, regionsMap }) {
  const [hours, setHours] = useState(24)
  const [regionHistory, setRegionHistory] = useState([])

  useEffect(() => {
    if (service?.id) {
      fetch(`/api/services/${service.id}/region-history`)
        .then(r => r.json())
        .then(data => setRegionHistory(Array.isArray(data) ? data : []))
        .catch(() => setRegionHistory([]))
    }
  }, [service?.id])

  if (!service) return null

  return (
    <Modal title={`${service.name} - 详情`} onClose={onClose} width={960}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatusBadge status={service.summary?.status} size="lg" />
        <div>
          <div style={{ marginBottom: 6 }}>
            <RegionTagList regionStr={service.region} regionsMap={regionsMap} size="md" />
          </div>
        </div>
        <div style={{ flex: 1 }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 24
      }}>
        <StatBox label="服务类型" value={service.type.toUpperCase()} />
        <StatBox
          label="目标地址"
          value={`${service.target}${service.type === 'tcp' && service.port ? `:${service.port}` : ''}`}
          mono
        />
        <StatBox
          label="检测方法"
          value={service.type === 'tcp' ? 'TCP连接' : `${service.method} ${service.expectedStatus}`}
        />
        <StatBox label="检测间隔" value={`${service.interval_seconds}秒`} />
        <StatBox label="超时时间" value={`${service.timeout_ms}ms`} />
        <StatBox
          label="检测次数"
          value={`${service.summary?.successfulChecks || 0}/${service.summary?.totalChecks || 0}`}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <HourSelector value={hours} onChange={setHours} />
      </div>

      <AvailabilityTrendChart serviceId={service.id} hours={hours} />

      {regionHistory.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>地域变更历史</h4>
          <div style={{
            background: '#f9fafb', borderRadius: 10,
            border: '1px solid #e5e7eb', overflow: 'hidden'
          }}>
            {regionHistory.map((h, idx) => (
              <div key={h.id || idx} style={{
                padding: '12px 16px',
                borderBottom: idx < regionHistory.length - 1 ? '1px solid #e5e7eb' : 'none',
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace', width: 160 }}>
                  {new Date(h.created_at).toLocaleString('zh-CN')}
                </span>
                <span style={{ color: '#6b7280' }}>
                  从
                </span>
                {h.old_region ? (
                  <RegionTagList regionStr={h.old_region} regionsMap={regionsMap} size="sm" />
                ) : (
                  <span style={{ fontSize: 12, color: '#9ca3af', padding: '2px 10px', background: '#f3f4f6', borderRadius: 999 }}>
                    未分配
                  </span>
                )}
                <span style={{ color: '#6b7280' }}>→</span>
                {h.new_region ? (
                  <RegionTagList regionStr={h.new_region} regionsMap={regionsMap} size="sm" />
                ) : (
                  <span style={{ fontSize: 12, color: '#9ca3af', padding: '2px 10px', background: '#f3f4f6', borderRadius: 999 }}>
                    未分配
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {service.summary?.error_message && (
        <div style={{
          marginTop: 16, padding: 12,
          background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca'
        }}>
          <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 600, marginBottom: 4 }}>
            最新错误信息
          </div>
          <div style={{
            fontSize: 13, color: '#7f1d1d',
            fontFamily: 'monospace', wordBreak: 'break-all'
          }}>
            {service.summary.error_message}
          </div>
        </div>
      )}
    </Modal>
  )
}

function StatBox({ label, value, mono }) {
  return (
    <div style={{ background: '#f9fafb', padding: 14, borderRadius: 10 }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{label}</div>
      <div style={{
        fontSize: 15, fontWeight: 600,
        fontFamily: mono ? 'monospace' : 'inherit',
        wordBreak: 'break-all'
      }}>{value}</div>
    </div>
  )
}

export default function StatusPage() {
  const { services, regions, lastUpdate, isConnected, connectionState } = useApp()
  const [selected, setSelected] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)

  const regionsMap = useMemo(() => buildRegionsMap(regions), [regions])

  const regionStats = useMemo(() => {
    const map = new Map()
    for (const svc of services) {
      const rs = parseRegions(svc.region || '')
      const status = svc.summary?.status || 'unknown'
      const keys = rs.length === 0 ? [UNASSIGNED_REGION] : rs
      for (const k of keys) {
        if (!map.has(k)) map.set(k, { name: k, total: 0, up: 0, down: 0, maintenance: 0, unknown: 0 })
        const entry = map.get(k)
        entry.total++
        if (status === 'up') entry.up++
        else if (status === 'down') entry.down++
        else if (status === 'maintenance') entry.maintenance++
        else entry.unknown++
      }
    }
    return [...map.values()]
  }, [services])

  const allRegions = useMemo(() => {
    const set = new Set()
    for (const s of services) {
      const rs = parseRegions(s.region || '')
      if (rs.length === 0) set.add(UNASSIGNED_REGION)
      else rs.forEach(r => set.add(r))
    }
    return [...set]
  }, [services])

  const filteredServices = useMemo(() => {
    if (!selectedRegion) return services
    return services.filter(s => {
      const rs = parseRegions(s.region || '')
      if (selectedRegion === UNASSIGNED_REGION) return rs.length === 0
      return rs.includes(selectedRegion)
    })
  }, [services, selectedRegion])

  const groupedServices = useMemo(() => {
    const groups = new Map()
    for (const svc of filteredServices) {
      const rs = parseRegions(svc.region || '')
      const keys = rs.length === 0 ? [UNASSIGNED_REGION] : rs
      for (const k of keys) {
        if (!groups.has(k)) groups.set(k, [])
        groups.get(k).push(svc)
      }
    }
    return [...groups.entries()].sort((a, b) => {
      const sa = regionStats.find(r => r.name === a[0])?.total || 0
      const sb = regionStats.find(r => r.name === b[0])?.total || 0
      return sb - sa
    })
  }, [filteredServices, regionStats])

  const counts = useMemo(() => {
    let up = 0, down = 0, maint = 0, unk = 0
    for (const s of services) {
      const st = s.summary?.status
      if (st === 'up') up++
      else if (st === 'down') down++
      else if (st === 'maintenance') maint++
      else unk++
    }
    return { up, down, maint, unk, total: services.length }
  }, [services])

  const selectedService = selected ? services.find(s => s.id === selected) : null

  const connBadge = {
    idle: { bg: '#f3f4f6', text: '#6b7280', label: '未连接' },
    connecting: { bg: '#dbeafe', text: '#2563eb', label: '连接中...' },
    reconnecting: { bg: '#fef3c7', text: '#92400e', label: '重连中...' },
    open: { bg: '#d1fae5', text: '#065f46', label: '实时已连接' },
    closed: { bg: '#fee2e2', text: '#991b1b', label: '连接已断开' }
  }[connectionState] || { bg: '#f3f4f6', text: '#6b7280', label: '未知' }

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>服务状态总览</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            共 <b style={{ color: '#1f2937' }}>{counts.total}</b> 个服务
            {counts.down > 0 && <span style={{ color: '#dc2626', marginLeft: 12 }}>· {counts.down} 个故障</span>}
            {counts.maint > 0 && <span style={{ color: '#d97706', marginLeft: 12 }}>· {counts.maint} 个维护中</span>}
            {selectedRegion && (
              <span style={{ color: '#4f46e5', marginLeft: 12 }}>
                · 当前筛选: <b>{selectedRegion}</b> ({filteredServices.length} 个服务)
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
            background: connBadge.bg, color: connBadge.text,
            borderRadius: 999, fontSize: 13, fontWeight: 500
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isConnected ? '#10b981' : '#9ca3af',
              animation: !isConnected ? 'pulse 2s infinite' : 'none'
            }} />
            {connBadge.label}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <CountBadge label="正常" value={counts.up} color="#10b981" />
            <CountBadge label="故障" value={counts.down} color="#ef4444" danger />
            <CountBadge label="维护" value={counts.maint} color="#f59e0b" />
            <CountBadge label="地域" value={regionStats.length} color="#6366f1" />
          </div>
        </div>
      </div>

      {regionStats.length > 0 && (
        <RegionDistributionMap
          regionStats={regionStats}
          regionsMap={regionsMap}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />
      )}

      {allRegions.length > 0 && (
        <RegionFilterBar
          allRegions={allRegions}
          regionStats={regionStats}
          regionsMap={regionsMap}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />
      )}

      {groupedServices.length === 0 && (
        <div style={{
          background: '#fff', borderRadius: 14, padding: 60, textAlign: 'center',
          width: '100%', color: '#6b7280'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#1f2937' }}>
            {selectedRegion ? '该地域暂无监控服务' : '暂无监控服务'}
          </div>
          <div style={{ marginBottom: 20 }}>
            {selectedRegion ? '请选择其他地域或清除筛选' : '请前往「管理配置」页面添加要监控的服务端点'}
          </div>
          {!selectedRegion && (
            <Link to="/admin" style={{
              display: 'inline-block', padding: '10px 20px',
              background: '#6366f1', color: '#fff', borderRadius: 8, fontWeight: 600
            }}>添加服务</Link>
          )}
        </div>
      )}

      {groupedServices.map(([regionName, svcs]) => {
        const color = getRegionColor(regionName, regionsMap)
        return (
          <div key={regionName} style={{ marginBottom: 24 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: 14, paddingBottom: 10,
              borderBottom: `2px solid ${color}30`
            }}>
              <span style={{
                width: 16, height: 16, borderRadius: 4, background: color
              }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
                {regionName}
              </h3>
              <span style={{
                fontSize: 13, color: '#6b7280',
                background: '#f3f4f6', padding: '2px 10px', borderRadius: 999, fontWeight: 600
              }}>
                {svcs.length} 个服务
              </span>
              {(() => {
                const down = svcs.filter(s => s.summary?.status === 'down').length
                if (down > 0) return (
                  <span style={{
                    fontSize: 12, color: '#991b1b',
                    background: '#fee2e2', padding: '2px 10px', borderRadius: 999, fontWeight: 600
                  }}>
                    {down} 个故障
                  </span>
                )
                return null
              })()}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {svcs.map(svc => (
                <ServiceCard
                  key={svc.id}
                  service={svc}
                  selected={selected === svc.id}
                  onClick={() => setSelected(selected === svc.id ? null : svc.id)}
                  regionsMap={regionsMap}
                />
              ))}
            </div>
          </div>
        )
      })}

      {selectedService && (
        <ServiceDetailPanel
          service={selectedService}
          onClose={() => setSelected(null)}
          regionsMap={regionsMap}
        />
      )}

      {lastUpdate && (
        <div style={{ textAlign: 'center', marginTop: 32, color: '#9ca3af', fontSize: 12 }}>
          数据更新于 {new Date(lastUpdate).toLocaleString('zh-CN')} · 状态变化实时推送
        </div>
      )}
    </div>
  )
}

function CountBadge({ label, value, color, danger }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 16px', background: '#fff',
      borderRadius: 10, border: '1px solid #e5e7eb'
    }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
      <div>
        <div style={{ fontSize: 10, color: '#6b7280' }}>{label}</div>
        <div style={{ fontWeight: 700, color: danger ? '#dc2626' : '#1f2937' }}>{value}</div>
      </div>
    </div>
  )
}
