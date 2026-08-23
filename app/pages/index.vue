<template>
  <div class="landing-shell">
    <!-- Navbar Superior -->
    <header class="public-navbar">
      <div class="navbar-container">
        <NuxtLink to="/" class="brand-logo">
          <span class="logo-emoji">🌸</span>
          <span class="logo-text">LookBy</span>
        </NuxtLink>

        <nav class="nav-links">
          <a href="#servicios" class="nav-link">Servicios</a>
          <a href="#como-funciona" class="nav-link">¿Cómo Funciona?</a>
          <a href="#contacto" class="nav-link">Contacto</a>
        </nav>

        <div class="nav-actions">
          <ThemeToggle />
          <NuxtLink v-if="!isLoggedIn" to="/admin/login" class="btn-secondary nav-btn">Iniciar Sesión</NuxtLink>
          <NuxtLink v-if="!isLoggedIn" to="/admin/registro" class="btn-secondary nav-btn">Registrarse</NuxtLink>
          <NuxtLink v-else :to="roleHome" class="btn-secondary nav-btn">{{ roleButtonLabel }}</NuxtLink>
          <NuxtLink to="/reservar" class="btn-primary nav-btn">Reservar Cita</NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <span class="hero-pill">✨ Tu momento de belleza y cuidado personal</span>
        <h1>Realza tu estilo con los mejores profesionales</h1>
        <p>
          En LookBy encuentras servicios exclusivos de peluquería, barbería, estética y cuidado integral.
          Agenda tu cita en segundos sin esperas ni llamadas.
        </p>

        <div class="hero-cta-group">
          <NuxtLink to="/reservar" class="btn-primary hero-btn">
            <span>📅 Agendar Cita Online</span>
          </NuxtLink>
          <a href="#servicios" class="btn-secondary hero-btn">
            <span>Explorar Servicios ↓</span>
          </a>
        </div>

        <div class="hero-features">
          <div class="feature-badge">
            <span>⚡</span>
            <small>Reserva instantánea</small>
          </div>
          <div class="feature-badge">
            <span>⭐</span>
            <small>Atención personalizada</small>
          </div>
          <div class="feature-badge">
            <span>🌿</span>
            <small>Productos premium</small>
          </div>
        </div>
      </div>
    </section>

    <!-- Catálogo de Servicios en Vivo -->
    <section id="servicios" class="services-section">
      <div class="section-container">
        <div class="section-header">
          <span class="eyebrow">Nuestro Catálogo</span>
          <h2>Servicios & Tratamientos</h2>
          <p>Elige entre nuestra amplia variedad de servicios diseñados para ti.</p>
        </div>

        <!-- Filtro por Categorías -->
        <div class="cat-filters">
          <button
            v-for="cat in categories"
            :key="cat"
            :class="['cat-chip', { active: selectedCategory === cat }]"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Grid de Servicios -->
        <div v-if="pending" class="loading-state">Cargando catálogo de servicios...</div>

        <div v-else-if="!services || services.length === 0" class="empty-state">
          <p>No hay servicios disponibles en esta categoría actualmente.</p>
        </div>

        <div v-else class="services-grid">
          <article v-for="s in services" :key="s._id" class="service-card">
            <div class="card-header-cat">
              <span class="cat-tag">{{ s.category || 'General' }}</span>
              <span class="duration-tag">⏱️ {{ s.duration }} min</span>
            </div>

            <div class="card-body">
              <h3>{{ s.name }}</h3>
              <p>{{ s.description || 'Tratamiento profesional realizado por expertos.' }}</p>
            </div>

            <div class="card-bottom">
              <strong class="price-val">${{ (s.price || 0).toLocaleString('es-CO') }}</strong>
              <NuxtLink :to="'/reservar?serviceId=' + s._id" class="btn-primary btn-book-card">
                Reservar
              </NuxtLink>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Cómo Funciona -->
    <section id="como-funciona" class="how-it-works-section">
      <div class="section-container">
        <div class="section-header">
          <span class="eyebrow">Paso a Paso</span>
          <h2>¿Cómo agendar tu cita?</h2>
          <p>Reservar tu espacio nunca fue tan rápido y sencillo.</p>
        </div>

        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <span class="step-icon">💇</span>
            <h3>Elige tu Servicio</h3>
            <p>Explora nuestro catálogo y selecciona el tratamiento que deseas realizarte.</p>
          </div>

          <div class="step-card">
            <div class="step-number">2</div>
            <span class="step-icon">📅</span>
            <h3>Selecciona Horario</h3>
            <p>Escoge el día y la hora que mejor se adapten a tu agenda personal.</p>
          </div>

          <div class="step-card">
            <div class="step-number">3</div>
            <span class="step-icon">✨</span>
            <h3>¡Listo, Cita Agendada!</h3>
            <p>Recibe tu confirmación al instante y ven a disfrutar de tu experiencia.</p>
          </div>
        </div>

        <div class="how-cta">
          <NuxtLink to="/reservar" class="btn-primary cta-btn">Quiero agendar mi cita ahora</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contacto" class="public-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="footer-logo">
            <span>🌸</span>
            <strong>LookBy</strong>
          </div>
          <p>Tu plataforma integral de belleza, estética y bienestar personal.</p>
        </div>

        <div class="footer-col">
          <strong>Horario de Atención</strong>
          <p>Lunes a Sábado: 8:00 AM - 8:00 PM</p>
          <p>Domingos y Festivos: 9:00 AM - 3:00 PM</p>
        </div>

        <div class="footer-col">
          <strong>Contacto & Ubicación</strong>
          <p>📍 Centro de Belleza LookBy</p>
          <p>📞 +57 300 000 0000</p>
          <p>✉️ contacto@lookby.com</p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 LookBy. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isAuthenticated)
