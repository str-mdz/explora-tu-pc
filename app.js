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
const root=new THREE.Group();scene.add(root);const clickable=[];let current=0,selected=-1;const purple=0x8559b6,dark=0x34343d;
function box(parent,w,h,d,x,y,z,color,metalness=.1){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.65,metalness}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function marker(parent,x,y,z,index){const group=new THREE.Group();group.position.set(x,y,z);const stem=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.17,8),new THREE.MeshBasicMaterial({color:purple}));stem.position.y=.09;group.add(stem);const disk=new THREE.Mesh(new THREE.SphereGeometry(.155,20,12),new THREE.MeshStandardMaterial({color:purple,emissive:0x33114f,emissiveIntensity:.3}));disk.position.y=.2;group.add(disk);const ring=new THREE.Mesh(new THREE.RingGeometry(.17,.22,24),new THREE.MeshBasicMaterial({color:0xb9a0d7,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.2;group.add(ring);const plus=box(group,.10,.015,.018,0,.355,0,0xffffff);plus.rotation.x=0;const plus2=box(group,.018,.015,.10,0,.355,0,0xffffff);disk.userData.part=index;ring.userData.part=index;plus.userData.part=index;plus2.userData.part=index;clickable.push(disk,ring,plus,plus2);parent.add(group);return group}
function motherboard(){box(root,3.35,.13,2.65,0,0,0,dark);for(let i=-7;i<=7;i++){box(root,.008,.005,2.48,i*.2,.07,0,0x967e48);if(i%2===0)box(root,3.18,.005,.008,0,.072,i*.15,0x967e48)}parts.forEach((p,i)=>{const [x,y,z]=p.pos,[w,h,d]=p.size;const m=box(root,w,h,d,x,y,z,i===selected?purple:(i===0?0xbebbc7:i===2?0x292932:0x46444f));m.userData.part=i;clickable.push(m);if(i===1){for(let j=0;j<3;j++)box(root,.045,.05,1.65,x+(j-1)*.19,.3,z,0x9262c0)}if(i===0)box(root,.63,.025,.62,x,.32,z,0xd7d5de);marker(root,x,y+h/2,z,i)})}
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
function selectPart(index){selected=index;pauseRotation();showInfo(details[current][index]);document.querySelectorAll('.part-button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)))}
function showInfo(part){const d=part??catalog[current];document.querySelector('#info-title').textContent=d.name;document.querySelector('#info-content').innerHTML=part?`<p><strong>Función:</strong> ${d.desc}</p><p><strong>Importancia:</strong> ${d.importance}</p><p><strong>Conexión:</strong> ${d.connection}</p>`:`<p>${d.desc}</p><p>${d.extra}</p>`}
function renderModel(){clear();({0:motherboard,1:cpu,2:ram,3:gpu,4:ssd,5:psu})[current]();document.querySelector('#viewer-title').textContent=catalog[current].name;document.querySelector('#counter').textContent=String(current+1).padStart(2,'0');document.querySelector('#viewer-hint').textContent='Selecciona un punto morado o una parte de la guía.';if(current!==0){const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o)});meshes.forEach(m=>{m.userData.part=details[current].reduce((best,p,i)=>m.position.distanceToSquared(new THREE.Vector3(...p.pos))<m.position.distanceToSquared(new THREE.Vector3(...details[current][best].pos))?i:best,0);clickable.push(m)});details[current].forEach((p,i)=>marker(root,...p.pos,i))}showInfo();const list=document.querySelector('#part-buttons');list.replaceChildren();details[current].forEach((p,i)=>{const b=document.createElement('button');b.className='part-button';b.textContent=p.name;b.setAttribute('aria-pressed','false');b.onclick=()=>selectPart(i);list.append(b)});document.querySelectorAll('.card').forEach((el,i)=>(el.classList.toggle('active',i===current),el.setAttribute('aria-pressed',String(i===current))));controls.reset();camera.position.set(4,3.6,5);controls.target.set(0,0,0);controls.update()}
const cards=document.querySelector('#cards');catalog.forEach((d,i)=>{const b=document.createElement('button');b.className='card';b.innerHTML=`<span class="card-icon">${d.icon}</span><span class="card-name">${d.name}</span><span class="card-sub">${d.sub}</span>`;b.addEventListener('click',()=>{current=i;selected=-1;renderModel();document.querySelector('#visor').scrollIntoView({behavior:'smooth',block:'start'})});cards.append(b)});
document.querySelector('#reset').onclick=()=>{selected=-1;renderModel()};document.querySelector('#zoom-in').onclick=()=>{camera.position.setLength(Math.max(controls.minDistance,camera.position.length()*.8));controls.update()};document.querySelector('#zoom-out').onclick=()=>{camera.position.setLength(Math.min(controls.maxDistance,camera.position.length()*1.2));controls.update()};
const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();let down=null;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>7)return;const rect=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects(clickable,false);if(hits.length){selectPart(hits[0].object.userData.part)}});
document.querySelector('#rotate').onclick=()=>{controls.autoRotate=!controls.autoRotate;updateRotationButton()};controls.addEventListener('start',pauseRotation);updateRotationButton();
function resize(){const w=sceneEl.clientWidth,h=sceneEl.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)}new ResizeObserver(resize).observe(sceneEl);const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);controls.update(clock.getDelta());renderer.render(scene,camera)}renderModel();animate();

// Search uses the same catalog and selection behavior as the existing cards.
const searchToggle=document.querySelector('.search-component');
const searchPanel=document.querySelector('#component-search');
const searchInput=document.querySelector('#component-query');
const searchResults=document.querySelector('#search-results');
const searchStatus=document.querySelector('#search-status');
const searchAliases=['placa base motherboard','cpu','ram','gpu grafica tarjeta de video','ssd disco duro','psu fuente de alimentacion'];
const normalizeSearch=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function filterComponents(){
 const terms=normalizeSearch(searchInput.value).split(/\s+/).filter(Boolean);
 searchResults.replaceChildren();
 catalog.forEach((component,index)=>{
  const text=normalizeSearch(component.name+' '+searchAliases[index]);
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
