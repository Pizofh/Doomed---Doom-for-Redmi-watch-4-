# R159 — una sesión agrupada de consultas Xiaomi

**Resultado R161:** [dos intercambios Xiaomi v1](windows-auth-result-r161.md)
terminan en AuthHmacMismatch con el candidato histórico, cierre/worker OK.
No repetir el lote con esa credencial; no auth-final/GET/archivos. Obtener logs
recientes tras volver a Mi Fitness y CONSERVAR esa asociación antes de revisar
otra ruta de acceso PC. Las instrucciones inferiores son historial del ensayo.

**Corrección R160:** [primer lote no abrió el canal](windows-session-open-failure-r160.md).
Windows conservaba vínculo antiguo tras nuevo flujo del reloj. Parent terminal
close corregido/probado, reporte nativo acotado ampliado, sin nuevos payloads.
Pairing Windows nuevo desde QR actual antes de un lote manual, teléfono BT OFF;
no cambiar otra vez el modo del reloj tras confirmar el código. Herramienta
recompilada; 144 aserciones C#, seis fallos IPC (dos regresiones terminal-close).
Esto no demuestra causa del fallo anterior ni éxito del siguiente.

2026-10-12. Después de [SPP real confirmado](windows-spp-result-r158.md), el usuario
pide reunir las pruebas para no volver a Mi Fitness entre cada consulta. La
secuencia de handshake/consultas se prepara para ejecución MANUAL; no ejecución
automática. No instalar código, archivos, paquetes, esferas o firmware.

## Qué ejecuta el lote

Un proceso PC y un socket SPP seguro, mediante el destino privado ya verificado.

1. Preflight de destino/cache/radio, apertura SPP con autenticación+encriptación.
2. Una petición de versión Xiaomi. Exige respuesta V1 o V2: no asumir V1 tras
   timeout ni interpretar otra versión como V2.
3. Si V2: inicio de sesión y ACKs de transporte; ningún canal bulk/OTA enviado.
4. Una autenticación nonce/HMAC con el único candidato conocido. Verifica HMAC
   del reloj ANTES de enviar confirmación. No cero-key guessing/bruteforce,
   fallback plaintext, cambios de clave o retries.
5. Tras respuesta auth: System(type2/subtype1) batería y (2/2) device info,
   una vez cada una. Timeout de batería no impide intentar device info.
6. Cerrar socket y worker; producir un único JSON resumido. No timers/background.

Se omite initialize completo de Gadgetbridge y sus otros servicios/config.
No Clock/Password/Language/Camera SET, notificaciones, contactos, sensores/salud,
GPS, uploads, shell, ELF o drivers del reloj. Version query/auth sí son comandos
Xiaomi: el booleano del nuevo reporte los distingue del probe R154 sin payload.

## Credencial y privacidad

Preparación PC reutilizó logs ya suministrados: un único candidato de 32 hex en
líneas con etiqueta RW4/M2315W1, guardado exclusivamente en
tools/local/pc-rfcomm/auth.json (ignorado por Git). Asociación contextual por línea
no es asociación estructural ni vigencia demostrada. No se imprimen clave,
hash de clave, MAC, payloads, QR, serial o logs. El sourceTag reconoce procedencia
histórica; no se declara «clave actual». HMAC decidirá si corresponde a la sesión.
Si falla, detener con diagnóstico; no reciclar todas las claves de logs.

Auth metadata indica nombre «RW4 Windows client», perfil de compatibilidad
API36 del protocolo Android revisado, unknown1=0/unknown3=224/idioma ES.
No reutiliza identidad de dispositivo/cloud de otro modelo ni instala Android.
Puede afectar estado de cliente remoto; no garantía de cero escritura interna.
Clave del archivo nunca viaja en claro al reloj; se utiliza para derivar material
y verificar HMAC. Keys/nonces/raw incoming solo en memoria/pipe privada. Key
buffer del proceso JS se borra al salir del lote; no garantía de borrado forense
de todas las copias internas de Node/OpenSSL.

Device info puede incluir serial; el cliente únicamente devuelve firmware
numérico y booleano modelRecognized. Otros campos y canales de salud se descartan.
V1: CCM con tag verificado; V2: CTR definido por el protocolo más CRC16/ARC.
No presentar CRC como autenticación criptográfica. Bluetooth seguro y desafío
HMAC son capas separadas.

## Comando único para el usuario

Con el mismo vínculo Windows que dejó el usuario activo:

```powershell
node tools/pc-rfcomm.mjs session
```

