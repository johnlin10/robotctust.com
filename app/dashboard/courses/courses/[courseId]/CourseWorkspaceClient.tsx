'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowDown,
  faArrowUp,
  faChevronLeft,
  faCode,
  faGlobe,
  faHeading,
  faLink,
  faLock,
  faParagraph,
  faPencil,
  faPlus,
  faSave,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { Modal } from '@/app/dashboard/components/Modal'
import {
  Course,
  CourseContent,
  CourseContentType,
  CourseWorkspacePayload,
} from '@/app/types/course-admin'
import {
  buildReorderRows,
  COURSE_CONTENT_TYPE_OPTIONS,
  fetchCourseWorkspace,
  getCourseContentTypeLabel,
  requestJson,
} from '../../client-utils'
import styles from './course-workspace.module.scss'

interface CourseWorkspaceClientProps {
  courseId: string
}

export default function CourseWorkspaceClient({
  courseId,
}: CourseWorkspaceClientProps) {
  const [workspace, setWorkspace] = useState<CourseWorkspacePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isSavingContent, setIsSavingContent] = useState(false)

  const [courseName, setCourseName] = useState('')
  const [courseDescription, setCourseDescription] = useState('')
  const [courseRewardExp, setCourseRewardExp] = useState('0')
  const [courseIsPublished, setCourseIsPublished] = useState(false)
  const [courseChapterId, setCourseChapterId] = useState('')

  const [editingBlockId, setEditingBlockId] = useState<string | 'new' | null>(null)
  const [editType, setEditType] = useState<CourseContentType>('markdown')
  const [editContent, setEditContent] = useState('')
  const [editProgramId, setEditProgramId] = useState('')
  const [deleteBlockId, setDeleteBlockId] = useState<string | null>(null)

  const isSettingsModified = useMemo(() => {
    if (!workspace) return false
    return (
      courseName !== workspace.course.name ||
      courseDescription !== (workspace.course.description || '') ||
      courseRewardExp !== String(workspace.course.reward_exp) ||
      courseIsPublished !== workspace.course.is_published ||
      courseChapterId !== workspace.course.chapter_id
    )
  }, [workspace, courseName, courseDescription, courseRewardExp, courseIsPublished, courseChapterId])

  const selectedChapter = useMemo(() => {
    if (!workspace) return null
    return workspace.chapters.find((chapter) => chapter.id === courseChapterId) || null
  }, [workspace, courseChapterId])

  const selectedSemester = useMemo(() => {
    if (!workspace || !selectedChapter) return null
    return (
      workspace.semesters.find((semester) => semester.id === selectedChapter.semester_id) ||
      null
    )
  }, [workspace, selectedChapter])

  const editingBlock = useMemo(() => {
    if (!workspace || editingBlockId === 'new' || editingBlockId === null) return null
    return workspace.course.contents.find((content) => content.id === editingBlockId) || null
  }, [workspace, editingBlockId])

  function patchWorkspace(
    updater: (current: CourseWorkspacePayload) => CourseWorkspacePayload,
  ) {
    setWorkspace((current) => (current ? updater(current) : current))
  }

  function clearFeedback() {
    setMessage('')
    setError('')
  }

  function resetEditorFields() {
    setEditType('markdown')
    setEditContent('')
    setEditProgramId('')
  }

  async function loadWorkspace() {
    setLoading(true)
    setError('')
    try {
      const payload = await fetchCourseWorkspace(courseId)
      setWorkspace(payload)
      setCourseName(payload.course.name)
      setCourseDescription(payload.course.description || '')
      setCourseRewardExp(String(payload.course.reward_exp))
      setCourseIsPublished(payload.course.is_published)
      setCourseChapterId(payload.course.chapter_id)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '載入工作台失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadWorkspace()
  }, [courseId])

  function openCreateBlock() {
    resetEditorFields()
    setEditingBlockId('new')
  }

  function openEditBlock(content: CourseWorkspacePayload['course']['contents'][number]) {
    setEditType(content.type)
    setEditContent(content.content)
    setEditProgramId(content.program_id || '')
    setEditingBlockId(content.id)
  }

  function closeEditor() {
    setEditingBlockId(null)
    resetEditorFields()
  }

  function getBlockIcon(type: CourseContentType) {
    if (type.startsWith('header')) return faHeading
    if (type === 'code') return faCode
    return faParagraph
  }

  function getBlockPreviewClass(type: CourseContentType) {
    if (type === 'code') return styles.previewCode
    if (type === 'header1') return styles.previewHeading1
    if (type === 'header2') return styles.previewHeading2
    if (type === 'header3') return styles.previewHeading3
    if (type === 'text') return styles.previewText
    return styles.previewMarkdown
  }

  async function saveCourseSettings() {
    if (!courseName.trim()) {
      setError('請先輸入課程名稱')
      return
    }

    clearFeedback()
    setIsSavingSettings(true)
    try {
      const { course } = await requestJson<{ course: Course }>(
        '/api/dashboard/curriculum',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'course',
            id: courseId,
            chapter_id: courseChapterId,
            name: courseName.trim(),
            description: courseDescription.trim(),
            reward_exp: Number(courseRewardExp || 0),
            is_published: courseIsPublished,
          }),
        },
      )
      patchWorkspace((current) => ({
        ...current,
        course: {
          ...current.course,
          ...course,
          contents: current.course.contents,
          semester_id:
            current.chapters.find((chapter) => chapter.id === course.chapter_id)
              ?.semester_id || current.course.semester_id,
        },
      }))
      setMessage('課程設定已儲存')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '儲存失敗')
    } finally {
      setIsSavingSettings(false)
    }
  }

  async function saveContentBlock() {
    if (!editContent.trim()) {
      setError('請輸入內容')
      return
    }

    clearFeedback()
    setIsSavingContent(true)

    try {
      if (editingBlockId !== 'new' && editingBlockId !== null) {
        const { content } = await requestJson<{ content: CourseContent }>(
          '/api/dashboard/curriculum',
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'content',
              id: editingBlockId,
              content_type: editType,
              content: editContent.trim(),
              program_id: editProgramId.trim() || null,
            }),
          },
        )
        patchWorkspace((current) => ({
          ...current,
          course: {
            ...current.course,
            contents: current.course.contents.map((item) =>
              item.id === content.id ? { ...item, ...content } : item,
            ),
          },
        }))
        setMessage('內容區塊已更新')
      } else {
        const { content } = await requestJson<{ content: CourseContent }>(
          '/api/dashboard/curriculum',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'content',
              course_id: courseId,
              content_type: editType,
              content: editContent.trim(),
              program_id: editProgramId.trim() || null,
            }),
          },
        )
        patchWorkspace((current) => ({
          ...current,
          course: {
            ...current.course,
            contents: [...current.course.contents, content].sort(
              (left, right) => left.order_index - right.order_index,
            ),
          },
        }))
        setMessage('已新增內容區塊')
      }

      closeEditor()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '儲存內容失敗')
    } finally {
      setIsSavingContent(false)
    }
  }

  async function confirmDeleteContent() {
    if (!deleteBlockId) return

    clearFeedback()

    try {
      await requestJson('/api/dashboard/curriculum', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'content',
          id: deleteBlockId,
        }),
      })
      patchWorkspace((current) => ({
        ...current,
        course: {
          ...current.course,
          contents: current.course.contents
            .filter((content) => content.id !== deleteBlockId)
            .map((content, index) => ({
              ...content,
              order_index: index + 1,
            })),
        },
      }))
      setDeleteBlockId(null)
      setMessage('內容區塊已刪除')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '刪除內容失敗')
    }
  }

  async function moveContent(contentId: string, direction: -1 | 1) {
    if (!workspace) return

    const nextContents = [...workspace.course.contents]
    const index = nextContents.findIndex((content) => content.id === contentId)
    const targetIndex = index + direction

    if (index < 0 || targetIndex < 0 || targetIndex >= nextContents.length) return

    clearFeedback()
    const [moved] = nextContents.splice(index, 1)
    nextContents.splice(targetIndex, 0, moved)

    const reorderedContents = nextContents.map((content, nextIndex) => ({
      ...content,
      order_index: nextIndex + 1,
    }))

    patchWorkspace((current) => ({
      ...current,
      course: {
        ...current.course,
        contents: reorderedContents,
      },
    }))

    try {
      await requestJson('/api/dashboard/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'course_contents',
          rows: buildReorderRows(reorderedContents.map((content) => content.id)),
        }),
      })
      setMessage('內容順序已更新')
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : '排序更新失敗')
      void loadWorkspace()
    }
  }

  return (
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <Link href="/dashboard/courses/courses" className={styles.backButton}>
          <FontAwesomeIcon icon={faChevronLeft} />
          <span>返回課程文庫</span>
        </Link>
        <span className={styles.workspaceLabel}>Course Workspace</span>
      </header>

      {message ? (
        <div className={styles.messageBanner} aria-live="polite">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className={styles.errorBanner} aria-live="polite">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>初始化工作台…</p>
        </div>
      ) : workspace ? (
        <div className={styles.editorMain}>
          <section className={styles.heroPanel}>
            <div className={styles.heroMain}>
              <p className={styles.eyebrow}>Focus Editing</p>
              <h1>{courseName || '未命名課程'}</h1>
              <p className={styles.heroDescription}>
                {selectedSemester?.name || '未指定學期'} /{' '}
                {selectedChapter?.title || '未指定章節'}
              </p>
              <div className={styles.heroMeta}>
                <span className={styles.metaChip}>ID: {workspace.course.id}</span>
                <span
                  className={
                    courseIsPublished ? styles.statusPublished : styles.statusDraft
                  }
                >
                  <FontAwesomeIcon icon={courseIsPublished ? faGlobe : faLock} />
                  <span>{courseIsPublished ? '已發布' : '草稿'}</span>
                </span>
                {isSettingsModified ? (
                  <span className={styles.unsavedChip}>尚未儲存變更</span>
                ) : null}
              </div>
            </div>
            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.publishToggle}
                aria-pressed={courseIsPublished}
                onClick={() => setCourseIsPublished((current) => !current)}
              >
                <FontAwesomeIcon icon={courseIsPublished ? faGlobe : faLock} />
                <span>{courseIsPublished ? '切換為草稿' : '切換為發布'}</span>
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => void saveCourseSettings()}
                disabled={isSavingSettings}
              >
                <FontAwesomeIcon icon={faSave} />
                <span>
                  {isSavingSettings
                    ? '儲存中…'
                    : isSettingsModified
                      ? '儲存課程設定'
                      : '課程設定已同步'}
                </span>
              </button>
            </div>
          </section>

          <div className={styles.workspaceGrid}>
            <section className={styles.settingsPanel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelEyebrow}>Course Settings</p>
                  <h2>課程設定</h2>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="workspace-course-name">課程名稱</label>
                <input
                  id="workspace-course-name"
                  name="courseName"
                  autoComplete="off"
                  className={styles.textInput}
                  value={courseName}
                  onChange={(event) => setCourseName(event.target.value)}
                  placeholder="輸入課程名稱…"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="workspace-course-description">課程簡介</label>
                <textarea
                  id="workspace-course-description"
                  name="courseDescription"
                  autoComplete="off"
                  className={styles.textareaInput}
                  value={courseDescription}
                  onChange={(event) => setCourseDescription(event.target.value)}
                  placeholder="描述這堂課的目標與內容…"
                />
              </div>

              <div className={styles.fieldGrid}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="workspace-course-chapter">所屬章節</label>
                  <select
                    id="workspace-course-chapter"
                    name="courseChapterId"
                    className={styles.selectInput}
                    value={courseChapterId}
                    onChange={(event) => setCourseChapterId(event.target.value)}
                  >
                    {workspace.semesters.map((semester) => (
                      <optgroup key={semester.id} label={semester.name}>
                        {workspace.chapters
                          .filter((chapter) => chapter.semester_id === semester.id)
                          .map((chapter) => (
                            <option key={chapter.id} value={chapter.id}>
                              {chapter.title}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="workspace-course-exp">獎勵 EXP</label>
                  <div className={styles.expInputWrapper}>
                    <input
                      id="workspace-course-exp"
                      name="courseRewardExp"
                      className={styles.textInput}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={courseRewardExp}
                      onChange={(event) => setCourseRewardExp(event.target.value)}
                    />
                    <span>EXP</span>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.contentPanel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelEyebrow}>Content Flow</p>
                  <h2>內容編排</h2>
                </div>
                <button
                  type="button"
                  className={styles.subtleButton}
                  onClick={openCreateBlock}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>新增內容區塊</span>
                </button>
              </div>

              {editingBlockId !== null ? (
                <section className={styles.editorCard}>
                  <div className={styles.editorHeader}>
                    <div>
                      <h3>{editingBlockId === 'new' ? '新增內容區塊' : '編輯內容區塊'}</h3>
                      <p>
                        {editingBlock
                          ? `正在編輯第 ${editingBlock.order_index} 段`
                          : '新增後會自動排到目前內容的最後方。'}
                      </p>
                    </div>
                  </div>

                  <div className={styles.fieldGrid}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="workspace-content-type">內容類型</label>
                      <select
                        id="workspace-content-type"
                        name="contentType"
                        className={styles.selectInput}
                        value={editType}
                        onChange={(event) =>
                          setEditType(event.target.value as CourseContentType)
                        }
                      >
                        {COURSE_CONTENT_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="workspace-program-id">Program ID（選填）</label>
                      <div className={styles.programInput}>
                        <FontAwesomeIcon icon={faLink} />
                        <input
                          id="workspace-program-id"
                          name="programId"
                          autoComplete="off"
                          className={styles.textInput}
                          value={editProgramId}
                          onChange={(event) => setEditProgramId(event.target.value)}
                          placeholder="用來關聯練習題或外部資源…"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="workspace-content-body">內容</label>
                    <textarea
                      id="workspace-content-body"
                      name="contentBody"
                      className={styles.editorTextarea}
                      value={editContent}
                      onChange={(event) => setEditContent(event.target.value)}
                      placeholder="開始撰寫內容…"
                    />
                  </div>

                  <div className={styles.editorActions}>
                    <button
                      type="button"
                      className={styles.subtleButton}
                      onClick={closeEditor}
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => void saveContentBlock()}
                      disabled={isSavingContent}
                    >
                      <FontAwesomeIcon icon={faSave} />
                      <span>
                        {isSavingContent
                          ? '儲存中…'
                          : editingBlockId === 'new'
                            ? '新增區塊'
                            : '儲存區塊'}
                      </span>
                    </button>
                  </div>
                </section>
              ) : null}

              {workspace.course.contents.length === 0 ? (
                <div className={styles.emptyContent}>
                  <p>這堂課還沒有任何內容區塊。</p>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={openCreateBlock}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>開始撰寫第一段內容</span>
                  </button>
                </div>
              ) : (
                <div className={styles.blocksList}>
                  {workspace.course.contents.map((content, index) => (
                    <article key={content.id} className={styles.blockCard}>
                      <div className={styles.blockHeader}>
                        <div className={styles.blockMeta}>
                          <span className={styles.blockIndex}>
                            {content.order_index}
                          </span>
                          <span className={styles.blockType}>
                            <FontAwesomeIcon icon={getBlockIcon(content.type)} />
                            <span>{getCourseContentTypeLabel(content.type)}</span>
                          </span>
                          {content.program_id ? (
                            <span className={styles.programChip}>
                              <FontAwesomeIcon icon={faLink} />
                              <span>{content.program_id}</span>
                            </span>
                          ) : null}
                        </div>
                        <div className={styles.blockActions}>
                          <button
                            type="button"
                            className={styles.iconButton}
                            disabled={index === 0}
                            onClick={() => void moveContent(content.id, -1)}
                            aria-label={`將第 ${content.order_index} 段往上移動`}
                          >
                            <FontAwesomeIcon icon={faArrowUp} />
                          </button>
                          <button
                            type="button"
                            className={styles.iconButton}
                            disabled={index === workspace.course.contents.length - 1}
                            onClick={() => void moveContent(content.id, 1)}
                            aria-label={`將第 ${content.order_index} 段往下移動`}
                          >
                            <FontAwesomeIcon icon={faArrowDown} />
                          </button>
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => openEditBlock(content)}
                            aria-label={`編輯第 ${content.order_index} 段`}
                          >
                            <FontAwesomeIcon icon={faPencil} />
                          </button>
                          <button
                            type="button"
                            className={styles.iconButtonDanger}
                            onClick={() => setDeleteBlockId(content.id)}
                            aria-label={`刪除第 ${content.order_index} 段`}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>

                      <div className={`${styles.blockPreview} ${getBlockPreviewClass(content.type)}`}>
                        {content.type === 'code' ? (
                          <pre>{content.content}</pre>
                        ) : (
                          <p>{content.content}</p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}

      <Modal
        isOpen={deleteBlockId !== null}
        onClose={() => setDeleteBlockId(null)}
        title="確認刪除內容區塊"
        maxWidth="520px"
        footer={
          <>
            <button
              type="button"
              className={styles.subtleButton}
              onClick={() => setDeleteBlockId(null)}
            >
              取消
            </button>
            <button
              type="button"
              className={styles.dangerButton}
              onClick={() => void confirmDeleteContent()}
            >
              確認刪除
            </button>
          </>
        }
      >
        <div className={styles.confirmBody}>
          <p>刪除後這個內容區塊將無法復原。</p>
          <p className={styles.confirmHint}>系統會自動重新整理剩餘段落的順序。</p>
        </div>
      </Modal>
    </div>
  )
}
