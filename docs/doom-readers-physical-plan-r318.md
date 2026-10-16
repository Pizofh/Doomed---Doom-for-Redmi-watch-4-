# R318: DoomIO, ensayo agrupado del puente PNG multilector

Preparado y probado en PC. **Pendiente de autorización física.** No se ha
reiniciado, instalado ni enviado comandos al reloj durante esta revisión.

Objetivo: probar animación completa, controles, salida limpia y segundo inicio
en una sola instalación. El cambio C permite lectores PNG simultáneos con
cursores independientes. Se reprodujo una incompatibilidad en S3; todavía no
se ha demostrado que explique el fallo del reloj. No se promete corrección
visual ni cierre físico hasta observarlos.

## Paquete fijo

| Elemento | Valor |
|---|---|
| Destino | Redmi Watch4 M2315W1, firmware 2.2.86 |
| Esfera nueva | DoomIO, ID 365219953; preview de cinco barras naranjas |
| Paquete | 637.108 bytes, 30 recursos |
| Archivo local | `build/doom-readers-r318/package/DoomIO-id-only.face` |
| SHA256 paquete | `5fb7ec0b289a7492a0d97b3ef798de9aeba0003f2510be8c58b6d331d909a823` |
| SHA256 Lua | `9099594bee52dd635c048b38961423055556b8f7eb876481d4a5e3412b5d6abf` |
| C | 605.180 bytes; módulo `rw4png318` |
| SHA256 ELF | `8de1b31c8fe82c4fe3b52eb780e424cbdeca674c539557b58f20941093dc384f` |
| Journal privado nuevo | `tools/local/pc-rfcomm/doom-deployment/readers-r318.jsonl` |

Usa el WAD existente de DoomLauncher 365219963; no lo reenvía. Mantiene las
esferas actuales y su selección. Conservar DoomLauncher, DoomRAM 365219957 y
sus archivos; no abrir DoomRAM, DoomTrace ni pruebas nativas anteriores.
Si aún faltan huecos, pueden retirarse manualmente CInfo955 y CExit954,
inactivas y con sus ensayos terminados; no se presupone que ya se eliminaron.
La instalación usa el catálogo actual, sin exigir un número histórico.

## Retirar el estado anterior y probar

1. Con batería >=50%, junto al reloj y desde la esfera habitual, el usuario
   hará **un reinicio normal del sistema instalado** mediante la
   opción **Reiniciar** de Ajustes. Esto significa reiniciar el firmware stock,
   **no restablecer de fábrica**, desvincular, actualizar o flashear. Se hace
   porque `rw4png304` terminó su worker pero no pudo liberar la imagen ni
   completar JOIN; una referencia retenida sigue siendo la hipótesis directa.
   No se fuerza rmmod ni se modifican referencias o memoria.
   Comprobar arranque y menú habituales. Si no vuelve normalmente, parar.
2. Confirmado ese retorno, un único envío de DoomIO, inactivo. Aproximadamente
   312 partes con pausa de 100 ms y verificación del catálogo; sin reintento o
   reanudación automática, selección o borrado de esferas. Si falla, parar.
3. Seleccionar DoomIO una vez. Al abrir solo consulta el registro: si encuentra
   algún módulo residente, ERROR 40 bloquea START sin adoptarlo ni operarlo.
   Si está READY, pulsar START una vez. CHECKING verifica C/WAD; mantener la
   pantalla despierta con toques breves en zona vacía. No mantener pulsado.
4. Si aparece Doom completo y animado, probar brevemente UP/LEFT/RIGHT/FIRE,
   PAUSE/RESUME y EXIT antes de unos 30 segundos. Esperar CLOSED y START.
   Si aparece basura, error, bloqueo o se duerme durante CHECKING: EXIT si
   responde, volver a la habitual desde Ajustes y describir; no segundo ciclo.
