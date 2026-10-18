# R376: catálogo contrastado, mismo Ultimate

**Autorizado y consumido; rechazado por almacenamiento sin enviar el archivo.** R375 fue autorizado y consumido:
CatalogPreflight,14→10entradas, selección igual, revisión de removidos=false,
5frames/185B TX,0partes, sin INSTALL ni upload. Cierre/socket y worker
confirmados/exit0. Gates cerrados y worker reconstruido al terminar.

Una consulta posterior de solo lectura completó authHMAC/cifrado/catálogo
y cierre. DoomLauncher963 presente; sin adiciones ni flags supervivientes
distintos. La única remoción que incumple el guard anterior es365110003,
antes canDelete=false. No se infiere borrado de archivos protegidos ni que
el flag mida la ocupación. Inventario privado ignorado:
`tools/local/pc-rfcomm/ultimate-catalog-r375.json`.

## Cambio concreto

Mismo paquete R374,13090600B, ID365220001, SHA256
`dfd89cd54542142a3cddb5dd444f6553fbd648b6e9d7dd1140f9b67b464ad8ca`.
Sin cambio de C/Lua/WAD. Excepción solo para la ausencia365110003;
no permite perder otra entrada antes noeliminable. Mantiene: catálogo más
pequeño, sin adiciones/cambios de flags, carrier presente, IDnuevo ausente,
una activa conocida y conservación de selección ACTUAL.

Gate `PHYSICAL_ULTIMATE_CATALOG_R376_REVIEWED=false`.
CLI `prepare-after-catalog` offline y `install-after-catalog` físico.
Antes de conectar, exige journal HMAC/samekey-target-package con5filas exactas:
intento1 Created→InstallIntent→Uncertain; intento2 Created→Uncertain con
attemptKind retry-after-space-r375 y before=null. Todos upload=null.
Recupera baseline original, agrega intento3 retry-catalog-r376 preservando
el prefijo. Rechaza otro historial, negociación/upload/MASS, resume, combinación
de retries o cuarto intento. Gates R374/R375 y retries genéricos siguen cerrados.

## Validación

26casos nuevos reproducen los dos rechazos, verifican excepción acotada,
historial/identidad/pins y bloqueo de cuarto intento. Incluyen envío completo
6405partes por IPC C# y receptor simulado, registro inactivo y cierre.
Regresión R37543casos, retry antiguo18 y catálogo antiguo17 pasan.
Evaluación offline del inventario físico ya leído también pasa el guard
corregido. Sin más Bluetooth durante estas verificaciones.

## Alcance solicitado

UN nuevo envío inactivo y DOS arranques manuales≤90s, solo si instala.
Batería≥50%, observación12–18min. Mismos límites retail y procedimiento R374:
título/episodiosI yIV, primer efecto/controles, guardar/cargar y cierres.
Conservar esferas/partidas restantes; no borrar, activar desde PC, reanudar
ni reenviar automáticamente.

Tras aprobación: abrir SOLO general+R376 JS y C#Retail, rebuild y verificar
targetvacío antes de privados/journal; ejecutar install-after-catalog una vez;
cerrar gates y rebuild antes de abrir la esfera. Ante rechazo/corte, parar.
Espacio/RAM pueden seguir siendo insuficientes; riesgos de bloqueo,
corrupción/reinicio y recovery integral no validado se mantienen.

## Resultado físico R376

Un install-after-catalog autorizado: modelo/FW correctos, catálogo10,
reviewedCatalogR376=true, selección igual/IDnuevo ausente. INSTALLstatus3;
6frames/226B TX,0partes, RegisteredVerified=false. Cierre y worker confirmados,
exit0. Gates general/R376/Retail cerrados y worker reconstruido. Journal
intento3 conservado Uncertain, sin autorización de otro intento.

Investigación offline R377 identificó una cuota conjunta de15MiB para esferas
market. El paquete13.09MB más el carrier4.827MB ya la superan, sin contar otras
esferas. Usuario prefirió evaluar compresión antes de más eliminaciones.
Se prepara el lector comprimido R378; no reutilizar esta aprobación.
