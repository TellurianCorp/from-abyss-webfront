import { useState } from 'react'
import articleService, { type GrammarMatch } from '../../services/articleService'
import './GrammarChecker.css'

interface GrammarCheckerProps {
  text: string
  language: 'pt-BR' | 'en-GB'
  onApplySuggestion?: (offset: number, length: number, replacement: string) => void
}

export function GrammarChecker({ text, language, onApplySuggestion }: GrammarCheckerProps) {
  const [matches, setMatches] = useState<GrammarMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkGrammar = async () => {
    if (!text.trim()) {
      setError('Texto vazio')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await articleService.checkGrammar(text, language)
      setMatches(response.matches)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar gramática')
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  const applySuggestion = (match: GrammarMatch, replacement: string) => {
    if (onApplySuggestion) {
      onApplySuggestion(match.offset, match.length, replacement)
    }
  }

  return (
    <div className="grammar-checker">
      <button
        type="button"
        onClick={checkGrammar}
        disabled={loading || !text.trim()}
        className="check-button"
      >
        {loading ? 'Verificando...' : 'Verificar Gramática'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {matches.length > 0 && (
        <div className="matches-list">
          <h4>Encontrados {matches.length} problema(s)</h4>
          {matches.map((match, index) => (
            <div key={index} className="match-item">
              <div className="match-message">
                <strong>{match.shortMessage || match.message}</strong>
                <span className="match-context">"{match.context}"</span>
              </div>
              {match.replacements.length > 0 && (
                <div className="replacements">
                  {match.replacements.slice(0, 3).map((replacement, replIndex) => (
                    <button
                      key={replIndex}
                      type="button"
                      onClick={() => applySuggestion(match, replacement)}
                      className="replacement-button"
                    >
                      {replacement}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
