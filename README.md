# dsh-skills-inventory

DeepSeek Harness（DSH）插件：在**设置页新增一个「Skills」页签**，列出当前工作区与全局的所有技能，点开可查看完整详情（描述、何时使用、来源、提供者、路径、正文）。

## 功能

- 设置页新增 **Skills** 页签（位于 Models 与 Plugins 之间，order 14）
- 按「工作区技能 / 全局技能」分组展示
- 每个技能卡片显示名称、来源徽章、描述
- 点开卡片查看详情：描述 / whenToUse / 来源 / 提供者 / 路径 / 正文
- 一键刷新

## 安装

```bash
# 从 GitHub 安装
dsh plugin --profile web add github:zwfcrazy/dsh-skills-inventory

# 或本地 link 开发
dsh plugin --profile web add link:D:\path\to\dsh-skills-inventory
```

重启 `dsh web`，浏览器 **Ctrl+F5** 强刷。

## 使用

打开 **设置 → Skills**，即可查看技能清单；点任意技能卡片展开详情。

## 兼容性

- 平台：Windows / macOS / Linux（Node >= 22）
- 针对 DSH `0.1.0-rc.8` 实测可用

## License

MIT