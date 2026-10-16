# R324: cierre de lectores y retirada de Image

Inspección estática acotada del AP fijado; no firmware ejecutado, nuevos
bindings, pruebas físicas o modificación de los paquetes instalados.
Herramienta reproducible: `review-rw4-image-lifetime-r324.mjs`, modos fijos
sin argumento, follow, finish y core. Ventanas y referencias privadas en
`artifacts/research/image-lifetime-r324*`, ignoradas por Git.

## Ruta de archivo identificada

Se resolvió el veneer5b4658 al registro de filesystem4488c. El caller33faa
registra un driver con letra `/` y cache_size0, con callbacks open33f28,
close33f18 y read33efc. Coincide con el primer carácter de nuestro src
`/dev/rw4doomimage.png`, según el selector44374. No es el driver de recursos
empaquetados registrado en5f914c: aquel usa descriptores compartidos y cierre
vacío intencionado. No atribuir ese cierre vacío al nodo virtual de Doom.

Read33efc llama al read POSIX mediante64e14, copia el retorno a bytes_read y
traduce negativo a error12. Close33f18 llama al cierre POSIX mediante64fac,
pero luego retorna0 incondicionalmente. Por tanto el nivel LVGL puede ocultar
un error del cierre nativo; no prueba que haya ocurrido en el reloj.

El file_close4942f4 ya revisado llama fops.close antes de limpiar f_pos/inode/
f_priv. No respalda la hipótesis de que ese dispatcher borre el cookie antes
de invocar nuestro callback. No se verificó cada consumidor/duplicado de fd.

## Ruta Lua de delete identificada

Se diferenciaron cinco métodos llamados delete por sus tablas vecinas:
group, animación, objeto, style y timer. El de objeto es5dff8c (tabla19a3e0),
junto a set_style/align_to/clean/parent. No confundirlo con delete de Timer.
Procesa referencias Lua/eventos y, si el flag de propiedad del userdata+4
está activo, llama mediante5b42f8 a la eliminación nativa1f404. La rama nativa
llama1f234 directamente. Si el flag no está activo, esa llamada se omite.

Esto establece una ruta directa para objetos propios, no que cada Image
física tuviera ese flag ni que todos los recursos de decoder se retiraran.
No hay evidencia suficiente para presentar una espera arbitraria entre
delete y command7 como solución del fallo físico.

## Implicación para el puente

R323 ya distingue write7/errno16 de open y confirma una Image320x200 previa.
Faltan contadores del callback C: aperturas/cierres correctos, rechazo de
cookie, fallo de read/seek y referencias activas. Esos datos permitirían
distinguir una lectura fallida seguida de cierre omitido, un close rechazado
que LVGL oculta, u otra referencia viva. No basta con conocer el retorno del
widget ni repetir command7. No forzar referencias a cero ni descargar C
mientras haya lectores. No se preparó otro payload ni se afirma causa raíz.
