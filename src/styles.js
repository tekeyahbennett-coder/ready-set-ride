// ─── Inject Global Styles ───────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060d1a; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 0; }
  input, button { font-family: inherit; }
  @keyframes scanPulse { 0%,100%{top:8%} 50%{top:84%} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ringPulse { 0%{box-shadow:0 0 0 0 rgba(0,212,170,.5)} 70%{box-shadow:0 0 0 14px rgba(0,212,170,0)} 100%{box-shadow:0 0 0 0 rgba(0,212,170,0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes mapPin { 0%{transform:translateY(-6px)} 50%{transform:translateY(0)} 100%{transform:translateY(-6px)} }
  @keyframes glow { 0%,100%{filter:drop-shadow(0 0 4px #00d4aa)} 50%{filter:drop-shadow(0 0 12px #00d4aa)} }
`;

export function injectGlobalStyles() {
  if (!document.getElementById("rsr-styles")) {
    const el = document.createElement("style");
    el.id = "rsr-styles";
    el.textContent = css;
    document.head.appendChild(el);
  }
}

// ─── Reusable UI ──────────────────────────────────────────────────────────────
export const S = {
  app: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#060d1a",
    color: "#e8edf8",
    minHeight: "100vh",
    maxWidth: 430,
    margin: "0 auto",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
};
