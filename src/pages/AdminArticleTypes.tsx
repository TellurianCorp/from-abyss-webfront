import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AdminNavbar } from '../components/AdminNavbar'
import { AdminSidebar } from '../components/AdminSidebar'
import { articleTypeLabel } from '../components/articles/articleTypeLabel'
import { useArticleTypes } from '../hooks/useArticleTypes'
import articleTypeService, { type ArticleType } from '../services/articleTypeService'
import layout from '../styles/AdminLayout.module.css'
import styles from './AdminArticleTypes.module.css'

interface DraftState {
  slug: string
  namePt: string
  nameEn: string
  descriptionPt: string
  descriptionEn: string
  displayOrder: string
}

const emptyDraft: DraftState = {
  slug: '',
  namePt: '',
  nameEn: '',
  descriptionPt: '',
  descriptionEn: '',
  displayOrder: '0',
}

function draftFrom(articleType: ArticleType): DraftState {
  return {
    slug: articleType.slug,
    namePt: articleType.name?.['pt-BR'] || '',
    nameEn: articleType.name?.['en-GB'] || '',
    descriptionPt: articleType.description?.['pt-BR'] || '',
    descriptionEn: articleType.description?.['en-GB'] || '',
    displayOrder: String(articleType.display_order ?? 0),
  }
}