5. Solo si todo el primer ciclo fue correcto y CLOSED: pulsar START de nuevo
   **sin abandonar esa instancia de DoomIO**. Omitirá CRC completo, pero
   repetirá controles de cabecera/tamaño/RAM y carga nueva. Jugar brevemente y
   EXIT; no tercer ciclo. Tras CLOSED probar el selector y volver a la esfera
   habitual; comprobar menú/corona. Si no abre, usar Ajustes y registrar el fallo.

La aprobación solicitada agrupa ese reinicio normal observado, una instalación
y hasta dos ciclos condicionados. No autoriza repetir CLOSE C, nuevos payloads,
descargas forzadas, reinicios adicionales, sonido, saves o cambios de firmware.

## Salida y diagnóstico

STOP se envía antes de liberar imágenes. Un fallo de presentación recibe un
solo intento de STOP y limpieza ordenada. Si falla liberar la imagen, JOIN,
registro, rmmod o retirar la lease, ERROR queda enclavado: Timer y GC no
repiten comandos ni fuerzan recursos. No se vuelve a abrir tras ERROR.

Los dos primeros dígitos junto al estado son la etapa; los dos siguientes,
el último errno de apertura de control o escritura fallida (00 sin error
capturado). No son un código hexadecimal de memoria ni el diagnóstico completo.

| Etapa | Operación |
|---|---|
| 01 / 02 | CRC / RAM |
| 10–18 | archivos, registro, nodos, lease, carga e inicio |
| 19 | lectura de estado |
| 24 / 25 | retirar imagen anterior / crear imagen |
| 26 | STOP |
| 30 / 31 / 32 / 33 | liberar imagen / JOIN / releer / verificar limpieza |
| 34–38 | identidad, rmmod, ausencia de módulo/nodos, retirar lease |
| 39 | limpieza terminada; revisar CLOSED o ERROR |
| 40 | comprobar que no hay módulo residente al abrir |

## Evidencia y límites

- R316/R317: 72+114 checks C/VFS/stdio y get_info LVGL reales en S3;
  lectores solapados, máximo ocho, cursores/seek/owner, PNG completo contra
  referencia y EIO inyectado. No motor/hilos/loader propietario RW4 ejecutados.
- Launcher R318: 22 casos base, siete de juego/CRC/reinicio y siete adicionales
  de fallos; 36 pasan en Lua del emulador con nativo/archivos/widgets simulados.
  Incluye STOP antes de release y ausencia de reintentos tras fallos de limpieza.
- Paquete: 30 recursos exactos y hashes; siete escenarios del protocolo
  simulado, rechazo de paquete alterado, carrier ausente, gate cerrado antes
  de privado/radio, journals anteriores preservados. Preparación offline pasa.
- Mismos motor, codec, zona de 4 MiB y bindings del candidato anterior; no
  bindings nuevos, buffers heap por lector ni frames escritos a flash.

El reinicio puede perder estado volátil; no garantiza recuperar corrupción.
La instalación escribe flash y C sigue sin aislamiento demostrado. Decoder,
callbacks, hilos, memoria, carga/descarga repetida pueden bloquear, causar panic
o corrupción. No hay recuperación integral de firmware validada. Los límites
de tiempo son cooperativos, no detienen un cuelgue. Ante fallo, conservar
artefactos y volver a la esfera habitual si responde; ninguna acción forzada.

## Ejecución tras aprobar

Preparación: `node tools/pc-doom-readers-r318.mjs prepare` (sin radio).
Instalación: `node tools/pc-doom-readers-r318.mjs install`, bloqueada ahora por
`PHYSICAL_DEPLOYMENT_REVIEWED=false` y `PHYSICAL_READERS_R318_REVIEWED=false`.
El worker C# mantiene `LargePhysicalReviewed=false`. Solo para el envío aprobado
se habilitarán esos controles y recompilará el worker; un `finally` los devolverá
a false y recompilará/probará cerrado. No abrir otros gates, repetir el envío,
reusar journals ni publicar contenido privado. Solo commit local; sin CI remota.
