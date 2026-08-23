# 🌸 LookBy - Plataforma de Gestión para Negocios de Belleza

LookBy es una aplicación moderna desarrollada en **Nuxt 4** para la administración integral de centros de estética, salones de belleza, spas y barberías. Permite gestionar citas, clientes, catálogo de servicios, inventario y profesionales.

---

## 🛠️ Tecnologías

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3 + Nitro)
- **Base de Datos**: [MongoDB](https://www.mongodb.com/) con Mongoose
- **Estilos y Temas**: CSS moderno con soporte nativo de Modo Claro / Modo Oscuro (`@nuxtjs/color-mode`)
- **Estado Global**: [Pinia](https://pinia.vuejs.org/)
- **Notificaciones**: [Resend](https://resend.com/)

---

## 🚀 Inicio Rápido

### 1. Requisitos Previos
- Node.js 18+ (recomendado LTS)
- Base de datos MongoDB (Atlas o local)

### 2. Instalación de dependencias
```bash
npm install
```

### 3. Configuración de Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```
Edita `.env` con tus credenciales de MongoDB y Resend.

### 4. Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## 📦 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila la aplicación para producción.
- `npm run preview`: Previsualiza la compilación de producción localmente.
- `npm run postinstall`: Prepara tipos de Nuxt (`nuxi prepare`).

