export default function Loader() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:80 }}>
      <div style={{ width:28, height:28, borderRadius:"50%", border:"3px solid rgba(0,212,170,.2)",
        borderTopColor:"#00d4aa", animation:"spin .7s linear infinite" }} />
    </div>
  );
}
