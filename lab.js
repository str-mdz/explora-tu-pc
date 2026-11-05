const cases=[
 ['Básico','Faltan 8 GB de RAM','La PC tiene dos módulos iguales de 8 GB.','El firmware muestra 8 GB. Al volver a insertar el segundo módulo, muestra 16 GB.',[
  ['El segundo módulo no hacía buen contacto','El firmware recuperó la capacidad al volver a insertar el módulo, lo que apunta a un problema de contacto.'],
  ['El sistema operativo reservó 8 GB','La diferencia ya aparecía en el firmware, antes de cargar el sistema operativo.'],
  ['El módulo es incompatible con la placa','La misma placa detectó ambos módulos tras reinstalarlos.']]],
 ['Básico','Unidad SATA ausente','Tras cambiar el SSD SATA a otra bahía, desaparece del equipo.','El firmware no lo enumera. El mismo SSD aparece al probarlo con otro cable de datos y la misma alimentación.',[
  ['El enlace de datos original fallaba','El cambio aisló el cable de datos. El SSD y su alimentación funcionaron en ambas pruebas.'],
  ['La unidad no tenía alimentación','La conexión eléctrica se mantuvo durante la prueba que recuperó la detección.'],
  ['La partición está dañada','Una partición dañada no explica que el firmware deje de detectar el dispositivo.']]],
 ['Intermedio','Sin señal tras cambiar la GPU','El equipo inicia con una tarjeta gráfica nueva.','El monitor y el cable funcionan con otro equipo. La CPU no tiene gráficos integrados y el cable está conectado a la placa.',[
  ['La salida de video elegida no tiene señal','En este montaje la imagen sale por la GPU dedicada. Conecta el cable a esa tarjeta.'],
  ['El monitor está averiado','La prueba con el otro equipo reduce esa posibilidad.'],
  ['La GPU requiere reinstalar el controlador','El controlador del sistema operativo no puede activar la salida de la placa cuando la CPU carece de gráficos integrados.']]],
 ['Avanzado','Apagados al exigir CPU y GPU','La PC funciona en reposo y se apaga durante cargas combinadas.','Temperaturas normales. CPU y GPU superan pruebas por separado. Una fuente compatible de prueba elimina los apagados.',[
  ['El suministro eléctrico original falla bajo carga combinada','La sustitución aislada de la fuente y sus cables dirige el diagnóstico a la alimentación. Los síntomas por sí solos no distinguen capacidad, protección o defecto.'],
  ['La CPU activa su protección térmica','Las temperaturas normales y el resultado con la fuente de prueba contradicen esa hipótesis.'],
  ['La GPU tiene una falla que aparece con cualquier carga','La prueba individual y la recuperación con otra fuente hacen más probable un problema de alimentación.']]]
];
const glossary={
 PCIe:'Interfaz de alta velocidad para conectar tarjetas de expansión y algunas unidades de almacenamiento.',
 Socket:'Conector físico y eléctrico donde se instala el procesador.',
 Chipset:'Circuitos que gestionan conexiones de entrada y salida de la placa.',
 DDR:'Familia de memorias RAM. La generación del módulo debe coincidir con la que admite la placa.',
 'M.2':'Formato compacto de conexión. Según la ranura y la unidad, puede admitir SATA o PCIe/NVMe.'
};
export function createLab({catalog,details,openModel,selectPart,experiences,currentModel,changeActivity}){
 const menu=document.querySelector('#lab-menu');
 const back=document.querySelector('#lab-back');
 const outlet=document.querySelector('#lab-activity');
 const names=catalog.map(item=>item.name);
 const options=values=>values.map((value,index)=>'<option value="'+index+'">'+value+'</option>').join('');
 function panel(title,body){
  outlet.innerHTML='<article class="lab-panel"><h3 tabindex="-1">'+title+'</h3>'+body+'</article>';
  outlet.querySelector('h3').focus({preventScroll:true});
  return outlet.firstElementChild;
 }
 function button(parent,text,action){
  const el=document.createElement('button');
  el.type='button';el.className='part-button';el.textContent=text;el.onclick=action;parent.append(el);
  return el;
 }
 function showMenu(focus=false){
  changeActivity('lab');outlet.replaceChildren();back.hidden=true;menu.hidden=false;
  if(focus)menu.querySelector('button').focus();
 }
 back.onclick=()=>showMenu(true);
 for(const [term,definition] of Object.entries(glossary)){
  button(document.querySelector('#context-terms'),term,()=>{
   document.querySelector('#term-definition').textContent=term+' · '+definition;
  });
 }
 function guide(){
  const view=panel('Recorrido guiado','<label>Componente <select>'+options(names)+'</select></label><p role="status"></p><div class="lab-actions"></div>');
  const select=view.querySelector('select'), actions=view.querySelector('.lab-actions');
  select.value=currentModel();
  let step=0;
  function update(){
   const model=Number(select.value),parts=details[model],part=parts[step];
   if(currentModel()!==model)openModel(model);
   selectPart(step);
   view.querySelector('p').textContent=(step+1)+' de '+parts.length+' · '+part.name+' — '+part.desc;
   previous.disabled=step===0;next.disabled=step===parts.length-1;
  }
  select.onchange=()=>{step=0;update()};
  const previous=button(actions,'Anterior',()=>{step--;update()});
  const next=button(actions,'Siguiente',()=>{step++;update()});
  button(actions,'Finalizar',()=>showMenu(true));
  update();
 }
 function run(){experiences.run(panel('Simulador de funcionamiento',''))}
 function build(){experiences.build(panel('Ensamblaje de PC',''))}
 function diagnosis(){
  const levels=['Básico','Intermedio','Avanzado'];
  const view=panel('Diagnóstico virtual','<label>Nivel <select>'+options(levels)+'</select></label><label>Caso <select></select></label><p class="problem"></p><p class="symptom"></p><p>¿Cuál es la causa más probable?</p><div class="lab-actions diagnosis-options"></div><p role="status"></p>');
  const [level,scenario]=view.querySelectorAll('select');
  function showCase(){
   const pool=cases.filter(entry=>entry[0]===levels[level.value]);
   const [, ,problem,symptom,choices]=pool[scenario.value];
   view.querySelector('.problem').textContent=problem;
   view.querySelector('.symptom').textContent='Síntomas: '+symptom;
   const actions=view.querySelector('.diagnosis-options'),output=view.querySelector('[role=status]');
   actions.replaceChildren();output.textContent='';
   const order=level.value==='0'&&scenario.value==='0'?[1,0,2]:[2,1,0];
   for(const index of order){
    const [choice,reason]=choices[index];
    const control=button(actions,choice,()=>{
     for(const item of actions.children)item.setAttribute('aria-pressed',String(item===control));
     output.textContent=(index===0?'Correcto. ':'Revisa esta hipótesis. ')+reason;
    });
    control.setAttribute('aria-pressed','false');
   }
  }
  level.onchange=()=>{
   scenario.innerHTML=options(cases.filter(entry=>entry[0]===levels[level.value]).map(entry=>entry[1]));
   showCase();
  };
  scenario.onchange=showCase;level.onchange();
 }
 const activitiesById={guide,run,build,diagnosis};
 menu.querySelectorAll('[data-open]').forEach(control=>control.onclick=()=>{
  const id=control.dataset.open;changeActivity(id);
  menu.hidden=true;back.hidden=false;activitiesById[id]();
 });
 return {showMenu};
}
