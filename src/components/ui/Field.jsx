import { useState } from "react";

export default function Field({ label, type="text", value, onChange, placeholder, error, icon, suffix, maxLength }) {
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
