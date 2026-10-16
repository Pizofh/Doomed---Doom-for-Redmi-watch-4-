# R308: DoomTrace instalada; ensayo manual autorizado pendiente

**Actualización R309:** [abrió con ERROR30 antes de START](doom-trace-result-r309.md).
El ensayo ya produjo resultado: no repetir ni reabrir. Los pendientes de abajo
describen el estado inmediatamente posterior a la instalación.

El usuario autorizó el [plan R307](doom-trace-physical-plan-r307.md) con «si»:
una instalación y un ensayo observado con batería ≥50%. Se ejecutó un único
envío de DoomTrace ID365219956, 31.864 bytes, SHA256
`5cb06a7c3135412f54203afe7a8e4233c1b4395f58ff5cf6f1206eec702609d6`.
Resultado RegisteredInactive, 16 partes, 25 frames enviados, 32.511 bytes TX;
sin activación desde PC, reintento, borrado ni reenvío de ELF/WAD.
transferAcceptanceVerified=false: no afirmar autenticación de extracción.
Conexión y worker cerrados, exit0.

Finally restauró Static/r167 y C#Static cerrados; los demás gates permanecen
cerrados. Reconstrucción y test de paquete/gate cerrado pasaron. Helper final
SHA256 `4e683f1ce86b420ba66547e27c9c1f1a9291cd4fd9445ccab47cbaf2cc350ac8`.

Una consulta independiente confirma 14 entradas frente a 13 previas, todas
las anteriores con flags/selección intactos, DoomTrace inactiva/eliminable,
carrier WAD365219963 y ELF365219957 presentes, una activa y cero IDs desconocidos.
contentVerified=false. No se ejecutó DoomTrace ni recuperación de C desde PC.

El ensayo manual sigue autorizado: elegir DoomTrace (cuatro barras blancas).
Si RECOVERING, esperar; si ERROR inicial, anotar código, FREE/MAX y CLOSED
adicional sin START. Solo con READY/CLOSED y START habilitado, START una vez,
mantener despierta durante CHECKING con toques breves en zona vacía. Ante ERROR,
anotar código/FREE/MAX y si aparece CLOSED abajo tras unos segundos, sin repetir.
Si aparece juego completo/animado, observar unos 5 s y EXIT antes de 30 s.
Volver a esfera habitual y comprobar menús/corona en el mismo reporte.
No reabrir DoomRAM, borrar sus recursos, reiniciar ni forzar rmmod.

Evidencia local ignorada: artifacts/doom-trace-physical-r308/install-result.json
(Tee puede escribir UTF16LE), catalog-after.json. Journal privado existente
tools/local/pc-rfcomm/doom-trace-r307.json: conservar, no recrear ni reenviar.
Solo commit local; sin push ni CI remoto. Resultado físico manual pendiente;
la instalación no confirma corrección del render ni descarga del C anterior.
