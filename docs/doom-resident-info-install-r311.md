# R311: CInfo instalada inactiva; una lectura manual autorizada pendiente

El usuario respondió «ok» al [plan R310](doom-resident-info-physical-plan-r310.md):
una instalación y una lectura observada, batería≥50%. Un envío install r310
registró CInfo365219955 inactiva,20.120bytes,SHA256
`7c42c37d9775cc5860615e7c1fcb303a70642d39a47f565a2e87fc6e61c40430`.
10partes,19framesTX,20.653bytesTX. Sin reintentos, activación, borrados o
ejecución de Lua/C desde PC. Cierre/worker confirmados, exit0.
transferAcceptanceVerified=false: no afirmar autenticación del contenido extraído.

Finally restauró NodeStaticfalse/r167 y C#Staticfalse; los demás gates siguieron
cerrados. Rebuild y test de paquete/gate cerrado pasan. Helper finalSHA256
`51d9053901047c9a1fe0c137ffed6588784c169875bb7e71e9c98662a866834d`.

Catálogo independiente:15entradas vs14previas, IDs/flags/selección anteriores
conservados, CInfo inactiva/eliminable, WAD963/ELF957 presentes,1activa0unknown,
cierre/worker confirmados. contentVerified=false. No consultas al residente
ni recuperación de C realizadas desde PC.

Prueba manual YA autorizada: seleccionar CInfo (TRES barras AMARILLAS).
Con C INFO, READ C/MODE, seis filas y punto gris, pulsar READ C UNA vez.
Anotar código/color y las tres páginas, MODE una vez entre páginas:
01 REG OWN/LEASE/CAPTURE/C OPEN/C READ/C CLOSE;
02 SEQUENCE/STARTED/READY/FINISHED/JOINED/ERROR;
03 REASON/CODE/PEAK/ALLOC/FREED/CLEANUP.
MODE no repite lectura. Ante pantalla vacía/UI ausente, no pulsar ni reabrir.
Si hay error conservar datos parciales/código, sin repetir READ.
Volver habitual y confirmar menús/corona en el mismo reporte. No reabrir pruebas
anteriores ni reiniciar/borrar recursos. No nueva aprobación necesaria para
esta lectura. Resultado pendiente, sin afirmación de descarga de C.

Evidencia ignorada: artifacts/doom-resident-info-physical-r311/install-result.json
(posibleUTF16LE),catalog-after.json. Journal privado
tools/local/pc-rfcomm/doom-resident-info-r310.json EXISTE: no borrar/recrear/reenviar.
Solo commitlocal; sin push/CI remoto.
