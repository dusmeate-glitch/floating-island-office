# 浮岛工作室 · AI 办公室

等距低多边形 3D 办公室静态页，用公开的 ntfy 状态源驱动员工姿态和左上角任务 HUD。视觉参考 chi_cc77 的暖木色玻璃办公室 + 中央全息台，但不是 vibebrick 的像素级复制。

## 本地打开

在本目录启动任意静态服务器（不要直接用 `file://`，否则 ES module 和状态源会受限制）：

```bash
python3 -m http.server 4173
```

然后访问：

- http://127.0.0.1:4173/
- 或带主题：http://127.0.0.1:4173/?mode=day 、 `?mode=night` 、 `?mode=auto`
- 或覆盖状态源主题：http://127.0.0.1:4173/#gbw-HYFDOsZbeHJvrWlqr20nHG

桌面可拖拽旋转、滚轮缩放；手机可拖拽和双指缩放。

默认按 **Asia/Shanghai** 本地小时自动日夜：18:00 之后到次日 07:00 为夜间。右上角可手动切换。

## 状态源做什么

页面会：

1. 读取 `https://ntfy.sh/<topic>/json?poll=1&since=2h` 拉取最近两小时消息
2. 再打开 `https://ntfy.sh/<topic>/sse` 保持更新

它只认已经在用的 JSON：

- `{"bot":"Grok Bot","status":"working|done|idle|waiting_user|error","step":"…"}`
- `{"type":"usage","total_used_pct":8,"resets_at":"…","bots":{…}}`

未知字段会被忽略。没有消息时，五位员工都保持待命/闲逛，HUD 计数为 0，系统状态为「待命中」。页面不会编造机器人状态。

HUD 规则：

- **已完成**：本次打开后，从状态源里数到的 `done` 事件（含最近 2 小时轮询到的真实记录）
- **需要处理**：当前视觉状态为 `working` 的人数
- **待你核准**：当前为 `waiting_user` 的人数
- **系统状态**：有 `error` 则为「有异常」；否则有人在工作或等待核准则为「忙碌中」；否则「待命中」
- 若某位机器人上次是 `working` 且超过 10 分钟没有新消息，画面和 HUD 都按待命处理

固定员工：Grok Bot（总控/执行长）、研究助理、文案写手、日程管家、收件箱清理。

## 关于 topic

地址栏 hash 里的 topic（默认 `gbw-HYFDOsZbeHJvrWlqr20nHG`）相当于「知道链接的人就能读」的公开频道，不是密码保险箱。不要把其它密钥写进这个页面。部署到 GitHub Pages 时，任何人打开该网址都能订阅同一条状态源。

## 目录

- `index.html` / `css/` / `js/`：仓库根目录即发布副本（来自构建产物 `dist/`，Pages 直接从 `/` 提供 `index.html`）
- `js/vendor/`：本地 Three.js，不依赖运行时 CDN
- `screenshots/`：日间 / 夜间截图

## 线上地址

GitHub Pages 根路径：

- https://dusmeate-glitch.github.io/floating-island-office/
- 完整办公室状态源（默认 topic，页面读取 `location.hash`）：https://dusmeate-glitch.github.io/floating-island-office/#gbw-HYFDOsZbeHJvrWlqr20nHG

没有 hash 时，应用仍使用同一默认 topic `gbw-HYFDOsZbeHJvrWlqr20nHG`。
