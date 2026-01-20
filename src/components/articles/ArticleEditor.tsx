import { useState, useEffect } from 'react'
import { QuillEditor } from './QuillEditor'
import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'react-feather'
import { useDarkMode } from '../../hooks/useDarkMode'
import articleService, { type Article, type ArticleTranslationInput, type ArticleAsset } from '../../services/articleService'
import { ArticleTranslationTabs } from './ArticleTranslationTabs'
import { ArticleAssetsManager } from './ArticleAssetsManager'
import { ArticleMetadataForm } from './ArticleMetadataForm'
import { GrammarChecker } from './GrammarChecker'
import { WorkflowStatusBadge } from './WorkflowStatusBadge'
import './ArticleEditor.css'

interface ArticleEditorProps {
  articleId?: string
  onSave?: () => void
}

const SUPPORTED_LANGUAGES = ['pt-BR', 'en-GB']

export function ArticleEditor({ articleId, onSave }: ArticleEditorProps) {
  const { i18n } = useTranslation()
  const { isDark, toggleDarkMode } = useDarkMode()
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language || 'pt-BR')
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Translation data
  const [translations, setTranslations] = useState<Record<string, ArticleTranslationInput>>({})
  const [tags, setTags] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [ogImageUrl, setOgImageUrl] = useState<string>('')
  const [assets, setAssets] = useState<ArticleAsset[]>([])
  const [uploadingAsset, setUploadingAsset] = useState(false)

  // Load article if editing
  useEffect(() => {
    if (articleId) {
      loadArticle()
    } else {
      // Initialize empty translations
      const emptyTranslations: Record<string, ArticleTranslationInput> = {}
      SUPPORTED_LANGUAGES.forEach((lang) => {
        emptyTranslations[lang] = {
          title: '',
          content: '',
        }
      })
      setTranslations(emptyTranslations)
    }
  }, [articleId])

  const loadArticle = async () => {
    if (!articleId) return

    setLoading(true)
    try {
      const loadedArticle = await articleService.getArticle(articleId, currentLanguage)
      setArticle(loadedArticle)

      // Load translations
      const loadedTranslations: Record<string, ArticleTranslationInput> = {}
      SUPPORTED_LANGUAGES.forEach((lang) => {
        const trans = loadedArticle.translations?.[lang]
        if (trans) {
          loadedTranslations[lang] = {
            title: trans.title,
            subtitle: trans.subtitle,
            excerpt: trans.excerpt,
            content: trans.content,
            meta_title: trans.meta_title,
            meta_description: trans.meta_description,
            meta_keywords: trans.meta_keywords,
          }
        } else {
          loadedTranslations[lang] = {
            title: '',
            content: '',
          }
        }
      })
      setTranslations(loadedTranslations)

      setTags(loadedArticle.tags || [])
      setTopics(loadedArticle.topics || [])
      setOgImageUrl(loadedArticle.og_image_url || '')
      setAssets(loadedArticle.assets || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar artigo')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      if (articleId) {
        // Update existing article
        await articleService.updateArticle(articleId, {
          translations,
          tags,
          topics,
          og_image_url: ogImageUrl || undefined,
        })
      } else {
        // Create new article
        const primaryLanguage = currentLanguage
        await articleService.createArticle({
          translations,
          tags,
          topics,
          primary_language: primaryLanguage as 'pt-BR' | 'en-GB',
          og_image_url: ogImageUrl || undefined,
        })
      }

      if (onSave) {
        onSave()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar artigo')
    } finally {
      setSaving(false)
    }
  }

  const handleUploadAsset = async (file: File, altText?: string, isFeatured?: boolean) => {
    if (!articleId) {
      setError('Salve o artigo antes de adicionar imagens')
      return
    }

    setUploadingAsset(true)
    try {
      await articleService.uploadAsset(articleId, file, altText, isFeatured)
      // Reload article to get updated assets
      await loadArticle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload da imagem')
    } finally {
      setUploadingAsset(false)
    }
  }

  const handleSetFeatured = async (assetId: string) => {
    if (!articleId) return

    try {
      await articleService.setFeaturedAsset(articleId, assetId)
      await loadArticle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao definir imagem destacada')
    }
  }

  const handleRemoveAsset = async (assetId: string) => {
    if (!articleId) return

    try {
      await articleService.removeAsset(articleId, assetId)
      await loadArticle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover imagem')
    }
  }

  const currentTranslation = translations[currentLanguage] || {
    title: '',
    content: '',
  }

  const translationStatus = SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    const trans = translations[lang]
    acc[lang] = {
      complete: !!(trans?.title && trans?.content),
    }
    return acc
  }, {} as Record<string, { complete: boolean }>)

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="article-editor">
      <div className="editor-header">
        <h2>{articleId ? 'Editar Artigo' : 'Novo Artigo'}</h2>
        <div className="editor-header-actions">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="dark-mode-toggle"
            title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {article && <WorkflowStatusBadge status={article.status} />}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <ArticleTranslationTabs
        languages={SUPPORTED_LANGUAGES}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        translations={translationStatus}
      />

      <div className="editor-content">
        <div className="editor-main">
          <div className="form-group">
            <label htmlFor="title">Título *</label>
            <input
              type="text"
              id="title"
              value={currentTranslation.title || ''}
              onChange={(e) => {
                setTranslations({
                  ...translations,
                  [currentLanguage]: {
                    ...currentTranslation,
                    title: e.target.value,
                  },
                })
              }}
              placeholder="Título do artigo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subtitle">Subtítulo</label>
            <input
              type="text"
              id="subtitle"
              value={currentTranslation.subtitle || ''}
              onChange={(e) => {
                setTranslations({
                  ...translations,
                  [currentLanguage]: {
                    ...currentTranslation,
                    subtitle: e.target.value,
                  },
                })
              }}
              placeholder="Subtítulo (opcional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Resumo</label>
            <textarea
              id="excerpt"
              value={currentTranslation.excerpt || ''}
              onChange={(e) => {
                setTranslations({
                  ...translations,
                  [currentLanguage]: {
                    ...currentTranslation,
                    excerpt: e.target.value,
                  },
                })
              }}
              placeholder="Resumo para cards e redes sociais"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Conteúdo *</label>
            <QuillEditor
              value={currentTranslation.content || ''}
              onChange={(value) => {
                setTranslations({
                  ...translations,
                  [currentLanguage]: {
                    ...currentTranslation,
                    content: value,
                  },
                })
              }}
              placeholder="Digite o conteúdo do artigo..."
            />
          </div>

          <div className="form-group">
            <details>
              <summary>Meta Tags (SEO)</summary>
              <div style={{ marginTop: '1rem' }}>
                <label htmlFor="meta-title">Meta Title</label>
                <input
                  type="text"
                  id="meta-title"
                  value={currentTranslation.meta_title || ''}
                  onChange={(e) => {
                    setTranslations({
                      ...translations,
                      [currentLanguage]: {
                        ...currentTranslation,
                        meta_title: e.target.value,
                      },
                    })
                  }}
                />
                <label htmlFor="meta-description">Meta Description</label>
                <textarea
                  id="meta-description"
                  value={currentTranslation.meta_description || ''}
                  onChange={(e) => {
                    setTranslations({
                      ...translations,
                      [currentLanguage]: {
                        ...currentTranslation,
                        meta_description: e.target.value,
                      },
                    })
                  }}
                  rows={2}
                />
              </div>
            </details>
          </div>

          <GrammarChecker
            text={currentTranslation.content || ''}
            language={currentLanguage as 'pt-BR' | 'en-GB'}
          />
        </div>

        <div className="editor-sidebar">
          <ArticleMetadataForm
            tags={tags}
            topics={topics}
            ogImageUrl={ogImageUrl}
            onTagsChange={setTags}
            onTopicsChange={setTopics}
            onOgImageUrlChange={setOgImageUrl}
          />

          {articleId && (
            <ArticleAssetsManager
              assets={assets}
              onUpload={handleUploadAsset}
              onSetFeatured={handleSetFeatured}
              onRemove={handleRemoveAsset}
              uploading={uploadingAsset}
            />
          )}

          <div className="editor-actions">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-save"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
