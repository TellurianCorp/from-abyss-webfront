import type { ComponentType } from 'react'

import styles from './ToolbarButton.module.css'

interface IconProps {
  size?: number | string
}

export interface ToolbarButtonProps {
  /** Feather icon component. Mutually exclusive with `glyph`. */
  icon?: ComponentType<IconProps>
  /**
   * Text stand-in for actions Feather has no icon for — strikethrough, heading
   * levels, numbered list, quote. Better an honest "H2" than an unrelated icon
   * reused because it was to hand.
   */
  glyph?: string
  /** Used as both the accessible name and the tooltip. */
  label: string
  isActive?: boolean
  isDisabled?: boolean
  /** Extra class for glyph styling, e.g. the struck-through S. */
  glyphClassName?: string
  onClick: () => void
}

export function ToolbarButton({
  icon: Icon,
  glyph,
  label,
  isActive = false,
  isDisabled = false,
  glyphClassName,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${isActive ? styles.active : ''}`}
      // Buttons inside a toolbar must not steal focus from the document, or
      // every command would apply to a lost selection.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={isDisabled}
      aria-pressed={isActive}
      aria-label={label}
      title={label}
    >
      {Icon ? (
        <Icon size={16} />
      ) : (
        <span className={`${styles.glyph} ${glyphClassName ?? ''}`} aria-hidden="true">
          {glyph}
        </span>
      )}
    </button>
  )
}

export default ToolbarButton
