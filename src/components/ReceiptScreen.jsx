import { useState } from "react";
import Btn from "./ui/Btn.jsx";
import { fmt$, fmtDuration } from "../utils.js";
import { UNLOCK_FEE, RATE } from "../constants.js";

// ─── Receipt ──────────────────────────────────────────────────────────────────
export default function ReceiptScreen({ scooter, cost, secs, user, onDone }) {
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);
  return (
    <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",
      padding:20,background:"#060d1a" }}>
      <div style={{ background:"#0d1828",border:"1px solid rgba(0,212,170,.2)",
        borderRadius:24,padding:28,width:"100%",textAlign:"center",animation:"slideUp .4s ease" }}>
        <div style={{ width:68,height:68,borderRadius:"50%",
          background:"linear-gradient(135deg,#00d4aa,#00a882)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:30,color:"#060d1a",fontWeight:900,margin:"0 auto 16px",
          boxShadow:"0 4px 24px rgba(0,212,170,.4)", animation:"ringPulse 1.5s ease 1" }}>✓</div>
        <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,marginBottom:4 }}>
          Ride Complete!
        </h2>
        <p style={{ color:"#7b8db7",fontSize:14,marginBottom:24 }}>
          Thanks for riding with Ready Set Ride, {user.name.split(" ")[0]}! 🛴
        </p>
        <div style={{ background:"rgba(255,255,255,.03)",borderRadius:16,marginBottom:20,overflow:"hidden" }}>
          {[
            ["Scooter",scooter.id],
            ["Location",scooter.location],
            ["Duration",fmtDuration(secs)],
            ["Unlock Fee",fmt$(UNLOCK_FEE)],
            [`Ride (${(secs/60).toFixed(2)} min)`,fmt$((secs/60)*RATE)],
          ].map(([k,v])=>(
            <div key={k} style={{ display:"flex",justifyContent:"space-between",
              padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.05)",
              fontSize:14,color:"#7b8db7" }}>
              <span>{k}</span><span style={{color:"#e8edf8",fontWeight:600}}>{v}</span>
            </div>
          ))}
          <div style={{ display:"flex",justifyContent:"space-between",
            padding:"14px 16px",fontSize:16,fontWeight:800,color:"#e8edf8",
            background:"rgba(0,212,170,.06)" }}>
            <span>Total Charged</span>
            <span style={{ color:"#00d4aa",fontFamily:"'Syne',sans-serif" }}>{fmt$(cost)}</span>
          </div>
        </div>
        {!rated ? (
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:13,color:"#7b8db7",marginBottom:8 }}>How was your ride?</p>
            <div style={{ display:"flex",justifyContent:"center",gap:8 }}>
              {[1,2,3,4,5].map(s=>(
                <button key={s} onClick={()=>{setRating(s);setRated(true);}}
                  style={{ background:"none",border:"none",cursor:"pointer",
                    fontSize:28,opacity:s<=rating?1:.3,transition:"opacity .15s",
                    filter:s<=rating?"drop-shadow(0 0 6px gold)":"none" }}>★</button>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ fontSize:13,color:"#00d4aa",marginBottom:20,fontWeight:600 }}>
            ⭐ Thanks for the {"★".repeat(rating)} rating!
          </p>
        )}
        <Btn onClick={onDone}>Back to Map</Btn>
      </div>
    </div>
  );
}
