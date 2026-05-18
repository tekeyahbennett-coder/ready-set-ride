import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const UNLOCK_FEE = 2.0;
const RATE = 0.48;

const SCOOTERS = {
  "RSR-001": { id: "RSR-001", battery: 87, location: "Downtown Plaza", lat: 28.5383, lng: -81.3792 },
  "RSR-042": { id: "RSR-042", battery: 63, location: "City Park",      lat: 28.5420, lng: -81.3750 },
  "RSR-007": { id: "RSR-007", battery: 95, location: "Waterfront",     lat: 28.5350, lng: -81.3810 },
  "RSR-019": { id: "RSR-019", battery: 41, location: "Arts District",  lat: 28.5400, lng: -81.3830 },
  "RSR-033": { id: "RSR-033", battery: 78, location: "College Ave",    lat: 28.5360, lng: -81.3770 },
};

const CARD_BRANDS = { "4": "Visa", "5": "Mastercard", "3": "Amex", "6": "Discover" };

function fmt$(n) { return `$${n.toFixed(2)}`; }
function fmtTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sc = (s % 60).toString().padStart(2, "0");
  return `${m}:${sc}`;
}
function fmtDuration(s) {
  const m = Math.floor(s / 60), sc = s % 60;
  return m > 0 ? `${m}m ${sc}s` : `${sc}s`;
}
function randomPast(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Inject Styles ────────────────────────────────────────────────────────────
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
if (!document.getElementById("rsr-styles")) {
  const el = document.createElement("style");
  el.id = "rsr-styles";
  el.textContent = css;
  document.head.appendChild(el);
}

// ─── Reusable UI ──────────────────────────────────────────────────────────────
const S = {
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

function Loader() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:80 }}>
      <div style={{ width:28, height:28, borderRadius:"50%", border:"3px solid rgba(0,212,170,.2)",
        borderTopColor:"#00d4aa", animation:"spin .7s linear infinite" }} />
    </div>
  );
}

function Toast({ msg, type="success", onDone }) {
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

function Field({ label, type="text", value, onChange, placeholder, error, icon, suffix, maxLength }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ fontSize:12, color:"#7b8db7", letterSpacing:.8,
        textTransform:"uppercase", fontWeight:600, display:"block", marginBottom:6 }}>{label}</label>}
      <div style={{ position:"relative" }}>
        {icon && <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
          fontSize:16, pointerEvents:"none" }}>{icon}</span>}
        <input
          type={type==="password" && show ? "text" : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          style={{
            width:"100%", background:"rgba(255,255,255,.05)",
            border:`1.5px solid ${error?"#ff4757":"rgba(255,255,255,.1)"}`,
            borderRadius:12, padding:`12px ${suffix?44:14}px 12px ${icon?44:14}px`,
            color:"#e8edf8", fontSize:15, outline:"none",
            transition:"border-color .2s",
          }}
          onFocus={e => e.target.style.borderColor="#00d4aa"}
          onBlur={e => e.target.style.borderColor=error?"#ff4757":"rgba(255,255,255,.1)"}
        />
        {type==="password" && (
          <button onClick={()=>setShow(s=>!s)} style={{ position:"absolute", right:14, top:"50%",
            transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer",
            color:"#7b8db7", fontSize:14, padding:4 }}>{show?"🙈":"👁"}</button>
        )}
        {suffix && <span style={{ position:"absolute", right:14, top:"50%",
          transform:"translateY(-50%)", color:"#7b8db7", fontSize:13, pointerEvents:"none" }}>{suffix}</span>}
      </div>
      {error && <p style={{ color:"#ff4757", fontSize:12, marginTop:4 }}>{error}</p>}
    </div>
  );
}

