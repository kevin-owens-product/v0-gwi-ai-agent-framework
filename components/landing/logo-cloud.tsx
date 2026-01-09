export function LogoCloud() {
  const logos = ["Unilever", "Nike", "Samsung", "L'Oréal", "Coca-Cola", "Nestlé", "P&G", "Diageo", "PepsiCo", "Mars"]

  return (
    <section className="py-16 border-y border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground uppercase tracking-widest mb-8">
          Trusted by leading enterprise teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo) => (
            <div
              key={logo}
              className="text-muted-foreground/40 font-semibold text-lg tracking-wide hover:text-muted-foreground transition-colors"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
