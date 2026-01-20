import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import pageStyles from '../styles/Page.module.css'
import cardStyles from '../styles/Cards.module.css'
import footerStyles from '../styles/Footer.module.css'
import './Contact.css'
import { useSEO } from '../hooks/useSEO'

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

  useSEO({
    title: t('seo.contact.title'),
    description: t('seo.contact.description'),
    image: 'https://fromabyss.com/imgs/cover.png',
    url: 'https://fromabyss.com/contact',
    type: 'website',
    siteName: 'From Abyss Media',
  })
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
    <div className={pageStyles.page}>
      <Navbar />

      <main className={pageStyles.pageContent} role="main">
        <div className="contact-container">
          <section className={`${cardStyles.section} contact-section`}>
            <div className={cardStyles.sectionHeader}>
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
      </main>

      <footer className={footerStyles.footer} role="contentinfo">
        <img className={footerStyles.footerLogo} src="/imgs/tellurian_white.png" alt="Tellurian" />
        <nav className={footerStyles.footerLinks} aria-label="Footer navigation">
          <Link to="/about" className={footerStyles.footerLink}>{t('footer.aboutUs')}</Link>
          <span className={footerStyles.footerSeparator} aria-hidden="true">|</span>
          <Link to="/editorial" className={footerStyles.footerLink}>{t('footer.focusEditorial')}</Link>
          <span className={footerStyles.footerSeparator} aria-hidden="true">|</span>
          <Link to="/contact" className={footerStyles.footerLink}>{t('footer.contactUs')}</Link>
        </nav>
        <div className={footerStyles.footerTextContainer}>
          <p className={footerStyles.footerText}>{t('common.madeBy')}</p>
          <p className={footerStyles.footerText}>{t('common.allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  )
}
