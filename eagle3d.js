import * as THREE from 'three';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';

// AQUILA: articulated solid geometry and continuous scroll flight. No image is used by the 3D render.
const host = document.querySelector('#eagle');
const perches = new Map([...document.querySelectorAll('[data-perch]')].map(el=>[el.dataset.perch,el]));
const sections = [...document.querySelectorAll('main > section[id]')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduce.matches, renderer, running = 0, failed = false;
const clamp = THREE.MathUtils.clamp;
const smooth = (a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
function perch(id){const r=perches.get(id).getBoundingClientRect();return {id,x:r.left,y:r.top+(r.height-r.width)/2,size:r.width}}
function scrollScene(){let prev=sections[0];for(let i=1;i<sections.length;i++){const next=sections[i],p=clamp((innerHeight*.9-next.getBoundingClientRect().top)/(innerHeight*.62),0,1);if(p===0)return {from:perch(prev.id),to:perch(prev.id),p:1};if(p<1)return {from:perch(prev.id),to:perch(next.id),p};prev=next}return {from:perch(prev.id),to:perch(prev.id),p:1}}
function fallback(){failed=true;host.replaceChildren();const img=new Image();img.src='assets/eagle-idle.png';img.alt='';host.append(img);host.dataset.renderer='fallback';const update=()=>{const s=scrollScene(),p=s.p<.5?s.from:s.to;img.style.cssText=`position:absolute;width:${p.size}px;transform:translate(${p.x}px,${p.y}px)`};update();addEventListener('scroll',update,{passive:true});addEventListener('resize',update)}
try { initialize(); } catch(error){console.warn('Aquila 3D unavailable:',error.message);fallback()}

function initialize(){
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.5:2));renderer.setSize(innerWidth,innerHeight);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 host.replaceChildren(renderer.domElement);host.dataset.renderer='threejs';
 const scene=new THREE.Scene();
 const camera=new THREE.OrthographicCamera(-innerWidth/2,innerWidth/2,innerHeight/2,-innerHeight/2,.1,3000);camera.position.z=1200;
 const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const environment=pmrem.fromScene(room,.035);scene.environment=environment.texture;scene.environmentIntensity=.7;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xe8eddf,0x131710,.6));
 const key=new THREE.DirectionalLight(0xf3f5ea,3.2);key.position.set(-300,400,700);scene.add(key);
 const rim=new THREE.DirectionalLight(0xd5e5be,2.4);rim.position.set(400,150,-400);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xc1ff58,1.5);fill.position.set(-450,-50,-200);scene.add(fill);
 const root=new THREE.Group();scene.add(root);const model=new THREE.Group();root.add(model);
 function metal(color,roughness=.3,metalness=.9){return new THREE.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:.38,clearcoatRoughness:.28})}
 const graphite=metal(0x252c25,.3), titanium=metal(0x818b79,.25), edge=metal(0x4e5945,.26), black=metal(0x090d09,.42), beakMetal=metal(0xb6bdae,.2);
 const accentMetal=metal(0x708447,.26,.7), deepMetal=metal(0x303b29,.29,.75);accentMetal.side=deepMetal.side=THREE.DoubleSide;
 const lime=metal(0xc1ff58,.22,.55);lime.emissive=new THREE.Color(0x9be532);lime.emissiveIntensity=1.35;
 const sphere=new THREE.SphereGeometry(1,24,16);
 function mesh(g,m,parent=model,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o}
 function ellipsoid(parent,x,y,z,sx,sy,sz,m){const o=mesh(sphere,m,parent,x,y,z);o.scale.set(sx,sy,sz);return o}
 function rod(parent,a,b,r,m){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);const o=mesh(new THREE.CylinderGeometry(r,r,d.length(),12),m,parent);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o}
 function curveTube(parent,pts,r,m){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),18,r,7,false),m,parent)}
 // Feather shell with a raised central ridge and tapered, curved edges.
 function featherGeometry(){const vertices=[],indices=[];const rows=14;
 for(let i=0;i<=rows;i++){const t=i/rows;const w=t===1?.003:.5*Math.pow(Math.sin(Math.PI*(t*.96+.02)),.66)*(1-.32*t);const y=-t;const bend=.13*t*t;
 vertices.push(-w,y,bend,0,y,bend+.075*Math.sin(Math.PI*t),w,y,bend);
 }
 for(let i=0;i<rows;i++)for(let j=0;j<2;j++){const a=i*3+j,b=a+3;indices.push(a,b,a+1,a+1,b,b+1)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g}
 const featherGeo=featherGeometry();[graphite,titanium,edge,black].forEach(m=>m.side=THREE.DoubleSide);
 function feather(parent,x,y,z,w,l,angle,m=graphite){const o=mesh(featherGeo,m,parent,x,y,z);o.scale.set(w,l,w);o.rotation.z=angle;return o}
 // Chest and layered breastplate.
 ellipsoid(model,0,.02,0,.47,.78,.34,black);
 ellipsoid(model,0,.18,.16,.43,.59,.28,graphite);
 for(let row=0;row<6;row++){const y=.66-row*.2,spread=.31*(1-Math.abs(row-2)*.07);for(let side of [-1,1]){const f=feather(model,side*spread,y,.38+(2-Math.abs(row-2))*.035,.35,.49,side*-.36,row%2?edge:graphite);f.rotation.y=side*.25}}
 feather(model,0,.42,.46,.36,.72,0,titanium);
 // Sculpted shield plates replace the soft central breast silhouette.
 const shield=new THREE.Shape();shield.moveTo(0,.35);shield.lineTo(.18,.22);shield.lineTo(.14,-.07);shield.quadraticCurveTo(.07,-.29,0,-.38);shield.quadraticCurveTo(-.07,-.29,-.14,-.07);shield.lineTo(-.18,.22);shield.closePath();
 const shieldGeo=new THREE.ExtrudeGeometry(shield,{depth:.04,bevelEnabled:true,bevelSize:.018,bevelThickness:.025,bevelSegments:3,steps:1});
 mesh(shieldGeo,graphite,model,0,.10,.49);
 for(let side of [-1,1]){rod(model,[side*.14,.31,.57],[side*.105,.10,.565],.009,accentMetal);rod(model,[side*.105,.10,.565],[0,-.22,.55],.007,edge)}
 // Crest-shaped power cell on sternum.
 const chest=new THREE.Shape();chest.moveTo(-.07,.06);chest.lineTo(.07,.06);chest.lineTo(0,-.11);chest.closePath();mesh(new THREE.ExtrudeGeometry(chest,{depth:.016,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,steps:1}),lime,model,0,.28,.58);
 // Neck vertebrae and swept-back feather collar.
 for(let j=0;j<4;j++){ellipsoid(model,0,.65+j*.11,-j*.025,.27-j*.024,.15,.25-j*.02,j%2?edge:graphite);for(let side of [-1,1])feather(model,side*(.19-j*.018),.92+j*.08,-.035,.19,.34,side*-.48,edge)}
 const head=new THREE.Group();head.position.set(0,1.08,.055);model.add(head);
 ellipsoid(head,0,.14,.02,.27,.27,.30,titanium);
 ellipsoid(head,0,.26,-.08,.27,.15,.25,graphite);
 for(let j=0;j<3;j++){const crest=feather(head,(j-1)*.085,.43,-.08,.12,.34,0,j===1?accentMetal:edge);crest.rotation.x=-.9;}
 for(let i=0;i<5;i++)for(let side of [-1,1]){const f=feather(head,side*(.07+i*.025),.39-i*.047,-.10-i*.022,.18,.35,-side*.35,graphite);f.rotation.x=-.65;f.rotation.y=side*.65}
 // Hooked beak, extruded in the lateral direction, points toward +Z.
 const profile=new THREE.Shape();profile.moveTo(.17,.21);profile.bezierCurveTo(.39,.23,.59,.08,.60,-.08);profile.lineTo(.52,-.22);profile.bezierCurveTo(.51,-.07,.40,-.025,.24,-.04);profile.lineTo(.15,.06);profile.closePath();
 const bg=new THREE.ExtrudeGeometry(profile,{depth:.19,steps:1,bevelEnabled:true,bevelThickness:.022,bevelSize:.022,bevelSegments:3,curveSegments:20});bg.translate(0,0,-.095);bg.rotateY(-Math.PI/2);mesh(bg,beakMetal,head,0,.01,0);
 for(let side of [-1,1]){
 ellipsoid(head,side*.232,.18,.17,.052,.07,.09,black);
 ellipsoid(head,side*.263,.181,.185,.023,.034,.052,lime);
 const brow=ellipsoid(head,side*.238,.253,.18,.065,.035,.14,graphite);brow.rotation.z=side*-.22;
 ellipsoid(head,side*.105,.094,.354,.018,.022,.042,black);
 }
 // Slim illuminated cheek seams emphasize the predatory eye line.
 for(let side of [-1,1]){rod(head,[side*.245,.22,.12],[side*.265,.20,.24],.006,lime);rod(head,[side*.25,.23,.19],[side*.29,.275,.01],.015,graphite)}
 // Two articulated wing chains, shoulder bearings and primary metal feathers.
 const wings=[];
 for(let side of [-1,1]){
 const wing=new THREE.Group();wing.position.set(side*.36,.52,-.04);wing.scale.x=side;model.add(wing);wings.push(wing);
 ellipsoid(wing,.08,.04,0,.22,.22,.20,titanium);
 const hub=mesh(new THREE.TorusGeometry(.125,.026,8,32),edge,wing,.09,.06,.175);hub.rotation.y=.18;
 mesh(new THREE.TorusGeometry(.072,.008,6,24),lime,wing,.09,.06,.203);
 rod(wing,[.10,.06,0],[.82,.42,-.08],.075,titanium);
 rod(wing,[.15,-.025,.06],[.84,.30,-.03],.034,black);
 const tip=new THREE.Group();tip.position.set(.78,.34,-.08);wing.add(tip);wing.userData.tip=tip;
 ellipsoid(tip,0,0,0,.12,.12,.12,edge);rod(tip,[0,0,0],[.92,.06,-.05],.055,titanium);
 // Long primary feathers form the unmistakable broad eagle fan.
 for(let i=0;i<10;i++){
 const x=.17+i*.15,y=.32+i*.025;
 const f=feather(wing,x,y,.07-i*.009,.22,1.10+i*.048,.20+i*.052,i>6?deepMetal:(i%3===0?accentMetal:graphite));f.rotation.y=-.12;
 }
 for(let i=0;i<9;i++){
 const f=feather(tip,.10+i*.11,.09+i*.008,.015,.23,1.15-i*.044,.42+i*.07,i>5?deepMetal:(i%3===0?accentMetal:edge));f.rotation.y=-.08;
 }
 // Overlapping covert rows catch studio highlights without painted texture.
 for(let row=0;row<3;row++)for(let i=0;i<10-row;i++)feather(wing,.1+i*.13,.29-row*.13+i*.025,.12+row*.045,.21,.42+row*.07,.2+i*.03,row===0?accentMetal:((i+row)%3?graphite:edge));
 for(let i=0;i<3;i++)rod(wing,[.3+i*.22,.28+i*.04,.20],[.40+i*.22,.10+i*.04,.21],.006,lime);
 }
 // Tail fan, articulated shins and curved talons.
 for(let i=-3;i<=3;i++){const f=feather(model,i*.085,-.56,-.18,.19,.90-Math.abs(i)*.05,-i*.09, i%2?deepMetal:accentMetal);f.rotation.x=-.18}
 for(let side of [-1,1]){
 ellipsoid(model,side*.25,-.65,.07,.17,.25,.18,graphite);rod(model,[side*.24,-.69,.08],[side*.26,-1.02,.20],.052,titanium);
 for(let j=0;j<3;j++)mesh(new THREE.TorusGeometry(.058,.012,6,16),edge,model,side*.26,-.87-j*.06,.19).rotation.x=Math.PI/2;
 for(let toe=-1;toe<=1;toe++){const x=side*.26+toe*.068;curveTube(model,[[side*.26,-1.05,.2],[x,-1.10,.35],[x+toe*.028,-1.16,.44],[x+toe*.032,-1.23,.40]],.023,beakMetal)}
 }
 // Real lettering attached to the breastplate, drawn as a texture label only.
 const labelCanvas=document.createElement('canvas');labelCanvas.width=256;labelCanvas.height=80;const c=labelCanvas.getContext('2d');c.font='500 42px monospace';c.textAlign='center';c.fillStyle='#b4c1c1';c.fillText('d4n7',128,52);const labelTexture=new THREE.CanvasTexture(labelCanvas);labelTexture.colorSpace=THREE.SRGBColorSpace;
 const label=mesh(new THREE.PlaneGeometry(.26,.082),new THREE.MeshBasicMaterial({map:labelTexture,transparent:true,depthWrite:false}),model,0,.08,.572);
 // Exposed servo links, feather conductors and compact optical sensors.
 wings.forEach(wing=>{
  rod(wing,[.2,.12,.20],[.74,.36,.16],.021,titanium);
  rod(wing,[.26,.10,.22],[.55,.24,.20],.032,black);
  for(let i=0;i<4;i++){
   const rail=feather(wing,.30+i*.23,.21+i*.025,.21,.018,.44+i*.08,.3+i*.07,lime);
   rail.rotation.y=-.1;
  }
 });
 for(let side of [-1,1]){
  const sensor=mesh(new THREE.TorusGeometry(.053,.008,8,28),titanium,head,side*.271,.18,.18);sensor.rotation.y=Math.PI/2;
  rod(model,[side*.28,.39,.41],[side*.19,-.12,.40],.008,lime);
 }
 let meshCount=0;model.traverse(o=>{if(o.isMesh)meshCount++});host.dataset.meshes=meshCount;
 let px=0,py=0,dx=0,dy=0,last=0,elapsed=0,previousScroll=scrollY,bank=0,direction=0,lastDirection=0;
 addEventListener('pointermove',e=>{px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5;request()},{passive:true});
 function request(){if(!running&&!document.hidden&&!failed)running=requestAnimationFrame(frame)}
 function frame(now){running=0;const dt=last?Math.min((now-last)/1000,.06):0;last=now;if(!paused)elapsed+=dt;
 const s=scrollScene();if(paused){s.from=s.to=s.p<.5?s.from:s.to;s.p=1}
 const p=s.p,travel=smooth(0,1,p),flight=Math.sin(p*Math.PI);
 const size=THREE.MathUtils.lerp(s.from.size,s.to.size,travel)+flight*28;
 const x=clamp(THREE.MathUtils.lerp(s.from.x,s.to.x,travel)+flight*45,0,Math.max(0,innerWidth-size)),y=THREE.MathUtils.lerp(s.from.y,s.to.y,travel)-flight*55;
 root.position.set(x+size/2-innerWidth/2,innerHeight/2-y-size/2,0);root.scale.setScalar(size/5.5);
 dx=THREE.MathUtils.damp(dx,paused?0:px,4,dt);dy=THREE.MathUtils.damp(dy,paused?0:py,4,dt);
 const delta=scrollY-previousScroll;
 const velocity=clamp(delta/Math.max(dt,1/60)/1800,-1,1);previousScroll=scrollY;
 if(Math.abs(delta)>.15)lastDirection=Math.sign(delta);
 direction=THREE.MathUtils.damp(direction,paused?0:lastDirection*flight,5,dt);
 bank=THREE.MathUtils.damp(bank,paused?0:velocity,5,dt);
 const angle=-.60+dx*.25+direction*.22;
 // Positive pitch exposes the back in descent; negative pitch raises the beak in ascent.
 model.rotation.set(dy*.07+direction*.72,angle,-direction*.14+Math.sin(elapsed*.38)*.009);
 model.position.y=Math.sin(elapsed*(flight>0.01?4:.8))*(.018+flight*.03);
 head.rotation.y=dx*.25+Math.sin(elapsed*.26)*.035;head.rotation.x=dy*.08+direction*.24;
 // Idle wing display on the hero; stronger wingbeats while travelling.
 const heroRest=s.from.id==='inicio'&&s.to.id==='inicio';
 const idle=heroRest?.23:.025;
 const amplitude=paused?0:THREE.MathUtils.lerp(idle,.68,flight);
 const beat=elapsed*(heroRest?1.55:4.5);
 wings.forEach((wing,i)=>{const sign=i===0?-1:1;
  wing.rotation.z=-sign*(.30*(1-flight)+Math.sin(beat)*amplitude*.58);
  wing.rotation.y=sign*(.12+Math.cos(beat)*amplitude);
  wing.userData.tip.rotation.y=sign*Math.cos(beat-.65)*amplitude*.72;
  wing.userData.tip.rotation.z=-sign*Math.sin(beat-.45)*amplitude*.12;
 });
 host.dataset.section=travel<.5?s.from.id:s.to.id;host.dataset.phase=flight>.05?'flying':(heroRest?'idle-wingbeat':'perched');host.dataset.progress=p.toFixed(4);host.dataset.direction=flight<.05?'rest':lastDirection<0?'up':'down';
 renderer.render(scene,camera);if(!paused)request();
 }
 function resize(){renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.5:2));renderer.setSize(innerWidth,innerHeight);camera.left=-innerWidth/2;camera.right=innerWidth/2;camera.top=innerHeight/2;camera.bottom=-innerHeight/2;camera.updateProjectionMatrix();request()}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',resize);document.fonts.ready.then(request);
 addEventListener('aquila-motion',e=>{paused=e.detail.paused;request()});reduce.addEventListener('change',e=>{paused=e.matches;request()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(running);running=0;last=0}else request()});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(running);fallback()},{once:true});
 request();
}
