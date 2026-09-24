# LookBy — Guía para levantar todo en OTRA PC (paso a paso)

Con esta guía cualquier persona puede dejar corriendo en su PC **todo el software**: la web, la API y la base de datos MongoDB propia, conectados entre sí, sin necesidad de ayuda adicional.

```
Arquitectura:
  Navegador  →  Web (puerto 8443)  →  API (puerto 3000)  →  MongoDB (puerto 27018)
```

---

## 0) Requisitos

- Windows 10 u 11.
- Espacio en disco: ~4 GB (Node, MongoDB, dependencias y datos).
- Internet para descargar e instalar.
- **No hace falta ser administrador** con el método de MongoDB de esta guía.

---

## 1) Descargar el proyecto (Git)

1. Instala **Git** desde https://git-scm.com/download/win (siguiente, siguiente...).
2. Abre **PowerShell** o **Terminal de Windows**.
3. Escribe:

```
git clone -b backend-next https://github.com/DeibyCF-dev/LookBy-React.git LookBy
cd LookBy
```

El proyecto queda en `C:\Users\TuUsuario\LookBy` y contiene:

| Carpeta | Qué es |
|---|---|
| `LookBy` (raíz) | La **web** (frontend React, puerto 8443) |
| `LookBy\backend-next` | La **API** (Next.js, puerto 3000) |

> La rama importante es `backend-next`: ahí están tanto la web como la API nueva.

---

## 2) Instalar Node.js

1. Descarga **Node.js LTS** (botón verde "LTS") desde https://nodejs.org.
2. Instálalo: siguiente, siguiente, siguiente (acepta todo por defecto).
3. Verifica en la terminal:

```
node -v
```

Debe decir algo como `v22.x.x` (≥ 20.6). El instalador trae `npm` incluido.

---

## 3) Instalar MongoDB (versión portátil, sin permisos de admin)

1. Ve a https://www.mongodb.com/try/download/community
2. Elige: **Windows** · **8.0** (o el 8.x más reciente) · formato **zip** (NO msi).
3. Extrae el zip. Debe quedar un `mongod.exe`. Muévelo a `C:\Mongo\bin` (crea la carpeta `C:\Mongo`).
   - Resultado esperado: `C:\Mongo\bin\mongod.exe`
4. Crea la carpeta de datos: `C:\Mongo\data`
5. Crea el archivo de configuración `C:\Mongo\mongod.cfg` con **exactamente** este contenido:

```
storage:
  dbPath: C:\Mongo\data

systemLog:
  destination: file
  logAppend: true
  path: C:\Mongo\mongod.log

net:
  port: 27018
  bindIp: 0.0.0.0

security:
  authorization: enabled
```

> El puerto es `27018` para no chocar con otros MongoDB; `0.0.0.0` permite que otros equipos de la red se conecten; la autenticación está activada.

6. Arranca MongoDB (se queda corriendo en esa ventana):

```
C:\Mongo\bin\mongod.exe --config C:\Mongo\mongod.cfg
```

7. Descarga **mongosh** (la consola de MongoDB) desde https://www.mongodb.com/try/download/shell (Windows, zip). Extrae el zip a donde quieras (ej. `C:\Tools\mongosh`). En la terminal (sustituye la ruta):

```
C:\Tools\mongosh\bin\mongosh.exe "mongodb://127.0.0.1:27018"
```

> La primera vez no pide clave: MongoDB tiene una "excepción de localhost" que permite crear el primer usuario desde esta misma PC.

8. Crea los dos usuarios de la base (una línea a la vez, **cambia las claves por unas fuertes tuyas**):

```
use admin
db.createUser({ user: "lookby_admin", pwd: "CAMBIA_ESTA_CLAVE_1", roles: [{ role: "root", db: "admin" }] })
db.createUser({ user: "lookby_user", pwd: "CAMBIA_ESTA_CLAVE_2", roles: [{ role: "readWrite", db: "lookby" }] })
exit
```

9. Guarda bien **CAMBIA_ESTA_CLAVE_2** (es la que usa la API).

---

## 4) Configurar, sembrar y arrancar la API

En la terminal, dentro de `LookBy\backend-next`:

```
cd LookBy\backend-next
copy .env.example .env.local
```

Abre `.env.local` con el Bloc de notas y pon tu clave en la línea de MongoDB:

