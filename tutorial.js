export function createTutorial({prepare,current}){
 const key='explora-onboarding-v1';
 const steps=[
  ['explore','#componentes','Exploración 3D','Elige una tarjeta o abre Buscar componente. El modelo y su ficha se actualizan juntos.'],
  ['explore','#scene','Rotación y zoom','Arrastra el modelo para girarlo. Usa la rueda, + y − o los controles inferiores.'],
  ['explore','#part-buttons','Partes del hardware','Selecciona los puntos morados, las etiquetas del modelo o estos botones para explorar una pieza.'],
  ['explore','#info-content','Panel informativo','Aquí se explica la función de la pieza seleccionada y su conexión con las demás.'],
  ['explore','#view-modes','Herramientas del visor','Activa Despiece, Rayos X o Flujo de datos. Pulsa de nuevo para volver a la vista normal.'],
  ['explore','.mode-switch','Cambia de modo','Exploración muestra piezas individuales. Laboratorio abre las actividades.'],
  ['lab','#lab-menu','Laboratorio de hardware','Accede al recorrido, simulador, ensamblaje o diagnóstico. Cada actividad tiene regreso al menú.'],
  ['run','.experience-controls','Simulador de funcionamiento','Cambia de actividad y prueba Pausar o Paso siguiente para observar las relaciones entre las piezas.'],
  ['build','.available-parts','Ensamblaje de PC','Selecciona una tarjeta e instala la pieza. Avanza por los seis pasos y usa Verificar mi PC antes de encender.'],
  ['diagnosis','#lab-activity','Diagnóstico virtual','Elige nivel y caso. Compara los síntomas con las causas y selecciona una respuesta para conocer su razonamiento.']
 ];
 const dialog=document.createElement('dialog');dialog.className='help-dialog';document.body.append(dialog);
 const highlight=document.createElement('div');highlight.className='tour-highlight';highlight.hidden=true;document.body.append(highlight);
 const card=document.createElement('section');card.className='tour-card';card.hidden=true;
 card.setAttribute('role','region');card.setAttribute('aria-label','Tutorial interactivo');card.setAttribute('aria-live','polite');document.body.append(card);
 let index=0,target=null,previousSection='',returnFocus=null;
 const instructions={
 build:'Selecciona una pieza, pulsa Instalar y recorre los pasos. Ver compatibles sugiere una alternativa. Verificar mi PC localiza faltantes y conflictos. Encender requiere seis piezas compatibles.',
 run:'Elige una actividad. Usa las etapas, Pausar, Reiniciar y Paso siguiente para observar el flujo. Selecciona piezas del gabinete para consultar su función.',
 diagnosis:'Elige dificultad y caso. Selecciona una causa y revisa la explicación asociada.',
 guide:'Elige un componente y usa Anterior y Siguiente para recorrer sus piezas. Finalizar vuelve al menú.'
 };
 function button(parent,text,action){
  const control=document.createElement('button');control.type='button';control.className='part-button';control.textContent=text;control.onclick=action;parent.append(control);return control;
 }
 function remember(){try{localStorage.setItem(key,'done')}catch{}}
 function closeTour(){card.hidden=true;highlight.hidden=true;target=null;document.removeEventListener('keydown',keyboard)}
 function complete(skipped=false){
  remember();closeTour();
  if(skipped){document.querySelector('#help').focus();return}
  modal('¡Tutorial completado!','Ya puedes explorar las piezas y experimentar con las herramientas del laboratorio.',[['Continuar explorando',()=>{dialog.close();document.querySelector('#help').focus()}]]);
 }
 function position(){
  if(card.hidden||!target)return;
  const bounds=target.getBoundingClientRect();
  const scroller=target.closest('.tool-content');
  const clip=scroller?.getBoundingClientRect()??{left:0,top:0,right:innerWidth,bottom:innerHeight};
  const rect={left:Math.max(bounds.left,clip.left),top:Math.max(bounds.top,clip.top),right:Math.min(bounds.right,clip.right),bottom:Math.min(bounds.bottom,clip.bottom)};
  rect.width=Math.max(0,rect.right-rect.left);rect.height=Math.max(0,rect.bottom-rect.top);
  Object.assign(highlight.style,{left:rect.left-4+'px',top:rect.top-4+'px',width:rect.width+8+'px',height:rect.height+8+'px'});
  const width=Math.min(350,innerWidth-24),height=card.offsetHeight;
  // Prefer the opposite column so the highlighted control stays usable.
  let left=rect.left>innerWidth/2?12:innerWidth-width-12;
  let top=rect.bottom+16;
  if(top+height>innerHeight-12)top=Math.max(12,rect.top-height-16);
  if(rect.width>innerWidth*.65){left=12;top=rect.bottom+16;if(top+height>innerHeight-12)top=12}
  Object.assign(card.style,{width:width+'px',left:left+'px',top:Math.min(top,Math.max(12,innerHeight-height-12))+'px'});
 }
 function show(){
  const [section,selector,title,text]=steps[index];
  if(section!==previousSection){prepare(section);previousSection=section}
  target=document.querySelector(selector);
  if(!target||target.closest('[hidden]')){prepare(section);target=document.querySelector(selector)}
  target.scrollIntoView({block:'nearest',behavior:'instant'});
  card.innerHTML='<p class="tour-progress"></p><h3 tabindex="-1"></h3><p class="tour-instruction"></p><div class="lab-actions"></div>';
  card.querySelector('.tour-progress').textContent='Tutorial · '+(index+1)+' de '+steps.length;
  card.querySelector('h3').textContent=title;card.querySelector('.tour-instruction').textContent=text;
  const actions=card.querySelector('.lab-actions');
  const back=button(actions,'Anterior',()=>{index--;show()});back.disabled=index===0;
  button(actions,index===steps.length-1?'Finalizar':'Siguiente',()=>{if(index===steps.length-1)complete();else{index++;show()}});
  button(actions,'Omitir',()=>complete(true));
  card.hidden=false;highlight.hidden=false;position();card.querySelector('h3').focus({preventScroll:true});
 }
 function keyboard(event){if(event.key==='Escape'){event.preventDefault();complete(true)}}
 function start(){if(dialog.open)dialog.close();closeTour();index=0;previousSection='';document.addEventListener('keydown',keyboard);show()}
 function modal(title,text,actions){
  closeTour();dialog.innerHTML='<h2></h2><p></p><div class="lab-actions"></div>';
  dialog.querySelector('h2').textContent=title;dialog.querySelector('p').textContent=text;
  actions.forEach(([label,action])=>button(dialog.querySelector('.lab-actions'),label,action));
  if(!dialog.open)dialog.showModal();
 }
 dialog.addEventListener('cancel',()=>{remember();document.querySelector('#help').focus()});
 document.querySelector('#help').onclick=()=>{
  returnFocus=document.activeElement;
  modal('Ayuda de Explora tu PC','Elige cómo quieres consultar la guía.',[
   ['Reiniciar tutorial',start],
   ['Guía rápida de controles',()=>modal('Controles','Arrastra para girar, usa rueda o + y − para zoom. Los botones inferiores permiten girar y restablecer. Tab recorre los controles y Enter los activa. En móvil, Herramientas abre el panel.',[['Volver',()=>document.querySelector('#help').click()]])],
   ['Ayuda de esta herramienta',()=>modal('Herramienta actual',instructions[current()]??'Selecciona un componente, explora sus puntos morados y consulta la ficha. Los efectos del visor muestran piezas separadas, transparencias o conexiones conceptuales.',[['Volver',()=>document.querySelector('#help').click()]])],
   ['Cerrar',()=>{dialog.close();returnFocus?.focus()}]
  ]);
 };
 window.addEventListener('resize',position);document.querySelector('.tool-content').addEventListener('scroll',position);
 let seen=false;try{seen=localStorage.getItem(key)==='done'}catch{}
 if(!seen)modal('¡Bienvenido a Explora tu PC!','Aprende cómo funciona una computadora explorando sus componentes y experimentando en nuestro laboratorio virtual',[
  ['Iniciar tutorial',start],['Explorar por mi cuenta',()=>{remember();dialog.close();document.querySelector('#help').focus()}]
 ]);
}