const roleHome = computed(() => authStore.getRoleHomeRoute(authStore.user?.role))
const roleButtonLabel = computed(() => {
  if (authStore.user?.role === 'cliente') return 'Mi Portal de Citas'
  if (authStore.user?.role === 'proveedor') return 'Portal Proveedor'
  if (authStore.user?.role === 'profesional') return 'Panel del Negocio'
  return 'Panel de Control'
})

const selectedCategory = ref('Todas')
const categories = ['Todas', 'Peluquería', 'Barbería', 'Uñas', 'Facial', 'Corporal', 'Spa', 'General']

const queryParams = computed(() => {
  const q: any = { active: 'true' }
  if (selectedCategory.value !== 'Todas') {
    q.category = selectedCategory.value
  }
  return q
})

const { data, pending } = await useFetch<{ success: boolean; data: any[] }>('/api/services', {
  query: queryParams
})

const services = computed(() => data.value?.data || [])

onMounted(async () => {
  if (!authStore.initialized) {
    await authStore.fetchUser()
  }
})
</script>

<style scoped>
.landing-shell {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-body);
  display: flex;
  flex-direction: column;
}

/* Navbar */
.public-navbar {
  position: sticky;
  top: 0;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border);
  z-index: 100;
  backdrop-filter: blur(8px);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.logo-emoji {
  font-size: 1.6rem;
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-title);
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: var(--text-body);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-btn {
  padding: 8px 16px;
  font-size: 0.88rem;
}

/* Hero Section */
.hero-section {
  padding: 80px 20px 60px;
  text-align: center;
  background: linear-gradient(180deg, var(--bg-card) 0%, var(--bg-main) 100%);
  border-bottom: 1px solid var(--border);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.hero-pill {
  display: inline-block;
  background: rgba(200, 157, 124, 0.14);
  color: var(--primary);
  border-radius: 999px;
  padding: 8px 18px;
  font-weight: 700;
  font-size: 0.88rem;
  letter-spacing: 0.04em;
}

.hero-content h1 {
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  color: var(--text-title);
  line-height: 1.15;
}

.hero-content p {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: var(--text-body);
  line-height: 1.6;
  max-width: 680px;
}

.hero-cta-group {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
}

.hero-btn {
  padding: 14px 28px;
  font-size: 1.05rem;
}

.hero-features {
  display: flex;
  gap: 24px;
  margin-top: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.feature-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-title);
  box-shadow: var(--shadow);
}

/* Sección Servicios */
.services-section {
  padding: 80px 20px;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.eyebrow {
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
  display: block;
}

.section-header h2 {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  color: var(--text-title);
  margin-bottom: 8px;
}

.section-header p {
  color: var(--text-body);
  font-size: 1rem;
}

.cat-filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-chip {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-body);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all 0.2s ease;
}

.cat-chip:hover {
  background: var(--bg-subtle);
  color: var(--text-title);
}

.cat-chip.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.service-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.service-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary);
}

.card-header-cat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cat-tag {
  background: rgba(200, 157, 124, 0.12);
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.duration-tag {
  font-size: 0.8rem;
  color: var(--text-body);
}

.card-body h3 {
  font-size: 1.25rem;
  color: var(--text-title);
  margin-bottom: 8px;
}

.card-body p {
  font-size: 0.9rem;
  color: var(--text-body);
  line-height: 1.5;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.price-val {
  font-size: 1.35rem;
  color: var(--text-title);
}

.btn-book-card {
  padding: 8px 18px;
  font-size: 0.9rem;
  text-decoration: none;
}

/* Cómo funciona */
.how-it-works-section {
  padding: 80px 20px;
  background-color: var(--bg-card);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 28px;
}

.step-card {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.step-number {
  position: absolute;
  top: -14px;
  left: 24px;
  width: 28px;
  height: 28px;
  background: var(--primary);
  color: #ffffff;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.85rem;
  display: grid;
  place-items: center;
}

.step-icon {
  font-size: 2.5rem;
}

.step-card h3 {
  font-size: 1.2rem;
  color: var(--text-title);
}

.step-card p {
  font-size: 0.92rem;
  color: var(--text-body);
  line-height: 1.5;
}

.how-cta {
  text-align: center;
  margin-top: 16px;
}

.cta-btn {
  padding: 14px 32px;
  font-size: 1rem;
  text-decoration: none;
}

/* Footer */
.public-footer {
  background: var(--bg-subtle);
  border-top: 1px solid var(--border);
  padding: 48px 20px 24px;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
  margin-bottom: 36px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
  color: var(--text-title);
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
}

.footer-col strong {
  color: var(--text-title);
  margin-bottom: 4px;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-body);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-body);
}

@media (max-width: 800px) {
  .nav-links {
    display: none;
  }

  .nav-actions .nav-btn:not(.btn-primary) {
    display: none;
  }
}
</style>