export const hardware=[
 [{name:'Placa A · LGA1700 / DDR4',socket:'LGA1700',ddr:'DDR4',format:'mATX',storage:['SATA','NVMe']},{name:'Placa B · AM5 / DDR5',socket:'AM5',ddr:'DDR5',format:'ATX',storage:['SATA','NVMe']},{name:'Placa C · E-ATX',socket:'AM5',ddr:'DDR5',format:'E-ATX',storage:['NVMe']}],
 [{name:'CPU A · LGA1700',socket:'LGA1700'},{name:'CPU B · AM5',socket:'AM5'}],
 [{name:'RAM A · DDR4',ddr:'DDR4'},{name:'RAM B · DDR5',ddr:'DDR5'}],
 [{name:'GPU A · 240 mm',length:240,power:false},{name:'GPU B · 300 mm / 8 pines',length:300,power:true},{name:'GPU C · 360 mm / 8 pines',length:360,power:true}],
 [{name:'SSD SATA',interface:'SATA'},{name:'SSD M.2 NVMe',interface:'NVMe'}],
 [{name:'Fuente A · ATX + EPS',pcie:false},{name:'Fuente B · ATX + EPS + PCIe 8 pines',pcie:true}]
];
export const order=[0,1,2,4,3,5];
export function issues(configuration,missing=false){
 const [board,cpu,ram,gpu,storage,psu]=configuration;
 const errors=[];
 const add=(part,text)=>errors.push({part,text,severity:'error'});
 if(board&&!['ATX','mATX'].includes(board.format))add(0,'El gabinete admite ATX y mATX. Elige una placa de uno de esos formatos.');
 if(board&&cpu&&board.socket!==cpu.socket)add(1,'Socket incompatible. CPU y placa necesitan el mismo socket físico.');
 if(board&&ram&&board.ddr!==ram.ddr)add(2,'Memoria incompatible. La generación DDR debe coincidir con la placa.');
 if(gpu&&gpu.length>320)add(3,'GPU demasiado larga. El gabinete admite hasta 320 mm.');
 if(gpu?.power&&psu&&!psu.pcie)add(5,'Falta alimentación PCIe de 8 pines. Selecciona la fuente B o la GPU A.');
 if(board&&storage&&!board.storage.includes(storage.interface))add(4,'Interfaz de almacenamiento incompatible con la placa.');
 if(missing)configuration.forEach((part,i)=>{if(!part)add(i,'Falta instalar este componente.')});
 if(missing&&errors.length===0)errors.push({part:5,text:'Revisar potencia, refrigeración y cableado en un equipo real. Este ejercicio solo valida formatos e interfaces.',severity:'warning'});
 return errors;
}
