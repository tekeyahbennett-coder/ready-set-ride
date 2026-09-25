// ─── Bottom Nav ───────────────────────────────────────────────────────────────
export default function BottomNav({ tab, setTab }) {
  const tabs = [
    { id:"map",     icon:"🗺️", label:"Map"     },
    { id:"history", icon:"🛴", label:"Rides"   },
    { id:"payment", icon:"💳", label:"Wallet"  },
    { id:"profile", icon:"👤", label:"Profile" },
  ];
  return (
    <div style={{ display:"flex",background:"#090f1e",
      borderTop:"1px solid rgba(255,255,255,.06)",
      paddingBottom:"env(safe-area-inset-bottom,0)" }}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)}
          style={{ flex:1,background:"none",border:"none",cursor:"pointer",
            padding:"10px 0 8px",display:"flex",flexDirection:"column",
            alignItems:"center",gap:3,
            color:tab===t.id?"#00d4aa":"#4a5a78",
            transition:"color .2s" }}>
          <span style={{ fontSize:20 }}>{t.icon}</span>
          <span style={{ fontSize:10,fontWeight:tab===t.id?700:400,letterSpacing:.4 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
