import { useEffect } from "react";

export default function Toast({ msg, type="success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  const bg = type === "error" ? "#ff4757" : type === "warn" ? "#ff9f1c" : "#00d4aa";
  return (
    <div style={{ position:"fixed", top:70, left:"50%", transform:"translateX(-50%)",
      background:bg, color:type==="success"?"#060d1a":"#fff", borderRadius:12,
      padding:"10px 20px", fontSize:13, fontWeight:700, zIndex:9999,
      boxShadow:`0 4px 20px ${bg}55`, animation:"fadeUp .3s ease",
      whiteSpace:"nowrap", maxWidth:320, textAlign:"center" }}>
      {msg}
    </div>
  );
}
