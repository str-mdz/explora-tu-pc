import {createTutorial} from './tutorial.js';
import {createComputer} from './computer.js';
import {createExperiences} from './experiences.js';
import {createLab} from './lab.js';
import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
const catalog=[
 {name:'Tarjeta madre',sub:'La conexión central',icon:'▦',desc:'Es la placa principal que conecta y permite comunicarse a todas las piezas de la computadora. Selecciona un punto morado para conocer sus partes.',extra:'Piensa en ella como una ciudad de conexiones: el procesador, la memoria y el almacenamiento trabajan juntos a través de sus circuitos.'},
 {name:'Procesador',sub:'El centro de cálculo',icon:'▣',desc:'La CPU interpreta instrucciones y realiza cálculos para ejecutar los programas.',extra:'Trabaja con la memoria RAM y se conecta a la tarjeta madre mediante un socket.'},
 {name:'Memoria RAM',sub:'Espacio de trabajo',icon:'▤',desc:'Guarda temporalmente la información que estás usando. Más memoria permite mantener abiertas varias tareas con mayor fluidez.',extra:'Se inserta en las ranuras de la tarjeta madre y permite acceder rápidamente a datos de trabajo.'},
 {name:'Tarjeta gráfica',sub:'El motor visual',icon:'◇',desc:'La GPU procesa gráficos e imágenes y acelera tareas que requieren muchos cálculos en paralelo.',extra:'Puede estar integrada o instalarse como tarjeta de expansión en una ranura PCIe.'},
 {name:'Almacenamiento',sub:'Tus datos, guardados',icon:'▱',desc:'El SSD conserva archivos, aplicaciones y el sistema operativo incluso cuando apagas el equipo.',extra:'Puede conectarse mediante SATA o directamente a una ranura M.2.'},
 {name:'Fuente de poder',sub:'Energía para todo',icon:'⬡',desc:'La fuente de poder convierte la energía eléctrica y la distribuye a los componentes.',extra:'Sus conectores alimentan la tarjeta madre, el procesador y otros dispositivos.'}
];
const parts=[
 {name:'Socket del procesador',pos:[-0.6,.19,-.35],size:[.92,.22,.9],desc:'Sostiene la CPU y conecta sus contactos con los circuitos de la tarjeta madre.',importance:'Permite que el procesador se comunique con memoria y periféricos.',connection:'Su compatibilidad determina qué procesadores pueden instalarse.'},
 {name:'Ranuras RAM',pos:[.55,.17,-.45],size:[.15,.18,1.9],desc:'Son los conectores donde se instalan los módulos de memoria RAM.',importance:'Permiten ampliar la memoria de trabajo del equipo.',connection:'Comunican la RAM con el controlador de memoria del procesador.'},
 {name:'Ranuras PCIe',pos:[-.22,.14,.85],size:[1.95,.12,.16],desc:'Conectan tarjetas de expansión, como una tarjeta gráfica.',importance:'Ofrecen una vía rápida para ampliar las capacidades del equipo.',connection:'Transportan información entre las tarjetas instaladas y el resto del sistema.'},
 {name:'Chipset',pos:[.82,.22,.68],size:[.58,.2,.58],desc:'Conjunto de circuitos que gestiona diversas conexiones de la placa.',importance:'Coordina interfaces y dispositivos conectados.',connection:'Se comunica con la CPU y con controladores de entrada y salida.'},
 {name:'Conector M.2',pos:[-.85,.14,.66],size:[.85,.08,.18],desc:'Permite instalar dispositivos compactos, como SSD M.2.',importance:'Facilita almacenamiento de alta velocidad según la interfaz disponible.',connection:'Puede utilizar líneas PCIe o SATA, dependiendo del equipo.'},
 {name:'Conectores SATA',pos:[1.43,.2,.55],size:[.24,.28,.36],desc:'Conectan unidades de almacenamiento SATA.',importance:'Permiten conectar SSD y discos duros compatibles.',connection:'Enlazan las unidades con el controlador SATA de la placa.'},
 {name:'Conector de alimentación',pos:[1.43,.21,-.6],size:[.24,.3,.66],desc:'Recibe energía de la fuente de poder.',importance:'Suministra electricidad a la tarjeta madre y sus circuitos.',connection:'Se conecta a los cables correspondientes de la fuente.'},
 {name:'Puertos de entrada y salida',pos:[-1.45,.27,-.72],size:[.3,.4,.9],desc:'Permiten conectar periféricos y otros dispositivos externos.',importance:'Hacen posible utilizar teclado, mouse, red y dispositivos USB.',connection:'Se enlazan con los controladores de la tarjeta madre.'}
];
const sceneEl=document.querySelector('#scene');const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(4,3.6,5);const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;sceneEl.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x797486,2.4));const light=new THREE.DirectionalLight(0xffffff,2.5);light.position.set(3,8,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);scene.add(light);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.13}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.05;ground.receiveShadow=true;scene.add(ground);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.autoRotate=!matchMedia('(prefers-reduced-motion: reduce)').matches;controls.autoRotateSpeed=.7;controls.enablePan=false;controls.dampingFactor=.08;controls.minDistance=3;controls.maxDistance=14;controls.target.set(0,0,0);
let root=new THREE.Group();scene.add(root);const clickable=[];let current=0,selected=-1;const purple=0x8559b6,dark=0x34343d;
function box(parent,w,h,d,x,y,z,color,metalness=.1){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.65,metalness}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function marker(parent,x,y,z,index){const group=new THREE.Group();group.position.set(x,y,z);group.userData.marker=index;const stem=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.17,8),new THREE.MeshBasicMaterial({color:purple}));stem.position.y=.09;group.add(stem);const disk=new THREE.Mesh(new THREE.SphereGeometry(.155,20,12),new THREE.MeshStandardMaterial({color:purple,emissive:0x33114f,emissiveIntensity:.3}));disk.position.y=.2;group.add(disk);const ring=new THREE.Mesh(new THREE.RingGeometry(.17,.22,24),new THREE.MeshBasicMaterial({color:0xb9a0d7,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.2;group.add(ring);const plus=box(group,.10,.015,.018,0,.355,0,0xffffff);plus.rotation.x=0;const plus2=box(group,.018,.015,.10,0,.355,0,0xffffff);disk.userData.part=index;ring.userData.part=index;plus.userData.part=index;plus2.userData.part=index;clickable.push(disk,ring,plus,plus2);parent.add(group);return group}
function motherboard(){box(root,3.35,.13,2.65,0,0,0,dark);
 for(const x of [-1.54,1.54])for(const z of [-1.18,1.18]){
  const mount=new THREE.Mesh(new THREE.TorusGeometry(.065,.018,8,20),new THREE.MeshStandardMaterial({color:0xa19ca8,metalness:.7,roughness:.45}));
  mount.rotation.x=-Math.PI/2;mount.position.set(x,.07,z);root.add(mount);
 }
for(let i=-7;i<=7;i++){box(root,.008,.005,2.48,i*.2,.07,0,0x967e48);if(i%2===0)box(root,3.18,.005,.008,0,.072,i*.15,0x967e48)}parts.forEach((p,i)=>{const [x,y,z]=p.pos,[w,h,d]=p.size;const m=box(root,w,h,d,x,y,z,i===0?0xbebbc7:i===2?0x292932:0x46444f);m.userData.part=i;clickable.push(m);if(i===3){for(let fin=-3;fin<=3;fin++){const f=box(root,.5,.045,.032,x,y+.11,z+fin*.07,0x83808b);f.userData.part=i;clickable.push(f)}}if(i===1){for(let j=0;j<3;j++)box(root,.045,.05,1.65,x+(j-1)*.19,.3,z,0x9262c0)}if(i===0)box(root,.63,.025,.62,x,.32,z,0xd7d5de);marker(root,x,y+h/2,z,i)})}
function cpu(){box(root,1.5,.08,1.5,0,.18,0,0xeee9f5,.7);for(let j=-1;j<=1;j++)box(root,1,.008,.018,0,.225,j*.18,purple);box(root,2.1,.18,2.1,0,0,0,0xb9b9bf,.8);box(root,1.7,.035,1.7,0,.12,0,0x55545d,.65);for(let i=-8;i<=8;i++){box(root,.045,.07,.12,i*.115,-.12,-1.02,0xc6a660,.7);box(root,.045,.07,.12,i*.115,-.12,1.02,0xc6a660,.7);box(root,.12,.07,.045,-1.02,-.12,i*.115,0xc6a660,.7);box(root,.12,.07,.045,1.02,-.12,i*.115,0xc6a660,.7)}}
function ram(){box(root,3.6,.63,.13,0,0,0,0x33343c);box(root,3.6,.09,.13,0,.34,0,purple);for(let i=0;i<8;i++)box(root,.32,.34,.035,-1.42+i*.41,.04,.085,0x1c1c22);for(let i=0;i<19;i++)box(root,.12,.12,.18,-1.62+i*.18,-.37,0,0xbda06c,.5)}
function gpu(){box(root,3.25,.2,1.65,0,0,0,0x34333b);for(let i=-1;i<=1;i++){const fan=new THREE.Mesh(new THREE.TorusGeometry(.35,.09,10,32),new THREE.MeshStandardMaterial({color:0x77727e}));fan.rotation.x=-Math.PI/2;fan.position.set(i*1.03,.16,0);root.add(fan);for(let j=0;j<6;j++){const blade=box(root,.1,.025,.34,i*1.03+Math.cos(j*Math.PI/3)*.14,.17,Math.sin(j*Math.PI/3)*.14,0x55525d);blade.rotation.y=j*Math.PI/3}}box(root,3.4,.13,.14,0,-.17,-.86,purple)}
function ssd(){box(root,2.9,.13,1.9,0,0,0,0x42424b);box(root,2.35,.025,1.35,0,.085,0,0x292a33);for(let i=0;i<4;i++)box(root,.43,.035,.55,-.83+i*.55,.12,0,0x65616f);box(root,1.4,.035,.1,0,.09,-.75,purple)}
function psu(){box(root,2.3,1.55,2.4,0,0,0,0x44434b);const fan=new THREE.Mesh(new THREE.TorusGeometry(.65,.055,12,48),new THREE.MeshStandardMaterial({color:0xa09ca7}));fan.rotation.x=-Math.PI/2;fan.position.y=.8;root.add(fan);for(let i=0;i<8;i++){const a=i*Math.PI/4;const blade=box(root,.16,.02,.65,Math.sin(a)*.25,.8,Math.cos(a)*.25,0x77727f);blade.rotation.y=a}box(root,.2,.45,.65,1.16,.2,0,purple)}
function clear(){while(root.children.length){const obj=root.children[0];root.remove(obj);obj.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()})}clickable.length=0}
const details=[parts,
 [{name:'Cubierta térmica',pos:[0,.24,0],desc:'La cubierta metálica protege el chip y transmite su calor al sistema de refrigeración.',importance:'Ayuda a distribuir el calor generado durante los cálculos.',connection:'Hace contacto con el disipador mediante pasta térmica.'},{name:'Contactos de la CPU',pos:[.9,-.03,.9],desc:'Conectan eléctricamente el procesador con su socket.',importance:'Transportan energía y señales; su disposición depende del modelo.',connection:'En este modelo educativo se representan como pines. Otras CPU usan contactos planos.'}],
 [{name:'Chips de memoria',pos:[-.6,.24,.12],desc:'Almacenan los datos y las instrucciones de los programas en uso.',importance:'Son memoria volátil: pierden su contenido al apagar el equipo.',connection:'Intercambian datos con el controlador de memoria de la CPU.'},{name:'Contactos de la RAM',pos:[.8,-.3,.12],desc:'Los contactos dorados conectan el módulo a su ranura.',importance:'La generación de RAM debe ser compatible con la placa.',connection:'Se insertan en una ranura DIMM de la tarjeta madre.'}],
 [{name:'Sistema de refrigeración',pos:[0,.25,0],desc:'Los ventiladores mueven aire a través del disipador de la tarjeta gráfica.',importance:'Ayuda a mantener la GPU a una temperatura de trabajo adecuada.',connection:'El disipador recibe calor del procesador gráfico y de otros circuitos.'},{name:'Conector PCIe',pos:[1,-.1,-.86],desc:'Conecta la tarjeta gráfica con la tarjeta madre.',importance:'Permite transferir datos y suministra parte de la energía.',connection:'Se instala en una ranura PCIe compatible; algunas tarjetas necesitan alimentación adicional.'}],
 [{name:'Memoria flash',pos:[-.55,.17,0],desc:'Conserva tus archivos en chips de memoria no volátil.',importance:'Los datos permanecen guardados aunque apagues la computadora.',connection:'Un controlador organiza las lecturas y escrituras de estos chips.'},{name:'Interfaz SATA',pos:[.7,.13,-.75],desc:'Comunica este SSD de formato 2.5 pulgadas con el equipo.',importance:'Permite acceder a aplicaciones, al sistema operativo y a los archivos.',connection:'Utiliza una conexión de datos SATA y alimentación de la fuente.'}],
 [{name:'Ventilador de la fuente',pos:[0,.85,0],desc:'Hace circular aire para enfriar los circuitos internos.',importance:'Disipa el calor producido al convertir la energía.',connection:'Funciona bajo el control de la fuente; algunos modelos lo detienen con poca carga.'},{name:'Salida de alimentación',pos:[1.2,.4,0],desc:'Distribuye corriente continua a las piezas de la computadora.',importance:'La potencia y los conectores deben cubrir las necesidades del equipo.',connection:'Los cables alimentan la placa, la CPU, la GPU y las unidades según el modelo.'}]
];
function pauseRotation(){controls.autoRotate=false;updateRotationButton()}
function updateRotationButton(){const b=document.querySelector('#rotate');b.textContent=controls.autoRotate?'Ⅱ Pausar giro':'▷ Girar modelo';b.setAttribute('aria-pressed',String(controls.autoRotate))}
function selectPart(index){selected=index;pauseRotation();showInfo(details[current][index]);document.querySelectorAll('#part-buttons .part-button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));focusPart(index)}
function showInfo(part){const d=part??catalog[current];document.querySelector('#info-title').textContent=d.name;document.querySelector('#info-content').innerHTML=part?`<p><strong>Función:</strong> ${d.desc}</p><p><strong>Importancia:</strong> ${d.importance}</p><p><strong>Conexión:</strong> ${d.connection}</p>`:`<p>${d.desc}</p><p>${d.extra}</p>`}
const builders=[motherboard,cpu,ram,gpu,ssd,psu];
function renderModel(){clear();builders[current]();document.querySelector('#viewer-title').textContent=catalog[current].name;document.querySelector('#counter').textContent=String(current+1).padStart(2,'0');document.querySelector('#viewer-hint').textContent='Selecciona un punto morado o una parte de la guía.';if(current!==0){const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o)});meshes.forEach(m=>{m.userData.part=details[current].reduce((best,p,i)=>m.position.distanceToSquared(new THREE.Vector3(...p.pos))<m.position.distanceToSquared(new THREE.Vector3(...details[current][best].pos))?i:best,0);clickable.push(m)});details[current].forEach((p,i)=>marker(root,...p.pos,i))}showInfo();const list=document.querySelector('#part-buttons');list.replaceChildren();details[current].forEach((p,i)=>{const b=document.createElement('button');b.className='part-button';b.textContent=p.name;b.setAttribute('aria-pressed','false');b.onclick=()=>selectPart(i);list.append(b)});document.querySelectorAll('.card').forEach((el,i)=>(el.classList.toggle('active',i===current),el.setAttribute('aria-pressed',String(i===current))));controls.reset();camera.position.set(4,3.6,5);controls.target.set(0,0,0);controls.update();prepareModel()}
const cards=document.querySelector('#cards');catalog.forEach((d,i)=>{const b=document.createElement('button');b.className='card';b.innerHTML=`<span class="card-icon">${d.icon}</span><span class="card-name">${d.name}</span><span class="card-sub">${d.sub}</span>`;b.addEventListener('click',()=>{openModel(i);activateTool(activeTool)});cards.append(b)});
document.querySelector('#reset').onclick=()=>{selected=-1;if(pc.visible){camera.position.set(4,3.6,5);controls.target.set(0,.2,0);controls.update()}else renderModel()};document.querySelector('#zoom-in').onclick=()=>zoomView(.8);
document.querySelector('#zoom-out').onclick=()=>zoomView(1.2);
function zoomView(factor){
 cameraGoal=null;
 const offset=camera.position.clone().sub(controls.target);
 offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));
 camera.position.copy(controls.target).add(offset);controls.update();
}
const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();let down=null;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>7)return;const rect=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(mouse,camera);if(pc.visible){pc.hit(raycaster);return}const hits=raycaster.intersectObjects(clickable,false);if(hits.length){selectPart(hits[0].object.userData.part)}});
document.querySelector('#rotate').onclick=()=>{controls.autoRotate=!controls.autoRotate;updateRotationButton()};controls.addEventListener('start',()=>{pauseRotation();cameraGoal=null});updateRotationButton();
function resize(){const w=sceneEl.clientWidth,h=sceneEl.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)}new ResizeObserver(resize).observe(sceneEl);const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const delta=clock.getDelta();experiences.update(delta);pc.update(reducedMotion.matches?1/60:delta);if(!pc.visible)updateModel(delta);controls.update(delta);renderer.render(scene,camera)}

