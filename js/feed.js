import { NTFY_HOST, STALE_MS } from "./config.js?v=logic1";

function parsePayload(raw) {
  if (raw == null) return null;
  if (typeof raw === "object") return raw;
  const text = String(raw).trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function createFeed(topic, onChange) {
  const seen = new Set();
  const events = [];
  const bots = new Map();
  let usage = null;
  let status = "connecting";
  let lastError = "";
  let es = null;
  let closed = false;

  function emit() {
    onChange(snapshot());
  }

  function applyMessage(evt, silent = false) {
    if (!evt || evt.event && evt.event !== "message") {
      if (evt?.event && evt.event !== "message") return;
    }
    const id = evt.id || `${evt.time}-${evt.message}`;
    if (seen.has(id)) return;
    seen.add(id);

    const payload = parsePayload(evt.message);
    if (!payload || typeof payload !== "object") return;

    const rec = {
      id,
      time: (evt.time || 0) * 1000 || Date.now(),
      payload,
    };
    events.push(rec);

    if (payload.type === "usage") {
      usage = {
        total_used_pct: Number(payload.total_used_pct),
        resets_at: payload.resets_at || "",
        bots: payload.bots && typeof payload.bots === "object" ? payload.bots : {},
        time: rec.time,
      };
      if (!silent) emit();
      return;
    }

    if (typeof payload.bot === "string" && payload.bot && typeof payload.status === "string") {
      bots.set(payload.bot, {
        name: payload.bot,
        status: payload.status,
        step: typeof payload.step === "string" ? payload.step : "",
        time: rec.time,
      });
    }
    if (!silent) emit();
  }

  function visualOf(bot) {
    if (!bot) return { status: "idle", step: "", time: 0, stale: false };
    let statusValue = bot.status;
    let stale = false;
    if (statusValue === "working" && Date.now() - bot.time >= STALE_MS) {
      statusValue = "idle";
      stale = true;
    }
    return { ...bot, status: statusValue, stale };
  }

  function snapshot() {
    const now = Date.now();
    const startOfDay = (() => {
      const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return fmt.format(new Date());
    })();

    let doneCount = 0;
    const doneByBot = {};
    for (const ev of events) {
      const p = ev.payload;
      if (p && p.status === "done" && typeof p.bot === "string") {
        doneCount += 1;
        doneByBot[p.bot] = (doneByBot[p.bot] || 0) + 1;
      }
    }

    const visuals = {};
    let working = 0;
    let waiting = 0;
    let errors = 0;
    for (const [name, bot] of bots) {
      const v = visualOf(bot);
      visuals[name] = v;
      if (v.status === "working") working += 1;
      if (v.status === "waiting_user") waiting += 1;
      if (v.status === "error") errors += 1;
    }

    let system = "待命中";
    let systemKind = "idle";
    if (errors > 0) {
      system = "有异常";
      systemKind = "alert";
    } else if (working > 0 || waiting > 0) {
      system = "忙碌中";
      systemKind = "busy";
    }

    const activity = Object.values(visuals)
      .filter((b) => b.status === "working" || b.status === "waiting_user" || b.status === "error")
      .sort((a, b) => b.time - a.time);

    return {
      topic,
      status,
      lastError,
      usage,
      doneCount,
      doneByBot,
      working,
      waiting,
      errors,
      system,
      systemKind,
      visuals,
      activity,
      dayKey: startOfDay,
      now,
    };
  }

  async function poll() {
    const url = `${NTFY_HOST}/${encodeURIComponent(topic)}/json?poll=1&since=2h`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`poll ${res.status}`);
    const text = await res.text();
    const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    const parsed = [];
    for (const line of lines) {
      try {
        parsed.push(JSON.parse(line));
      } catch {
        /* ignore broken line */
      }
    }
    parsed.sort((a, b) => (a.time || 0) - (b.time || 0));
    for (const msg of parsed) applyMessage(msg, true);
  }

  function openStream() {
    if (es) {
      es.close();
      es = null;
    }
    const url = `${NTFY_HOST}/${encodeURIComponent(topic)}/sse`;
    es = new EventSource(url);
    es.addEventListener("open", () => {
      status = "live";
      lastError = "";
      emit();
    });
    es.addEventListener("message", (ev) => {
      try {
        applyMessage(JSON.parse(ev.data));
      } catch {
        /* ignore */
      }
    });
    es.onerror = () => {
      status = "reconnect";
      emit();
    };
  }

  async function start() {
    try {
      await poll();
      status = "live";
      lastError = "";
      emit();
    } catch (err) {
      status = "error";
      lastError = err instanceof Error ? err.message : String(err);
      emit();
    }
    if (!closed) openStream();
  }

  function stop() {
    closed = true;
    if (es) es.close();
    es = null;
  }

  return { start, stop, snapshot };
}
