interface SectionHeaderProps {
  title: string
  description: string
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-3xl lg:text-4xl font-semibold uppercase tracking-wider text-bone">
        {title}
      </h2>
      <p className="text-sm text-muted leading-relaxed">
        {description}
      </p>
    </div>
  )
}
