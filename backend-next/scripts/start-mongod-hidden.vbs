Set WShell = CreateObject("WScript.Shell")
rem Sustituir los mismos valores que en start-mongod.cmd
WShell.Run "%SERVIDOR_MONGO%\mongod.exe --config %DIRECTORIO_USER%\.mongo\mongod.cfg", 0, False