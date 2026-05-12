# May 12 Thu
## 在 Claude Code 执行的时候，让一旁的 App 联动有哪些办法？

### [x] 方法一：共享状态文件 + 文件监听（推荐，最简单）

Skill 在每个贝叶斯更新步骤后，把当前概率状态写入一个 JSON 文件：

```json
// /tmp/bayes_state.json
{
  "step": 3,
  "evidence": "观众参与制造记忆点",
  "hypotheses": [
    { "name": "H₁ Live Demo", "prior": 0.514, "posterior": 0.581 },
    { "name": "H₂ Web App PPT", "prior": 0.121, "posterior": 0.055 }
  ]
}
```

可视化 App 用 `fs.watch` / `chokidar` 监听文件变化，通过 WebSocket 或 SSE 推送到前端，概率条实时动画更新。

优点：零耦合，Skill 只需一行写文件；App 崩了不影响 Claude Code 继续运行。

### 方法二：Claude Code Hooks（最原生，无需修改 Skill）

在 `.claude/settings.json` 配置 `PostToolUse` hook，每次 Skill 写文件后自动触发脚本：

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write",
      "hooks": [{ "type": "command", "command": "node scripts/push_to_app.js" }]
    }]
  }
}
```

不需要改 Skill 代码，由 Claude Code 基础设施负责联动。

### 方法三：MCP 工具（最灵活）

可视化 App 暴露本地 MCP server，提供 `update_visualization` 工具。Skill 在每次更新后主动调用该工具传入结构化数据，Claude Code 通过 MCP 协议直接与 App 通信，无需文件中转。

### Demo 场景结论

Hackathon 现场选**方法一**：30 分钟内可实现，容错性最好。App 挂了直接退回终端输出，不影响 Live Demo 主流程，契合"mistakes embraced as part of the art"的回退预案。

## Sharing the status with file, and App listens to them
### should we duplicated a dedicated demo skill then? yes

是的，Demo 场景下复制一份 demo-skill 是最合理的选择。

| 方案 | 稳定性 | 代码洁净度 |
|------|--------|----------|
| 改原版 Skill，直接写 JSON | 最稳 | 原版被污染 |
| **复制 demo-skill，直接写 JSON** | **最稳** | **原版干净** |
| Hook 拦截 + 脚本推送 | 链路长，有额外失败点 | 原版干净 |

Hook 方案的问题：Skill → Write 工具 → Hook 脚本 → App → WebSocket → 前端，链路比方法一更长，Hook 脚本挂了行为不确定（可能报错、可能阻塞），Demo 现场排查成本高。

**结论**：复制出 demo-skill，改动只有一处——每次概率更新后加一行写 JSON 文件。逻辑极简单，原版 Skill 保持不动，Demo 稳定性最优。