import { Link } from 'react-router-dom'
import { FiShield, FiUsers, FiDatabase, FiZap, FiCheck, FiMessageSquare } from 'react-icons/fi'
import heroImg from '../assets/heroSectionimage.png'

export function PublicLandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-white text-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">k</div>
            <span className="text-lg font-semibold tracking-tight">kuSystem</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md border border-emerald-600 bg-transparent px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              Comenzar Gratis
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background/10 to-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                {/* Badge */}
                <span className="inline-block mb-4 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">Nuevo sistema de gestión</span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  La plataforma para gestionar tus <span className="text-primary">clientes, equipos y sucursales</span> en un solo lugar
                </h1>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-prose">
                  Centralizá presupuestos, permisos y datos. Ahorrá tiempo con flujos simples y seguros.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                  >
                    Comenzar Gratis
                  </Link>
                  {/* Botón Ver Demo oculto según requerimiento */}
                </div>
                <ul className="mt-6 flex flex-col sm:flex-row gap-3 text-sm">
                  {['Sin riesgos','Sin compromiso','Soporte 24/7'].map((t)=>(
                    <li key={t} className="flex items-center gap-2 text-muted-foreground"><FiCheck className="text-emerald-500"/> {t}</li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] w-full rounded-xl border border-border bg-card text-card-foreground p-4 overflow-hidden">
                  <img src={heroImg} alt="Ilustración plataforma" className="h-full w-full object-cover rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="border-t border-border bg-gradient-to-b from-primary/20 to-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard icon={FiShield} title="Seguridad y Control" desc="Roles y permisos por persona. Actividad registrada y datos protegidos." />
              <FeatureCard icon={FiUsers} title="Equipos sin Fricción" desc="Invitá y organizá tu equipo por área o sucursal. Todo el mundo en sintonía." />
              <FeatureCard icon={FiDatabase} title="Presupuestos Ordenados" desc="Creá, enviá y descargá presupuestos claros. Histórico y seguimiento en un clic." />
              <FeatureCard icon={FiZap} title="Arrancá Hoy" desc="Configuración rápida. Importá tus datos y empezá a trabajar en minutos." />
            </div>
          </div>
        </section>

        {/* Precios */}
        <section className="border-t border-border bg-gradient-to-b from-primary/20 to-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Planes y Precios</h2>
              <p className="mt-2 text-muted-foreground">Elegí el plan que mejor se adapte a tu equipo</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PriceCard
                title="Esencial"
                price="Gs. 99.000/mes"
                features={[
                  'Hasta 3 sucursales o unidades',
                  '10 usuarios',
                  'Presupuestos y roles básicos',
                  'Soporte por email',
                ]}
                ctaLabel="Elegir Esencial"
                ctaTo="/register"
              />

              <PriceCard
                title="Profesional"
                price="Gs. 299.000/mes"
                recommended
                features={[
                  'Hasta 10 sucursales',
                  '50 usuarios',
                  'Auditoría y permisos avanzados',
                  'Integraciones (API)',
                  'Soporte prioritario',
                ]}
                ctaLabel="Elegir Profesional"
                ctaTo="/register"
              />

              <PriceCard
                title="Empresa"
                price="Gs. 599.000/mes"
                features={[
                  'Sucursales y usuarios ilimitados',
                  'SSO/SAML y cumplimiento',
                  'SLA y soporte 24/7',
                  'Acompañamiento de onboarding',
                ]}
                ctaLabel="Hablar con Ventas"
                ctaHref="https://wa.me/595961853895?text=Hola%20Ventas%2C%20necesito%20informaci%C3%B3n%20sobre%20el%20plan%20Empresa"
              />
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="border-t border-border bg-gradient-to-b from-primary/20 to-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              ¿Listo para ordenar tu operación y crecer sin complicaciones?
            </h2>
            <p className="mt-2 text-muted-foreground">Más de 1000 empresas ya confían en nuestra plataforma.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Comenzar Gratis Ahora
              </Link>
              <a
                href="https://wa.me/595961853895?text=Hola%20quiero%20comenzar%20con%20kuSystem"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Hablar por WhatsApp
              </a>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Sin tarjeta. Cancelá cuando quieras.</p>
          </div>
        </section>
      {/* Floating WhatsApp */}
      <a href="https://wa.me/595961853895" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-emerald-500 shadow-lg flex items-center justify-center hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
        <FiMessageSquare className="h-6 w-6 text-white" />
      </a>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-sm text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} kuSystem</span>
          <a
            className="hover:text-foreground"
            href="https://wa.me/595961853895?text=Hola%20quiero%20saber%20m%C3%A1s%20sobre%20kuSystem"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, desc, icon: Icon }: { title: string; desc: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card text-card-foreground p-5">
      <div className="h-10 w-10 rounded-md bg-primary/15 text-primary flex items-center justify-center"> <Icon className="h-5 w-5" /> </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}

function PriceCard({
  title,
  price,
  features,
  ctaLabel,
  ctaTo,
  ctaHref,
  recommended,
}: {
  title: string
  price: string
  features: string[]
  ctaLabel: string
  ctaTo?: string
  ctaHref?: string
  recommended?: boolean
}) {
  const Wrapper: React.ElementType = ctaHref ? 'a' : Link
  const wrapperProps = ctaHref
    ? { href: ctaHref, target: '_blank', rel: 'noopener noreferrer' }
    : { to: ctaTo! }

  return (
    <div
      className={
        'relative rounded-xl border p-5 sm:p-6 ' +
        (recommended
          ? 'border-transparent bg-gradient-to-b from-sky-100 to-white shadow-[0_0_0_2px_theme(colors.blue.500)]'
          : 'border-border bg-card text-card-foreground')
      }
    >
      {recommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          Recomendado
        </span>
      )}
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-2xl font-bold">{price}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {features.map((f, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary">•</span> {f}
          </li>
        ))}
      </ul>
      <Wrapper
        {...wrapperProps}
        className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {ctaLabel}
      </Wrapper>
    </div>
  )
}
