# Inventario del PC

Observación local 2026-10-02 mediante comandos PowerShell de lectura; no se instalaron herramientas. PowerShell rechazó posteriormente ejecutar `setup.ps1`; los datos de abajo proceden de comandos inline previos, no de ese script.

| Elemento | Resultado |
|---|---|
| Windows | Build 26200.9457, DisplayVersion 25H2, 64 bits |
| Interpretación de versión | Windows 11 25H2 por build; ProductName del registro conserva Windows 10 Home |
| PowerShell | 5.1.26100.9444, Desktop |
| Arquitectura proceso | AMD64 |
| Git | 2.49.0.windows.1 |
| Node | v22.14.0 |
| .NET | `dotnet.exe` en Program Files; SDKs no inventariados |
| WSL | `wsl.exe` presente; `wsl --status` devuelve E_ACCESSDENIED; distros/WSL2 desconocidos |
| VS Build Tools | `vswhere.exe` no encontrado en ruta estándar; `cl` ausente en PATH; instalación no demostrada |
| CMake/Ninja/Make | No encontrados en PATH |
| Python/py | No encontrados en PATH; `python --version` no disponible |
| ADB | No encontrado en PATH ni en búsqueda de archivos relevantes bajo Documents/Devs |
| ARM toolchains | arm-none-eabi-gcc / arm-linux-gnueabihf-gcc no encontrados en PATH |
| Otros C compilers | clang / gcc / cl no encontrados en PATH |
| 7-Zip / tar | 7z ausente en PATH; tar de Windows presente |
| Disco C | 511,041,335,296 bytes total; 231,070,617,600 libres al medir (~215.2 GiB) |
| RAM host | No obtenida; Win32_OperatingSystem via CIM devuelve acceso denegado |
| Política de scripts | Efectiva Restricted; los cinco scopes Undefined; `.ps1` rechazado; sin modificaciones |
| Paquete emulador local | No encontrado; usuario confirma que no lo descargó |

Microsoft asigna build 26200 a [Windows 11 25H2](https://learn.microsoft.com/en-us/windows/release-health/windows11-release-information). No identificar la versión solo mediante ProductName o `Environment.OSVersion`.

Falta en PATH no significa ausencia de toda instalación. No instalar ARM/CMake/WSL antes de conocer la arquitectura guest y el mecanismo de build. Evitar `wsl --install`, instaladores y cambios de política solo por completar una lista de herramientas.

Los cuatro clones fallaron al conectar a GitHub HTTPS. El navegador/conector sí pudieron consultar fuentes. Detalles resumidos en [acquisition.json](evidence/acquisition.json). No se solicitó ni se obtuvo excepción para la red.
