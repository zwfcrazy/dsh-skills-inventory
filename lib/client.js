window.__ModuleLoader__.load({ id: "dsh-skills-inventory", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let react = require("react");
react = __toESM(react, 1);
//#region src/client/index.ts
const name = "skills-inventory-client";
const inject = ["connection", "slots"];
const CSS = [
	".dsh-skills-page{display:flex;flex-direction:column;gap:16px;padding:4px 0 24px;color:var(--dsw-alias-label-primary)}",
	".dsh-skills-head{display:flex;flex-direction:column;gap:4px}",
	".dsh-skills-title{font-size:16px;font-weight:600}",
	".dsh-skills-sub{font-size:12px;color:var(--dsw-alias-label-secondary)}",
	".dsh-skills-actions{display:flex;gap:8px;margin-top:8px}",
	".dsh-skills-refresh{padding:4px 12px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;font-size:12px}",
	".dsh-skills-error{color:var(--dsw-alias-state-error-primary);font-size:12px}",
	".dsh-skills-group{display:flex;flex-direction:column;gap:8px}",
	".dsh-skills-group-head{display:flex;align-items:baseline;gap:8px}",
	".dsh-skills-group-title{font-size:13px;font-weight:600}",
	".dsh-skills-group-count{font-size:12px;color:var(--dsw-alias-label-secondary)}",
	".dsh-skills-empty{font-size:12px;color:var(--dsw-alias-label-secondary);padding:8px 12px;border:1px dashed var(--dsw-alias-border-l1);border-radius:8px}",
	".dsh-skill-card{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}",
	".dsh-skill-row{display:flex;width:100%;align-items:center;justify-content:space-between;gap:8px;background:none;border:none;padding:10px 12px;cursor:pointer;color:inherit;text-align:left;font:inherit}",
	".dsh-skill-name{font-weight:600;font-size:13px}",
	".dsh-skill-meta{display:flex;align-items:center;gap:6px;flex-shrink:0}",
	".dsh-skill-badge{font-size:11px;padding:2px 6px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1);white-space:nowrap}",
	".dsh-skill-desc{padding:0 12px 10px;font-size:12px;color:var(--dsw-alias-label-secondary)}",
	".dsh-skill-detail{border-top:1px solid var(--dsw-alias-border-l1);padding:10px 12px;background:var(--dsw-alias-bg-layer-2);display:flex;flex-direction:column;gap:6px}",
	".dsh-skill-detail-row{display:flex;gap:8px;font-size:12px}",
	".dsh-skill-detail-label{min-width:72px;color:var(--dsw-alias-label-secondary);font-size:12px;flex-shrink:0}",
	".dsh-skill-detail-value{word-break:break-word}",
	".dsh-skill-content{margin:4px 0 0;padding:10px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:6px;font-size:11.5px;line-height:1.5;white-space:pre-wrap;word-break:break-word;max-height:480px;overflow:auto}"
].join("\n");
function apply(ctx) {
	const slots = ctx.slots;
	const connection = ctx.connection;
	if (slots === void 0 || connection === void 0) return;
	const style = document.createElement("style");
	style.textContent = CSS;
	document.head.appendChild(style);
	ctx.effect(() => () => {
		style.remove();
	}, "skills-inventory: styles");
	function rpcCall(endpoint, payload) {
		return connection.rpc.call("/skills-inventory", endpoint, payload);
	}
	function SkillsSection(props) {
		const useSessions = props.useSessions;
		const [data, setData] = react.default.useState(null);
		const [error, setError] = react.default.useState(null);
		const [loading, setLoading] = react.default.useState(false);
		const [openName, setOpenName] = react.default.useState(null);
		const [detail, setDetail] = react.default.useState(null);
		const [detailName, setDetailName] = react.default.useState(null);
		const current = typeof useSessions === "function" ? useSessions(function(s) {
			return s.current;
		}) : void 0;
		function runRefresh() {
			setLoading(true);
			setError(null);
			rpcCall("list", current !== void 0 ? { sessionId: current } : {}).then(function(res) {
				if (res && res.ok) setData(res.value);
				else setError(res && res.error ? res.error.message : "未知错误");
				setLoading(false);
			}, function(e) {
				setError(String(e && e.message ? e.message : e));
				setLoading(false);
			});
		}
		react.default.useEffect(function() {
			runRefresh();
		}, [current]);
		function toggle(name) {
			if (openName === name) {
				setOpenName(null);
				setDetail(null);
				setDetailName(null);
				return;
			}
			setOpenName(name);
			setDetailName(name);
			setDetail(null);
			const payload = { name };
			if (current !== void 0) payload.sessionId = current;
			rpcCall("get", payload).then(function(res) {
				if (res && res.ok) setDetail(res.value);
				else setDetail({
					name,
					error: res && res.error ? res.error.message : "未知错误"
				});
			}, function(e) {
				setDetail({
					name,
					error: String(e && e.message ? e.message : e)
				});
			});
		}
		const skills = data && Array.isArray(data.skills) ? data.skills : [];
		const complete = !!(data && data.complete === true);
		const cwd = data && typeof data.cwd === "string" ? data.cwd : void 0;
		function renderDetail(d) {
			return react.default.createElement("div", null, react.default.createElement("div", { className: "dsh-skill-detail-row" }, react.default.createElement("div", { className: "dsh-skill-detail-label" }, "描述"), react.default.createElement("div", { className: "dsh-skill-detail-value" }, d.description || "—")), d.whenToUse ? react.default.createElement("div", { className: "dsh-skill-detail-row" }, react.default.createElement("div", { className: "dsh-skill-detail-label" }, "何时使用"), react.default.createElement("div", { className: "dsh-skill-detail-value" }, d.whenToUse)) : null, react.default.createElement("div", { className: "dsh-skill-detail-row" }, react.default.createElement("div", { className: "dsh-skill-detail-label" }, "来源"), react.default.createElement("div", { className: "dsh-skill-detail-value" }, d.source + " · " + d.sourceLabel)), react.default.createElement("div", { className: "dsh-skill-detail-row" }, react.default.createElement("div", { className: "dsh-skill-detail-label" }, "提供者"), react.default.createElement("div", { className: "dsh-skill-detail-value" }, d.provider)), d.path ? react.default.createElement("div", { className: "dsh-skill-detail-row" }, react.default.createElement("div", { className: "dsh-skill-detail-label" }, "路径"), react.default.createElement("div", { className: "dsh-skill-detail-value" }, d.path)) : null, react.default.createElement("div", { className: "dsh-skill-detail-label" }, "正文"), react.default.createElement("pre", { className: "dsh-skill-content" }, d.content || "（空）"));
		}
		function renderCard(s) {
			const isOpen = openName === s.name;
			const d = detailName === s.name ? detail : null;
			return react.default.createElement("div", {
				key: s.name,
				className: "dsh-skill-card"
			}, react.default.createElement("button", {
				type: "button",
				className: "dsh-skill-row",
				onClick: function() {
					toggle(s.name);
				}
			}, react.default.createElement("div", { className: "dsh-skill-name" }, s.name), react.default.createElement("div", { className: "dsh-skill-meta" }, react.default.createElement("span", { className: "dsh-skill-badge" }, s.sourceLabel || s.source))), react.default.createElement("div", { className: "dsh-skill-desc" }, s.description), isOpen ? react.default.createElement("div", { className: "dsh-skill-detail" }, d === null ? react.default.createElement("div", { className: "dsh-skills-empty" }, "加载中…") : d && d.error ? react.default.createElement("div", { className: "dsh-skills-error" }, d.error) : renderDetail(d)) : null);
		}
		function renderGroup(groupKey, title) {
			const list = skills.filter(function(s) {
				return s.group === groupKey;
			});
			return react.default.createElement("div", { className: "dsh-skills-group" }, react.default.createElement("div", { className: "dsh-skills-group-head" }, react.default.createElement("span", { className: "dsh-skills-group-title" }, title), react.default.createElement("span", { className: "dsh-skills-group-count" }, String(list.length) + " 个")), list.length === 0 ? react.default.createElement("div", { className: "dsh-skills-empty" }, "无") : list.map(renderCard));
		}
		return react.default.createElement("div", { className: "dsh-skills-page" }, react.default.createElement("div", { className: "dsh-skills-head" }, react.default.createElement("div", { className: "dsh-skills-title" }, "技能 / Skills"), react.default.createElement("div", { className: "dsh-skills-sub" }, "共 " + skills.length + " 个技能" + (complete ? "" : "（发现未完成）") + (cwd ? " · 工作区: " + cwd : "")), react.default.createElement("div", { className: "dsh-skills-actions" }, react.default.createElement("button", {
			type: "button",
			className: "dsh-skills-refresh",
			onClick: runRefresh
		}, loading ? "加载中…" : "刷新"))), error !== null ? react.default.createElement("div", { className: "dsh-skills-error" }, error) : null, renderGroup("workspace", "工作区技能"), renderGroup("global", "全局技能"));
	}
	slots.inject("settings.section", function() {
		return slots.register({
			name: "settings.section",
			id: "skills",
			order: 14,
			label: "Skills"
		}, function(props) {
			return react.default.createElement(SkillsSection, props);
		});
	});
}
//#endregion
exports.apply = apply;
exports.inject = inject;
exports.name = name;

return module.exports; } });