'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faCode, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons'
import { Program } from '@/app/types/course-admin'
import styles from './programs.module.scss'

export default function ProgramsListClient() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  async function loadPrograms() {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/programs')
      if (!res.ok) throw new Error('載入失敗')
      const data = await res.json()
      setPrograms(data)
    } catch (err) {
      setError('載入程式檔案列表時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPrograms()
  }, [])

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.language?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('確定要刪除此程式檔案嗎？如果仍有課程引用它，將會刪除失敗。')) return

    try {
      const res = await fetch(`/api/dashboard/programs/${id}`, { method: 'DELETE' })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || '刪除失敗')
      
      setPrograms(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : '刪除失敗')
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>程式檔案庫 (Programs)</h1>
        <div className={styles.controls}>
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="搜尋程式名稱或語言..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dashboard-input"
            />
          </div>
          <Link href="/dashboard/programs/new" className="primary-button">
            <FontAwesomeIcon icon={faPlus} />
            <span>新增程式檔案</span>
          </Link>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-container">載入中...</div>
      ) : filteredPrograms.length === 0 ? (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faCode} size="3x" style={{ marginBottom: '16px' }} />
          <p>{search ? '找不到符合搜尋條件的程式檔案' : '目前還沒有任何程式檔案。'}</p>
        </div>
      ) : (
        <div className={styles.programsGrid}>
          {filteredPrograms.map((program) => (
            <Link 
              key={program.id} 
              href={`/dashboard/programs/${program.id}`}
              className={styles.programCard}
            >
              <div className={styles.programHeader}>
                <h2 className={styles.programName}>{program.name}</h2>
                <span className={styles.programLang}>{program.language || 'cpp'}</span>
              </div>
              <div className={styles.programPreview}>
                <pre>{program.code_content}</pre>
              </div>
              <div className={styles.programFooter}>
                <span>建立於 {new Date(program.created_at).toLocaleDateString()}</span>
                <button 
                  onClick={(e) => void handleDelete(e, program.id)}
                  className="icon-button-danger"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
