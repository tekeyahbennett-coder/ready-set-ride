export default function Btn({ children, onClick, variant="primary", disabled, style: sx={}, loading }) {
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
