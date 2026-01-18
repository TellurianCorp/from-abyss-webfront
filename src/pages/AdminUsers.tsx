import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminNavbar } from '../components/AdminNavbar'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import styles from '../styles/AdminUsers.module.css'

interface User {
  id: number
  name: string
  email: string
  email_verified: boolean
  picture?: string
  fediverse_handle?: string
  created_at: string
  updated_at: string
}

interface UserListResponse {
  users: User[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

interface UserCreateRequest {
  lifeauth_sub?: string
  name: string
  email: string
  email_verified: boolean
  fediverse_username?: string
}

interface UserUpdateRequest {
  name?: string
  email?: string
  email_verified?: boolean
}

export function AdminUsers() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [creatingUser, setCreatingUser] = useState(false)
  const [editForm, setEditForm] = useState<UserUpdateRequest>({})
  const [createForm, setCreateForm] = useState<UserCreateRequest>({
    name: '',
    email: '',
    email_verified: false,
    fediverse_username: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [limit] = useState(50)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null)
  const [createPhotoFile, setCreatePhotoFile] = useState<File | null>(null)
  const [showFediverseHandleModal, setShowFediverseHandleModal] = useState<number | null>(null)
  const [fediverseHandleInput, setFediverseHandleInput] = useState('')
  const [creatingHandle, setCreatingHandle] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [offset])

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${apiUrl(API_ENDPOINTS.admin.users.list)}?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to load users')
      }

