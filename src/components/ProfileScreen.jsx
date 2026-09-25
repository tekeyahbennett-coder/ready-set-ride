import { useState } from "react";
import Field from "./ui/Field.jsx";
import Btn from "./ui/Btn.jsx";
import Toast from "./ui/Toast.jsx";

// ─── Profile ──────────────────────────────────────────────────────────────────
export default function ProfileScreen({ user, onUpdate, onLogout, onBack, goPayments, goHistory }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name:user.name, email:user.email, phone:user.phone||"" });
  const [toast, setToast] = useState(null);
  const set = k => v => setForm(f=>({...f,[k]:v}));

  const save = () => {
    onUpdate({ ...user, ...form });
    setEditing(false);
    setToast({ msg:"Profile updated!" });
  };

  const initials = user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  return (
    <div style={{ flex:1, background:"#060d1a", display:"flex", flexDirection:"column" }}>
      {toast && <Toast {...toast} onDone={()=>setToast(null)} />}
      <div style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:12,
        borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,.07)", border:"none",
          color:"#e8edf8", width:36, height:36, borderRadius:10, cursor:"pointer", fontSize:16 }}>←</button>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700 }}>Profile</h2>
        <button onClick={()=>setEditing(e=>!e)} style={{ marginLeft:"auto", background:"none",
          border:"none", color:"#00d4aa", fontWeight:700, cursor:"pointer", fontSize:14 }}>
          {editing?"Cancel":"Edit"}
        </button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"24px 20px 40px" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:80, height:80, borderRadius:"50%",
            background:"linear-gradient(135deg,#00d4aa,#0080ff)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:28, fontWeight:800, color:"#060d1a", margin:"0 auto 12px",
            boxShadow:"0 4px 24px rgba(0,212,170,.3)" }}>{initials}</div>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700 }}>{user.name}</h3>
          <p style={{ color:"#7b8db7", fontSize:13 }}>{user.email}</p>
        </div>

        {editing ? (
          <div style={{ animation:"fadeUp .3s ease" }}>
            <Field label="Full Name" value={form.name} onChange={set("name")} placeholder="Jane Doe" icon="👤" />
            <Field label="Email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" icon="✉️" />
            <Field label="Phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" icon="📱" />
            <Btn onClick={save}>Save Changes</Btn>
          </div>
        ) : (
          <>
            {[
              { icon:"✉️", label:"Email",  val:user.email },
              { icon:"📱", label:"Phone",  val:user.phone||"Not set" },
              { icon:"💳", label:"Cards",  val:`${user.cards.length} saved` },
              { icon:"🛴", label:"Rides",  val:`${user.rides.length} total` },
            ].map(({icon,label,val}) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:14,
                padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                <span style={{ fontSize:20, width:28, textAlign:"center" }}>{icon}</span>
                <div>
                  <p style={{ fontSize:12, color:"#7b8db7", marginBottom:2 }}>{label}</p>
                  <p style={{ fontSize:14, fontWeight:600 }}>{val}</p>
                </div>
              </div>
            ))}
            <div style={{ marginTop:24, display:"flex", flexDirection:"column", gap:10 }}>
              <Btn variant="ghost" onClick={goPayments}>💳 Payment Methods</Btn>
              <Btn variant="ghost" onClick={goHistory}>🛴 Ride History</Btn>
              <Btn variant="danger" onClick={onLogout} sx={{ marginTop:8 }}>Sign Out</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
