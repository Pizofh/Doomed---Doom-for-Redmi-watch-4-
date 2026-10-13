# R205/R206 — funciones externas, solo PC

2026-10-13. FirstC2 ya ejecutó C mínimo en M2315W1/2.2.86. Ahora buscamos
cómo C puede llamar una función del sistema para emitir un mensaje. No hubo
otro módulo cargado ni operaciones con reloj/teléfono/Bluetooth. Gates cerrados.

## Entradas y reproducción

Misma imagen privada de [R193](firmware-analysis-r193.md): `vela-ap-inspection-only.bin`,
6.636.408 bytes, SHA256 `2c486395a01fb4e1d4a0f8b9b749fd6b1c3d522edc3c2f3813deaea9ab7388db`.
Se verifica también objdump oficial revisado de Arm14.3, SHA256
`ff61beda5538d78c2ff41d05ff6f694dc96f02ddb75f8db0a5936d995437cda1`.
Imagen tratada como datos, sin ejecución o distribución en Git. Procedencia
y autenticación conservan los límites de R193.

Desde la raíz del proyecto, con esas dependencias locales ya verificadas:

```powershell
node tools/research-rw4-exports-r205.mjs
node tools/research-rw4-export-selection-r206.mjs
```

Reportes privados: `artifacts/research/rw4-exports-r205/` y
`artifacts/research/rw4-export-selection-r206/`. Rechazan sobrescribirlos;
no hace falta repetir para continuar desde los resultados guardados.
R205 busca literales, nombres NUL exactos y llamadas Thumb BL; verifica dos
instrucciones conocidas antes de buscar. R206 coteja anclas del arranque,
busca MOVW/MOVT y guarda contexto de nombres; verifica un MOVW independiente.
Datos pueden parecer instrucciones: los candidatos requieren revisión.

## Hallazgos

Los offsets son de archivo, no instrucciones para llamar funciones en el reloj.
Correspondencias de dirección R194 solo sirven para grupos inspeccionados;
no constituyen un mapa completo ni un header de APIs.

| Hallazgo | Evidencia estática | Límite |
|---|---|---|
| Loader intenta resolver imports por nombre | `0x1e7e64–0x1e7f3a`: búsqueda en módulos, luego getter/lookup | Ningún import ensayado en hardware |
| Getter compatible con modlib_getsymtab | `0x1e7f48`: lock, lee globals, copia a salidas, unlock | Identificación por flujo/upstream, sin símbolos debug Xiaomi |
| Lee tabla y cantidad de 0x3c1aef98 / 0x3c1aef94 | Literales `0x1e7f74` / `0x1e7f78` | No valores físicos de RAM leídos |
| Lookup compatible con symtab_findbyname lineal | `0x1ef738`: compara nombre, avanza8bytes; caller usa valor +4 | Tabla seleccionada en runtime desconocida |
| Ambos globals pertenecen a región puesta a cero al arrancar | `0x9fc`; BSS `[0x3c1aada0,0x3c2daa00)` | Otros componentes podrían escribirlos después |
| Getter no inicializa una tabla por fallback | Flujo completo inspeccionado | No prueba ausencia de inicialización en toda la plataforma |
| Sin otro literal exacto de los globals ni MOVW con low16 ef94/ef98 | Un literal por dirección, ambos en getter; cero candidatos MOVW exactos | Bases/desplazamientos, otras imágenes y escrituras indirectas pueden escapar |
| printf/usleep encontrados son entradas NSH | `0x77e60` / `0x77fc0`, estructura comando/handler/min-max/uso | Comando de shell no demuestra export C |
| Hits revisados fopen/fread son mensajes de error | fopen literal `0x220b6c` usado por vtable NSH; fread `0x241c98` después de error de stream | Funciones internas existen; esos nombres no dan imports |

Búsqueda de vecindario:134 literales, muestra128 marcada truncada. **No es
recuperación exhaustiva de referencias**. Cero nombres exactos puts/syslog/write/
memcpy/modlib_setsymtab tampoco prueba ausencia de funciones. `gettimeofday`
tiene otra estructura todavía sin clasificar; no se usa como dirección callable.

Primer intento R206 rechazó el vecindario por superar128; se cambió a contar
todos y guardar una muestra explícitamente truncada. No se generó reporte parcial
ni hubo cambio en firmware. El análisis final pasó anclas/hashes y disassembly.

## Fuente primaria de contraste

NuttX12.3.0, commit `8fdb56b5f2124de351a48125a252ba4264665e3d`:

- [modlib_symtab.c](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/libs/libc/modlib/modlib_symtab.c): getter/setter y fallback opcional.
- [symtab.h](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/include/nuttx/symtab.h): entrada nombre/valor y contrato.
- [symtab_findbyname.c](https://github.com/apache/nuttx/blob/8fdb56b5f2124de351a48125a252ba4264665e3d/libs/libc/symtab/symtab_findbyname.c): búsqueda lineal u ordenada según configuración.

Los dos últimos se leyeron con GitHub tras fallar el navegador; blob SHA
`19d43a8203592f3134ae74b903a25266ce5db3d0` y
`7efa80c5ead6c4fc6a839d466bc5f54b6225ac97`.
Referencias de interpretación, **no código exacto Xiaomi**: no deducir config,
FLAT/PROTECTED/KERNEL o SDK compatible solo por similitud.

## Resultado y siguiente checkpoint

**Sin tabla de APIs RW4 verificada para imports normales todavía.** Arranque
a cero y getter sin fallback son compatibles con selección inicial vacía:
inferencia estática, no tabla vacía permanente demostrada. No se refuta C con
APIs, Doom o libc. No se compiló Doom RW4 ni un nuevo hello de logging, ni se
midió RAM.

Siguiente meta solo PC: rastrear el puente Lua/nativo y su resolución de
funciones para identificar una API de logging utilizable. Preferir imports o
puente existente con contrato comprobado; no usar direcciones absolutas por
nombres/tablas sin clasificar, instalar una symtab propia en el sistema o
cambiar firmware. Un payload físico posterior requiere su paquete/plan/revisión.
