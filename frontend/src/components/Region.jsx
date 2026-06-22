import React, { useState, useRef, useEffect } from 'react'
import { getRegionColor, parseRegions, serializeRegions, UNASSIGNED_REGION, REGION_COLOR_PALETTE } from '../lib/constants'

export function RegionTag({ name, regionsMap = {}, onClick, active, size = 'sm' }) {
  if (!name) return null
  const color = getRegionColor(name, regionsMap)
  const sizes = {
    sm: { padding: '2px 10px', fontSize: 11 },
    md: { padding: '4px 14px', fontSize: 13 },
    lg: { padding: '6px 18px', fontSize: 14 }
  }
  const s = sizes[size] || sizes.sm

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        ...s,
        borderRadius: 999,
        background: active ? color : `${color}15`,
        color: active ? '#fff' : color,
        border: `1px solid ${color}`,
        fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s',
        marginRight: 4,
        marginBottom: 4
      }}
    >
      <span style={{
        width: size === 'sm' ? 6 : 8,
        height: size === 'sm' ? 6 : 8,
        borderRadius: '50%',
        background: active ? '#fff' : color
      }} />
      {name}
    </span>
  )
}

export function RegionTagList({ regionStr, regionsMap = {}, onClick, activeRegion, size = 'sm' }) {
  const regions = parseRegions(regionStr)
  if (regions.length === 0) {
    return (
      <RegionTag
        name={UNASSIGNED_REGION}
        regionsMap={regionsMap}
        onClick={onClick}
        active={activeRegion === UNASSIGNED_REGION}
        size={size}
      />
    )
  }
  return (
    <>
      {regions.map(r => (
        <RegionTag
          key={r}
          name={r}
          regionsMap={regionsMap}
          onClick={onClick}
          active={activeRegion === r}
          size={size}
        />
      ))}
    </>
  )
}

export function RegionSelect({
  value, onChange, regions = [], allowCustom = true,
  placeholder = '选择地域（可多选）', regionsMap = {}
}) {
  const [open, setOpen] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [customColor, setCustomColor] = useState(REGION_COLOR_PALETTE[0])
  const containerRef = useRef(null)
  const selected = parseRegions(value)

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (name) => {
    const idx = selected.indexOf(name)
    let next
    if (idx >= 0) {
      next = [...selected]
      next.splice(idx, 1)
    } else {
      next = [...selected, name]
    }
    onChange(serializeRegions(next))
  }

  const remove = (name, e) => {
    e.stopPropagation()
    const idx = selected.indexOf(name)
    if (idx < 0) return
    const next = [...selected]
    next.splice(idx, 1)
    onChange(serializeRegions(next))
  }

  const addCustom = async () => {
    const name = customInput.trim()
    if (!name) return
    if (selected.includes(name)) {
      setCustomInput('')
      setShowCustom(false)
      return
    }
    try {
      const existing = regions.find(r => r.name === name)
      if (!existing) {
        const res = await fetch('/api/regions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, color: customColor })
        })
        if (!res.ok) throw new Error('创建失败')
      }
      const next = [...selected, name]
      onChange(serializeRegions(next))
      setCustomInput('')
      setShowCustom(false)
    } catch (e) {
      alert(e.message || '添加自定义地域失败')
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          minHeight: 42, padding: '6px 32px 6px 10px',
          borderRadius: 8, border: '1px solid #d1d5db',
          background: '#fff', cursor: 'pointer',
          fontSize: 14, position: 'relative'
        }}
      >
        {selected.length === 0 ? (
          <span style={{ color: '#9ca3af' }}>{placeholder}</span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {selected.map(r => (
              <span
                key={r}
                onClick={(e) => remove(r, e)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '2px 8px', fontSize: 12, borderRadius: 999,
                  background: `${getRegionColor(r, regionsMap)}20`,
                  color: getRegionColor(r, regionsMap),
                  border: `1px solid ${getRegionColor(r, regionsMap)}40`,
                  fontWeight: 500, marginRight: 4, marginBottom: 2
                }}
              >
                {r}
                <span style={{ fontSize: 14, fontWeight: 700 }}>×</span>
              </span>
            ))}
          </div>
        )}
        <span style={{
          position: 'absolute', right: 12, top: '50%',
          transform: `translateY(-50%) rotate(${open ? '180deg' : '0deg'})`,
          transition: 'transform 0.2s', color: '#9ca3af', fontSize: 14
        }}>▼</span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          marginTop: 4, background: '#fff', borderRadius: 10,
          border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 100, maxHeight: 300, overflow: 'auto'
        }}>
          {regions.map(r => {
            const checked = selected.includes(r.name)
            return (
              <div
                key={r.id || r.name}
                onClick={() => toggle(r.name)}
                style={{
                  padding: '10px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: checked ? `${r.color}10` : 'transparent',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = checked ? `${r.color}15` : '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = checked ? `${r.color}10` : 'transparent'}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: checked ? `2px solid ${r.color}` : '2px solid #d1d5db',
                  background: checked ? r.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 700
                }}>
                  {checked && '✓'}
                </div>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: r.color
                }} />
                <span style={{ flex: 1, fontSize: 14 }}>{r.name}</span>
                {r.is_custom && (
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 4,
                    background: '#f3f4f6', color: '#6b7280'
                  }}>自定义</span>
                )}
              </div>
            )
          })}

          {allowCustom && (
            <div style={{ borderTop: '1px solid #e5e7eb' }}>
              {!showCustom ? (
                <div
                  onClick={() => setShowCustom(true)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    color: '#4f46e5', fontWeight: 600, fontSize: 14,
                    display: 'flex', alignItems: 'center', gap: 8
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 16 }}>+</span> 添加自定义地域
                </div>
              ) : (
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      placeholder="输入地域名称"
                      style={{
                        flex: 1, padding: '8px 10px', borderRadius: 6,
                        border: '1px solid #d1d5db', fontSize: 13, outline: 'none'
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); addCustom() }
                        if (e.key === 'Escape') setShowCustom(false)
                      }}
                      autoFocus
                    />
                    <button
                      onClick={addCustom}
                      style={{
                        padding: '8px 14px', borderRadius: 6,
                        background: '#6366f1', color: '#fff',
                        border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13
                      }}
                    >添加</button>
                    <button
                      onClick={() => { setShowCustom(false); setCustomInput('') }}
                      style={{
                        padding: '8px 12px', borderRadius: 6,
                        background: '#f3f4f6', color: '#4b5563',
                        border: 'none', cursor: 'pointer', fontSize: 13
                      }}
                    >取消</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>颜色:</span>
                    {REGION_COLOR_PALETTE.slice(0, 10).map(c => (
                      <button
                        key={c}
                        onClick={() => setCustomColor(c)}
                        style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: c, border: customColor === c ? '2px solid #1f2937' : '2px solid transparent',
                          cursor: 'pointer', padding: 0
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