function Btn({ children, onClick, variant="primary", disabled, style: sx={}, loading }) {
  const base = {
    width:"100%", borderRadius:14, padding:"14px 20px", fontSize:15, fontWeight:700,
    cursor: disabled||loading ? "not-allowed" : "pointer", border:"none",
    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
    transition:"opacity .15s, transform .1s", opacity: disabled||loading ? .5 : 1,
    ...sx,
  };
  const variants = {
    primary: { background:"linear-gradient(135deg,#00d4aa,#00a882)", color:"#060d1a",
      boxShadow:"0 4px 20px rgba(0,212,170,.3)" },
    danger:  { background:"linear-gradient(135deg,#ff6b35,#e0522a)", color:"#fff",
      boxShadow:"0 4px 20px rgba(255,107,53,.3)" },
    ghost:   { background:"rgba(255,255,255,.05)", color:"#e8edf8",
      border:"1.5px solid rgba(255,255,255,.1)" },
    outline: { background:"transparent", color:"#00d4aa",
      border:"1.5px solid rgba(0,212,170,.4)" },
  };
  return (
    <button onClick={!disabled&&!loading ? onClick : undefined} style={{...base,...variants[variant],...sx}}>
      {loading ? <div style={{ width:18,height:18,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,.3)",
        borderTopColor:"#fff",animation:"spin .6s linear infinite" }} /> : children}
    </button>
  );
}