// Search uses the same catalog and selection behavior as the existing cards.
const searchToggle=document.querySelector('#componentes .search-component');
const searchPanel=document.querySelector('#component-search');
const searchInput=document.querySelector('#component-query');
const searchResults=document.querySelector('#search-results');
const searchStatus=document.querySelector('#search-status');
const searchAliases=['placa base motherboard','cpu','ram memoria de trabajo almacena datos temporalmente','gpu grafica tarjeta de video','ssd disco duro','psu fuente de alimentacion'];
const normalizeSearch=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function filterComponents(){
 const terms=normalizeSearch(searchInput.value).split(/\s+/).filter(Boolean);
 searchResults.replaceChildren();
 catalog.forEach((component,index)=>{
  const text=normalizeSearch(component.name+' '+searchAliases[index]+' '+component.desc+' '+component.extra);
  if(!terms.every(term=>text.includes(term)))return;
  const button=document.createElement('button');
  button.type='button';button.className='part-button';button.textContent=component.name;
  button.addEventListener('click',()=>{
   searchPanel.hidden=true;searchToggle.setAttribute('aria-expanded','false');
   cards.children[index].click();
   const heading=document.querySelector('#viewer-title');
   heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});
  });
  searchResults.append(button);
 });
 const count=searchResults.childElementCount;
 searchStatus.textContent=count?`${count} componente${count===1?'':'s'} encontrado${count===1?'':'s'}.`:'No se encontraron componentes que coincidan con tu búsqueda.';
}
searchToggle.addEventListener('click',()=>{
 searchPanel.hidden=!searchPanel.hidden;
 searchToggle.setAttribute('aria-expanded',String(!searchPanel.hidden));
 if(!searchPanel.hidden){filterComponents();searchInput.focus()}
});
searchInput.addEventListener('input',filterComponents);
searchInput.addEventListener('keydown',event=>{
 if(event.key==='Enter'){event.preventDefault();searchResults.firstElementChild?.click()}
});
searchPanel.addEventListener('keydown',event=>{
 if(event.key==='Escape'){searchPanel.hidden=true;searchToggle.setAttribute('aria-expanded','false');searchToggle.focus()}
});

