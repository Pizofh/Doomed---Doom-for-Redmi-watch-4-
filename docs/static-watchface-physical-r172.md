# R172 — primer intento de instalación estática autorizado

2026-10-12. Usuario confirma: «Sí, autorizo esa prueba y puedo manejar el reloj»
ante la descripción de RW4Probe, primera escritura persistente, sin activación
automática y con límite de recuperación integral. Autorización del ensayo
concreto del [plan R169](static-watchface-physical-plan-r169.md), no de Lua/C/Doom,
firmware, exploits, paquetes/IDs genéricos o sustitución de esferas existentes.

Antes del intento: suites del prototipo12 y wire/IPC/journal20 pasan; worker258
assertions y gates cerrados pasan. Luego se habilitaron temporalmente ambas
entradas exclusivas y se reconstruyó, sin ejecutar selftests de gate mientras
están abiertas. `prepare` confirmó hash del paquete exacto, ID/tamaño, build y
fuentes. Copia de exe/metadata/entradas habilitadas conservada bajo artifacts
ignorados `static-r172-reviewed/`, sin claves ni datos del reloj.

Paquete: ID365799910,25224bytes,SHA256
`7df88688c61e63b1aaab208ddf2b3976bf912fbaa08c01bf6f0d0e986ad9e93a`.
Ejecutable aprobado para el intento: SHA256
`a6e8ad880b721a130a3138a235e82efdb579a2cc97117d95bab487603e7cdc1e`.
Comando previsto: `node tools/pc-static-watchface.mjs install`, una vez.
El registro propio no existía al preparar; nunca se sobrescribirá uno existente.

El flujo volvió a consultar modelo/FW/lista antes de INSTALL y registró intención
antes de solicitar la escritura. No SET automático. Resultado del único intento:

| Campo | Resultado |
|---|---|
| Estado | StoppedNeedsReview |
| Fase / razón | Rejected / StaticTransferRefused |
| Frames / TX del cliente | 6 frames,225bytes |
| Partes de archivo | 0; fileDataSendRequested=false |
| Cierre / worker | Confirmados; exit0,sin error nativo/supervisor |
| Registro privado | Uncertain,previousPhase=Intent,partsWritten=0 |

La fase Rejected se asigna al recibir installStatus distinto de0 en respuesta
a INSTALL4/4. **No se solicitó upload22/0 ni se enviaron partes MASS5.** El
código numérico específico no se conservó en este primer informe; no inventar
que fuera2, espacio insuficiente, límite de20 o bloqueo de paquetes personalizados.
Se añadió captura sanitizada del código y parámetros de upload para futuros
ensayos, con prueba sintética de rechazo. No se repitió la solicitud para
obtener el número perdido. No se inspeccionaron paquetes/logs crudos.

El usuario confirmó esfera habitual y menús normales. Ambas entradas fueron
cerradas de nuevo y se reconstruyó; test de gates confirma cierre. El ejecutable
actual ya no es el del intento; su hash/metadata actuales están en build.json.

Se realizó una única consulta GET4/0 posterior, por el cliente de lecturas:
21 esferas/1activa,ID propio ausente, todos los IDs originales y sus flags
conservados, misma esfera anterior activa. Auth/cierre/worker normales;1814ms.
Comparación privada contra el journal antes de INSTALL; salida sanitizada en
`artifacts/static-r172-reviewed/post-attempt-summary.json`. No transferencia,
selección o borrado durante esa comprobación. No se exigió migración a Mi Fitness.

Eso confirma catálogo conservado y UI normal observada, no ausencia absoluta
de staging u otras escrituras internas. El registro incierto NO se borró ni
reclasificó para permitir otro intento. No hay recibo de instalación ni DELETE
propio posible; no inventar retirada de un paquete que no aparece en catálogo.

## Causa pendiente

Rechazo en la solicitud previa: el firmware solo recibió ID/tamaño, no el archivo.
Por ello no atribuir este fallo al renderer, imagen, Lua, Doom o parser del
contenido enviado. Restricciones del ID/servicio y capacidad/cupo siguen siendo
hipótesis sin código/diagnóstico que las distinga.

Xiaomi [documenta rechazo de nuevas esferas por exceso de esferas/memoria](https://www.mi.com/global/support/faq/details/KA-228715/),
pero no confirma en esa FAQ un máximo de20 ni que sea la causa de ESTE intento.
La búsqueda primaria no identificó un límite numérico específico para2.2.86.
El handler original de Gadgetbridge solo interpreta0 como continuar y el proto
anota2 como already installed; esa semántica no identifica nuestro número perdido.

Próximo checkpoint: aclarar el rechazo de InstallStart antes de un nuevo envío.
No borrar esferas ajenas, cambiar IDs o repetir escritura a ciegas. La aprobación
del paquete concreto persiste, pero no habilita esas otras mutaciones.