```
MONGODB_URI=mongodb://lookby_user:CAMBIA_ESTA_CLAVE_2@127.0.0.1:27018/lookby?authSource=admin
```

Guarda. Luego instala dependencias, carga los datos de ejemplo y compila:

```
npm install
npm run seed
npm run build
```

Arranca la API (se queda corriendo en esa ventana):

```
npm start
```

Comprueba que responde abriendo en el navegador:

```
http://localhost:3000/api/beauty-salons
```

Debes ver un JSON con los salones de belleza de ejemplo. La API ya quedó conectada a la base con datos sembrados (roles, usuarios de prueba, locales, catálogo de productos, proveedores y reseñas).

---

## 5) Arrancar la WEB

Abre **otra** ventana de terminal y escribe:

```
cd LookBy
npm install
npx vite
```

Abre en el navegador:

```
http://localhost:8443
```

Ya está: la web de LookBy funcionando con su API y su base de datos.

---

## 6) Usuarios de prueba (los crea `npm run seed`)

| Rol | Correo | Contraseña |
|---|---|---|
| Superadministrador | admin@lookby.com | admin123 |
| Profesional (local de belleza) | profesional@lookby.com | prof123 |
| Proveedor (mayorista) | proveedor@lookby.com | prov123 |

> Cambia estas contraseñas en producción (o crea los usuarios reales desde la API).

---

## 7) Ver la web DESDE OTRO EQUIPO de la misma red

1. En la PC que corre todo (esta), mira su IP:

```
ipconfig
```

   Anota el **IPv4**, ej. `192.168.1.50`.
2. Desde el otro equipo, abre el navegador:

```
http://192.168.1.50:8443
```

3. Firewall: si Windows preguntó "¿Permitir el acceso de Node.js?" marca **Redes privadas** y **Permitir**.
   Si nunca preguntó, hazlo manual:
   - Menú inicio: **Firewall de Windows Defender con seguridad avanzada** → **Reglas de entrada** → **Nueva regla**.
   - Tipo: **Puerto** → TCP → puertos: `8443` → Permitir la conexión → Perfil: **Privado** → Nombre: `LookBy Web`.
   - (Opcional: repetir para el puerto `3000` si se quiere llamar a la API directamente.)

> La base MongoDB (27018) NO se comparte por el navegador: queda protegida por usuario y clave.

---

## 8) Arrancar todo de nuevo (tras apagar/ reiniciar la PC)

Tres ventanas de terminal:

```
# 1) Base de datos
C:\Mongo\bin\mongod.exe --config C:\Mongo\mongod.cfg

# 2) API
cd LookBy\backend-next ; npm start

# 3) Web
cd LookBy ; npx vite
```

Opcional — MongoDB arranque automático al iniciar sesión: usa `backend-next\scripts\start-mongod-hidden.vbs` (edítalo con tus rutas) y copia un acceso directo a la carpeta Inicio (`Win+R` → `shell:startup`).

---

## 9) Solución de problemas

| Problema | Causa | Solución |
|---|---|---|
| `EADDRINUSE ... :::3000` | Ya hay algo en el puerto 3000 | Cierra la otra ventana o usa otro puerto |
| `ECONNREFUSED ...:27018` | MongoDB no está corriendo | Arranca el paso 8.1 |
| `Authentication failed` | La clave de la URI no coincide con la creada en mongosh | Revisa `MONGODB_URI` en `.env.local` y si hace falta recrea el usuario |
| La web carga pero "no trae datos" | La API de esa misma PC no se levantó | Confirma `npm start` en `backend-next`; la web reenvía `/api` a `localhost:3000` |
| `node --env-file` no reconocido | Node demasiado viejo | Instala Node LTS ≥ 20.6 (paso 2) |
| Otro equipo no abre 8443 | Firewall sin regla | Sigue el paso 7.3 |

Comandos útiles para revisar puertos:

```
netstat -ano | findstr :8443
netstat -ano | findstr :3000
```

---

## 10) Seguridad (importante)

- `git clone` ya trae `.env.example` (plantilla). El archivo real `.env.local` **nunca se sube a Git**.
- Cambia las claves de MongoDB y los usuarios por defecto antes de usar el sistema "de verdad".
- Para exponer la web a Internet (no solo red local) NO se exponen los puertos del mundo de MongoDB; se recomienda un túnel (ngrok / Cloudflare Tunnel) apuntando solo a `:8443`.