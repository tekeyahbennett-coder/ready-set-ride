import { fmt$, fmtDuration } from "../utils.js";

// ─── Ride History ─────────────────────────────────────────────────────────────
export default function HistoryScreen({ user, onBack }) {
  const all = [...user.rides].reverse();
  const total = all.reduce((s,r)=>s+r.cost,0);

  return (
    <div style={{ flex:1, background:"#060d1a", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:12,
        borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,.07)", border:"none",
          color:"#e8edf8", width:36, height:36, borderRadius:10, cursor:"pointer", fontSize:16 }}>←</button>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700 }}>Ride History</h2>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 40px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
          {[
            { label:"Total Rides", val:all.length },
            { label:"Total Spent", val:fmt$(total) },
            { label:"Avg Cost", val: all.length ? fmt$(total/all.length) : "$0.00" },
          ].map(({label,val}) => (
            <div key={label} style={{ background:"rgba(255,255,255,.04)", borderRadius:14,
              padding:"12px 10px", textAlign:"center", border:"1px solid rgba(255,255,255,.07)" }}>
              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"#00d4aa" }}>{val}</p>
              <p style={{ fontSize:10, color:"#7b8db7", marginTop:3, letterSpacing:.5 }}>{label}</p>
            </div>
          ))}
        </div>

        {all.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 0", color:"#3d4f70" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🛴</div>
            <p>No rides yet. Scan a scooter to start!</p>
          </div>
        )}

        {all.map((ride, i) => (
          <div key={ride.id} style={{ background:"rgba(255,255,255,.04)", borderRadius:18,
            padding:16, marginBottom:12, border:"1px solid rgba(255,255,255,.07)",
            display:"flex", alignItems:"center", gap:14,
            animation:`fadeUp .3s ease ${i*.06}s both` }}>
            <div style={{ width:46, height:46, borderRadius:14,
              background:"linear-gradient(135deg,rgba(0,212,170,.15),rgba(0,212,170,.05))",
              border:"1px solid rgba(0,212,170,.2)", display:"flex",
              alignItems:"center", justifyContent:"center", fontSize:22 }}>🛴</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <p style={{ fontSize:14, fontWeight:700 }}>{ride.scooter}</p>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800,
                  color:"#00d4aa" }}>{fmt$(ride.cost)}</p>
              </div>
              <p style={{ fontSize:12, color:"#7b8db7", marginTop:3 }}>📍 {ride.location}</p>
              <div style={{ display:"flex", gap:12, marginTop:4 }}>
                <span style={{ fontSize:11, color:"#3d4f70" }}>🕐 {fmtDuration(ride.duration)}</span>
                <span style={{ fontSize:11, color:"#3d4f70" }}>📅 {ride.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
