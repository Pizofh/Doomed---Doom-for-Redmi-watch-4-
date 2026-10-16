# R319: DoomIO instalada inactiva; ensayo manual pendiente

**Actualización R320:** el primer ciclo terminó en [ERROR3016](doom-readers-result-r320.md)
tras CHECKING; retorno habitual/menús/corona confirmados. No segundo ciclo,
reapertura, nuevo envío o reinicio. JOIN/descarga no confirmados.

Usuario autorizó con «ok» el [plan R318](doom-readers-physical-plan-r318.md)
y después confirmó reinicio normal completado, menús/corona normales,
batería >=50% y disponibilidad para observar. No se repite aprobación.

Un único envío de DoomIO ID365219953 completó **RegisteredInactive**:
637108 bytes, SHA256
`5fb7ec0b289a7492a0d97b3ef798de9aeba0003f2510be8c58b6d331d909a823`.
Modelo/firmware esperados, catálogo previo de14 entradas, ID nuevo ausente,
installStatus0, ACK con MD5 correcto/offset0/chunk2048. Se enviaron312 partes,
320frames,643358bytes TX. Cierre y salida del worker confirmados; exit0.
El protocolo confirmó registro inactivo; `contentVerified=false`: no se extrajo
ni autenticó el contenido del filesystem. Sin activación desde PC ni C nuevo
ejecutado desde PC; sin reenvío, reanudación o borrado de esferas.

El `finally` restauró los archivos originales con deployment/readers/RAMPNG/
resume/control-retry cerrados y C# Large/Static cerrados. Worker recompilado,
SHA256 `d10e34e0014e7990af06098745bb3a5d99daf62f43f4098e5a5eb4405533e9bd`.
5589 assertions del helper pasan sin sockets nativos; paquete/gates R318 y sus
siete escenarios simulados pasan. No consulta física adicional redundante.

Evidencia local ignorada:
`artifacts/doom-readers-physical-r319/install-result.json`,
`gates-restored.json` y `install-once.ps1`. Journal privado
`tools/local/pc-rfcomm/doom-deployment/readers-r318.jsonl` **EXISTE**;
no borrar/recrear/reenviar. No se imprimieron MAC, claves ni paquetes crudos.

## Ensayo manual ya autorizado

Se pidió seleccionar **DoomIO**, no DoomRAM (ambas tienen cinco barras
naranjas). Con READY pulsar START1, CHECKING despierto mediante toques breves.
Si aparece Doom completo/animado: probar controles, PAUSE/RESUME y EXIT antes
de unos30s; esperar CLOSED. Solo con éxito completo, START2 sin abandonar
la instancia para probar el arranque abreviado y EXIT. Luego habitual,
selector, menús/corona. No tercer ciclo. Ante ERROR/basura/suspensión/UI ausente,
no segundo ciclo ni reapertura; volver desde Ajustes si responde e informar
estado y cuatro dígitos (etapa/errno). No nuevo envío o reboot.

**Resultado visual, carga/descarga y retirada del estado antiguo aún no
confirmados físicamente.** El reinicio se confirmó por el usuario; la ausencia
de residente se comprueba en el launcher al abrir. No inferirla del envío.
