'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faChevronLeft, faTrash } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { Program } from '@/app/types/course-admin'
import styles from '../programs.module.scss'

interface ProgramEditorClientProps {
  programId: string // 'new' for creating a new program
}

export default function ProgramEditorClient({ programId }: ProgramEditorClientProps) {
  const router = useRouter()
  const isNew = programId === 'new'
  
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('cpp')
  const [codeContent, setCodeContent] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) {
      void loadProgram()
    }
  }, [programId])

  async function loadProgram() {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/programs/${programId}`)
      if (!res.ok) throw new Error('載入失敗')
      const data = await res.json() as Program
      setName(data.name)
      setLanguage(data.language || 'cpp')
      setCodeContent(data.code_content)
    } catch (err) {
      setError('載入程式檔案時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!name.trim() || !codeContent.trim()) {
      setError('請填寫程式名稱與內容')
      return
    }

    setIsSaving(true)
    setError('')

    const url = isNew ? '/api/dashboard/programs' : `/api/dashboard/programs/${programId}`
    const method = isNew ? 'POST' : 'PATCH'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          language,
          code_content: codeContent,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '儲存失敗')

      if (isNew) {
        router.push(`/dashboard/programs/${data.id}`)
      } else {
        alert('儲存成功')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '儲存時發生錯誤')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <div className="loading-container">載入中...</div>

  return (
    <div className={styles.container}>
      <header className={styles.editorHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/programs" className="icon-button">
            <FontAwesomeIcon icon={faChevronLeft} />
          </Link>
          <h1 className={styles.title}>{isNew ? '新增程式檔案' : '編輯程式檔案'}</h1>
        </div>
        <button 
          className="primary-button" 
          onClick={() => void handleSave()}
          disabled={isSaving}
        >
          <FontAwesomeIcon icon={faSave} />
          <span>{isSaving ? '儲存中...' : '儲存變更'}</span>
        </button>
      </header>

      {error && <div className="error-banner" style={{ marginBottom: '16px' }}>{error}</div>}

      <div className={styles.editorWrapper}>
        <div className={styles.editorFields}>
          <div className="field-group">
            <label>程式名稱</label>
            <input 
              type="text" 
              className="dashboard-input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：Arduino 基礎 LED 閃爍"
            />
          </div>
          <div className="field-group">
            <label>程式語言</label>
            <select 
              className="dashboard-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="cpp">C++ (Arduino)</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="markdown">Markdown</option>
              <option value="text">Plain Text</option>
            </select>
          </div>
        </div>

        <div className={styles.editorMain}>
          <textarea 
            className={styles.codeArea}
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            placeholder="// 在此輸入程式碼..."
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
