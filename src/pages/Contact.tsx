import { useState, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LanguageSelector } from '../components/LanguageSelector'
import './Contact.css'

function getIssueNumber() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0')
  return `${year}.${month}`
}

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export function Contact() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = t('contact.form.required')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.required')
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('contact.form.invalidEmail')
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.form.required')
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // TODO: Replace with actual API endpoint
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080'
      
      const response = await fetch(`${API_BASE_URL}/v1/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setErrors({})
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="page">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-top">
            <div className="navbar-left">
              <Link to="/">
                <img src="/imgs/logo.png" alt="From Abyss Media" className="navbar-logo" />
              </Link>
              <div className="navbar-brand">
                <span className="navbar-badge">{t('navbar.badge')}</span>
                <p className="navbar-issue">{t('navbar.issue', { issue: getIssueNumber() })}</p>
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
                { id: 'movies', label: t('navbar.menu.movies', 'Movies') },
              ].map((item, index, array) => (
                <span key={item.id}>
                  <Link to={`/#${item.id}`} className="navbar-menu-item">
                    {item.label}
                  </Link>
                  {index < array.length - 1 && <span className="navbar-menu-separator">|</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <div className="contact-container">
          <section className="section contact-section">
            <div className="section-header">
              <h1>{t('contact.title')}</h1>
              <p className="contact-subtitle">{t('contact.subtitle')}</p>
            </div>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">{t('contact.form.name')}</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder={t('contact.form.namePlaceholder')}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">{t('contact.form.email')}</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder={t('contact.form.emailPlaceholder')}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="subject">{t('contact.form.subject')}</label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange('subject')}
                  placeholder={t('contact.form.subjectPlaceholder')}
                  className={errors.subject ? 'error' : ''}
                />
                {errors.subject && <span className="error-message">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="message">{t('contact.form.message')}</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange('message')}
                  placeholder={t('contact.form.messagePlaceholder')}
                  rows={6}
                  className={errors.message ? 'error' : ''}
                />
                {errors.message && <span className="error-message">{errors.message}</span>}
              </div>

              {submitStatus === 'success' && (
                <div className="form-message success">
                  {t('contact.form.success')}
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="form-message error">
                  {t('contact.form.error')}
                </div>
              )}

              <button type="submit" className="contact-submit" disabled={isSubmitting}>
                {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
              </button>
            </form>
          </section>
        </div>
      </div>
      <footer className="footer">
        <img className="footer-logo" src="/imgs/tellurian_white.png" alt="Tellurian" />
        <div className="footer-links">
          <Link to="/about" className="footer-link">{t('footer.aboutUs')}</Link>
          <span className="footer-separator">|</span>
          <Link to="/editorial" className="footer-link">{t('footer.focusEditorial')}</Link>
          <span className="footer-separator">|</span>
          <Link to="/contact" className="footer-link">{t('footer.contactUs')}</Link>
        </div>
        <div className="footer-text-container">
          <p className="footer-text">{t('common.madeBy')}</p>
          <p className="footer-text">{t('common.allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  )
}
