# Matriz de evidencia

**R186, 2026-10-12:** [registro de LuaImage físico; pantalla pendiente](lua-image-physical-result-r186.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Paquete r184 registrado sin autoactivar | M2315W1/2.2.86 | Un install y GET independiente:15esferas,propia inactiva/eliminable | CONFIRMADO EN RW4 | Alta para catálogo | Sí, ensayo autorizado | No ACK final explícito ni render demostrado |
| Las14 entradas/flags/activa anteriores se conservan | Misma unidad | Before journal frente a GET independiente | CONFIRMADO EN RW4 | Alta para snapshot | Sí | No selección manual por agente |
| Gates cerrados tras ensayo y socket/workers terminados | PC/transporteRW4 | Ambosreportesclose/exit0; prueba gates/build cerrado | CONFIRMADO EN PC/TRANSPORTE | Alta | Sí | No demuestra UI o cierreVM física |
| LuaImage muestra los cuatro colores y permite salir | M2315W1/2.2.86 | Observación del usuario pendiente | SIN EVIDENCIA | Desconocida | No todavía | No extrapolar renderS3 al reloj |

**Historial R184/R185, 2026-10-12:** [imagen Lua en S3](lua-image-r184.md) y [plan bloqueado](lua-image-physical-plan-r185.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Muestra RW4 usa Image/SCRIPT_PATH/get_img_size para recurso empaquetado | Source comunitario5af6e14 | TouchEvents/image.lua, blob verificado | CONFIRMADO EN CÓDIGO DE MUESTRA | Alta documental | Lectura PC | No confirma versión2.2.86 |
| Paquete propio contiene Lua y PNG exactos | BuildPC R184 | Compiler/readback SHA/source/PNG y byte5=0 | CONFIRMADO EN PC | Alta | Sí | ImagePNG194bytes; paquete9328bytes |
| Lua Image muestra cuadrantes/cross96×64 sin Label/Font | GuestS3 | Captura y nueve píxeles/size verificados | CONFIRMADO EN EMULADOR | Alta | Sí | No frames dinámicos o bufferC |
| Panel stock conserva imagen y cambio de esfera cierraLua | GuestS3 | PNGidéntico,logcloseLua,Storageactiva,27IDs anteriores | CONFIRMADO EN EMULADOR | Alta | Sí | Longpress OFF,no validado |
| LuaImage renderiza PNG y permite salida en2.2.86 | M2315W1 | Aún no enviado; ejemplos/PC dan plausibilidad | SIN EVIDENCIA FÍSICA | Desconocida | No | Perfil fijo r184 cerrado, revisión pendiente |
| Image estático demuestra ejecución C o portDoom físico | M2315W1 | No loader/ABI/privilegios físico demostrado | SIN EVIDENCIA | Desconocida | No | Son pasos separados |

**Historial R183, 2026-10-12:** [fuentes upstream y CLI S3 contrastados](lua-font-research-r183.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Muestra AnalogTimeAnimated etiquetada RW4 usa MONTSERRAT_14 | Código comunitario RW4 | main.lua de5af6e14,Gitblob/SHA verificados | CONFIRMADO EN FUENTE DE MUESTRA | Alta documental | Estático | No instalado ni confirmado en2.2.86 |
| MONTSERRAT12/14/16 están expuestas y Fontmontserrat14 se crea | EmuladorS3/LuaCLI | ProbeR183,typeuserdata/created | CONFIRMADO EN EMULADOR | Alta | Sí | No render de esta fuente medido aquí |
| MiSans24/32 se crea desde CLI de este guest | EmuladorS3/LuaCLI | pcall devuelve cannot-create-font | REFUTADO PARA ESE CONTEXTO | Alta | Sí | MiSans24 sírenderizóR177enwatchfaceS3 |
| Resultado CLI equivale al contexto watchface | EmuladorS3 | Resultados diferentes de mismafamilia/tamaño | REFUTADO COMO SUPOSICIÓN GENERAL | Alta | Sí/historial | No causaexactadel callback inspeccionada enbinario |
| Resolver familia externa puede depender de callback contexto | LuaVGLupstream62868a0 | _luavgl_font_create consulta ctx.make_font | CONFIRMADO EN CÓDIGO UPSTREAM | Alta | Estático | No fuenteexactadel firmwareRW4/S3 |
| Color numérico es inválido para estilo en este upstream | LuaVGLupstream | luavgl_tocolor acepta enteros RGB ystrings | REFUTADO EN UPSTREAM CONSULTADO | Alta | Estático | Semántica exactaforkfísico sin demostrar |
| MONTSERRAT_14 resuelve texto ausente en RW4 | M2315W1/2.2.86 | Pista comunitaria,noprobadaenunidad | INFERENCIA RAZONABLE | Limitada | No | No enviar otra variante automáticamente |

**Historial R182, 2026-10-12:** [LuaDiag física, formas funcionan y texto ausente](lua-diagnostic-physical-result-r182.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Código Lua propio ejecuta y crea objetos LVGL | M2315W1/2.2.86 | Panelmagenta/amarillo/verde de script vistos; no existen en previewX | CONFIRMADO EN RW4 POR USUARIO | Alta | Usuario,ensayo autorizado | No prueba versiónLua o ABI/privilegios |
| Creación de label terminó sin excepción y retorno no falso | Misma unidad | Verde solo en rama pcall+assert exitosos | CONFIRMADO EN RW4 POR OBSERVACIÓN DEL USUARIO | Alta | Usuario | No identifica tipo real ni font ni render |
| Texto con fuente por defecto se ve en este ensayo | Misma unidad | Usuario aclara «No,soloelpanel ylosmarcadores» | REFUTADO PARA ESTE PAQUETE/ENSAYO | Alta | Usuario | Causa sin identificar/log físico |
| Pulsación larga/cambio de esferas y demás funciones responden | Misma unidad | Usuario lo confirma tras probar LuaDiag | CONFIRMADO EN RW4 POR USUARIO | Alta | Usuario | No evidencia de hooks/cierreVM porlog |
| Previewnuevo corrige desbordamiento en selector físico | Misma unidad | No respuesta específica de ese detalle | SIN EVIDENCIA FÍSICA | Desconocida | No confirmado | Soloemuladorcontenidoenminiatura confirmado |
| C nativo/Doom pueden lanzarse desde Lua en RW4 | Misma unidad | Solo objetos/script UI probados | SIN EVIDENCIA | Desconocida | No | No extrapolar módulo/ABI del S3 |

**Historial R180/R181, 2026-10-12:** [diagnóstico nuevo PC/S3](lua-diagnostic-r180.md) y [perfil físico bloqueado](lua-diagnostic-physical-plan-r181.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Retorno a esfera habitual y pulsación larga se recuperaron tras LuaProbe | M2315W1/2.2.86 | Usuario confirma salida por Ajustes | CONFIRMADO EN RW4 POR USUARIO | Alta | Usuario | No reboot,firmware o borrado |
| LuaProbe rebasa visualmente límites en selector | Misma unidad | Descripción del usuario | OBSERVADO POR USUARIO; CAUSA SIN IDENTIFICAR | Media | Usuario | Sin captura; no decir únicamente estético |
| LuaDiag sin fuente explícita/timer renderiza texto y fases | Emulador S3 | Captura magenta/amarillo/verde/texto,logs,fuente exacta | CONFIRMADO EN EMULADOR | Alta | Sí | No identifica causa del azul físico |
| Preview nuevo separado visualmente de runtime y contenido en miniatura | Emulador S3 | PreviewX yruntimecolores distintos vistos | CONFIRMADO EN EMULADOR | Alta | Sí | No confirma clipping del selector RW4 |
| Salida/pausa de UI de LuaDiag conserva render y cierra VM | Emulador S3 | PNGidéntico traspanel,Storage activa/closeLua | CONFIRMADO EN EMULADOR | Alta | Sí | Sin hooks ni timer; longpressno probado |
| LuaDiag funciona o restaura longpress en RW4 | M2315W1/2.2.86 | Todavía no enviado | SIN EVIDENCIA | Desconocida | No | Perfil preparado/gates cerrados para revisión |

**Historial R179, 2026-10-12:** [instalación física de LuaProbe](lua-physical-result-r179.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Paquete propio con Lua fue transferido y registrado | M2315W1/2.2.86 | RegisteredInactive,10partes,GET independiente12→13 | CONFIRMADO EN RW4 | Alta | Sí, autorizado | No se activó automáticamente; no prueba ejecución |
| Esferas/selección anteriores conservadas tras instalar LuaProbe | Misma unidad | Comparación12IDs/flags/activa contra journal nuevo | CONFIRMADO EN RW4 | Alta | Sí | No sustitución/borrado de otras |
| Prueba LuaProbe muestra texto/contador en físico | Misma unidad | Usuario observa solo fondo azul al seleccionarla | REFUTADO PARA ESTE PAQUETE/ENSAYO | Alta | Usuario | Sin logs físicos; causa no identificada |
| Pulsación larga permite cambiar esfera con LuaProbe | Misma unidad | Usuario no puede abrir selector así | REFUTADO PARA ESTE ENSAYO | Alta | Usuario | Retorno por Ajustes confirmó esfera habitual/longpress recuperados |
| Navegación y menús del reloj responden con LuaProbe | Misma unidad | Usuario confirma atrás/notificaciones/arriba/derecha/menús | CONFIRMADO EN RW4 POR USUARIO | Alta | Usuario | Retorno habitual confirmado después |
| Fuente misansw regular24 explica ausencia de labels | Misma unidad | Orden del código crea fondo antes de evaluar Font | INFERENCIA RAZONABLE | Limitada | Revisión PC | Sin excepción/log físico; no declarar causa demostrada |
| LuaProbe eliminable y retirada completada | Misma unidad | FlagcanDelete sí; DELETE no ejecutado | FLAG CONFIRMADO; RETIRADA SIN PROBAR | Alta sobre flag | GET | Retirada opcional requiere retorno/decisión |

**Historial R178, 2026-10-12:** [perfil Lua e instalador físico preparados y bloqueados](lua-physical-plan-r178.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Instalador admite únicamente Lua minimal de hash/ID/tamaño fijados | Cliente PC | Prepare r177 verifica paquete y fuente embebida exacta | CONFIRMADO OFFLINE | Alta | Sí | Gates cerrados; no Lua enviado al reloj |
| Recibos de imágenes no permiten retirar Lua ni viceversa | Cliente PC | Tests todos pares de tres perfiles antes de link | CONFIRMADO OFFLINE | Alta | Sí, sintético | Journal ligado a contentKind; legacy solo imagen |
| Perfil Lua completa envío/retirada con cifrado y framing | Peer sintético PC | 12codec/API y25wire/IPC/journal | CONFIRMADO OFFLINE | Alta | Sí | DELETE físico todavía no probado |
| Gates CLI Lua y nativo evitan conexión actual | Cliente PC | Test install/remove r177 y entrada worker cerrados | CONFIRMADO OFFLINE | Alta | Sí | No claves/target reales usados en tests |
| Lua minimal o DELETE funcionan en esta unidad | M2315W1/2.2.86 | Todavía no ejecutados | SIN EVIDENCIA | Desconocida | No | Plan listo para revisión; emulador no confirma hardware |

**Historial R177, 2026-10-12:** [Lua mínima, misma candidata, validada en guest S3](lua-minimal-r177.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| RW4 volvió a esfera habitual con funciones normales tras R176 | M2315W1/2.2.86 | Confirmación explícita del usuario | CONFIRMADO EN RW4 POR USUARIO | Alta | Usuario | No prueba duración ilimitada ni recovery de firmware |
| Paquete Lua minimal byte5=0 renderiza y ejecuta sin ajuste de versión | Emulador Xiaomi Watch S3 | Capturas texto/contador y fuente extraída exacta | CONFIRMADO EN EMULADOR | Alta | Sí | No emulación exacta M2315W1 |
| Contador se detiene a diez actualizaciones | Mismo guest | Logs tick1…10/limit y captura10/10 | CONFIRMADO EN EMULADOR | Alta | Sí | No medición de precisión1Hz |
| Panel stock pausa/resume Lua y selección Storage cierra VM | Mismo guest | Hooks entre tick9/10 y closeLua al cambiar | CONFIRMADO EN EMULADOR | Alta | Sí | Hooks no confirmados en RW4 físico |
| Script Lua nuevo funciona en M2315W1/2.2.86 | Reloj físico | Paquete no enviado | SIN EVIDENCIA | Desconocida | No | Perfil físico aún no integrado ni ensayo autorizado |

**Historial R175/R176, 2026-10-12:** [código 3 trazado](static-id-physical-result-r175.md) y [esfera propia instalada](static-space-trial-r176.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Variante r173 rechazó preinstalación con estado 3 | M2315W1/2.2.86 | R175, 0 partes, 6TX/225 bytes; cierre confirmado | CONFIRMADO EN RW4 | Alta | Sí | No archivo enviado en ese intento |
| Mi Fitness interpreta ese estado 3 como falta de espacio para esferas | APK instalado 3.59.1i | Campo5 → callback failure3 → recurso face_hint_storage_low | CONFIRMADO EN CÓDIGO DE CLIENTE | Alta | Estático PC | No RAM/freebytes/cupo exacto ni fuente firmware |
| Cambiar solo el ID resolvió el rechazo con catálogo de 21 | M2315W1/2.2.86 | R175 volvió a rechazar antes de upload | REFUTADO PARA ESE ENSAYO | Alta | Sí | No descarta otras restricciones de IDs |
| Mismo paquete se instaló después de eliminar esferas manualmente | M2315W1/2.2.86 | R176 count11→12,13partes,ID propio en GET independiente | CONFIRMADO EN RW4 | Alta | Sí, autorizado | No cambios de paquete ni borrado desde PC |
| Instalador conserva esfera activa y otras entradas | Misma unidad | GET contra baseline nuevo:11IDs/flags/activa iguales | CONFIRMADO EN RW4 | Alta | Sí | Usuario borró antes; no comparar con viejo catálogo21 |
| Imagen RW4Probe renderiza físicamente | Misma unidad | Usuario selecciona y responde «se ve bien», luego confirma retorno normal | CONFIRMADO EN RW4 POR USUARIO | Alta | Usuario | Retorno a su esfera y funciones normales confirmados |
| Lua/C/Doom funcionan en hardware físico | M2315W1/2.2.86 | Esta prueba solo contiene imagen | SIN EVIDENCIA | Desconocida | No | DOOM y C demostrados solo en emulador |

Las filas inferiores conservan evidencia e incógnitas históricas de cada checkpoint.

**Historial R174, 2026-10-12:** [perfil alternativo y ensayo limitado preparados](static-id-trial-plan-r174.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Flujo limitado acepta solo hash/ID del perfil elegido | ClientePC | Pruebas de ambos perfiles y rechazo de hash/etiqueta ajenos | CONFIRMADO OFFLINE | Alta | Sí | No habilita variante arbitraria o hardware |
| Recibo/journal de un perfil no sirve para otro | ClientePC | Caso cruzado rechazado antes de abrir link | CONFIRMADO OFFLINE | Alta | Sí | Ledger r173 separado, original incierto preservado |
| Variante alternativa completa envío/retirada en peers sintéticos | PeersPC | 12codec/API y22wire/IPC/journal del r173 pasan | CONFIRMADO OFFLINE | Alta | Sí | No acceptance/render/DELETE en RW4 |
| Healthcheck reconoce presencia del nuevo ID previsto | PeerV1 | Caso específico r173 con flags sanitizados | CONFIRMADO OFFLINE | Alta | Sí | Solo presencia, no prueba de propiedad del archivo |
| Cambiar ID resolverá el rechazo físico | RW4/2.2.86 | Todavía no probado | SIN EVIDENCIA FÍSICA | Desconocida | No | Hipótesis; no borrar otras esferas o insistir a ciegas |

**R172/R173, 2026-10-12:** [rechazo de InstallStart](static-watchface-physical-r172.md), [alternativa offline](static-id-alternative-r173.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| InstallStart del ID365799910 fue rechazado | M2315W1/2.2.86 | FaseRejected,installStatus no cero,6TX225bytes,0partes | CONFIRMADO EN RW4 | Alta | Sí, autorizado | Código numérico perdido; no upload22/0 ni archivo enviado |
| Catálogo/selección anteriores conservados | Misma unidad | GET posterior comparado con journal:21IDs yflags iguales,mismactiva | CONFIRMADO EN RW4 | Alta | Sí | No prueba ausencia de staging interno |
| Esfera y menús siguen normales | Misma unidad | Usuario lo confirma después del intento | CONFIRMADO EN RW4 POR OBSERVACIÓN DEL USUARIO | Alta | Usuario | No reinicio/retorno Mi Fitness exigidos |
| La causa es espacio/cupo lleno | Firmware2.2.86 | FAQ describe caso posible; sin código/cuota medidos | SIN EVIDENCIA DE CAUSA | Desconocida | No | No declarar máximo20 ni borrar esferas ajenas |
| La causa es prefijo de ID no admitido | Misma unidad | ID36579 distinto de prefijos observados36511/21/22/23 | INFERENCIA RAZONABLE | Limitada | Comparación local | No contrato de prefijos ni código del firmware |
| Alternativa365219990 solo cambia el ID | Archivo propio PC | Comparación3bytes43/44/47;hash review | CONFIRMADO EN PC | Alta | Sí | No enviado,adaptador no lo acepta todavía |

**R171, 2026-10-12:** [healthcheck físico correcto](healthcheck-physical-r171.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Healthcheck conjunto devuelve batería/info/catálogo | M2315W1/2.2.86 físico | Complete/V1/HMAC/auth/cifrado;97 %;21 esferas/1 activa | CONFIRMADO EN RW4 | Alta | Sí, sesión autorizada del agente | 6TX/12RX,1727ms,cierre normal;sin archivos |
| ID propio365799910 permanece ausente | Snapshot físico R171 | testFacePresent=false,catálogo sin IDs desconocidos | CONFIRMADO PARA ESTE SNAPSHOT | Alta | Sí | Reconsultar al instalar; no reserva permanente |
| Salud de UI/render tras este chequeo | Misma unidad | Sin observación visual/API de pantalla | SIN EVIDENCIA | Desconocida | No | Control plane responde; no prueba funciones completas |

**R170, 2026-10-12:** [healthcheck remoto preparado, no ejecutado físicamente](healthcheck-r170.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Batería/info/lista pueden consultarse en una sola sesión del cliente | Peers V1/V2 sintéticos | 8 sesiones y1 IPC pasan | CONFIRMADO OFFLINE | Alta | Sí | Consultas individuales físicas ya probadas, acción conjunta aún no |
| Respuesta Bluetooth demuestra pantalla/UI funcionando | RW4 | Sin observación ni API visual remota validada | SIN EVIDENCIA | Desconocida | No | Healthcheck del servicio de control no verifica render/input |
| Healthcheck recupera un reloj que no responde | RW4 | No mecanismo de recovery por esta consulta | SIN EVIDENCIA | Desconocida | No | No reboot/flash/reintento/rollback automático |

**R169, 2026-10-12:** [adaptador y registro preparados](static-watchface-transport-r169.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Transferencia V1 cifrada reconstruye el paquete exacto | Peer sintético en PC | Flujo completo por IPC, MD5/CRC/contenido y20 escenarios | CONFIRMADO OFFLINE | Alta | Sí | No valida upload en RW4 |
| Registro permite retirada en otra ejecución | PC, target sintético | Reapertura del journal y DELETE propio simulado | CONFIRMADO OFFLINE | Alta | Sí | No prueba DELETE físico ni recovery de reloj |
| Presupuesto de transferencia independiente | Worker propio Windows | Tests16KiB lecturas/32KiB static, frame4096 y96 frames | CONFIRMADO OFFLINE | Alta | Sí | Modo nuevo no abrió un socket real |
| Entradas nuevas físicas cerradas | CLI y exe propios | GateClosed antes de target/caché/socket | CONFIRMADO EN PC | Alta | Sí | No permiso de instalación por preparar el backend |
| AuthStep4.unknown1=1 es condición de éxito demostrada | Protocolo de familia | Proto lo llama unknown1; handler original acepta CMD_AUTH sin esa comparación | SIN EVIDENCIA SEMÁNTICA | Desconocida | Fuente | No imponer ese valor; exigir HMAC y consultas cifradas |
| Paquete registrará/renderizará y se retirará en2.2.86 | RW4 real | Solo render S3 e inventario físico anterior | SIN EVIDENCIA FÍSICA DE INSTALACIÓN | Desconocida | No | Usuario debe observar primer ensayo tras revisión |
| Gestión de esferas y reboot están documentados para RW4 | Documentación Xiaomi | FAQ KA-228715 yKA-228897 reconsultadas | CONFIRMADO DOCUMENTAL | Alta | No ensayo propio | No recovery integral ni garantía para build2.2.86 |

**R168,2026-10-12:** [validación del paquete y prototipo offline](static-watchface-emulator-r168.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Candidato estático original byte5=0 renderiza | MiWatchEmulator/S3,390×450 | ReadbackSHA idéntico,selector ystatic-r168-render.png | CONFIRMADO EN EMULADOR | Alta | Sí | No modificar versión necesario en este caso; no firmwareRW4 exacto |
| Permite menús/cambio a una esfera conocida | Mismo guest | Panel→Settings→Watchfaces→Storage,cachépropia in_use0 | CONFIRMADO EN EMULADOR | Alta | Sí | Sin reboot para salir; no APIstockRW4 probada |
| Solo sus archivos/ID fueron retirados | Guest emulado | Hash+inactivo+whitelist,rmdir,snapshot y comparación25IDsajenos | CONFIRMADO EN EMULADOR | Alta | Sí | Retirada filesystem conADB,NO XiaomiDELETE real |
| Paquete será eliminado por API en firmwareRW4 | RW4 real | Solo flags previos y simulatedDELETE | SIN EVIDENCIA FÍSICA | Desconocida | No | No instalar por esa inferencia ni borraresferas ajenas |
| Prototipo genera tipo16/MD5/CRC/13partes y retirada restringida | Código propioPC | 12escenariosfakes y checkscodec | CONFIRMADO OFFLINE | Alta | Sí | Backend real ausente,receiptRAM; aceptación de contenido no verificada |
| Workerlecturas16KiB permite enviar paquete25KiB | ClientePC | Constante16384 ybytes25224 | REFUTADO | Alta | Código/archivo | Prototipo bloquea antesdewrite; falta modo específico acotado32KiB |
| Callbacklocal de envío prueba aceptación del paquete | Cliente de familia | OriginalonSend llamadoalencolar | REFUTADO COMO GARANTÍA | Alta | Inspección | Lista prueba registro,nohash/render/commitfinal |

**R167,2026-10-12:** [inventario y candidato estático](watchface-inventory-result-r167.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| GET4/0 devuelve lista cifrada de esferas del RW4 | UnidadM2315W1/2.2.86 | JSONComplete/21entradas/1activa/20canDelete/0unknown | CONFIRMADO EN RW4 POR PRUEBA DEL USUARIO | Alta | Usuario | Cierre y worker normales, sin upload/selección/delete |
| canDelete garantiza retirada desde cliente propio | Misma unidad | Solo flags GET, sin DELETE | SIN EVIDENCIA DE OPERACIÓN | Desconocida | No | Marca del firmware, no permiso de borrar cualquier esfera |
| ID365799910 no colisiona con lista recibida | Snapshot físicoR167 | Comparación con21IDs privados | CONFIRMADO PARA ESTE SNAPSHOT | Alta | Sí | Reconsultar antes de install; no reserva permanente |
| RW4Probe se empaqueta para perfil365 con una imagen propia | Empaquetador PC | Compiler4.23/RW4/NoErrors/25224bytes,Shape30metadata | CONFIRMADO EN PC | Alta | Sí | SinLua/nativo; no render emulador ni HW de este paquete todavía |
| Byte5=10 del bridge emulador es necesario para paquete físico | RW4firmware | Método pertenece a AdbBridge, sin evidenciaHW | SIN EVIDENCIA | Desconocida | No | Candidato físico conserva byte5original0; soloIDeditado |
| Preview PNG visto demuestra render del paquete en RW4 | PC vsRW4 | Solo imagen fuente inspeccionada | NO DEMOSTRADO | Desconocida | PreviewPC | Formato/tablas/runtime/aceptación requieren más validación |

**R166, 2026-10-12:** [sesión física completa](windows-xiaomi-success-r166.md), [siguiente inventario preparado](windows-watchface-inventory-plan-r166.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Cliente Windows completa auth Xiaomi v1 y lecturas cifradas | Unidad M2315W1/2.2.86 reportada | Complete/HMACtrue/ACKtrue/encryptedtrue/5TX12RX | CONFIRMADO EN RW4 POR PRUEBA DEL USUARIO | Alta | Usuario | No files ni código nuevo en el reloj |
| Clave R164 corresponde criptográficamente a esa sesión | Misma unidad | HMAC correcto y respuestas CCM válidas | CONFIRMADO EN RW4 | Alta | Usuario | No implica que sobreviva a futuras desvinculaciones/reset |
| Servicio devuelve batería97 y firmware2.2.86/modelo reconocido | Misma unidad | JSON Complete/battery97/FW2.2.86/modelRecognized=true | CONFIRMADO EN RW4 | Alta | Usuario | Cadena exacta de modelo no exportada; M2315W1 identidad física reportada |
| Auth desde PC permite menús con teléfono BT apagado | Misma unidad | Confirmación explícita después de Complete | CONFIRMADO POR REPORTE DEL USUARIO | Alta | Usuario | No conexiones simultáneas probadas |
| Conectar nuevo teléfono necesariamente invalidó R164 al conservar Mi Fitness | Este ciclo de esta unidad | Usuario confirma modo+registro conservado y HMAC válido | REFUTADO PARA ESTE CICLO | Alta | Usuario | No garantizar comportamiento universal de menú/firmware |
| Socket/worker cerraron normalmente tras datos reales | Cliente PC / sesión real | closeConfirmed+workerExitConfirmed=true,exit0,supervisornull | CONFIRMADO EN PC POR REPORTE DEL USUARIO | Alta | Usuario | Retorno Mi Fitness de este éxito pendiente por bloque PC conservado |
| Inventario GET4/0 funciona con peers sintéticos | Código propio, V1/V2 | 10escenarios de inventario y2IPCfull nuevos | CONFIRMADO OFFLINE | Alta | Sí | Consulta física aún no ejecutada, no permisos de escritura |
| Hay Doom/C nativo o una watchface propia instalada en RW4 | Unidad física | Ningún archivo transferido, solo API stock | SIN EVIDENCIA | Desconocida | No | Emulador permanece evidencia separada |

**R165, 2026-10-12:** [resultado dirigido y separación de hipótesis](directed-pairing-result-r165.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Pairing dirigido logró un bond usable con RW4 en estado normal | Unidad usuario | NativeRejected/258, sin código, bondCurrentlyUsableVerified=false | NO DEMOSTRADO; ENSAYO FALLIDO | Alta para intento | Usuario | 258 WAIT_TIMEOUT, no rechazo remoto explícito ni causa probada |
| El supervisor mató este worker por su deadline | Herramienta PC | supervisor=null,pairingApiCompleted=true,workerExitConfirmed=true | REFUTADO PARA ESTE INTENTO | Alta | Usuario | Retorno 258 de API, no deadline propio |
| Mi Fitness y menús siguen funcionando después del intento | Misma unidad | Usuario confirma normal+sync | CONFIRMADO POR REPORTE DEL USUARIO | Alta | Usuario | No preguntar otra vez; no prueba ausencia de writes internos |
| Conectar nuevo teléfono sin unlink conserva clave R164 para Windows | Misma unidad | Plan distinto, todavía sin ejecutar | SIN EVIDENCIA | Desconocida | No | FAQ documenta migración misma cuenta, no garantía clave/PC |

**R164, 2026-10-12:** [retorno Mi Fitness y preparación de credencial](synchronized-auth-r164.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Mi Fitness volvió a conectar y sincronizar tras los intentos Windows | Unidad usuario | Confirmación explícita posterior a R163 | CONFIRMADO POR REPORTE DEL USUARIO | Alta | Usuario | Retorno normal, no recuperación de firmware |
| Logs posteriores contienen un único candidato distinto de R161 y R162 | Teléfono propio / snapshot USB R164 | 4archivos,1con valores,3líneasRW4,comparaciones privadas | CONFIRMADO EN LOGS LOCALES | Alta | Sí | encryptKey/token concordantes; sin exponer secretos |
| La candidata del vínculo nuevo autentica el reloj | RW4 actual | auth.json preparado sin desafío nuevo | SIN EVIDENCIA HMAC TODAVÍA | Desconocida | No radio | Procedencia reforzada por sync/lectura posterior; parsing de identidad limitado |
| auth.json usa ahora R164 y conserva backup anterior privado | Configuración del cliente PC | validateAuth/escritura temporal/rename/readback | CONFIRMADO EN PC | Alta | Sí | Cambio reversible, sin envíos al reloj |

**R163, 2026-10-12:** [estado QR y preparación de pairing dirigido](windows-directed-pairing-plan-r163.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Última reconexión fue código Windows sin nuevo menú de migración | Unidad usuario | Respuesta explícita | CONFIRMADO POR REPORTE DEL USUARIO | Alta | Usuario | Reloj sigue QR; asociación Mi Fitness actual no demostrada |
| El apagado observado fue solo de pantalla | Unidad usuario | Usuario tuvo que encender dispositivo completo | REFUTADO POR REPORTE DEL USUARIO | Alta para observación | Usuario | Causa/timeout normal no establecidos |
| Cliente dirigido tiene límites y falla sin radio en tests | Código PC propio | Build,14escenarios C# falsos,6supervisor JS falsos | CONFIRMADO OFFLINE | Alta | Sí | Sin API native/diálogo real; no prueba aceptación RW4 |
| Pairing dirigido conserva asociación Mi Fitness en RW4 | Unidad M2315W1/2.2.86 | Hipótesis y plan, sin ejecución | SIN EVIDENCIA | Desconocida | No | Bonding puede escribir claves/cambiar estado; no prometer conservación |

**R162, 2026-10-12:** [logs actuales y candidato separado](current-auth-candidate-r162.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Logs actuales de Mi Fitness contienen un segundo valor candidato | Teléfono del usuario / archivos propios | 4copias y 4lecturas USB; 2valores,1archivo,9líneasRW4 | CONFIRMADO EN LOGS LOCALES | Alta | Sí | Valores secretos no exportados; viejo→nuevo en orden del archivo |
| La segunda clave autentica el RW4 actualmente | Unidad M2315W1/2.2.86 | Candidato separado preparado, sin desafío real nuevo | SIN EVIDENCIA CRIPTOGRÁFICA TODAVÍA | Desconocida | No radio | Sin misma-objeto JSON/MAC reconocida; línea RW4 no prueba unidad física |
| Copias recientes prueban que las líneas de clave son del día12 | Logs propios | Fecha12 en actividad, fecha11 en línea cercana a candidatos | NO DEMOSTRADO | Desconocida | Inspección PC | No timestamp propio reconocido de clave; conservan historial |
| Se leyeron logs directamente por USB sin operaciones de reloj | Teléfono usuario / SDK oficial fijado | Autorización usuario y helper COMPLETE/4files/noRadio/noWatch | CONFIRMADO EN TELÉFONO | Alta | Sí | La autorización ADB manual puede persistir; no cambios de archivos remotos del helper |
| Windows puede solicitar pairing a una dirección conocida | API Win32, no RW4 específico | Documentación Microsoft BluetoothAuthenticateDeviceEx | CONFIRMADO DOCUMENTALMENTE | Alta | No API ejecutada | UI stock; aceptación y conservación de asociación RW4 desconocidas |

**R161, 2026-10-12:** [protocolo físico y rechazo HMAC](windows-auth-result-r161.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| El cliente Windows intercambia versión y desafío Xiaomi v1 | Unidad M2315W1/2.2.86 reportada | Dos JSON protocolVersion=1, 2TX/2RX y AuthHmacMismatch | CONFIRMADO EN RW4 POR PRUEBA DEL USUARIO | Alta | Usuario | Respuesta parseable; autenticación de aplicación pendiente |
| La clave histórica autentica los intentos actuales | Misma unidad / algoritmo del cliente | HMAC no coincide en ambas sesiones | REFUTADO PARA ESTOS INTENTOS | Alta | Usuario | No demuestra por sí solo rotación ni algoritmo exacto del firmware |
| Desvinculaciones anteriores invalidaron esa clave concreta | Unidad del usuario | Historial de unlink y advertencia primaria de Gadgetbridge | INFERENCIA RAZONABLE | Media | No comparación de clave actual | Hipótesis principal; requiere logs recientes y validación HMAC |
| Hubo consulta de batería/info o transferencia de archivos | Estos dos intentos | 2TX antes de auth-final; informes null/filesTransferred=false | REFUTADO PARA ESTOS INTENTOS | Alta | Usuario y revisión de cliente | Solo versión y nonce; no código o firmware enviados |
| Socket y worker cerraron normalmente | PC / dos sesiones | closeConfirmed=true, workerExitConfirmed=true, exit0, nativeError=false | CONFIRMADO EN PC POR REPORTE DEL USUARIO | Alta | Usuario | No prueba retorno Mi Fitness; estado remoto no inspeccionado |
| Orden de derivación/HMAC coincide con fuente Gadgetbridge disponible | Código propio PC / worktree de diagnóstico | Relectura de computeAuthStep3Hmac/handleWatchNonce contra derive/authResponse | CONFIRMADO EN CÓDIGO | Alta | Inspección local | Worktree parcheado, no firmware ni prueba criptográfica hardware |

**R160, 2026-10-12:** [primer lote fallido y corrección](windows-session-open-failure-r160.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Primer lote R159 llegó a comandos Xiaomi | Unidad usuario | PreflightOrOpenFailed/20147ms/watchCommandRequested=false | REFUTADO PARA ESTE INTENTO | Alta | Usuario | No conclusión sobre auth key/protocolo; socket anterior sí abrió |
| Windows mantenía vínculo anterior tras cambiar modo reloj | PC/reloj del usuario | Respuesta explícita | CONFIRMADO POR REPORTE DEL USUARIO | Alta | Usuario | Claves stale posibles, causa NO demostrada |
| Parent podía perder cierre confirmado tras error terminal | Herramienta PC | Fixture error→stdin-error→CLOSED1; fallo de diseño revisado | CONFIRMADO OFFLINE Y CORREGIDO | Alta | Sí | No reinterpretar close=false del intento viejo sin pipe crudo |
| Ambas listas con reloj funcional demuestran hosts activos simultáneos | Misma unidad | Observación de presencia en listas | SIN EVIDENCIA SUFICIENTE | Desconocida | No perfiles verificados | No inferir límite universal de uno ni compatibilidad dual |

**R158/R159, 2026-10-12:** [resultado SPP](windows-spp-result-r158.md), [lote](windows-xiaomi-session-plan-r159.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| SPP Windows abre y cierra con la unidad RW4 | M2315W1/2.2.86 del usuario | JSON physical/Opened/1337ms/1Start/cierre+worker OK | CONFIRMADO EN RW4 POR PRUEBA DEL USUARIO | Alta | Usuario | Sin payload Xiaomi; no solo perfil micrófono |
| Este intento regresó después a Mi Fitness | Misma unidad | Usuario difiere retorno, mantiene PC | PENDIENTE | Desconocida | No todavía | Retorno anterior probado, no presumir actual |
| Lote V1/V2 funciona con peers simulados | Código propio PC | 12synthetic sessions +2IPC full +4IPC failures | CONFIRMADO OFFLINE | Alta | Sí | No prueba protocolo/auth HW2.2.86; no paquetes reales enviados |
| Clave histórica sigue vigente para auth | Misma unidad | Un candidato contextual en logs previos | SIN EVIDENCIA DE VIGENCIA | Desconocida | Preparación PC | HMAC futuro; no probar alternativas/bypass |
| Reloj responde comandos Xiaomi/batería al cliente Windows | Misma unidad | Lote físico no ejecutado | SIN EVIDENCIA | Desconocida | No | SPP Opened no lo demuestra |

**R155, 2026-10-11:** [aclaración del flujo de vinculación](windows-spp-probe-plan-r154.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Ensayo PC incluyó desvincular desde Mi Fitness | Flujo usado por usuario / RW4 | Aclaración explícita, además de Bluetooth | CONFIRMADO POR REPORTE DEL USUARIO | Alta para ensayo | Usuario | Corrige secuencia previa incompleta; cambia asociación de la app |
| Flujo muestra aviso de no pérdida de datos | Mismo flujo stock | Usuario informa «dice que no se pierden datos» | CONFIRMADO COMO AVISO REPORTADO | Media | No captura agente | No prueba persistencia de una futura app/ELF/WAD propios |

**R154, 2026-10-11:** [retorno observado y cliente SPP preparado](windows-spp-probe-plan-r154.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Quitar vínculo Windows y volver a Mi Fitness restaura funciones | Unidad M2315W1/2.2.86 | Confirmación explícita del usuario | CONFIRMADO POR REPORTE DEL USUARIO | Alta para ensayo | Usuario; no agente | No garantías universales; no firmware/recovery completo |
| Ambos vínculos convivieron en este ensayo | Misma unidad | Usuario tuvo que quitar PC para volver a Mi Fitness | NO DEMOSTRADO; TRABAJAR CON UNO A LA VEZ | Media | Reporte usuario | No inferir límite universal de todos los perfiles/firmwares |
| Cliente soporta preflight/supervisión/un único Start | PC / fuentes propias | Build +134 aserciones C# y diez escenarios JS falsos | CONFIRMADO EN PC OFFLINE | Alta | Sí | Native cache preflight/driver/socket reales NO ejecutados en estas pruebas |
| Conexión SPP Windows funciona con RW4 | Unidad actual | Solo UI de micrófono, no prueba SPP | SIN EVIDENCIA | Desconocida | No | Probe listo, revisión pendiente |

**R153, 2026-10-11:** [Windows micrófono conectado / retorno pendiente](pc-cache-and-migration-r150.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Windows conecta el reloj y muestra micrófono | Unidad RW4 del usuario / Windows | Captura «Micrófono conectado», reporte de conexión desde QR | CONFIRMADO POR REPORTE Y CAPTURA DEL USUARIO | Alta para UI | Usuario; no agente | No prueba SPP, autenticación Xiaomi o nativo; HFP solo inferencia |
| Puede volver normalmente tras conexión PC | Misma unidad | Usuario no puede salir del QR; reconexión Mi Fitness pendiente | SIN EVIDENCIA DE RETORNO EN ESTE ESTADO | Desconocida | Pendiente | La cancelación anterior sin pairing no basta; no asumir brick/bond borrado |

**R151, 2026-10-11:** [pantalla QR reportada](pc-cache-and-migration-r150.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Flujo inspeccionado muestra QR para la app | Unidad M2315W1/2.2.86 del usuario | Reporte «sí, sale el qr … para ponerlo en la app» | CONFIRMADO POR REPORTE DEL USUARIO | Media | Usuario; no agente | No captura/QR guardados; detener antes de escanear/pairing |
| Cancelación restaura Mi Fitness sin cambios | Misma unidad | Resultado de retorno aún no recibido | SIN EVIDENCIA | Desconocida | Pendiente | No asumir cancelabilidad ni bond borrado/recovery exitoso |

**R150, 2026-10-11:** [caché Windows y migración](pc-cache-and-migration-r150.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Caché Classic devuelve cero candidatos por nombre RW4 | Windows / consulta sin inquiry | 7 registros, 3 autenticados, cero coincidencias; consulta completa | CONFIRMADO EN PC | Alta | Sí | No verifica identidad ni descarta alias/BLE/claves obsoletas |
| Apagar BT del teléfono basta para encontrar RW4 en Windows | Unidad del usuario | Usuario no lo ve por nombre con teléfono apagado | SIN EVIDENCIA | Baja | Observación usuario | No prueba causa o incompatibilidad; no repetir ciclos |
| Existe entrada de menú preguntada en Sistema | RW4 2.2.86 del usuario | Respuesta «sí sale» a pregunta sobre Connect New Phone/visibilidad | CONFIRMADO POR REPORTE DEL USUARIO | Media | No por agente | Nombre exacto/pantalla posterior no registrados; no activada |
| Abrir Connect New Phone conserva vínculo/cancelación fiable | RW4 2.2.86 | FAQ solo describe migración; sin prueba local | SIN EVIDENCIA | Desconocida | No | Plan de inspección pendiente de decisión; no garantía reboot |

**R149, 2026-10-11:** [preflight del vínculo y documentación oficial](pc-link-preflight-r149.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Inventario PnP tiene registros llamados Redmi Watch 4 | PC / lectura actual | Filtro por nombre devuelve cero | REFUTADO PARA ESTE FILTRO | Alta | Sí | No prueba ausencia de bond, alias o caché Bluetooth |
| Migración de teléfono documentada | RW4 | FAQ Xiaomi KA-91528, Connect New Phone para misma cuenta | CONFIRMADO EN DOCUMENTACIÓN RW4 | Alta | No operación | No prueba segundo vínculo Windows/coexistencia |
| SPP Android y BLE iPhone declarados para RW4 | RW4 / especificación comercial | Columna RW4 de tabla oficial KA-694585 | CONFIRMADO EN DOCUMENTACIÓN RW4 | Alta | No nueva prueba | Tabla alojada en FAQ Watch6, columna explícita RW4; no disponibilidad Windows/firmware2.2.86 |
| RW4 anunciado con RAM32 MB/ROM256 MB | RW4 / especificación comercial | Misma columna oficial Xiaomi | CONFIRMADO EN DOCUMENTACIÓN RW4 | Alta | No medición | No distingue SRAM/PSRAM, flash ni RAM libre de aplicaciones |
| PC puede vincularse conservando Mi Fitness sin migrar | Unidad M2315W1 2.2.86 | Ningún contrato ni ensayo específico | SIN EVIDENCIA | Desconocida | No | No deducirlo de simulación ni de FAQ de migración |


**R148, 2026-10-11:** [cliente PC offline](../experiments/pc-rfcomm/README.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Cliente PC compila y controlador maneja cierre/timeout/cancelación | Windows x64 / fuentes propias | Build csc oficial, tests API/reloj falsos | CONFIRMADO EN PC | Alta | Sí | 113 aserciones; no ensayos físicos |
| Backend nativo disponible para conexión física en esta CLI | Ejecutable R148 | Entrada física ausente; wrapper Physical bloqueado antes de API | REFUTADO PARA ESTA VERSIÓN | Alta | Sí | No flags/env de desbloqueo, no llamada socket OS |
| Interoperabilidad funciona con Realtek y RW4 | Driver/firmware físicos | Ninguna llamada nativa ni ensayo | SIN EVIDENCIA | Desconocida | No | Layouts verificados no equivalen a ejecución nativa validada |
| Pipeline CI pasó en GitHub | Workflow nuevo | Archivo preparado; sin ejecución remota | SIN EVIDENCIA | Desconocida | Solo comandos local | Sin secrets, firmware o WAD; build/test offline |


**R147, 2026-10-11:** [ruta alternativa desde PC](pc-transport-alternative.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Windows detecta adaptador Bluetooth Realtek con estado OK | PC del usuario | CIM Win32_PnPEntity, filtro BTHUSB, lectura aprobada | CONFIRMADO EN PC | Alta | Sí | No escaneo, dirección ni pairing; no valida radio encendida |
| Windows ofrece API de cliente RFCOMM | Plataforma Windows | Documentación Microsoft socket/connect AF_BTH | CONFIRMADO EN DOCUMENTACIÓN | Alta | No socket ejecutado | No prueba soporte remoto RW4 |
| Cliente PC conectará RW4 sin cambiar vínculo actual | M2315W1 2.2.86 | No ensayo ni contrato verificado | SIN EVIDENCIA | Desconocida | No | Preparar offline; plan y revisión antes de pairing/conexión |


**R145, 2026-10-11:** [revisión final Bluetooth](phone-bluetooth-apk-result-r145.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| APK instalado Bluetooth copiado y firma v3 válida | Teléfono Android 16 del usuario | Hash fijado, SDK apksigner/aapt2 | CONFIRMADO EN PC | Alta | Sí | Certificado fabricante sin referencia externa; no ejecutado |
| Ruta Java de apertura delega a connectSocketNative | APK exacto del teléfono | Binder y AdapterNativeInterface leídos con SDK | CONFIRMADO EN CÓDIGO | Alta | Lectura PC | No atribuye cierre ni prueba negociación remota |
| APK incluye implementación nativa RFCOMM | Copia base Bluetooth | Listado SDK sin .so; carga bluetooth_jni externa | REFUTADO PARA ESTE APK | Alta | Sí | No se copiaron otras bibliotecas/APEX |
| Dump Xiaomi intenta copiar HCI de sdcard a logs MIUI | AdapterService.dump del APK | Flujo File/mkdirs/copyFile seguido | CONFIRMADO EN CÓDIGO | Alta | Lectura PC | No prueba origen existente, copia exitosa ni ruta del logger |
| Los ZIP previos contienen esas rutas HCI Xiaomi | Dos informes privados existentes | Inventario de rutas exactas, cero coincidencias | REFUTADO PARA ENTRADAS BUSCADAS | Alta | Sí | No prueba ausencia en el teléfono fuera del ZIP |
| Revisión aporta un cambio concreto que arregla SPP | Transporte físico RW4 | Ninguno encontrado en alcance acordado | SIN EVIDENCIA | Desconocida | No nuevo intento | Cerrar ronda repetitiva y buscar compatibilidad verificada |


**R144, 2026-10-11:** [causa del fallo de copia identificada](phone-bluetooth-apk-plan-r142.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Export falló porque USB no estaba autorizado/paquete ausente | Consulta R143 | device, una ruta APK; metadata revisada | REFUTADO PARA ESTA CONSULTA | Alta | Manual/PC | Ruta legítima de pm rechazada por validador propio |
| Parser omitía directorios Bluetooth con @build | Exporter propio | Ruta observada, patrón previo y regresión nueva | CONFIRMADO EN CÓDIGO/PC | Alta | Sí, sintético | Corregido; copia real todavía pendiente |
| Corrección de exportador soluciona EOF del socket RW4 | Enlace físico | Ninguna prueba de relación causal | SIN EVIDENCIA | Desconocida | No | Son fallos diferentes; no PROBE nuevo |

**R143, 2026-10-11:** [copia fallida y fase de diagnóstico](phone-bluetooth-apk-plan-r142.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| APK Bluetooth fue exportado | PC/último intento usuario | Aviso fallido; carpeta de exportación ausente | SIN COPIA LOCAL | Alta sobre inspección | Sí, PC | Sin causa determinada; no partial encontrado |
| Archivos ADB locales cambiaron respecto al pin | PC/proyecto | Tres SHA256 coinciden | REFUTADO PARA ARCHIVOS ACTUALES | Alta | Sí, PC | No confirma autorización USB efectiva |
| BT encendido y depuración activada garantizan exportación | Flujo USB | Estado UI no valida autorización/package/path | SIN EVIDENCIA | Alta sobre limitación | No | Diagnóstico preparado; no ADB/radio automático |

**R142, 2026-10-11:** [consulta completada](phone-bluetooth-config-plan-r141.md) y [revisión instalada propuesta](phone-bluetooth-apk-plan-r142.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Teléfono es build user | HyperOS actual | JSON manual R141 buildType=user | CONFIRMADO POR CONSULTA DEL USUARIO | Alta | Manual | No identidad/equivalencia del módulo Bluetooth demostrada |
| Propiedades consultadas revelan ruta del HCI | Teléfono actual después de restauración | modeUNSET y pathUNSET | SIN EVIDENCIA | Desconocida | Manual | Valor vacío no prueba ausencia ni estado efectivo del logging |
| bt_stack.conf existe en las tres rutas candidatas | Teléfono actual/lecturas | Tres NOT_FOUND | REFUTADO PARA ESTAS RUTAS | Alta sobre respuesta | Manual | No búsqueda universal ni permiso denegado informado |
| Exportar componente Bluetooth instala/ejecuta otra app | Exporter propio | Código y fake-ADB: getstate/pm path/pull | REFUTADO EN CASOS PROBADOS | Alta | Sí, sintético | Copia real pendiente; sin BT/watch ni lectura de datos de usuario |

**R141, 2026-10-11:** [configuración y alternativa de exportación](phone-bluetooth-config-plan-r141.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Socket HCI live disponible en build user AOSP16 revisada | Código AOSP Android16 | SnoopLogger::Start condiciona creación a ro.build.type != user | REFUTADO PARA FUENTE REVISADA | Alta | Lectura PC | No equivalencia HyperOS demostrada; no forwarding solicitado |
| Ruta AOSP por defecto es la revisada en R140 | AOSP ParameterProvider Android16 | SnoopLogFilePath default y override interno | CONFIRMADO EN FUENTE | Alta | Lectura PC | Ruta efectiva HyperOS desconocida |
| ZIP contiene config/ruta vendor que resuelve exportación | Entradas candidatas conocidas | Metadata: stackConfig0/vendorBluetooth0/nestedBluetooth0 | SIN EVIDENCIA | Desconocida | Sí, PC | No búsqueda universal; ninguna entrada desconocida abierta |
| Consulta USB nueva modifica logging o conecta el reloj | Herramienta propia R141 | Comandos fijos/testfake: getstate/getprop/cat config | REFUTADO EN CÓDIGO/TESTS | Alta para casos | Sí, sintético | Consulta real aún pendiente; no abrir logs ni pairing config |

**R140, 2026-10-11:** [captura autorizada revisada y retorno confirmado](phone-hci-capture-result-r140.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Nueva copia privada contiene paquetes atribuibles al intento | ZIP capture del teléfono actual | Dos BTSNOOP válidos de16B, records0, sininline | REFUTADO PARA CONTENIDO REVISADO | Alta | Sí, PC/CRC seleccionados | No descarta datos fuera de entradas permitidas o con nombres vendor desconocidos |
| HCI estaba configurado full en el informe | Teléfono HyperOS3.0.302.0 | Propiedad exacta Bluetooth con full, una coincidencia | CONFIRMADO EN COPIA LOCAL | Alta | Sí, scanner probado | No demuestra modo aplicado ni paquetes guardados durante PROBE |
| Este diagnóstico identifica quién cerró la conexión | Intento r131 nuevo | G08/R02/L01, apertura529ms, sin paquetes/nativo atribuible | SIN EVIDENCIA | Desconocida | Manual/PC | No modificar transporte por conjetura |
| Ajustes restaurados y reloj/Mi Fitness normales tras captura | Unidad/teléfono del usuario | «Sí, todo restaurado y funciona» | CONFIRMADO POR USUARIO | Alta sobre reporte | Manual | No implica recovery integral |

**R137,2026-10-11:** [captura nueva autorizada](phone-hci-capture-plan.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Usuario autoriza HCI temporal, un PROBE y copia/análisis privado | Sesión actual | Respuesta «sí» al plan R136 | CONFIRMADO EN SESIÓN | Alta | No aplica | Ejecución/resultados pendientes; no QUERY/reintentos/nativo/firmware |

**R136,2026-10-11:** [diagnóstico existente revisado](phone-hci-review-plan.md),
[captura nueva pendiente de decisión](phone-hci-capture-plan.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Informe privado obtenido en PC | Teléfono del usuario | JSON collect exitoso y archivo local | CONFIRMADO POR USUARIO/PC | Alta | Sí | ZIP244073738B/13173entradas; no ejecución de ADB por agente |
| Este historial disponible contiene paquetes del intento | Entradas permitidas/ZIP real | SNOOZ16B, cabecera válida, records0; sin resumen inline | REFUTADO PARA HISTORIAL REVISADO | Alta | Sí, sección BT/CRC | No implica ausencia en rutas vendor desconocidas ni causa del fallo |
| Lector puede revisar sección sin exportar campos generales/claves | Herramienta propia | Tests stream/CRC/markers/canarios y review real saneado | CONFIRMADO EN CASOS PROBADOS | Alta | Sí | Texto general descartado al localizar marker; CRC no firma/integridad ZIP total |
| Nueva captura HCI está autorizada | Sesión actual | Autorización anterior solo informe existente | SIN AUTORIZACIÓN AÚN | Alta sobre alcance | No aplica | Plan concreto preparado; no otra APK/PROBE automático |

**R135,2026-10-11:** [autorización y lector de estructura ZIP](phone-hci-review-plan.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Usuario autoriza copiar informe privado y analizar sección Bluetooth | Sesión actual | Respuesta «sí» a plan R134 | CONFIRMADO EN SESIÓN | Alta | No aplica | Copia manual aún pendiente; no autoriza capturas nuevas/divulgación/nativo |
| Inventario exporta solo metadata fija sin nombres/contenido | Lector ZIP propio PC | Tests sintéticos con canarios y entradas malformadas | CONFIRMADO EN TESTS PC | Alta para casos | Sí, sintético | No CRC/decodificación ni validación de ZIP real; rutas vendor no reconocidas posibles |

**R134, 2026-10-11:** [resultado tras plan OFF→ON](phone-adapter-restart-plan.md)
y [plan de diagnóstico privado existente](phone-hci-review-plan.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| La prueba propuesta con ciclo del adaptador logró abrir SPP | Teléfono/RW4 del usuario | Informe nuevo G08/R02/L01, connect191ms, sinD05 | REFUTADO PARA ENSAYO REPORTADO | Alta sobre informe | Manual usuario | Cada ajuste no observado; no exclusividad probada ni causa identificada |
| Mi Fitness sigue sincronizando tras este ensayo | Unidad del usuario | «sincroniza correctamente» | CONFIRMADO POR USUARIO | Alta sobre reporte | Manual usuario | No implica recovery integral |
| AOSP conserva cabeceras útiles sin logging completo habilitado | Android16 SnoopLogger revisado | Modo disabled mantiene buffer: CMD/EVT completos, L2CAP signalling y ACL normalmente14bytes | CONFIRMADO EN FUENTE AOSP | Alta sobre código | Lectura PC | No anonimato integral, HyperOS ni disponibilidad actual probados |
| Nuestro teléfono ofrece un HCI atribuible al intento en un bugreport | HyperOS/API36 | Solo mecanismo documentado/plan preparado | SIN EVIDENCIA | Desconocida | No | Buffer puede faltar/sobrescribirse; aprobación privacidad pendiente |
| Recolector privado inicia radio o habilita captura | Herramienta propia | Plan/default sinADB; mock solo getstate+bugreport | REFUTADO EN CÓDIGO/TESTS PC | Alta sobre casos | Sí, sintético | Genera diagnóstico persistente del teléfono y ZIP amplio; no lectura sin escrituras |

**R133, 2026-10-10:** [lectura pasiva completada](rw4-opening-result-r132.md) y
[plan de un ciclo del adaptador](phone-adapter-restart-plan.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| La lectura pasiva aportó el motivo nativo del fallo | HyperOS del usuario/lector R132 | nativeHeadersObserved=false; todos los conteos cero | REFUTADO PARA ESTA LECTURA | Alta sobre resultado | Manual usuario | Lectura completó; no demuestra ausencia de logs en otras ventanas/tags |
| Apagar el adaptador cierra conexiones Bluetooth | Contrato Android | BluetoothAdapter.disable documenta cierre y apagado | CONFIRMADO EN DOCUMENTACIÓN ANDROID | Alta sobre contrato | No prueba nueva | Operación propuesta por UI, no API restringida; efecto exacto HyperOS aún pendiente |
| OFF→ON y un PROBE resuelven la apertura en este RW4 | M2315W1/2.2.86 y teléfono actual | Solo plan preparado | SIN EVIDENCIA | Desconocida | No | Core puede reconectar; reutiliza r131, no corrige código por conjetura |

**R132, 2026-10-10:** [canal recibido, EOF y lectura pasiva](rw4-opening-result-r132.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| El intento r131 alcanza waitSocketSignal y luego EOF | Teléfono HyperOS/RW4 | Informe fresco R02/L01/G08; noD05; connect398ms | CONFIRMADO POR INFORME INSTRUMENTADO | Alta sobre cadena/mensaje | Manual usuario | Canal positivo según flujo Java revisado; no causa/cierre remoto identificado |
| Fallo se produce en auth/clave Xiaomi | Este intento soloBluetooth | SinD05/protocolo/auth, key no evaluada | REFUTADO PARA ESTE INTENTO | Alta | Manual y código | No determina validez futura de clave |
| App/reloj siguen normales tras R132 | Dispositivos del usuario | «todo ok en watch y app» | CONFIRMADO POR USUARIO | Alta sobre reporte | Manual | No demuestra recuperación de firmware |
| Callback de cierre entrega a Java el motivo PORT_* | AOSP Android16 revisado | BTA guarda port_status; on_rfc_close lo ignora/cierra slot | REFUTADO PARA ESA RUTA AOSP | Alta sobre código | Lectura primaria PC | Ruta real HyperOS aún no comprobada |
| Dump Socket Events incluye UID/motivo preciso | Logger AOSP Android16 | Estructura/dump omiten campos aunque métricas los reciben | REFUTADO PARA ESA FUENTE | Alta | Lectura PC | Buffer16 histórico, no sockets vivos; no dump solicitado |
| Lector pasivo preserva privacidad sin iniciar radio | Herramienta PC propia | FakeADB4lecturas, canarios, errores y límites; plan sinADB | CONFIRMADO EN TESTS PC | Alta para casos probados | Sí, sintético | Lectura HyperOS real pendiente; candidatos sin atribución r131 verificada |

**R131, 2026-10-10:** [APK de apertura instrumentada](android-opening-diagnostic-r131.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Clasificadores están integrados en el APK r131 | App propia compilada en PC | Tests Status, build y lectura DEX SDK | CONFIRMADO EN PC | Alta | Sí | No ejecutado en Android; informe previo no contiene datos nuevos |
| ret:-1 demuestra un timeout | Helper readAll de AOSP | Retorno negativo reconocido es EOF del stream local | REFUTADO COMO IMPLICACIÓN | Alta sobre lectura | Fuente y tests PC | No identifica quién/cómo cerró ni excluye timeout como causa subyacente |
| APK conserva firma y restricciones declaradas | APK propio r131 | Inspector/apksigner oficial, mismo cert,10permisos/noINTERNET | CONFIRMADO EN PC | Alta sobre comprobaciones | Sí | No garantía integral de seguridad/compatibilidad |
| Conexión física ya corregida con r131 | RW4/HyperOS reales | Solo instrumentación; ningún ensayo nuevo | SIN EVIDENCIA | Desconocida | Pendiente usuario | Plan de un PROBE, sin auth; no modificar transporte por adivinanza |

**R130, 2026-10-10:** [lista vacía y clasificación en PC](bluetooth-open-failure.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| El reloj figura en la lista negra visible | Ajustes HyperOS del usuario | Usuario informa lista vacía | REFUTADO POR REPORTE DEL USUARIO | Alta sobre reporte | Manual usuario | No descarta otras políticas internas; no causa E03 identificada |
| Podemos clasificar dos cadenas conocidas sin exportar la traza | Helper propio Java en PC | Tests positivos, estructuras desconocidas/ambiguas, canarios y límites | CONFIRMADO EN TESTS PC | Alta para casos probados | Sí, sintético | No probado en HyperOS; no identifica ocupación/rechazo/SDP |
| La app instalada ya recoge esa etapa | Teléfono, r114 | Helper no integrado en Status ni nuevo APK generado | REFUTADO | Alta | Lectura PC | Informes anteriores mantienen G08 ambiguo |

**R129, 2026-10-10:** [captura y apertura Bluetooth](bluetooth-open-failure.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Existe una opción «Lista negra de Bluetooth» | Ajustes del teléfono HyperOS | Captura aportada por usuario | CONFIRMADO EN CAPTURA | Alta | Visual | Contenido y efecto sobre SPP no comprobados; solo revisión visual propuesta |
| El reloj está en esa lista y explica E03 | Teléfono/RW4 | No hay contenido de lista ni correlación del intento | SIN EVIDENCIA | Desconocida | No | Mi Fitness sincroniza; no cambiar ajustes por esta hipótesis |
| El mismo IOException de G08 puede surgir en dos lecturas internas | AOSP android16-release, blob824dda69 | readInt y waitSocketSignal llaman readAll | CONFIRMADO EN FUENTE AOSP | Alta sobre fuente | Lectura primaria PC | No equivalencia HyperOS demostrada; no determina causa remota |
| El informe actual conserva qué lectura interna falló | App diagnóstica propia | Status guarda categoría; patch sustituye log de excepción | REFUTADO EN IMPLEMENTACIÓN | Alta | Lectura PC | No pedir logs crudos ni atribuir una fase concreta a informes previos |

**R128, 2026-10-10:** [servicio retirado; retorno normal](phone-core-state-plan.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Core externo sigue registrado activo tras esta detención MiFit | Dos consultas actuales del teléfono | Baseline core1→stopped core0; cuerpo reconocido | REFUTADO EN ESTA COMPARACIÓN | Alta sobre registros | Manual usuario | No extrapolar a sockets, proceso o intentos previos |
| Mi Fitness y reloj vuelven a funcionar tras R128 | Teléfono y RW4 | Confirmación expresa del usuario | CONFIRMADO POR USUARIO | Alta sobre reporte | Manual | No recovery integral ni cambios firmware |
| La implementación core depende solo de la instancia Service | APK del core en PC | Binder devuelve singleton static final; Service sin onDestroy/onUnbind propio | REFUTADO EN CÓDIGO REVISADO | Alta | SDK smali | No prueba que el singleton/socket siga vivo en teléfono |
| Socket Events demuestra conexiones activas actuales | Android AOSP revisión ee02f4df3b | Buffer circular16eventos, no tabla de sockets vivos | REFUTADO PARA ESA FUENTE | Alta | Lectura primaria | No formato HyperOS comprobado; no dump solicitado |

**R127, 2026-10-10:** [baseline positiva del servicio remoto](phone-core-state-plan.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Existe registro activo del core externo en esta baseline | Teléfono HyperOS, componente/usuario filtrados | Lector R126 remote coreRecords1, ProcessRecord assigned, cuerpo reconocido | CONFIRMADO POR CONSULTA ANDROID REPORTADA | Alta sobre registro | Manual usuario | No socket RW4, hilo vivo o competencia demostrados |
| Componente core local activo en esta baseline | Paquete Mi Fitness del teléfono | Cuerpo reconocido, 7registros activos, coreRecords0 | NO OBSERVADO EN CONSULTA | Alta sobre salida | Manual usuario | No ausencia de código core en proceso o conexión independiente demostrada |
| Core externo permanece después de detener Mi Fitness | Teléfono actual, lector R126 | Solo baseline recibida | SIN EVIDENCIA ACTUAL | Desconocida | Pendiente | Comparación stopped propuesta; no usar ceros R124 como resultado equivalente |

**R126, 2026-10-10:** [comparación parcial y formato del lector](phone-core-state-plan.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Mi Fitness volvió a conectar/sincronizar | Teléfono y RW4 del usuario | Confirmación expresa; baseline miFitnessStopped=false | CONFIRMADO POR USUARIO | Alta sobre reporte | Manual | No socket Lyra identificado |
| serviceFormatRecognized de R124 valida todo el cuerpo | Lector PC propio R124 | Solo comprobaba cabecera; caso sintético cabecera sola emitía0 | REFUTADO EN IMPLEMENTACIÓN | Alta | Sí | R126 corrige unknown; no se demuestra causa de ceros físicos |
| No se observaron registros remotos en ambas salidas | JSON R124 baseline y stopped | coreRecords0 en ambas | CONFIRMADO SOBRE SALIDAS | Alta sobre JSON | Manual reportado | Formato/cuerpo real sin validar; no ausencia de servicio/socket probada |
| Ambos APKs declaran el componente core | Manifests AAPT2 ya revisados | Misma clase, paquetes wearable y mi_connect_service | CONFIRMADO EN COPIAS PC | Alta | Estático | No uso actual para RW4 demostrado; lectura de ambos preparada |

**R125, 2026-10-10:** [salida stopped aportada](phone-core-state-plan.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Mi Fitness quedó detenida en la consulta stopped | Teléfono HyperOS del usuario | JSON miFitnessStopped=true | CONFIRMADO POR REPORTE ANDROID | Alta sobre campo | Ejecución manual reportada | Falta confirmar reapertura/sincronización |
| Lectura stopped observó registros Lyra activos | Componente y usuario filtrados | JSON activeCoreRecords=0, process not-established | NO OBSERVADO EN CONSULTA | Alta sobre salida del lector | Ejecución manual reportada | Baseline pendiente; no prueba socket libre ni valida todo el formato HyperOS |

**R124, 2026-10-10:** [estado Lyra y lectura preparada](phone-core-state-plan.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Existe un setter interno para habilitar Lyra | APK base Mi Fitness verificado | CoreExtKt.setLyraEnabled guarda pref version_v3_; dos llamadas en manejo de muerte Binder | CONFIRMADO EN CÓDIGO PC | Alta sobre métodos | SDK estático | No botón normal demostrado; no provocar fallos o editar prefs |
| Lyra sigue activo durante nuestros PROBE fallidos | Teléfono del usuario | Aún no hay lectura actual del servicio durante esos intentos | SIN EVIDENCIA DIRECTA | Desconocida | No | Comparación USB preparada no prueba socket ocupado ni causa E03 |
| Lector USB emite solo esquema fijo sin dumps | Script PC propio | FakeADB, secciones/estados/canarios/errores y plan sinADB | CONFIRMADO EN PC | Alta para casos probados | Sí, sintético | Salida HyperOS real pendiente; ProcessRecord asignado no prueba hilo vivo |

**R123, 2026-10-10:** [papelera identificada](mi-connect-service-static-review.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Papelera y Desvincular aparecen en pantallas distintas | Mi Fitness del usuario | Dos capturas: Dispositivos y Más | CONFIRMADO POR CAPTURAS | Alta | Inspección visual | No implican funciones independientes al completar el flujo |
| Papelera proporciona una pausa temporal Bluetooth | Código de lista de dispositivos Mi Fitness3.59.1i | Handler activa edición; acción eliminar termina en unbindDevice | REFUTADO EN RUTA REVISADA | Alta | SDK estático | No pulsado en teléfono; no se comparan todos los efectos de ambas rutas |
| UI muestra RW4 conectado/sincronizado y versión2.2.86 | Capturas aportadas | Estado conectado, aviso sincronización y versión en Más | CONFIRMADO POR CAPTURAS | Alta sobre UI | Inspección visual | No verifica canal SPP, socket Lyra ni causa E03 |

**R122, 2026-10-10:** [lectura de UI e inicio automático](mi-connect-service-static-review.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Desvincular y la papelera son el mismo control | Pantalla Mi Fitness del usuario | Corrección explícita: son distintos | REFUTADO POR REPORTE DEL USUARIO | Alta sobre descripción | No | Función de la papelera pendiente; no pulsar |
| Existe una pausa de conexión visible en la pantalla inspeccionada | Mi Fitness del usuario | No ve Desconectar/Conexión automática/Interconectividad | SIN EVIDENCIA | Desconocida | Lectura manual reportada | No extrapolar a todos los menús |
| Mi Fitness tiene autostart habilitado | Ajustes Android del usuario | Usuario dice «creo» | SIN CONFIRMACIÓN | Baja | No | No cambiar ajustes para validar la hipótesis |
| Desactivar autostart libera el socket Lyra | Teléfono HyperOS del usuario | Documentación de autoinicio no demuestra cierre del servicio/socket | SIN EVIDENCIA | Desconocida | No | No repetir PROBE basándose solo en ese cambio |

**R121, 2026-10-10:** [servicio Xiaomi instalado](mi-connect-service-static-review.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| APK del servicio declara5.1.251.10 y firma válida | Copia del teléfono, no firmware RW4 | Hash, AAPT2, apksigner36.0.0 | CONFIRMADO EN PC | Alta sobre archivo | Sí | Titular Xiaomi independiente y UID real sin consultar |
| Compartición de usuario system | Manifest del APK del teléfono | sharedUserId android.uid.system | CONFIRMADO COMO DECLARACIÓN | Alta | Inspección | No inferir UID/proceso efectivo, permisos de reloj o necesidad root |
| Nuestra app puede obtener la API operativa de Lyra solo añadiendo permiso | API copiada, paquete propio nodomain | Identidad UID→package; whitelist2apps +cert check; rechazo a otros | REFUTADO EN RUTA DE CÓDIGO REVISADA | Alta sobre guard | Estático | No bind físico realizado; exposición onBind no equivale acceso operativo |
| Cerrar Mi Fitness cierra todos los dispositivos vinculados | onClientDied del servicio | Cancela task; cleanup unauth condicionado, no cierre general bound | SIN EVIDENCIA EN RUTA REVISADA | Alta sobre recorrido | Estático | No garantiza supervivencia del servicio bajo cualquier acción OS |
| El servicio puede recuperar un dispositivo y programar reconexión | Código servicio | initCurrentDevice + connectDeviceIfNeed/retraso3s | CONFIRMADO EN CÓDIGO PC | Alta | Estático | Config real no leída; servicio activo/competencia durante PROBE no comprobados |
| API disconnect es puramente RAM | Código servicio del teléfono | Guarda flag SharedPreferences si inLyra | REFUTADO EN CÓDIGO PC | Alta | Estático | Persistencia en teléfono; no operación ejecutada ni escritura RW4 demostrada |
| El SPP revisado usa UUID1101/factory segura | Código servicio, no mapping RW4 | ib.e/ib.o/wear.api.l SDKsmali | CONFIRMADO EN CÓDIGO PC | Alta sobre ruta | Sí | Hay rama opcional MiuiNearby para bond; flag específico RW4 desconocido |
| Existe una pausa temporal simple disponible en la UI actual | MiFit3.59.1i/HyperOS usuario | Implementación disconnect interna sí; UIcandidatos cambian otras cosas | SIN EVIDENCIA SUFICIENTE | Desconocida | Pendiente lectura UI | No sugerir cambio teléfono/app, desvincular o deshabilitar sistema |

**R120, 2026-10-10:** [identidad, transporte SPP y Lyra](mi-fitness-apk-static-review.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| APK copiado declara Mi Fitness3.59.1i y firma válida | Base instalado del teléfono, 4partes reportadas | Hash revalidado; AAPT2 y apksigner36.0.0 | CONFIRMADO EN PC | Alta sobre archivo | Sí, lectores oficiales | No autenticidad Xiaomi independiente ni splits verificados |
| Cliente SystemClient de Mi Fitness usa UUID1101 y factory segura ServiceRecord | Código APK base | SDKsmali SystemClient + spp.a + zlq | CONFIRMADO EN CÓDIGO PC | Alta para método | Sí | Misma apertura que variante propia; selección RW4 sin demostrar |
| Mi Fitness puede delegar a MiWearCoreService externo | Código APK y logs existentes | RemoteServiceConnector/CoreExtKt; 178registros bindtrue/client | CONFIRMADO EN CÓDIGO E HISTORIAL APORTADO | Alta sobre observación | Sí, filtro privado | Pueden ser duplicados; no estado actual, canal o unidad RW4 |
| Detener Mi Fitness aisló toda su ruta de comunicación | Tres PROBE anteriores | No inspección del servicio externo en esas pruebas | SIN EVIDENCIA | Desconocida | No | Permisos/proceso MiFit no demuestran ausencia de Lyra |
| Servicio externo causa E03 o excluye nuestra app | RW4/HyperOS del usuario | Nueva hipótesis; no canal o política del servicio comprobados | INFERENCIA RAZONABLE A INVESTIGAR | Baja | No | No desactivar servicio/evadir permisos/cambiar canales |
| Export-core copia solo APK del paquete fijo por USB | Código propio PC | FakeADB incluido SystemExt/oneAPK; plan-core sinADB | CONFIRMADO SOLO EN PC | Alta para casos probados | Sí, sintético | Lectura física del nuevo paquete aún pendiente; no radio/firmware |

**R119, 2026-10-10:** [revisión SPP y copia de APK preparada](rw4-spp-endpoint-research.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| La ruta cliente RW4 usa Classic/SPP por servicio y canal default-1 | Fuentes Gadgetbridge0.94 + preview propio | Seis hashes verificados, coordinator/soporte/queue revisados | CONFIRMADO SOLO EN CÓDIGO PC | Alta para ruta revisada | Inspección estática | No endpoint remoto validado ni bug global descartado |
| El cierre exitoso PROBE ocurre antes de socket.connect | Variante diagnóstica revisada | Está después de connect/D05 en handler | REFUTADO EN CÓDIGO PC | Alta para ubicación | Inspección estática | No descarta otras carreras/llamadas externas |
| El exporter selecciona USB y solo query/pull del APK base | Código propio PC | FakeADB/ZIP: comandos/rutas/privacidad/nooverwrite | CONFIRMADO SOLO EN PC | Alta para casos probados | Sí | No ADB real ni export en teléfono probado |
| Mi Fitness usa un endpoint distinto para este RW4 | MiFit3.59.1i/unidadM2315W1 | APK aún no disponible/análisis pendiente | SIN EVIDENCIA | Desconocida | No | No deducir transporte de soporte de otro Xiaomi o strings aisladas |

**R118, 2026-10-10:** el usuario confirma retorno normal después del inventario
completo: Mi Fitness sincroniza y reloj normal. [Resultado](rw4-service-inventory.md).
Confirmado en esta unidad por reporte; no valida recovery integral ni SPP funcional.

**R117, 2026-10-10:** [segundo inventario completado](rw4-service-inventory.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Segundo inventario r114 completó ambas fases y las llamadas de cierre retornaron | Cliente Android API36 del usuario | I1/16132ms/error0/stop BLE y receptor retornaron | CONFIRMADO POR REPORTE EN TELÉFONO | Alta sobre reporte | Manual usuario | No garantiza estado de todo el stack OS/firmware |
| Android entregó una lista del objetivo con SPP/HFP/HID | Solicitud para unidad M2315W1/2.2.86 | ACTION_UUID/5UUIDs/SPP1101 sí/HFP sí/HID sí | CONFIRMADO POR REPORTE EN TELÉFONO | Alta sobre reporte | Manual usuario | Respuesta puede contener caché; endpoint remoto actual sin validar |
| El scanner BLE recibió callbacks | Cliente API36 | Ventana completada/40callbacks/error0 | CONFIRMADO POR REPORTE EN TELÉFONO | Alta sobre reporte | Manual usuario | No son necesariamente40dispositivos; no implica datos de Xiaomi |
| Se identificaron anuncios BLE del RW4 | Unidad del usuario | 0coincidencias dirección/0candidatos nombre | SIN EVIDENCIA | Desconocida | No identificado | No descarta BLE ni anuncios con otros identificadores |
| Mi Fitness/reloj retornaron normalmente tras segundo inventario | Unidad del usuario | Confirmación explícita posterior R118 | CONFIRMADO EN RW4 POR REPORTE | Alta sobre reporte | Manual usuario | R115 corresponde al primero; R118 confirma el segundo, no recovery de firmware |

**R116, 2026-10-10:** [desenlace del primer inventario r114](rw4-service-inventory.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| El primer inventario terminó al perder primer plano antes de iniciar BLE | Cliente API36 del usuario | Registro I3/5922ms/BLE no iniciado | CONFIRMADO POR REPORTE EN TELÉFONO | Alta sobre registro | Manual usuario | No indica por qué ocurrió onPause |
| El retiro del receptor retornó sin excepción capturada | Cliente API36 | Receptor: llamada retornó | CONFIRMADO POR REPORTE EN TELÉFONO | Alta sobre registro | Manual usuario | No cancela SDP OS pendiente ni prueba toda limpieza del sistema |
| El reloj no ofrece SDP/BLE | M2315W1/2.2.86 | Inventario interrumpido a5,9s, antesBLE | SIN EVIDENCIA | Desconocida | No confirmado | Falta ejecución completa; segunda manual propuesta, mismo APK |

**R115, 2026-10-10:** [informe r114 inicial y retorno normal](rw4-service-inventory.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| La pantalla r114 abrió y publicó un snapshot inicial | Teléfono API36 del usuario | Informe I0/SDP esperando/BLE no iniciado/13ms | CONFIRMADO POR REPORTE EN TELÉFONO | Alta sobre reporte | Manual usuario | No prueba contacto remoto ni duración total |
| El inventario físico completó SDP y BLE | M2315W1/2.2.86 y cliente API36 | No hay informe terminal | SIN EVIDENCIA | Desconocida | No confirmado | Recuperar último registro guardado sin nuevo intento |
| Reloj normal y Mi Fitness sincroniza tras esta operación | Unidad del usuario | Confirmación explícita | CONFIRMADO EN RW4 POR REPORTE | Alta sobre reporte | Manual usuario | No demuestra reversibilidad universal ni recovery de firmware |

**R114, 2026-10-10:** [inventario de servicios](rw4-service-inventory.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| El inventario tiene fases acotadas y libera escaneo/receptor independientemente | Controlador Java propio en PC | `test-android-service-inventory.mjs`, radio simulada | CONFIRMADO SOLO EN PC | Alta para controlador | Sí | No confirma stopScan/temporización del OS real |
| Tickets de inventario no habilitan consumidores de conexión ni payloads | Código propio y parche GB en PC | Tests Attempt + guards de fuente/QUERY | CONFIRMADO SOLO EN PC | Alta para lo probado | Sí | QUERY aceptado requerido para comandos; UI/radio físicos pendientes |
| El informe del inventario persiste solo conteos/flags y no exporta identificadores | Código propio en PC | Tests del controlador y preferencias Android simuladas | CONFIRMADO SOLO EN PC | Alta para componente propio | Sí | No auditoría global de Gadgetbridge/OS |
| Solicitar UUIDs garantiza respuesta recién obtenida del RW4 | Android SDK, no unidad real | Contrato oficial `fetchUuidsWithSdp` permite caché | REFUTADO | Alta | No radio | ACTION_UUID no demuestra endpoint remoto ni canal |
| El RW4/2.2.86 anuncia BLE o responde a esta solicitud SDP | M2315W1 del usuario | Sin resultado R114 aún | SIN EVIDENCIA | Desconocida | No | Nombre BLE coincidente será candidato, no prueba de identidad |

**R113,2026-10-10:** [PROBE con permiso Mi Fitness denegado](rw4-permission-isolated-probe-result.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| PROBE con NearbyMiFit denegado y ambas apps detenidas abrió el socket | Unidad M2315W1/2.2.86 y clienteAPI36 | Usuario confirma procedimiento; informe E03/G08 sinD05 | REFUTADO para este intento | Alta sobre reporte | Manual usuario | Connect386ms, close7ms; noauth/GET |
| Mi Fitness/reloj funcionan tras restaurar permisos de R113 | Unidad del usuario | Confirmación explícita en mismo mensaje | CONFIRMADO EN RW4 por reporte | Alta sobre observación | Manual usuario | No recovery firmware probado ni igualdad de todo dato |
| Los logs aportados prueban que RW4 usa BLE | Archivos privados Mi Fitness previos | Filtro fijo:12líneasBLE,0 misma-líneaRW4 | SIN EVIDENCIA suficiente | No evaluable | FiltroPC/test sí | No atribución a unidad ni ausencia de SPP demostrada |
| Preferencia genérica force-connection-type selecciona BLE en coordinatorRW4 actual | Fuente Gadgetbridge0.94.0 | Override soloBOTH; RW4BT_CLASSIC | REFUTADO para este código | Alta | Inspección PC | No alterar coordinator para probar hardware sin evidencia |
| Filtro de transporte exporta solo etiquetas fijas/contadores | Herramienta PC propia | Tests privacidad/UTF8/contadores y lectura real | CONFIRMADO en componente/test PC | Alta sobre alcance | Sí | No analiza paquetes ni credenciales, no radio |

**R112,2026-10-10:** usuario dio pasos nuevos y reporta sincronización de esos
pasos en Mi Fitness con llamadas/entrada OFF: **CONFIRMADO EN RW4 por reporte
de prueba manual**. No implica transporte exacto identificado ni causa de G08.
La comunicación de datos no queda deshabilitada por ambos toggles en esta
observación. Permiso Nearby de Mi Fitness aún sin aislamiento probado.

**R111,corrección de R110:** usuario precisa que ambos perfiles siguen OFF.
Restauración de toggles **no confirmada**. Mi Fitness presenta datos, pero conexión
actual/sincronización reciente **SIN EVIDENCIA independiente**; verificar estado
en la app después de restaurar. No asumir que datos visibles prueban enlace activo.

**R110,2026-10-10:** usuario confirma restauración de toggles y funcionamiento
normal de Mi Fitness/reloj tras R109. Retorno **CONFIRMADO EN RW4 por reporte**;
no demuestra igualdad de todos los datos ni causalidad de los pasos/notificación.
Ensayo futuro con permiso de Mi Fitness denegado todavía sin resultado.

**R109,2026-10-10:** [Segundo PROBE y actividad aparente](rw4-bluetooth-profiles-result.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Nuevo PROBE falla durante connect antes de D05/auth | RW4 M2315W1/2.2.86, clienteAndroidAPI36 | Informe manual r106 | CONFIRMADO EN RW4 por reporte del cliente | Alta sobre etapa | Manual usuario | D04→E03 151ms; mismoG08; close retorna6ms después |
| Mi Fitness se reconectó y causó E03 | Este intento | Usuario cree inició app por notificación | SIN EVIDENCIA causal | No evaluable | No captura/proceso/enlace verificado | No confundir aviso con conexión Bluetooth |
| Quick Share debe intermediar cualquier conexión Bluetooth | Android/cliente propio | Guía Google y ruta directa AndroidAPI | REFUTADO como requisito de nuestra implementación | Alta sobre arquitectura | Fuente | Presencia no confirma ni excluye actividad/contención radio |
| Desactivar llamadas/entrada resolvió la conexión | Este intento después de guíaR108 | Sigue E03; estado de toggles no confirmado separadamente | SIN EVIDENCIA de solución | Alta sobre fallo, condición sin verificar | Manual usuario | No afirmar aislamiento perfecto de MiFitness |
| Mi Fitness/reloj normales después de este intento | Unidad del usuario | Pregunta de retorno pendiente | SIN EVIDENCIA aún para R109 | Pendiente | No confirmado | R107 normalidad es observación anterior |

**R108,2026-10-10:** [Perfiles del sistema y prueba propuesta](rw4-bluetooth-profiles-plan.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Android indica llamadas/audio y entrada conectados y habilitados | Registro de esta unidad RW4 en HyperOS del teléfono | Lectura manual del usuario | CONFIRMADO EN RW4 por reporte de UI Android | Alta sobre reporte | Manual usuario | No identifica una sesión SPP ni protocolo exacto de entrada |
| Estos perfiles causaron el fallo G08 de PROBE | Enlace RW4/teléfono | Observación sin ensayo de aislamiento | SIN EVIDENCIA causal | No evaluable | No | Plan manual pendiente; no nueva versión de APK |

**R107,2026-10-09:** [Resultado real PROBE r106](rw4-bluetooth-probe-result.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| r106 llegó a crear socket y falló durante connect antes de protocolo/auth | M2315W1/2.2.86 y Android API36 | Informe manual D18/D04/E03 sin D05, G08; fuente de etapas | CONFIRMADO EN RW4 por reporte del cliente | Alta sobre etapa | Manual usuario | 297ms entre solicitud socket y fallo; no captura radio |
| El error fue causado por nuestro límite30s o cierre previo solicitado | Este intento PROBE | E03+414ms, cierre solicitado:no, sin E08 | REFUTADO para el límite y cierre registrados por nuestra app | Alta | Manual usuario | No excluye causas de la pila Bluetooth o peer |
| La clave Xiaomi fue rechazada o validada | Este intento PROBE | Modo sin clave/protocolo; fallo pre-D05 | SIN EVIDENCIA | No evaluable | No auth ejecutada | QUERY usa el mismo socket; cambiar clave no resuelve la etapa observada |
| La llamada close retornó y app registró desconexión | Cliente r106 en teléfono | D17+420ms/D13+440ms | CONFIRMADO por reporte Android | Alta sobre llamada | Manual usuario | No prueba cierre de todos los perfiles/link |
| Mi Fitness y reloj vuelven a funcionar | Unidad del usuario | Respuesta posterior del usuario | CONFIRMADO EN RW4 por reporte | Alta sobre observación | Manual usuario | App muestra ~18 pasos más; no afirmar igualdad ni causa |
| La prueba modificó el contador de pasos | Unidad del usuario | Diferencia posterior sin baseline; PROBE sin comandos Xiaomi | SIN EVIDENCIA | No evaluable | No ensayo causal | No borrar datos/reset por esta observación |
| G08 identifica una causa concreta o rechazo explícito remoto | Pila teléfono/reloj | Patrón genérico y sin error Axx | SIN EVIDENCIA | No evaluable | Fuente/informe | AOSP histórico contiene patrón; no es build HyperOS16 exacta |

**R106:** [Diagnóstico consolidado preparado](android-consolidated-diagnostic.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Toolkit consolidado compila/firma y conserva restricciones de manifiesto | APK Android propio r106 | Build, inspector, apksigner | CONFIRMADO en artefacto PC | Alta | Sí | No instalado/UI/radio r106 probados |
| Probe retorna antes de lector/auth y gate deniega sus payloads | Cliente r106, no reloj probado | Fuente generada y contrato de modo/WriteAction | CONFIRMADO en código/pruebas PC | Alta sobre implementación | Sí | Apertura de enlace real futura; no asumir cero efectos internos del reloj |
| Cancelación pendiente invalida un intent tardío | Ticket/proceso Java del cliente | Prueba cancel-before-consume, modo y replay/concurrencia | CONFIRMADO en prueba PC | Alta | Sí | No medición temporal de cierre radio en Android |
| Informe no expone claves/MAC/serial/mensajes crudos | Componente propio de informe | Tests Details/Status con datos corruptos y errores sintéticos | CONFIRMADO sobre componente/prueba PC | Alta | Sí | No equivale a auditoría completa de todos los logs/menús heredados |
| r106 abre socket o autentica en M2315W1/2.2.86 | Unidad física | Ensayo manual aún pendiente | SIN EVIDENCIA | No evaluable | No | Dos fallos anteriores y caché positiva no demuestran éxito |

**R105,2026-10-09:** [Lectura real de caché](android-bluetooth-cache.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Android confirma vínculo, informa tipo clásico y guarda SPP | Registro RW4 del teléfono del usuario | Reporte de diálogo r104 B01/T01/S01 | CONFIRMADO por reporte de caché Android | Alta sobre reporte | Manual usuario; UI y componente propios | No enumera todas las capacidades físicas del reloj |
| Classic/SPP seleccionado coincide con caché | Cliente r101 / registro local Android | Fuente selecciona BT_CLASSIC/UUID1101 y reporte r104 | INFERENCIA RAZONABLE sobre elección de transporte | Alta | Inspección fuente y reporte | No demuestra apertura posible ni servicio actualmente disponible |
| La presencia de SPP en caché demuestra endpoint remoto funcional ahora | RW4/2.2.86 | Caché sin nueva conexión/discovery | SIN EVIDENCIA | No evaluable | No | E03 anterior sigue sin causa precisa |
| Es posible recuperar del r104 la causa detallada del E03 anterior | Cliente Android | r101 guardó solo enum de etapas; r104 lee caché | REFUTADO para los datos conservados por nuestro diagnóstico | Alta sobre diseño | Fuente | No habilitar export de logs privados; haría falta instrumentar una prueba futura |

**R104,2026-10-09:** [Consulta local preparada](android-bluetooth-cache.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Componente nuevo consulta caché sin discovery/socket | Cliente propio r104 en PC | Código, contrato Java con stubs sin APIs radio, guard del adapter/servicio | CONFIRMADO en código/prueba de componente | Alta sobre componente | PC | No ensayo Android real de esta versión; otros menús heredados no forman parte del flujo |
| APK r104 contiene consulta y misma firma | Artefacto Android local | Build, inspector, apksigner v1/v2, lectura DEX | CONFIRMADO en artefacto PC | Alta | Sí | Firma no demuestra inocuidad ni comportamiento runtime |
| Servicio SPP presente/ausente en caché de esta unidad | Teléfono del usuario / RW4 | Lectura manual r104 aún pendiente | SIN EVIDENCIA | No evaluable | No | No extrapolar datos sintéticos |

**R103,2026-10-09:** [Segundo intento y retorno](first-rw4-query-result.md).

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Segundo intento falla antes de auth Xiaomi | M2315W1/2.2.86, APK r101 | Cadena usuario D01>D02>D03>D04>E03>E08>D13 y ubicación de marcas en fuente | CONFIRMADO EN RW4 por reporte y correspondencia de código | Alta sobre etapa | Fuente PC; intento manual usuario | IOException del socket; causa concreta desconocida |
| Mi Fitness y reloj funcionan normalmente después | Misma unidad, segundo intento | Confirmación explícita usuario | CONFIRMADO EN RW4 por reporte | Alta sobre reporte | Manual usuario | No demuestra retorno después de auth exitosa |
| r101 selecciona Classic/SPP para RW4 | Cliente Android, fuente usada en build | Coordinator RW4 y XiaomiSppSupport/cola | CONFIRMADO en código cliente | Alta | Inspección PC | No prueba endpoint soportado/disponible en firmware real |
| E08 indica reboot/watchdog del reloj | Esta traza | Enum y temporizador local de sesión | REFUTADO como interpretación del código | Alta | Inspección PC | Es límite local30s; no telemetría del reloj |
| Clave fue rechazada en este intento | Misma unidad | Sin D05/D08; fallo previo | SIN EVIDENCIA | Alta sobre límite | No auth alcanzada según traza | No cambiar clave por este resultado |
| Caché Android contiene SPP para esta unidad | Teléfono existente | getUuids disponible en API oficial, sin lectura realizada | SIN EVIDENCIA | No evaluable | No | Próximo diagnóstico propuesto; caché puede ser incompleta |

**R101,2026-10-09:** [Diagnóstico por etapas](android-diagnostic-stages.md).
Usuario confirma detención previa Mi Fitness/permisos cercanos; no causa del
fallo identificada. Build r101/Java/cola/inspección/firma confirmados solo en
PC; UI/transporte r101 **SIN EVIDENCIA** hasta prueba manual.

**R100,2026-10-09:** [Primer intento físico](first-rw4-query-result.md).
Usuario reporta clave introducida/Conectar sin conexión, solo «No conectado».
Mi Fitness conecta después, **CONFIRMADO EN RW4 por reporte del usuario**
para uso normal tras este intento; no demuestra retorno tras auth exitosa.
Auth/GET exitosos siguen **SIN EVIDENCIA**; causa desconocida, no prueba de
clave inválida ni incompatibilidad Lua/nativa. No ensayo de instalación.

**R99,2026-10-09:** [Watchfaces y juegos Lua RW4](rw4-lua-games-evidence.md).
Fuentes originales revisadas; sin ensayo físico nuevo.

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Existen scripts de watchface RW4 con touch/LVGL | RW4, código de ejemplo | Upstream TouchEvents | CONFIRMADO EN RW4 documental | Alta | Lectura; runtime previo solo S3 | No prueba firmware2.2.86 |
| Autor publicó Duck Hunt Lua y versión RW4 Battle City | RW4, reportes del desarrollador | Publicaciones originales enlazadas R99 | CONFIRMADO EN RW4 como reporte del autor | Alta sobre reporte | No juegos ejecutados | Sin firmware exacto/fuente de juegos revisada |
| Todo juego Lua requiere firmware modificado | RW4 / watchfaces frente a apps independientes | Habr897742 distingue las rutas | REFUTADO como conclusión de esas fuentes | Alta documental | Lectura | Firmware especial referido a apps independientes; instalación stock propia aún pendiente |
| Una watchface defectuosa puede causar crash/reinicio recuperable por retirada | RW4, esfera Light and Night | FAQ oficial Xiaomi KA-228715 | CONFIRMADO EN RW4 documental | Alta | No | No prueba hard brick ni recovery de firmware |
| Juegos Lua demuestran nuestro ELF Doom compatible con RW4/2.2.86 | Nuestra unidad / port C | No evidencia ABI/loader específica en esos ejemplos | SIN EVIDENCIA | No evaluable | No | No extrapolar scripting a módulo nativo |

**R98:** [Fidelidad de emulación](emulation-fidelity.md), sin prueba física nueva.

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Compilar OpenVela Goldfish permite controlar configuración/versión | OpenVela general en PC | Quick start oficial/menuconfig | INFERENCIA RAZONABLE como alternativa de pruebas | Alta documental | No build nuevo | Sin configRW4 exacta, no necesariamente más fiel que S3 |
| vendor_bes publicado demuestra soporte stock RW4/BES2700iBP | BES2600 evaluación / RW4 desconocido | README oficial dev documenta BES2600WM-AX4F/BEST2003 | SIN EVIDENCIA de esa equivalencia | Alta sobre límite README | Lectura | No generalizar otra placa/chip a M2315W1 |
| Hay emulador público exacto M2315W1/2.2.86 localizado | Hardware/firmware exactos | Búsqueda R98 y docs QEMU/OpenVela | SIN EVIDENCIA encontrado | No evaluable | No | No refuta emulación futura ni forks privados |
| OTA oficial exacta está disponible y demuestra ABI/recovery | M2315W1/2.2.86 | Propuesta de análisis R98; paquete no adquirido | SIN EVIDENCIA | No evaluable | No | Podría ser delta/cifrado/sin símbolos; no iniciar OTA en reloj |

**R97,2026-10-06:** usuario difiere conexión para investigar evidencia/recovery.
[Informe de auth y retorno](rw4-auth-return-research.md); sin prueba física nueva.

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| RW4 fue incorporado a Gadgetbridge0.81.0 como experimental | RW4, cliente upstream | Release oficial2024-07-05 / ficha actual | CONFIRMADO EN RW4 como soporte de código/documentación | Alta documental | Lectura | No confirma firmware2.2.86 ni éxito auth |
| Un relato de usar perfil RW4 en Watch5 demuestra nuestra compatibilidad RW4 | Watch5 en hilo original | Reporte original Reddit2025-04 y comentarios | REFUTADO como inferencia de compatibilidad | Alta sobre dispositivo reportado | Lectura | No ensayo de nuestro modelo ni retorno MiFitness |
| Auth y retorno sin reset/unpair están demostrados para M2315W1/2.2.86 | Unidad/firmware exactos | Revisión R97, fuentes/queries listadas | SIN EVIDENCIA suficiente encontrada | No evaluable | No | PR original3693 no accesible; no afirmar imposibilidad |
| dispose/cleanup puede cerrar transporte SPP | Cliente Gadgetbridge0.94.0 | XiaomiSppSupport.dispose/BtBRQueue cleanup/close | INFERENCIA RAZONABLE para retorno propuesto | Alta para código, baja para resultado físico | Lectura PC | No demuestra reconexión MiFitness ni latencia de cierre Android16 |

**R95,2026-10-06:** usuario confirma RW4 emparejado en Ajustes Bluetooth,
Mi Fitness conecta bien y teléfono Android16/HyperOS3.0.302.0. No prueba de
SPP/autenticación propia ni de versión HyperOS del reloj. Plan físico listo
para revisión; no autorización recibida.

**R94,2026-10-06:** instalación y ciclo visible Android r92 reportados por
usuario. [Resultado offline](android-offline-test.md). Sin prueba de transporte
ni autenticación del reloj; no repetir build ni emulador.

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| APK r92 instala y permite abrir/salir/reabrir sin permisos, lista vacía | Teléfono Android del usuario, no RW4 | Reporte usuario R94 | Confirmado por prueba manual reportada, fuera de categorías del reloj | Alta para UI reportada | Sí, por usuario | No confirma cierre de servicios/socket ni ausencia de todo tráfico; no prueba hardware |
| Forzar detención desactivado demuestra que no queda proceso | Android del usuario | Botón desactivado reportado R94 | SIN EVIDENCIA concluyente | Baja | Observación manual | Compatible con app detenida; no inspección de procesos |

**R74, 2026-10-04:** [Auditoria stock RW4](rw4-stock-feasibility.md):10sources Lua especificos sin llamadas shell/loader; relato original de m0tral refuerza indicio Lua/shell pero sin firmware RW4 reproducible. Gadgetbridge candidato de instalacion experimental, no usado. R73 persiste como prueba exclusiva S3; gate fisico cerrado.

**Historial R71, 2026-10-04:** [Timer50ms medido](doom-50ms-emulator.md).17,45entregas/s frente a4,87; giros12,67-13,55cambios visibles/s observados frente aunos5. Motor ~35tics/s, pausa400ms y EXIT limpios. Mismo C/ELF R67, Lua R71; solo emulador S3. Siguiente: una sesion de90s para observar estabilidad/memoria, gate M2315W1 cerrado.

**Historial R70, 2026-10-04:** [Presentacion y controles medidos](doom-performance-emulator.md). Pipeline Lua/LVGL media1,48ms, intervalos205,30ms/4,87entregas/s; giros con4,57-5,08cambios visibles/s observados. C/ELF R67 intactos, instrumentacion Lua acotada; salida limpia. Siguiente: Timer200 a50ms y comparar, sin prometer20FPS. Solo emulador S3, gate M2315W1 cerrado.

**Historial R69, 2026-10-04:** [Cierre sin EXIT y reentrada](doom-close-emulator.md) pasan con Doom original. Seleccionar Storage detiene el worker104 y libera13 reservas/streams; conserva modulo/copias hasta reentrada UI, que recoge todo. Sin reboot para salir ni unload host. C/Lua/ELF R67 intactos; solo emulador S3, gate M2315W1 cerrado. Siguiente: medir frames presentados, costo de copia y latencia antes de optimizar.

**Historial R68:** [Panel stock y STOP con FIRE mantenido](doom-focus-emulator.md) comprobados con Doom original. R67 y anteriores son historial; gate físico cerrado.

**Historial R67:** [DOOM original en UI con controles](doom-ui-emulator.md). Las filas históricas Rxx describen ese checkpoint; sus pendientes de motor/input/UI no sustituyen el resultado posterior R67. Ninguna prueba nueva abre el gate M2315W1.

Actualizada 2026-10-04. Referencias Rxx: [research.md](research.md#fuentes-consultadas). `CONFIRMADO` puede significar evidencia documental específica del dispositivo, nunca prueba de nuestra unidad sin resultado local. Hay inspección estática, boot, ADB, inventario y validación visual/táctil de TouchEvents empaquetado en emulador S3. No hay pruebas del reloj físico. Filas CLI anteriores describen pruebas históricas; no el resultado posterior con launcher watchface.

Estados: **CONFIRMADO EN RW4**, **CONFIRMADO EN EMULADOR**, **CONFIRMADO SOLO EN OTRO XIAOMI**, **INFERENCIA RAZONABLE**, **SIN EVIDENCIA**, **REFUTADO**. Las capacidades genéricas upstream se indican aparte y no se transforman en compatibilidad RW4.

## Hechos de base

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Modelo físico indicado: M2315W1 | Unidad del usuario | Identificación comunicada por usuario | SIN EVIDENCIA independiente | Alta como dato recibido | No | Región/firmware desconocidos |
| AMOLED 1.97, 390×450, hasta 60 Hz | RW4 | R01/R02 | CONFIRMADO EN RW4 | Alta documental | No | No equivale a FPS DOOM |
| Corona, GNSS, altavoz, micrófono, sensores | RW4 | R01/R03 | CONFIRMADO EN RW4 | Alta documental | No | Acceso desde nuestras apps sin probar |
| BES2700iBP | Unidad RW4 del teardown | R05/R06 | CONFIRMADO EN RW4 | Alta en unidad desmontada | No | No fingerprint de nuestro M2315W1 |
| STAR-MC1, SRAM 2.2 MB, PSRAM/Flash SiP | SoC BES2700iBP | R06 | INFERENCIA RAZONABLE para RW4 | Alta en SoC, media en reparto RW4 | No | No ABI/memory map ni RAM libre |
| DS35M2GB-IB SPI NAND y marcaje touch 8918BC | RW4 desmontado | R05 | CONFIRMADO EN RW4 | Media/alta documental | No | Variación de placa/región pendiente |
| Hay ejemplos Lua/watchfaces para RW4 | RW4 | R07/R08/R09 | CONFIRMADO EN RW4 | Alta para existencia de fuente | Estático remoto | Runtime de firmware específico pendiente |
| TouchEvents referencia LVGL/touch | RW4 ejemplo | R09 | CONFIRMADO EN RW4 | Alta para fuente, media para ejecución | Estático remoto | `get_point` posición; `get_vect` delta |
| NuttX/LVGL sustentan la familia RW4 | Familia RW4 | R07 | INFERENCIA RAZONABLE | Media/alta, mantenedor | No | Falta identificación/config real |
| Emulador ofrece preset RW4 | MiWatchEmulator | R12/R13 | CONFIRMADO EN EMULADOR | Alta documental | No | No emulación exacta BES/ABI |
| Emulador deriva de entorno S3 | MiWatchEmulator | R10 | CONFIRMADO EN EMULADOR | Alta documental | No | Límites explícitos |
| ADB/shell/rutas watchface | Emulador S3 | R13/R31/R33 | CONFIRMADO EN EMULADOR | Alta local | Inventario por emulator-5554 | Servidor dedicado 5039; ninguna selección USB |
| `.rpk` distribuye apps JS | Vela general | R14/R15/R16 | INFERENCIA RAZONABLE como ruta a investigar | Alta general, baja RW4 | No | RPK no es ELF |
| Flujo oficial de debug físico documentado | Watch S4 | R20 | CONFIRMADO SOLO EN OTRO XIAOMI | Alta | No | Partners/firmware especificado |
| API files/buffers/exit | Vela JS general | R17/R18/R19 | INFERENCIA RAZONABLE como candidato | Alta general, sin prueba RW4 | No | No shell/carga C demostrados |
| doomgeneric usa 640×400 por defecto | Motor PC/upstream | R25 | REFUTADO: 320×200 como default | Alta por código | Estático remoto | 320×200 sigue siendo propuesta válida |
| Existe release comunitaria verificable por metadata | MiWatchEmulator v1.0 | R12/R31 | CONFIRMADO EN EMULADOR | Alta para existencia | ZIP inspeccionado | Hash local registrado; digest del mantenedor ausente |
| 94 EXE/DLL host coinciden con OpenVela | Emulador host Windows | R30/R31/lock | CONFIRMADO EN EMULADOR | Alta para identidad binaria | Hash/tamaño local | No prueba build desde source ni sandbox |
| Guest ELF32 LE ARM, EABI5/hard-float | Imagen nuttx del emulador | R31 encabezado | CONFIRMADO EN EMULADOR | Alta estática | Inspección ELF | No ABI del BES ni contrato completo de módulos |
| Goldfish Cortex-A7 / CONFIG_BUILD_FLAT | Imagen del emulador | R31 macros de depuración | CONFIRMADO EN EMULADOR | Alta estática | ELF/debug strings | No separación de memoria en esta build; RW4 desconocido |
| Lua 5.4 CLI; os.execute/package.loadlib son function | Emulador S3 | R31/R33 | CONFIRMADO EN EMULADOR | Alta local | Consulta de tipos; sin invocación | No prueba shell, watchface runtime ni RW4 |
| ELF / insmod / rmmod / lsmod / dlopen compilados | Imagen del emulador | R31 símbolos/config | CONFIRMADO EN EMULADOR | Alta estática | No carga | No ejecutar módulos para descubrir ABI |
| WAMR / iwasm compilados | Imagen del emulador | R31 símbolos/config | CONFIRMADO EN EMULADOR | Alta estática | No payload | Versión literal WAMR-04-15-2021; imports/límites pendientes |
| Skin RW4 390×450 / 16 bpp / 60 Hz | Perfil del emulador | R31 config/skin | CONFIRMADO EN EMULADOR | Alta estática | No render | Config fuente 512 MB; hardware-qemu viejo 2048 MB; no RAM RW4 |
| NuttX/NSH y Xiaomi Watch S3 | Guest MiWatchEmulator v1.0 | R33 boot/uname -a | CONFIRMADO EN EMULADOR | Alta local | ADB shell | 0.0.0, 9aec7d0ff1, Dec 5 2024; no versión física RW4 |
| Servicio adbd accesible | Guest emulador | R33 | CONFIRMADO EN EMULADOR | Alta local | 16 consultas de inventario | version no soportado aunque status 0; NAT 2512 offline |
| CPU VM Cortex-A15 y 2048 MB asignados | QEMU/launcher | R33 argumentos/runtime log | CONFIRMADO EN EMULADOR | Alta local | Launch/boot | No equivale a heap NuttX ni RAM RW4 |
| Display 390×450 | Guest emulador | R33/R34 | CONFIRMADO EN EMULADOR | Alta local | Screenshot PNG | UI stock almacenamiento; no render TouchEvents |
| insmod/rmmod/lsmod anunciados por NSH | Emulador S3 | R33 help/lsmod | CONFIRMADO EN EMULADOR | Alta local para presencia | Inventario inicial sin módulos | Cargas propias posteriores R45/R51, sin extrapolar RW4 |
| exec recibe dirección hexadecimal | Emulador S3 | R33 help -v exec | CONFIRMADO EN EMULADOR | Alta local | Ayuda solamente | No launcher ELF por filename; no invocado |
| iwasm/qjs/aiotjsc/lua en builtins | Emulador S3 | R33 help/ls /bin | CONFIRMADO EN EMULADOR | Alta local para presencia | Inventario | No payload WASM/JS propio ni compatibilidad RW4 |
| /dev/fb0, input0, utouch existen | Emulador S3 | R33 ls /dev | CONFIRMADO EN EMULADOR | Alta local | Listado | Sin apertura de drivers ni display/input propio |
| /data FAT, /tmp TMPFS, ROMFS | Emulador S3 | R33 mount/df | CONFIRMADO EN EMULADOR | Alta local | Inventario | /data 126 MiB, ~112.1 MiB libres; no storage RW4 |
| Umem total 129704956, libre 111706820 bytes | Emulador S3 | R33 free | CONFIRMADO EN EMULADOR | Alta local | Primera muestra | No sumar pools; no presupuesto DOOM/RW4 |
| require lvgl desde Lua CLI | Emulador S3 | R33 TouchEvents | CONFIRMADO EN EMULADOR | Alta local | Script original | Falla después en lvgl.Font; no UI activada |
| TouchEvents original funciona íntegro aquí | Emulador S3, CLI | R33 traceback | REFUTADO en este contexto | Alta local | Error de fuente | Causa y contexto watchface pendientes |
| Variante sin fuente explícita muestra TouchEvents | Emulador S3, CLI | R33 screenshot | REFUTADO en esta prueba | Alta local | CLI sin excepción, screenshot stock | Sin touch validado ni watchface instalada |

## Las 23 hipótesis

| Claim | Device | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| TouchEvents original renderiza y responde al touch | Emulador S3 configurado 390×450 | R40, capturas y log launcher | CONFIRMADO EN EMULADOR | Alta local | Sí, paquete/watchface | Sin modificaciones Lua; get_vect no es posición absoluta |
| Fuente original está necesariamente ausente | Emulador S3 | R40, original renderizado | REFUTADO como afirmación global | Alta local | Sí | Fallo CLI previo no se extrapola al launcher; causa exacta pendiente |
| Cambiar a Storage cierra Lua anterior | Emulador S3 | R40, close lua now + script Storage | CONFIRMADO EN EMULADOR | Alta local | Sí | Sin medición de fugas; no botón de exit del sample |
| Paquete persiste tras reset y vuelve a abrirse sin reinstalar | Emulador S3 | R40, reset/reentrada/touch | CONFIRMADO EN EMULADOR | Alta local | Sí | Persistencia de archivo no residencia continua en RAM; ninguna prueba RW4 |

| Claim | Device | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Mantener TouchEvents vivo en CLI activa su UI | Emulador S3 | R36, captura tras -i | REFUTADO en esta prueba | Alta local | Sí | Pantalla stock; no prueba imposibilidad en contexto watchface |
| Recorrer padres LVGL desde CLI es un probe inocuo | Emulador S3 | R36, cierre QEMU/Bad ram pointer | REFUTADO como supuesto de seguridad | Alta para el fallo; causa exacta desconocida | Sí | Probe retirado; guest relanzado y funcional |
| Script miuiwatch stock expone ui.init y ScreenStateChangedCB | Imagen emulador S3 | R36, lectura ROMFS | CONFIRMADO EN EMULADOR | Alta estática | Sí, sin ejecutar script | No extrapolar contrato a todos los widgets ni RW4 |
| activity.isShown y navigator.finish están expuestos al CLI | Emulador S3 | R36, tipos package.loaded | CONFIRMADO EN EMULADOR | Alta local | Solo introspección | No se probaron llamadas, lifecycle ni RW4 |

Continuación 2026-10-03: lua-api confirmó disp.load_scr/get_scr_act y Timer en emulador, sin invocarlos. MiWatchNativeApps [R35] contiene launcher Lua con os.execute y hello C para Watch S3/Band 10 Pro: evidencia documental **CONFIRMADO SOLO EN OTRO XIAOMI**, sin prueba local ni validación RW4. Direcciones absolutas dependen del firmware. Ninguna clasificación física cambia por estos hallazgos.

| # | Claim | Device | Evidence | Classification | Confidence | Tested locally | Notes / siguiente evidencia necesaria |
|---|---|---|---|---|---|---|---|
| 1 | Lua permite `os.execute()` | RW4, firmware desconocido | R74 articulo original m0tral, preparacion | INFERENCIA RAZONABLE | Media como relato, sin contrato | No | No version/region/transcript RW4;10sources no la llaman |
| 2 | Shell NuttX accesible indirectamente | RW4, firmware desconocido | R74 relato autor sobre Lua/shell | INFERENCIA RAZONABLE | Media como relato | No | Requiere prueba especifica antes de uso |
| 3 | Shell incluye `insmod` | RW4 | R29 upstream | SIN EVIDENCIA | No evaluable | No | `help` de build real, después gate físico |
| 4 | Carga módulos ELF nativos | RW4 | R28 upstream | SIN EVIDENCIA | No evaluable | No | Loader/config/exports/ABI concretos |
| 5 | Módulos persistentes cargables bajo demanda | RW4 | Diseño deseado | SIN EVIDENCIA | No evaluable | No | FS escribible persistente y loader |
| 6 | Existe `rmmod` | RW4 | R29 upstream | SIN EVIDENCIA | No evaluable | No | Compilación/semántica concretas |
| 7 | Existe `lsmod` | RW4 | R29 upstream | SIN EVIDENCIA | No evaluable | No | Inspección específica |
| 8 | Existe `iwasm`/WAMR | RW4 | No runtime específico hallado | SIN EVIDENCIA | No evaluable | No | No confundir WASM web con reloj |
| 9 | ELF userspace sin privilegios kernel | RW4 | R27 posibilidades upstream | SIN EVIDENCIA | No evaluable | No | Build model y servicio de ejecución |
| 10 | C nativo con firmware stock | RW4 | No mecanismo demostrado | SIN EVIDENCIA | No evaluable | No | No root como premisa |
| 11 | Acceso directo a framebuffer | RW4 | R13 emulador | SIN EVIDENCIA | No evaluable | No | Permisos/formato/ownership del driver |
| 12 | `/dev/fb0` existe en firmware real | RW4 | R13 solo emulador | SIN EVIDENCIA | No evaluable | No | Inventario real aún prohibido |
| 13 | LVGL utilizable desde C nativo propio | RW4 | R09 solo binding Lua | SIN EVIDENCIA | No evaluable | No | ABI/símbolos y task/UI ownership |
| 14 | Touch disponible desde C propio | RW4 | R09 solo Lua | SIN EVIDENCIA | No evaluable | No | Routing input y ciclo de vida |
| 15 | C propio lee filesystem | RW4 | No ejecución C | SIN EVIDENCIA | No evaluable | No | libc, mounts, permisos y URI/path |
| 16 | Se guardan partidas/config Doom | RW4 | R17 API Vela general | SIN EVIDENCIA | No evaluable | No | FS nativo escribible/cuotas, no probado |
| 17 | App DOOM persistente en menú normal | RW4 | Objetivo | SIN EVIDENCIA | No evaluable | No | Registro de paquete stock y relaunch |
| 18 | QuickApp lanza componente nativo | RW4 | No API de spawn hallada | SIN EVIDENCIA | No evaluable | No | Capacidad exacta; no inventar puente |
| 19 | Watchface Lua sirve como launcher | RW4 | Touch Lua R09 | INFERENCIA RAZONABLE | Baja | No | Touch da entrada UI; falta spawn/exit probado |
| 20 | DOOM cabe con sistema en RAM | RW4 | RAM comercial R04 | SIN EVIDENCIA | No evaluable | No | Heap libre y peak medidos, no tamaño WAD solamente |
| 21 | 32 MB RAM y 256 MB almacenamiento | RW4 | R04 Xiaomi dice RAM/ROM | CONFIRMADO EN RW4 | Alta documental | No | ROM comercial no storage libre; SRAM/PSRAM pendiente |
| 22 | Global M2315W1 comparte mecanismos chinos | RW4 variantes | No comparación de builds | SIN EVIDENCIA | No evaluable | No | Misma familia no asegura runtime/permisos |
| 23 | Recovery suficientemente seguro | M2315W1 | Ningún procedimiento técnico validado | SIN EVIDENCIA | No evaluable | No | Reinicio/factory reset no recuperan boot/flash corruptos |

## Loader inspeccionado: solo emulador

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| GCC 11.3.1, Cortex-A7, Thumb, hard-float | Imagen guest S3 | R41 strings de compilación | CONFIRMADO EN EMULADOR | Alta estática | Lectura ELF | No toolchain ni ISA del RW4 |
| allsyms contiene puts y 44.839 entradas | Imagen guest S3 | R41 tabla en archivo ELF | CONFIRMADO EN EMULADOR | Alta estática | Lectura acotada | No demuestra binding del loader |
| allsyms resuelve imports de nuestro módulo | Guest S3 | Falta contraste de modlib_getsymtab | SIN EVIDENCIA | No evaluable | No | No cargar para descubrir contrato |
| Init recibe mod_info y rmmod libera módulo | NuttX 12.3 referencia | R42 fuente original | INFERENCIA RAZONABLE para guest | Media | Estático remoto | Contrastar guest; no prueba RW4 |
| Init ET_REL recibe información; rmmod acepta uninit nulo y libera memoria | Guest S3 exacto | R45 desensamblado y prueba | CONFIRMADO EN EMULADOR | Alta para hello mínimo | Dos ciclos de carga/descarga | No teardown UI/timers/threads |
| C propio imprime y se descarga | Guest S3 exacto | R45 hello con puts enlazado desde su ELF | CONFIRMADO EN EMULADOR | Alta local | Mensaje ADB, lsmod y rmmod | FLAT; enlace específico de imagen, no RW4 |
| puts puede importarse normalmente por este hello | Guest S3 exacto | R45 variante import devolvió error 2 | REFUTADO en esta prueba | Alta local | Sin registro ni mensaje | No refuta todos los símbolos/mecanismos |
| Hello reconstruido produce el mismo ELF | PC y toolchain 14.3 revisados | R45 SHA256 coincidente | CONFIRMADO EN EMULADOR / build PC | Alta local | Reconstrucción y segundo ciclo | No afirmación entre plataformas |

## Display: solo emulador

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| /dev/fb0 se consulta desde C | Guest S3 | R46 inquiry y driver desensamblado | CONFIRMADO EN EMULADOR | Alta local | Query/close=0 | No evidencia física RW4 |
| RGB565, stride780, 390×450, virtual390×900, 702000 bytes | Driver Goldfish guest | R46/R47 | CONFIRMADO EN EMULADOR | Alta local | Respuestas y colores visuales | No RAM libre ni formato físico confirmado |
| Patrón C se muestra/restaura y rmmod descarga | Guest S3 activo | R46 | CONFIRMADO EN EMULADOR | Alta local | PNG idéntico y log pan/close=0 | No exclusividad del buffer ni app persistente |
| Touch y panel stock funcionan tras patrón | Guest S3 activo | R46 baseline/input posterior | CONFIRMADO EN EMULADOR | Alta local | Sin reboot entre patrón y input | Primer intento con UI OFF fue inconcluso |
| LVGL9/extensión, profundidad16, libuv y LV_USE_OS=0 | Build guest | R46 macros ELF | CONFIRMADO EN EMULADOR | Alta estática | Lectura ELF | No llamar UI desde cualquier task |
| Captura visible prueba UI activa | Emulador | R46 screen OFF previo con frame conservado | REFUTADO | Alta local | Logs y captura | Verificar estado y gesto antes de pruebas |

## Touch nativo: solo emulador

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Lector C recibe coordenadas absolutas de /dev/input0 | Guest S3 exacto | R48 | CONFIRMADO EN EMULADOR | Alta local | 36 muestras; tap y drag previstos | No prueba RW4 físico |
| Driver usa circbuf por apertura y broadcast sin grab | Guest S3 exacto | R48 desensamblado, R49 referencia | CONFIRMADO EN EMULADOR | Alta estática/local | C y UI respondieron simultáneamente | No pérdidas/latencia medidas |
| Descriptor se cierra y módulo se descarga; stock responde después | Guest S3 activo | R48 | CONFIRMADO EN EMULADOR | Alta local | close=0, lsmod vacío, captura posterior | Un ciclo, sin prueba prolongada de fugas |
| Cada DOWN de la entrada sintética es un nuevo contacto | Camino gRPC/Goldfish | R48 | REFUTADO | Alta local | DOWN repetido durante drag | Adaptador necesita estado previo |
| C creó una pantalla propia interactiva | Guest S3 | R48 únicamente logs; UI es Lua/stock | SIN EVIDENCIA | No evaluable | No | Contexto de UI/ownership pendientes |

## UI propia Lua: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Página propia recibe controles centrales sin desplazar home | Guest S3 | R50 | CONFIRMADO EN EMULADOR | Alta local | Drags en4direcciones y hold | No exclusividad universal |
| Desactivar event/gesture bubbling basta para bloquear scroll | Primera UIProbe | R50 | REFUTADO | Alta local | Arrastre abrió widgets | SCROLL_CHAIN es independiente |
| Bordes también quedan bloqueados | UIProbe corregida | R50 | REFUTADO en esta prueba | Alta local | Swipe inferior abrió panel | Reservar bordes/suspender engine |
| pageOnPause/Resume se invocan al abrir/cerrar panel | Guest S3 | R50 ELF/strings/logs | CONFIRMADO EN EMULADOR | Alta local | Ambos mensajes | No suspensión de C demostrada |
| Touch del panel también llega a página propia oculta | Guest S3, tap50,45 | R50 contador/logs | REFUTADO en esta prueba | Alta local | Sin release propio ni incremento | No prueba exhaustiva de todos los overlays |
| Watchface usa Lua5.4 y expone loadlib como función | UIProbe guest | R50 mensaje runtime | CONFIRMADO EN EMULADOR | Alta local | Tipos/versiones, sin loadlib | No carga nativa desde Lua probada |
| EXIT/reentrada funciona; seleccionar Storage cierra Lua | Guest S3 | R50 capturas/log | CONFIRMADO EN EMULADOR | Alta local | Sin reboot durante interacción | EXIT conserva launcher/objetos |

## Puente Lua ↔ C: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| loadlib existente puede importar bibliotecas C | Guest S3 exacto | R51 ELF y respuesta CLI/watchface | REFUTADO en este guest | Alta local/estática | nil, error de librerías deshabilitadas, absent | No refuta el loader C dlopen de NuttX ni todas las builds Xiaomi |
| os.execute accede a shell desde watchface | Guest S3 UIProbe | R51 | CONFIRMADO EN EMULADOR | Alta local | uname, insmod/rmmod propios; true/exit/0 | RW4 físico desconocido |
| Lua io invoca callbacks de C en nodo virtual propio | Guest S3 exacto | R51 ABI DWARF, read/write y respuestas | CONFIRMADO EN EMULADOR | Alta local | Coordenadas y contador devueltos por C | No driver físico ni worker |
| Panel pausa/reanuda estado nativo; tap50,45 no lo cambia | Guest S3, overlay ensayado | R51 snapshots | CONFIRMADO EN EMULADOR | Alta local | seq7 pausado idéntico tras tap; seq8 reanudado | No engine pausado ni overlays exhaustivos |
| EXIT descarga C; START vuelve a cargarlo sin PC entre ciclos | Guest S3 UIProbe | R51 | CONFIRMADO EN EMULADOR | Alta local | Dos ciclos, node/module ausentes al salir, contador reiniciado | Requiere preparar ELF después de reset/cleanup |
| Uninitializer rechaza descarga con descriptor abierto | Guest S3, cliente controlado | R51 CLI | CONFIRMADO EN EMULADOR | Alta local | rmmod busy; cierre y descarga posterior correctos | No concurrencia arbitraria ni errores prolongados probados |
| ELF del puente permanece instalado después de reset | /tmp en emulador | R51 mount tmpfs y staging posterior al reset | REFUTADO para esta instalación | Alta local | Reset elimina /tmp; payload retirado al terminar | Watchface Lua sí permanece; persistencia ELF pendiente |
| Cambio de watchface sin EXIT también descarga C | Guest S3 UIProbe | R52 finalizador, log, lsmod y nodo | CONFIRMADO EN EMULADOR | Alta local | Dos ciclos hacia Storage sin reboot; módulo/nodo ausentes | No implica cleanup ante crash ni compatibilidad RW4 |
| Recolección normal no descarga C activo | Guest S3 CLI | R52 collectgarbage y lectura de estado | CONFIRMADO EN EMULADOR | Alta local | Retorno normal y error controlado | Guard mantenido globalmente; VM exacta |
| Error Lua controlado cierra descriptor y descarga C | Guest S3 CLI | R52 traceback y unregister=0 refs=0 | CONFIRMADO EN EMULADOR | Alta local | Descriptor con atributo close, módulo/nodo ausentes | No prueba kill/panic/agotamiento de memoria |
| EXIT seguido de cierre Lua no repite descarga | Guest S3 UIProbe | R52 finalizer running=false | CONFIRMADO EN EMULADOR | Alta local | Un ciclo UI adicional | C sin worker ni timer |
| Crash o terminación forzada garantiza cleanup nativo | Guest S3 / RW4 | Ninguna prueba | SIN EVIDENCIA | No evaluable | No | Finalizador depende del cierre normal de VM; no provocar crash |
| LVGL muestra snapshot RGB565 generado por C en nuestra página | Guest S3 UIProbe | R53 fuente, stream, tmpfs y captura | CONFIRMADO EN EMULADOR | Alta local | 320×140; get_img_size y píxeles capturados comprobados | Snapshot estático; RW4 y backend DOOM desconocidos |
| file.f_priv está en offset20, struct file ocupa32 bytes | ELF guest exacto | R53 DWARF | CONFIRMADO EN EMULADOR | Alta estática | Inspección de definición y código compilado | No usar ABI en otro firmware |
| Stream de frame tiene cursor por descriptor, EOF y bloqueo de descarga con lector | Guest S3, clientes controlados | R53 CLI con readback | CONFIRMADO EN EMULADOR | Alta local | Dos lectores, dos fases, 89612 bytes exactos | Concurrencia arbitraria no garantizada |
| Patrón conserva touch y pausa/salida de nuestra página | Guest S3 UIProbe | R53 14 gestos y cambio a Storage | CONFIRMADO EN EMULADOR | Alta local | Dos EXIT/reentrada y un cierre sin EXIT | No animación ni engine; temporales retirados |
| Backend tmpfs es viable para DOOM | Guest S3 / RW4 | R53/R54 patrón, sin motor | SIN EVIDENCIA | No evaluable | 300 frames de patrón, no Doom | Rendimiento del motor, coste y memoria prolongada pendientes |
| Timer Lua/LVGL actualiza nuestra imagen y se pausa al abrir panel | Guest S3 exacto | R54 inspección y UI | CONFIRMADO EN EMULADOR | Alta local | 300 frames, pausa/reanudación | No reloj monotónico para Doom ni API física probados |
| Frames reutilizan dos nombres fijos en tmpfs | Guest S3 UIProbe | R54 ls/código/capturas | CONFIRMADO EN EMULADOR | Alta local | Dos archivos89612bytes; ambas fases visibles | Prueba finita, no backend definitivo |
| C invalida cache solo para nuestros slots desde el caller UI | Guest S3 exacto | R54 ELF file_write/cache y código | CONFIRMADO EN EMULADOR | Alta para contrato propio | Reutilización de slots actualiza pixels | No enforce de privilegios ni thread ID medido; op6/op7 prohibidos en CLI |
| Lua después de GC no crece durante300 frames | Guest S3, ensayo corto | R54 muestras25..300 | CONFIRMADO EN EMULADOR | Alta local | 72,405KiB desde50 hasta300 y reentrada | No pico RAM total ni ausencia de fugas prolongadas |
| Umem maxused aumenta en ensayo de frames | Guest S3 | R54 free | CONFIRMADO EN EMULADOR | Alta para observación | +134080bytes, primera muestra→300 | Causa SIN EVIDENCIA; uso actual muestreado no creció sostenidamente |
| EXIT y cierre de watchface limpian C/archivos con Timer presente | Guest S3 UIProbe | R54 snapshots/logs | CONFIRMADO EN EMULADOR | Alta local | Dos EXIT; tercer START→Storage sin EXIT | Timer firmware __gc inspeccionado; no prueba crash/kill |
| Animación garantiza recursos/memoria acotados indefinidamente | Guest S3 / RW4 | Solo ensayo300frames | SIN EVIDENCIA | No evaluable | No | Dos slots y un Timer; high-water y pruebas prolongadas pendientes |
| Controles mantenidos entregan edges C sin duplicarlos al sostener | Guest S3 UI propia | R55 cola/26 snapshots | CONFIRMADO EN EMULADOR | Alta local | Avance, diagonales, giro y FIRE | Sin motor ni ergonomía física |
| Cola de32 cancela y pausa ante overflow | Guest S3 módulo propio | R55 CLI | CONFIRMADO EN EMULADOR | Alta local | Libera4 teclas, descarta downs antiguos | Un consumidor; no contrato concurrente general |
| Pausa mientras ratón sigue pulsado deja held0 | Guest S3 UI propia | R55 HOLD TEST | CONFIRMADO EN EMULADOR | Alta local | Cancelación del mismo path de pausa | No pérdida real de foco stock durante contacto |
| Panel stock mantiene controles pausados al regresar | Guest S3 overlay ensayado | R55 seq183 estable y RESUME193 | CONFIRMADO EN EMULADOR | Alta local | Tap neutro no alteró snapshot; resume exige nueva acción | Solo overlay y gesto ensayados |
| Cierre Lua con FIRE mantenido limpia módulo | Guest S3 CLI | R55 normal/error | CONFIRMADO EN EMULADOR | Alta local | GC retiene, lua_close cancela/descarga | No panic, kill ni crash abrupto |
| Controles cómodos en muñeca / movimiento+disparo simultáneos | RW4 / prototipo | R55 sin ensayo físico | SIN EVIDENCIA | No evaluable | Un dedo debe detener movimiento para FIRE | Corona/multitouch/auto-fire pendientes |
| Foco stock durante contacto mantenido garantiza cancelación | RW4 / guest S3 | No ensayo directo | SIN EVIDENCIA | No evaluable | HOLD TEST y pausa stock son ensayos separados | No inferir garantía desde ambos |
| Guest timespec tiene16 bytes, sec64 signed y nsec32 offset8 | Guest S3 ELF exacto | R56 DWARF/disassembly | CONFIRMADO EN EMULADOR | Alta estática | Declaración C verificada y runtime pasa | No ABI M2315W1 ni newlib |
| CLOCK_MONOTONIC1 lee contador, sin sumar g_basetime | Guest S3 ELF exacto | R56 branch compilado y257 lecturas | CONFIRMADO EN EMULADOR | Alta local/estática | Sin retroceso en ensayo; valores iguales permitidos | No se cambió hora ni prueba prolongada |
| clock_nanosleep relativo suspende tarea NSH y retorna | Guest S3 | R56 19 waits y ps | CONFIRMADO EN EMULADOR | Alta local | rc0,task Waiting Signal | Interrupciones/errores no provocados |
| UI stock responde mientras otra tarea espera4s | Guest S3 Storage/panel | R56 captura y ps antes/después | CONFIRMADO EN EMULADOR | Alta local | Mismo PID aún esperando tras captura; retorno idéntico | No dormir desde callback UI ni engine integrado |
| Espera1ms ofrece precisión1ms | Guest S3, ensayos R56 | R56 medidas5,3–15ms finales; hasta17,3 previos | REFUTADO EN EMULADOR como garantía de precisión | Alta local | Tiempo solicitado distinto del real | No extrapolar jitter a hardware |
| Timeout del cliente detiene el módulo guest | Host/guest | Contrato ADB; timeout solo cliente | REFUTADO como mecanismo de parada | Estático | No watchdog guest | No unload antes de retorno confirmado |
| DG_GetTicksMs/DG_SleepMs integrados con Doom | Guest S3 / RW4 | Ningún motor compilado | SIN EVIDENCIA | No | APIs candidatas probadas separadamente | Scheduling/coste/salida pendientes |

## Correcciones de interpretación

| Claim | Scope | Evidence | Classification | Tested locally | Notes |
|---|---|---|---|---|---|
| Preset RW4 demuestra emulación 1:1 M2315W1 | Emulador/RW4 | R10 | REFUTADO | No | Autor identifica origen S3 |
| Debug oficial QuickApp sirve automáticamente para RW4 | RW4 | R20 | REFUTADO como afirmación de soporte documentado | No | No se declara impossibilidad de todo RPK en RW4 |
| Nombre `/data/tmp.log` prueba que Lua puede escribir | Ejemplo TouchEvents | R09 | REFUTADO como prueba | Estático remoto | Variable sin I/O |
| RAM-only implica sandbox | NuttX general | R27/R28 | REFUTADO | No | Carga kernel/FLAT puede afectar todo el sistema |

No se ha refutado la posibilidad final de DOOM con firmware stock. Tampoco se ha demostrado.

## Archivos C R57: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| off_t signed64, size_t unsigned32, O_RDONLY1 | Guest S3 ELF exacto | R57 DWARF/macros/disassembly | CONFIRMADO EN EMULADOR | Alta estática/local | C con tipos verificados pasa | No ABI RW4 o newlib |
| C lee archivo propio completo en tmpfs | Guest S3 | R57 bytes y checksum | CONFIRMADO EN EMULADOR | Alta local | 1048613 bytes,2049 chunks | No storage persistente ni WAD |
| C lee por posición, con tres orígenes y EOF | Guest S3 | R57 41 ventanas/offsets | CONFIRMADO EN EMULADOR | Alta local | Nueve bordes y32 posiciones deterministas | Solo fixture propio |
| lseek conserva palabra alta de posición | Guest S3 tmpfs | R57 SET/CUR a 2^32+7 | CONFIRMADO EN EMULADOR | Alta local | Retorno y restore0 | Sin lectura allí ni archivo4GiB |
| Errores ENOENT/EBADF/EINVAL se reciben desde C | Guest S3 | R57 cuatro errores controlados | CONFIRMADO EN EMULADOR | Alta local | Captura inmediata errno | No fallos de disco/agotamiento |
| Dos aperturas tienen cursores independientes y reopen inicia0 | Guest S3 | R57 read/seek/close | CONFIRMADO EN EMULADOR | Alta local | Posiciones777/333, reapertura byte165 | Sin concurrencia arbitraria |
| Fixture queda intacto y módulo/temporales se retiran | Guest S3 | R57 SHA256,lsmod,ls | CONFIRMADO EN EMULADOR | Alta local | Cleanup sin reboot | No prueba de UI activa ni crash cleanup |
| Stdio del lector WAD de doomgeneric funciona | Guest S3 / RW4 | R57 prueba POSIX distinta de stdio | SIN EVIDENCIA | No evaluable | No | fopen/fread/fseek/fclose siguientes |
| Archivo C persiste tras reset | Guest S3 / RW4 | R57 solo tmpfs | SIN EVIDENCIA | No evaluable | No | Persistencia C/WAD pendiente |

## Stdio R58: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| fseek/ftell usan long32; FILE puede tratarse opaco | Guest S3 exacto | R58 DWARF/wrappers/probe | CONFIRMADO EN EMULADOR | Alta estática/local | Sin dereferenciar FILE | No layout/ABI RW4 |
| Stdio lee por byte y posición con buffers | Guest S3 tmpfs | R58 datos/FNV/ftell | CONFIRMADO EN EMULADOR | Alta local | Archivo1048613 bytes,41 ventanas | No WAD ni engine enlazado |
| Secuencia de M_FileLength preserva posición buffered | Guest S3 | R58 longitud/restore/reread | CONFIRMADO EN EMULADOR | Alta local | saved13,length1048613,restore13,next19 | Secuencia propia, no función del engine compilada |
| fread devuelve elementos completos cuando size mayor que1 | Guest S3 | R58 size4/3 y EOF | CONFIRMADO EN EMULADOR | Alta local | Retorna9 de10 con37 bytes,13 de13 con39 | No cobertura general de libc |
| fseek exitoso limpia la marca EOF | Guest S3 exacto | R58 feof después de seek | REFUTADO EN EMULADOR | Alta local/estática | Retorna0,feof1; relectura13 pasa | No inferir comportamiento RW4 |
| clearerr limpia EOF sin mover la posición | Guest S3 | R58 consulta flags/ftell | CONFIRMADO EN EMULADOR | Alta local | EOF0/error0/position13 | ferror de lectura no provocado |
| Streams independientes/reopen/cierre y cleanup funcionan | Guest S3 | R58 dos streams/tres reopen | CONFIRMADO EN EMULADOR | Alta local | Fixture intacto,unload/tmp ausentes,sin reboot | No crash cleanup ni ausencia de fugas prolongadas |
| doomgeneric_Tick siempre retorna sin esperar | doomgeneric upstream fijado | R58 TryRunTics llama I_Sleep en espera | REFUTADO como garantía | Alta de fuente | Inspección remota, no compilación | No ejecutar en callback UI sin resolver scheduling |
| Creación/parada/recogida de worker C están validadas | Guest S3 / RW4 | R58 solo initializer NSH | SIN EVIDENCIA | No evaluable | No | Siguiente checkpoint, ABI pendiente |

## Worker C R59: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| pthread_t signed32 y trampoline permite retorno del worker | Guest S3 exacto | R59 DWARF/wrappers/runtime | CONFIRMADO EN EMULADOR | Alta estática/local | Tres create/join con cookies | No ABI ni mecanismo RW4 |
| Worker C puede parar cooperativamente y recogerse | Guest S3 NSH | R59 tres ciclos finitos | CONFIRMADO EN EMULADOR | Alta local | Stop61/47ms, natural124ms observados | No latencias garantizadas ni cancelación forzada |
| UI stock responde con worker propio vivo | Guest S3 Storage/panel | R59 captura y ps antes/después | CONFIRMADO EN EMULADOR | Alta local | Mismo pthread55 en ambas muestras | No UI caller ni carga de Doom |
| Uninit devuelve EBUSY mientras join está pendiente | Módulo propio/NSH | R59 llamada directa a su gate | CONFIRMADO EN EMULADOR | Alta para contrato propio | Tres rc=-16 | No rmmod concurrente durante init |
| Hilos propios desaparecen y C se descarga sin reboot | Guest S3 | R59 cookies/done/ps/lsmod | CONFIRMADO EN EMULADOR | Alta local | Tres join0, PIDs ausentes, ELF retirado | No crash cleanup/parent exit probado |
| Atomics32 propios no necesitan helper externo | Payload Cortex-A7 guest | R59 disassembly/imports | CONFIRMADO EN EMULADOR | Alta estática/local | Loads/stores/DMB, sin atomic imports | No stress/SMP o cola input/frame concurrentes |
| Worker puede ejecutarse después de init y controlarse desde launcher | Guest S3 exacto | R60 START/EXIT desde UI28 tras init NSH | CONFIRMADO EN EMULADOR | Alta local | Workers149/248/312 | R59 recogía antes de init; RW4 sigue SIN EVIDENCIA |
| Fallo de join conserva módulo ocupado en runtime | Módulo propio | R59 rama revisada, no provocada | INFERENCIA RAZONABLE del contrato | Estática | No | No anunciar recovery validado |

## Launcher/worker R60: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| START crea C en grupo de la UI tras retornar init | Guest S3 exacto | R60 snapshots/ps/lsmod | CONFIRMADO EN EMULADOR | Alta local | Owner28, init148/247 ausentes, workers149/248 | No proceso aislado ni ABI RW4 |
| Detach/stop/PID ausente permiten EXIT sin join/sleep UI | Módulo propio/guest | R60 source/disassembly/marcadores | CONFIRMADO EN EMULADOR | Alta para ensayo | Dos reason1, unload0, refs0, PIDs ausentes | APIs usan locks; no latencia máxima garantizada |
| Panel pausa contador C y permite volver al launcher | Guest S3 | R60 captura/snapshots/ps | CONFIRMADO EN EMULADOR | Alta local | Worker149 vivo, steps52→52, resume0 | No motor ni input/frame concurrentes |
| Loader rechaza descargar módulo con worker vivo | Módulo propio/guest | R60 os.execute rmmod y estado posterior | CONFIRMADO EN EMULADOR | Alta local | Una invocación rechazada con error | No estrés de open/unload arbitrario concurrente |
| Cierre Lua pide stop sin descargar código activo | Watchface propia/guest | R60 cierre a Storage | CONFIRMADO EN EMULADOR | Alta local | Worker312 reason1/live0; módulo retenido | Crash/kill/fallo detach no probados |
| Reentrada puede recoger módulo retenido sin comando host | Watchface propia/guest | R60 launcher-reentry | CONFIRMADO EN EMULADOR | Alta local | Timer/uninit0/Ready: exited | C en tmpfs, no persistencia nativa |
| Un script extraído más corto puede conservar cola anterior | Guest S3/extractor | R60 derivado16765 vs fuente5064, error línea105 | CONFIRMADO EN EMULADOR | Alta local para observación | Backup/reemplazo/readback exacto corrigen | Punto interno responsable no aislado; instalador nuevo completo sin runtime |
| Worker/launcher del emulador funcionan en M2315W1 | RW4 físico | Ninguna prueba/ABI/recovery específico | SIN EVIDENCIA | No evaluable | No | Gate físico cerrado |
## Frames desde worker R61: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Worker detached produce frames visibles en LVGL | Guest S3 exacto | R61 result/observations | CONFIRMADO EN EMULADOR | Alta local |12 capturas completas,44800 píxeles cada una | Patrón propio, no Doom ni RW4 |
| Dos slots conceden un buffer exclusivo por lector | Contrato propio/guest | R61 fuente/CAS y reader-result | CONFIRMADO EN EMULADOR | Alta local/estática | Dos lectores, frames54/55 exactos, tercero rechazado, split/EOF | No stress/SMP ni FD compartido |
| Saturación omite producir sin sobrescribir lectores | Contrato propio/guest | R61 slots/blocked y readbacks | CONFIRMADO EN EMULADOR | Alta para ensayo | blocked136/92 en binario final, frames coherentes | No timing/realtime garantizado |
| Cache-drop se limita al owner UI | Contrato propio/guest | R61 check nxsched_gettid y presentación | CONFIRMADO EN EMULADOR | Alta estática/local | Caller permitido pasa, worker no llama LVGL | Rechazo desde caller erróneo no inyectado |
| Panel pausa producción y EXIT retira worker/imágenes | Guest S3 | R61 dos ciclos y state | CONFIRMADO EN EMULADOR | Alta local | steps149/produced46 estables, dos EXIT finales | Pausa cooperativa, no cobertura exhaustiva de gestos |
| Cierre Lua conserva código/caches hasta reentrada UI | Watchface propia/guest | R61 close/reentry/final | CONFIRMADO EN EMULADOR | Alta local | Worker374 ausente antes de unload, GC sin LVGL | Crash/kill no probados |
| Presupuesto finito termina y UI recoge módulo | Guest S3 | R61 own-markers worker242 reason2 | CONFIRMADO EN EMULADOR | Alta para observación | Término natural del primer candidato, no repetido en final | No hard watchdog ni60s garantizados |
| Metadatos sequence/cycle se leen sin carrera de datos UI/NSH | Contrato propio R61 final | atomic_uint/disassembly y regresión | CONFIRMADO EN EMULADOR | Alta estática/local | Mismos10 imports, barreras,12 capturas finales | No implica snapshot transaccional ni stress general |
| BSS del payload ocupa179312bytes | ELF propio R61 | readelf/build fijado | CONFIRMADO EN EMULADOR | Alta estática | Dos buffers89612 más estado | No RAM total/pico ni budget RW4 |
| Update repara derivado y refresh puede evitar reset | Installer/guest S3 | R61 backup/readback/result | CONFIRMADO EN EMULADOR | Alta local | Modo wframe propio inactivo, módulos ausentes | Rama nueva R60 ya ejercitada en R61; no actualización de stock |
| Worker consume controles mantenidos de R55 | Guest S3 exacto (R62) | R62 runtime/source | CONFIRMADO EN EMULADOR | Alta local |38 observaciones/22 edges | R61 probaba frames; RW4 físico sigue SIN EVIDENCIA |
| Frames/worker/native launcher funcionan en RW4 | M2315W1 físico | Ninguna ABI/runtime/recovery específicos | SIN EVIDENCIA | No evaluable | No | No extrapolar del emulador |
## Input de worker R62: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Hilo C consume controles mientras produce imágenes | Guest S3 exacto | R62 snapshots/log gettid/frame | CONFIRMADO EN EMULADOR | Alta local | Workers439/791,22 key edges,4 imágenes completas | No Doom/DG_GetKey ni RW4 |
| Mantener no repite presses; release/slide cambian acciones | UI/contrato propio | R62 changes/consumed/key_events | CONFIRMADO EN EMULADOR | Alta local | changes1/keys1 mientras steps50→90 | Un dedo; movimiento+FIRE UI pendiente |
| Ring32 saturado cancela y no restaura acciones antiguas | Contrato propio SPSC/guest | R62 finite UI burst/epochs | CONFIRMADO EN EMULADOR | Alta para ensayo |32 aceptadas, overflow1, requested/applied/queued0 | No stress/SMP ni productor múltiple |
| Pausa confirma neutral antes de resume | UI/worker S3 | R62 HOLD TEST y panel | CONFIRMADO EN EMULADOR | Alta local | Ratón down, epoch/ack3; panel epoch/ack4 | Foco real stock con dedo apoyado no probado |
| Panel puede abrir desde margen libre inferior | Prototipo S3 | R62 capture y counters | CONFIRMADO EN EMULADOR | Alta local | y440, steps373/produced115 estables | y410 cae dentro de MOVE/PRESS_LOCK y no abrió panel |
| STOP con FIRE aún pulsado libera tecla y retira C | Módulo propio/S3 | R62 held-stop/final markers | CONFIRMADO EN EMULADOR | Alta local | Worker885 down1→down0, uninit neutral | Stop cooperativo NSH, cache/unload desde UI; no kill |
| Cierre Lua y reentrada conservan/recogen código e imágenes | Watchface propia/S3 | R62 close/reentry/final | CONFIRMADO EN EMULADOR | Alta local | Worker968 retirado antes de unload | No crash cleanup ni código persistente |
| BSS179620bytes/imports10/79 ABS32 | ELF propio R62 | Build/readelf exactos | CONFIRMADO EN EMULADOR | Alta estática | Entry0xf1d y payload8436bytes revisados | No RAM total/pico física |
| Native input/display funciona en M2315W1 | RW4 físico | Ninguna ABI/runtime/recovery específica | SIN EVIDENCIA | No evaluable | No | Gate físico cerrado |

| doom1.wad shareware 1.9 distribuible bajo condiciones id | Datos PC | [Copyright Debian con aclaración Carmack](https://metadata.ftp-master.debian.org/changelogs/non-free/d/doom-wad-shareware/doom-wad-shareware_1.9.fixed-5_copyright) | Evidencia documental; no clasificación de dispositivo | Alta documental | Archivo local4196020, MD5/SHA1 contrastados | No GPL/assets comerciales; sin WAD en Git ni firma verificada |
| C lee WAD completo/1264entries/16resources | S3 emulado exacto | [R63](native-wad-emulator.md), native-wad-1791133863026 | CONFIRMADO EN EMULADOR | Alta local | Checksums PC iguales, EOF,close,unload/cleanup | No motor, lectura worker, persistencia ni RW4 |

|80C originales doomgeneric compilan para ARM | Host/toolchain14.3, target compileaudit S3 | [R64](doom-build-audit.md), build/doom-audit/result.json | Confirmado build local; sin runtime | Alta local | Objeto425928bytes/50imports sinresolver | No engine ejecutado ni compatibilidad RW4 |
|6MiBzone y256000DGbuffer a320x200 | Fuentes doomgeneric fijadas | i_system.c, doomgeneric.c R64 | Confirmado en fuente; no RAM medida | Alta documental |525351bytes estáticos antespadding | No presupuesto de RAM libre M2315W1 |
| I_Quit upstream retorna/exitfatal y posibleswrites requieren port | Doomgeneric original, ORIGCODEoff | R64 i_system/m_config/g_game | Confirmado por inspección fuente | Alta local | Sin ejecutar esas rutas | No detener worker medianteexit directo |

## Runtime R65: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| malloc/free y formato variádico utilizables desde worker propio | Guest S3 exacto | [R65](doom-runtime-emulator.md), assembly y ocho ciclos | CONFIRMADO EN EMULADOR | Alta local | Calloc/realloc/strdup/log 1.5 pasan | No ABI ni RAM física RW4 |
| Salida local limpia reservas y FILE opacos | Shim propio, S3 | R65 return/quit/error/stop/OOM/invalidfree | CONFIRMADO EN EMULADOR | Alta local | Cero blocks/streams, join0, unload sin reboot | No sandbox, crash recovery ni engine I_Error probado |
| Escrituras y shell del engine están interpuestos | Port propio | Runtime/header imports y denials R65 | Confirmado por fuente/build y prueba local | Alta para contrato | 7 denials/ciclo; fixture intacto | No aislamiento frente a corrupción de memoria |
| Motor compila con headers propios y salida adaptada | Build ARM R65 | Objeto435288bytes/39imports pendientes | Confirmado build local; sin runtime | Alta local | Build e inspect-shim pasan | DG6/17biblioteca sin completar; no cargar objeto |
| Salida limpia de Doom real o ejecución en M2315W1 | Engine/hardware | Ninguna ejecución del motor | SIN EVIDENCIA | No evaluable | No | Runtime pequeño no demuestra estabilidad del motor |

## Primer frame R66: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| DOOM original ejecuta E1M1 y renderiza320x200 | Guest S3 exacto | [R66](doom-first-frame-emulator.md), log/PNG/bufferFNV | CONFIRMADO EN EMULADOR | Alta local | Worker210,imagen original inspeccionada | No UI guest/input/FPS/RW4 |
| Motor se retira limpiando recursos propios | Port R66/S3 | Quit local+join+stats/rmmod/ps | CONFIRMADO EN EMULADOR | Alta para ensayo |13reservas/2streams limpios,WADintacto,sin reboot | No stop externo/crash/juego continuo |
| Pico tracked del motor6582961bytes | Shim propio | R66 stats malloc | CONFIRMADO EN EMULADOR | Alta para contador |13blocks pico | No RAM total;secciones/stack/libc/tmpfs aparte |
| Loader admite4THM_CALL locales autorrecursivos | Guest S3 exacto | up_relocate0x65c668/tipo10 y carga R66 | CONFIRMADO EN EMULADOR | Alta para esos4 |6900ABS32+4THM_CALL cargados | No branches externos ni RW4 |
| Doom jugable/persistente en M2315W1 | RW4 físico | Ninguna ABI/runtime/recovery física demostrada | SIN EVIDENCIA | No evaluable | No | Primer frame S3 no cambia el gate físico |

## Motor interactivo R67: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Motor original visible dentro de página Lua/LVGL | Guest S3 exacto | [R67](doom-ui-emulator.md), PNG/stream/copias | CONFIRMADO EN EMULADOR | Alta local |64000 píxeles comparados,167 colores |320×200 RGB565; no framebuffer global directo |
| Avanzar/girar/disparar llegan al gameplay original | Doom/E1M1 en S3 | R67 posición/ángulo/ammo y ocho edges | CONFIRMADO EN EMULADOR | Alta local | Munición50→47; tics progresan | Un dedo; ergonomía física/simultáneo MOVE+FIRE pendientes |
| Menú pausa motor y RESUME recupera progreso | Port propio S3 | R67 dos muestras congeladas y posterior progreso | CONFIRMADO EN EMULADOR | Alta para ensayo | Tic/posición/ángulo/ammo/drawn iguales mientras pausado | No foco stock mantenido probado con motor |
| Dos STOP/unload/reload restauran sesión sin reboot | Port propio S3 | R67 workers104/408, stats/ps/lsmod/nodos | CONFIRMADO EN EMULADOR | Alta local |13alloc/free por ciclo, streams0, posiciones/ammo50 restaurados | No crash/kill/errores pthread probados |
| Persistencia Doom en la instalacion historica R67 | S3 /tmp; RW4 sin ensayo | R67 ELF/WAD solo tmpfs, retirados | SIN EVIDENCIA en R67 | No evaluable | Dos sesiones sin reset | Actualizada para emulador por R73 debajo; RW4 pendiente |
| Port cabe en RAM disponible de M2315W1 | RW4 físico | Sin RAM libre/ABI específicas | SIN EVIDENCIA | No evaluable | Pico motor6582961 en S3, secciones793228 aparte | Excluye stack/Lua/cache/loader/tmpfs |
| Presentación fluida/FPS físico | RW4/S3 | Timer200ms,13 produced/2534ms | SIN EVIDENCIA para fluidez/físico | Alta para contador S3 |89tics/178callbacks; sin contador de presentaciones | Transporte inicial≈5 imágenes/s; callbacks no son FPS |
| Panel/entorno normal operativos después de Doom | Guest S3 | Capturas post-EXIT panel/Ajustes/Storage | CONFIRMADO EN EMULADOR | Alta local | Normal seleccionado sin reboot | Panel durante ejecución del motor pendiente |

## Foco y STOP R68: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Abrir panel pausa el motor original | S3/Doom E1M1 | [R68](doom-focus-emulator.md), snapshots/PNG/log | CONFIRMADO EN EMULADOR | Alta para flujo | Tic86 y resto de estado congelados; worker vivo | Acción neutral antes de abrir |
| Tocar zona neutra stock no llega al motor | S3, panel x50/y45 | R68 counters/keys/posición | CONFIRMADO EN EMULADOR | Alta para ese punto | Sin edges ni progresión | No garantía para todos los widgets/notificaciones |
| Volver del panel exige RESUME | UI Lua propia/S3 | R68 PAUSED y posterior tic96→157 | CONFIRMADO EN EMULADOR | Alta local | No auto-resume, keys0 | No implementación física RW4 |
| STOP con FIRE down retira motor/módulo antes de release | Port propio/S3 | R68 NSH op2, pointer down, ps/lsmod/nodos/log | CONFIRMADO EN EMULADOR | Alta para ensayo |13alloc/free,streams0,reason1,uninit0,sin reboot | No kill/unload host ni emergencia física demostrados |
| Foco stock perdido con acción aún mantenida | M2315W1/S3 | No se abrió panel manteniendo acción | SIN EVIDENCIA | No evaluable | No | No confundir con STOP mantenido |
| Cierre sin EXIT con Doom y reentrada (estado historico R68) | Port S3 | Solo probado entonces con transporte R62 | SIN EVIDENCIA en R68 | Historica | No en R68 | Resuelto posteriormente por R69 debajo; nunca extrapolar a RW4 |

## Cierre y reentrada R69: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Cambiar de watchface sin EXIT detiene Doom original | Port propio S3/E1M1 | [R69](doom-close-emulator.md), close retained/finish/ps | CONFIRMADO EN EMULADOR | Alta para ciclo observado | Worker104 ausente; reason1,13alloc/free,streams0,cleanup0 | Cierre normal Lua; no crash/kill probado |
| Cierre conserva modulo y copias hasta reentrada | Port propio S3 | R69 lsmod y dos copias128012bytes/header | CONFIRMADO EN EMULADOR | Alta local | Modulo residente, motor retirado, Storage activa | Retencion deliberada; sin sandbox |
| Reentrar recoge modulo/caches/copias sin EXIT ni reboot | UIProbe propia/S3 | R69 uninit0/unloaded/ps/nodos/PNG | CONFIRMADO EN EMULADOR | Alta para flujo | Un START, cero EXIT; no unload host; launcher Ready | Final Storage y tmp retirados; no persistencia Doom ni compatibilidad RW4 |

## Presentacion e input R70: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Pipeline UI entrega fuente a LVGL en1,48ms media | UI instrumentada S3 | [R70](doom-performance-emulator.md),33trazas os.clock | CONFIRMADO EN EMULADOR | Alta para ensayo | P951,70ms/max2,90ms | No incluye finalizacion de render/flush |
| Timer200ms limita ritmo de entregas actual | UI propia S3 | Intervalos205,30ms media/4,87entregas/s | CONFIRMADO EN EMULADOR | Alta para build actual |32intervalos | Reducir intervalo puede mejorar; rendimiento50ms pendiente |
| Giros muestran alrededor de5cambios visibles/s | Capturas de display S3 |75PNGs/area RGB320x200/hashes | CONFIRMADO EN EMULADOR | Alta para cambios observados | Derecha5,08/izquierda4,57 | Cota inferior, ventanas cortas; no FPS exacto ni RW4 |
| os.clock mide tiempo transcurrido en guest inspeccionado | ELF S3 exacto | R70 disassembly os_clock/clock/up_timer_gettick y dos llamadas | CONFIRMADO EN EMULADOR | Alta local | Delta0,4495s tras espera400ms+ADB | No CPU time Lua portable; no evidencia RW4 |
| Handler y confirmacion posterior de input son medibles | Port/UI S3 | R70 cuatroedges y dos giros procesados | CONFIRMADO EN EMULADOR | Alta para muestras | Handler0,30-0,60ms; UI observa29,70-151,30ms | Observacion incluye Timer; host incluye RPC/ADB; no touch-a-foton |
| Timer50ms alcanza20FPS reales | S3/RW4 | R70 sin aplicar; R71 entrega17,45fuentes/s y observa cambios inferiores | SIN EVIDENCIA para20FPS | No evaluable para FPS exacto |50ms probado en R71 | No extrapolar entrega de fuente/capturas a scanout o hardware |

## Mejora a50ms R71: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Reducir Timer200 a50ms aumenta entregas3,58x | UI propia S3 instrumentada | [R71](doom-50ms-emulator.md),119trazas y comparison.json | CONFIRMADO EN EMULADOR | Alta para ensayo |17,45entregas/s, intervalo57,31ms media | No flush completion ni20FPS demostrados |
| Mismo muestreo observa mas cambios visibles durante giros | Captura area320x200 S3 |75PNGs/RGB-hashes, mismo sampler que R70 | CONFIRMADO EN EMULADOR | Alta para ventanas observadas | Derecha13,55/izquierda12,67cambios/s | Cotas inferiores; muestreo max80ms puede perder imagenes |
| Motor mantiene ritmo, pausa y EXIT limpio a50ms | Port original E1M1/S3 | R71 snapshots y finish/uninit/ps | CONFIRMADO EN EMULADOR | Alta para ciclo corto |221tics/6327ms, pausa400ms,13alloc/free,streams0,cleanup0 | C/ELF intactos, sin reboot; no sesiones largas ni RW4 |

## Sesion90s R72: solo emulador

| Claim | Scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Doom sigue operativo90s a50ms | E1M1/port S3 | [R72](doom-stability-emulator.md), diez snapshots y capturas | CONFIRMADO EN EMULADOR | Alta para sesion |90164ms/3156tics/1571produced,1580submitted totales | No horas ni FPS exacto del display |
| Giro/FIRE siguen respondiendo durante sesion | UI propia/S3 | R72 control30/70s, angle/ammo y releases | CONFIRMADO EN EMULADOR | Alta para acciones observadas | Ammo50 a47, inputs neutrales, HP100 | No ergonomia/corona/RW4 |
| Cache y archivos no crecen durante muestras0-90s | S3 guest | R72 free y ls -l /tmp | CONFIRMADO EN EMULADOR | Alta para muestras | Cache1363384 fijo; dos imagenes128012bytes | Muestreo discreto, no garantiza estado entre muestras |
| Heap global no muestra crecimiento continuo en20-90s | S3 guest | Ocho free snapshots R72 | CONFIRMADO EN EMULADOR para rango observado | Alta local |30850584-31114016; neto+1760bytes | No leak freedom; post-EXIT+666920 sin causa aislada |
| EXIT limpia recursos propios despues90s | Port/UI S3 | R72 finish/uninit/ps/nodos y final | CONFIRMADO EN EMULADOR | Alta para ciclo |13alloc/free,streams0,cleanup0, worker116 ausente | Sin host unload/reboot; crash sin garantia |

## R73: persistencia limitada al guest S3

| Claim | Device | Evidence | Status | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| ELF/WAD permanecen en /data despues de reset | Emulador S3 exacto | R73 install/readback/reset/verify | CONFIRMADO EN EMULADOR | Alta local | Si, SHA256 iguales | No demuestra firmware/FS M2315W1 |
| Launcher recarga Doom despues de reset sin push de assets | UIProbe/S3 | R73 workers1032/468, E1M1/FIRE/EXIT | CONFIRMADO EN EMULADOR | Alta local | Si | No significa jugar sin PC; emulador alojado en PC |
| EXIT elimina C/temporales conservando assets instalados | S3 | R73 logs13alloc-free/streams0/cleanup0, nodes/PID/tmp ausentes | CONFIRMADO EN EMULADOR | Alta para flujo | Si | Crash/kill/corrupcion FAT no probados |
| EXIT o panel durante copia cancelan antes de native load | UIProbe/S3 | R73 parcial65536bytes; logs y ausencia C/tmp | CONFIRMADO EN EMULADOR | Alta local | Si | Panel observado2s sin START; GC durante copia sin ensayo especifico |
| FNV1a autentica un ELF | Algoritmo launcher | Checksum32bits sin clave | REFUTADO | Alta por diseno | No necesario | Host revisa SHA256/origen; FNV solo identidad accidental |
| Persistencia/loader/privilegios equivalentes en M2315W1 | RW4 fisico | Ninguna prueba especifica obtenida por R73 | SIN EVIDENCIA | No evaluable | No | No transferir ELF/direcciones S3 |

## R74: instalacion y evidencia stock

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Diez sources Lua RW4 contienen prueba de shell/loader | RW4 ejemplos fijados | R74 busqueda de patrones y17Git blobs | REFUTADO para estas muestras | Alta estatica | Auditoria PC | Ausencia de llamadas no refuta disponibilidad API fisica |
| MiWatchNativeApps contiene target nativo RW4 | Repo a392529 | R74 tree no truncado: S3/MB10 Pro | REFUTADO para esa revision | Alta estatica | No ejecucion | Firmware/header S3 no portable sin contrato RW4 |
| Gadgetbridge reconoce RW4 y ofrece ruta Xiaomi watchface | Coordinator RW4/mirror2024 | R74 source y ficha actual experimental | INFERENCIA RAZONABLE como instalador candidato | Alta para existencia; baja para unidad | Solo sources | Auth key local requerida; firmware/retirada no validados |
| Paquete propio es candidato para parser watchface Gadgetbridge | .face local24744bytes | R74 magic/ID numerico coinciden con subset Java source | INFERENCIA RAZONABLE | Alta para subset, compatibilidad completa desconocida | Header PC, sin ADB | No Java runtime, firma, preview ni acceptance real; IDraw167210065 |
| QuickApp oficial disponible libremente para RW4 global | RPK/firmware fisico | FAQ ofrece debug mediante contacto comercial | SIN EVIDENCIA | No evaluable | No | Feature table o docs generales no prueban C/WASM/instalacion en unidad |
| Usuario informa lectura de version2.2.86 en su unidad | M2315W1 comunicado | Lectura manual Ajustes informada2026-10-04 | CONFIRMADO EN RW4 | Alta para dato informado | No por agente | No identifica NuttX/region/ABI ni loader |

## R75: telefono/app y fuentes de retirada

| Claim | Device / scope | Evidence | Classification | Confidence | Tested locally | Notes |
|---|---|---|---|---|---|---|
| Usuario utiliza Android/Mi Fitness3.59.1i | Telefono del usuario | Informado2026-10-04 | INFERENCIA RAZONABLE para perfil operativo | Alta como dato comunicado | No por agente | Firma/origen/importacion local sin verificar |
| RW4 tiene reboot forzado y gestion/eliminacion watchfaces documentados | RW4 general | R75 FAQ Xiaomi KA-228897/KA-228715 | CONFIRMADO EN RW4 | Alta documental | No | No recovery de firmware corrupto ni ensayo en2.2.86 |
| Custom de Mi Fitness permite importar cualquier Lua/ELF | RW4/3.59.1i | FAQ custom describe foto/estilo, no importacion | SIN EVIDENCIA | No evaluable | No | No llamar oficial a instalacion propia |
| Logs de3.59.1i contienen auth key utilizable sin root | Telefono/Android concreto | Gadgetbridge reporta metodo generico dependiente de version | SIN EVIDENCIA | No evaluable | No | Sin logs obtenidos; no publicar claves |
| Hay importacion local/Debug visible en el menu revisado de Mi Fitness | Instalacion Android3.59.1i del usuario | R76: usuario solo ve online y guardadas en reloj | REFUTADO para el menu observado | Alta como observacion comunicada | Por usuario, no agente | No demuestra ausencia en otras versiones ni mecanismos internos; ruta directa descartada por ahora |
| Carpeta de logs accesible con .device.log y backups .bak | Telefono del usuario/Mi Fitness3.59.1i | R77: inspeccion manual comunicada | INFERENCIA RAZONABLE para viabilidad de diagnostico local | Alta como observacion comunicada | Por usuario, no agente | Contenido/clave/asociacion no verificados; comprobador probado solo con datos ficticios |
| Copias locales contienen un candidato de32hex en encryptKey/token | Logs privados de instalacion del usuario | R78 comprobador propio:4archivos,1con candidato,1valor distinto | INFERENCIA RAZONABLE como candidato de autenticacion | Alta para coincidencia sintactica; asociacion/uso desconocidos | Si, PC; solo recuentos en salida | No confirma clave RW4 vigente ni autenticacion; sin valores/hashes/lineas publicados ni conexion fisica |
| Candidato aparece junto a etiqueta RW4 | Copias de logs del usuario | R79:5lineas con candidato y etiqueta,0asociaciones JSON mismo objeto | INFERENCIA RAZONABLE de asociacion | Alta para coincidencia de linea; identidad/vigencia desconocidas | Si, comprobador PC con salida privada | Cercania no prueba pertenencia de clave ni autenticacion; no conecto reloj |
| APK local es package Gadgetbridge0.94.0/code253 con firma/digest Android v2 validos en caso soportado | APK para telefono, no RW4 | R80 manifiesto/JDK/inspector Node y tamper tests, [reporte](gadgetbridge-apk-review.md) | INFERENCIA RAZONABLE de candidato instalable de origen esperado | Alta local para contenido firmado; comportamiento desconocido | Si, solo PC estatico | Cert coincide metadata relacionado de publisher; no apksigner completo, source/build exactos o writes init auditados, APK no ejecutado |
| Conectar Gadgetbridge0.94.0 solo autentica/lee | Source seleccionado distribuido por F-Droid, ruta RW4 | R81 onAuthSuccess/initialize envian perfil8/0, unidad10/10, calendario12/1 y hora2/3 condicional | REFUTADO para flujo de codigo revisado | Alta estatica; efectos firmware desconocidos | Si, source PC; sin runtime | Desactivar hora/calendario no elimina todos los envios; calendario disabled=true sigue enviando comando |
| Coordinator RW4 de0.94.0 selecciona SPP/BT_CLASSIC y es experimental | Source RW4 especifico | R81 RedmiWatch4Coordinator.java39-52 | INFERENCIA RAZONABLE de ruta para unidad | Alta para seleccion en cliente | Si, lectura PC | No prueba funcionamiento2.2.86 ni que reloj carezca BLE |
| Politica propia permite solo handshake1/26,1/27 y GET2/1,2/2 con payload acotado | Codigo Java propio en PC | R82 test-android-diagnostic-policy.mjs y fixtures sinteticos | INFERENCIA RAZONABLE para futura integracion | Alta para contratos probados; ninguna para runtime Android/RW4 | Si, javac/java | No prueba filtro de transporte completo, APK ni efectos firmware |
| EnR82 variante Android limitada estaba compilada y lista para conectar | Vista previa de fuentes Gadgetbridge0.94.0 | R82 generador cinco fuentes/cuatro diffs, androidCompilationPerformed=false | SIN EVIDENCIA enR82 | No evaluable | No | Resultado historico; R86 compila APK pero sigue sin conexion autorizada |
| Gate de WriteAction rechaza cola vencida y cierre antes de escribir | Codigo generado de variante en PC/socket falso | R83 test-android-diagnostic-queue.mjs, politica/session tests | INFERENCIA RAZONABLE para integracion Android | Alta para componente probado | Si, javac/java con stubs | No prueba cola Android real, escritura ya iniciada, cierre del socket ni servicio global |
| ZIP de SDK CLI/Gradle coinciden con hashes de distribuidores y lanzan herramientas | PC Windows, no RW4 | R83 hashes oficiales y versions exit0; [build](android-build.md) | INFERENCIA RAZONABLE de toolchain preparada | Alta local | Si | Falta plataforma37/buildtools36; sdk-list IO falla, no APK compilado |
| Paquete SDK solicitado para API37/minor0 es platforms;android-37.0 | Catalogo Google en cache SDK del PC | R84 repository2-4.xml: API37.0/revision2/canal0; nombre sin .0 ausente | INFERENCIA RAZONABLE de dependencia correcta | Alta para catalogo observado | Si, lectura XML | Corrige script propio y doctor; no APK ni compatibilidad RW4 demostrados |
| SDK37.0 y Build Tools36 instalados en PC | Toolchain Android, no reloj | R85 doctor/files source.properties despues instalacion usuario | INFERENCIA RAZONABLE de dependencias SDK presentes | Alta local | Si, read-only | API37.0/revision2/Preview0; no compilacion APK exitosa |
| Build falla antes de compilar Android por acceso al JAR/ZipFS en esta sesion | Windows/JDK21.0.7/Gradle9.7.1 | R85 stacktrace y probe propio aislado, [reporte](android-build.md) | INFERENCIA RAZONABLE de restriccion del contexto de ejecucion | Alta para fallo; causa global desconocida | Si, PC | toRealPath y cierre ZIP denied pese a readable=true; pendiente comparacion con PowerShell del usuario |
| Primer APK propio de diagnostico compila y tiene firma v1/v2 verificada | PC Android build, no reloj | R86 user build SUCCESS6m28s/73tasks, SDK apksigner exit0/aapt2/inspectorNode, [reporte](android-build.md) | INFERENCIA RAZONABLE como artefacto candidato | Alta para build/identidad/firma; runtime desconocido | Si, PC; no APK ejecutado | Debug local/no publisher,72permisos heredados, alcance/globalreconnect pendientes; gate cerrado |
| Variante R87 declara nueve permisos y un servicio habilitado | Fuentes Android generadas, no APK nuevo | R87 XML parseado y [generador](../tools/prepare-android-diagnostic.mjs) | INFERENCIA RAZONABLE para nuevo build | Alta para fuente; merge sin probar | Si, XML PC | Los 72 permisos pertenecen al APK R86 anterior; no confundir archivo fuente con APK instalado |
| Un ticket manual solo permite un intento por proceso, ligado al destino | Java propio en PC | R87 [AttemptTest](../experiments/android-diagnostic/Rw4DiagnosticAttemptTest.java), expiración/replay/12 consumidores concurrentes | INFERENCIA RAZONABLE para integración Android | Alta para clase probada; Android pendiente | Si, javac/java | No sustituye límites de sesión/transporte; proceso nuevo necesita otro toque, nunca autoarranca una conexión |
| Registro de RW4 R87 no conecta ni crea bond; fábrica exige bond existente | Fuentes Gadgetbridge modificadas | R87 DiscoveryActivityV2/DeviceSupportFactory/GBDeviceService/DeviceCommunicationService, [reporte](android-build.md) | INFERENCIA RAZONABLE para variante | Alta para rutas revisadas; unidad desconocida | Si, lectura PC; no Android | Guarda DB/clave en teléfono; si no hay bond previo, detener ruta y revisar alternativa. No probar compatibilidad 2.2.86 por coordinator |
| Segundo APK-r87 compila y restringe permisos/componentes tras merge | Artefacto Android en PC | R88 BUILD SUCCESSFUL2m41s, inspector/aapt2/apksigner oficial exit0, [reporte](android-build.md) | INFERENCIA RAZONABLE como candidato Android | Alta para compilación/manifiesto/firma; runtime desconocido | Si, PC; no instalación | Diez permisos=9previstos+interno signature AndroidX, solo servicio diagnóstico habilitado/noexportado. No demuestra autenticación2.2.86 ni ausencia de efectos firmware |
| Bienvenida permite entrar sin registrar reloj y carga dispositivos de DB privada | Fuente cliente Android/variante-r87 | R89 WelcomeFragmentGetStarted, DeviceHelper.getAvailableDevices y proxy GBDeviceService; [plan](android-offline-test.md) | INFERENCIA RAZONABLE para primera apertura | Alta para rutas revisadas; runtime desconocido | Si, lectura PC | log_to_file/TRACE false por defecto; receiver dinámico DeviceManager sigue presente, no conecta por sí mismo. No afirmar aislamiento probado |
| Bundle de prueba offline conserva hash/firma del APK revisado | PC, preparación local | R89 prepare-android-offline-test.mjs y readback SHA del APK copiado | INFERENCIA RAZONABLE como artefacto para teléfono | Alta para copia/identidad; runtime desconocido | Si, PC | Sin ADB/build/descargas ni instalación. Aprobación manual de teléfono pendiente, gate del reloj cerrado |
| APK-r87 conservaba binding NotificationListener aunque deshabilitado | Manifiesto binario del APK propio, no reloj | R92 reinspección y test-android-diagnostic-manifest.mjs con SHA bf95f228...975fd2 | INFERENCIA RAZONABLE para causa del bloqueo reportado | Alta para declaración; causa Play Protect no confirmada | Si, PC, lectura APK | Google asocia el aviso descrito con permisos sensibles; auditoría de diez uses-permission no bastaba. Fuente-r92 elimina componente completo, nuevoAPK pendiente |
