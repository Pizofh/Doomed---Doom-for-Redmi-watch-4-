# ADR 0002: enlace del hello C a la imagen exacta del emulador

Fecha: 2026-10-03. Estado: aceptado exclusivamente para el experimento PC.

El loader ET_REL y su lifecycle se contrastaron con el ELF guest. La carga de un hello con import `puts` terminó con error 2 antes de registrar el módulo. La presencia de allsyms no proporcionó resolución automática en esa prueba.

Para demostrar ejecución C mínima, enlazar únicamente `puts` desde los símbolos del ELF exacto del guest, conservando la ISA/bit Thumb, y exigir su SHA256 antes de build/carga. Usar el loader stock del emulador, sin modificarlo. No trasladar direcciones de otro firmware. El hello no crea recursos que requieran uninitializer propio.

Consecuencia: evidencia válida de ejecución y descarga en esta imagen, con una dependencia explícita del firmware. No resuelve portabilidad, app launcher, separación de memoria ni compatibilidad RW4. Investigar APIs y exports estables antes de generalizar el backend. No justifica jailbreak o modificación del reloj.

Alternativa posterior: identificar un mecanismo de imports soportado o usar una build abierta de Vela con exports definidos; esa build sería otro entorno y no evidencia de ejecución stock M2315W1. [Resultados](../hello-native-emulator.md).