      const data: UserListResponse = await response.json()
      setUsers(data.users)
      setTotal(data.total)
      setHasMore(data.has_more)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setCreatingUser(true)
    setCreateForm({
      name: '',
      email: '',
      email_verified: false,
      fediverse_username: '',
    })
    setCreatePhotoFile(null)
  }

  const handleCreateSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      // Prepare request body - only include optional fields if they're provided
      const requestBody: any = {
        name: createForm.name,
        email: createForm.email,
        email_verified: createForm.email_verified,
      }
      if (createForm.lifeauth_sub && createForm.lifeauth_sub.trim() !== '') {
        requestBody.lifeauth_sub = createForm.lifeauth_sub
      }
      if (createForm.fediverse_username && createForm.fediverse_username.trim() !== '') {
        requestBody.fediverse_username = createForm.fediverse_username.trim().toLowerCase()
      }

      const response = await fetch(apiUrl(API_ENDPOINTS.admin.users.create), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create user')
      }

      const newUser: User = await response.json()
      
      // Upload photo if one was selected
      if (createPhotoFile) {
        try {
          await handlePhotoUpload(newUser.id, createPhotoFile)
        } catch (photoErr) {
          // Photo upload failed, but user was created
          console.error('Error uploading photo after user creation:', photoErr)
          // Reload to get the user without photo
          await loadUsers()
          setError('User created but photo upload failed. You can upload a photo later.')
          setCreatingUser(false)
          setCreatePhotoFile(null)
          return
        }
      }
      
      // Reload users to get proper ordering and pagination
      await loadUsers()
      setCreatingUser(false)
      setCreateForm({
        name: '',
        email: '',
        email_verified: false,
        fediverse_username: '',
      })
      setCreatePhotoFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
      console.error('Error creating user:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      email_verified: user.email_verified,
    })
  }

  const handleUpdate = async () => {
    if (!editingUser) return

    setLoading(true)
    setError(null)
    try {
      // Only send fields that are actually being updated (not picture - that's handled by upload)
      const updateBody: any = {}
      if (editForm.name !== undefined) updateBody.name = editForm.name
      if (editForm.email !== undefined) updateBody.email = editForm.email
      if (editForm.email_verified !== undefined) updateBody.email_verified = editForm.email_verified

      // Only make the request if there are fields to update
      if (Object.keys(updateBody).length > 0) {
        const response = await fetch(apiUrl(API_ENDPOINTS.admin.users.update(editingUser.id)), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updateBody),
        })

        if (!response.ok) {
          throw new Error('Failed to update user')
        }

        const updatedUser: User = await response.json()
        setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
        if (selectedUser?.id === updatedUser.id) {
          setSelectedUser(updatedUser)
        }
      }
      
      setEditingUser(null)
      setEditForm({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
      console.error('Error updating user:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.admin.users.delete(userId)), {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      setUsers(users.filter((u) => u.id !== userId))
      setShowDeleteConfirm(null)
      if (selectedUser?.id === userId) {
        setSelectedUser(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
      console.error('Error deleting user:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (userId: number, file: File) => {
    setUploadingPhoto(userId)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch(apiUrl(API_ENDPOINTS.admin.users.uploadPhoto(userId)), {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to upload photo')
      }

      const result = await response.json()
      
      // Update the user in the list with the new photo URL
      setUsers(users.map((u) => 
        u.id === userId ? { ...u, picture: result.url } : u
      ))

      // Update selected user if it's the one being edited
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, picture: result.url })
      }

      // Update editing user if it's the one being edited
      if (editingUser?.id === userId) {
        setEditingUser({ ...editingUser, picture: result.url })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo')
      console.error('Error uploading photo:', err)
    } finally {
      setUploadingPhoto(null)
    }
  }

  const handleCreateFediverseHandle = async () => {
    if (!showFediverseHandleModal) return

    setCreatingHandle(true)
    setError(null)
    try {
      const requestBody: any = {}
      if (fediverseHandleInput.trim() !== '') {
        requestBody.fediverse_username = fediverseHandleInput.trim().toLowerCase()
      }

      const response = await fetch(apiUrl(API_ENDPOINTS.admin.users.createFediverseHandle(showFediverseHandleModal)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create Fediverse handle')
      }

      const updatedUser: User = await response.json()
      
      // Update the user in the list
      setUsers(users.map((u) => 
        u.id === updatedUser.id ? updatedUser : u
      ))

      // Update selected user if it's the one being updated
      if (selectedUser?.id === updatedUser.id) {
        setSelectedUser(updatedUser)
      }

      // Close modal
      setShowFediverseHandleModal(null)
      setFediverseHandleInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create Fediverse handle')
      console.error('Error creating Fediverse handle:', err)
    } finally {
      setCreatingHandle(false)
    }
  }

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>, userId: number) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      handlePhotoUpload(userId, file)
    }
  }

  const handleView = async (userId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.admin.users.get(userId)), {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to load user')
      }

      const user: User = await response.json()
      setSelectedUser(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user')
      console.error('Error loading user:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className={styles.adminUsersPage}>
      <AdminNavbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('admin.users.title', 'User Management')}</h1>
          <p className={styles.description}>
            {t('admin.users.description', 'Manage users in the From Abyss Media platform')}
          </p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <span className={styles.errorIcon}>⚠</span>
            <span>{error}</span>
            <button className={styles.errorClose} onClick={() => setError(null)}>
              ×
            </button>
          </div>
        )}

        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>{t('admin.users.stats.total', 'Total Users')}</span>
            <span className={styles.statValue}>{total}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              {t('admin.users.stats.currentPage', 'Current Page')}
            </span>
            <span className={styles.statValue}>
              {Math.floor(offset / limit) + 1} / {Math.ceil(total / limit) || 1}
            </span>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder={t('admin.users.searchPlaceholder', 'Search users...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button onClick={handleCreate} className={styles.createButton}>
            {t('admin.users.create', 'Create User')}
          </button>
          <button onClick={loadUsers} className={styles.refreshButton}>
            {t('admin.users.refresh', 'Refresh')}
          </button>
        </div>

        {loading && users.length === 0 ? (
          <div className={styles.loading}>
            <span>{t('admin.users.loading', 'Loading users...')}</span>
          </div>
        ) : (
          <>
            <div className={styles.usersTable}>
              <table>
                <thead>
                  <tr>
                    <th>{t('admin.users.table.id', 'ID')}</th>
                    <th>{t('admin.users.table.name', 'Name')}</th>
                    <th>{t('admin.users.table.email', 'Email')}</th>
                    <th>{t('admin.users.table.fediverse', 'Fediverse')}</th>
                    <th>{t('admin.users.table.verified', 'Verified')}</th>
                    <th>{t('admin.users.table.created', 'Created')}</th>
                    <th>{t('admin.users.table.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.noData}>
                        {t('admin.users.noUsers', 'No users found')}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          <div className={styles.userCell}>
                            {user.picture && (
                              <img
                                src={user.picture}
                                alt={user.name}
                                className={styles.userAvatar}
                              />
                            )}
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          {user.fediverse_handle ? (
                            <span className={styles.fediverseHandle} title={user.fediverse_handle}>
                              {user.fediverse_handle}
                            </span>
                          ) : (
                            <div className={styles.handleActions}>
                              <span className={styles.noHandle}>{t('admin.users.noHandle', 'N/A')}</span>
                              <button
                                onClick={() => {
                                  setShowFediverseHandleModal(user.id)
                                  setFediverseHandleInput('')
                                }}
                                className={styles.createHandleButton}
                                title={t('admin.users.createHandle', 'Create Fediverse Handle')}
                              >
                                {t('admin.users.createHandle', 'Create')}
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            className={`${styles.verifiedBadge} ${
                              user.email_verified ? styles.verified : styles.unverified
                            }`}
                          >
                            {user.email_verified
                              ? t('admin.users.verified', 'Yes')
                              : t('admin.users.unverified', 'No')}
                          </span>
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handleView(user.id)}
                              className={styles.viewButton}
                            >
                              {t('admin.users.view', 'View')}
                            </button>
                            <button
                              onClick={() => handleEdit(user)}
                              className={styles.editButton}
                            >
                              {t('admin.users.edit', 'Edit')}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(user.id)}
                              className={styles.deleteButton}
                            >
                              {t('admin.users.delete', 'Delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className={styles.paginationButton}
              >
                {t('admin.users.previous', 'Previous')}
              </button>
              <span className={styles.paginationInfo}>
                {t('admin.users.showing', 'Showing')} {offset + 1} -{' '}
                {Math.min(offset + limit, total)} {t('admin.users.of', 'of')} {total}
              </span>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={!hasMore}
                className={styles.paginationButton}
              >
                {t('admin.users.next', 'Next')}
              </button>
            </div>
          </>
        )}

        {/* Create Modal */}
        {creatingUser && (
          <div className={styles.modalOverlay} onClick={() => setCreatingUser(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{t('admin.users.createUser', 'Create User')}</h2>
                <button
                  className={styles.modalClose}
                  onClick={() => setCreatingUser(false)}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>{t('admin.users.form.lifeauthSub', 'LifeAuth Sub')}</label>
                  <input
                    type="text"
                    value={createForm.lifeauth_sub || ''}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, lifeauth_sub: e.target.value || undefined })
                    }
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t('admin.users.form.name', 'Name')} *</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t('admin.users.form.email', 'Email')} *</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={createForm.email_verified}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, email_verified: e.target.checked })
                      }
                    />
                    {t('admin.users.form.emailVerified', 'Email Verified')}
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label>{t('admin.users.form.fediverseUsername', 'Fediverse Username')}</label>
                  <input
                    type="text"
                    value={createForm.fediverse_username || ''}
                    onChange={(e) => {
                      // Convert to lowercase and remove invalid characters as user types
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                      setCreateForm({ ...createForm, fediverse_username: value })
                    }}
                    className={styles.formInput}
                    placeholder={t('admin.users.form.fediverseUsernamePlaceholder', 'Leave empty to auto-generate')}
                    maxLength={30}
                  />
                  <small className={styles.formHint}>
                    {t('admin.users.form.fediverseUsernameHint', 'Optional. Must be lowercase alphanumeric with underscores/hyphens, max 30 chars. If empty, will be generated from email.')}
                  </small>
                </div>
                <div className={styles.formGroup}>
                  <label>{t('admin.users.form.uploadPhoto', 'Upload Photo')}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // Validate file type
                        if (!file.type.startsWith('image/')) {
                          setError('Please select an image file')
                          return
                        }
                        // Validate file size (10MB)
                        if (file.size > 10 * 1024 * 1024) {
                          setError('File size must be less than 10MB')
                          return
                        }
                        setCreatePhotoFile(file)
                        setError(null)
                      }
                    }}
                    className={styles.formInput}
                    disabled={loading}
                  />
                  {createPhotoFile && (
                    <span className={styles.fileName}>
                      {t('admin.users.form.selectedFile', 'Selected:')} {createPhotoFile.name}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  onClick={() => setCreatingUser(false)}
                  className={styles.cancelButton}
                >
                  {t('admin.users.cancel', 'Cancel')}
                </button>
                <button onClick={handleCreateSubmit} className={styles.saveButton}>
                  {t('admin.users.create', 'Create')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingUser && (
          <div className={styles.modalOverlay} onClick={() => setEditingUser(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{t('admin.users.editUser', 'Edit User')}</h2>
                <button
                  className={styles.modalClose}
                  onClick={() => setEditingUser(null)}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>{t('admin.users.form.name', 'Name')}</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t('admin.users.form.email', 'Email')}</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={editForm.email_verified || false}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email_verified: e.target.checked })
                      }
                    />
                    {t('admin.users.form.emailVerified', 'Email Verified')}
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label>{t('admin.users.form.uploadPhoto', 'Upload Photo')}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => editingUser && handlePhotoFileChange(e, editingUser.id)}
                    className={styles.formInput}
                    disabled={!editingUser || uploadingPhoto === editingUser.id}
                  />
                  {uploadingPhoto === editingUser?.id && (
                    <span className={styles.uploadStatus}>
                      {t('admin.users.uploading', 'Uploading...')}
                    </span>
                  )}
                  {editingUser?.picture && (
                    <div className={styles.currentPhoto}>
                      <span>{t('admin.users.form.currentPhoto', 'Current photo:')}</span>
                      <img src={editingUser.picture} alt={editingUser.name} className={styles.photoPreview} />
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button onClick={() => setEditingUser(null)} className={styles.cancelButton}>
                  {t('admin.users.cancel', 'Cancel')}
                </button>
                <button onClick={handleUpdate} className={styles.saveButton}>
                  {t('admin.users.save', 'Save')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {selectedUser && (
          <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{t('admin.users.userDetails', 'User Details')}</h2>
                <button
                  className={styles.modalClose}
                  onClick={() => setSelectedUser(null)}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                {selectedUser.picture && (
                  <div className={styles.userDetailAvatar}>
                    <img src={selectedUser.picture} alt={selectedUser.name} />
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label>{t('admin.users.form.uploadPhoto', 'Upload Photo')}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoFileChange(e, selectedUser.id)}
                    className={styles.formInput}
                    disabled={uploadingPhoto === selectedUser.id}
                  />
                  {uploadingPhoto === selectedUser.id && (
                    <span className={styles.uploadStatus}>
                      {t('admin.users.uploading', 'Uploading...')}
                    </span>
                  )}
                </div>
                <div className={styles.detailGroup}>
                  <label>{t('admin.users.details.id', 'ID')}</label>
                  <p>{selectedUser.id}</p>
                </div>
                <div className={styles.detailGroup}>
                  <label>{t('admin.users.details.name', 'Name')}</label>
                  <p>{selectedUser.name}</p>
                </div>
                <div className={styles.detailGroup}>
                  <label>{t('admin.users.details.email', 'Email')}</label>
                  <p>{selectedUser.email}</p>
                </div>
                <div className={styles.detailGroup}>
                  <label>{t('admin.users.details.fediverse', 'Fediverse Handle')}</label>
                  {selectedUser.fediverse_handle ? (
                    <p className={styles.fediverseHandle}>{selectedUser.fediverse_handle}</p>
                  ) : (
                    <p className={styles.noHandle}>{t('admin.users.noHandle', 'Not available')}</p>
                  )}
                </div>
                <div className={styles.detailGroup}>
                  <label>{t('admin.users.details.emailVerified', 'Email Verified')}</label>
                  <p>
                    {selectedUser.email_verified
                      ? t('admin.users.verified', 'Yes')
                      : t('admin.users.unverified', 'No')}
                  </p>
                </div>
                <div className={styles.detailGroup}>
                  <label>{t('admin.users.details.createdAt', 'Created At')}</label>
                  <p>{formatDate(selectedUser.created_at)}</p>
                </div>
                <div className={styles.detailGroup}>
                  <label>{t('admin.users.details.updatedAt', 'Updated At')}</label>
                  <p>{formatDate(selectedUser.updated_at)}</p>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button onClick={() => setSelectedUser(null)} className={styles.closeButton}>
                  {t('admin.users.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Fediverse Handle Modal */}
        {showFediverseHandleModal && (
          <div className={styles.modalOverlay} onClick={() => setShowFediverseHandleModal(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{t('admin.users.createFediverseHandle', 'Create Fediverse Handle')}</h2>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowFediverseHandleModal(null)}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>{t('admin.users.form.fediverseUsername', 'Fediverse Username')}</label>
                  <input
                    type="text"
                    value={fediverseHandleInput}
                    onChange={(e) => {
                      // Convert to lowercase and remove invalid characters as user types
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                      setFediverseHandleInput(value)
                    }}
                    className={styles.formInput}
                    placeholder={t('admin.users.form.fediverseUsernamePlaceholder', 'Leave empty to auto-generate')}
                    maxLength={30}
                    disabled={creatingHandle}
                  />
                  <small className={styles.formHint}>
                    {t('admin.users.form.fediverseUsernameHint', 'Optional. Must be lowercase alphanumeric with underscores/hyphens, max 30 chars. If empty, will be generated from email.')}
                  </small>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  onClick={() => setShowFediverseHandleModal(null)}
                  className={styles.cancelButton}
                  disabled={creatingHandle}
                >
                  {t('admin.users.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleCreateFediverseHandle}
                  className={styles.saveButton}
                  disabled={creatingHandle}
                >
                  {creatingHandle
                    ? t('admin.users.creating', 'Creating...')
                    : t('admin.users.create', 'Create')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{t('admin.users.confirmDelete', 'Confirm Delete')}</h2>
                <button
                  className={styles.modalClose}
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <p>
                  {t(
                    'admin.users.deleteConfirmMessage',
                    'Are you sure you want to delete this user? This action cannot be undone.'
                  )}
                </p>
              </div>
              <div className={styles.modalFooter}>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className={styles.cancelButton}
                >
                  {t('admin.users.cancel', 'Cancel')}
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className={styles.deleteButton}
                >
                  {t('admin.users.confirm', 'Delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
