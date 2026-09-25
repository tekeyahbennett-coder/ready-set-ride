import { useState, useRef, useEffect } from "react";

// ─── GPS Map ──────────────────────────────────────────────────────────────────
export default function MapView({ userPos, scooterList, onSelectScooter }) {
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
