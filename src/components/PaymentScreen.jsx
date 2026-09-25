import { useState } from "react";
import Field from "./ui/Field.jsx";
import Btn from "./ui/Btn.jsx";
import Toast from "./ui/Toast.jsx";
import { fmt$ } from "../utils.js";
import { CARD_BRANDS } from "../constants.js";

// ─── Payment Methods ───────────────────────────────────────────────────────────
export default function PaymentScreen({ user, onUpdate, onBack }) {
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
