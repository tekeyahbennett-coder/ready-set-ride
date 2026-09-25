import { useState } from "react";
import Field from "./ui/Field.jsx";
import Btn from "./ui/Btn.jsx";
import Toast from "./ui/Toast.jsx";
import { randomPast } from "../utils.js";

// ─── Auth Screens ─────────────────────────────────────────────────────────────
export default function AuthScreen({ onAuth }) {
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
