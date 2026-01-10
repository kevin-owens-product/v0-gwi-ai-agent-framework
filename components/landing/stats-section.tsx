const stats = [
  { value: "2.8B", label: "Consumers represented" },
  { value: "3", label: "LLM providers supported" },
  { value: "99.9%", label: "Platform uptime with circuit breakers" },
  { value: "5000+", label: "Integrations via Zapier & webhooks" },
]

export function StatsSection() {
  return (
    <section className="py-24 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
