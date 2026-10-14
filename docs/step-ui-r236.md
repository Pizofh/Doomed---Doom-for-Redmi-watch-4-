# R236 — StepC preparada en PC

2026-10-14. Una demo agrupa controles mantenidos, comunicación Lua/C,
progreso visible y salida. **Paquete preparado, no instalado; candidato C
RW4 aún no ejecutado.** [Plan físico pendiente](step-physical-plan-r237.md).

## Comportamiento

La UI conserva geometría, flags de objetos propios y eventos del HoldPad
confirmado físicamente. Título `C STEP`, preview de cinco barras verdes,
UP/LEFT/RIGHT/FIRE y EXIT. No desactiva el selector global ni modifica ancestros.
Un contacto solo se muestra verde tras ACK de C; soltar/cancelar/salir del
control envía controles neutrales. Cada Timer de 200 ms pide un STEP corto y
mueve la barra según el contador devuelto. No hay Doom, renderer alternativo,
thread, bucle nativo permanente o driver de hardware en esta demo.

START es manual y único. El código contiene una copia hexadecimal del ELF
propio fijo, genera `step.elf` solo si falta y comprueba todos sus bytes. Nunca
sobrescribe un archivo existente distinto. Así no duplica ELF como recurso
separado en el paquete y conserva el límite de transmisión. El ELF generado y
la marca de intento permanecen en almacenamiento; esta demo no permite rearmar.
Las transacciones al nodo usan `r+b`: si desaparece, no crean ni truncan un
archivo regular con su nombre. No escriben flash por cada contacto/STEP.

EXIT deshabilita futuros STEP, pausa el Timer y solicita STOP. Solo muestra
verde si la retirada del módulo/nodo está confirmada y la UI vuelve al launcher.
Si hubo un fallo de controles/ACK/UI, muestra rojo aunque la retirada posterior
funcione. Cada ruta intenta restaurar navegación propia; no finge recuperación
de un shell bloqueado. pageOnPause sigue la misma parada y llama al hook previo.
Tras GC inesperado solo se bloquean callbacks: no se ejecuta shell desde GC.
Puede quedar C residente, sin más STEP, hasta revisión; no es retirada confirmada.

## Verificación realizada

- 37 escenarios del carrier, con el adaptador derivado, pasaron de nuevo.
- 31 casos de UI pasaron: cuatro holds/ACK/release, barra, EXIT manual,
  presupuesto de 300 STEP, pageOnPause/hook previo, cancelación y pérdida de
  contacto, intento persistente bloqueado, fallos de input/ACK/Timer/imagen/barra,
  cierre incierto, STOP sin ACK, busy sin nodo, GC sin I/O, creación del ELF
  ausente y conservación de ELF preexistente distinto.
- Fábricas y `main.lua` de producción corrieron como Lua en S3 con **LVGL/input/
  Timer/shell/nodo simulados**, archivos tmpfs propios reales. No se ejecutó el
  ELF RW4 ni se repitió la pulsación larga stock. Las pruebas S3 reales anteriores
  de C/UI y el HoldPad físico son evidencia separada, no prueba de este binario.
- Inventario real de módulos sin cambios y tmpfs propio retirado.
- EasyFace Compiler revisado compiló offline, sin ADB disponible en su directorio;
  nueve recursos se verificaron byte por byte en el paquete.
- Transferencia sintética: 12 casos; sesión IPC/journal: 34 para r236 y 34 de
  regresión para r220. Gates CLI/native cerrados, cero sockets físicos.

La sesión inicialmente falló al probar fragmentos de 512 bytes: framing/cifrado
superaban 32768 bytes. Se corrigió el preflight para reservar todo el MASS cifrado
y seis consultas de verificación antes del primer fragmento. Para StepC, 512
ahora se rechaza sin enviar archivo; 2048/4080 completan el ensayo sintético.
No se amplió presupuesto, se cambió otro ID o se intentó hardware.

La primera revisión tenía ELF preinstalado y luego `wb` para el nodo. Se añadió
materialización para evitar una segunda copia y se cambió a `r+b` para impedir
creación accidental. Evidencia anterior se conserva en `step-ui-r236`,
`step-ui-r236-reviewed` y `step-r236`; **solo `*-final` corresponde al perfil r236**.
El cambio del mock R235 acepta ambos modos; sus fábricas originales siguen intactas.

## Objetos fijos y reproducción

StepC **365219977**, **31808 bytes**, 16 partes por defecto. Paquete
`artifacts/step-r236-final/StepC-id-only.face` SHA256
`5c117cce07ccb5388f0bf0c2345f829827e810daae0db2c32886d9d75a14ed40`.
Lua21842 bytes SHA256
`63b1dee6d625f0908e6b8952c4deb115bfd0973125195154a1702f6308c92053`.
ELF2620 bytes sin cambios R234 SHA256
`713fe535880f2cbae928efe5199d15b0c39a01bc455aab819f8a534cbab4d424`.
Gates Node=false/r167 y C#=false; helper cerrado recompilado SHA256
`292fa4a4b9b79c48c93f14ac11ea429ba2f129083bae37e33bb6971859487c6f`.

```powershell
node tools/test-step-ui-r236.mjs
node tools/package-step-r236.mjs
node tools/pc-rfcomm.mjs build
node tools/pc-static-watchface.mjs prepare r236
node tools/test-static-watchface-transfer.mjs r236
node tools/test-static-watchface-session.mjs r236
node tools/test-static-watchface-gates.mjs
```

Scripts de prueba/empaquetado rechazan informes existentes: no repetir los ya
pasados sin cambio o preocupación nueva. Informe final de Lua en
`artifacts/emulator/step-ui-r236-final/summary.json`; paquete/review bajo
`artifacts/step-r236-final`. Firmware, ELF, paquete y WAD no se commitean.

Siguiente checkpoint único: revisión y, solo con autorización y observación,
un ensayo físico de StepC. ABI de callbacks/BSS/registro/retirada, contexto de
privilegios y rendimiento reales siguen pendientes. No hay watchdog duro,
sandbox ni recovery integral validado.
