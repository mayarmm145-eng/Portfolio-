import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Hinge architecture inspired by Ksenia Kondrashova's MIT laptop example.
// No controls, webcam, post-processing, or reference/demo screen is loaded.
const anchor = document.querySelector('.qa-laptop-anchor');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width:768px)');
const story = window.qaInvestigation;
let renderer, master, scene, camera, model, lid, display, texture;
let visible = false, initialized = false, started = false, failed = false;
let drawPending = 0, environment;
const host = document.createElement('div');
host.className = 'macbook-stage'; host.setAttribute('aria-hidden', 'true');
anchor.append(host);
anchor.dataset.modelState = 'loading';

function fallback() {
  if (failed) return;
  failed = true; master?.kill(); cancelAnimationFrame(drawPending);
  anchor.classList.remove('model-ready'); anchor.dataset.modelState = 'fallback';
  host.remove(); renderer?.dispose(); texture?.dispose();environment?.dispose();
  scene?.traverse(object => {object.geometry?.dispose(); if(object.material) for(const m of [object.material].flat()) m.dispose();});
  story?.release();
}
function render() {
  drawPending = 0;
  if (!initialized || failed || !visible || document.hidden) return;
  if (display.opacity > 0) texture.needsUpdate = true;
  renderer.render(scene, camera);
}
function invalidate() {
  if (!drawPending && visible && !document.hidden && !failed) drawPending = requestAnimationFrame(render);
}
function resize() {
  if (!renderer || !initialized) return;
  const width = anchor.clientWidth, height = anchor.clientHeight;
  if (!width || !height) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, compact.matches ? 1.25 : 1.75));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  // Fit the entire OPEN model, not its animated current bounds. This avoids
  // a camera jump while opening and guarantees clearance on all four edges.
  const angle = lid.rotation.x;
  lid.rotation.x = -.15; model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const rtl = document.documentElement.dir === 'rtl';
  const direction = new THREE.Vector3(compact.matches ? 9 : (rtl ? -27 : 27), compact.matches ? 17 : 21, 62).normalize();
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), direction).normalize();
  const up = new THREE.Vector3().crossVectors(direction,right).normalize();
  const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  let distance = 0;
  model.traverse(mesh=>{
    const positions=mesh.geometry?.attributes.position;
    if(!positions)return;
    for(let i=0;i<positions.count;i++){
      const p=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld).sub(center);
      distance=Math.max(distance,Math.abs(p.dot(right))/(tangent*camera.aspect)+p.dot(direction),Math.abs(p.dot(up))/tangent+p.dot(direction));
    }
  });
  camera.position.copy(center).addScaledVector(direction,distance*1.035);
  camera.lookAt(center); camera.updateProjectionMatrix();
  lid.rotation.x = angle; model.updateMatrixWorld(true); invalidate();
}
function begin() {
  if (!initialized || started || !visible || document.hidden || failed) return;
  started = true; story.hold();
  anchor.classList.add('model-ready');
  if (reduced.matches) {
    lid.rotation.x = -.15; display.opacity = 1;
    anchor.dataset.modelState = 'open'; story.finish(); invalidate(); return;
  }
  anchor.dataset.modelState = 'closed';
  const entrance = gsap.timeline({paused:true}).fromTo(model.position,{y:compact.matches?0:.2},{y:0,duration:.5,ease:'power2.out'});
  const opening = gsap.timeline({paused:true}).to(lid.rotation,{x:-.15,duration:1,ease:'power3.inOut'});
  const power = gsap.timeline({paused:true}).to(display,{opacity:1,duration:.65,ease:'sine.inOut'});
  const investigation = gsap.timeline({paused:true}).call(()=>{anchor.dataset.modelState='open';story.start();}).to({},{duration:.01});
  master = gsap.timeline({paused:true,onUpdate:invalidate});
  master.to(entrance,{progress:1,duration:.5,ease:'none'},.2).call(()=>{anchor.dataset.modelState='opening'},[],.65)
    .to(opening,{progress:1,duration:1,ease:'none'},.65)
    .to(power,{progress:1,duration:.65,ease:'none'},1.35)
    .call(()=>investigation.play(0),[],2.1);
  render();
  requestAnimationFrame(()=>{if(visible&&!document.hidden)master.play(0)});
  invalidate();
}
function visibility() {
  if (failed) return;
  if (visible && !document.hidden) {begin();master?.resume();story?.suspend(false);invalidate();}
  else {master?.pause();story?.suspend(true);cancelAnimationFrame(drawPending);drawPending=0;}
}
function keyboardTexture() {
  const canvas = document.createElement('canvas'); canvas.width=1024; canvas.height=430;
  const c=canvas.getContext('2d');c.fillStyle='#1b1319';c.fillRect(0,0,1024,430);
  const rows=['1234567890−=⌫','QWERTYUIOP[]','ASDFGHJKL;↵','ZXCVBNM,./↑'];
  rows.forEach((letters,r)=>[...letters].forEach((char,k)=>{
    const x=12+k*76,y=12+r*79;c.fillStyle='#392b32';c.beginPath();c.roundRect(x,y,67,66,6);c.fill();c.strokeStyle='#74515d';c.lineWidth=1;c.stroke();c.fillStyle='#e4b9c8';c.font='15px Arial';c.fillText(char,x+11,y+22);
  }));
  c.fillStyle='#392b32';c.beginPath();c.roundRect(258,334,502,66,6);c.fill();c.stroke();
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
}
async function init() {
  try {
    if (!story) throw new Error('Screen unavailable');
    const canvas=document.createElement('canvas');
    const settings={alpha:true,antialias:!compact.matches,powerPreference:'low-power'};
    const context=canvas.getContext('webgl2',settings);
    if(!context)throw new Error('WebGL unavailable');
    renderer = new THREE.WebGLRenderer({canvas,context,...settings});
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback()},{once:true});
    host.append(renderer.domElement);
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,1,.1,500);
    const gltf=await new GLTFLoader().loadAsync('assets/models/macbook.glb');
    if(failed)return;
    model=new THREE.Group();lid=new THREE.Group();const base=new THREE.Group();
    scene.add(model);model.add(lid,base);
    for(const child of [...gltf.scene.children]) {
      if(child.name==='_top')lid.add(child);
      else if(child.name==='_bottom')base.add(child);
    }
    if(!lid.children.length||!base.children.length)throw new Error('Incomplete laptop');
    const metal=new THREE.MeshStandardMaterial({color:'#b2a0a2',metalness:.82,roughness:.27});
    const plastic=new THREE.MeshStandardMaterial({color:'#100c11',metalness:.12,roughness:.6});
    model.traverse(mesh=>{if(!mesh.isMesh)return;mesh.material.dispose();mesh.material=['base','lid'].includes(mesh.name)?metal:plastic;});
    // The current live canvas is the sole source of dashboard/lens pixels.
    texture=new THREE.CanvasTexture(story.canvas);texture.colorSpace=THREE.SRGBColorSpace;
    texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;
    display=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:0,toneMapped:false});
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(29.4,20),display);screen.position.set(0,10.5,.01);lid.add(screen);
    const black=new THREE.Mesh(new THREE.PlaneGeometry(29.4,20),new THREE.MeshBasicMaterial({color:'#080509'}));black.position.set(0,10.5,0);lid.add(black);
    const keys=new THREE.Mesh(new THREE.PlaneGeometry(27.7,11.6),new THREE.MeshBasicMaterial({map:keyboardTexture(),toneMapped:false}));keys.rotation.x=-Math.PI/2;keys.position.set(0,.047,7.21);base.add(keys);
    const room=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);
    environment=pmrem.fromScene(room,.04,.1,100,{size:compact.matches?64:128});scene.environment=environment.texture;scene.environmentIntensity=.75;room.dispose();pmrem.dispose();
    const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;
    const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(128,128,24,128,128,128);
    gradient.addColorStop(0,'rgba(9,2,6,.65)');gradient.addColorStop(.6,'rgba(9,2,6,.35)');gradient.addColorStop(1,'rgba(9,2,6,0)');sc.fillStyle=gradient;sc.fillRect(0,0,256,256);
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(39,31),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(0,-1.05,10);scene.add(shadow);
    scene.add(new THREE.HemisphereLight('#f8e7ea','#321522',1.3));
    const key=new THREE.DirectionalLight('#ffe6db',3.2);key.position.set(-18,35,32);scene.add(key);
    const rim=new THREE.DirectionalLight('#d58da4',2);rim.position.set(25,20,-15);scene.add(rim);
    // Contact shading is a static CSS radial shadow below the model, not
    // a per-frame shadow map. Phones have only these three inexpensive lights.
    lid.rotation.x=Math.PI/2;
    initialized=true;resize();begin();
    new ResizeObserver(resize).observe(anchor);
    compact.addEventListener('change',resize);
    document.addEventListener('site-language-change',resize);
    document.addEventListener('qa-investigation-frame',invalidate);
    reduced.addEventListener('change',()=>{
      if(reduced.matches){master?.kill();lid.rotation.x=-.15;display.opacity=1;anchor.dataset.modelState='open';story.finish();invalidate();}
      else if(started)story.start();
    });
  } catch (error) { anchor.dataset.modelFailure=error.message; fallback(); }
}
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;visibility()},{threshold:.01}).observe(anchor);
document.addEventListener('visibilitychange',visibility);
init();
