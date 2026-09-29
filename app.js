// One decorative companion follows the currently visible section.
const eagle = document.querySelector('#eagle');
const motion = document.querySelector('#motion');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const sections = [...document.querySelectorAll('main > section[id]')];
const perches = new Map([...document.querySelectorAll('[data-perch]')].map(el => [el.dataset.perch, el]));
let paused = reducedMotion.matches;
let activePerch = null;
let frame = 0;
let flight = null;
let position = null;
let hidden = false;
function destination() {
  const guide = innerHeight * .38;
  let id = 'inicio';
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= guide) id = section.id;
  }
  if (id === 'inicio' && perches.get('header').getBoundingClientRect().bottom > 20) id = 'header';
  const rect = perches.get(id).getBoundingClientRect();
  const size = rect.width;
  return { id, x: rect.left, y: rect.top + (rect.height - size) / 2, size };
}
function paint(p) {
  position = p;
  eagle.style.width = `${p.size}px`;
  eagle.style.height = `${p.size}px`;
  eagle.style.transform = `translate3d(${p.x}px,${p.y}px,0)`;
  eagle.style.opacity = hidden ? '0' : '1';
}
function schedule() { if (!frame) frame = requestAnimationFrame(update); }
function update(now) {
  frame = 0;
  const target = destination();
  if (activePerch !== target.id) {
    activePerch = target.id;
    eagle.dataset.section = target.id;
    if (position && !paused && !hidden) {
      // Start from the rendered position even if another flight is interrupted.
      flight = { start: now, from: { ...position }, duration: 1050 };
    } else flight = null;
  }
  if (flight && !paused) {
    const progress = Math.min(1, (now - flight.start) / flight.duration);
    const ease = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    const from = flight.from;
    const arc = Math.sin(progress * Math.PI);
    paint({ x: from.x + (target.x - from.x) * ease,
      y: from.y + (target.y - from.y) * ease - arc * 65,
      size: from.size + (target.size - from.size) * ease + arc * 22 });
    eagle.classList.add('is-flying');
    if (progress < 1) schedule();
    else { flight = null; eagle.classList.remove('is-flying'); paint(target); }
  } else { flight = null; eagle.classList.remove('is-flying'); paint(target); }
}
function syncMotion() {
  motion.textContent = paused ? '◎ Activar movimiento' : '◎ Pausar movimiento';
  motion.setAttribute('aria-pressed', String(paused));
  eagle.classList.toggle('motion-paused', paused);
  if (paused) flight = null;
  schedule();
}
motion.onclick = () => { paused = !paused; syncMotion(); };
reducedMotion.addEventListener('change', e => { paused = e.matches; syncMotion(); });
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule);
addEventListener('pageshow', schedule);
document.fonts.ready.then(schedule);
new ResizeObserver(schedule).observe(document.body);
document.addEventListener('visibilitychange', () => {
  hidden = document.hidden;
  if (hidden) { cancelAnimationFrame(frame); frame = 0; flight = null; }
  else schedule();
});
syncMotion();
document.querySelector('#open-terminal').onclick=()=>{document.querySelector('#lab').scrollIntoView({behavior:paused?'auto':'smooth'});setTimeout(()=>document.querySelector('#command').focus({preventScroll:true}),450)};const output=document.querySelector('#terminal-output');function print(text,green=false){const p=document.createElement('p');p.textContent=text;if(green)p.className='green';output.append(p);output.scrollTop=output.scrollHeight}const answers={help:'help → comandos · whoami → perfil · projects → proyectos · stack → tecnologías · matrix → secuencia · clear → limpiar',whoami:'d4n7 · Programación, curiosidad y mentalidad hacker. Explorar. Entender. Construir.',projects:'01 Ghost Protocol · 02 Syntax Studio · 03 Null Space. Explora las fichas de proyectos para conocer cada concepto.',stack:'JavaScript / Python / Linux / Git / Web APIs / Creative coding',matrix:'01000100 00110100 01001110 00110111\nWake up, developer. El siguiente paso es crear.'};document.querySelector('#terminal-form').onsubmit=e=>{e.preventDefault();const input=document.querySelector('#command'),cmd=input.value.trim().toLowerCase();input.value='';if(!cmd)return;if(cmd==='clear'){output.replaceChildren();return}print('guest@d4n7:~$ '+cmd,true);print(answers[cmd]||'Comando desconocido. Escribe help para ver las opciones.');if(cmd==='projects')document.querySelector('#proyectos').scrollIntoView({behavior:paused?'auto':'smooth'})};document.querySelector('#clear').onclick=()=>output.replaceChildren();const projects=[['Ghost Protocol','Un concepto para explorar cómo viajan los datos. Representa nodos, conexiones y eventos de una red en una interfaz que permite comprender su estructura. Enfocado en entornos de aprendizaje y análisis autorizado.',['Python','Networks','Security']],['Syntax Studio','Un concepto de espacio de trabajo para experimentar con código, organizar fragmentos y explorar interfaces. La idea: reducir la distancia entre una pregunta y un prototipo.',['JavaScript','Web APIs','UI / UX']],['Null Space','Un concepto de laboratorio para explorar estructuras tridimensionales, proyección en perspectiva y geometría generativa mediante código.',['Canvas','3D Math','Creative coding']]];const dialog=document.querySelector('#project-dialog');document.querySelectorAll('[data-project]').forEach(el=>el.onclick=()=>{const [title,desc,tags]=projects[el.dataset.project];document.querySelector('#detail-title').textContent=title;document.querySelector('#detail-text').textContent=desc;document.querySelector('#detail-tags').replaceChildren(...tags.map(t=>{const s=document.createElement('span');s.textContent=t;return s}));dialog.showModal()});document.querySelector('#close-dialog').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});document.querySelector('#detail-lab').onclick=()=>{dialog.close();document.querySelector('#open-terminal').click()};document.querySelector('#copy-domain').onclick=async()=>{try{await navigator.clipboard.writeText('d4n7.dev');document.querySelector('#copy-status').textContent='d4n7.dev copiado al portapapeles.'}catch{document.querySelector('#copy-status').textContent='Dominio: d4n7.dev · Selecciona este texto para copiarlo.'}};
