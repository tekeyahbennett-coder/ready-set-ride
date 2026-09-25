import { useState } from "react";
import Btn from "./ui/Btn.jsx";
import { fmt$ } from "../utils.js";
import { UNLOCK_FEE, RATE } from "../constants.js";

// ─── Confirm Unlock ───────────────────────────────────────────────────────────
export default function ConfirmScreen({ scooter, user, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);
  const defaultCard = user.cards[0];
  const payMethod = defaultCard ? `${defaultCard.brand} ••••${defaultCard.last4}` : "RSR Wallet";

  const go = async () => {
    setLoading(true);
    await new Promise(r=>setTimeout(r,1200));
    setLoading(false);
    onConfirm();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:400,
      display:"flex", alignItems:"flex-end", animation:"fadeUp .2s ease" }}
      onClick={e=>e.target===e.currentTarget&&onCancel()}>
      <div style={{ width:"100%", background:"#0d1828", borderRadius:"24px 24px 0 0",
        padding:"8px 24px 36px", border:"1px solid rgba(0,212,170,.15)",
        animation:"slideUp .3s ease" }}>
        <div style={{ width:40,height:4,borderRadius:2,background:"rgba(255,255,255,.15)",
          margin:"12px auto 20px" }} />
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:44, marginBottom:8, animation:"glow 2s ease infinite" }}>🛴</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800 }}>{scooter.id}</h2>
          <p style={{ color:"#7b8db7", fontSize:13 }}>📍 {scooter.location}</p>
        </div>
        <div style={{ background:"rgba(255,255,255,.03)", borderRadius:16, marginBottom:18, overflow:"hidden" }}>
          {[
            ["Battery",`${scooter.battery}%`,scooter.battery>30?"#00d4aa":"#ff6b35"],
            ["Unlock Fee",fmt$(UNLOCK_FEE),"#e8edf8"],
            ["Rate",`${fmt$(RATE)}/min`,"#e8edf8"],
            ["Payment",payMethod,"#7b8db7"],
          ].map(([k,v,c])=>(
            <div key={k} style={{ display:"flex",justifyContent:"space-between",
              padding:"11px 16px",borderBottom:"1px solid rgba(255,255,255,.05)" }}>
              <span style={{ fontSize:14,color:"#7b8db7" }}>{k}</span>
              <span style={{ fontSize:14,fontWeight:600,color:c }}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:"#7b8db7", textAlign:"center", marginBottom:18, lineHeight:1.6 }}>
          Your card will be charged {fmt$(UNLOCK_FEE)} to unlock, then {fmt$(RATE)}/min while riding.
        </p>
        <Btn onClick={go} loading={loading} sx={{ marginBottom:10 }}>🔓 Unlock & Ride</Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}
