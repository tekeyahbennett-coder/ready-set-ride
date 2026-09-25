import { useState, useEffect } from "react";
import { injectGlobalStyles, S } from "./styles.js";
import { fmt$ } from "./utils.js";
import { UNLOCK_FEE, RATE, SCOOTERS } from "./constants.js";

import Toast from "./components/ui/Toast.jsx";
import Btn from "./components/ui/Btn.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import PaymentScreen from "./components/PaymentScreen.jsx";
import HistoryScreen from "./components/HistoryScreen.jsx";
import ProfileScreen from "./components/ProfileScreen.jsx";
import QRScanner from "./components/QRScanner.jsx";
import MapView from "./components/MapView.jsx";
import ConfirmScreen from "./components/ConfirmScreen.jsx";
import RideScreen from "./components/RideScreen.jsx";
import ReceiptScreen from "./components/ReceiptScreen.jsx";
import BottomNav from "./components/BottomNav.jsx";

injectGlobalStyles();

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]   = useState(null);
  const [tab, setTab]     = useState("map");
  const [modal, setModal] = useState(null);
  const [scooter, setScooter] = useState(null);
  const [selected, setSelected] = useState(null);
  const [rideCost, setRideCost] = useState(0);
  const [rideSecs, setRideSecs] = useState(0);
  const [userPos, setUserPos]   = useState({ lat:28.5383, lng:-81.3792 });
  const [toast, setToast] = useState(null);

  useEffect(()=>{
    const t = setInterval(()=>{
      setUserPos(p=>({
        lat: p.lat + (Math.random()-.5)*.0002,
        lng: p.lng + (Math.random()-.5)*.0002,
      }));
    }, 2000);
    return ()=>clearInterval(t);
  },[]);

  const handleScan = (id) => {
    const s = SCOOTERS[id];
    if (s) { setScooter(s); setModal("confirm"); }
    else    { setToast({ msg:"Scooter not found!", type:"error" }); setModal(null); }
  };

  const handleEndRide = (cost, secs) => {
    setRideCost(cost); setRideSecs(secs); setModal("receipt");
    setUser(u => ({ ...u,
      balance: Math.max(0, u.balance - cost),
      rides: [...u.rides, {
        id:"r"+Date.now(), scooter:scooter.id,
        date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
        duration:secs, cost, location:scooter.location
      }]
    }));
  };

  if (!user) return (
    <div style={S.app}>
      <AuthScreen onAuth={(u)=>{ setUser(u); setToast({msg:"Welcome to Ready Set Ride, "+u.name.split(" ")[0]+"! 🛴"}); }} />
      {toast && <Toast {...toast} onDone={()=>setToast(null)} />}
    </div>
  );

  const scooterList = Object.values(SCOOTERS);

  return (
    <div style={S.app}>
      {toast && <Toast {...toast} onDone={()=>setToast(null)} />}

      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"14px 20px",background:"rgba(6,13,26,.96)",
        backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(0,212,170,.12)",
        position:"sticky",top:0,zIndex:100 }}>
        <div style={{ display:"flex",alignItems:"baseline",gap:1 }}>
          <span style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:900,
            color:"#e8edf8",letterSpacing:-.5 }}>Ready</span>
          <span style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:900,
            color:"#00d4aa",letterSpacing:-.5 }}>Set</span>
          <span style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:900,
            color:"#e8edf8",letterSpacing:-.5 }}>Ride</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ background:"rgba(0,212,170,.1)",border:"1px solid rgba(0,212,170,.25)",
            borderRadius:20,padding:"4px 12px",fontSize:13,fontWeight:700,color:"#00d4aa" }}>
            💳 {fmt$(user.balance)}
          </div>
          <div onClick={()=>setTab("profile")} style={{ width:34,height:34,borderRadius:"50%",
            background:"linear-gradient(135deg,#00d4aa,#0080ff)",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:12,fontWeight:800,color:"#060d1a" }}>
            {user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
          </div>
        </div>
      </div>

      {/* Screens */}
      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>
        {tab==="map" && (
          <div style={{ flex:1,display:"flex",flexDirection:"column" }}>
            <MapView userPos={userPos} scooterList={scooterList} onSelectScooter={s=>setSelected(s)} />
            {selected && (
              <div style={{ background:"#0d1828",borderRadius:"16px 16px 0 0",
                padding:"14px 20px",borderTop:"1px solid rgba(0,212,170,.2)",
                display:"flex",alignItems:"center",gap:14,animation:"slideUp .25s ease" }}>
                <span style={{ fontSize:32 }}>🛴</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:700,fontSize:15 }}>{selected.id}</p>
                  <p style={{ fontSize:12,color:"#7b8db7" }}>📍 {selected.location} · 🔋 {selected.battery}%</p>
                </div>
                <Btn onClick={()=>{ setScooter(selected); setModal("confirm"); }}
                  sx={{ width:"auto",padding:"10px 18px",fontSize:14 }}>Unlock</Btn>
              </div>
            )}
            <div style={{ background:"#0d1828",padding:"16px 20px 20px",
              borderTop:selected?"none":"1px solid rgba(255,255,255,.06)" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
                <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700 }}>
                  Nearby — {scooterList.length} scooters
                </h3>
                <div style={{ display:"flex",alignItems:"center",gap:6,
                  fontSize:12,color:"#00d4aa",fontWeight:600 }}>
                  <div style={{ width:6,height:6,borderRadius:"50%",background:"#00d4aa",
                    animation:"blink 2s infinite" }} /> GPS Live
                </div>
              </div>
              <div style={{ display:"flex",gap:10,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none" }}>
                {scooterList.map(s=>(
                  <div key={s.id} onClick={()=>setSelected(s)}
                    style={{ flex:"0 0 130px",background:"rgba(255,255,255,.04)",
                      borderRadius:14,padding:"12px 14px",cursor:"pointer",
                      border:`1.5px solid ${selected?.id===s.id?"rgba(0,212,170,.5)":"rgba(255,255,255,.07)"}`,
                      transition:"border-color .2s" }}>
                    <div style={{ fontSize:26,marginBottom:6 }}>🛴</div>
                    <p style={{ fontSize:13,fontWeight:700,marginBottom:2 }}>{s.id}</p>
                    <p style={{ fontSize:10,color:"#7b8db7",marginBottom:6 }}>{s.location}</p>
                    <div style={{ height:4,borderRadius:2,background:"rgba(255,255,255,.1)",overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${s.battery}%`,borderRadius:2,
                        background:s.battery>30?"#00d4aa":"#ff6b35",transition:"width .3s" }} />
                    </div>
                    <p style={{ fontSize:10,color:s.battery>30?"#00d4aa":"#ff6b35",
                      marginTop:3,fontWeight:600 }}>{s.battery}%</p>
                  </div>
                ))}
              </div>
              <button onClick={()=>setModal("scanner")}
                style={{ width:"100%",background:"linear-gradient(135deg,#00d4aa,#00a882)",
                  color:"#060d1a",border:"none",borderRadius:16,padding:"15px 20px",
                  fontSize:15,fontWeight:800,cursor:"pointer",marginTop:14,
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                  boxShadow:"0 4px 20px rgba(0,212,170,.3)" }}>
                ⬛ Scan QR to Ride · {fmt$(UNLOCK_FEE)} + {fmt$(RATE)}/min
              </button>
            </div>
          </div>
        )}
        {tab==="history" && <HistoryScreen user={user} onBack={()=>setTab("map")} />}
        {tab==="payment" && <PaymentScreen user={user} onUpdate={setUser} onBack={()=>setTab("map")} />}
        {tab==="profile" && (
          <ProfileScreen user={user} onUpdate={setUser}
            onLogout={()=>{ setUser(null); setTab("map"); setModal(null);
              setToast({msg:"Signed out. See you soon! 👋"}); }}
            onBack={()=>setTab("map")}
            goPayments={()=>setTab("payment")}
            goHistory={()=>setTab("history")} />
        )}
      </div>

      {!modal && <BottomNav tab={tab} setTab={setTab} />}

      {modal==="scanner" && <QRScanner onScan={handleScan} onClose={()=>setModal(null)} />}
      {modal==="confirm" && scooter && (
        <ConfirmScreen scooter={scooter} user={user}
          onConfirm={()=>setModal("riding")} onCancel={()=>setModal(null)} />
      )}
      {modal==="riding" && scooter && (
        <div style={{ position:"fixed",inset:0,background:"#060d1a",zIndex:300,display:"flex",flexDirection:"column" }}>
          <RideScreen scooter={scooter} onEnd={handleEndRide} />
        </div>
      )}
      {modal==="receipt" && scooter && (
        <div style={{ position:"fixed",inset:0,background:"#060d1a",zIndex:300,display:"flex",flexDirection:"column" }}>
          <ReceiptScreen scooter={scooter} cost={rideCost} secs={rideSecs} user={user}
            onDone={()=>{ setModal(null); setScooter(null); setSelected(null); setTab("map"); }} />
        </div>
      )}
    </div>
  );
}
