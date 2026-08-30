//#region src/index.ts
const name = "skills-inventory";
const inject = [
	"connection",
	"skills",
	"agents"
];
function apply(ctx) {
	const skills = ctx.get("skills");
	const agents = ctx.get("agents");
	const connection = ctx.get("connection");
	if (skills === void 0 || connection === void 0) return;
	const SOURCE_LABEL = {
		"project-dsh": "工作区 · .dsh/skills",
		"project-agents": "工作区 · .agents/skills",
		custom: "自定义目录（preset）",
		"user-dsh": "用户全局 · ~/.dsh/skills",
		"user-agents": "用户全局 · ~/.agents/skills",
		bundled: "内置 · bundled",
		runtime: "运行时 · runtime"
	};
	function resolveAgent(args) {
		if (agents === void 0) return void 0;
		const sid = args && typeof args.sessionId === "string" && args.sessionId.length > 0 ? args.sessionId : void 0;
		if (sid !== void 0) {
			const a = agents.get(sid);
			if (a !== void 0) return a;
		}
		const initiator = agents.currentInitiator();
		if (initiator !== void 0) return initiator;
		const roots = agents.roots();
		if (Array.isArray(roots) && roots.length > 0) return roots[0];
		const all = agents.list();
		if (Array.isArray(all) && all.length > 0) return all[0];
	}
	function optionsFor(args) {
		const agent = resolveAgent(args);
		if (agent !== void 0 && agent.session !== void 0 && agent.session.header !== void 0) return {
			scope: agent,
			cwd: agent.session.header.cwd
		};
		return {};
	}
	function cwdOf(args) {
		const agent = resolveAgent(args);
		if (agent !== void 0 && agent.session !== void 0 && agent.session.header !== void 0) return agent.session.header.cwd;
	}
	function copyResourceBase(rb) {
		if (rb === void 0 || rb === null || typeof rb !== "object") return void 0;
		const out = {};
		let has = false;
		if (typeof rb.kind === "string") {
			out.kind = rb.kind;
			has = true;
		}
		if (typeof rb.path === "string") {
			out.path = rb.path;
			has = true;
		}
		if (typeof rb.url === "string") {
			out.url = rb.url;
			has = true;
		}
		if (typeof rb.description === "string") {
			out.description = rb.description;
			has = true;
		}
		return has ? out : void 0;
	}
	function toSummary(s) {
		const out = {
			name: s.name,
			description: s.description,
			source: s.source,
			sourceLabel: SOURCE_LABEL[s.source] !== void 0 ? SOURCE_LABEL[s.source] : s.source,
			group: s.source === "project-dsh" || s.source === "project-agents" ? "workspace" : "global",
			provider: s.provider,
			modelInvocable: !!(s.invocation && s.invocation.modelInvocable === true),
			userInvocable: !!(s.invocation && s.invocation.userInvocable === true)
		};
		if (typeof s.whenToUse === "string") out.whenToUse = s.whenToUse;
		const rb = copyResourceBase(s.resourceBase);
		if (rb !== void 0) out.resourceBase = rb;
		return out;
	}
	async function handleList(args) {
		const snap = await skills.snapshot(optionsFor(args));
		const list = snap && Array.isArray(snap.skills) ? snap.skills : [];
		const out = {
			complete: !!(snap && snap.complete === true),
			skills: list.map(toSummary)
		};
		const cwd = cwdOf(args);
		if (typeof cwd === "string" && cwd.length > 0) out.cwd = cwd;
		return out;
	}
	async function handleGet(args) {
		const skillName = args && typeof args.name === "string" ? args.name : "";
		if (skillName.length === 0) return null;
		const def = await skills.get(skillName, optionsFor(args));
		if (def === void 0 || def === null) return null;
		const out = {
			name: def.name,
			description: def.description,
			source: def.source,
			sourceLabel: SOURCE_LABEL[def.source] !== void 0 ? SOURCE_LABEL[def.source] : def.source,
			group: def.source === "project-dsh" || def.source === "project-agents" ? "workspace" : "global",
			provider: def.provider,
			content: typeof def.content === "string" ? def.content : ""
		};
		if (typeof def.whenToUse === "string") out.whenToUse = def.whenToUse;
		if (typeof def.path === "string") out.path = def.path;
		const rb = copyResourceBase(def.resourceBase);
		if (rb !== void 0) out.resourceBase = rb;
		return out;
	}
	ctx.effect(() => connection.rpc.handle("/skills-inventory", async (endpoint, payload) => {
		if (endpoint === "list") return {
			ok: true,
			value: await handleList(payload)
		};
		if (endpoint === "get") return {
			ok: true,
			value: await handleGet(payload)
		};
		return {
			ok: false,
			error: {
				code: "bad-request",
				message: `unknown endpoint ${endpoint}`,
				details: { issues: [] }
			}
		};
	}, { authority: "loopback" }), "skills-inventory: rpc");
}
//#endregion
export { apply, inject, name };
