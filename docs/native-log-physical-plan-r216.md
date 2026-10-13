# R216 — revisión pendiente: NativeLog, mensaje C en archivo propio

2026-10-13. **NO AUTORIZADO NI EJECUTADO. Gates Node/C# cerrados.**
[Preparación, fuentes y31escenarios R215](native-log-r215.md).
La autorización FirstC2 fue de un solo ensayo, ya completado. Este paquete
cambia código, ID/hash, bindings y writes; la regla física inicial del usuario
exige nueva revisión. No habilitar/enviar por un «sigamos» de investigación.

## Identificación y precondiciones

Solo unidad M2315W1/FW2.2.86 del usuario. Región desconocida; HyperOS/Vela exacta
del reloj no identificada. Teléfono habitual Android16/HyperOS3.0.302.0,
Mi Fitness3.59.1i; no se modifica ni desvincula automáticamente.
Preflight autenticado exige modelo reconocido/FW y catálogo, sin propiaID previa
y una esfera activa. Usuario junto al reloj, batería≥50%, menús/esfera/cambio
normales, vínculo PC actual disponible, sin otro cliente/actualización concurrente.
No consultar batería, cambiar clave/vínculos o borrar esferas automáticamente.
Si falta espacio, parar al rechazo; no fallback ni segundo envío.

Backup: fuentes/paquete propios, hash, journal nuevo y catálogo previo del
instalador. No backup integral de particiones/config/firmware físico. OTA privada
inspeccionada como datos no ofrece recuperación validada. Los ensayos anteriores
deben conservarse, especialmente FirstC2 y su marca; no abrirlos/rearmarlos.

## Objetos fijos

- NativeLog ID365219999,28.348bytes; nuevo registro, no reemplazo ni autoactivación.
- Paquete SHA256 `1e88ce20dcbb28f6680be89f1625c22682890fb8efc8f2a605b0d34bde6579eb`.
- Lua18.156bytes SHA256 `df5c6cc3171d3441839d3dd9bd00e4aae98aaa24876be380f12e0627b9a28477`.
- ELF1500bytes SHA256 `9dff873fd6d41669de0d336528a35c7c281fa1e03ee1eb5ebcddd6d6907ca652`.
- Módulo único rw4logr211; journal tools/local/pc-rfcomm/native-log-r216.json,
  aún ausente. Helper cerrado SHA b8d7a688d0d3a6765a21ad3dadac34cda2a46a877ad0c1853fc583aa068ebc85.
- Raíz física requerida `P=/data/app/watchface/market/365219999/lua/`. Si la
  watchface entrega otro path normalizado, setup bloquea el botón antes de C.

Contratos parciales: loader RW4 e inicializador mínimo físico validados; nuevas
APIs solo inferidas de callers/callees de la imagen coincidente. Binding Thumb
fopen0c2ebf0d/fclose0c2ebff5/fread0c2ec131/fwrite0c2ec4e5/fflush0c2ec609.
No símbolos S3 ni SDK inventado. Config/privilegios desconocidos: potencialmente
amplios, **sin sandbox**. Fingerprints64bytes no prueban legibilidad o ABI y
no impiden faults. No existe timeout duro para llamadas shell/nativas.

## Secuencia únicamente después de autorización

| Paso | Comando/acción exacta | Efecto |
|---|---|---|
| Preparación realizada | node tools/pc-static-watchface.mjs prepare r215 | PC, hashes/14partes, sin radio |
| Un envío | node tools/pc-static-watchface.mjs install r215 | Solo tras habilitación temporal r215/rebuild/hash/prepare; auth/info/catalog, INSTALL4/4/upload22/0/MASS5; escribe paquete/catálogo stock |
| Cerrar gates y verificar | node tools/pc-rfcomm.mjs watchfaces | Después de restaurar gates/rebuild; GET propia inactiva y anteriores conservadas; no SET |
| Seleccionar manualmente | Selector→NativeLog, preview cinco barras cian | UI/Lua, no C al abrir; FILE/MARK/C TEXT/UNLOAD/END inicialmente grises |
| Una pulsación manual | RUN C una sola vez, con cinco grises y etiquetas correctas | Marca, inicialización C, lectura de su archivo, retiro atribuido |
| Volver | Ajustes→Esferas→habitual | Confirmar menús/desplazamiento/pulsación larga; no reabrir/repetir |

No retirada DELETE automática incluida en este ensayo. Si después el usuario
la decide y retorno/ausencia de módulo están confirmados, se preparará retirada
exclusiva de NativeLog inactiva mediante su journal; ninguna otra esfera.

