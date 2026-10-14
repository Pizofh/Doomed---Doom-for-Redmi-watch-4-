# R247 — plan ProcView, pendiente de autorización

2026-10-14. Paquete nuevo, no autorizado ni enviado. La autorización de corrección
de ruta ModInfo2 ya fue consumida: este payload añade visualización de un
extracto real y más imágenes. Regla inicial exige revisión antes del nuevo ensayo.
No StepC/C, cambio de firmware o reinterpretación automática de metadata.

## Identificación, evidencia y backup

M2315W1/FW2.2.86, Mi Fitness3.59.1i, Android16/HyperOS3.0.302.0; región/build Vela
exactos desconocidos. Modelo/FW/ID ausente/una activa exigidos por preflight.
Usuario junto al reloj, batería≥50%, menús/cambio normales, sin OTA/cliente
paralelo. No cambiar vínculo, liberar espacio o borrar esferas automáticamente.

Lectura de esta ruta ya pasó cuatro indicadores verdes en ModInfo2; formato
no reconocido y discrepancia ASCII sin resolver. Lua/PNG/cambio de esfera
comprobados en esta unidad. Nueva UI con164celdas de glifos no probada físicamente.
22casos con mocks S3 y readback del paquete pasan, no réplica del RW4.

ProcView365219973,21836bytes, perfil r246,
`artifacts/proc-view-r246/ProcView-id-only.face`, SHA256
`07527d9a79a8d24d7e761db65c73198f93f3265da2304963b95bbc916d85b75a`.
Source SHA5db8d5670f96ef1940c7d60f011a8015d0eb7a6182731b98dcb786f467c6b209.
Journal nuevo `tools/local/pc-rfcomm/proc-view-r247.json`, ausente/sin lock.
Backup limitado a fuentes/paquete/hash/catálogo/journal. No backup integral de
firmware/particiones ni recovery integral validado. No publicar extractos reales.
Procfs contiene metadata que puede incluir direcciones de memoria: la prueba
no consulta claves del vínculo o logs generales; no presume ausencia de datos
inesperados si la salida stock está dañada.

## Secuencia solo después de aprobar

1. Prepare cerrado; habilitar solo r246/C# temporalmente, rebuild/hash/prepare.
2. Un `node tools/pc-static-watchface.mjs install r246`: auth/info/catálogo,
   INSTALL4/4/upload22/0/MASS5,11partes por defecto; inactiva, sin SET/DELETE,
   reemplazos/otro ID/reintento/fallback. Rechazo o incertidumbre: parar.
3. Finally cerrar gates/rebuild/testgates0sockets. Si instalado/cerrado,
   un GET `node tools/pc-rfcomm.mjs watchfaces` independiente exige propia nueva
   inactiva y entradas/selección previas preservadas. Cerrar socket/worker.
4. Usuario selecciona **ProcView, tres barras azules**. PROC DATA, cuatro filas
   grises, LEN HEX y espacios vacíos; botones CHECK y MODE (inactivo).
   Rojo inicial/faltaUI/fallo: no CHECK; volver a habitual y describir.
5. CHECK una vez crea/verifica17bytes propios en
   `/data/app/watchface/market/365219973/lua/proc-view-attempt-r246.txt`.
   Persiste; fallo/marca previa impide consulta. No otras escrituras runtime.
6. Solo `/proc/modules` rb,≤8193+1EOF, exige≤8192 y cierre. Snapshot en RAM:
   longitud/head64/tail16; no tabla cruda/captura/PNG escritos, shell, driver
   propio, ELF, C, módulo o Timer. Sin timeout duro del lector stock.
7. Usuario observa cuatro colores y LEN HEX/HEAD TEXT/TAIL HEX. Si cuatro verdes
   y datos legibles, puede pulsar MODE una vez para HEAD HEX sobre **la misma
   lectura**; no otro CHECK ni reentrada. Si falla, no seguir.
8. Usuario comunica el extracto de esa pantalla, vuelve a habitual y confirma
   menús/scroll/pulsación larga. No enviar logs generales o publicar metadata.

No conclusión automática de registro vacío o safe-unload, aunque cuatro verdes.
No intervención sobre StepC, rmmod/carga, reinicio, borrado de marca/paquete o
rearmado bajo esta autorización. [Representación exacta y límites](proc-view-r246.md).

## Riesgos y reversión

| Componente | Reboot revierte | Flash | Particiones / bootloader | FW modificado | Reversión / fallo razonable |
|---|---|---|---|---|---|
| Instalación/catálogo/selección | No garantizado | Sí | Sin acceso dirigido | No | Volver a habitual; no retirada automática |
| Marca propia17bytes | No | Sí | Sin acceso dirigido | No | Persiste, sin rearmado |
| Lua/UI/decodificador de muchos glifos | RAM sí; persistencia no garantizada | Solo anteriores | Sin acceso dirigido | No | Error/OOM/bloqueo de UI; Ajustes si responde |
| Lectura procfs stock | No aplica | No write solicitado | Sin acceso dirigido | No | Metadata/driver pueden bloquear/panic; sin timeout duro |
| MODE | Solo vista en RAM | No | No | No | Render puede fallar; no consulta nueva |

Peor fallo razonable: bloqueo, panic/reboot o corrupción FS; posible soft brick.
No operación dirigida a boot/particiones que deba causar hard brick, sin garantía
integral frente a errores stock. RAM-only no es sandbox; privilegios exactos y
recovery integral no validados. Recuperación parcial conocida: cambiar de esfera
desde Ajustes si menús responden. Reboot no restaura flash. Ante fallo detener,
no improvisar flash/boot/recovery/firmware ajeno/exploit/SWD/JTAG/apertura física.
