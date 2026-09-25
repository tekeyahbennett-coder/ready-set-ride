import { useState, useEffect } from "react";
import { SCOOTERS } from "../constants.js";

// ─── QR Scanner ───────────────────────────────────────────────────────────────
export default function QRScanner({ onScan, onClose }) {
  const [input, setInput] = useState("");
  const [dots, setDots] = useState(0);
  const [stage, setStage] = useState("scanning");
  const [foundId, setFoundId] = useState(null);

  useEffect(() => {
    const di = setInterval(()=>setDots(d=>(d+1)%4), 500);
    const dt = setTimeout(()=>{
      const ids = Object.keys(SCOOTERS);
      const id = ids[Math.floor(Math.random()*ids.length)];
      setFoundId(id);
      setStage("found");
      setTimeout(()=>onScan(id), 700);
    }, 3200);
    return ()=>{ clearInterval(di); clearTimeout(dt); };
  }, []);

  const manualSubmit = () => {
    if (!input.trim()) return;
    if (SCOOTERS[input.toUpperCase()]) { onScan(input.toUpperCase()); }
    else { setStage("error"); setTimeout(()=>setStage("scanning"), 1800); }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.97)", zIndex:500,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:20, animation:"fadeUp .25s ease" }}>
      <button onClick={onClose} style={{ position:"absolute", top:20, right:20,
        background:"rgba(255,255,255,.1)", border:"none", color:"#e8edf8",
        width:38, height:38, borderRadius:"50%", cursor:"pointer", fontSize:18 }}>✕</button>

      <p style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:700,
        marginBottom:28, color:"#e8edf8" }}>Scan Scooter QR Code</p>

      <div style={{ position:"relative", width:240, height:240, marginBottom:28 }}>
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.6)", borderRadius:16 }} />
        {[["0%","0%","3px 0 0 3px","4px 0 0 0"],["auto","0%","0 3px 0 0","0 4px 0 0"],
          ["0%","auto","0 0 0 3px","0 0 0 4px"],["auto","auto","0 0 3px 0","0 0 4px 0"]].map(([t,r,bw,br],i)=>(
          <div key={i} style={{ position:"absolute", width:28,height:28,
            top:t==="auto"?undefined:"0%", bottom:t==="auto"?"0%":undefined,
            left:r==="auto"?undefined:"0%", right:r==="auto"?"0%":undefined,
            borderColor:stage==="found"?"#00d4aa":stage==="error"?"#ff4757":"#00d4aa",
            borderStyle:"solid", borderWidth:bw, borderRadius:br,
            transition:"border-color .3s" }} />
        ))}
        {stage==="scanning" && (
          <div style={{ position:"absolute", left:4, right:4, height:2,
            background:"linear-gradient(90deg,transparent,#00d4aa,transparent)",
            animation:"scanPulse 2s ease-in-out infinite", top:"20%" }} />
        )}
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:8 }}>
          <span style={{ fontSize:52 }}>
            {stage==="found"?"✅":stage==="error"?"❌":"🛴"}
          </span>
          <p style={{ fontSize:12, color:stage==="error"?"#ff4757":"#00d4aa",
            fontWeight:700, letterSpacing:2 }}>
            {stage==="found"?"FOUND!":stage==="error"?"NOT FOUND":"SCANNING"+".".repeat(dots+1)}
          </p>
        </div>
      </div>

      <p style={{ color:"#7b8db7", fontSize:13, marginBottom:20 }}>
        Point camera at the QR code on the handlebar
      </p>

      <div style={{ width:"100%", maxWidth:340 }}>
        <p style={{ textAlign:"center", color:"#3d4f70", fontSize:12, marginBottom:12 }}>
          — or enter ID manually —
        </p>
        <div style={{ display:"flex", gap:8 }}>
          <input value={input} onChange={e=>setInput(e.target.value.toUpperCase())}
            placeholder="e.g. RSR-001"
            style={{ flex:1, background:"rgba(255,255,255,.06)",
              border:"1.5px solid rgba(255,255,255,.12)", borderRadius:12,
              padding:"11px 14px", color:"#e8edf8", fontSize:14, outline:"none" }} />
          <button onClick={manualSubmit} style={{ background:"#00d4aa", color:"#060d1a",
            border:"none", borderRadius:12, padding:"0 20px", fontWeight:800,
            cursor:"pointer", fontSize:14 }}>Go</button>
        </div>
      </div>
    </div>
  );
}
