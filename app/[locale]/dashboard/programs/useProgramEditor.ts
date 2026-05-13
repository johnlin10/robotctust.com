import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Program } from '@/app/types/course-admin'
import { requestJson } from '../members/client-utils'
import { useToast } from '@/app/contexts/ToastContext'

export function useProgramEditor(programId: string) {
  const router = useRouter()
  const { showToast } = useToast()
  const isNew = programId === 'new'
  
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('cpp')
  const [codeContent, setCodeContent] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isNew) {
      void loadProgram()
    }
  }, [programId])

  async function loadProgram() {
    setLoading(true)
    try {
      const data = await requestJson<Program>(`/api/dashboard/programs/${programId}`)
      setName(data.name)
      setLanguage(data.language || 'cpp')
      setCodeContent(data.code_content)
    } catch (err) {
      showToast('載入程式檔案失敗', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!name.trim() || !codeContent.trim()) {
      showToast('請填寫程式名稱與內容', 'error')
      return
    }

    setIsSaving(true)
    const url = isNew ? '/api/dashboard/programs' : `/api/dashboard/programs/${programId}`
    const method = isNew ? 'POST' : 'PATCH'

    try {
      const data = await requestJson<Program>(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          language,
          code_content: codeContent,
        }),
      })

      showToast(isNew ? '新增成功' : '儲存成功', 'success')
      
      if (isNew) {
        router.push(`/dashboard/programs/${data.id}`)
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : '儲存時發生錯誤', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    state: {
      name,
      language,
      codeContent,
      loading,
      isSaving,
      isNew
    },
    actions: {
      setName,
      setLanguage,
      setCodeContent,
      handleSave
    }
  }
}
