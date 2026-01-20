interface MetricCardProps {
  label: string
  value: string
  trend?: string
  icon?: string
}

export function MetricCard({ label, value, trend, icon }: MetricCardProps) {
  const trendPositive = trend && trend.startsWith('+')
  
  return (
    <div className="glass-card rounded-lg p-6 transition-all duration-300 hover:glass-card-hover relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted font-medium">
            {label}
          </p>
          {trend && (
            <span 
              className={`text-xs font-semibold px-2 py-1 rounded ${
                trendPositive 
                  ? 'bg-green-500/15 text-green-400' 
                  : 'bg-red-500/15 text-red-400'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
        
        <div className="flex items-end gap-3">
          {icon && (
            <span className="text-4xl opacity-20">{icon}</span>
          )}
          <h3 className="text-4xl font-bold text-bone leading-none">
            {value}
          </h3>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}
