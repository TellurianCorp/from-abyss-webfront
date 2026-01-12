import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LanguageSelector } from '../components/LanguageSelector'
import './Roadmap.css'

interface GitHubMilestone {
  id: number
  title: string
  description: string | null
  state: 'open' | 'closed'
  open_issues: number
  closed_issues: number
  due_on: string | null
  html_url: string
  created_at: string
  updated_at: string
}

interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  html_url: string
  labels: Array<{ name: string; color: string; description?: string }>
  milestone: { title: string } | null
  created_at: string
  updated_at: string
  user?: { login: string; avatar_url: string }
}

interface RepoRoadmap {
  repo: string
  displayName: string
  description: string
  milestones: GitHubMilestone[]
  issues: GitHubIssue[]
  lastFetched: number
}

interface CachedData {
  repos: RepoRoadmap[]
  timestamp: number
}

type ModalContent =
  | { type: 'milestone'; data: GitHubMilestone; repoName: string }
  | { type: 'issue'; data: GitHubIssue; repoName: string }
  | null

// GitHub repos to track
const TRACKED_REPOS = [
  {
    owner: 'TellurianCorp',
    repo: 'from-abyss-webfront',
    displayName: 'From Abyss Webfront',
    description: 'React-based multimedia portal for the horror community'
  },
  {
    owner: 'TellurianCorp',
    repo: 'from-abyss-api',
    displayName: 'From Abyss API',
    description: 'Golang control layer serving REST/GraphQL endpoints'
  },
  {
    owner: 'FromAbyssStudio',
    repo: 'koliseum',
    displayName: 'Koliseum',
    description: 'Gaming platform and competitive infrastructure'
  },
  {
    owner: 'TellurianCorp',
    repo: 'HydraMedia',
    displayName: 'Hydra Media',
    description: 'Media processing and distribution pipeline'
  }
]

// Cache duration: 10 minutes (prevents excessive API calls)
const CACHE_DURATION_MS = 10 * 60 * 1000
const CACHE_KEY = 'from_abyss_roadmap_cache'

