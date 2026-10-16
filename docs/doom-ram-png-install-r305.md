# R305: DoomRAM instalada inactiva; dos ciclos manuales pendientes

Usuario autorizó el [plan R304](doom-ram-png-physical-plan-r304.md) con
«utorizado»: una instalación y dos ciclos observados, el segundo condicionado
al éxito/CLOSED del primero. Una ejecución de `pc-doom-ram-png.mjs install`
completó RegisteredInactive, ID365219957,634.212bytes, SHA256
`98d0c6c54a16e4c1575e170d6add896df742d26cbff445a6d4a38bfa31338326`.
311partes,319frames,640.443bytesTX. Modelo/firmware esperados, ACKMD5 correcto,
offset0, cierre/worker confirmados, exit0. No activación ni ejecución de C
desde PC. No reenvío, reanudación o eliminación de esferas.

Finally restauró deployment/RAMPNG/resume/control-retry y C#Large/Static
cerrados; reconstrucción y pruebas de gates/paquete pasaron. Helper cerrado
SHA256 `6759a08edfccaf8fecc5d16dbd73f6c3128d668cbc9c28f0b788664c6f6ab19b`.

Consulta independiente:13entradas frente a12actuales previas, DoomRAM
inactiva/eliminable, todas las anteriores con IDs/flags/selección intactos,
carrier365219963 presente,1activa/0IDsdesconocidos, conexión/worker cerrados.
Se usó el catálogo actual, no la estimación11 tras los borrados manuales.
contentVerified=false: catálogo y entrega no autentican la extracción física.

Ensayo manual ya autorizado; no solicitar aprobación otra vez. Seleccionar
DoomRAM (cinco barras naranjas), START1 con READY/UI correcta, CHECKING
despierto. Al PLAYING comprobar imagen completa en movimiento, UP/LEFT/RIGHT/
FIRE, pausa/resume y EXIT antes de~30s. Si primero funciona y CLOSED, sin
salir de esa esfera START2: verificar arranque breve sin CRC largo, probar
brevemente, EXIT; selector/habitual/menús/corona. Si primer fallo/ERROR/vacío/
suspensión/basura, no ciclo2/repetir/reabrir; volver si responde y describir.
No tercer ciclo. Resultado y FPS todavía desconocidos.

Evidencia ignorada: artifacts/doom-ram-png-physical-r305/install-result.json
(Tee puede escribirUTF16LE), catalog-after.json. Journal privado
tools/local/pc-rfcomm/doom-deployment/ram-png-r304.jsonl EXISTE; no borrar ni
recrear. Journal anterior transfer.jsonl intacto. Solo commitlocal, sin push.