export function AdminArticleTypes() {
  const { t, i18n } = useTranslation()
  const { types, loading, error, refresh } = useArticleTypes()
  const language = i18n.language || 'pt-BR'

  const [editing, setEditing] = useState<ArticleType | null>(null)
  const [draft, setDraft] = useState<DraftState>(emptyDraft)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const startCreate = () => {
    setEditing(null)
    setDraft(emptyDraft)
    setFormError(null)
    setNotice(null)
  }

  const startEdit = (articleType: ArticleType) => {
    setEditing(articleType)
    setDraft(draftFrom(articleType))
    setFormError(null)
    setNotice(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setFormError(null)
    setNotice(null)

    const name = { 'pt-BR': draft.namePt.trim(), 'en-GB': draft.nameEn.trim() }
    const description = {
      'pt-BR': draft.descriptionPt.trim(),
      'en-GB': draft.descriptionEn.trim(),
    }
    const parsedOrder = Number.parseInt(draft.displayOrder, 10)
    const displayOrder = Number.isNaN(parsedOrder) ? undefined : parsedOrder

    try {
      if (editing) {
        await articleTypeService.updateType(editing.id, {
          name,
          description,
          display_order: displayOrder,
        })
      } else {
        await articleTypeService.createType({
          slug: draft.slug.trim().toLowerCase(),
          name,
          description,
          display_order: displayOrder,
        })
      }
      await refresh()
      startCreate()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const handleRetire = async (articleType: ArticleType) => {
    setFormError(null)
    setNotice(null)
    try {
      const result = await articleTypeService.retireType(articleType.id)
      await refresh()
      if (editing?.id === articleType.id) startCreate()
      setNotice(
        t('admin.articleTypes.retired', '{{name}} retired. {{count}} article(s) keep showing it.', {
          name: articleTypeLabel(articleType, language),
          count: result?.articles_affected ?? 0,
        }),
      )
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className={layout.adminPage}>
      <AdminNavbar />
      <div className={layout.adminLayout}>
        <AdminSidebar />
        <main className={layout.adminContent}>
          <div className={layout.pageHeader}>
            <h1 className={layout.pageTitle}>{t('admin.articleTypes.title', 'Article types')}</h1>
            <p className={layout.pageDescription}>
              {t(
                'admin.articleTypes.description',
                'The editorial vocabulary: News, Review, Opinion and the rest. Names are served from here, so an edit shows up on the site immediately.',
              )}
            </p>
          </div>

          <div className={layout.contentSection}>
            <div className={styles.layout}>
              <div>
                {error && <p className={styles.error}>{error}</p>}
                {notice && <p className={styles.notice}>{notice}</p>}
                {loading ? (
                  <p>{t('admin.articleTypes.loading', 'Loading...')}</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>{t('admin.articleTypes.colName', 'Name')}</th>
                        <th>{t('admin.articleTypes.colSlug', 'Slug')}</th>
                        <th>{t('admin.articleTypes.colOrder', 'Order')}</th>
                        <th>{t('admin.articleTypes.colActions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {types.map((articleType) => (
                        <tr key={articleType.id}>
                          <td>{articleTypeLabel(articleType, language)}</td>
                          <td className={styles.slug}>{articleType.slug}</td>
                          <td>{articleType.display_order}</td>
                          <td>
                            <div className={styles.actions}>
                              <button type="button" onClick={() => startEdit(articleType)}>
                                {t('admin.articleTypes.edit', 'Edit')}
                              </button>
                              <button type="button" onClick={() => void handleRetire(articleType)}>
                                {t('admin.articleTypes.retire', 'Retire')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
                <h2>
                  {editing
                    ? t('admin.articleTypes.editing', 'Edit {{name}}', {
                        name: articleTypeLabel(editing, language),
                      })
                    : t('admin.articleTypes.creating', 'New type')}
                </h2>

                {formError && <p className={styles.error}>{formError}</p>}

                <div className={styles.field}>
                  <label htmlFor="fa-type-slug">{t('admin.articleTypes.slug', 'Slug')}</label>
                  <input
                    id="fa-type-slug"
                    value={draft.slug}
                    required={!editing}
                    /* The slug is in a public URL, so it is fixed once created:
                       renaming it would break links that already exist. The way
                       to change one is a new type and a reclassification. */
                    disabled={Boolean(editing)}
                    onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
                    placeholder="news"
                  />
                  <p className={styles.hint}>
                    {t(
                      'admin.articleTypes.slugHint',
                      'Lowercase words joined by hyphens. Cannot be changed later: it is part of the public address.',
                    )}
                  </p>
                </div>

                <div className={styles.field}>
                  <label htmlFor="fa-type-name-pt">
                    {t('admin.articleTypes.namePt', 'Name (pt-BR)')}
                  </label>
                  <input
                    id="fa-type-name-pt"
                    value={draft.namePt}
                    required
                    onChange={(event) => setDraft({ ...draft, namePt: event.target.value })}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="fa-type-name-en">
                    {t('admin.articleTypes.nameEn', 'Name (en-GB)')}
                  </label>
                  <input
                    id="fa-type-name-en"
                    value={draft.nameEn}
                    required
                    onChange={(event) => setDraft({ ...draft, nameEn: event.target.value })}
                  />
                  <p className={styles.hint}>
                    {t(
                      'admin.articleTypes.nameHint',
                      'Both languages are required: a missing one would show as a bare slug to half the readers.',
                    )}
                  </p>
                </div>

                <div className={styles.field}>
                  <label htmlFor="fa-type-desc-pt">
                    {t('admin.articleTypes.descriptionPt', 'Description (pt-BR)')}
                  </label>
                  <textarea
                    id="fa-type-desc-pt"
                    rows={2}
                    value={draft.descriptionPt}
                    onChange={(event) => setDraft({ ...draft, descriptionPt: event.target.value })}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="fa-type-desc-en">
                    {t('admin.articleTypes.descriptionEn', 'Description (en-GB)')}
                  </label>
                  <textarea
                    id="fa-type-desc-en"
                    rows={2}
                    value={draft.descriptionEn}
                    onChange={(event) => setDraft({ ...draft, descriptionEn: event.target.value })}
                  />
                  <p className={styles.hint}>
                    {t(
                      'admin.articleTypes.descriptionHint',
                      'Used as the page description for the type page.',
                    )}
                  </p>
                </div>

                <div className={styles.field}>
                  <label htmlFor="fa-type-order">
                    {t('admin.articleTypes.displayOrder', 'Display order')}
                  </label>
                  <input
                    id="fa-type-order"
                    type="number"
                    value={draft.displayOrder}
                    onChange={(event) => setDraft({ ...draft, displayOrder: event.target.value })}
                  />
                </div>

                <div className={styles.actions}>
                  <button type="submit" disabled={saving}>
                    {saving
                      ? t('admin.articleTypes.saving', 'Saving...')
                      : t('admin.articleTypes.save', 'Save')}
                  </button>
                  {editing && (
                    <button type="button" onClick={startCreate}>
                      {t('admin.articleTypes.cancel', 'Cancel')}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminArticleTypes
