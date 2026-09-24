@echo off
rem Inicia la instancia MongoDB del equipo (puerto 27018) de forma visible.
rem Sustituye <SERVIDOR_MONGO> por la ruta a tu mongod (ej. C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe).
rem Sustituye <DIRECTORIO_USER> por la carpeta del usuario (ej. C:\Users\tuUsuario).
"%SERVIDOR_MONGO%\mongod.exe" --config "%DIRECTORIO_USER%\.mongo\mongod.cfg"