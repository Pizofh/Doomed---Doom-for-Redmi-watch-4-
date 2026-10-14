# R250 — StateRead instalada; lectura manual pendiente

2026-10-14. M2315W1/FW2.2.86. Usuario autorizó un ensayo y presencia mediante
«Sí, autorizo y puedo observar el reloj», en respuesta al [plan](state-read-physical-plan-r250.md)
con batería≥50%. No se ha observado aún la pantalla ni iniciado READ C.

## Instalación y comprobación

Un único envío del perfil r249, ID365219972, paquete20536bytes, SHA256
`de20e2c8a68d7148cecbb756a0245d6c357eb792cf220e198a276af455db80e9`.
Resultado RegisteredInactive: 11partes, stream20606bytes, TX21088bytes,
20frames enviados y16recibidos. Registro confirmado, propia removible,
selectedByClient=false. No ACK final independiente de aceptación de transferencia
(transferAcceptanceVerified=false); el catálogo posterior confirma el registro.

GET independiente tras cerrar permisos: catálogo16→17, todos los IDs/flags
anteriores conservados, activa365210175, StateRead inactiva/removible.
Journal privado `tools/local/pc-rfcomm/state-read-r250.json`: Registered,
11partes y lock ausente. Socket/worker cerrados, exit0, sin error nativo.
Sin activación, eliminación, reintento, lectura de nodo o carga/retirada de C desde PC.

Fuentes originales restauradas en finally: Nodefalse/r167 y C#false.
Rebuild cerrado y testgates exitosos, cero llamadas de socket en esa prueba.
Helper autorizado SHA256
`de18744536409a5ab70a5c6421bc2a4b8a2d5f27d772e18ed5f9a5fb92a14f3b`;
helper cerrado SHA256
`49d593a7efa36fc2739e97fa2a47d55d9eda330bd441f18197f4cd3c879cd78c`.
Evidencia privada en `artifacts/state-read-r250-authorized/`, runner consumido.

## Observación pendiente

Seleccionar **StateRead, cuatro barras amarillas**. Título C STATE,
diez indicadores grises, FRAME HEX vacío. Solo en ese estado pulsar READ C una vez.
Registrar MARK/REG INFO/OPEN C/READ C/EOF C/FRAME/IDLE/CLOSE C/REG LAST/FINAL,
framehex y retorno a esfera habitual con menús/desplazamiento/pulsación larga.
Si FINAL rojo inicial, UI ausente o fallo: no pulsar/repetir/reabrir.

Esta operación manual invoca callbacks del C residente; aún no probados aquí.
IDLE amarillo no autoriza reset/STOP; FINAL verde no prueba retirada segura.
No retirada, recarga, rearmado de marca o cambio de firmware autorizado.
