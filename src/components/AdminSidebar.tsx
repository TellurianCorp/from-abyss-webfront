import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Layout,
  Home,
  Globe,
  Radio,
  Link as LinkIcon,
  Video,
  Play,
  Award,
  CreditCard,
  Users,
  User,
  Zap,
  Activity,
} from 'react-feather'
import styles from '../styles/AdminSidebar.module.css'

type FeatherIcon = React.ComponentType<{ size?: number | string; className?: string }>

interface MenuItem {
  id: string
  label: string
  icon: FeatherIcon
  path: string
  module: string
}

interface MenuModule {
  id: string
  label: string
  icon: FeatherIcon
  items: MenuItem[]
}

export function AdminSidebar() {
  const { t } = useTranslation()
  const location = useLocation()

  const menuModules: MenuModule[] = [
    {
      id: 'dashboard',
      label: t('admin.sidebar.dashboard', 'Dashboard'),
      icon: Layout,
      items: [
        {
          id: 'overview',
          label: t('admin.sidebar.overview', 'Overview'),
          icon: Home,
          path: '/admin',
          module: 'dashboard',
        },
      ],
    },
    {
      id: 'fediverse',
      label: t('admin.sidebar.fediverse', 'Fediverse'),
      icon: Globe,
      items: [
        {
          id: 'fediverse-overview',
          label: t('admin.sidebar.fediverseOverview', 'Fediverse Overview'),
          icon: Radio,
          path: '/admin/fediverse',
          module: 'fediverse',
        },
        {
          id: 'activitypub',
          label: t('admin.sidebar.activitypub', 'ActivityPub'),
          icon: LinkIcon,
          path: '/admin/fediverse/activitypub',
          module: 'fediverse',
        },
      ],
    },
    {
      id: 'youtube',
      label: t('admin.sidebar.youtube', 'YouTube'),
      icon: Video,
      items: [
        {
          id: 'youtube-overview',
          label: t('admin.sidebar.youtubeOverview', 'YouTube Overview'),
          icon: Play,
          path: '/admin/youtube',
          module: 'youtube',
        },
      ],
    },
    {
      id: 'patreon',
      label: t('admin.sidebar.patreon', 'Patreon'),
      icon: Award,
      items: [
        {
          id: 'patreon-overview',
          label: t('admin.sidebar.patreonOverview', 'Patreon Overview'),
          icon: CreditCard,
          path: '/admin/patreon',
          module: 'patreon',
        },
      ],
    },
    {
      id: 'users',
      label: t('admin.sidebar.users', 'Users'),
      icon: Users,
      items: [
        {
          id: 'users-management',
          label: t('admin.sidebar.usersManagement', 'User Management'),
          icon: User,
          path: '/admin/users',
          module: 'users',
        },
      ],
    },
    {
      id: 'koliseum',
      label: t('admin.sidebar.koliseum', 'Koliseum'),
      icon: Zap,
      items: [
        {
          id: 'koliseum-admin',
          label: t('admin.sidebar.koliseumAdmin', 'Koliseum Admin'),
          icon: Activity,
          path: '/koliseum-admin',
          module: 'koliseum',
        },
      ],
    },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>
          {t('admin.sidebar.title', 'Admin Panel')}
        </h2>
      </div>
      
      <nav className={styles.sidebarNav}>
        {menuModules.map((module) => {
          const ModuleIcon = module.icon
          return (
            <div key={module.id} className={styles.menuModule}>
              <div className={styles.moduleHeader}>
                <ModuleIcon size={18} className={styles.moduleIcon} />
                <span className={styles.moduleLabel}>{module.label}</span>
              </div>
              <ul className={styles.moduleItems}>
                {module.items.map((item) => {
                  const ItemIcon = item.icon
                  return (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        className={`${styles.menuItem} ${isActive(item.path) ? styles.menuItemActive : ''}`}
                      >
                        <ItemIcon size={18} className={styles.menuIcon} />
                        <span className={styles.menuLabel}>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
