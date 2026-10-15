# MemInfo R283: ensayo completado

**Lectura de ambas páginas y retorno normal confirmados. Gates cerrados.**
[Valores y análisis R284](doom-memory-budget-r284.md). El usuario
respondió «Sí, autorizo y puedo observar el reloj». Un único envío completado,
catálogo independiente confirma ID inactiva y entradas/selección previas
conservadas. Conexión y worker cerrados; gates restaurados en finally y
verificados. Autorización de envío consumida: **no reinstalar ni reenviar**.
La revisión se consumió; la secuencia de abajo es el registro del ensayo,
no autorización para repetirlo.

## Dispositivo y compatibilidad

Unidad M2315W1/FW2.2.86, Mi Fitness3.59.1i, Android16/HyperOS3.0.302.0 según el
usuario/consultas previas. Región y versión exacta Vela desconocidas. Consultar
modelo/FW/catálogo en la sesión autenticada, antes de escribir; rechazar cambio
de identidad, ID ya presente, catálogo ambiguo o batería indicada por usuario
menor del50%. No cambiar vínculos ni borrar otras esferas automáticamente.

Lua, bitmaps y lectura `/proc/modules` ya funcionaron en esta unidad.
`/proc/meminfo` y esta UI no están confirmados físicamente. VM S3 no es réplica
M2315W1. [Pruebas, fuentes y limitaciones](memory-preflight-r283.md).

## Acción concreta

Un solo `node tools/pc-static-watchface.mjs install r283`, después de habilitar
y reconstruir los gates revisados. Paquete fijo:

- `artifacts/memory-preflight-r283/MemInfo-id-only.face`
- ID365219962,21216bytes, SHA256
  `c497120e409fa0d7412583d1f381033d6eab9476bc21d5205e8ac42aa5d3985b`.
- Journal nuevo `tools/local/pc-rfcomm/memory-preflight-r283.json`, sin
  reutilizar otros intentos. Stock INSTALL4/4, upload22/0, MASS5;11partes por
  defecto. Registro final inactivo, selección y esferas previas preservadas.

No activación desde PC, reemplazo, DELETE, firmware, módulos ni fallback.
Ante rechazo o resultado incierto: parar y conservar journal; no reenviar ni
reanudar automáticamente. Cerrar conexión/worker; volver a cerrar y verificar
gates tras el intento. Una consulta independiente de catálogo puede confirmar
registro inactivo y selección previa, pero no salud completa de UI.

## Operación del usuario

1. Seleccionar **MemInfo**, preview de tres barras naranjas. Debe mostrar
   MEMINFO, punto gris, READ RAM y MODE. Si falta UI, volver a la habitual.
2. Pulsar READ RAM una vez. Solo `io.open('/proc/meminfo','rb')`, lectura
   máxima4097 para detectar exceso, EOF y cierre; no archivos propios escritos.
3. Si verde, anotar/fotografiar nombre del pool, TOTAL, FREE y MAXFREE/LARGEST.
   MODE recorre todos los pools de la misma captura. `1 2` significa página1
   de2. OCTETS significa bytes. Verde no autoriza cargar Doom.
4. Si rojo, comunicar el código visible; no repetir ni cambiar el script.
5. Volver a la esfera habitual; confirmar menús, desplazamiento y pulsación
   larga. No necesita reinstalación para una lectura futura, pero esta revisión
   cubre una única sesión manual. Retirada no incluida: se decidiría después,
   borrando exclusivamente ID365219962 con la habitual ya activa.

## Riesgo, backup y recuperación

| Acción | Flash persistente | Particiones / bootloader | Reversible por reboot | Recuperación |
|---|---|---|---|---|
| Instalar/catálogo/selección | Sí, filesystem stock | Sin escritura dirigida; sin bootloader | No garantiza retirar archivos/catálogo | Volver a habitual; retirada propia posterior |
| Lua y PNG | Sin escritura solicitada por Lua | Sin acceso dirigido | Puede retirar estado RAM; no garantiza salir de un fallo persistente | Ajustes → Esferas si responde |
| Lectura procfs | No escritura solicitada | Sin acceso dirigido | No garantizado ante bug stock | Detener ensayo; no improvisar cambios |
| MODE | Solo vista del snapshot en RAM | No | Sí para esa vista | Volver a habitual |

No firmware modificado. Peor fallo razonable: bloqueo de UI, OOM/panic/reinicio
o corrupción por bug stock; soft brick posible. No hay operación dirigida a
boot que deba causar hard brick, pero no existe garantía integral. Lua/procfs
no constituyen un sandbox demostrado. No timeout duro de lectura.

Backup limitado: fuentes, paquete/hash, catálogo y journal privados del PC.
No imagen integral de firmware/particiones ni recovery integral validado.
Recuperación parcial comprobada: cambiar de esfera desde Ajustes si los menús
responden. Reboot no restaura datos persistentes. Si se bloquea, parar y revisar
antes de reinicio o cualquier intervención; nunca flash, exploit, otro firmware,
bootloader, SWD/JTAG ni apertura física automática.
