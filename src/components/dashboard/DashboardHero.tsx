import type { ReactNode } from 'react'

interface HeroStat {
  value: string
  label: string
}

interface DashboardHeroProps {
  eyebrow: string
  title: string
  description: string
  stats: HeroStat[]
  actions?: ReactNode
}

export function DashboardHero({ eyebrow, title, description, stats, actions }: DashboardHeroProps) {
  return (
    <section className="
      glass-card rounded-2xl p-10
      relative overflow-hidden
      bg-gradient-to-br from-stone-900/95 to-stone-950/95
    ">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-yellow-900/10 opacity-30" />
      
      {/* Top border shine */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="relative z-10 grid lg:grid-cols-[1fr_auto] gap-12 items-center">
        {/* Hero Content */}
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.4em] text-muted font-medium">
            {eyebrow}
          </p>
          <h1 className="text-5xl lg:text-6xl font-bold uppercase tracking-wider text-bone leading-tight">
            {title}
          </h1>
          <p className="text-base text-muted leading-relaxed max-w-2xl mt-2">
            {description}
          </p>
          {actions && (
            <div className="mt-4">
              {actions}
            </div>
          )}
        </div>
        
        {/* Hero Stats */}
        <div className="flex gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="
                flex flex-col items-center gap-2
                px-8 py-6
                bg-gradient-to-br from-stone-800/60 to-stone-900/60
                rounded-xl
                border border-white/10
                relative overflow-hidden
                group
              "
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <span className="text-5xl font-bold text-bone leading-none relative z-10">
                {stat.value}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-muted font-medium text-center relative z-10">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
