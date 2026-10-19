# R391–R393: reducir la espera de LOADING

Usuario pide revisar la carga lenta y aclara que ocurre principalmente en
LOADING. Autoriza desarrollo local; aún NO autoriza esta instalación física.
R390/monstruo010 sigue aceptado. No instalar hasta permiso explícito nuevo.

## Medida y causa

El arranque actual lee/descomprime el WAD completo14.604.584B y calcula su
CRC, además de la verificación CRC por página del lector. Antes del título
vuelve a leer recursos durante doomgeneric_Create. Perfil C del worker,
S3 emulado/modelado, dos rondas intercaladas baseline/candidato:

| Variante | Verificar (ms) | Crear motor (ms) | Suma (ms) |
| --- | --- | --- | --- |
| Baseline R391 |2721|4210|6931|
| Candidato R392 |98|3978|4076|
| Baseline R391 |2728|4219|6947|
| Candidato R392 |90|3978|4068|

Promedios6939→4072ms,41,3% menos en este tramo del arranque. NO es medición
del reloj, CHECKING, carga ELF, primera migración ni todo el tiempo hasta
presentar el primer frame. No prometer ese porcentaje físico ni mayor FPS.
Informe build/doom-load-r391/startup-result.json. Inicialmente rw4_printf no
produjo salida observable; se corrigió SOLO el perfil para exportar tiempos
por coordenadas del título. Los tiempos medidos pertenecen a esa segunda
serie; R393 de producción no contiene esa instrumentación.

## Cambio concreto y conservación de verificaciones

Comprobar secuencialmente todo el archivo comprimido6.531.369B contra tamaño
y CRC3504688683, en vez de inflar14,6MB antes de jugar. También se conservan
cabecera/índice/estructura/identidad esperados, y CRC de cada página una vez
descomprimida antes de entregar sus bytes al motor. No usar recibos persistidos,
no saltar comprobaciones en aperturas posteriores. Es integridad CRC, no una
garantía criptográfica de autenticidad.

Reutilizar input64KB del lector, sin heap ni buffers grandes nuevos. Abrir
mediante el runtime para que la cancelación cooperativa cierre el cursor
registrado. Sondear stop entre lecturas; errores/EOF prematuro/tail/CRC/seek
fallan antes de crear motor. Un fclose fallido conserva cuarentena existente.
Verificación de bloques/raw sigue igual durante juego; audio/touch/render,
partidas y permisos de escritura del motor no cambian.

## Paquete de producción revisable

DoomQuick, título DOOM II/mismo monstruo, ID365220011/rw4doomii393.
911252B SHA7ba43cf9f908b5d6b573899e6f03336090ffb3c7d421a55e9fb687a57a21c18b;
77 recursos propios, sin WAD. ELF632284B
SHA44593b1c736d7fd8e1fb056643476f8bfb4264c719f683b53fc923c365d8fbfc.
Lua31210B SHA89ab20e76490437a1d2487aaa69950169b03649fa966476a6a3fe3d03f0669f2.
Residencia1897868B (+160B frente R390); mínimo derivado/redondeado permanece
7036928, bloque4194320. No rebajar guard ni ampliar zone/cache.
Build flag --doom2-load-r393; perfil temporal --doom2-load-profile-r391 y
--doom2-load-fast-r392 son solo evidencia local, sin instalación preparada.

Importador probado R388/R390 retargeteado010→011: primero copiar bancos
válidos con CRC/readback, luego rename del WAD, conservando bancos originales.
Después011 independiente y010 ya no puede iniciar juego. No abrir010 tras
migrar; no eliminarla hasta aceptar partida/CLOSED nuevos. Icono y tamaño306/Y30
se conservan. No WAD resend, sobrescritura de ID existente ni borrados por PC.

Evidencia local:12 escenarios nativos del verificador/runtime (CRC alterado
en payload y cabecera tras open, EOF, ferror positivo, seek inicial/final,
tail extra, lecturas cortas, cierre fallido/cuarentena, cancelación, tamaño
retornado imposible, bueno; NULL/callback y lectura IWAD después del scan).
Cero streams/heap pendientes por caso, cancelación cierra archivo registrado.
Dos expectativas iniciales del fixture se corrigieron para respetar semántica
preexistente: rw4_exit no-cero es reason3 y fclose fallido mantiene cuarentena.
No se cambiaron las guardas de producción para satisfacer esos tests.

R393 exacto: dos ciclos nativos/menú/MAP01/guardar/cargar/carga desde título,
27 boot/UI,43 importador y rename real/readbackWAD, paquete77/tamper6/446IPC/
dependencia010/reintentos bloqueados, transporte23 y gates aprobados.
No prueba acústica, campaña completa ni nuevo ensayo físico.

## Protocolo físico pendiente de aprobación

UNA instalación inactiva pequeña; UN START manual, con batería≥50%, reloj
junto PC, Mi Fitness cerrado y observación. Conservar010 hasta ensayo.
Gates general/QUICK/C#Large solo durante despacho, readiness vacío antes de
privados, journal quick-r393 exclusivo, finalmente gatesfalse/rebuild. No
retry/resume/SET/autostart/reenvío WAD ni borrados; fallo consume intento.

Seleccionar DOOM II del monstruo nueva, START1 y mantener CHECKING despierto.
Primera migración puede añadir espera en CHECKING: comparar específicamente
LOADING→título. Probar cargar partida, breve juego y SALIR≤60s→CLOSED. ERROR:
no repetir/reabrir/borrar, recoger GATE/CODE; si imagen sobre menús, reinicio
normal y habitual. Tras éxito, usuario puede quitar010 y mantener solo011.

Se pide permiso por regla inicial de cada payload nuevo. Cambiar verificador
C/lecturas y migrar datos conserva riesgo de bloqueo/corrupción/reinicio;
recuperación integral/pérdida de energía siguen sin validar.
