# R225 — plan autorizado: HoldPad

2026-10-13. **Autorizado e instalado sin activación; gates cerrados de nuevo.
Observación manual pendiente.** Usuario: «Sí, autorizo y puedo observar el reloj».
[Resultado de instalación](held-input-physical-result-r225.md).
La autorización cubre este ensayo único, no reintentos o nuevos payloads.
[Resultados PC/S3](held-input-r224.md). La revisión cubre un payload nuevo,
conforme al gate físico de la instrucción inicial del usuario.

## Precondiciones y compatibilidad

Solo unidad M2315W1/FW2.2.86 conocida; región/build Vela exacta desconocidas.
Mi Fitness3.59.1i, Android16/HyperOS3.0.302.0 habituales. Usuario junto al reloj,
batería≥50%, menús/cambio normales y vínculo PC válido; sin OTA/otro cliente.
No cambiar vínculos, consultar batería o borrar esferas automáticamente.

RW4 ya mostró imágenes Lua/LVGL, botones/Timer y retorno normal. **indev.get_point,
contactos mantenidos y retención del selector de este paquete solo pasaron S3.**
Esa es la prueba nueva; emulador no demuestra compatibilidad M2315W1.

## Objetos y comandos

HoldPad **365219979**, preview **cinco barras naranjas**, **15552 bytes**.
`artifacts/held-r224/HoldPad-id-only.face`, SHA256
`296868366da0f29a010777d031559ddf08a1c52d73f45021b9f3f034fbabff16`.
Lua SHA256 `1ee9ff3db8c572c1737ff27f764144c5869e810eb1280ef84f1393c234a90f59`.
main.lua y ocho PNG propios; sin C/ELF/shell/os/io/tareas nativas/escrituras Lua,
modificación de ajustes globales o ancestros LVGL.

1. Tras aprobación, habilitar temporalmente solo r224 y gate C#, rebuild/hash/
   prepare offline. Helper cerrado actual SHA256
   `675fac96664454694f9309be2515132071e37a3c17e818eaf1087adc09ad5249`;
   registrar hash del helper autorizado antes de usarlo.
2. **Un** `node tools/pc-static-watchface.mjs install r224`: auth/info/catálogo,
   INSTALL4/4, upload22/0/MASS5, 8 partes. Exige modelo/FW, propia ID ausente,
   una activa y journal nuevo `tools/local/pc-rfcomm/held-input-r225.json` sin lock.
   Guarda catálogo previo. **Escribe paquete/catálogo persistentes vía stock;
   no activa ni reemplaza esferas.** Rechazo/timeout/incierto: parar sin retry,
   otro ID, borrado o limpieza automática.
3. Finalmente cerrar gates/rebuild/test. Si registro y cierre confirmados,
   un `node tools/pc-rfcomm.mjs watchfaces` GET verifica nueva inactiva y selección/
   entradas anteriores conservadas; cerrar socket/worker.
4. Usuario selecciona HoldPad una vez: HOLD TEST, UP/LEFT/RIGHT/FIRE/EXIT,
   cinco grises y START. EXIT rojo inicial/etiquetas ausentes/pantalla fallida:
   no START; volver desde Ajustes si responde y describir estado.
5. START una vez. Mantener UP unos 4 s y soltar; repetir LEFT/RIGHT/FIRE.
   Acción verde durante hold y gris al soltar; **selector no debe abrirse**.
   No probar corona, multitouch, gestos stock o contactos adicionales en juego.
6. EXIT una vez: launcher muestra cinco verdes si se alcanzaron las cuatro
   duraciones y restauración cooperativa. Grises: informar cuáles, sin repetir.
   Parada tras unos60s por Timer es posible; no demuestra EXIT manual.
7. Desde launcher, hold neutro entre filas y START, aproximadamente x195/y275,
   para abrir selector stock. Seleccionar habitual; si no abre, Ajustes→Esferas.
   Confirmar menús/scroll/pulsación larga en habitual. No reabrir HoldPad o C.

Si selector abre DURANTE juego: criterio fallido, volver a habitual y parar.
Bloqueo/fallo: no reiterar toques/comandos/cargas; informar estado. No reset,
reboot, eliminación o desvinculación automática. Retirada solo de HoldPad
inactiva mediante stock queda para una decisión posterior.

## Riesgos y reversión

| Componente | Reboot revierte | Flash/FS | Particiones / bootloader | Firmware modificado | Reversión / riesgo |
|---|---|---|---|---|---|
| Paquete/catálogo stock | No | Sí | Ningún acceso dirigido | No | Habitual/retirada propia posterior; posible instalación incompleta |
| Selección de esfera | No garantizado | Puede guardar selección | Ningún acceso dirigido | No | Selector o Ajustes si responde |
| Lua/input/LVGL/Timer | Estado RAM sí; FS/selección no garantizados | Sin escritura Lua prevista | Ningún acceso dirigido | No | EXIT/pausa/presupuesto cooperativo; UI podría bloquearse |
| GET final | No aplica | Sin archivos solicitados | Ningún acceso dirigido | No | Cierre; no sustituye observación visual |

No se carga módulo kernel; tampoco se afirma un sandbox de APIs stock verificado.
LVGL/decoder/eventos nativos pueden fallar. pcall/Timer no frenan deadlock;
300callbacks×200ms es presupuesto cooperativo, no watchdog duro. Cancelación/
pausa pasó mocks, no pérdida de foco físico durante un contacto.

Peor fallo razonable: bloqueo UI, panic/reboot, corrupción de memoria/FS y
posible soft brick. Hard brick no esperado por estas operaciones, sin garantía
frente a defectos stock. No firmware, bootloader, recovery, particiones crudas,
direcciones nativas o config global. **Recovery integral2.2.86 no validado.**

Backup limitado: fuentes/paquete/hash y catálogo previo, no dump de firmware.
Recuperación parcial conocida: Ajustes→Esferas funcionó con LuaProbe y selector
se recuperó en ensayos anteriores. Si UI se bloquea, detener pruebas y revisar
antes de nuevas acciones. Reinicio no borra paquete ni restaura flash. Ningún
flasheo/firmware ajeno/retirada de módulo a ciegas como recuperación automática.

Permiso otorgado: un envío sin autoactivación y un ciclo manual de cuatro
holds, EXIT y retorno stock, con presencia. No Doom/C/reintentos/nuevas APIs
nativas ni cambiar ajustes globales para esconder la pulsación larga.
