import {hardware,issues,order} from './compatibility.js';
const tasks=[
 {name:'Jugar videojuegos',steps:[[4,2],[2,1,3],[1,3,2]],texts:['El almacenamiento carga recursos en RAM.','La CPU calcula la lógica y la GPU prepara la imagen.','La GPU genera fotogramas mientras CPU y RAM actualizan el estado.']},
 {name:'Editar video',steps:[[4,2],[2,1,3],[3,1,4]],texts:['Se leen clips del almacenamiento hacia RAM.','CPU y GPU procesan efectos y cuadros.','El resultado se codifica y escribe en almacenamiento.']},
 {name:'Navegar por Internet',steps:[[6,0,1,2],[2,1,3],[1,4,2]],texts:['La interfaz de red entrega datos al sistema para cargar la página.','CPU y RAM interpretan el contenido y la GPU compone la vista.','El navegador puede guardar recursos en la caché del almacenamiento.']},
 {name:'Ejecutar programas',steps:[[4,2],[2,1],[1,2,4]],texts:['El sistema carga instrucciones desde el almacenamiento a RAM.','La CPU ejecuta instrucciones y consulta datos en RAM.','El programa actualiza datos y puede guardar archivos.']}
];
export function createExperiences({pc,names,changeView,reducedMotion}){
 const installed=Array(6).fill(null);
 let update=()=>{};
 function button(parent,text,action){
  const control=document.createElement('button');control.type='button';control.className='part-button';control.textContent=text;control.onclick=action;parent.append(control);return control;
 }
 function open(kind,view){
  update=()=>{};changeView(kind);
  view.innerHTML='<p class="simulation-note">Modelo educativo esquemático. Flujos conceptuales sin mediciones de rendimiento.</p><div class="experience-controls"></div><p class="piece-detail" role="status"></p>';
  pc.show(kind,installed,index=>{view.querySelector('.piece-detail').textContent=names[index]+' · '+(kind==='run'?roles[index]:(installed[index]?.name??'Ubicación pendiente de instalación.'))});
  return view.querySelector('.experience-controls');
 }
 const roles=['Conecta las piezas y sus interfaces de datos.','Ejecuta instrucciones y cálculos.','Guarda los datos de trabajo temporalmente.','Procesa gráficos y tareas paralelas.','Conserva archivos y programas.','Distribuye alimentación eléctrica a las piezas.'];
 function run(view){
  const controls=open('run',view);
  controls.innerHTML='<label>Actividad <select></select></label><div class="timeline" aria-label="Etapas"></div><p class="stage-text" role="status"></p><div class="activity-indicators"></div><div class="playback lab-actions"></div><p>Morado indica participación. Las partículas representan intercambio de datos. El bloque junto a los puertos representa la conexión de red.</p>';
  const select=controls.querySelector('select');
  tasks.forEach((task,i)=>select.add(new Option(task.name,i)));
  let step=0,elapsed=0,paused=reducedMotion.matches;
  const timeline=controls.querySelector('.timeline');
  const stages=['Carga','Procesamiento','Resultado'];
  function display(){
   const task=tasks[select.value];
   pc.stage(task.steps[step]);
   timeline.querySelectorAll('button').forEach((control,i)=>control.setAttribute('aria-pressed',String(i===step)));
   controls.querySelector('.stage-text').textContent=task.texts[step];
   const indicators=controls.querySelector('.activity-indicators');indicators.replaceChildren();
   for(const index of [1,2,3,4]){
    const indicator=document.createElement('span');indicator.textContent=names[index];indicator.className=task.steps[step].includes(index)?'involved':'';indicators.append(indicator);
   }
  }
  stages.forEach((stage,i)=>button(timeline,stage,()=>{step=i;elapsed=0;display()}));
  const playback=controls.querySelector('.playback');
  const pause=button(playback,paused?'Reanudar':'Pausar',()=>{paused=!paused;pc.pause(paused);pause.textContent=paused?'Reanudar':'Pausar'});
  button(playback,'Reiniciar',()=>{step=0;elapsed=0;display()});
  button(playback,'Paso siguiente',()=>{paused=true;pc.pause(true);pause.textContent='Reanudar';step=(step+1)%3;elapsed=0;display()});
  select.onchange=()=>{step=0;elapsed=0;display()};
  pc.pause(paused);display();
  update=delta=>{if(paused)return;elapsed+=delta;if(elapsed>=4){step=(step+1)%3;elapsed=0;display()}};
 }
 function build(view){
  const controls=open('build',view);
  controls.innerHTML='<p>Gabinete de ejemplo · ATX/mATX · GPU hasta 320 mm. Selecciona una pieza y pulsa Instalar, o arrástrala al gabinete.</p><progress max="6" value="0" aria-label="Progreso del ensamblaje"></progress><h4></h4><div class="assembly-steps" aria-label="Etapas de ensamblaje"></div><div class="available-parts"></div><div class="lab-actions assembly-actions"></div><p class="assembly-status" role="status"></p><div class="lab-actions check-results"></div><section class="primary-assembly"><h4>Comprobar y encender</h4><div class="lab-actions primary-actions"></div></section><details class="configuration"><summary>Mi configuración</summary><ul class="installed-summary"></ul></details>';
  let step=0,chosen=0,bootStep=-1,bootTime=0;
  const list=controls.querySelector('.available-parts'), actions=controls.querySelector('.assembly-actions'), status=controls.querySelector('.assembly-status');
  function ready(){return installed.every(Boolean)&&!issues(installed).length}
  function render(){
   const index=order[step];
   controls.querySelector('h4').textContent=(step+1)+' / 6 · '+names[index];
   controls.querySelector('progress').value=installed.filter(Boolean).length;
   list.replaceChildren();
   hardware[index].forEach((part,i)=>{
    const candidate=[...installed];candidate[index]=part;
    const compatible=issues(candidate).length===0;
    const connection=[part.socket,part.ddr,part.interface,part.format,part.length?part.length+' mm · PCIe':null].filter(Boolean).join(' · ')||(part.pcie?'ATX + EPS + PCIe 8 pines':'ATX + EPS');
    const control=button(list,'',()=>{chosen=i;render();list.children[i].focus({preventScroll:true})});control.classList.add('hardware-option');
    const title=document.createElement('strong');title.textContent=part.name;
    const meta=document.createElement('span');meta.textContent=connection;
    const compatibility=document.createElement('span');compatibility.textContent=compatible?'✓ Compatible con la selección actual':'⚠ Requiere otra configuración';
    control.append(title,meta,compatibility);control.draggable=true;
    control.setAttribute('aria-pressed',String(i===chosen));
    control.ondragstart=event=>{chosen=i;event.dataTransfer.setData('text/plain','hardware-piece')};
   });
   const steps=controls.querySelector('.assembly-steps');steps.replaceChildren();
   order.forEach((part,i)=>{
    const control=button(steps,(i+1)+'. '+names[part],()=>{step=i;chosen=0;render()});
    control.setAttribute('aria-current',i===step?'step':'false');
   });
   pc.target(index);previous.disabled=step===0;next.disabled=step===5;power.disabled=!ready();
   controls.querySelector('.installed-summary').replaceChildren(...installed.map((part,i)=>{
    const item=document.createElement('li');item.textContent=names[i]+' · '+(part?.name??'sin instalar');return item;
   }));
  }
  function install(){
   const index=order[step],candidate=[...installed];candidate[index]=hardware[index][chosen];
   const problems=issues(candidate);
   if(problems.length){
    const problem=problems[0];status.className='assembly-status error';status.textContent='⚠ '+problem.text+' Consulta piezas compatibles para corregirlo.';
    pc.install(installed,index,true,problem.text);
   }else{
    status.className='assembly-status success';installed[index]=candidate[index];pc.install(installed,index);
    status.textContent=ready()?'Ensamblaje completo. Puedes encender la PC.':names[index]+' instalado correctamente.';
    controls.querySelector('progress').value=installed.filter(Boolean).length;
    power.disabled=!ready();
    controls.querySelector('.installed-summary').children[index].textContent=names[index]+' · '+installed[index].name;
   }
  }
  const installButton=button(actions,'Instalar',install);installButton.classList.add('install-button');
  const previous=button(actions,'Anterior',()=>{step--;chosen=0;render()});
  const next=button(actions,'Siguiente',()=>{step++;chosen=0;render()});
  button(actions,'Ver compatibles',()=>{
   const index=order[step],compatible=hardware[index].findIndex(part=>{
    const candidate=[...installed];candidate[index]=part;return !issues(candidate).length;
   });
   if(compatible<0){status.textContent='Cambia una de las piezas ya instaladas para obtener una combinación compatible.';return}
   chosen=compatible;render();status.textContent='Pieza compatible seleccionada. Pulsa Instalar.';
  });
  button(controls.querySelector('.primary-actions'),'Verificar mi PC',()=>{
   const results=controls.querySelector('.check-results');results.replaceChildren();
   const problems=issues(installed,true);
   for(const problem of problems){
    const index=problem.part;
    button(results,(problem.severity==='error'?'Error · ':'Advertencia · ')+names[index]+' · '+problem.text,()=>{step=order.indexOf(index);chosen=0;render();pc.install(installed,index,problem.severity==='error');pc.focus(index);status.textContent=problem.text});
   }
   status.textContent=ready()?'Configuración completa según las reglas del ejercicio. Revisa la advertencia antes de trasladarla a un equipo real.':'Corrige los errores señalados antes de encender.';
  });
  const power=button(controls.querySelector('.primary-actions'),'Encender PC',()=>{if(!ready())return;bootStep=0;bootTime=0;status.textContent='Inicio educativo · La fuente alimenta la placa.';pc.stage([5,0]);});
  const host=document.querySelector('#scene');
  host.ondragover=event=>event.preventDefault();
  host.ondrop=event=>{event.preventDefault();if(event.dataTransfer.getData('text/plain')==='hardware-piece')install()};
  render();
  update=delta=>{
   if(bootStep<0)return;bootTime+=delta;
   if(bootTime<2)return;bootTime=0;bootStep++;
   const messages=['','Firmware · Comprobación inicial de CPU y RAM.','Carga del sistema · Almacenamiento hacia RAM.','PC lista · El procesador ejecuta el sistema.'];
   if(bootStep>3){bootStep=-1;return}
   status.textContent=messages[bootStep];pc.stage([[5,0],[0,1,2],[4,2],[2,1,3]][bootStep]);
  };
 }
 return {run,build,update(delta){update(delta)},stop(){
  update=()=>{};pc.hide();const host=document.querySelector('#scene');host.ondragover=null;host.ondrop=null;
 }};
}
