# Explora tu PC

En esta carpeta ejecuta `python -m http.server 8000` y abre http://localhost:8000. Three.js está incluido en vendor. El visor requiere un navegador con WebGL.

El panel derecho reúne el catálogo, la búsqueda, la ficha y los términos técnicos. En pantallas pequeñas, abre o cierra el panel con **Herramientas**. Usa los controles del visor para girar, acercar, restablecer la vista y alternar Despiece, Rayos X y Flujo de datos.

Abre **Laboratorio** en el encabezado para acceder a cuatro actividades. El recorrido resalta cada pieza en el visor, el simulador anima conexiones conceptuales en la tarjeta madre y el ensamblaje guía la instalación de seis piezas con comprobaciones básicas. El diagnóstico ofrece casos en tres niveles con explicación por respuesta.

Los modelos y los flujos son esquemáticos. El gabinete representa la instalación por casillas y la compatibilidad se limita a las reglas del ejercicio.

Comprobación de sintaxis: `node --check app.js` y `node --check lab.js`.


Simulador y ensamblaje visual
- Ambos usan el visor existente con un gabinete semitransparente y modelos esquemáticos reutilizados.
- El simulador ofrece cuatro actividades con tres etapas, indicadores de participación, pausa, reanudación, reinicio y avance manual. Cambia de actividad para comparar los procesos.
- El ensamblaje conserva su configuración al regresar al menú. Selecciona una pieza y pulsa Instalar o arrástrala sobre el visor. Las zonas moradas indican dónde va la pieza. Los intentos incompatibles se rechazan en rojo.
- Verificar mi PC revisa faltantes y compatibilidad. Sus resultados enfocan zonas del gabinete. Encender PC inicia una secuencia conceptual solo al completar una configuración válida.
- Las reglas del catálogo ficticio están en compatibility.js. No sustituyen una comprobación de potencia, firmware, refrigeración o cableado de hardware real.
- El gabinete usa colocaciones esquemáticas. No simula cables físicos, tornillos ni ajuste mecánico de precisión. Los modelos representan la categoría y no cambian de geometría según cada variante elegida.

Navegación y ayuda
- El selector superior cambia entre Exploración 3D y Laboratorio sin recargar.
- En escritorio, Ancho del panel permite ajustar el espacio de trabajo conservando el visor.
- El ensamblaje presenta piezas en tarjetas, pasos, acciones de comprobación y Mi configuración desplegable.
- La bienvenida aparece una vez por navegador. El botón ? permite reiniciar los diez pasos, consultar controles o leer instrucciones de la herramienta actual.
- Completar u omitir el tutorial guarda la preferencia en localStorage. Escape permite omitir el recorrido. El tutorial admite Tab y Enter, abre las secciones necesarias y respeta movimiento reducido.

Exploralo desde aquí: https://explora-tu-pc.vercel.app/
