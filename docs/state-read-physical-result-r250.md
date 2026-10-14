# R250 — StateRead detenida antes de abrir el nodo C

2026-10-14. M2315W1/FW2.2.86. Usuario autorizó un ensayo y presencia mediante
«Sí, autorizo y puedo observar el reloj», en respuesta al [plan](state-read-physical-plan-r250.md)
con batería≥50%. Después del envío, usuario ejecutó la lectura manual y confirmó
retorno a su esfera, cambio de esferas y menú normales.

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

## Observación física recibida

Iniciales grises; FRAME HEX sin punto, tal como está diseñada la UI. Usuario
reporta MARK verde, REG INFO rojo, «frame final rojo», resto gris. Confirma
retorno y menú normales. No snapshot hexadecimal disponible.

En el código aprobado, REG INFO reúne lectura/EOF/cierre y clasificación del
registro, además de lectura/cierre/verificación de la marca antigua. Cualquiera
de esas condiciones fallida deja REG INFO y FINAL rojos y retorna antes de
`io.open('/dev/rw4step234','rb')`. OPEN C gris es coherente con ese retorno;
no hubo evidencia de apertura o callbacks propios, ni nueva carga/retirada.
MARK verde confirma escritura, cierre y lectura exacta de su propia marca.

Si «frame final rojo» significa también FRAME rojo, hay una discrepancia:
esta rama deja FRAME gris. Conservar reporte, no inferir un frame recibido.
No identificación exacta del subfallo ni prueba de que el módulo haya desaparecido.
Los tests cubrieron fallos distintos que producen el mismo indicador REG INFO.
La UI no los distingue: la siguiente corrección debe separar las comprobaciones
previas, antes de otro acceso C. Sin nuevo envío, rearmado o repetición autorizados.

## Secuencia del ensayo ya consumido

Seleccionar **StateRead, cuatro barras amarillas**. Título C STATE,
diez indicadores grises, FRAME HEX vacío. Solo en ese estado pulsar READ C una vez.
Registrar MARK/REG INFO/OPEN C/READ C/EOF C/FRAME/IDLE/CLOSE C/REG LAST/FINAL,
framehex y retorno a esfera habitual con menús/desplazamiento/pulsación larga.
Si FINAL rojo inicial, UI ausente o fallo: no pulsar/repetir/reabrir.

La operación prevista invoca callbacks del C residente solo tras el preflight;
este ensayo se detuvo antes, por lo que siguen sin probarse aquí.
IDLE amarillo no autoriza reset/STOP; FINAL verde no prueba retirada segura.
No retirada, recarga, rearmado de marca o cambio de firmware autorizado.
