import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ArticleEditor } from './ArticleEditor'
import articleService, { type Article } from '../../services/articleService'
import articleTypeService, { type ArticleType } from '../../services/articleTypeService'
import { invalidateArticleTypes } from '../../hooks/useArticleTypes'

// The rich text editor is TipTap and the spellcheck panel talks to the API.
// Neither has anything to do with the type contract, and both make this test
// slow and flaky for no return.
vi.mock('../editor/RichTextEditor', () => ({
  RichTextEditor: ({ value }: { value?: string }) => <div data-testid="editor">{value}</div>,
}))
vi.mock('../editor/SpellcheckPanel', () => ({ SpellcheckPanel: () => null }))
vi.mock('../editor/spellcheck/useSpellcheck', () => ({
  useSpellcheck: () => ({
    matches: [],
    isChecking: false,
    isUpToDate: true,
    error: null,
    run: vi.fn(),
    apply: vi.fn(),
    dismiss: vi.fn(),
  }),
}))

afterEach(cleanup)

const news: ArticleType = {
  id: 'id-news',
  slug: 'news',
  name: { 'pt-BR': 'Notícia', 'en-GB': 'News' },
  description: {},
  display_order: 10,
  created_at: '2026-08-18T00:00:00Z',
  updated_at: '2026-08-18T00:00:00Z',
}

const review: ArticleType = { ...news, id: 'id-review', slug: 'review', name: { 'pt-BR': 'Crítica', 'en-GB': 'Review' } }

function article(overrides: Partial<Article> = {}): Article {
  return {
    id: 'article-1',
    slug: 'capela-na-nevoa',
    author_id: 1,
    status: 'draft',
    created_at: '2026-08-18T00:00:00Z',
    updated_at: '2026-08-18T00:00:00Z',
    translations: {
      'pt-BR': {
        id: 't1',
        article_id: 'article-1',
        language_code: 'pt-BR',
        title: 'Capela na névoa',
        content: '<p>corpo</p>',
        created_at: '2026-08-18T00:00:00Z',
        updated_at: '2026-08-18T00:00:00Z',
      },
    },
    ...overrides,
  }
}

beforeEach(() => {
  invalidateArticleTypes()
  // jsdom has no matchMedia, and the editor header offers a dark mode toggle.
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  vi.spyOn(articleTypeService, 'listTypes').mockResolvedValue([news, review])
})

afterEach(() => {
  invalidateArticleTypes()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function renderEditor(articleId?: string) {
  return render(
    <MemoryRouter>
      <ArticleEditor articleId={articleId} />
    </MemoryRouter>,
  )
}

async function save() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /save|salvar/i }))
  })
}

/**
 * Waits for the vocabulary, not merely for the control.
 *
 * The select is rendered disabled until the types arrive, and fireEvent.change
 * on a disabled control does nothing at all -- so waiting for the label made
 * these tests race the fetch and fail perhaps one run in ten.
 */
async function typesLoaded() {
  await waitFor(() => expect(screen.getByRole('option', { name: /review|crítica/i })).toBeTruthy())
  await waitFor(() => expect((screen.getByLabelText(/type/i) as HTMLSelectElement).disabled).toBe(false))
}

async function chooseType(slug: string) {
  await act(async () => {
    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: slug } })
  })
}

describe('ArticleEditor and the article type', () => {
  it('omits the type entirely when creating an article without one', async () => {
    const create = vi.spyOn(articleService, 'createArticle').mockResolvedValue(article())
    renderEditor()

    await typesLoaded()
    await save()

    await waitFor(() => expect(create).toHaveBeenCalled())
    expect(create.mock.calls[0][0].type_slug).toBeUndefined()
  })

  it('sends the chosen slug when creating', async () => {
    const create = vi.spyOn(articleService, 'createArticle').mockResolvedValue(article())
    renderEditor()

    await typesLoaded()
    await chooseType('review')
    await save()

    await waitFor(() => expect(create).toHaveBeenCalled())
    expect(create.mock.calls[0][0].type_slug).toBe('review')
  })

  // The regression the whole three-state contract exists to prevent: a save
  // that is about something else must not disturb the type.
  it('keeps an existing type through a save that changes nothing else', async () => {
    vi.spyOn(articleService, 'getArticle').mockResolvedValue(article({ type: news }))
    const update = vi.spyOn(articleService, 'updateArticle').mockResolvedValue(article({ type: news }))

    renderEditor('article-1')
    await typesLoaded()
    await save()

    await waitFor(() => expect(update).toHaveBeenCalled())
    expect(update.mock.calls[0][1].type_slug).toBe('news')
  })

  // The other half of the contract: '' has to reach the server, because that is
  // the only way to say "no type". `|| undefined` here would make clearing a
  // type impossible and the writer would think the site was broken.
  it('sends an empty string when the writer clears the type', async () => {
    vi.spyOn(articleService, 'getArticle').mockResolvedValue(article({ type: news }))
    const update = vi.spyOn(articleService, 'updateArticle').mockResolvedValue(article())

    renderEditor('article-1')
    await typesLoaded()
    await chooseType('')
    await save()

    await waitFor(() => expect(update).toHaveBeenCalled())
    expect(update.mock.calls[0][1].type_slug).toBe('')
  })

  it('changes the type when the writer picks a different one', async () => {
    vi.spyOn(articleService, 'getArticle').mockResolvedValue(article({ type: news }))
    const update = vi.spyOn(articleService, 'updateArticle').mockResolvedValue(article({ type: review }))

    renderEditor('article-1')
    await typesLoaded()
    await chooseType('review')
    await save()

    await waitFor(() => expect(update).toHaveBeenCalled())
    expect(update.mock.calls[0][1].type_slug).toBe('review')
  })

  // Retiring a type leaves articles carrying it. Without the extra option the
  // control would show a blank selection and the writer would have no idea what
  // the article was classified as.
  it('still shows a retired type the article carries', async () => {
    const retired: ArticleType = { ...news, id: 'id-obit', slug: 'obituary', name: { 'pt-BR': 'Obituário', 'en-GB': 'Obituary' } }
    vi.spyOn(articleService, 'getArticle').mockResolvedValue(article({ type: retired }))
    vi.spyOn(articleService, 'updateArticle').mockResolvedValue(article({ type: retired }))

    renderEditor('article-1')

    await typesLoaded()
    const select = screen.getByLabelText(/type/i) as HTMLSelectElement
    expect(select.value).toBe('obituary')
    expect(screen.getByRole('option', { name: /retired|aposentado/i })).toBeTruthy()
  })
})
