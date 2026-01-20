interface Incident {
  text: string
  status: 'success' | 'warning' | 'info' | 'error'
  time: string
  priority?: 'low' | 'medium' | 'high'
}

interface IncidentFeedProps {
  incidents: Incident[]
  title: string
  subtitle: string
}

const statusConfig = {
  success: {
    icon: '✓',
    color: 'border-green-400 text-green-400',
    bg: 'bg-green-500/10',
  },
  warning: {
    icon: '⚠',
    color: 'border-yellow-400 text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  info: {
    icon: 'ℹ',
    color: 'border-blue-400 text-blue-400',
    bg: 'bg-blue-500/10',
  },
  error: {
    icon: '✕',
    color: 'border-red-400 text-red-400',
    bg: 'bg-red-500/10',
  },
}

export function IncidentFeed({ incidents, title, subtitle }: IncidentFeedProps) {
  return (
    <div className="glass-card rounded-xl p-8 relative overflow-hidden">
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold uppercase tracking-wide text-bone mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted">
          {subtitle}
        </p>
      </div>
      
      {/* Incidents List */}
      <div className="flex flex-col gap-4">
        {incidents.map((incident, index) => {
          const config = statusConfig[incident.status]
          
          return (
            <div
              key={index}
              className={`
                flex items-start gap-4
                px-5 py-4
                bg-gradient-to-r from-black/40 to-black/20
                rounded-lg
                border-l-4 ${config.color}
                transition-all duration-300
                hover:translate-x-2
                hover:shadow-md
                relative overflow-hidden
                group
              `}
            >
              {/* Background glow */}
              <div className={`absolute inset-0 ${config.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Icon */}
              <span className={`text-2xl leading-none flex-shrink-0 ${config.color} relative z-10`}>
                {config.icon}
              </span>
              
              {/* Content */}
              <div className="flex-1 relative z-10">
                <p className="text-bone text-sm font-medium leading-relaxed mb-2">
                  {incident.text}
                </p>
                <span className="text-xs text-muted uppercase tracking-wider">
                  {incident.time}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
