const stats = [
  { value: "3B", label: "Consumers represented" },
  { value: "50+", label: "Markets worldwide" },
  { value: "200K+", label: "Profiling data points" },
  { value: "750+", label: "Team members globally" },
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
