# R211 — NSH > no capturó el hello C en S3

2026-10-13, solo emulador. El hello S3 anterior, ya revisado y ejecutado,
se invocó desde Lua os.execute como insmod redirigido a un archivo tmpfs propio.
Se reutilizó su ELF1020bytes, SHA256
`125cc7167fb0ae27c6c598504e0604c679e838ea5c8eb781e8c56b4f34559008`,
con guest SHA256 `849a04f6d461938022ffb820143f870be7e91933b3fb538d009b24c7fa6098fa`.
No se cargó el candidato ARMv8-M/direcciones RW4 en ese guest Cortex-A7.

Resultado: archivo0bytes; mensaje nativo presente en salida del caller. El
módulo propio fue observado y retirado; inventario real restaurado exactamente,
todos los archivos/directorio tmpfs propios retirados. No cambios de esfera,
reboot, teléfono/Bluetooth o reloj físico.

[Script fijo](../tools/test-native-stdout-redirect-r211.mjs), reporte privado
artifacts/emulator/stdout-redirect-r211/summary.json. Rechaza repetir sobre un
reporte existente, modifica solo fixture nueva en tmpfs y usa hashes/readback
y verificación de ownership del emulador. Comando de reproducción en entorno
limpio con dependencias anteriores ya revisadas:

```powershell
node tools/test-native-stdout-redirect-r211.mjs
```

Se refuta la captura automática por NSH > **en este S3**; no todas las formas
de redirección ni la build física RW4. La prueba motivó usar salida C directa
a archivo propio para un carrier posterior, sin otro ensayo físico para esa
suposición. No es evidencia de C RW4, FS nativo RW4 o recovery físico.
