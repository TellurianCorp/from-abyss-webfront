import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navbar } from '../components/Navbar'
import { apiUrl } from '../utils/api'
import pageStyles from '../styles/Page.module.css'
import styles from './Profile.module.css'

interface UserInfo {
  id: string
  name?: string
  email?: string
  picture?: string
  fediverse_handle?: string
  account_visibility?: 'public' | 'private'
}

export function Profile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    picture: '',
    account_visibility: 'public' as 'public' | 'private',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Try /v1/auth/me first, then /v1/me as fallback
      let response = await fetch(apiUrl('/v1/auth/me'), {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        response = await fetch(apiUrl('/v1/me'), {
          method: 'GET',
          credentials: 'include',
        })
      }

      if (response.ok) {
        const userData = await response.json()
        setUserInfo(userData)
        
        // Fetch account visibility
        let accountVisibility = 'public'
        try {
          const visibilityResponse = await fetch(apiUrl('/v1/activitypub/account-visibility'), {
            method: 'GET',
            credentials: 'include',
          })
          if (visibilityResponse.ok) {
            const visibilityData = await visibilityResponse.json()
            accountVisibility = visibilityData.visibility || 'public'
          }
        } catch (err) {
          console.error('Failed to fetch account visibility:', err)
        }
        
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          picture: userData.picture || '',
          account_visibility: accountVisibility as 'public' | 'private',
        })
      } else {
        setError(t('profile.error.load', 'Failed to load profile'))
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setError(t('profile.error.load', 'Failed to load profile'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Update user profile
      const response = await fetch(apiUrl('/v1/auth/me'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUserInfo(updatedUser)
        
        // Update account visibility separately
        try {
          const visibilityResponse = await fetch(apiUrl('/v1/activitypub/account-visibility'), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ visibility: formData.account_visibility }),
          })
          if (!visibilityResponse.ok) {
            console.error('Failed to update account visibility')
          }
        } catch (err) {
          console.error('Error updating account visibility:', err)
        }
        
        setSuccess(true)
        
        // Update localStorage
        localStorage.setItem('userInfo', JSON.stringify(updatedUser))
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || t('profile.error.save', 'Failed to save profile'))
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError(t('profile.error.save', 'Failed to save profile'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.9): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Calculate new dimensions maintaining aspect ratio
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }

          // Create canvas and resize
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Use high-quality image rendering
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to data URL with compression
          const dataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(dataUrl)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Resize and optimize image before displaying
      // Badge photo area is approximately 286x366px, so we'll resize to 400x512px for good quality
      const resizedImage = await resizeImage(file, 400, 512, 0.9)
      setFormData(prev => ({
        ...prev,
        picture: resizedImage,
      }))
    } catch (error) {
      console.error('Error processing image:', error)
      // Fallback to original if resize fails
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setFormData(prev => ({
          ...prev,
          picture: result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const formatUserId = (id: string | undefined): string => {
    if (!id) return 'FA-XXX-XX'
    // Format ID as FA-XXX-XX
    const numericId = parseInt(id, 10) || 0
    const padded = numericId.toString().padStart(6, '0')
    return `FA-${padded.slice(0, 3)}-${padded.slice(3, 6)}`
  }

  if (isLoading) {
    return (
      <div className={pageStyles.page}>
        <Navbar />
        <main className={pageStyles.main}>
          <div className={styles.profileContainer}>
            <div className={styles.loading}>{t('profile.loading', 'Loading profile...')}</div>
          </div>
        </main>
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div className={pageStyles.page}>
        <Navbar />
        <main className={pageStyles.main}>
          <div className={styles.profileContainer}>
            <div className={styles.error}>
              {error || t('profile.error.notFound', 'Profile not found')}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={pageStyles.page}>
      <div className={styles.profilePageBackground}></div>
      <div className={styles.profilePageOverlay}></div>
      <Navbar />
      <main className={pageStyles.main} style={{ position: 'relative', zIndex: 1 }}>
        <div className={styles.profileContainer}>
          <div className={styles.profileHeader}>
            <h1 className={styles.profileTitle}>{t('profile.title', 'Edit Profile')}</h1>
            <p className={styles.profileSubtitle}>{t('profile.subtitle', 'Update your profile information')}</p>
          </div>

          {error && (
            <div className={styles.alertError}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.alertSuccess}>
              {t('profile.success', 'Profile updated successfully!')}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.profileForm}>
            <div className={styles.profileGrid}>
              {/* Badge Card */}
              <div className={styles.badgeCard}>
                <div className={styles.faBadge}>
                  {/* Badge base image */}
                  <img className={styles.faBadgeBase} src="/imgs/badge.png" alt="" />
                  
                  {/* Profile photo */}
                  {formData.picture || userInfo.picture ? (
                    <img 
                      className={styles.faBadgePhoto}
                      src={formData.picture || userInfo.picture} 
                      alt="Profile photo"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }} 
                    />
                  ) : (
                    <div className={styles.faBadgePhotoPlaceholder}>
                      {(formData.name || userInfo.name || userInfo.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  {/* Upload button overlay */}
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className={styles.photoUploadButton}
                    title={t('profile.uploadImage', 'Update Image')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />

                  {/* Name field - Display only */}
                  <div className={styles.faBadgeName}>
                    <div className={styles.faBadgeNameDisplay}>
                      {formData.name || userInfo.name || 'NAME'}
                    </div>
                  </div>

                  {/* ID field */}
                  <div className={styles.faBadgeId}>
                    {formatUserId(userInfo.id)}
                  </div>

                  {/* Clearance field */}
                  <div className={styles.faBadgeClearance}>
                    {userInfo.fediverse_handle ? 'OBSERVER' : 'VISITOR'}
                  </div>

                  {/* Blood overlay - topmost visual layer */}
                  <img className={styles.faBadgeBlood} src="/imgs/fromabyss_badge_blood.png" alt="" />
                </div>
              </div>

              {/* Police File Form Card */}
              <div className={styles.formCard}>
                <div className={styles.policeFileForm}>
                <div className={styles.fileHeader}>
                  <div className={styles.fileStamp}>CONFIDENTIAL</div>
                  <div className={styles.fileNumber}>FILE #{formatUserId(userInfo.id)}</div>
                </div>
                
                <div className={styles.fileContent}>
                  <div className={styles.fileSection}>
                    <div className={styles.fileLabel}>SUBJECT NAME:</div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={styles.fileInput}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className={styles.fileSection}>
                    <div className={styles.fileLabel}>EMAIL ADDRESS:</div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.fileInput}
                      placeholder="Enter email"
                    />
                  </div>

                  <div className={styles.fileSection}>
                    <div className={styles.fileLabel}>IDENTIFICATION NUMBER:</div>
                    <div className={styles.fileValue}>{formatUserId(userInfo.id)}</div>
                  </div>

                  <div className={styles.fileSection}>
                    <div className={styles.fileLabel}>CLEARANCE LEVEL:</div>
                    <div className={styles.fileValue}>
                      {userInfo.fediverse_handle ? 'OBSERVER' : 'VISITOR'}
                    </div>
                  </div>

                  {userInfo.fediverse_handle && (
                    <div className={styles.fileSection}>
                      <div className={styles.fileLabel}>ACCOUNT VISIBILITY:</div>
                      <select
                        id="account_visibility"
                        name="account_visibility"
                        value={formData.account_visibility}
                        onChange={(e) => setFormData(prev => ({ ...prev, account_visibility: e.target.value as 'public' | 'private' }))}
                        className={styles.fileInput}
                      >
                        <option value="public">{t('profile.accountVisibility.public', 'Public - Anyone can follow')}</option>
                        <option value="private">{t('profile.accountVisibility.private', 'Private - Requires approval')}</option>
                      </select>
                      <div className={styles.fileHint}>
                        {formData.account_visibility === 'private' 
                          ? t('profile.accountVisibility.privateHint', 'Follow requests will require your approval')
                          : t('profile.accountVisibility.publicHint', 'Follow requests will be automatically accepted')}
                      </div>
                    </div>
                  )}

                  <div className={styles.fileSection}>
                    <div className={styles.fileLabel}>PHOTOGRAPH:</div>
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      className={styles.fileButton}
                    >
                      {formData.picture || userInfo.picture 
                        ? t('profile.updatePhoto', 'Update Photo') 
                        : t('profile.uploadPhoto', 'Upload Photo')}
                    </button>
                  </div>

                  <div className={styles.fileNotes}>
                    <div className={styles.fileLabel}>NOTES:</div>
                    <textarea
                      className={styles.fileTextarea}
                      placeholder="Additional information..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className={styles.fileFooter}>
                  <div className={styles.fileDate}>
                    DATE: {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }).toUpperCase()}
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={styles.buttonSecondary}
              >
                {t('profile.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={styles.buttonPrimary}
              >
                {isSaving ? t('profile.saving', 'Saving...') : t('profile.save', 'Save Changes')}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
