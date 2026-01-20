import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface ServiceStat {
  label: string
  value: string
}

interface ServiceCardProps {
  id: string
  name: string
  description: string
  icon: string
  status: 'active' | 'inactive'
  color: 'blood' | 'sepia' | 'bone' | 'muted'
  stats?: ServiceStat[]
  link?: string
  component?: ReactNode
  linkText?: string
}

const colorClasses = {
  blood: 'from-red-900/30 to-red-950/30 border-red-900/40 hover:border-red-800/50',
  sepia: 'from-yellow-900/20 to-yellow-950/20 border-yellow-900/30 hover:border-yellow-800/40',
  bone: 'from-stone-800/30 to-stone-900/30 border-stone-700/30 hover:border-stone-600/40',
  muted: 'from-amber-900/20 to-amber-950/20 border-amber-900/30 hover:border-amber-800/40',
}

export function ServiceCard({
  name,
  description,
  icon,
  status,
  color,
  stats,
  link,
  component,
  linkText,
}: ServiceCardProps) {
  return (
    <div className={`
      glass-card rounded-xl p-8 
      transition-all duration-300 hover:glass-card-hover
      relative overflow-hidden group
      bg-gradient-to-br ${colorClasses[color]}
    `}>
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="relative z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <span className="text-5xl leading-none flex-shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-semibold uppercase tracking-wide text-bone mb-2 truncate">
                {name}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex-shrink-0">
            <span 
              className={`
                text-2xl leading-none
                ${status === 'active' 
                  ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]' 
                  : 'text-muted/50'
                }
              `}
            >
              {status === 'active' ? '●' : '○'}
            </span>
          </div>
        </div>

        {/* Component Content */}
        {component && (
          <div className="mt-2">
            {component}
          </div>
        )}

        {/* Stats Grid */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-3 gap-4 p-5 bg-black/40 rounded-lg border border-white/5">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-2">
                <span className="text-[0.7rem] uppercase tracking-wider text-muted font-medium">
                  {stat.label}
                </span>
                <strong className="text-xl font-bold text-bone">
                  {stat.value}
                </strong>
              </div>
            ))}
          </div>
        )}

        {/* Link Button */}
        {link && (
          <Link
            to={link}
            className="
              flex items-center justify-between
              px-6 py-4 rounded-lg
              bg-gradient-to-r from-stone-800/60 to-stone-900/60
              border border-white/20
              text-bone font-semibold uppercase tracking-wider text-sm
              transition-all duration-300
              hover:from-stone-700/70 hover:to-stone-800/70
              hover:border-white/30
              hover:translate-y-[-2px]
              hover:shadow-lg
              group/link
              mt-auto
            "
          >
            <span>{linkText}</span>
            <span className="transition-transform duration-300 group-hover/link:translate-x-1">
              →
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}
