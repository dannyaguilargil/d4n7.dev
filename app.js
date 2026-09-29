// GPU point sculpture: dissolve into embers, travel and reconstruct at section titles.
const eagle = document.querySelector('#eagle');
const motion = document.querySelector('#motion');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
const sections = [...document.querySelectorAll('main > section[id]')];
const perches = new Map([...document.querySelectorAll('[data-perch]')].map(el => [el.dataset.perch, el]));
const canvas = document.createElement('canvas');
canvas.setAttribute('aria-hidden', 'true');
eagle.replaceChildren(canvas);
const gl = canvas.getContext('webgl', {alpha:true, antialias:false, premultipliedAlpha:false});
let frame=0, ready=false;
const resting=document.createElement('div');resting.className='eagle-rest';
const detailed=new Image();detailed.src='assets/eagle-idle.png';detailed.alt='';detailed.className='eagle-detailed';resting.append(detailed);eagle.append(resting);
const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=(a,b,value)=>{const t=clamp((value-a)/(b-a));return t*t*(3-2*t)};
let pointer={x:0,y:0}, drift={x:0,y:0};
function perch(id){const r=perches.get(id).getBoundingClientRect();return {id,x:r.left,y:r.top+(r.height-r.width)/2,size:r.width}}
function scrollScene(){
 let previous=sections[0];
 for(let i=1;i<sections.length;i++){
  const next=sections[i],top=next.getBoundingClientRect().top;
  const progress=clamp((innerHeight*.9-top)/(innerHeight*.62));
  if(progress===0)return {from:perch(previous.id),to:perch(previous.id),progress:1};
  if(progress<1)return {from:perch(previous.id),to:perch(next.id),progress};
  previous=next;
 }
 return {from:perch(previous.id),to:perch(previous.id),progress:1};
}
function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render)}
function syncMotion(){motion.textContent=paused?'◎ Activar movimiento':'◎ Pausar movimiento';motion.setAttribute('aria-pressed',String(paused));eagle.classList.toggle("motion-paused",paused);schedule()}
motion.onclick=()=>{paused=!paused;syncMotion()};
reducedMotion.addEventListener('change',e=>{paused=e.matches;syncMotion()});
addEventListener('scroll',schedule,{passive:true});
addEventListener('pointermove',e=>{pointer={x:e.clientX/innerWidth-.5,y:e.clientY/innerHeight-.5};schedule()},{passive:true});
addEventListener('resize',()=>{resize();schedule()});
document.fonts.ready.then(schedule);
new ResizeObserver(schedule).observe(document.body);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else schedule()});
function resize(){const d=Math.min(devicePixelRatio,1.7);canvas.width=Math.round(innerWidth*d);canvas.height=Math.round(innerHeight*d);if(gl)gl.viewport(0,0,canvas.width,canvas.height)}
let program, uniforms={}, count=0;
function shader(type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh}
function setup(){
 const vertex=`precision highp float;
 attribute vec3 aPosition; attribute vec4 aColor; attribute vec3 aSeed;
 uniform vec2 uResolution,uPointer; uniform vec3 uFrom,uTo; uniform float uProgress,uTime,uDpr,uMotion;
 varying vec4 vColor; varying float vAsh;
 void main(){
 float delay=aSeed.x*.16;
 float p=clamp((uProgress-delay)/(1.0-delay),0.0,1.0);
 float travel=smoothstep(.12,.88,p);
 float ash=sin(3.14159265*p); ash=pow(max(ash,0.0),.75);
 vec3 box=mix(uFrom,uTo,travel);
 vec3 local=aPosition;
 float angle=0.0;
 float cy=cos(angle),sy=sin(angle);
 local.x=aPosition.x*cy+aPosition.z*sy;
 local.z=-aPosition.x*sy+aPosition.z*cy;
 // Restrained mechanical feather motion, not whole-image flapping.
 float wing=smoothstep(.12,.42,abs(local.x));

 local.z+=sin(uTime*.65)*.013*wing*uMotion;
 float perspective=1.0;
 vec2 at=box.xy+box.z*(local.xy*perspective+vec2(.5));
 float swirl=uProgress*5.0+aSeed.y*6.283;
 vec2 debris=vec2(cos(swirl)*(70.0+180.0*aSeed.z),sin(swirl)*80.0-100.0*aSeed.y);
 at+=debris*ash;
 at.y-=sin(travel*3.14159265)*100.0;

 vec2 clip=at/uResolution*2.0-1.0;
 gl_Position=vec4(clip.x,-clip.y,local.z*.1,1.0);
 gl_PointSize=clamp(box.z/240.0*1.7, .9, 4.2)*uDpr*mix(1.0,1.25,ash);
 vec3 ember=mix(vec3(.59,.77,.30),vec3(1.0,.53,.17),step(.83,aSeed.y));
 vColor=vec4(mix(aColor.rgb,ember,ash*.78),aColor.a*mix(1.0,.9,ash));vAsh=ash;
 }`;
 const fragment=`precision mediump float; varying vec4 vColor; varying float vAsh;
 void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float alpha=1.0-smoothstep(.25,.5,r);gl_FragColor=vec4(vColor.rgb,vColor.a*alpha);}`;
 program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('WebGL linking failed');gl.useProgram(program);
 for(const key of ['Resolution','Pointer','From','To','Progress','Time','Dpr','Motion'])uniforms[key]=gl.getUniformLocation(program,'u'+key);
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
}
function fallback(){eagle.dataset.renderer='fallback';canvas.style.display='none';ready=true;schedule()}
function render(now){
 frame=0;if(!ready)return;
 let {from,to,progress}=scrollScene();
 const noEffects=paused||!gl||eagle.dataset.renderer==='fallback';
 if(noEffects){to=progress<.5?from:to;from=to;progress=1}
 const dissolve=smooth(0,.18,progress),assemble=smooth(.82,1,progress);
 const opacity=1-dissolve+assemble;
 const pose=progress<.5?from:to;
 resting.style.width=pose.size+'px';resting.style.height=pose.size+'px';
 resting.style.transform=`translate3d(${pose.x}px,${pose.y}px,0)`;
 resting.style.opacity=opacity;
 drift.x+=(pointer.x-drift.x)*.04;drift.y+=(pointer.y-drift.y)*.04;
 detailed.style.setProperty('--look',paused?'0deg':(drift.x*7)+'deg');
 detailed.style.setProperty('--nod',paused?'0deg':(-drift.y*4)+'deg');
 eagle.dataset.section=pose.id;eagle.dataset.phase=opacity<.99?'ashes':'perched';eagle.dataset.progress=progress.toFixed(4);
 if(!noEffects){
  canvas.style.opacity=1-opacity;
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(uniforms.Resolution,innerWidth,innerHeight);gl.uniform2f(uniforms.Pointer,0,0);
  gl.uniform3f(uniforms.From,from.x,from.y,from.size);gl.uniform3f(uniforms.To,to.x,to.y,to.size);
  gl.uniform1f(uniforms.Progress,progress);gl.uniform1f(uniforms.Time,0);
  gl.uniform1f(uniforms.Dpr,canvas.width/innerWidth);gl.uniform1f(uniforms.Motion,0);
  if(opacity<1)gl.drawArrays(gl.POINTS,0,count);
 }else canvas.style.opacity=0;
 // Particles depend exclusively on scroll, never on elapsed time.
 if(!paused&&(Math.abs(pointer.x-drift.x)>.001||Math.abs(pointer.y-drift.y)>.001))schedule();
}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;fallback()},{once:true});
if(gl){
 try{setup();
 const source=new Image();source.onload=()=>{
  try{
   const sample=document.createElement('canvas');sample.width=sample.height=260;const c=sample.getContext('2d',{willReadFrequently:true});c.drawImage(source,0,0,260,260);const data=c.getImageData(0,0,260,260).data;const points=[],colors=[],seeds=[];
   for(let y=0;y<260;y++)for(let x=0;x<260;x++){const i=(y*260+x)*4;if(data[i+3]<65)continue;
    const nx=x/260-.5,ny=y/260-.5;const light=(data[i]+data[i+1]+data[i+2])/765;
    const depth=Math.exp(-nx*nx*22)*.16+light*.065-Math.abs(nx)*.05;
    points.push(nx,ny,depth);colors.push(data[i]/255,data[i+1]/255,data[i+2]/255,data[i+3]/255);
    const hash=Math.sin(x*127.1+y*311.7)*43758.5453;const rand=hash-Math.floor(hash);
    seeds.push(rand,(Math.sin(x*13+y*71)*.5+.5),(Math.cos(x*37+y*11)*.5+.5));
   }
   for(const [name,values,size] of [['aPosition',points,3],['aColor',colors,4],['aSeed',seeds,3]]){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,size,gl.FLOAT,false,0,0)}
   count=points.length/3;eagle.dataset.particles=count;ready=true;resize();schedule();
  }catch(error){console.warn('Eagle fallback:',error.message);fallback()}
 };source.onerror=fallback;source.src='assets/eagle-idle.png';
 }catch(error){console.warn('Eagle fallback:',error.message);fallback()}
}else fallback();
resize();syncMotion();
document.querySelector('#open-terminal').onclick=()=>{document.querySelector('#lab').scrollIntoView({behavior:paused?'auto':'smooth'});setTimeout(()=>document.querySelector('#command').focus({preventScroll:true}),450)};const output=document.querySelector('#terminal-output');function print(text,green=false){const p=document.createElement('p');p.textContent=text;if(green)p.className='green';output.append(p);output.scrollTop=output.scrollHeight}const answers={help:'help → comandos · whoami → perfil · projects → proyectos · stack → tecnologías · matrix → secuencia · clear → limpiar',whoami:'d4n7 · Programación, curiosidad y mentalidad hacker. Explorar. Entender. Construir.',projects:'01 Ghost Protocol · 02 Syntax Studio · 03 Null Space. Explora las fichas de proyectos para conocer cada concepto.',stack:'JavaScript / Python / Linux / Git / Web APIs / Creative coding',matrix:'01000100 00110100 01001110 00110111\nWake up, developer. El siguiente paso es crear.'};document.querySelector('#terminal-form').onsubmit=e=>{e.preventDefault();const input=document.querySelector('#command'),cmd=input.value.trim().toLowerCase();input.value='';if(!cmd)return;if(cmd==='clear'){output.replaceChildren();return}print('guest@d4n7:~$ '+cmd,true);print(answers[cmd]||'Comando desconocido. Escribe help para ver las opciones.');if(cmd==='projects')document.querySelector('#proyectos').scrollIntoView({behavior:paused?'auto':'smooth'})};document.querySelector('#clear').onclick=()=>output.replaceChildren();const projects=[['Ghost Protocol','Un concepto para explorar cómo viajan los datos. Representa nodos, conexiones y eventos de una red en una interfaz que permite comprender su estructura. Enfocado en entornos de aprendizaje y análisis autorizado.',['Python','Networks','Security']],['Syntax Studio','Un concepto de espacio de trabajo para experimentar con código, organizar fragmentos y explorar interfaces. La idea: reducir la distancia entre una pregunta y un prototipo.',['JavaScript','Web APIs','UI / UX']],['Null Space','Un concepto de laboratorio para explorar estructuras tridimensionales, proyección en perspectiva y geometría generativa mediante código.',['Canvas','3D Math','Creative coding']]];const dialog=document.querySelector('#project-dialog');document.querySelectorAll('[data-project]').forEach(el=>el.onclick=()=>{const [title,desc,tags]=projects[el.dataset.project];document.querySelector('#detail-title').textContent=title;document.querySelector('#detail-text').textContent=desc;document.querySelector('#detail-tags').replaceChildren(...tags.map(t=>{const s=document.createElement('span');s.textContent=t;return s}));dialog.showModal()});document.querySelector('#close-dialog').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});document.querySelector('#detail-lab').onclick=()=>{dialog.close();document.querySelector('#open-terminal').click()};document.querySelector('#copy-domain').onclick=async()=>{try{await navigator.clipboard.writeText('d4n7.dev');document.querySelector('#copy-status').textContent='d4n7.dev copiado al portapapeles.'}catch{document.querySelector('#copy-status').textContent='Dominio: d4n7.dev · Selecciona este texto para copiarlo.'}};
