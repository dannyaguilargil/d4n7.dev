// Águila ilustrada: profundidad al cursor y dos poses al pulsar.
const eagle = document.querySelector('#eagle');
const visual = document.querySelector('.eagle-visual');
const motion = document.querySelector('#motion');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
function syncMotion() {
  motion.textContent = paused ? '◎ Activar movimiento' : '◎ Pausar movimiento';
  motion.setAttribute('aria-pressed', String(paused));
  visual.classList.toggle('motion-paused', paused);
  eagle.style.setProperty('--turn-x', '0deg');
  eagle.style.setProperty('--turn-y', '0deg');
}
syncMotion();
motion.onclick = () => { paused = !paused; syncMotion(); };
reducedMotion.addEventListener('change', event => { paused = event.matches; syncMotion(); });
eagle.addEventListener('pointermove', event => {
  if (paused || event.pointerType === 'touch') return;
  const bounds = eagle.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - .5;
  const y = (event.clientY - bounds.top) / bounds.height - .5;
  eagle.style.setProperty('--turn-x', `${-y * 9}deg`);
  eagle.style.setProperty('--turn-y', `${x * 14}deg`);
});
eagle.addEventListener('pointerleave', () => {
  eagle.style.setProperty('--turn-x', '0deg');
  eagle.style.setProperty('--turn-y', '0deg');
});
eagle.addEventListener('click', () => {
  const spread = eagle.getAttribute('aria-pressed') !== 'true';
  eagle.setAttribute('aria-pressed', String(spread));
  eagle.setAttribute('aria-label', spread ? 'Replegar alas del águila cibernética' : 'Desplegar alas del águila cibernética');
  visual.classList.toggle('wings-open', spread);
  document.querySelector('#eagle-state').textContent = spread ? 'ALAS DESPLEGADAS' : 'EN GUARDIA';
  document.querySelector('#eagle-hint').textContent = spread ? 'PULSA PARA REPLEGAR' : 'PULSA PARA DESPLEGAR';
});
document.querySelector('#open-terminal').onclick=()=>{document.querySelector('#lab').scrollIntoView({behavior:paused?'auto':'smooth'});setTimeout(()=>document.querySelector('#command').focus({preventScroll:true}),450)};const output=document.querySelector('#terminal-output');function print(text,green=false){const p=document.createElement('p');p.textContent=text;if(green)p.className='green';output.append(p);output.scrollTop=output.scrollHeight}const answers={help:'help → comandos · whoami → perfil · projects → proyectos · stack → tecnologías · matrix → secuencia · clear → limpiar',whoami:'d4n7 · Programación, curiosidad y mentalidad hacker. Explorar. Entender. Construir.',projects:'01 Ghost Protocol · 02 Syntax Studio · 03 Null Space. Explora las fichas de proyectos para conocer cada concepto.',stack:'JavaScript / Python / Linux / Git / Web APIs / Creative coding',matrix:'01000100 00110100 01001110 00110111\nWake up, developer. El siguiente paso es crear.'};document.querySelector('#terminal-form').onsubmit=e=>{e.preventDefault();const input=document.querySelector('#command'),cmd=input.value.trim().toLowerCase();input.value='';if(!cmd)return;if(cmd==='clear'){output.replaceChildren();return}print('guest@d4n7:~$ '+cmd,true);print(answers[cmd]||'Comando desconocido. Escribe help para ver las opciones.');if(cmd==='projects')document.querySelector('#proyectos').scrollIntoView({behavior:paused?'auto':'smooth'})};document.querySelector('#clear').onclick=()=>output.replaceChildren();const projects=[['Ghost Protocol','Un concepto para explorar cómo viajan los datos. Representa nodos, conexiones y eventos de una red en una interfaz que permite comprender su estructura. Enfocado en entornos de aprendizaje y análisis autorizado.',['Python','Networks','Security']],['Syntax Studio','Un concepto de espacio de trabajo para experimentar con código, organizar fragmentos y explorar interfaces. La idea: reducir la distancia entre una pregunta y un prototipo.',['JavaScript','Web APIs','UI / UX']],['Null Space','Un concepto de laboratorio para explorar estructuras tridimensionales, proyección en perspectiva y geometría generativa mediante código.',['Canvas','3D Math','Creative coding']]];const dialog=document.querySelector('#project-dialog');document.querySelectorAll('[data-project]').forEach(el=>el.onclick=()=>{const [title,desc,tags]=projects[el.dataset.project];document.querySelector('#detail-title').textContent=title;document.querySelector('#detail-text').textContent=desc;document.querySelector('#detail-tags').replaceChildren(...tags.map(t=>{const s=document.createElement('span');s.textContent=t;return s}));dialog.showModal()});document.querySelector('#close-dialog').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});document.querySelector('#detail-lab').onclick=()=>{dialog.close();document.querySelector('#open-terminal').click()};document.querySelector('#copy-domain').onclick=async()=>{try{await navigator.clipboard.writeText('d4n7.dev');document.querySelector('#copy-status').textContent='d4n7.dev copiado al portapapeles.'}catch{document.querySelector('#copy-status').textContent='Dominio: d4n7.dev · Selecciona este texto para copiarlo.'}};
