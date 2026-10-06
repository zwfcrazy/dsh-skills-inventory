import React from 'react'

export const name = 'skills-inventory-client'
export const inject = ['connection', 'slots'] as const

const CSS = [
  '.dsh-skills-page{display:flex;flex-direction:column;gap:16px;padding:4px 0 24px;color:var(--dsw-alias-label-primary)}',
  '.dsh-skills-head{display:flex;flex-direction:column;gap:4px}',
  '.dsh-skills-title{font-size:16px;font-weight:600}',
  '.dsh-skills-sub{font-size:12px;color:var(--dsw-alias-label-secondary)}',
  '.dsh-skills-actions{display:flex;gap:8px;margin-top:8px}',
  '.dsh-skills-refresh{padding:4px 12px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;font-size:12px}',
  '.dsh-skills-error{color:var(--dsw-alias-state-error-primary);font-size:12px}',
  '.dsh-skills-group{display:flex;flex-direction:column;gap:8px}',
  '.dsh-skills-group-head{display:flex;align-items:baseline;gap:8px}',
  '.dsh-skills-group-title{font-size:13px;font-weight:600}',
  '.dsh-skills-group-count{font-size:12px;color:var(--dsw-alias-label-secondary)}',
  '.dsh-skills-empty{font-size:12px;color:var(--dsw-alias-label-secondary);padding:8px 12px;border:1px dashed var(--dsw-alias-border-l1);border-radius:8px}',
  '.dsh-skill-card{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}',
  '.dsh-skill-row{display:flex;width:100%;align-items:center;justify-content:space-between;gap:8px;background:none;border:none;padding:10px 12px;cursor:pointer;color:inherit;text-align:left;font:inherit}',
  '.dsh-skill-name{font-weight:600;font-size:13px}',
  '.dsh-skill-meta{display:flex;align-items:center;gap:6px;flex-shrink:0}',
  '.dsh-skill-badge{font-size:11px;padding:2px 6px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1);white-space:nowrap}',
  '.dsh-skill-desc{padding:0 12px 10px;font-size:12px;color:var(--dsw-alias-label-secondary)}',
  '.dsh-skill-detail{border-top:1px solid var(--dsw-alias-border-l1);padding:10px 12px;background:var(--dsw-alias-bg-layer-2);display:flex;flex-direction:column;gap:6px}',
  '.dsh-skill-detail-row{display:flex;gap:8px;font-size:12px}',
  '.dsh-skill-detail-label{min-width:72px;color:var(--dsw-alias-label-secondary);font-size:12px;flex-shrink:0}',
  '.dsh-skill-detail-value{word-break:break-word}',
  '.dsh-skill-content{margin:4px 0 0;padding:10px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:6px;font-size:11.5px;line-height:1.5;white-space:pre-wrap;word-break:break-word;max-height:480px;overflow:auto}',
].join('\n')

