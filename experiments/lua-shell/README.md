# Lua shell — gate cerrado

Experimento separado de TouchEvents. No hay prueba de `os.execute()` en M2315W1 ni en un guest local. Primero identificar runtime y disponibilidad de la función sin llamarla. Si se demuestra, una futura llamada debe limitarse a inspección de solo lectura en el emulador y registrar return codes, permisos y stdout. No instalar persistencia ni usar drivers. No contiene código ejecutable en esta fase.
