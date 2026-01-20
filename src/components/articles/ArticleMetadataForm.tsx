import { useState } from 'react'
import './ArticleMetadataForm.css'

interface ArticleMetadataFormProps {
  tags: string[]
  topics: string[]
  ogImageUrl?: string
  onTagsChange: (tags: string[]) => void
  onTopicsChange: (topics: string[]) => void
  onOgImageUrlChange: (url: string) => void
}

export function ArticleMetadataForm({
  tags,
  topics,
  ogImageUrl,
  onTagsChange,
  onTopicsChange,
  onOgImageUrlChange,
}: ArticleMetadataFormProps) {
  const [tagInput, setTagInput] = useState('')
  const [topicInput, setTopicInput] = useState('')

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onTagsChange([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag))
  }

  const handleAddTopic = () => {
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      onTopicsChange([...topics, topicInput.trim()])
      setTopicInput('')
    }
  }

  const handleRemoveTopic = (topic: string) => {
    onTopicsChange(topics.filter((t) => t !== topic))
  }

  return (
    <div className="article-metadata-form">
      <h3>Metadados</h3>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <div className="input-with-button">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            placeholder="Adicionar tag"
          />
          <button type="button" onClick={handleAddTag}>
            Adicionar
          </button>
        </div>
        <div className="tag-list">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)}>
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="topics">Tópicos</label>
        <div className="input-with-button">
          <input
            type="text"
            id="topics"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTopic()
              }
            }}
            placeholder="Adicionar tópico"
          />
          <button type="button" onClick={handleAddTopic}>
            Adicionar
          </button>
        </div>
        <div className="tag-list">
          {topics.map((topic) => (
            <span key={topic} className="tag">
              {topic}
              <button type="button" onClick={() => handleRemoveTopic(topic)}>
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="og-image-url">OG Image URL (opcional)</label>
        <input
          type="url"
          id="og-image-url"
          value={ogImageUrl || ''}
          onChange={(e) => onOgImageUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>
    </div>
  )
}
