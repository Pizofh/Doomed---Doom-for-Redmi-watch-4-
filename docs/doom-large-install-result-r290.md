# R290: paquete Doom instalado e inactivo en M2315W1

El único envío autorizado según R289 terminó en `RegisteredInactive`.
El reloj sigue con su esfera habitual; el usuario confirmó menús y
desplazamiento normales. **Doom todavía no se ha ejecutado físicamente.**

## Evidencia física

| Dato | Resultado |
|---|---|
| Modelo / firmware | M2315W1 / 2.2.86, ambos verificados por sesión |
| Paquete | ID365219963, 4827044 bytes |
| SHA256 local | `d0fc0d8257e9a384b42129f312de99570b49dade455511d0fc5fddd80fecf048` |
| Antes del envío | 11 esferas; exactamente dos bajas eliminables frente al registro inicial |
| INSTALL | status0 |
| ACK de upload | MD5 presente/coincidente, status0, offset0; chunk ausente, default2048 |
| MASS escrito desde PC | 2362 partes |
| Sesión completa | 2370 frames, 4872246 bytes transmitidos incluyendo control/overhead |
| Catálogo final | Paquete registrado inactivo/eliminable; selección conservada |
| Cierre | Conexión cerrada, worker terminado con exit0 |

Consulta independiente posterior:12entradas, once anteriores con sus flags
intactos, nuevo ID inactivo/eliminable, una activa y cero IDs desconocidos.
También cerró conexión y worker. No envió archivos ni activó/borró esferas.

El journal original conserva los tres intentos anteriores y attempt4 completo.
No se borró, renombró ni sustituyó. No hubo reanudación ni reintento automático.
Los gates Node/C# fueron restaurados en finally, se reconstruyó el helper
y pasó la comprobación de entradas físicas cerradas.

## Qué demuestra y qué falta

Se demostró la transferencia grande mediante mecanismo stock y registro
persistente del paquete en el catálogo. Contiene el ELF ARMv8-M, doom1.wad
shareware y launcher Lua; el perfil mantiene `allow_native=false`.
No se ejecutó insmod/rmmod, C/Doom ni se seleccionó el launcher. No se cambió
firmware, bootloader, recovery ni se dirigieron escrituras a particiones.

Catálogo y MD5 del protocolo NO verifican los hashes de cada archivo extraído
en el reloj. `contentVerified=false` permanece correcto. Tampoco prueban que
Doom quepa/corra estable en la RAM física, ni que funcione tras reboot.
No reiniciar ni seleccionar el launcher para inferir esas propiedades.

El ACK real confirma que chunk puede omitirse en esta respuesta. Esto valida
el default utilizado ahora; no reconstruye qué campos faltaban en attempt1.

## Siguiente checkpoint

Preparar el primer arranque acotado de Doom: comprobaciones de archivos/RAM,
carga manual, imagen y salida/limpieza, agrupadas en un plan revisable. Evaluar
un launcher pequeño que use estos recursos persistentes para evitar reenviar
4,8MB. No habilitar ni ejecutar nativo hasta aprobar ese plan concreto.
Se mantienen privilegios sin aislamiento demostrado y recovery integral
sin validar; instalar correctamente no elimina esos riesgos.

Evidencia local privada/ignorada:
`artifacts/doom-deployment-physical-r290/attempt-result.json` y
`catalog-after.json`; journal bajo `tools/local/pc-rfcomm/doom-deployment/`.
Sin claves, direcciones, logs crudos ni publicación remota en esta documentación.
