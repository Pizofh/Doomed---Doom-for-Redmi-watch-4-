# R170 — healthcheck del servicio de control, no de la pantalla

2026-10-12. Preparado y probado en PC; no se ejecutó contra el reloj físico.
El usuario propone checks automáticos para reducir necesidad de observación.

Comando manual preparado: `node tools/pc-rfcomm.mjs healthcheck`.
Usa la sesión/bond/clave ya revisados y el worker de consultas16KiB. Una sola
autenticación seguida de batería2/1, información2/2 y catálogo4/0. No INSTALL,
upload, SET, DELETE, reboot ni paquetes arbitrarios. Sin polling permanente,
reintentos o cambios de vínculo. Las operaciones de autenticación stock no
garantizan ausencia de cambios internos del firmware; no se solicita una
escritura de esfera o configuración.

El JSON incluye batería/FW/modelo reconocido, catálogo por conteos, presencia/
activación/eliminabilidad del ID propio y cierre de transporte. No publica
los IDs ajenos, nombres, claves, MAC o logs. Un resultado exitoso acredita
respuestas de estas consultas en esa sesión; no uptime, ausencia de reboots
entre sesiones, estado de sensores, RAM libre o funciones completas.

| Puede comprobar | No puede comprobar con estas APIs |
|---|---|
| Conexión y auth/HMAC | Imagen correcta en pantalla |
| Respuesta cifrada del modelo/FW | Touch/corona y navegación funcionales |
| Lectura de batería | Ausencia de bloqueo del hilo de UI |
| Registro y flags de la esfera propia | Contenido completo aceptado/renderizado |
| Cierre/exit del cliente PC | Recovery físico si deja de responder |

El catálogo es útil antes/después de una prueba, pero no convierte un upload
en seguro ni proporciona rollback si se pierde el canal. Un fallo de conexión
tampoco identifica por sí solo un brick: puede ser vínculo/radio/distancia.
Bluetooth respondiendo puede coexistir con una UI averiada. Por ello informa
`uiVerified=false`, `renderVerified=false`, `physicalRecoveryVerified=false`:
significan no verificados, no diagnóstico de fallo.

Pruebas: 8 sesiones sintéticas V1/V2 (éxito, batería ausente, timeout de catálogo
y respuesta sin cifrar) y una sesión por IPC simulado. La regresión anterior
también pasa. No socket, teléfono ni reloj usados. El modo puede apoyar
consultas remotas y seguimiento; no habilita instalación ni selección remota.

Para la primera instalación física, el [plan R169](static-watchface-physical-plan-r169.md)
sigue pendiente de revisión. Healthcheck no reemplaza observar el primer render
y poder intervenir con los controles stock si falla. Después de validar ese
ciclo físicamente se podrá decidir qué ensayos posteriores admiten supervisión
remota y qué rollback ya quedó demostrado. No asumirlo antes.
