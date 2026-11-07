import { LINKS, formatShanghai, STAFF } from "./config.js?v=fountain1";

export function mountHud(root) {
  root.innerHTML = `
    <div class="hud">
      <div class="hud-row" id="hud-pills"></div>
      <div class="usage-chip" id="usage-chip" hidden></div>
      <div class="now-chip" id="now-chip"></div>
    </div>
    <div class="titlebar">
      <div class="brand">浮岛工作室 · AI 办公室</div>
      <div class="controls">
        <button class="btn" data-mode="auto" type="button">自动</button>
        <button class="btn" data-mode="day" type="button">日间</button>
        <button class="btn" data-mode="night" type="button">夜间</button>
      </div>
      <div class="feed-dot" id="feed-dot"><i></i><span>连接中</span></div>
    </div>
    <nav class="dock" id="dock"></nav>
    <div class="hint">拖拽旋转 · 滚轮 / 双指缩放</div>
  `;

  const dock = root.querySelector("#dock");
  for (const link of LINKS) {
    const a = document.createElement("a");
    a.href = link.href;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = link.label;
    dock.appendChild(a);
  }

  const buttons = [...root.querySelectorAll("[data-mode]")];
  return {
    buttons,
    render(state, modeChoice, resolvedMode) {
      const pills = root.querySelector("#hud-pills");
      const sysClass = state.systemKind === "alert" ? "alert" : state.systemKind === "busy" ? "warn" : "ok";
      pills.innerHTML = `
        <div class="pill"><span class="k">已完成</span><span class="v">${state.doneCount}</span></div>
        <div class="pill"><span class="k">需要处理</span><span class="v">${state.working}</span></div>
        <div class="pill"><span class="k">待你核准</span><span class="v">${state.waiting}</span></div>
        <div class="pill status ${sysClass}"><span class="dot"></span><span class="k">系统状态</span><span class="v plain ${sysClass}">${state.system}</span></div>
      `;

      const usageEl = root.querySelector("#usage-chip");
      if (state.usage && Number.isFinite(state.usage.total_used_pct)) {
        const reset = formatShanghai(state.usage.resets_at);
        usageEl.hidden = false;
        usageEl.innerHTML = `本周额度已用 <strong>${state.usage.total_used_pct}%</strong>${reset ? ` · 重置 ${reset}（上海时间）` : ""}`;
      } else {
        usageEl.hidden = true;
        usageEl.textContent = "";
      }

      const nowEl = root.querySelector("#now-chip");
      if (state.activity.length) {
        nowEl.classList.add("show");
        nowEl.innerHTML = state.activity
          .map((b) => {
            const label = b.status === "waiting_user" ? "待核准" : b.status === "error" ? "异常" : "处理中";
            const step = b.step ? ` · ${escapeHtml(b.step)}` : "";
            return `<div><strong>${escapeHtml(b.name)}</strong> ${label}${step}</div>`;
          })
          .join("");
      } else {
        nowEl.classList.remove("show");
        nowEl.textContent = "";
      }

      const feed = root.querySelector("#feed-dot");
      feed.classList.toggle("live", state.status === "live");
      feed.classList.toggle("err", state.status === "error");
      const feedText =
        state.status === "live"
          ? "状态源已连接"
          : state.status === "error"
            ? `状态源失败${state.lastError ? " · " + state.lastError : ""}`
            : state.status === "reconnect"
              ? "状态源重连中"
              : "正在读取状态源";
      feed.querySelector("span").textContent = feedText;

      for (const btn of buttons) {
        btn.classList.toggle("active", btn.dataset.mode === modeChoice);
      }
    },
    deptCounts(state) {
      const map = {};
      for (const s of STAFF) {
        map[s.dept] = (map[s.dept] || 0) + (state.doneByBot[s.id] || 0);
      }
      return map;
    },
  };
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
