import type { Context } from '@deepseek-ai/cordis'

export const name = 'skills-inventory'
export const inject = ['connection', 'skills', 'agents'] as const

export function apply(ctx: Context): void {
  const skills = ctx.get('skills') as any
  const agents = ctx.get('agents') as any
  const connection = ctx.get('connection') as any
  if (skills === undefined || connection === undefined) return

  const SOURCE_LABEL: Record<string, string> = {
    'project-dsh': '工作区 · .dsh/skills',
    'project-agents': '工作区 · .agents/skills',
    custom: '自定义目录（preset）',
    'user-dsh': '用户全局 · ~/.dsh/skills',
    'user-agents': '用户全局 · ~/.agents/skills',
    bundled: '内置 · bundled',
    runtime: '运行时 · runtime',
  }

  function resolveAgent(args: any): any {
    if (agents === undefined) return undefined
    const sid = args && typeof args.sessionId === 'string' && args.sessionId.length > 0 ? args.sessionId : undefined
    if (sid !== undefined) {
      const a = agents.get(sid)
      if (a !== undefined) return a
    }
    const initiator = agents.currentInitiator()
    if (initiator !== undefined) return initiator
    const roots = agents.roots()
    if (Array.isArray(roots) && roots.length > 0) return roots[0]
    const all = agents.list()
    if (Array.isArray(all) && all.length > 0) return all[0]
    return undefined
  }

  function optionsFor(args: any): any {
    const agent = resolveAgent(args)
    if (agent !== undefined && agent.session !== undefined && agent.session.header !== undefined) {
      return { scope: agent, cwd: agent.session.header.cwd }
    }
    return {}
  }

  function cwdOf(args: any): any {
    const agent = resolveAgent(args)
    if (agent !== undefined && agent.session !== undefined && agent.session.header !== undefined) {
      return agent.session.header.cwd
    }
    return undefined
  }

  function copyResourceBase(rb: any): any {
    if (rb === undefined || rb === null || typeof rb !== 'object') return undefined
    const out: any = {}
    let has = false
    if (typeof rb.kind === 'string') { out.kind = rb.kind; has = true }
    if (typeof rb.path === 'string') { out.path = rb.path; has = true }
    if (typeof rb.url === 'string') { out.url = rb.url; has = true }
    if (typeof rb.description === 'string') { out.description = rb.description; has = true }
    return has ? out : undefined
  }

  function toSummary(s: any): any {
    const out: any = {
      name: s.name,
      description: s.description,
      source: s.source,
      sourceLabel: SOURCE_LABEL[s.source] !== undefined ? SOURCE_LABEL[s.source] : s.source,
      group: s.source === 'project-dsh' || s.source === 'project-agents' ? 'workspace' : 'global',
      provider: s.provider,
      modelInvocable: !!(s.invocation && s.invocation.modelInvocable === true),
      userInvocable: !!(s.invocation && s.invocation.userInvocable === true),
    }
    if (typeof s.whenToUse === 'string') out.whenToUse = s.whenToUse
    const rb = copyResourceBase(s.resourceBase)
    if (rb !== undefined) out.resourceBase = rb
    return out
  }

  async function handleList(args: any): Promise<any> {
    const snap = await skills.snapshot(optionsFor(args))
    const list = snap && Array.isArray(snap.skills) ? snap.skills : []
    const out: any = {
      complete: !!(snap && snap.complete === true),
      skills: list.map(toSummary),
    }
    const cwd = cwdOf(args)
    if (typeof cwd === 'string' && cwd.length > 0) out.cwd = cwd
    return out
  }

  async function handleGet(args: any): Promise<any> {
    const skillName = args && typeof args.name === 'string' ? args.name : ''
    if (skillName.length === 0) return null
    const def = await skills.get(skillName, optionsFor(args))
    if (def === undefined || def === null) return null
    const out: any = {
      name: def.name,
      description: def.description,
      source: def.source,
      sourceLabel: SOURCE_LABEL[def.source] !== undefined ? SOURCE_LABEL[def.source] : def.source,
      group: def.source === 'project-dsh' || def.source === 'project-agents' ? 'workspace' : 'global',
      provider: def.provider,
      content: typeof def.content === 'string' ? def.content : '',
    }
    if (typeof def.whenToUse === 'string') out.whenToUse = def.whenToUse
    if (typeof def.path === 'string') out.path = def.path
    const rb = copyResourceBase(def.resourceBase)
    if (rb !== undefined) out.resourceBase = rb
    return out
  }

  ctx.effect(() => connection.rpc.handle('/skills-inventory', async (endpoint: string, payload: unknown) => {
    if (endpoint === 'list') return { ok: true as const, value: await handleList(payload) }
    if (endpoint === 'get') return { ok: true as const, value: await handleGet(payload) }
    return {
      ok: false as const,
      error: { code: 'bad-request' as const, message: `unknown endpoint ${endpoint}`, details: { issues: [] } },
    }
  }, { authority: 'loopback' }), 'skills-inventory: rpc')
}