function getIssueNumber() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0')
  return `${year}.${month}`
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getTimeSinceUpdate(timestamp: number): string {
  const now = Date.now()
  const diffMs = now - timestamp
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

function getLabelStyle(color: string) {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  const textColor = brightness > 128 ? '#0C0C0C' : '#E8E2D9'

  return {
    backgroundColor: `#${color}`,
    color: textColor
  }
}

// Detail Modal Component
function DetailModal({
  content,
  onClose
}: {
  content: ModalContent
  onClose: () => void
}) {
  const { t } = useTranslation()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!content) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (content.type === 'milestone') {
    const milestone = content.data
    const progress =
      milestone.open_issues + milestone.closed_issues > 0
        ? Math.round(
            (milestone.closed_issues /
              (milestone.open_issues + milestone.closed_issues)) *
              100
          )
        : 0

    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-container">
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>

          <div className="modal-header">
            <span className="modal-badge">{content.repoName}</span>
            <div className="modal-title-row">
              <span
                className={`modal-state-icon ${milestone.state === 'closed' ? 'completed' : ''}`}
              >
                {milestone.state === 'closed' ? '✓' : '◎'}
              </span>
              <h2 className="modal-title">{milestone.title}</h2>
            </div>
            <span className={`modal-status ${milestone.state}`}>
              {milestone.state === 'closed'
                ? t('roadmap.modal.completed', 'Completed')
                : t('roadmap.modal.inProgress', 'In Progress')}
            </span>
          </div>

          <div className="modal-body">
            {milestone.description && (
              <div className="modal-section">
                <h3 className="modal-section-title">
                  {t('roadmap.modal.description', 'Description')}
                </h3>
                <p className="modal-description">{milestone.description}</p>
              </div>
            )}

            <div className="modal-section">
              <h3 className="modal-section-title">
                {t('roadmap.modal.progress', 'Progress')}
              </h3>
              <div className="modal-progress">
                <div className="modal-progress-bar">
                  <div
                    className={`modal-progress-fill ${milestone.state === 'closed' ? 'completed' : ''}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="modal-progress-stats">
                  <span className="modal-progress-percent">{progress}%</span>
                  <span className="modal-progress-detail">
                    {milestone.closed_issues}{' '}
                    {t('roadmap.modal.of', 'of')}{' '}
                    {milestone.open_issues + milestone.closed_issues}{' '}
                    {t('roadmap.modal.issuesCompleted', 'issues completed')}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-meta-grid">
              {milestone.due_on && (
                <div className="modal-meta-item">
                  <span className="modal-meta-label">
                    {t('roadmap.modal.dueDate', 'Due Date')}
                  </span>
                  <span className="modal-meta-value">
                    {formatDate(milestone.due_on)}
                  </span>
                </div>
              )}
              <div className="modal-meta-item">
                <span className="modal-meta-label">
                  {t('roadmap.modal.created', 'Created')}
                </span>
                <span className="modal-meta-value">
                  {formatFullDate(milestone.created_at)}
                </span>
              </div>
              <div className="modal-meta-item">
                <span className="modal-meta-label">
                  {t('roadmap.modal.lastUpdated', 'Last Updated')}
                </span>
                <span className="modal-meta-value">
                  {formatFullDate(milestone.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (content.type === 'issue') {
    const issue = content.data

    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-container">
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>

          <div className="modal-header">
            <span className="modal-badge">{content.repoName}</span>
            <div className="modal-title-row">
              <span
                className={`modal-state-icon ${issue.state === 'closed' ? 'completed' : ''}`}
              >
                {issue.state === 'closed' ? '✓' : '○'}
              </span>
              <h2 className="modal-title">
                <span className="modal-issue-number">#{issue.number}</span>
                {issue.title}
              </h2>
            </div>
            <span className={`modal-status ${issue.state}`}>
              {issue.state === 'closed'
                ? t('roadmap.modal.closed', 'Closed')
                : t('roadmap.modal.open', 'Open')}
            </span>
          </div>

          <div className="modal-body">
            {issue.labels.length > 0 && (
              <div className="modal-labels">
                {issue.labels.map((label) => (
                  <span
                    key={label.name}
                    className="modal-label"
                    style={getLabelStyle(label.color)}
                    title={label.description}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            {issue.body && (
              <div className="modal-section">
                <h3 className="modal-section-title">
                  {t('roadmap.modal.description', 'Description')}
                </h3>
                <div className="modal-description modal-issue-body">
                  {issue.body}
                </div>
              </div>
            )}

            {!issue.body && (
              <div className="modal-section">
                <p className="modal-empty-description">
                  {t('roadmap.modal.noDescription', 'No description provided.')}
                </p>
              </div>
            )}

            <div className="modal-meta-grid">
              {issue.milestone && (
                <div className="modal-meta-item">
                  <span className="modal-meta-label">
                    {t('roadmap.modal.milestone', 'Milestone')}
                  </span>
                  <span className="modal-meta-value">
                    {issue.milestone.title}
                  </span>
                </div>
              )}
              <div className="modal-meta-item">
                <span className="modal-meta-label">
                  {t('roadmap.modal.created', 'Created')}
                </span>
                <span className="modal-meta-value">
                  {formatFullDate(issue.created_at)}
                </span>
              </div>
              <div className="modal-meta-item">
                <span className="modal-meta-label">
                  {t('roadmap.modal.lastUpdated', 'Last Updated')}
                </span>
                <span className="modal-meta-value">
                  {formatFullDate(issue.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export function Roadmap() {
  const { t } = useTranslation()
  const [roadmapData, setRoadmapData] = useState<RepoRoadmap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [modalContent, setModalContent] = useState<ModalContent>(null)
  const [activeRepo, setActiveRepo] = useState<string | null>(null)

  const fetchRepoData = async (
    owner: string,
    repo: string,
    displayName: string,
    description: string
  ): Promise<RepoRoadmap> => {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json'
    }

    const [milestonesRes, issuesRes] = await Promise.all([
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/milestones?state=all&per_page=10`,
        { headers }
      ),
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=30&labels=roadmap,feature,enhancement`,
        { headers }
      )
    ])

    const rateLimitRemaining = milestonesRes.headers.get('X-RateLimit-Remaining')
    if (rateLimitRemaining && parseInt(rateLimitRemaining) < 5) {
      console.warn('GitHub API rate limit approaching, using cached data')
    }

    let milestones: GitHubMilestone[] = []
    let issues: GitHubIssue[] = []

    if (milestonesRes.ok) {
      milestones = await milestonesRes.json()
    }

    if (issuesRes.ok) {
      issues = await issuesRes.json()
      issues = issues.filter((issue: any) => !issue.pull_request)
    }

    return {
      repo: `${owner}/${repo}`,
      displayName,
      description,
      milestones,
      issues,
      lastFetched: Date.now()
    }
  }

  const loadCachedData = (): CachedData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const data: CachedData = JSON.parse(cached)
        return data
      }
    } catch (e) {
      console.warn('Failed to parse cached roadmap data:', e)
    }
    return null
  }

  const saveCacheData = (repos: RepoRoadmap[]) => {
    const data: CachedData = {
      repos,
      timestamp: Date.now()
    }
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Failed to cache roadmap data:', e)
    }
  }

  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION_MS
  }

  const fetchAllRepos = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = loadCachedData()
      if (cached && isCacheValid(cached.timestamp)) {
        setRoadmapData(cached.repos)
        setLastUpdate(cached.timestamp)
        setLoading(false)
        return
      }
    }

    setIsRefreshing(true)

    try {
      const results = await Promise.allSettled(
        TRACKED_REPOS.map((r) =>
          fetchRepoData(r.owner, r.repo, r.displayName, r.description)
        )
      )

      const successfulResults: RepoRoadmap[] = []
      const cachedData = loadCachedData()

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResults.push(result.value)
        } else {
          const repoKey = `${TRACKED_REPOS[index].owner}/${TRACKED_REPOS[index].repo}`
          const cachedRepo = cachedData?.repos.find((r) => r.repo === repoKey)
          if (cachedRepo) {
            successfulResults.push(cachedRepo)
          } else {
            successfulResults.push({
              repo: repoKey,
              displayName: TRACKED_REPOS[index].displayName,
              description: TRACKED_REPOS[index].description,
              milestones: [],
              issues: [],
              lastFetched: 0
            })
          }
        }
      })

      setRoadmapData(successfulResults)
      setLastUpdate(Date.now())
      saveCacheData(successfulResults)
      setError(null)
    } catch (err) {
      const cached = loadCachedData()
      if (cached) {
        setRoadmapData(cached.repos)
        setLastUpdate(cached.timestamp)
        setError('Using cached data (API unavailable)')
      } else {
        setError('Failed to fetch roadmap data')
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  const handleRefresh = () => {
    fetchAllRepos(true)
  }

  useEffect(() => {
    fetchAllRepos()
  }, [fetchAllRepos])

  const getMilestoneProgress = (milestone: GitHubMilestone) => {
    const total = milestone.open_issues + milestone.closed_issues
    if (total === 0) return 0
    return Math.round((milestone.closed_issues / total) * 100)
  }

  const openMilestoneModal = (milestone: GitHubMilestone, repoName: string) => {
    setModalContent({ type: 'milestone', data: milestone, repoName })
  }

  const openIssueModal = (issue: GitHubIssue, repoName: string) => {
    setModalContent({ type: 'issue', data: issue, repoName })
  }

  const closeModal = () => {
    setModalContent(null)
  }

  // Calculate total stats
  const totalStats = roadmapData.reduce(
    (acc, repo) => {
      acc.totalMilestones += repo.milestones.length
      acc.completedMilestones += repo.milestones.filter(
        (m) => m.state === 'closed'
      ).length
      acc.totalIssues += repo.issues.length
      acc.closedIssues += repo.issues.filter((i) => i.state === 'closed').length
      return acc
    },
    {
      totalMilestones: 0,
      completedMilestones: 0,
      totalIssues: 0,
      closedIssues: 0
    }
  )

  return (
    <div className="page">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-top">
            <div className="navbar-left">
              <Link to="/">
                <img
                  src="/imgs/logo.png"
                  alt="From Abyss Media"
                  className="navbar-logo"
                />
              </Link>
              <div className="navbar-brand">
                <span className="navbar-badge">{t('navbar.badge')}</span>
                <p className="navbar-issue">
                  {t('navbar.issue', { issue: getIssueNumber() })}
                </p>
              </div>
            </div>
            <div className="navbar-right">
              <div className="navbar-language">
                <LanguageSelector />
              </div>
            </div>
          </div>
          <div className="navbar-menu-row">
            <div className="navbar-menu">
              {[
                { id: 'articles', label: t('navbar.menu.articles', 'Articles') },
                { id: 'comics', label: t('navbar.menu.comics', 'Comics') },
                { id: 'books', label: t('navbar.menu.books', 'Books') },
                { id: 'music', label: t('navbar.menu.music', 'Music') },
                { id: 'games', label: t('navbar.menu.games', 'Games') },
                { id: 'movies', label: t('navbar.menu.movies', 'Movies') }
              ].map((item, index, array) => (
                <span key={item.id}>
                  <Link to={`/#${item.id}`} className="navbar-menu-item">
                    {item.label}
                  </Link>
                  {index < array.length - 1 && (
                    <span className="navbar-menu-separator">|</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <div className="roadmap-container">
          <header className="roadmap-header">
            <div className="roadmap-header-content">
              <h1 className="roadmap-title">
                {t('roadmap.title', 'Project Roadmap')}
              </h1>
              <p className="roadmap-subtitle">
                {t(
                  'roadmap.subtitle',
                  'Live development status synced from GitHub'
                )}
              </p>
            </div>
            <div className="roadmap-actions">
              <div className="roadmap-sync-status">
                <span
                  className={`roadmap-sync-dot ${isRefreshing ? 'syncing' : 'synced'}`}
                />
                <span className="roadmap-last-update">
                  {lastUpdate > 0
                    ? t('roadmap.lastSync', 'Synced {{time}}', {
                        time: getTimeSinceUpdate(lastUpdate)
                      })
                    : t('roadmap.syncing', 'Syncing...')}
                </span>
              </div>
              <button
                className="roadmap-refresh-btn"
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-label="Refresh"
              >
                <span
                  className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`}
                >
                  ↻
                </span>
                <span className="refresh-text">
                  {isRefreshing
                    ? t('roadmap.refreshing', 'Refreshing...')
                    : t('roadmap.refresh', 'Refresh')}
                </span>
              </button>
            </div>
          </header>

          {/* Stats Overview */}
          {!loading && roadmapData.length > 0 && (
            <div className="roadmap-stats">
              <div className="stat-card">
                <span className="stat-value">{roadmapData.length}</span>
                <span className="stat-label">
                  {t('roadmap.stats.repositories', 'Repositories')}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {totalStats.completedMilestones}/{totalStats.totalMilestones}
                </span>
                <span className="stat-label">
                  {t('roadmap.stats.milestones', 'Milestones')}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {totalStats.closedIssues}/{totalStats.totalIssues}
                </span>
                <span className="stat-label">
                  {t('roadmap.stats.issues', 'Issues')}
                </span>
              </div>
              <div className="stat-card accent">
                <span className="stat-value">
                  {totalStats.totalIssues > 0
                    ? Math.round(
                        (totalStats.closedIssues / totalStats.totalIssues) * 100
                      )
                    : 0}
                  %
                </span>
                <span className="stat-label">
                  {t('roadmap.stats.completion', 'Completion')}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="roadmap-error">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          {loading && !roadmapData.length ? (
            <div className="roadmap-loading">
              <div className="loading-spinner" />
              <p>{t('roadmap.loading', 'Loading roadmap data...')}</p>
            </div>
          ) : (
            <>
              {/* Repository Tabs */}
              <div className="repo-tabs">
                <button
                  className={`repo-tab ${activeRepo === null ? 'active' : ''}`}
                  onClick={() => setActiveRepo(null)}
                >
                  {t('roadmap.allRepositories', 'All Repositories')}
                </button>
                {roadmapData.map((repo) => (
                  <button
                    key={repo.repo}
                    className={`repo-tab ${activeRepo === repo.repo ? 'active' : ''}`}
                    onClick={() => setActiveRepo(repo.repo)}
                  >
                    {repo.displayName}
                  </button>
                ))}
              </div>

              <div className="roadmap-repos">
                {roadmapData
                  .filter((repo) => activeRepo === null || repo.repo === activeRepo)
                  .map((repo) => (
                    <section key={repo.repo} className="repo-section">
                      <div className="repo-header">
                        <div className="repo-info">
                          <h2 className="repo-name">{repo.displayName}</h2>
                          <p className="repo-description">{repo.description}</p>
                        </div>
                        <div className="repo-quick-stats">
                          <span className="quick-stat">
                            <span className="quick-stat-icon">◎</span>
                            {repo.milestones.length}{' '}
                            {t('roadmap.milestones', 'Milestones')}
                          </span>
                          <span className="quick-stat">
                            <span className="quick-stat-icon">○</span>
                            {repo.issues.length} {t('roadmap.issues', 'Issues')}
                          </span>
                        </div>
                      </div>

                      {repo.milestones.length > 0 && (
                        <div className="milestones-section">
                          <h3 className="section-label">
                            <span className="section-label-icon">◎</span>
                            {t('roadmap.milestones', 'Milestones')}
                          </h3>
                          <div className="milestones-grid">
                            {repo.milestones.map((milestone) => (
                              <button
                                key={milestone.id}
                                className={`milestone-card ${milestone.state === 'closed' ? 'completed' : ''}`}
                                onClick={() =>
                                  openMilestoneModal(milestone, repo.displayName)
                                }
                              >
                                <div className="milestone-header">
                                  <span
                                    className={`milestone-state ${milestone.state}`}
                                  >
                                    {milestone.state === 'closed' ? '✓' : '○'}
                                  </span>
                                  <h4 className="milestone-title">
                                    {milestone.title}
                                  </h4>
                                </div>
                                {milestone.description && (
                                  <p className="milestone-description">
                                    {milestone.description}
                                  </p>
                                )}
                                <div className="milestone-progress">
                                  <div className="progress-bar">
                                    <div
                                      className="progress-fill"
                                      style={{
                                        width: `${getMilestoneProgress(milestone)}%`
                                      }}
                                    />
                                  </div>
                                  <div className="progress-info">
                                    <span className="progress-text">
                                      {getMilestoneProgress(milestone)}%
                                    </span>
                                    <span className="progress-count">
                                      {milestone.closed_issues}/
                                      {milestone.open_issues +
                                        milestone.closed_issues}
                                    </span>
                                  </div>
                                </div>
                                {milestone.due_on && (
                                  <p className="milestone-due">
                                    {t('roadmap.dueDate', 'Due: {{date}}', {
                                      date: formatDate(milestone.due_on)
                                    })}
                                  </p>
                                )}
                                <span className="milestone-view-hint">
                                  {t('roadmap.clickToView', 'Click for details')}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {repo.issues.length > 0 && (
                        <div className="issues-section">
                          <h3 className="section-label">
                            <span className="section-label-icon">○</span>
                            {t(
                              'roadmap.featuresPlanned',
                              'Features & Planned Work'
                            )}
                          </h3>
                          <div className="issues-list">
                            {repo.issues.slice(0, 10).map((issue) => (
                              <button
                                key={issue.id}
                                className={`issue-item ${issue.state}`}
                                onClick={() =>
                                  openIssueModal(issue, repo.displayName)
                                }
                              >
                                <span className={`issue-state ${issue.state}`}>
                                  {issue.state === 'closed' ? '✓' : '○'}
                                </span>
                                <span className="issue-number">
                                  #{issue.number}
                                </span>
                                <span className="issue-title">{issue.title}</span>
                                <div className="issue-labels">
                                  {issue.labels.slice(0, 3).map((label) => (
                                    <span
                                      key={label.name}
                                      className="issue-label"
                                      style={getLabelStyle(label.color)}
                                    >
                                      {label.name}
                                    </span>
                                  ))}
                                  {issue.labels.length > 3 && (
                                    <span className="issue-label-more">
                                      +{issue.labels.length - 3}
                                    </span>
                                  )}
                                </div>
                                <span className="issue-view-hint">→</span>
                              </button>
                            ))}
                          </div>
                          {repo.issues.length > 10 && (
                            <p className="issues-more">
                              {t(
                                'roadmap.moreIssues',
                                '+{{count}} more issues',
                                { count: repo.issues.length - 10 }
                              )}
                            </p>
                          )}
                        </div>
                      )}

                      {repo.milestones.length === 0 &&
                        repo.issues.length === 0 && (
                          <div className="repo-empty">
                            <span className="empty-icon">📋</span>
                            <p className="empty-text">
                              {t(
                                'roadmap.noData',
                                'No milestones or roadmap issues available'
                              )}
                            </p>
                          </div>
                        )}
                    </section>
                  ))}
              </div>
            </>
          )}

          <div className="roadmap-footer-note">
            <p>
              {t(
                'roadmap.note',
                'Data synced from GitHub. Updates refresh every 10 minutes to respect API limits.'
              )}
            </p>
          </div>
        </div>
      </div>

      <footer className="footer">
        <img
          className="footer-logo"
          src="/imgs/tellurian_white.png"
          alt="Tellurian"
        />
        <div className="footer-links">
          <Link to="/about" className="footer-link">
            {t('footer.aboutUs')}
          </Link>
          <span className="footer-separator">|</span>
          <Link to="/editorial" className="footer-link">
            {t('footer.focusEditorial')}
          </Link>
          <span className="footer-separator">|</span>
          <Link to="/roadmap" className="footer-link">
            {t('footer.roadmap', 'Roadmap')}
          </Link>
          <span className="footer-separator">|</span>
          <Link to="/contact" className="footer-link">
            {t('footer.contactUs')}
          </Link>
        </div>
        <div className="footer-text-container">
          <p className="footer-text">{t('common.madeBy')}</p>
          <p className="footer-text">{t('common.allRightsReserved')}</p>
        </div>
      </footer>

      {/* Detail Modal */}
      {modalContent && (
        <DetailModal content={modalContent} onClose={closeModal} />
      )}
    </div>
  )
}
