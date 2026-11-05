import * as THREE from 'three';
export function createComputer({scene,camera,controls,host,modelFactory}){
 const root=new THREE.Group();scene.add(root);root.visible=false;
 const positions=[[-.35,.15,0],[-.55,.42,-.35],[.3,.48,-.4],[.3,.8,.55],[1.15,-.3,-.25],[0,-.7,.1]];
 const scales=[.65,.22,.3,.45,.25,.38];
 const parts=[],bases=[],labels=[];
 let installed=[],error=-1,target=-1,success=-1,successTime=0,errorText='',active=[],phase=0,paused=false,mode='',elapsed=0,errorTime=0,links=[],onSelect=()=>{};
 const labelLayer=document.createElement('div');labelLayer.className='model-labels';host.append(labelLayer);
 const names=['Tarjeta madre','Procesador','RAM','GPU','Almacenamiento','Fuente'];
 function block(w,h,d,x,y,z,color,opacity=1){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,transparent:opacity<1,opacity,depthWrite:opacity===1,roughness:.6}));
  mesh.position.set(x,y,z);root.add(mesh);return mesh;
 }
 block(3.2,.1,2.8,0,-1,0,0x48434e);
 block(.07,3,2.8,-1.6,.45,0,0x8b8591,.15);
 block(3.2,3,.07,0,.45,-1.4,0x8b8591,.12);
 const frame=new THREE.BoxHelper(block(3.2,3,2.8,0,.45,0,0x88808e,.035),0x766a83);root.add(frame);
 positions.forEach((position,index)=>{
  const group=modelFactory(index);for(const marker of [...group.children]){if(marker.userData.marker!==undefined){group.remove(marker);marker.traverse(mesh=>{mesh.geometry?.dispose();mesh.material?.dispose()})}}group.scale.setScalar(scales[index]);group.position.set(...position);root.add(group);parts.push(group);
  group.traverse(mesh=>{if(mesh.material){mesh.userData.originalColor=mesh.material.color.clone();mesh.userData.pcPart=index}});
  const zone=block(index===0?2.4:.7,.035,index===0?2:.65,...position,0x9965cf,.22);bases.push(zone);
  const button=document.createElement('button');button.className='model-label';button.textContent=names[index];button.onclick=()=>onSelect(index);labelLayer.append(button);labels.push(button);
 });
 const net=block(.25,.3,.3,-1.2,.6,-.8,0xaaa2b0);
 function clearLinks(){links.forEach(({line,dot})=>{for(const mesh of [line,dot]){root.remove(mesh);mesh.geometry.dispose();mesh.material.dispose()}});links=[]}
 function connect(indices){
  clearLinks();
  for(let i=1;i<indices.length;i++){
   const anchors=[...positions,[-1.2,.6,-.8]];
   const a=new THREE.Vector3(...anchors[indices[i-1]]),b=new THREE.Vector3(...anchors[indices[i]]);
   const path=new THREE.QuadraticBezierCurve3(a,a.clone().lerp(b,.5).add(new THREE.Vector3(0,.55,0)),b);
   const line=new THREE.Mesh(new THREE.TubeGeometry(path,20,.012,5),new THREE.MeshBasicMaterial({color:0x9c55ef}));
   const dot=new THREE.Mesh(new THREE.SphereGeometry(.045,8,8),new THREE.MeshBasicMaterial({color:0xf4ceff}));
   root.add(line,dot);links.push({path,line,dot});
  }
 }
 return {
 show(kind,configuration,select){
  mode=kind;onSelect=select;root.visible=true;labelLayer.hidden=false;installed=configuration;paused=false;elapsed=0;error=-1;active=[];clearLinks();
  camera.position.set(4,3.6,5);controls.target.set(0,.2,0);controls.update();
 },
 hide(){root.visible=false;labelLayer.hidden=true;clearLinks()},
 install(configuration,index,rejected=false,message=''){
  errorText=message;
  installed=configuration;target=index;
  if(rejected){error=index;errorTime=1.5;parts[index].position.x=positions[index][0]+.5}
  else{error=-1;success=index;successTime=1;parts[index].position.y=positions[index][1]+.8}
 },
 target(index){target=index;error=-1;connect([])},
 focus(index){const position=new THREE.Vector3(...positions[index]);controls.target.copy(position);camera.position.copy(position).add(new THREE.Vector3(3,2.5,3));onSelect(index)},
 stage(indices){active=indices;connect(indices);phase=0},
 pause(value){paused=value},
 update(delta){
  if(!root.visible)return;
  if(!paused){elapsed+=delta;phase+=delta}
  errorTime=Math.max(0,errorTime-delta);successTime=Math.max(0,successTime-delta);
  parts.forEach((part,index)=>{
   part.visible=mode==='run'||!!installed[index]||target===index;
   part.position.lerp(new THREE.Vector3(...positions[index]),1-Math.exp(-delta*6));
   const rejected=error===index;
   if(rejected&&errorTime>0)part.position.x+=Math.sin(errorTime*40)*.035;
   part.traverse(mesh=>{
    if(!mesh.material)return;
    mesh.material.color.copy(mesh.userData.originalColor);
    if(rejected)mesh.material.color.set(0xd23b53);
    else if(success===index&&successTime>0)mesh.material.color.set(0x489268);
    else if(active.includes(index))mesh.material.color.set(0xa569dc);
    mesh.material.transparent=mode==='build'&&!installed[index];
    mesh.material.opacity=mesh.material.transparent?.4:1;
   });
   bases[index].visible=mode==='build'&&(target===index||error===index);
   bases[index].material.color.set(error===index?0xd23b53:0x9657ce);
   labels[index].hidden=!part.visible;
   labels[index].textContent=names[index]+(rejected?' · '+(errorText||'incompatible'):'');
   labels[index].style.background=rejected?'#fbe2e6':'';
   labels[index].style.maxWidth=rejected?'220px':'';
   const projected=part.position.clone().add(new THREE.Vector3(0,.3,0)).project(camera);
   labels[index].style.left=(projected.x*.5+.5)*100+'%';labels[index].style.top=(.5-projected.y*.5)*100+'%';
  });
  net.visible=mode==='run';net.material.color.set(active.includes(6)?0xa569dc:0xaaa2b0);
  links.forEach(({path,dot},index)=>path.getPoint((phase*.5+index*.3)%1,dot.position));
 },
 hit(raycaster){
  const hits=raycaster.intersectObjects(parts,true);
  const hit=hits.find(hit=>hit.object.visible&&parts[hit.object.userData.pcPart]?.visible);
  if(hit)onSelect(hit.object.userData.pcPart);
 },
 get visible(){return root.visible}
 };
}