El click manual ejecuta como máximo cinco comandos shell:

1. `lsmod > Plog-inspect-r211.txt`, solo capture ausente; comprobar formato y
   ausencia de rw4logr211/rw4minr197/rw4minr202; retirar capture propia.
2. Lua escribe `Plog-attempt-r211.txt`:19bytes RW4-NATIVELOG-R211 más newline,
   flush/close/readback y presencia independiente. Marca nunca borrada/rearmada.
3. `insmod Plog.elf rw4logr211 > Plog-inspect-r211.txt`, una sola vez. C lee
   fingerprints, abre/lee/cierra la marca y pide creación exclusiva wbx de
   `Pnative-stdout-r211.txt`, escribe16bytes RW4_C_FILE_R214 más newline,
   flush/close; init0 solo si todo satisface contrato. **Es archivo C directo,
   no stdout capturado por >.** Lua lee≤256bytes, exige texto exacto y retira
   archivo propio tras ausencia previa; también retira capture NSH.
4. `lsmod > Plog-inspect-r211.txt`: solo con retorno síncrono normal; atribuir
   registro propio, sin módulos anteriores. Init rechazado/ausencia: detener sin rmmod.
5. `rmmod rw4logr211 > Plog-inspect-r211.txt`: únicamente si registro propio
   confirmado. Aunque lectura/mensaje fallaran, intentar esta limpieza atribuida.
6. `lsmod > Plog-inspect-r211.txt`: confirmar ausencia final propia/anteriores.

Son cinco comandos porque el paso2 es I/O Lua. No comandos formados con entrada
arbitraria. Capturas previas/desconocidas no se borran. Tras excepción de dispatch,
inventario incierto o presencia anterior, no unload/retry a ciegas. Solo END verde
si ELF/marca/mensaje/carga/retirada/limpieza se verificaron; mensaje malo puede
mostrar C TEXT rojo y UNLOAD verde. Un fallo no debe presentarse como éxito.

## Writes, reversión y riesgo

| Componente | Persistencia / reversión |
|---|---|
| Paquete/catálogo/selección stock | Filesystem/flash; no desaparecen por reboot. Volver a esfera habitual si UI responde; posible retirada propia posterior |
| Marca19bytes, capturas≤8192bytes | Archivos propios y metadata FS; marca permanece y bloquea repetir |
| Archivo C16bytes | Creación exclusiva solicitada, write/flush/close y retirada Lua; si falla cleanup puede permanecer. Atomicidad/durabilidad física sin probar |
| Módulo C/stream buffers | RAM mientras loader/APIs ejecutan; APIs pueden asignar, FD/stream/frees no medidos. Reboot puede descartar RAM, no asegura restaurar FS |
| Particiones crudas/bootloader/recovery | Ningún comando dirigido a ello, sin firmware modificado/flash tool. Internals stock y privilegios no completamente conocidos |

Riesgo mayor que FirstC2 mínimo: ahora hay lecturas de direcciones de código y
cinco llamadas de archivo. Peor fallo razonable: fallo de carga, descriptor/
módulo residual, bloqueo/UI/panic/reboot, corrupción de memoria o filesystem.
Soft brick/corrupción persistente no descartados. Hard brick no esperado por
el código previsto, sin garantía frente a error de dirección/ABI o contexto
privilegiado. No hay recovery/reflashing integral validado para esta unidad2.2.86.

Recuperación conocida limitada: selección desde Ajustes funcionó en ensayos
anteriores, y reinicio stock está documentado en [plan general](physical-device-plan.md).
No se ha probado recuperación de un fault de estas APIs. Si UI responde, volver
a habitual; si END ya rojo, no pulsar. Si bloqueo/anomalía, detener nuevas acciones
remotas y describir estado; no reset/firmware/unload ciego ni volver a activar.
pcall no intercepta faults nativos o corta deadlocks. Usuario debe poder observar
e intervenir; no reemplazar esa presencia por healthcheck remoto.

31escenarios de carrier con I/O real/backend simulado, build/disassembly estáticos,
cuatro records de paquete verificados y transferencia/sesión/gates offline pasan.
**Nuevas APIs C y UI completa del paquete todavía no probadas en hardware.**
Esta revisión solo cubriría un envío/selección/click/retorno; no Doom, reintentos,
otros IDs o nuevas llamadas. Ante cualquier requisito de flash/boot/particiones/
exploit o recuperación no contemplada, volver a revisión y documentar alternativa.
