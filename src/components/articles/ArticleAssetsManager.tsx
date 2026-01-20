import { useState, useRef } from 'react'
import type { ArticleAsset } from '../../services/articleService'
import './ArticleAssetsManager.css'

interface ArticleAssetsManagerProps {
  assets: ArticleAsset[]
  onUpload: (file: File, altText?: string, isFeatured?: boolean) => Promise<void>
  onSetFeatured: (assetId: string) => Promise<void>
  onRemove: (assetId: string) => Promise<void>
  uploading?: boolean
}

export function ArticleAssetsManager({
  assets,
  onUpload,
  onSetFeatured,
  onRemove,
  uploading = false,
}: ArticleAssetsManagerProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          await onUpload(file)
        }
      }
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          await onUpload(file)
        }
      }
    }
  }

  return (
    <div className="article-assets-manager">
      <h3>Assets de Imagens</h3>

      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="upload-button"
        >
          {uploading ? 'Enviando...' : 'Adicionar Imagens'}
        </button>
        <p className="upload-hint">Arraste imagens aqui ou clique para selecionar</p>
      </div>

      {assets.length > 0 && (
        <div className="assets-grid">
          {assets.map((asset) => (
            <div key={asset.id} className={`asset-item ${asset.is_featured ? 'featured' : ''}`}>
              <img src={asset.url} alt={asset.alt_text || ''} />
              {asset.is_featured && <span className="featured-badge">Destaque</span>}
              <div className="asset-actions">
                {!asset.is_featured && (
                  <button
                    type="button"
                    onClick={() => onSetFeatured(asset.id)}
                    className="btn-featured"
                  >
                    Marcar como Destaque
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(asset.id)}
                  className="btn-remove"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
