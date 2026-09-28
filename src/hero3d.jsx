import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const visual = document.querySelector('.hero-visual');
const mount = visual?.querySelector('.qa-scene-canvas');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const ink = '#170b10';
const rose = '#d99aab';

function texture(draw, width = 1400, height = 850) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const c = canvas.getContext('2d');
  draw(c, width, height);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}
function round(c, x, y, w, h, r, fill, stroke) {
  c.beginPath(); c.roundRect(x,y,w,h,r);
  if(fill){c.fillStyle=fill;c.fill();}
  if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}
}
function label(c,text,x,y,size=18,color='#f4dfe4',weight=500){const arabic=document.documentElement.lang==='ar';c.fillStyle=color;c.font=`${weight} ${size}px ${arabic?'Cairo, Arial':'Arial'}, sans-serif`;c.textAlign='left';c.direction=arabic?'rtl':'ltr';c.fillText(window.siteTranslate?.(text) ?? text,x,y);c.direction='ltr';}
const wording = (en, ar) => document.documentElement.lang === 'ar' ? ar : en;
const referenceScreen = new Image();
function drawDashboard(c,w,h,step=0) {
  if (document.documentElement.lang !== 'ar' && referenceScreen.complete && referenceScreen.naturalWidth) {
    c.clearRect(0,0,w,h);
    c.drawImage(referenceScreen,0,0,w,h);
    if(step===3){
      round(c,250,672,710,72,12,'rgba(105,30,49,.86)','#e89aab');
      label(c,'INV-001   REFUND MISMATCH   ·   5.000 KWD DISCREPANCY',274,720,28,'#fff1f2',700);
    }
    return;
  }
  c.clearRect(0,0,w,h);
  const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#391521');bg.addColorStop(1,'#170910');c.fillStyle=bg;c.fillRect(0,0,w,h);
  round(c,25,25,w-50,h-50,24,'#210e17','#69404b');
  c.fillStyle='#2c111d';c.fillRect(25,25,205,h-50);
  c.fillStyle='#c89eaa';c.font='700 25px Arial';c.fillText('MM / QA',55,83);
  const menu=[wording('Overview','نظرة عامة'),wording('Investigations','التحقيقات'),wording('Evidence','الأدلة'),wording('Reports','التقارير')];
  menu.forEach((item,i)=>{if(i===1)round(c,42,142+i*90,175,66,12,'#683144');label(c,item,56,183+i*90,25,i===1?'#fff1f3':'#c9a7af',i===1?700:500);});
  label(c,wording('QA / INVESTIGATION','ضمان الجودة / التحقيق'),270,80,28,'#e9b6c1',700);
  label(c,wording('A refund changed the invoice state','الاسترداد غيّر حالة الفاتورة'),270,139,43,'#fff0f2',700);
  c.strokeStyle='#71414d';c.lineWidth=2;c.beginPath();c.moveTo(270,164);c.lineTo(w-48,164);c.stroke();
  const cards=[
    {x:270,title:wording('PAYMENT','المدفوع'),value:'25.000',foot:wording('KWD · confirmed','د.ك · مؤكد')},
    {x:645,title:wording('REFUND','المسترد'),value:'5.000',foot:wording('KWD · issued','د.ك · تم الاسترداد')},
    {x:1020,title:wording('NET RETAINED','الصافي'),value:'20.000',foot:wording('KWD · retained','د.ك · المتبقي')}
  ];
  cards.forEach((card,i)=>{
    const active=step===i;round(c,card.x,190,345,215,16,active?'#5a2638':'#321721',active?'#f4b2c3':'#65404c');
    label(c,card.title,card.x+24,235,25,'#e9b6c1',700);
    label(c,card.value,card.x+24,320,63,'#fff3f4',700);
    label(c,card.foot,card.x+24,371,23,'#d2aeb8');
  });
  round(c,270,445,1095,167,16,'#301823',step>=2?'#d68599':'#65404c');
  label(c,wording('INVOICE STATUS AFTER REFUND','حالة الفاتورة بعد الاسترداد'),300,492,27,'#e7b7c2',700);
  round(c,300,516,285,64,10,step>=2?'#8d304b':'#482938');
  label(c,step>=2?wording('UNPAID','غير مدفوعة'):wording('PAID','مدفوعة'),321,561,39,'#fff1f2',700);
  label(c,step>=2?wording('5.000 KWD shown as due','يظهر 5.000 د.ك مستحقًا'):wording('No amount due','لا يوجد مبلغ مستحق'),615,557,32,step>=2?'#ffabb5':'#dfc2c9',600);
  round(c,270,641,1095,148,16,step===3?'#652638':'#28131d',step===3?'#f4a8b7':'#67404b');
  label(c,wording('EXPECTED','المتوقع'),300,685,25,'#e8adbc',700);
  label(c,wording('Paid · partially refunded · 0 due','مدفوعة · مستردة جزئيًا · المستحق صفر'),300,748,38,'#fff0f2',700);
}
const dashboard = texture((c,w,h)=>drawDashboard(c,w,h,0));
referenceScreen.onload=()=>{
 drawDashboard(dashboard.image.getContext('2d'),1400,850,0);
 dashboard.needsUpdate=true;
 window.dispatchEvent(new Event('qa-screen-ready'));
};
referenceScreen.src='assets/qa-dashboard-reference.webp';
const keyboard = texture((c,w,h)=>{
  const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#271820');bg.addColorStop(1,'#170f15');c.fillStyle=bg;c.fillRect(0,0,w,h);
  for(let row=0;row<5;row++)for(let col=0;col<14;col++){
    const x=24+col*83,y=17+row*78;
    round(c,x+2,y+5,73,64,7,'#08070a');
    const key=c.createLinearGradient(x,y,x,y+60);key.addColorStop(0,'#4b303a');key.addColorStop(.3,'#30222a');key.addColorStop(1,'#18141b');
    round(c,x,y,73,58,7,key,'#76515e');
    c.fillStyle='#b898a3';c.font='500 13px Arial';c.fillText(row===0?String((col+1)%10):'QWERTYUIOPASDFGHJKLZXCVBNM'[row*5+col]??'·',x+11,y+21);
  }
},1200,420);
function Dashboard({still}) {
 const ref=useRef();const map=useMemo(()=>dashboard,[]);const {invalidate}=useThree();
 useEffect(()=>{const update=e=>{drawDashboard(map.image.getContext('2d'),1400,850,e.detail.index);map.needsUpdate=true;invalidate();};window.addEventListener('qa-tour-step',update);window.addEventListener('qa-screen-ready',invalidate);return()=>{window.removeEventListener('qa-tour-step',update);window.removeEventListener('qa-screen-ready',invalidate);};},[map,invalidate]);
 useEffect(()=>{if(!ref.current)return;const o=ref.current;o.position.y=still?.65:.3;o.scale.setScalar(still?1:.92);if(!still){const t=gsap.timeline({delay:2.12,onUpdate:invalidate});t.to(o.position,{y:.65,duration:.73,ease:'power3.out'}).to(o.scale,{x:1,y:1,z:1,duration:.73,ease:'power3.out'},0);return()=>t.kill();}},[still,invalidate]);
 return <group ref={ref} position={[-.35,.36,-1.15]} rotation={[-.025,.11,-.09]}>
  <group rotation={[-.025,0,0]}>
   <RoundedBox args={[11.95,7.4,.34]} radius={.26} smoothness={4} castShadow><meshPhysicalMaterial color="#2c111b" metalness={.65} roughness={.29} clearcoat={.65}/></RoundedBox>
   <mesh position={[0,0,.181]}><planeGeometry args={[11.65,7.05]}/><meshBasicMaterial map={map} toneMapped={false}/></mesh>
   <mesh position={[0,0,.191]}><planeGeometry args={[11.75,7.15]}/><meshPhysicalMaterial color="#edb5be" transparent opacity={.035} metalness={.3} roughness={.2} depthWrite={false}/></mesh>
  </group>
  <mesh position={[0,-3.76,-.02]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.14,.14,11.5,20]}/><meshStandardMaterial color="#bc8491" metalness={.8} roughness={.25}/></mesh>
  <RoundedBox args={[11.9,.32,5.55]} radius={.16} smoothness={4} position={[0,-4.12,2.45]} castShadow receiveShadow><meshPhysicalMaterial color="#57313b" metalness={.68} roughness={.27} clearcoat={.72}/></RoundedBox>
  <RoundedBox args={[10.8,.055,3.3]} radius={.08} smoothness={3} position={[0,-3.82,1.83]}><meshStandardMaterial color="#21151c" metalness={.3} roughness={.42}/></RoundedBox>
  <mesh position={[0,-3.765,1.83]} rotation={[-Math.PI/2,0,0]} renderOrder={20}><planeGeometry args={[10.75,3.25]}/><meshBasicMaterial map={keyboard} side={THREE.DoubleSide} toneMapped={false} depthTest={false} depthWrite={false}/></mesh>
  <RoundedBox args={[3.65,.014,1.12]} radius={.04} smoothness={2} position={[0,-3.84,4.2]}><meshStandardMaterial color="#4d2b35" metalness={.52} roughness={.38}/></RoundedBox>
  <mesh position={[0,-4.30,5.20]}><boxGeometry args={[11.45,.045,.1]}/><meshStandardMaterial color="#c28b96" metalness={.8} roughness={.25}/></mesh>
  {[2.95,3.55,4.15].map((z,i)=><mesh key={z} position={[5.971,-4.115,z]}><boxGeometry args={[.008,.043,i===0?.31:.2]}/><meshBasicMaterial color="#100a10"/></mesh>)}
 </group>;
}
const contact = texture((c,w,h)=>{c.clearRect(0,0,w,h);c.save();c.translate(w/2,h/2);c.scale(1,.42);const g=c.createRadialGradient(0,0,8,0,0,w*.45);g.addColorStop(0,'rgba(4,1,3,.72)');g.addColorStop(.55,'rgba(9,2,5,.43)');g.addColorStop(1,'rgba(9,2,5,0)');c.fillStyle=g;c.fillRect(-w/2,-h,w,h*2);c.restore();},512,256);
function Desk({compact}){
 return <group>
  <mesh position={[0,-3.645,2.1]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[15,8]}/><meshBasicMaterial map={contact} transparent depthWrite={false} opacity={.9}/></mesh>
  <mesh position={[0,-3.66,1.5]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[compact?20:24,11]}/><shadowMaterial transparent opacity={.38}/></mesh>
 </group>;
}
function Scene({compact,still}){
 return <>
  <ambientLight intensity={.58} color="#e5aab6"/><directionalLight position={[-3,6,6]} intensity={2.3} color="#f8ded4" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-normalBias={.035} shadow-radius={3}/><directionalLight position={[4,1,3]} intensity={.85} color="#da9ca8"/><directionalLight position={[2,3,-3]} intensity={1.2} color="#d8a1ad"/>
  <group scale={compact?.74:1} position={compact?[.04,-.3,0]:[0,0,0]}>
   <Desk compact={compact}/><Dashboard still={still}/>
  </group>
 </>;
}
function CameraRig({compact}){
 const {camera,invalidate}=useThree();
 useEffect(()=>{camera.position.set(0,compact?3.5:4.2,compact?19:20.5);camera.fov=compact?34:39;camera.lookAt(compact?0:-1.3,compact?-1.4:-1.45,0);camera.updateProjectionMatrix();invalidate();},[compact,camera,invalidate]);
 return null;
}
function MarkFirstFrame(){
 const marked=useRef(false);
 useFrame(()=>{if(!marked.current){marked.current=true;visual.classList.add('scene-ready');}});
 return null;
}
function App(){
 const [compact,setCompact]=useState(innerWidth<800);
 useEffect(()=>{const update=()=>setCompact(innerWidth<800);addEventListener('resize',update);return()=>removeEventListener('resize',update);},[]);
 const still=reduced.matches;
 return <Canvas shadows frameloop="demand" camera={{position:[0,compact?3.5:4.2,compact?19:20.5],fov:compact?34:39,near:.1,far:70}} gl={{alpha:true,antialias:true,powerPreference:'low-power'}} dpr={[1,compact?1.25:1.5]} onCreated={({gl,camera})=>{camera.lookAt(compact?0:-1.3,compact?-1.4:-1.45,0);gl.outputColorSpace=THREE.SRGBColorSpace;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.4;gl.domElement.addEventListener('webglcontextlost',()=>{visual.classList.remove('scene-ready');visual.classList.add('scene-failed');},{once:true});}}><MarkFirstFrame/><CameraRig compact={compact}/><Scene compact={compact} still={still}/></Canvas>;
}
class SceneErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={failed:false};}
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error){visual.classList.remove('scene-ready');visual.classList.add('scene-failed');console.warn('Using the static scene because WebGL is unavailable.',error);}
  render(){return this.state.failed?null:this.props.children;}
}
if(visual&&mount&&!reduced.matches){
  let supported=false;
  try {
    const probe=document.createElement('canvas');
    supported=Boolean(probe.getContext('webgl2',{powerPreference:'low-power'}));
  } catch (_) { supported=false; }
  if(supported) createRoot(mount).render(<SceneErrorBoundary><App/></SceneErrorBoundary>);
  else visual.classList.add('scene-failed');
}
