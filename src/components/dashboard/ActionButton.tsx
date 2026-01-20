interface ActionButtonProps {
  label: string
  icon: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'accent'
}

const variantClasses = {
  primary: 'hover:bg-gradient-to-br hover:from-yellow-900/30 hover:to-yellow-950/30 hover:border-yellow-800/50',
  secondary: 'hover:bg-gradient-to-br hover:from-stone-700/30 hover:to-stone-800/30 hover:border-stone-600/50',
  accent: 'hover:bg-gradient-to-br hover:from-red-900/30 hover:to-red-950/30 hover:border-red-800/50',
}

export function ActionButton({ label, icon, onClick, variant = 'primary' }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-4
        px-6 py-5
        glass-card rounded-lg
        transition-all duration-300
        hover:glass-card-hover
        text-bone
        cursor-pointer
        relative overflow-hidden
        group
        ${variantClasses[variant]}
      `}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <span className="text-3xl leading-none relative z-10">{icon}</span>
      <span className="text-sm uppercase tracking-wider font-medium relative z-10">
        {label}
      </span>
    </button>
  )
}