// ─── Auth Screens ─────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", confirm:"" });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (k) => (v) => setForm(f => ({...f,[k]:v}));

  const validate = () => {
    const e = {};
    if (mode==="signup" && !form.name.trim()) e.name = "Name required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (mode!=="forgot" && form.password.length < 6) e.password = "Min 6 characters";
    if (mode==="signup" && form.password !== form.confirm) e.confirm = "Passwords don't match";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    if (mode === "forgot") {
      setToast({ msg:"Reset link sent to "+form.email, type:"success" });
      setTimeout(()=>setMode("login"), 2000);
    } else {
      onAuth({ name: form.name || form.email.split("@")[0], email: form.email,
        phone: form.phone, balance: 24.00, cards: [], rides: generateRides() });
    }
  };

  function generateRides() {
    return [
      { id:"r1", scooter:"RSR-007", date:randomPast(3),  duration:847,  cost:8.77,  location:"Waterfront" },
      { id:"r2", scooter:"RSR-001", date:randomPast(10), duration:312,  cost:4.50,  location:"Downtown Plaza" },
      { id:"r3", scooter:"RSR-042", date:randomPast(20), duration:1204, cost:11.63, location:"City Park" },
    ];
  }

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#060d1a" }}>
      {toast && <Toast {...toast} onDone={()=>setToast(null)} />}

      {/* Hero */}
      <div style={{ padding:"52px 28px 32px", textAlign:"center", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:-80, left:-80, width:320, height:320, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(0,212,170,.12) 0%, transparent 70%)" }} />
          <div style={{ position:"absolute", bottom:-40, right:-60, width:220, height:220, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(0,128,255,.08) 0%, transparent 70%)" }} />
        </div>
        <div style={{ position:"relative" }}>
          <div style={{ fontSize:52, marginBottom:8, animation:"glow 3s ease infinite" }}>🛴</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:30, fontWeight:800,
            letterSpacing:-1, color:"#e8edf8", lineHeight:1.1 }}>
            Ready<span style={{ color:"#00d4aa" }}>Set</span>Ride
          </h1>
          <p style={{ color:"#7b8db7", fontSize:14, marginTop:6 }}>
            {mode==="login" ? "Welcome back, rider 🤙" : mode==="signup" ? "Join thousands of riders" : "Reset your password"}
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex:1, background:"#0b1424", borderRadius:"28px 28px 0 0",
        padding:"28px 24px 40px", animation:"slideUp .4s ease" }}>

        {mode==="signup" && <Field label="Full Name" value={form.name} onChange={set("name")}
          placeholder="Jane Doe" icon="👤" error={errs.name} />}
        <Field label="Email" type="email" value={form.email} onChange={set("email")}
          placeholder="you@example.com" icon="✉️" error={errs.email} />
        {mode==="signup" && <Field label="Phone" type="tel" value={form.phone} onChange={set("phone")}
          placeholder="+1 (555) 000-0000" icon="📱" />}
        {mode!=="forgot" && <Field label="Password" type="password" value={form.password} onChange={set("password")}
          placeholder="••••••••" error={errs.password} />}
        {mode==="signup" && <Field label="Confirm Password" type="password" value={form.confirm} onChange={set("confirm")}
          placeholder="••••••••" error={errs.confirm} />}

        {mode==="login" && (
          <button onClick={()=>setMode("forgot")} style={{ background:"none",border:"none",
            color:"#00d4aa",fontSize:13,cursor:"pointer",marginBottom:20,padding:0 }}>
            Forgot password?
          </button>
        )}

        <Btn onClick={submit} loading={loading} sx={{ marginBottom:16 }}>
          {mode==="login" ? "Sign In" : mode==="signup" ? "Create Account" : "Send Reset Link"}
        </Btn>

        <p style={{ textAlign:"center", color:"#7b8db7", fontSize:13 }}>
          {mode==="login" ? "New to Ready Set Ride? " : "Already have an account? "}
          <button onClick={()=>setMode(mode==="login"?"signup":"login")}
            style={{ background:"none",border:"none",color:"#00d4aa",fontWeight:700,cursor:"pointer",fontSize:13 }}>
            {mode==="login" ? "Create account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Payment Methods ───────────────────────────────────────────────────────────
function PaymentScreen({ user, onUpdate, onBack }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ number:"", exp:"", cvv:"", name:"" });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const set = k => v => setForm(f=>({...f,[k]:v}));

  const fmtCard = v => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const fmtExp  = v => {
    const d = v.replace(/\D/g,"").slice(0,4);
    return d.length>2 ? d.slice(0,2)+"/"+d.slice(2) : d;
  };

  const addCard = async () => {
    const e={};
    const num = form.number.replace(/\s/g,"");
    if (num.length<15) e.number="Invalid card number";
    if (!form.exp.match(/^\d{2}\/\d{2}$/)) e.exp="MM/YY";
    if (form.cvv.length<3) e.cvv="Invalid";
    if (!form.name.trim()) e.name="Required";
    setErrs(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    await new Promise(r=>setTimeout(r,1000));
    setLoading(false);
    const brand = CARD_BRANDS[num[0]] || "Card";
    const card = { id:"c"+Date.now(), brand, last4:num.slice(-4), exp:form.exp, name:form.name };
    onUpdate({ ...user, cards: [...user.cards, card] });
    setAdding(false);
    setForm({ number:"", exp:"", cvv:"", name:"" });
    setToast({ msg:`${brand} ••••${card.last4} added!` });
  };

  const removeCard = (id) => {
    onUpdate({ ...user, cards: user.cards.filter(c=>c.id!==id) });
    setToast({ msg:"Card removed", type:"warn" });
  };

  return (
    <div style={{ flex:1, background:"#060d1a", display:"flex", flexDirection:"column" }}>
      {toast && <Toast {...toast} onDone={()=>setToast(null)} />}
      <div style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:12,
        borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,.07)", border:"none",
          color:"#e8edf8", width:36, height:36, borderRadius:10, cursor:"pointer", fontSize:16 }}>←</button>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700 }}>Payment Methods</h2>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 40px" }}>
        {/* Wallet balance */}
        <div style={{ background:"linear-gradient(135deg,#0d2137,#0a1a2e)", borderRadius:20,
          padding:20, marginBottom:24, border:"1px solid rgba(0,212,170,.15)",
          position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", right:-20, top:-20, width:120, height:120, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(0,212,170,.1) 0%, transparent 70%)" }} />
          <p style={{ fontSize:12, color:"#7b8db7", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>RSR Wallet</p>
          <p style={{ fontFamily:"'Syne',sans-serif", fontSize:36, fontWeight:800, color:"#00d4aa" }}>
            {fmt$(user.balance)}
          </p>
          <p style={{ fontSize:12, color:"#7b8db7", marginTop:4 }}>Available balance</p>
        </div>

        <h3 style={{ fontSize:13, color:"#7b8db7", letterSpacing:1, textTransform:"uppercase",
          marginBottom:14, fontWeight:600 }}>Saved Cards</h3>

        {user.cards.length === 0 && !adding && (
          <div style={{ textAlign:"center", padding:"24px 0", color:"#3d4f70" }}>
            <div style={{ fontSize:36, marginBottom:8 }}>💳</div>
            <p style={{ fontSize:14 }}>No cards saved yet</p>
          </div>
        )}

        {user.cards.map((card, i) => (
          <div key={card.id} style={{ background:"rgba(255,255,255,.04)", borderRadius:16,
            padding:"14px 16px", marginBottom:10, border:"1px solid rgba(255,255,255,.07)",
            display:"flex", alignItems:"center", gap:12, animation:`fadeUp .3s ease ${i*.05}s both` }}>
            <div style={{ width:44, height:30, borderRadius:6, background:"linear-gradient(135deg,#1a2740,#0f1e35)",
              border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:18 }}>
              {card.brand==="Visa"?"💙":card.brand==="Mastercard"?"🔴":"💳"}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:600 }}>{card.brand} ••••{card.last4}</p>
              <p style={{ fontSize:12, color:"#7b8db7" }}>Exp {card.exp} · {card.name}</p>
            </div>
            <button onClick={()=>removeCard(card.id)} style={{ background:"rgba(255,71,87,.1)",
              border:"1px solid rgba(255,71,87,.2)", color:"#ff4757", borderRadius:8,
              padding:"4px 10px", fontSize:12, cursor:"pointer", fontWeight:600 }}>Remove</button>
          </div>
        ))}

        {adding ? (
          <div style={{ background:"rgba(0,212,170,.04)", borderRadius:20, padding:20,
            border:"1px solid rgba(0,212,170,.15)", marginTop:8, animation:"fadeUp .3s ease" }}>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, marginBottom:18 }}>Add New Card</h3>
            <Field label="Card Number" value={form.number}
              onChange={v=>set("number")(fmtCard(v))} placeholder="1234 5678 9012 3456"
              icon="💳" error={errs.number} maxLength={19} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Expiry" value={form.exp}
                onChange={v=>set("exp")(fmtExp(v))} placeholder="MM/YY" error={errs.exp} maxLength={5} />
              <Field label="CVV" value={form.cvv}
                onChange={v=>set("cvv")(v.replace(/\D/g,"").slice(0,4))} placeholder="123" error={errs.cvv} maxLength={4} />
            </div>
            <Field label="Name on Card" value={form.name} onChange={set("name")}
              placeholder="Jane Doe" error={errs.name} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <Btn variant="ghost" onClick={()=>setAdding(false)}>Cancel</Btn>
              <Btn onClick={addCard} loading={loading}>Add Card</Btn>
            </div>
          </div>
        ) : (
          <Btn variant="outline" onClick={()=>setAdding(true)} sx={{ marginTop:8 }}>
            + Add Payment Method
          </Btn>
        )}
      </div>
    </div>
  );
}

