# LookBy — Backend con Next.js

Plataforma de belleza, bienestar y cosmética de alta gama. Backend implementado con **Next.js (App Router) + API Routes + MongoDB**, portado desde la versión original en Nuxt/Nitro.

Conecta los portales de la plataforma LookBy (superadmin, negocio/local, proveedor y cliente) con una API REST construida sobre **Mongoose**.

## Stack tecnológico

| Capa         | Tecnología                                   |
| ------------ | -------------------------------------------- |
| Framework    | Next.js 16 (App Router, TypeScript)          |
| API          | Route Handlers (`app/api/**/route.ts`)      |
| Base de datos| MongoDB propio del equipo (instancia local con usuarios) |
| Autenticación| JWT (cookie `httpOnly`), bcryptjs            |
| Correos      | Resend (recuperación de contraseña)          |

## Características

- **33 endpoints** REST (CRUD de usuarios, roles, locales, catálogos, productos, servicios, citas, pedidos, inventario, proveedores, reseñas y dashboard).
- **Seed automático** del ecosistema conforme al DER al conectarse por primera vez.
- Autenticación con sesión en cookie segura `httpOnly` (7 días) y contraseñas hasheadas con bcrypt.
- Protección de rutas por rol (`admin`, `profesional`, `proveedor`, `cliente`).
- Conexión a MongoDB como **singleton** con cache global (apta para desarrollo y serverless).

## Estructura del proyecto

```
LookBy-Next/
├─ app/api/                  # API Routes (Next)
│  ├─ auth/                  # login, register, logout, me, recover, reset-password
│  ├─ admin/                 # gestión de usuarios y roles (solo admin)
│  ├─ beauty-salons/         # locales de belleza + reseñas
│  ├─ catalogs/              # catálogos e ítems por local
│  ├─ clients/               # clientes del negocio
│  ├─ appointments/          # citas y horarios ocupados
│  ├─ services/              # servicios del local
│  ├─ products/              # catálogo maestro de productos
│  ├─ orders/                # pedidos y estados
│  ├─ inventory/             # inventario del negocio
│  ├─ suppliers/             # proveedores y ofertas mayoristas
│  └─ dashboard/             # estadísticas del negocio
├─ lib/
│  ├─ mongodb.ts             # conexión singleton a MongoDB
│  ├─ auth.ts                # JWT, bcrypt y cookie de sesión
│  ├─ seeder.ts              # siembra inicial de datos (DER)
│  └─ models/                # 16 modelos Mongoose
├─ .env.example
├─ GUIA-CONEXION-MONGODB.md   # cómo conectar/arrancar la base MongoDB propia
├─ scripts/                   # plantillas para iniciar la base del equipo
└─ next.config.ts
```

## Requisitos previos

- Node.js **20.x o superior**
- npm
- Clúster en **MongoDB Atlas** (o MongoDB propio del equipo en `mongodb://127.0.0.1:27018/lookby`)

## Configuración

1. Instala dependencias:

```bash
npm install
```

2. Crea el archivo `.env.local` a partir del ejemplo:

```bash
cp .env.example .env.local
```

3. Completa como mínimo `MONGODB_URI`. Variables disponibles:

| Variable            | Descripción                                             |
| ------------------- | ------------------------------------------------------- |
| `MONGODB_URI`       | Cadena de conexión a MongoDB (Atlas o local)             |
| `ADMIN_EMAIL`       | Correo del superadministrador inicial (por defecto `admin@lookby.com`) |
| `ADMIN_PASSWORD`    | Contraseña del superadministrador inicial (por defecto `admin123`) |
| `JWT_SECRET`        | Secreto para firmar los tokens JWT. **Cámbialo en producción** |
| `RESEND_API_KEY`    | API key de Resend para correos de recuperación (opcional) |

> **Importante:** `.env.local` NO se sube a Git (está en `.gitignore`). Nunca compartas credenciales reales.

## Puesta en marcha

```bash
npm run dev        # entorno de desarrollo (http://localhost:3000)
npm run build      # build de producción
npm run start      # sirve el build de producción
```

Al primer request que toque la base de datos se conecta a MongoDB y, si la base está vacía, **siembra automáticamente** roles, usuarios de ejemplo, locales, catálogos, productos, proveedores y una reseña inicial.

### Usuarios de ejemplo (sembrados)

| Rol          | Correo                  | Contraseña  |
| ------------ | ----------------------- | ----------- |
| Admin        | `admin@lookby.com`      | `admin123`  |
| Profesional  | `profesional@lookby.com`| `prof123`   |
| Proveedor    | `proveedor@lookby.com`  | `prov123`   |

## Endpoints principales

| Método | Ruta                                  | Descripción                          |
| ------ | ------------------------------------- | ------------------------------------ |
| POST   | `/api/auth/register`                  | Registro de usuario (con rol)        |
| POST   | `/api/auth/login`                     | Inicio de sesión (cookie httpOnly)   |
| GET    | `/api/auth/me`                        | Usuario autenticado                  |
| POST   | `/api/auth/recover`                   | Solicitar recuperación de contraseña |
| POST   | `/api/auth/reset-password`            | Restablecer contraseña con token     |
| GET    | `/api/beauty-salons`                  | Lista de locales de belleza          |
| GET    | `/api/products`                       | Catálogo maestro de productos        |
| GET    | `/api/catalogs/[id]/items`            | Ítems de un catálogo                 |
| POST   | `/api/appointments`                   | Crear una cita                       |
| GET    | `/api/appointments/occupied-slots`    | Slots ocupados de un día             |
| POST   | `/api/orders`                         | Crear un pedido                      |
| PUT    | `/api/orders/[id]/status`             | Actualizar estado de un pedido       |
| GET    | `/api/dashboard/stats`                | Estadísticas del negocio             |
| GET    | `/api/admin/users`                    | Gestión de usuarios (solo admin)     |

Endpoints de escritura y de administración requieren sesión activa y, en su caso, rol de administrador.

## Seguridad

- Contraseñas hasheadas con **bcrypt** (salt 10).
- Sesión mediante **JWT** en cookie `httpOnly`, `sameSite=lax`, expira a los 7 días.
- Protección de rutas con verificación de rol.
- Los datos sensibles (`contrasena`, tokens de reseteo) se eliminan de las respuestas (`toJSON` del modelo `User`).

## Solución de problemas

**La base de datos no responde en `27018`**: la instancia propia de MongoDB debe estar corriendo. Arranca `scripts\start-mongod.cmd` (o `start-mongod-hidden.vbs`) y verifica con `netstat -ano | findstr :27018`. Más detalles en `GUIA-CONEXION-MONGODB.md`.

**Error 401**: sesión no iniciada o token expirado.
**Error 403**: el usuario no tiene el rol requerido.

## Licencia

Proyecto educativo. Uso interno del equipo de desarrollo.