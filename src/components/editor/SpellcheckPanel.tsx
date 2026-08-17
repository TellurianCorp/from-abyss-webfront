import { useTranslation } from 'react-i18next'
import { Check, RefreshCw } from 'react-feather'

import type { SpellMatch } from './spellcheck/mapMatches'
import styles from './SpellcheckPanel.module.css'

export interface SpellcheckPanelProps {
  matches: SpellMatch[]
  isChecking: boolean
  isUpToDate: boolean
  error: string | null
  onRun: () => void
  onApply: (id: string, replacement: string) => void
  onDismiss: (id: string) => void
}

export function SpellcheckPanel({
  matches,
  isChecking,
  isUpToDate,
  error,
  onRun,
  onApply,
  onDismiss,
}: SpellcheckPanelProps) {
  const { t } = useTranslation()

  return (
    <section className={styles.panel} aria-label={t('editor.spellcheck.panelTitle', 'Writing check')}>
      <header className={styles.header}>
        <h3 className={styles.title}>{t('editor.spellcheck.panelTitle', 'Writing check')}</h3>

        <button
          type="button"
          className={styles.run}
          onClick={onRun}
          disabled={isChecking}
          title={t(
            'editor.spellcheck.runHint',
            'Checks grammar and style. Your browser already underlines misspellings as you type.',
          )}
        >
          <RefreshCw size={14} className={isChecking ? styles.spinning : undefined} />
          {isChecking
            ? t('editor.spellcheck.running', 'Checking…')
            : t('editor.spellcheck.run', 'Check')}
        </button>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      {!error && !isChecking && matches.length === 0 && isUpToDate && (
        <p className={styles.clean}>
          <Check size={14} /> {t('editor.spellcheck.noIssues', 'Nothing to flag.')}
        </p>
      )}

      {matches.length > 0 && (
        <>
          <p className={styles.count}>
            {t('editor.spellcheck.issuesFound', '{{count}} suggestion', {
              count: matches.length,
            })}
            {!isUpToDate && (
              <span className={styles.stale}>
                {' '}
                {t('editor.spellcheck.stale', '· text changed since this check')}
              </span>
            )}
          </p>

          <ul className={styles.list}>
            {matches.map((match) => (
              <li key={match.id} className={styles.item}>
                <p className={styles.message}>{match.shortMessage || match.message}</p>

                {match.replacements.length > 0 ? (
                  <div className={styles.replacements}>
                    {/* A handful at most: a list of twenty guesses is not a
                        decision anyone can make quickly. */}
                    {match.replacements.slice(0, 4).map((replacement) => (
                      <button
                        key={replacement}
                        type="button"
                        className={styles.replacement}
                        onClick={() => onApply(match.id, replacement)}
                      >
                        {replacement}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noReplacement}>
                    {t('editor.spellcheck.noReplacement', 'No suggested correction.')}
                  </p>
                )}

                <button
                  type="button"
                  className={styles.ignore}
                  onClick={() => onDismiss(match.id)}
                >
                  {t('editor.spellcheck.ignore', 'Ignore')}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default SpellcheckPanel