export function apply(ctx: any): void {
  const slots = ctx.slots
  const connection = ctx.connection
  if (slots === undefined || connection === undefined) return

  const style = document.createElement('style')
  style.textContent = CSS
  document.head.appendChild(style)
  ctx.effect(() => () => { style.remove() }, 'skills-inventory: styles')

  function rpcCall(endpoint: string, payload: any): Promise<any> {
    return connection.rpc.call('/skills-inventory', endpoint, payload)
  }

  function SkillsSection(props: any) {
    const useSessions = props.useSessions
    const [data, setData] = React.useState(null)
    const [error, setError] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [openName, setOpenName] = React.useState(null)
    const [detail, setDetail] = React.useState(null)
    const [detailName, setDetailName] = React.useState(null)

    const current = typeof useSessions === 'function' ? useSessions(function (s) { return s.current }) : undefined

    function runRefresh() {
      setLoading(true)
      setError(null)
      const payload = current !== undefined ? { sessionId: current } : {}
      rpcCall('list', payload).then(function (res) {
        if (res && res.ok) setData(res.value)
        else setError(res && res.error ? res.error.message : '未知错误')
        setLoading(false)
      }, function (e) {
        setError(String(e && e.message ? e.message : e))
        setLoading(false)
      })
    }

    React.useEffect(function () {
      runRefresh()
    }, [current])

    function toggle(name) {
      if (openName === name) {
        setOpenName(null)
        setDetail(null)
        setDetailName(null)
        return
      }
      setOpenName(name)
      setDetailName(name)
      setDetail(null)
      const payload = { name: name }
      if (current !== undefined) payload.sessionId = current
      rpcCall('get', payload).then(function (res) {
        if (res && res.ok) setDetail(res.value)
        else setDetail({ name: name, error: res && res.error ? res.error.message : '未知错误' })
      }, function (e) {
        setDetail({ name: name, error: String(e && e.message ? e.message : e) })
      })
    }

    const skills = data && Array.isArray(data.skills) ? data.skills : []
    const complete = !!(data && data.complete === true)
    const cwd = data && typeof data.cwd === 'string' ? data.cwd : undefined

    function renderDetail(d) {
      return React.createElement('div', null,
        React.createElement('div', { className: 'dsh-skill-detail-row' },
          React.createElement('div', { className: 'dsh-skill-detail-label' }, '描述'),
          React.createElement('div', { className: 'dsh-skill-detail-value' }, d.description || '—')),
        d.whenToUse ? React.createElement('div', { className: 'dsh-skill-detail-row' },
          React.createElement('div', { className: 'dsh-skill-detail-label' }, '何时使用'),
          React.createElement('div', { className: 'dsh-skill-detail-value' }, d.whenToUse)) : null,
        React.createElement('div', { className: 'dsh-skill-detail-row' },
          React.createElement('div', { className: 'dsh-skill-detail-label' }, '来源'),
          React.createElement('div', { className: 'dsh-skill-detail-value' }, d.source + ' · ' + d.sourceLabel)),
        React.createElement('div', { className: 'dsh-skill-detail-row' },
          React.createElement('div', { className: 'dsh-skill-detail-label' }, '提供者'),
          React.createElement('div', { className: 'dsh-skill-detail-value' }, d.provider)),
        d.path ? React.createElement('div', { className: 'dsh-skill-detail-row' },
          React.createElement('div', { className: 'dsh-skill-detail-label' }, '路径'),
          React.createElement('div', { className: 'dsh-skill-detail-value' }, d.path)) : null,
        React.createElement('div', { className: 'dsh-skill-detail-label' }, '正文'),
        React.createElement('pre', { className: 'dsh-skill-content' }, d.content || '（空）'),
      )
    }

    function renderCard(s) {
      const isOpen = openName === s.name
      const d = detailName === s.name ? detail : null
      return React.createElement('div', { key: s.name, className: 'dsh-skill-card' },
        React.createElement('button', { type: 'button', className: 'dsh-skill-row', onClick: function () { toggle(s.name) } },
          React.createElement('div', { className: 'dsh-skill-name' }, s.name),
          React.createElement('div', { className: 'dsh-skill-meta' },
            React.createElement('span', { className: 'dsh-skill-badge' }, s.sourceLabel || s.source),
          ),
        ),
        React.createElement('div', { className: 'dsh-skill-desc' }, s.description),
        isOpen ? React.createElement('div', { className: 'dsh-skill-detail' },
          d === null ? React.createElement('div', { className: 'dsh-skills-empty' }, '加载中…')
            : (d && d.error) ? React.createElement('div', { className: 'dsh-skills-error' }, d.error)
            : renderDetail(d),
        ) : null,
      )
    }

    function renderGroup(groupKey, title) {
      const list = skills.filter(function (s) { return s.group === groupKey })
      return React.createElement('div', { className: 'dsh-skills-group' },
        React.createElement('div', { className: 'dsh-skills-group-head' },
          React.createElement('span', { className: 'dsh-skills-group-title' }, title),
          React.createElement('span', { className: 'dsh-skills-group-count' }, String(list.length) + ' 个'),
        ),
        list.length === 0
          ? React.createElement('div', { className: 'dsh-skills-empty' }, '无')
          : list.map(renderCard),
      )
    }

    return React.createElement('div', { className: 'dsh-skills-page' },
      React.createElement('div', { className: 'dsh-skills-head' },
        React.createElement('div', { className: 'dsh-skills-title' }, '技能 / Skills'),
        React.createElement('div', { className: 'dsh-skills-sub' },
          '共 ' + skills.length + ' 个技能' + (complete ? '' : '（发现未完成）') + (cwd ? ' · 工作区: ' + cwd : '')),
        React.createElement('div', { className: 'dsh-skills-actions' },
          React.createElement('button', { type: 'button', className: 'dsh-skills-refresh', onClick: runRefresh }, loading ? '加载中…' : '刷新'),
        ),
      ),
      error !== null ? React.createElement('div', { className: 'dsh-skills-error' }, error) : null,
      renderGroup('workspace', '工作区技能'),
      renderGroup('global', '全局技能'),
    )
  }

  slots.inject('settings.section', function () {
    return slots.register(
      { name: 'settings.section', id: 'skills', order: 14, label: 'Skills' },
      function (props) { return React.createElement(SkillsSection, props) },
    )
  })
}