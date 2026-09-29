(() => {
 const anchor=document.querySelector('.qa-laptop-anchor'),screen=anchor.querySelector('.locked-screen');
 const canvas=screen.querySelector('canvas'),ctx=canvas.getContext('2d');
 const buffer=document.createElement('canvas');buffer.width=1200;buffer.height=660;const g=buffer.getContext('2d');
 const W=1200,H=660, mobile=matchMedia('(max-width:600px)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const tour=document.querySelector('.qa-tour'),dots=[...tour.querySelectorAll('.qa-tour-dot')],pause=tour.querySelector('.qa-tour-pause');
 const note=document.querySelector('#hero-evidence-note');
 const labels=['Compare the payment','Compare the refund','Trace the technical evidence','Explain the impact'];
 const arLabels=['قارن الدفعة','قارن الاسترداد','تتبّع الدليل التقني','وضّح الأثر'];
 const details=['Both states record the same 75.000 KWD payment.','Expected refund: 65.000 KWD. Recorded: 55.000 KWD. The remaining 10.000 KWD attempt failed.','Illustrative API evidence; stale booking state is a root-cause hypothesis, not a confirmed conclusion.','The customer is still owed 10.000 KWD. This reconstructed example contains no client data.'];
 const arDetails=['الحالتان تسجّلان الدفعة نفسها: 75.000 د.ك.','الاسترداد المتوقع: 65.000 د.ك. المسجّل: 55.000 د.ك. فشلت محاولة استرداد الـ10.000 د.ك المتبقية.','دليل API توضيحي؛ حالة الحجز القديمة فرضية للسبب الجذري وليست نتيجة مؤكدة.','لا يزال للعميل 10.000 د.ك. هذا مثال توضيحي لا يحتوي بيانات عملاء.'];
 let t=reduce.matches?8.8:0,last=0,paused=reduce.matches,visible=true,phase=-1,raf=0,held=false,suspended=false;
 // Solve the projective map from the UI rectangle to the photograph's inner display.
 function fit(){
  const k=anchor.clientWidth/1671;
  screen.style.top=Math.max(0,anchor.clientHeight-anchor.clientWidth*941/1671)+'px';
  const reflected=document.documentElement.dir==='rtl'&&matchMedia('(min-width:1101px)').matches;
  const corners=reflected?[[74,124],[1132,98],[1213,660],[155,783]]:[[539,98],[1597,124],[1516,783],[458,660]];
  const src=[[0,0],[W,0],[W,H],[0,H]],dst=corners.map(p=>p.map(n=>n*k));
  const a=[],b=[];src.forEach(([x,y],i)=>{const[u,v]=dst[i];a.push([x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]);b.push(u,v)});
  for(let i=0;i<8;i++){let p=i;for(let j=i+1;j<8;j++)if(Math.abs(a[j][i])>Math.abs(a[p][i]))p=j;[a[i],a[p]]=[a[p],a[i]];[b[i],b[p]]=[b[p],b[i]];let d=a[i][i];for(let c=i;c<8;c++)a[i][c]/=d;b[i]/=d;for(let j=0;j<8;j++)if(j!==i){d=a[j][i];for(let c=i;c<8;c++)a[j][c]-=d*a[i][c];b[j]-=d*b[i]}}
  const[a0,a1,a2,a3,a4,a5,a6,a7]=b;screen.style.transform=`matrix3d(${a0},${a3},0,${a6},${a1},${a4},0,${a7},0,0,1,0,${a2},${a5},0,1)`;
 }
 function box(c,x,y,w,h,fill,stroke,r=14){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke()}}
 function text(c,s,x,y,size=20,color='#eddee5',weight=400){c.font=`${weight} ${size}px Arial, sans-serif`;c.fillStyle=color;c.fillText(s,x,y)}
 function mobileUI(time){
  g.clearRect(0,0,W,H);g.fillStyle='#180e16';g.fillRect(0,0,W,H);
  text(g,'Refund investigation',32,47,36,'#fff0f4',700);
  const targets=[];
  [false,true].forEach((bad,i)=>{
   const y=72+i*214;box(g,24,y,1152,197,bad?'#2d1723':'#17241f',bad?'#96576e':'#587060');
   text(g,bad?'Broken State · FAIL':'Healthy State · PASS',46,y+39,44,bad?'#f1b3c9':'#c4d9ce',700);
   const rows=bad?[['Payment charged','75.000 KWD'],['Refund recorded','55.000 KWD'],['Refund failed','10.000 KWD remaining']]:[['Payment charged','75.000 KWD'],['Refund processed','65.000 KWD'],['Reconciliation','Correct']];
   rows.forEach(([label,value],j)=>{const ry=y+83+j*43;text(g,label,46,ry,48,'#ead7e0',500);g.textAlign='right';text(g,value,1152,ry,50,bad&&j===2?'#ffb2cb':'#fff0f4',700);g.textAlign='left';if(j<2)targets.push({x:940,y:ry-10});});
  });
  const trace=time<6?'Expected 65.000 · Recorded 55.000':time<8?'POST /api/refunds → 403':'P1 Financial · 10.000 KWD still owed';
  text(g,trace,32,548,31,'#f1c5d4',700);
  text(g,time<6?'Same payment. Different refund outcome.':time<8?'INVALID_REFUND_AMOUNT':'Hypothesis: stale booking state — verify ordering.',32,593,28,'#d2b8c4');
  text(g,'Reconstructed example · No client data',32,635,23,'#bfa5b0');
  return [targets[0],targets[2],targets[1],{x:960,y:455}];
 }
 function ui(time){
  if(mobile.matches)return mobileUI(time);
  g.clearRect(0,0,W,H);g.fillStyle='#180e16';g.fillRect(0,0,W,H);
  text(g,'Refund State Investigation',32,46,31,'#fff0f4',700);
  text(g,'Same flow. Different outcome.',32,76,18,'#bfa5b0');text(g,'ILLUSTRATIVE / INV-002',946,42,15,'#bda0ab',600);
  const stacked=mobile.matches,cardH=stacked?151:257,cardW=stacked?1136:556;
  const cards=stacked?[[32,96],[32,260]]:[[32,102],[612,102]];
  let targets=[];
  cards.forEach(([x,y],i)=>{
   const bad=!!i;box(g,x,y,cardW,cardH,bad?'#2d1723':'#17241f',bad?'#714455':'#3f5a4b');
   text(g,bad?'Broken State':'Healthy State',x+20,y+30,22,bad?'#f1c5d4':'#c4d9ce',700);
   text(g,bad?'FAIL':'PASS',x+cardW-68,y+30,16,bad?'#ee9db6':'#9fbda9',700);
   const rows=bad?[['Booking cancelled','Cancelled'],['Payment charged','75.000 KWD'],['Refund failed','10.000 KWD remaining'],['Difference','+10.000 KWD']]:[['Booking cancelled','Cancelled'],['Payment charged','75.000 KWD'],['Refund processed','65.000 KWD'],['Reconciled correctly','PASS']];
   rows.forEach(([label,value],j)=>{
    const ry=y+(stacked?53:72)+j*(stacked?23:45),size=stacked?19:20;
    if(bad&&j===2&&time>=5){let pulse=time<6?Math.sin((time-5)*Math.PI):0;box(g,x+10,ry-23,cardW-20,stacked?25:38,`rgba(168,67,100,${.12+pulse*.14})`,null,5)}
    text(g,label,x+20,ry,size,bad&&j===2?'#f0a5bd':'#decfd6',j===2?600:400);
    g.textAlign='right';text(g,value,x+cardW-20,ry,size,bad&&j>=2?'#f3b3c9':'#e7eae6',600);g.textAlign='left';
    if(j===1||j===2)targets.push({i,j,x:x+cardW*(stacked?.12:(i===1&&j===2?.24:.82)),y:ry-7});
   });
  });
  const traceY=stacked?428:389;
  text(g,'End-to-End Investigation Trace',32,traceY,20,'#ecd5df',600);
  const names=['UI','API','Data State / Hypothesis','User & Business Impact'];
  const lines=[['Refund failed','Recorded refund: 55.000 KWD'],['POST /api/refunds → 403','INVALID_REFUND_AMOUNT'],['Booking state = stale','Cancellation committed before'],['Customer overcharged: 10.000 KWD','Refund reconciliation incorrect']];
  for(let i=0;i<4;i++){
   const on=time>=5+i; const x=32+i*289, y=traceY+16;box(g,x,y,270,stacked?114:139,on?'#392030':'#21151f',on?'#986078':'#422a39');
   text(g,names[i],x+12,y+26,i>1?16:19,on?'#f2ccdb':'#987e8b',700);
   if(on){text(g,lines[i][0],x+12,y+58,i===3?14:16,'#f0dce5',600);text(g,lines[i][1],x+12,y+83,i>1?13:14,'#d3b8c6');if(i===2)text(g,'refund service refresh',x+12,y+104,13,'#d3b8c6');if(i===3)text(g,'P1 FINANCIAL',x+12,y+106,13,'#f2a9c2',700)}
  }
  text(g,'Expected refund 65.000 − recorded 55.000 = 10.000 KWD still owed.',32,stacked?598:593,17,'#bfa5b0');
  text(g,'Reconstructed evidence • Root cause requires verification',32,631,14,'#a88b99');
  return [targets.find(p=>p.i===0&&p.j===1),targets.find(p=>p.i===1&&p.j===1),targets.find(p=>p.i===0&&p.j===2),targets.find(p=>p.i===1&&p.j===2)];
 }
 function draw(){
  const targets=ui(t);ctx.clearRect(0,0,W,H);ctx.save();ctx.globalAlpha=Math.min(1,t*2+.1);ctx.translate(0,8*(1-Math.min(1,t)));ctx.drawImage(buffer,0,0);ctx.restore();
  let p=targets[0];if(t>=2&&t<5){const segment=Math.min(2,Math.floor(t)-2),u=Math.min(1,(t-(segment+2))/.8),ease=u*u*(3-2*u),a=targets[segment],b=targets[segment+1];p={x:a.x+(b.x-a.x)*ease,y:a.y+(b.y-a.y)*ease}}else if(t>=5)p=targets[3];
  let alpha=t<1?0:t<1.2?(t-1)/.2:t>9?(9.5-t)/.5:1;alpha=Math.max(0,alpha);
  if(alpha){ctx.save();ctx.globalAlpha=alpha;const r=52*(t>=5&&t<6?1+.035*Math.sin((t-5)*Math.PI):1);ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.clip();const zoom=1.65;ctx.drawImage(buffer,p.x-r/zoom,p.y-r/zoom,2*r/zoom,2*r/zoom,p.x-r,p.y-r,2*r,2*r);ctx.restore();
   ctx.strokeStyle='#cfa8b7';ctx.lineWidth=2;ctx.shadowColor='#0008';ctx.shadowBlur=7;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle='#8f6e7e';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x+r*.73,p.y+r*.73);ctx.lineTo(p.x+r*1.25,p.y+r*1.25);ctx.stroke();ctx.strokeStyle='#fff3';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,r-7,3.8,5.1);ctx.stroke();
   if(t>=5){box(ctx,p.x-48,p.y+20,96,28,'#311222ee','#ad6881',5);text(ctx,'⚠ Mismatch detected',p.x-42,p.y+31,8,'#ffd0df',600);text(ctx,'+10.000 KWD',p.x-32,p.y+42,9,'#ffd0df',700)}ctx.restore();
  }
  document.dispatchEvent(new Event('qa-investigation-frame'));
  const nextPhase=t<3?0:t<6?1:t<8?2:3;if(nextPhase!==phase){phase=nextPhase;sync()}
 }
 function sync(){const ar=document.documentElement.lang==='ar';document.getElementById('screen-description').lang='en';note.querySelector('.qa-tour-kicker').textContent=ar?'تحقيق استرداد / مثال توضيحي':'REFUND INVESTIGATION / ILLUSTRATIVE';note.querySelector('strong').textContent=(ar?arLabels:labels)[phase<0?0:phase];note.querySelector('.qa-tour-detail').textContent=(ar?arDetails:details)[phase<0?0:phase];note.setAttribute('aria-live',paused?'polite':'off');dots.forEach((dot,i)=>{dot.classList.toggle('is-active',i===phase);dot.setAttribute('aria-label',(ar?arLabels:labels)[i]);if(i===phase)dot.setAttribute('aria-current','step');else dot.removeAttribute('aria-current')});pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',ar?(paused?'استئناف التحقيق':'إيقاف التحقيق'):(paused?'Resume investigation':'Pause investigation'))}
 function seek(i){t=[1.3,3.3,6.5,8.8][(i+4)%4];paused=true;phase=-1;draw();sync()}
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>seek(i)));tour.querySelector('.qa-tour-prev').addEventListener('click',()=>seek(phase-1));tour.querySelector('.qa-tour-next').addEventListener('click',()=>seek(phase+1));pause.addEventListener('click',()=>{paused=!paused;sync();wake()});
 function schedule(){
  if(!raf&&!held&&!paused&&!suspended&&visible&&!document.hidden) raf=requestAnimationFrame(tick);
 }
 function tick(now){
  raf=0;
  if(held||paused||suspended||!visible||document.hidden){last=0;return;}
  const interval=mobile.matches?1000/30:1000/60;
  if(!last||now-last>=interval-1){if(last)t=(t+Math.min(.1,(now-last)/1000))%9.5;last=now;draw();}
  schedule();
 }
 function wake(){cancelAnimationFrame(raf);raf=0;last=0;schedule();}
 function resolution(){const ratio=mobile.matches?.75:1;canvas.width=W*ratio;canvas.height=H*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);draw();}
 window.qaInvestigation={canvas,
  hold(){held=true;t=0;phase=-1;wake();draw()},
  start(){held=false;paused=reduce.matches;t=reduce.matches?8.8:0;phase=-1;draw();sync();wake()},
  finish(){held=false;paused=true;t=8.8;phase=-1;draw();sync();wake()},
  release(){held=false;paused=reduce.matches;draw();wake()},
  suspend(value){suspended=value;wake()}
 };
 document.addEventListener('visibilitychange',wake);
 mobile.addEventListener('change',resolution);
 new ResizeObserver(fit).observe(anchor);new IntersectionObserver(e=>{visible=e[0].isIntersecting;wake()},{threshold:.05}).observe(anchor);
 reduce.addEventListener('change',()=>{paused=reduce.matches;if(paused)t=8.8;draw();sync();wake()});document.addEventListener('site-language-change',()=>{fit();sync()});
 matchMedia('(min-width:1101px)').addEventListener('change',fit);
 fit();resolution();draw();schedule();
})();
