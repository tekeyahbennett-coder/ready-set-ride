import { useState, useEffect } from "react";
import Btn from "./ui/Btn.jsx";
import { fmt$, fmtTime } from "../utils.js";
import { UNLOCK_FEE, RATE } from "../constants.js";

// ─── Active Ride ──────────────────────────────────────────────────────────────
export default function RideScreen({ scooter, onEnd }) {
  const [secs, setSecs] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(()=>{
    if (paused) return;
    const t = setInterval(()=>setSecs(s=>s+1),1000);
    return ()=>clearInterval(t);
  },[paused]);

  const rideCost = (secs/60)*RATE;
  const total    = UNLOCK_FEE + rideCost;
  const battery  = Math.max(0, scooter.battery - Math.floor(secs/60));
  const c        = 2*Math.PI*50;
  const dash     = (battery/100)*c;

  return (
    <div style={{ flex:1, background:"linear-gradient(180deg,#060d1a 0%,#071428 100%)",
      display:"flex", flexDirection:"column", padding:20, gap:18 }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,
          background:"rgba(0,212,170,.1)", border:"1px solid rgba(0,212,170,.25)",
          borderRadius:20, padding:"6px 14px" }}>
          <div style={{ width:7,height:7,borderRadius:"50%",background:"#00d4aa",
            animation:"blink 1.2s infinite" }} />
          <span style={{ fontSize:11,fontWeight:800,color:"#00d4aa",letterSpacing:1 }}>
            {paused?"PAUSED":"LIVE"}
          </span>
        </div>
        <span style={{ fontSize:13,color:"#7b8db7",fontWeight:600 }}>{scooter.id}</span>
      </div>
      <div style={{ textAlign:"center", padding:"6px 0" }}>
        <p style={{ fontSize:12,color:"#7b8db7",letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>
          Current Fare
        </p>
        <p style={{ fontFamily:"'Syne',sans-serif", fontSize:58, fontWeight:800,
          letterSpacing:-3, lineHeight:1, fontVariantNumeric:"tabular-nums",
          background:"linear-gradient(135deg,#e8edf8,#a0aec0)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          {fmt$(total)}
        </p>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",
          gap:8,marginTop:6,color:"#7b8db7",fontSize:13 }}>
          <span>{fmt$(UNLOCK_FEE)} unlock</span>
          <span style={{color:"#3d4f70"}}>+</span>
          <span>{fmt$(rideCost)} ride</span>
        </div>
      </div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ background:"rgba(255,255,255,.04)",borderRadius:16,
          padding:"14px 18px",textAlign:"center",border:"1px solid rgba(255,255,255,.07)",flex:1 }}>
          <p style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,
            fontVariantNumeric:"tabular-nums" }}>{fmtTime(secs)}</p>
          <p style={{ fontSize:10,color:"#7b8db7",marginTop:3,letterSpacing:.8 }}>DURATION</p>
        </div>
        <div style={{ position:"relative",width:110,height:110,flex:"0 0 110px",margin:"0 12px" }}>
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="50" fill="none" stroke="#0d1828" strokeWidth="8" />
            <circle cx="55" cy="55" r="50" fill="none"
              stroke={battery>30?"#00d4aa":"#ff6b35"} strokeWidth="8"
              strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
              transform="rotate(-90 55 55)" style={{transition:"stroke-dasharray 1s ease"}} />
          </svg>
          <div style={{ position:"absolute",inset:0,display:"flex",
            flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
            <span style={{ fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800 }}>{battery}%</span>
            <span style={{ fontSize:9,color:"#7b8db7",letterSpacing:.8 }}>BATTERY</span>
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,.04)",borderRadius:16,
          padding:"14px 18px",textAlign:"center",border:"1px solid rgba(255,255,255,.07)",flex:1 }}>
          <p style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800 }}>{fmt$(RATE)}</p>
          <p style={{ fontSize:10,color:"#7b8db7",marginTop:3,letterSpacing:.8 }}>PER MIN</p>
        </div>
      </div>
      <div style={{ background:"rgba(255,255,255,.04)",borderRadius:14,
        padding:"11px 16px",display:"flex",gap:10,alignItems:"center",
        border:"1px solid rgba(255,255,255,.07)" }}>
        <span>📍</span>
        <div>
          <p style={{ fontSize:13,fontWeight:600 }}>{scooter.location}</p>
          <p style={{ fontSize:11,color:"#7b8db7",marginTop:1 }}>GPS tracking active</p>
        </div>
        <div style={{ marginLeft:"auto",width:8,height:8,borderRadius:"50%",
          background:"#00d4aa",animation:"blink 2s infinite" }} />
      </div>
      <div style={{ display:"flex",gap:10,marginTop:"auto" }}>
        <Btn variant="ghost" onClick={()=>setPaused(p=>!p)} sx={{ flex:1 }}>
          {paused?"▶ Resume":"⏸ Pause"}
        </Btn>
        <Btn variant="danger" onClick={()=>onEnd(total,secs)} sx={{ flex:2 }}>End Ride</Btn>
      </div>
    </div>
  );
}
