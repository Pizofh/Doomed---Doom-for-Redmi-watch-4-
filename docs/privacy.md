# Privacidad al publicar

MAC, claves de autenticación actuales y anteriores, seriales y logs privados
permanecen en `tools/local/` y `artifacts/`, fuera de Git. No copiar sus valores
a documentación, mensajes de commit, issues o salidas de CI. Los informes solo
muestran categorías, rutas de archivos de código y recuentos.

Antes de publicar, `tools/audit-git-publish.mjs` recorre los blobs alcanzables
del historial Git completo. En el PC compara su contenido con claves, MAC
en formatos compacto/colon/guion e identificadores encontrados en los perfiles
locales y copias de logs de Mi Fitness, incluidos candidatos antiguos. También
rechaza rutas de datos privados/binarios excluidos y algunos patrones de tokens
y claves privadas. No imprime valores ni hashes de los secretos. Los datos
privados de referencia no se guardan en el script o en GitHub.

En este checkout está activado el hook `.githooks/pre-push`, que cancela el push
si falla la auditoría o faltan los perfiles privados actuales. El hook no se
activa automáticamente en otros clones; su instalación local es:

```powershell
git config --local core.hooksPath .githooks
node tools/audit-git-publish.mjs --require-private
```

CI ejecuta la auditoría con el historial completo, pero sin los archivos
privados del PC: allí comprueba rutas y patrones genéricos. No puede comparar
contra secretos locales que nunca se le proporcionan. Ninguna de estas
comprobaciones constituye un detector completo de datos sensibles; no omitir
la revisión del diff ni saltarse el hook con `--no-verify`.

Comprobación del 2026-10-15: 294 commits publicados revisados contra 46 archivos
privados locales; seis representaciones sensibles distintas comparadas, sin
coincidencias. No se copiaron esos archivos ni sus valores al repositorio.