No ejecutar probe antes ni reinstalar APK. El wrapper exige target/auth locales
válidos y hashes EXE/C#/módulos JS correspondientes al build. No arguments de MAC
o keys, no stdout de paquetes. Guardar/copiar SOLO JSON final, sin auth.json.
Puede durar hasta aproximadamente un minuto. No repetir ante éxito/fallo.
Cuando termine el lote, quitar solo RW4 de Windows y volver a vincular Mi Fitness
como el usuario ya comprobó. No cambio de vínculo entre consultas. Si usuario
necesita mantener PC para revisar un resultado, no inventar retorno completado.

## Límites, efectos, retorno y compatibilidad

| Campo | Evaluación |
|---|---|
| Unidad | M2315W1/2.2.86 reportados, MAC privada verificada por usuario; SPP Windows probado, protocolo/auth del lote aún no |
| Componentes | Programa C#/Node en PC, stack Bluetooth stock y servicio Xiaomi existente |
| Persistencia | Pairing/unlink ya cambió registros de vínculo. Session/auth pueden guardar estado de cliente internamente; no se solicita escritura de archivos/config ni cambios de clave |
| Particiones/bootloader | Ninguna herramienta u operación solicitada; no auditoría de escrituras internas del firmware |
| Firmware modificado | No requerido ni enviado |
| Plazos | Apertura 20s; fases versión/auth/query 5s; worker 55s cooperativo, supervisor 60s con hasta 1s para observar kill |
| Recursos | Hasta96frames TX/16KiB TX,128KiB RX,256frames parsed; límites nativos y JS. stdout privado acotado; errores fijos |
| Cancelación | Ctrl+C termina worker. Sin cierre remoto garantizado tras kill; closeConfirmed=false si forzado; PID local si salida no confirmada, no repetir |
| Reversible por reboot | No mecanismo prometido: vínculo vuelve por quitar PC y re-vincular Mi Fitness |
| Recuperación conocida | Procedimiento de vínculo ya probado por usuario; retorno de ESTE lote pendiente. No recovery integral de firmware |
| Peor fallo razonable | Auth rechazada/clave histórica inválida, query sin respuesta, Bluetooth/driver bloqueado, necesidad de re-vincular Mi Fitness; detener, no reset automático |
| Soft/hard brick | No nuevo código en reloj ni firmware/boot escritos por nuestra herramienta. Un bloqueo de pila stock no se descarta; no evidencia específica de hard brick por estas consultas, tampoco garantía absoluta |
| Stop | HMAC/CCM inválido, protocolo distinto, preflight fallido, trama corrupta, límites, worker/cierre no confirmado, advertencia de borrado, Mi Fitness no retorna |

Este lote no es sandbox del firmware. El pipe permite bytes generados por nuestro
cliente y es interno, no un canal público para comandos arbitrarios. Modificar
fuente o ejecutar worker directamente evade procedimientos, no controles de
seguridad del reloj; no usar ese camino.

## Validación offline y procedencia

Implementación propia de campos/framing a partir del worktree de diagnóstico
Gadgetbridge existente, que contiene parches. No se copió/reverse-engineered
firmware. Referencias: XiaomiSppSupport, Packet/ProtocolV1/V2, AuthService,
XiaomiSystemService, xiaomi.proto, RedmiWatch4Coordinator (Classic experimental),
XiaomiCoordinator (checkDecryptionMac=true). No garantía específica 2.2.86.

Validación: build x64 sin warnings; 142 aserciones C#; 12 sesiones sintéticas
de protocolo (V1/V2, éxito, key mismatch, sin ACK, batería timeout, datos claros,
versión no soportada/ausente); dos sesiones completas por IPC falso con nonce
aleatorio; cuatro fallos de supervisión/IPC; diez escenarios del supervisor R154.
Tests cubren CRC-16/ARC check value, derivación comparada con hkdfSync, integridad
CCM, duplicados/varints/framing/fragmentación/límites, privacidad y ausencia de
auth-final/queries ante key mismatch. No sockets ni procesos nativos reales.
CI actualizado, todavía no ejecutado en GitHub. Ningún resultado físico del lote
se afirma hasta recibir el JSON del usuario.

```powershell
node tools/pc-rfcomm.mjs build
node tools/pc-rfcomm.mjs test
node tools/test-pc-rfcomm-supervisor.mjs
node tools/test-rw4-xiaomi-session.mjs
```

Resultado deseado: protocolVersion identificado, keyHmacVerified,
authenticationAck, encryptedDataReceived y datos sanitizados, cierre/exit
confirmados. No significa aplicación instalada, Doom en RW4, loader o ABI.
