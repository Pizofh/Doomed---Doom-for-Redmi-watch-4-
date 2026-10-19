# R398: reenvio autorizado y comprobacion de persistencia

El usuario autoriza: «ok. pasa la nueva entonces y mira la persistencia».
UNA repeticion desde cero del mismo paquete R397, sin nuevo payload C/Lua.
Se conserva R396013 y el historial firmado del primer envio. No hay borrados,
seleccion ni START desde PC, reanudacion ni otro reintento automatico.

Paquete1071020B/SHA256
cb16a5de71ab9f9fb0c8c0678d2e2cb0fa1cd1f2050690a8620055388f536d2e,
ID365220014,524 partes. Reutiliza el WAD instalado; no se envia el juego.
Siguen los riesgos revisados de flash, bloqueo/corrupcion o reinicio, sin
recuperacion integral validada. La causa de la ausencia tras reiniciar no
esta identificada. Este protocolo mide persistencia; no promete corregirla.

## Limites del reintento

Opcion explicita install-after-registration-loss. Journal existente autentico,
mismo destino/clave/paquete, primer intento RegisteredInactive completo,
524 partes escritas y sin repeticion previa. Se anade intento2 al MISMO journal;
no se borra ni se reinicia su historial. Solo permite este tipo de paquete.
El catalogo actual debe contener los mismos IDs y flags que el original,
sin014 y con013; puede cambiar la seleccion del usuario. Conserva esa seleccion.
Ante error de preflight o envio se consume el intento y se detiene.

Tras registro inactivo inicial: tres consultas adicionales separadas por2s,
sin perder anteriores ni activar la nueva. Son cuatro observaciones, no prueba
de durabilidad. Se cierra el transporte, se restauran gates y recompila cerrado;
una nueva conexion de SOLO LECTURA comprueba013 y014 otra vez.

Si014 sigue presente, pedir UN reinicio normal manual, sin START ni borrados,
y consultar nuevamente. Si falta antes/despues del reinicio, detenerse y
registrar el punto exacto; no reenviar otra vez. Si persiste, identificar la
nueva en el selector y continuar el ensayo manual R397 ya autorizado. No migrar
el WAD hasta que el usuario pulse START en014. No borrar013 hasta validar.

## Pruebas locales

19 casos nuevos: journal ausente/alterado/otra identidad/combinacion de modos,
catalogo con colision o miembros cambiados, un segundo intento sin tercero,
historial original conservado, seleccion actual respetada, perdida transitoria
del registro detectada y cierre del transporte. Envio IPC completo524 partes y
cuatro consultas.18 casos anteriores de reintento,23 de transporte, paquete
R397 y gates cerrados pasan. Sin nuevo ELF ni prueba VM del motor necesarios.


## Resultado del reenvio

UN despacho completado: RegisteredInactive524/524, cuatro observaciones del
registro, sin readback de contenido ni seleccion/START. Gates restauradosfalse
y worker recompilado cerrado; transporte cerrado y worker0, sin nativeError.
Historial del primer intento conservado como prefijo del mismo journal firmado.

Nueva conexion independiente de SOLO LECTURA: Complete,11 entradas,013 y014
presentes e inactivas, seleccion personal actual conservada. Ningun ID previo
perdido. La seleccion cambio legitimamente desde la consulta anterior; no se
intento restaurar013 como activa. Un chequeo local auxiliar supuso erroneamente
que013 seguiria activa; se corrigio comparando con el preflight del intento2,
sin nueva operacion fisica. Ambas consultas conservan la seleccion correcta.

Se pidio al usuario reinicio normal, sin abrir Doom ni borrar nada. PENDIENTE
consulta posterior al reinicio. Todavia no esta validada la persistencia ni
los controles R397 en hardware. No hay permiso para un tercer envio.


## Persistencia tras reinicio confirmada

El usuario comprobo ambas antes y despues de reiniciar normalmente: siguen las
dos. Consulta independiente de SOLO LECTURA posterior: Complete,11 entradas,
013 presente/inactiva,014 presente/activa, todos los IDs/flags previos retenidos.
Transporte cerrado, worker0, sin transferencia de archivos. La seleccion de014
fue manual o del firmware, nunca del cliente PC. No se atribuye una causa a la
primera desaparicion: el segundo envio con espera y reconexion persistio en
ESTE reinicio; no demuestra que la espera sea la correccion necesaria.

Ahora corresponde el ensayo manual R397 previamente autorizado: START, cargar
partida, armas/controles/menu/pausa y SALIR->CLOSED; solo si funciona, segundo
arranque breve y CLOSED. Pregunta corta enviada; sin cifras normales solicitadas.
R397 aun no esta aceptada funcionalmente hasta recibir el resultado. Conservar013.


## Resultado funcional del usuario

El usuario confirma que todo el protocolo salio bien: partida, armas y ambos
arranques/cierres. R397014 pasa a ser la version funcional vigente, con sus datos
migrados propios. No se requiere mantener013 como dependencia del juego.

Quedan defectos fisicos de uso: MENU/PAUSA sobre el juego demasiado transparentes,
dificiles de localizar y a veces requieren varias pulsaciones. ARMA-/+ funciona
bien. El audio sigue entrecortado. Jugar con un solo boton limita especialmente
la sierra; controles simultaneos siguen siendo una prioridad del usuario.
No declarar corregidos estos problemas ni presentar esta version como final.

Revision local de UI confirma zonas MENU92x30 y PAUSA112x30 arriba, fondo35%;
PAUSA usa CLICKED, MENU usa PRESSED/RELEASED. Esto orienta la revision de contraste,
areas tactiles y eventos, pero no identifica aun por que se pierden pulsaciones.
La viabilidad multitactil conserva los limites R353/R371: no hay una ruta fisica
verificada de dos contactos independientes, y autofire/toggles siguen rechazados.
No nuevo payload ni envio autorizado por esta respuesta de resultados.
