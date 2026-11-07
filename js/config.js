export const DEFAULT_TOPIC = "gbw-HYFDOsZbeHJvrWlqr20nHG";
export const NTFY_HOST = "https://ntfy.sh";
export const STALE_MS = 10 * 60 * 1000;
export const SHANGHAI_TZ = "Asia/Shanghai";

export const LINKS = [
  {
    label: "工作看板",
    href: "https://cursor.com/canvas/store-c1b2adf3-d9e0-4440-8fb6-9114b5270c3c/76e7716c-29f4-4cf7-9e65-d76363981d69",
  },
  {
    label: "公司官网",
    href: "https://cursor.com/canvas/store-c1b2adf3-d9e0-4440-8fb6-9114b5270c3c/e5863f76-ddd2-43f1-b882-a71f6e0de3d7",
  },
  {
    label: "旧 Wallpaper",
    href: "https://bodila51.github.io/grokbot-wallpaper/office/#gbw-HYFDOsZbeHJvrWlqr20nHG",
  },
];

export const STAFF = [
  {
    id: "Grok Bot",
    name: "Grok Bot",
    dept: "总控",
    title: "执行长",
    color: 0x2a4a6e,
    accent: 0xd4b36a,
    skin: 0xf0d0b4,
    hair: 0x1c1a18,
    desk: { x: 0.08, z: -12.18, ry: 0 },
    wait: { x: 1.7, z: -5.65, ry: Math.PI },
    idle: { x: 0.08, z: -12.18, ry: 0 },
    sitIdle: true,
  },
  {
    id: "研究助理",
    name: "研究助理",
    dept: "研究部",
    title: "研究员",
    color: 0x3f6b4e,
    accent: 0xcde4c8,
    skin: 0xe8c4a0,
    hair: 0x2b2118,
    desk: { x: -11.48, z: -9.15, ry: -Math.PI / 2 },
    wait: { x: 0.4, z: -6.2, ry: Math.PI },
    idle: { x: -3.55, z: 9.55, ry: 0.6 },
    sitIdle: true,
  },
  {
    id: "文案写手",
    name: "文案写手",
    dept: "内容部",
    title: "主笔",
    color: 0xb56b45,
    accent: 0xf0d2b0,
    skin: 0xf3d2b6,
    hair: 0x3a2418,
    desk: { x: 13.02, z: -9.2, ry: -Math.PI / 2 },
    wait: { x: 2.85, z: -6.55, ry: Math.PI },
    idle: { x: 2.05, z: 8.2, ry: -0.35 },
    sitIdle: true,
  },
  {
    id: "日程管家",
    name: "日程管家",
    dept: "行政部",
    title: "管家",
    color: 0x4d6f8c,
    accent: 0xd7e4f0,
    skin: 0xefc9a6,
    hair: 0x1a1a1a,
    desk: { x: -11.52, z: 2.35, ry: -Math.PI / 2 },
    wait: { x: -0.7, z: -6.35, ry: Math.PI },
    idle: { x: -3.1, z: 1.8, ry: 0.2 },
    sitIdle: false,
  },
  {
    id: "收件箱清理",
    name: "收件箱清理",
    dept: "运营部",
    title: "运营",
    color: 0x6d4d68,
    accent: 0xedd4e2,
    skin: 0xe7be9a,
    hair: 0x241816,
    desk: { x: 13.22, z: 5.15, ry: -Math.PI / 2 },
    wait: { x: 3.6, z: -5.7, ry: Math.PI },
    idle: { x: 3.45, z: 9.7, ry: -0.7 },
    sitIdle: true,
  },
];

export const DEPT_TAGS = [
  { id: "研究部", label: "研究部", x: -12.2, y: 2.55, z: -8.4 },
  { id: "总控", label: "总裁办公室", x: 0, y: 2.95, z: -11.35 },
  { id: "内容部", label: "内容部", x: 12.2, y: 2.55, z: -8.4 },
  { id: "行政部", label: "行政部", x: -12.2, y: 2.55, z: 3.6 },
  { id: "运营部", label: "运营部", x: 12.2, y: 2.55, z: 4.6 },
];

export function topicFromLocation() {
  const raw = (location.hash || "").replace(/^#/, "").trim();
  if (raw && /^[A-Za-z0-9_-]{8,80}$/.test(raw)) return raw;
  return DEFAULT_TOPIC;
}

export function shanghaiHour() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SHANGHAI_TZ,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  return Number(parts.find((p) => p.type === "hour")?.value ?? "12");
}

export function formatShanghai(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: SHANGHAI_TZ,
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
}

export function detectAutoMode() {
  const h = shanghaiHour();
  return h >= 18 || h < 7 ? "night" : "day";
}

export function modeFromQuery() {
  const q = new URLSearchParams(location.search).get("mode");
  if (q === "day" || q === "night" || q === "auto") return q;
  return "auto";
}