// ─── Ride History ─────────────────────────────────────────────────────────────
function HistoryScreen({ user, onBack }) {
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

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfileScreen({ user, onUpdate, onLogout, onBack, goPayments, goHistory }) {
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

// ─── QR Scanner ───────────────────────────────────────────────────────────────
function QRScanner({ onScan, onClose }) {
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

// ─── GPS Map ──────────────────────────────────────────────────────────────────
function MapView({ userPos, scooterList, onSelectScooter }) {
  const canvasRef = useRef(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const animFrame = useRef(null);
  const tick = useRef(0);

  const center = { lat:28.5383, lng:-81.3792 };
  const scale  = 18000;

  function project(lat, lng, w, h) {
    const x = (lng - center.lng) * scale + w / 2;
    const y = -(lat - center.lat) * scale + h / 2;
    return { x, y };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      tick.current++;
      const ctx = canvas.getContext("2d");
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = "#0b1828";
      ctx.fillRect(0,0,W,H);
      ctx.strokeStyle = "#111d2e";
      ctx.lineWidth = 1;
      for (let i=0;i<W;i+=32) { ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke(); }
      for (let i=0;i<H;i+=32) { ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(W,i);ctx.stroke(); }
      ctx.strokeStyle="#182840"; ctx.lineWidth=22;
      [[0,H*.38,W,H*.38],[0,H*.62,W,H*.62],[W*.3,0,W*.3,H],[W*.58,0,W*.58,H]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      });
      ctx.strokeStyle="#0f2033"; ctx.lineWidth=18;
      [[0,H*.38,W,H*.38],[0,H*.62,W,H*.62],[W*.3,0,W*.3,H],[W*.58,0,W*.58,H]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      });
      const blocks=[
        [.05,.05,.22,.3],[.38,.05,.18,.3],[.66,.05,.28,.28],
        [.05,.44,.2,.14],[.38,.44,.18,.14],[.66,.44,.28,.14],
        [.05,.72,.22,.22],[.38,.72,.18,.22],[.66,.72,.28,.22],
      ];
      blocks.forEach(([rx,ry,rw,rh])=>{
        ctx.fillStyle="#0d1a2a";
        ctx.beginPath();
        const r=6,x=rx*W,y=ry*H,w=rw*W,h=rh*H;
        ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
        ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
        ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
        ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
        ctx.fill();
      });
      if (userPos) {
        const {x,y} = project(userPos.lat, userPos.lng, W, H);
        const pulse = Math.abs(Math.sin(tick.current * 0.04)) * 18 + 10;
        ctx.fillStyle=`rgba(0,128,255,${0.08+Math.abs(Math.sin(tick.current*.04))*.06})`;
        ctx.beginPath();ctx.arc(x,y,pulse,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="rgba(0,128,255,.3)";
        ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#3399ff";
        ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#fff"; ctx.lineWidth=1.5;
        ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.stroke();
      }
      scooterList.forEach(s => {
        const {x,y} = project(s.lat, s.lng, W, H);
        const isSelected = selectedPin===s.id;
        const bob = isSelected ? Math.sin(tick.current*.08)*3-3 : 0;
        const pinY = y + bob;
        const glow = 4 + Math.abs(Math.sin(tick.current*.05))*6;
        const g = ctx.createRadialGradient(x,pinY,0,x,pinY,glow+10);
        g.addColorStop(0,`rgba(0,212,170,0.3)`); g.addColorStop(1,"transparent");
        ctx.fillStyle=g;
        ctx.beginPath();ctx.arc(x,pinY,glow+10,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=isSelected?"#00ffcc":s.battery<30?"#ff6b35":"#00d4aa";
        ctx.shadowColor=isSelected?"#00ffcc":"#00d4aa"; ctx.shadowBlur=isSelected?12:4;
        ctx.beginPath();ctx.arc(x,pinY-14,12,0,Math.PI);
        ctx.lineTo(x+1.5,pinY);ctx.lineTo(x-1.5,pinY);ctx.fill();
        ctx.shadowBlur=0;
        ctx.save();ctx.font="11px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.fillText("🛴",x,pinY-14);ctx.restore();
        ctx.fillStyle="rgba(10,20,35,.85)";
        ctx.beginPath();ctx.roundRect?ctx.roundRect(x-14,pinY+4,28,14,4):ctx.rect(x-14,pinY+4,28,14);
        ctx.fill();
        ctx.fillStyle=s.battery<30?"#ff6b35":"#00d4aa";
        ctx.font="bold 9px 'DM Sans',sans-serif";
        ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.fillText(s.battery+"%",x,pinY+11);
      });
      animFrame.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animFrame.current);
  }, [userPos, scooterList, selectedPin]);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX-rect.left) * (canvas.width/rect.width);
    const cy = (e.clientY-rect.top)  * (canvas.height/rect.height);
    const W=canvas.width, H=canvas.height;
    let hit=null;
    scooterList.forEach(s=>{
      const {x,y}=project(s.lat,s.lng,W,H);
      if (Math.hypot(cx-x,cy-(y-14))<18) hit=s;
    });
    if (hit) { setSelectedPin(hit.id); onSelectScooter(hit); }
    else { setSelectedPin(null); onSelectScooter(null); }
  };

  return (
    <canvas ref={canvasRef} width={430} height={320}
      style={{ width:"100%", height:320, display:"block", cursor:"crosshair" }}
      onClick={handleClick} />
  );
}

// ─── Confirm Unlock ───────────────────────────────────────────────────────────
function ConfirmScreen({ scooter, user, onConfirm, onCancel }) {
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

// ─── Active Ride ──────────────────────────────────────────────────────────────
function RideScreen({ scooter, onEnd }) {
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

// ─── Receipt ──────────────────────────────────────────────────────────────────
function ReceiptScreen({ scooter, cost, secs, user, onDone }) {
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

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab }) {
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
