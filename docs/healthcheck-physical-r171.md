# R171 — primera ejecución física del healthcheck

2026-10-12. Tras preparar el chequeo R170, el usuario indicó «bueno, dale.
cuando sea necesario lo hago yo». Se ejecutó una vez la consulta desde el PC,
sin instalar ni activar una esfera. No fue necesaria intervención manual.

Comando: `node tools/pc-rfcomm.mjs healthcheck`. Cliente propio ya compilado,
hash/build verificados antes de arrancar, target y clave privados existentes.
No USB/ADB/teléfono, pairing, nueva clave o cambio de configuración de logs.
Ejecutable revisado actual SHA256:
`162a487aee79cbefb0b4d93a93204ce49a098275b1f7816bacab224da3cb2a43`.

| Campo | Resultado |
|---|---|
| Estado | Complete; exit0 |
| Protocolo | V1 |
| HMAC / auth / respuestas cifradas | Válidos |
| Batería | 97 % |
| Modelo reconocido / firmware | Sí /2.2.86 |
| Catálogo | 21 esferas,1 activa,0 IDs no reconocidos |
| ID propio365799910 | Ausente; todavía no instalado |
| Frames | 6 enviados,12 recibidos |
| Duración del cliente | 1727ms; no FPS ni latencia de UI |
| Cierre / worker | Confirmados; sin error nativo/supervisor |
| Archivo transferido | No |
| UI / render / recovery físico | No verificados |

La consulta confirma que el servicio de control respondió en esa sesión.
No acredita observación de pantalla, funciones completas, estabilidad continua
ni ausencia de reboots. No se exigió otro retorno a Mi Fitness entre consultas.
No se realizó polling/reintento ni comando de instalación/selección/borrado.

El [plan de primera instalación estática](static-watchface-physical-plan-r169.md)
sigue pendiente de autorización separada por implicar almacenamiento persistente.
Los gates de escritura continúan cerrados. Este resultado no demuestra que
el paquete sea aceptado, eliminable o seguro en firmware2.2.86.
