# Siguiente checkpoint: comandos al puente C residente

Base R262: read32/EOF/close/identidad key64/retorno pasan físicamente. Dejar de
repetir diagnósticos del registro. Siguiente trabajo PC: adaptar el cliente para
el módulo ya residente y probar una transacción limitada de control, sin cargar
otro ELF o retirar el módulo automáticamente.

Contrato existente de `core-r229.h`: request24bytes LE, magic0x52573449/version1/
seq/op/held/reservado0; respuesta32bytes magic0x52573441/version1/estado/status.
La callback write de R234 es el próximo comportamiento no probado físicamente.
Abrir el nodo existente en `r+b` evita solicitar creación/truncamiento; usar
handle separado `rb` para snapshot, close explícito después de cada operación,
sin mezclar write/read en un update-stream o necesitar seek.

Propuesta PC para un lote acotado: START; INPUT1/STEP; INPUT2/STEP; INPUT4/STEP;
INPUT8/STEP; INPUT0; PAUSE; RESUME; STOP.13comandos, cada ACK exacto; final esperado
seq13/phaseSTOPPED/held0/steps4/edges5/status0. Estado inicial cero obligatorio.
Esto valida controles/step del puente, no gameplay o motor DOOM. Sin Timer,
loops indefinidos, drivers físicos o hilo C; la máquina solo cambia su RAM.

Antes de hardware: implementación/fixtures, errores de write/flush/ACK/close,
límites/cancelación y plan de STOP. No ignorar write incierto, repetir comandos
sin ACK o enviar STOP con estado/secuencia desconocidos. Precisar qué recuperación
acotada puede autorizarse; cierre incierto impide más I/O. C permanece cargado.

START actual solo acepta IDLE; STOP no rearma una segunda sesión. No improvisar
RESET, rearmar marcas o unload/reload para repetir: ciclo de vida sigue requiriendo
un plan específico. Nueva prueba física necesitará revisión concreta; no se
ejecuta ni instala nada bajo este documento. Read-only R262 no autoriza write C.