const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const labels=document.createElement('div');
labels.className='model-labels';
sceneEl.append(labels);
const layer=new THREE.Group();
scene.add(layer);
let cameraGoal, annotated=[], modelPieces=[], pulses=[], elapsed=0;
let activeTool='explore';
let runningActivity=false;
const isFlow=()=>activeTool==='flow'||(activeTool==='run'&&runningActivity);
let activeLinks=[0,1,4,2];
const points=[[-.6,.42,-.35],[.55,.35,-.45],[-.22,.28,.85],[.82,.4,.68],[-.85,.27,.66],[1.43,.42,.55],[1.43,.45,-.6]];
function openModel(index){
 current=index;selected=-1;renderModel();
}
function prepareModel(){
 cameraGoal=null;labels.replaceChildren();
 modelPieces=root.children.map(object=>{
  const index=object.userData.marker??object.userData.part;
  return {object,index,home:object.position.clone(),material:object.material,color:object.material?.color.clone()};
 });
 annotated=modelPieces.filter(piece=>piece.object.userData.marker!==undefined).map(piece=>{
  const button=document.createElement('button');
  button.className='model-label';button.textContent=details[current][piece.index].name;
  button.onclick=()=>selectPart(piece.index);labels.append(button);
  return {piece,button};
 });
 refreshMaterials();refreshLinks();
}
function refreshMaterials(){
 for(const {material,color,index} of modelPieces){
  if(!material)continue;
  material.color.copy(index===selected?new THREE.Color(purple):color);
  material.opacity=(activeTool==='xray')&&index!==selected?(index===undefined?.18:.42):1;
  material.transparent=material.opacity<1;
  material.depthWrite=!material.transparent;
 }
}
function focusPart(index){
 refreshMaterials();
 const marker=annotated.find(item=>item.piece.index===index);
 if(!marker)return;
 const target=marker.piece.object.position.clone();
 const offset=camera.position.clone().sub(controls.target).setLength(4.2);
 cameraGoal={target,position:target.clone().add(offset)};
}
function refreshLinks(){
 for(const object of [...layer.children]){
  object.geometry.dispose();object.material.dispose();layer.remove(object);
 }
 pulses=[];
 if(!isFlow()&&activeTool!=='xray')return;
 const anchors=current===0?points:details[current].map(part=>part.pos);
 const destinations=current===0?(isFlow()?(activeTool==='run'?activeLinks:[1,4,2]):[1,2,3,4,5,6]):[1];
 for(const index of new Set(destinations)){
  if(index===0)continue;
  const a=new THREE.Vector3(...anchors[0]),b=new THREE.Vector3(...anchors[index]);
  const path=new THREE.QuadraticBezierCurve3(a,a.clone().lerp(b,.5).add(new THREE.Vector3(0,.48,0)),b);
  const line=new THREE.Mesh(new THREE.TubeGeometry(path,18,.012,5,false),new THREE.MeshBasicMaterial({color:0xa45fef}));
  layer.add(line);
  if(isFlow()){
   const pulse=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),new THREE.MeshBasicMaterial({color:0xf3d5ff}));
   layer.add(pulse);pulses.push({path,pulse});
  }
 }
}
function updateModel(delta){
 const blend=reducedMotion.matches?1:1-Math.exp(-delta*8);
 for(const {object,index,home} of modelPieces){
  const lift=(activeTool==='explode')&&index!==undefined?.46+.16*(index%3):0;
  object.position.y=THREE.MathUtils.lerp(object.position.y,home.y+lift,blend);
 }
 if(cameraGoal){
  controls.target.lerp(cameraGoal.target,blend);
  camera.position.lerp(cameraGoal.position,blend);
  if(camera.position.distanceToSquared(cameraGoal.position)<.0001)cameraGoal=null;
 }
 camera.updateMatrixWorld();
 for(const {piece,button} of annotated){
  const position=piece.object.position.clone().add(new THREE.Vector3(0,.38,0)).project(camera);
  button.hidden=Math.abs(position.x)>.86||Math.abs(position.y)>.9||position.z>1;
  button.style.left=(position.x*.5+.5)*100+'%';
  button.style.top=(.5-position.y*.5)*100+'%';
  button.classList.toggle('selected',piece.index===selected);
 }
 elapsed+=delta;
 pulses.forEach(({path,pulse},i)=>path.getPoint(reducedMotion.matches?.5:(elapsed*.65+i*.22)%1,pulse.position));
}
const tools=document.querySelector('#viewer-tools');
const labNav=document.querySelector('#lab-nav');
const labPanel=document.querySelector('#laboratorio');
const modeButtons=document.querySelectorAll('[data-mode]');
const toolbox=document.querySelector('#toolbox');
const toolContent=toolbox.querySelector('.tool-content');
const panelToggle=document.querySelector('#panel-toggle');
const compact=matchMedia('(max-width: 760px)');
const exploration=document.querySelector('#exploration');
const catalogPanel=document.querySelector('#componentes');
const modeDescription=document.createElement('p');
modeDescription.className='mode-description';
exploration.prepend(modeDescription);
const descriptions={
 explore:'Selecciona una pieza en el modelo o en la lista para consultar su función.',
 explode:'Las piezas se separan para que puedas inspeccionarlas. Cambia de herramienta para volver a ensamblarlas.',
 xray:'Las capas transparentes y los enlaces resaltan relaciones entre las piezas.',
 flow:'Los pulsos representan un flujo conceptual. Explora la tarjeta madre para ver los enlaces entre los componentes del equipo.'
};
function setPanel(open){
 toolbox.hidden=!open;
 panelToggle.setAttribute('aria-expanded',String(open));
}
panelToggle.onclick=()=>setPanel(toolbox.hidden);
compact.addEventListener('change',()=>setPanel(!compact.matches));
toolbox.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&compact.matches){setPanel(false);panelToggle.focus()}
});
function activateTool(tool){
 if(tool!=='run')runningActivity=false;
 const leavingComputer=pc.visible;
 experiences.stop();root.visible=true;labels.hidden=false;
 if(leavingComputer)renderModel();
 activeTool=tool;
 const inLab=!(tool in descriptions);
 labPanel.hidden=!inLab;
 labNav.setAttribute('aria-pressed',String(inLab));
 document.querySelector('#explore-nav').setAttribute('aria-pressed',String(!inLab));
 catalogPanel.hidden=inLab;
 exploration.hidden=inLab;
 modeDescription.textContent=descriptions[tool]??'';
 modeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===tool)));
 toolContent.scrollTop=0;
 refreshMaterials();refreshLinks();
}
labNav.onclick=()=>{if(labPanel.hidden)lab.showMenu();setPanel(true)};
document.querySelector('#explore-nav').onclick=()=>{if(!labPanel.hidden)activateTool('explore');setPanel(true)};
document.querySelector('#panel-width').oninput=event=>{
 document.documentElement.style.setProperty('--panel-width',event.target.value+'px');
};
modeButtons.forEach(button=>button.onclick=()=>{
 activateTool(activeTool===button.dataset.mode?'explore':button.dataset.mode);
 setPanel(true);
});
for(const [label,direction] of [['Girar izquierda',-1],['Girar derecha',1]]){
 const button=document.createElement('button');
 button.className='part-button';button.textContent=label;button.onclick=()=>{
  pauseRotation();cameraGoal=null;
  const offset=camera.position.clone().sub(controls.target);
  offset.applyAxisAngle(new THREE.Vector3(0,1,0),direction*Math.PI/8);
  camera.position.copy(controls.target).add(offset);controls.update();
 };tools.append(button);
}
const pc=createComputer({scene,camera,controls,host:sceneEl,modelFactory(index){
 const live=root;root=new THREE.Group();const count=clickable.length;
 try{builders[index]();return root}finally{root=live;clickable.length=count}
}});
const experiences=createExperiences({pc,names:catalog.map(item=>item.name),reducedMotion,changeView(kind){
 root.visible=false;labels.hidden=true;
 document.querySelector('#viewer-hint').textContent='Selecciona las etiquetas o las piezas del gabinete para conocer su función.';
 for(const object of [...layer.children]){layer.remove(object);object.geometry.dispose();object.material.dispose()}
 document.querySelector('#viewer-title').textContent=kind==='run'?'PC en funcionamiento':'Construye tu PC';
 pauseRotation();
}});
const lab=createLab({catalog,details,openModel,selectPart,currentModel:()=>current,
 changeActivity(tool){activateTool(tool);if(tool==='lab'||tool==='explore')renderModel()},
 experiences
});
renderModel();
const initialLab=location.hash==='#laboratorio';
activateTool(initialLab?'lab':'explore');
setPanel(initialLab||!compact.matches);
animate();

createTutorial({
 prepare(section){
  if(section==='explore'){activateTool('explore');setPanel(true);return}
  lab.showMenu();setPanel(true);
  if(section!=='lab')document.querySelector('[data-open="'+section+'"]').click();
 },
 current:()=>activeTool
});
