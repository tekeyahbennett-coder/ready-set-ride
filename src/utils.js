// ─── Formatting / Helper Utilities ─────────────────────────────────────────────
export function fmt$(n) { return `$${n.toFixed(2)}`; }

export function fmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sc = (s % 60).toString().padStart(2, "0");
  return `${m}:${sc}`;
}

export function fmtDuration(s) {
  const m = Math.floor(s / 60), sc = s % 60;
  return m > 0 ? `${m}m ${sc}s` : `${sc}s`;
}

export function randomPast(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
