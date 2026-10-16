# R303: imagen completa de Doom confirmada por el usuario

El usuario completó el ensayo DoomPNG: «puedo observar doom en pantalla
completa», menús y cambio de esfera normales, «todo estuvo bien». Se registra
como frame completo correcto dentro del área320×200 configurada; no prueba
que cubra los390×450 físicos ni un framerate jugable. CLOSED no se indicó
por separado. No se pidió repetir ni se enviaron nuevos comandos al reloj.

La imagen solo se presenta después del FNV/EOF/cierres de frame-png.lua;
por tanto, el éxito de esas comprobaciones se infiere del flujo del código,
sin captura independiente del estado. Es evidencia fuerte de que el motor
produce un frame válido y la corrupción está asociada a la presentación
por el nodo `.bin`. No identifica todavía el contrato exacto que falla.
PNG es una captura estática: no usar escrituras continuas a flash para jugar.
Siguiente meta técnica: animación correcta mediante RAM/decoder, reutilizando
este resultado como referencia. No hay nuevo ensayo físico autorizado.

## Liberar espacio/cupo

El usuario sospecha falta de memoria. El último catálogo confirmó15esferas;
no se midió espacio libre ni se demostró agotamiento de RAM. Puede estar
alcanzándose el cupo de esferas. Revisadas las dependencias locales:

- Puede eliminar manualmente desde su esfera habitual **DoomStill**365219959,
  **DoomRun**365219961, **DoomPlay**365219960 y **MemInfo**365219962.
  Son pruebas anteriores sin archivos requeridos por DoomPNG. Esta lista
  no autoriza al agente a ejecutar borrados por PC.
- Conservar **DoomLauncher**365219963: contiene el ELF y WAD compartidos.
  Borrarla rompería los launchers y exigiría reenviar4,8MB.
- Conservar **DoomPNG**365219958 como referencia visual exitosa.

No volver a abrir/iniciar las pruebas para eliminarlas. No se borró nada
desde PC ni se asume que el usuario haya completado esos borrados. No limpiar
journals o artefactos del PC por cambios manuales del catálogo.
