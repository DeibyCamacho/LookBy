# LookBy - Guia de conexion a MongoDB (base propia)

Como la conexion a MongoDB Atlas no quedaba estable para el equipo, adoptamos una **base de datos MongoDB propia** (local, auto-administrada) que funciona de inmediato y es accesible desde otras maquinas de la red.

> Las contrasenas reales NO estan en este repositorio. Estan en el `.env.local` de la maquina (que no se sube a Git). Si necesitas las credenciales, pideleselas al administrador del equipo.

## 1. Donde vive la base

- **Maquina:** la PC del administrador del equipo (donde corre el backend).
- **Puerto:** `27018` (no choca con el MongoDB de Windows instalado en el puerto `27017`).
- **Escucha en `0.0.0.0`** => visible desde toda la red local.
- **Autenticacion habilitada** (`--auth`): anonimos no acceden.
- **Auto-arranque:** al iniciar sesion en Windows (copia en la carpeta Inicio del usuario), y en caliente con `start-mongod.cmd`.

### Usuarios creados (en la base `admin`)

| Usuario      | Tipo            | Rol/permisos                                   | Uso                        |
| ------------ | --------------- | ---------------------------------------------- | -------------------------- |
| `admin`      | administrador   | `root` en `admin`                              | gestion del servidor       |
| `lookby_user`| aplicacion      | `readWrite` sobre la base `lookby`             | usada por el backend Next  |

## 2. Como conectarse

### Desde la misma maquina (backend Next)

El backend ya usa (`.env.local`):

```
mongodb://lookby_user:<PASSWORD>@127.0.0.1:27018/lookby?authSource=admin
```

### Desde otra PC de la misma red

Sustituye `127.0.0.1` por la IP de la maquina del equipo (ej. `192.168.1.41`):

```
mongodb://lookby_user:<PASSWORD>@192.168.1.41:27018/lookby?authSource=admin
```

### Verificar con mongosh

```bash
mongosh "mongodb://lookby_user:<PASSWORD>@127.0.0.1:27018/lookby?authSource=admin" \
  --eval "db.runCommand({ ping: 1 })"
```

Debe imprimir `{"ok":1}`.

## 3. Como arrancar / parar la base (en la maquina del equipo)

- **Automatico:** al iniciar sesion de Windows la base arranca sola (script en la carpeta Inicio).
- **Manual (en caliente):** doble clic en `C:\Users\<usuario>\.mongo\start-mongod.cmd` o ejecutar el mismo `.cmd`.
- **Verificar que esta arriba y que pide credenciales:**
  ```bash
  netstat -ano | findstr :27018
  ```
  Debe aparecer un proceso escuchando en `0.0.0.0:27018`.

> El MongoDB de Windows (servicio, puerto `27017`) y el nuestro (puerto `27018`) conviven sin conflicto.

## 4. Como replicar la base en otra maquina (plantillas en `scripts/`)

1. Copia `scripts/mongod-local.cfg.example` a `C:\Users\<usuario>\.mongo\mongod.cfg` y ajusta las rutas.
2. Crea la carpeta de datos (ej. `C:\Users\<usuario>\.mongo\data`).
3. Arranca sin autenticacion una vez y crea los usuarios:
   ```bash
   mongod --config C:\Users\<usuario>\.mongo\mongod.cfg
   mongosh mongodb://127.0.0.1:27018/admin --eval \
     "db.createUser({user:'admin',pwd:'<PASSWORD_ADMIN>',roles:[{role:'root',db:'admin'}]}); \
      db.createUser({user:'lookby_user',pwd:'<PASSWORD_APP>',roles:[{role:'readWrite',db:'lookby'}]});"
   ```
4. Agrega `security: authorization: enabled` al final del `.cfg` y reinicia.
5. Apunta el `.env.local` del backend a la IP de esa maquina.

## 5. Como ABRIR la aplicacion desde otro lugar

El backend Next escucha en todas las interfaces (`0.0.0.0:3000`):

- **Misma red:** abre en el navegador `http://<IP-de-la-maquina>:3000` (ej. `http://192.168.1.41:3000`).
- **Internet (fuera de la red):** opcionalmente se expone la app con un tunel (ngrok / Cloudflare Tunnel) apuntando a `http://localhost:3000`. La base NO se expone a internet; solo la app, que internamente usa la base local con credenciales.

## 6. Solucion de problemas

- **`Authentication failed`** => contrasena incorrecta en `.env.local` (revisa `authSource=admin`).
- **`ECONNREFUSED` en 27018** => la instancia propia no esta corriendo: arranca `start-mongod.cmd`.
- **No alcanza desde otra PC** => firewall de Windows bloqueando el puerto 27018 (regla de entrada para el puerto 27018) y/o 3000.
- **Ping sin credenciales responde OK** => es normal: `ping` y `hello` estan permitidos pre-autenticacion; cualquier consulta de datos exige credenciales.