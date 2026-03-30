'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styles from './course-editor.module.scss'

// components
import { Aside } from '@/app/components/Aside'
import { Modal } from '@/app/dashboard/components/Modal'
import { Selector } from '@/app/components/Selector'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faEdit,
  faTrash,
  faGripVertical,
  faArrowLeft,
  faCog,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'

// types
import {
  ChapterTreeNode,
  CourseTreeNode,
  CurriculumPayload,
  Semester,
} from '@/app/types/course-admin'

interface ReorderRow {
  id: string
  order_index: number
}

function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

export default function CourseEditorClient() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [chapters, setChapters] = useState<ChapterTreeNode[]>([])

  // Selection state
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('')
  const [selectedChapterId, setSelectedChapterId] = useState<string>('')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [isManagingSemester, setIsManagingSemester] = useState<boolean>(false)

  const [draggingContentId, setDraggingContentId] = useState<string | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string>('')

  const [activeModal, setActiveModal] = useState<
    'chapter' | 'course' | 'content' | null
  >(null)

  // Chapter form
  const [newChapterTitle, setNewChapterTitle] = useState('')

  // Course form
  const [courseChapterId, setCourseChapterId] = useState('')
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseDescription, setNewCourseDescription] = useState('')
  const [newCourseOrderIndex, setNewCourseOrderIndex] = useState('0')

  // Content form
  const [newContentType, setNewContentType] = useState('markdown')
  const [newContentBody, setNewContentBody] = useState('')

  const semesterOptions = useMemo(() => {
    return semesters.map((s) => ({ value: s.id, label: s.name }))
  }, [semesters])

  const selectedChapter = useMemo(
    () => chapters.find((c) => c.id === selectedChapterId) || null,
    [chapters, selectedChapterId],
  )

  const coursesForSelectedChapter = useMemo(
    () => (selectedChapter ? selectedChapter.courses : []),
    [selectedChapter],
  )

  const selectedCourse = useMemo(
    () =>
      coursesForSelectedChapter.find((c) => c.id === selectedCourseId) || null,
    [coursesForSelectedChapter, selectedCourseId],
  )

  async function fetchCurriculum(semesterId?: string) {
    setLoading(true)
    setMessage('')
    try {
      const query = semesterId ? `?semesterId=${semesterId}` : ''
      const res = await fetch(`/api/dashboard/curriculum${query}`)
      const data = (await res.json()) as CurriculumPayload | { error: string }

      if (!res.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : '讀取課程資料失敗')
      }

      setSemesters(data.semesters)
      setChapters(data.chapters)

      const nextSemesterId =
        semesterId ||
        data.semesters.find((semester) => semester.is_active)?.id ||
        data.semesters[0]?.id ||
        ''
      setSelectedSemesterId(nextSemesterId)

      if (semesterId && semesterId !== selectedSemesterId) {
        setSelectedChapterId('')
        setSelectedCourseId('')
        setIsManagingSemester(false)
      } else {
        setSelectedChapterId((prev) =>
          data.chapters.some((c) => c.id === prev) ? prev : '',
        )
        setSelectedCourseId((prev) => {
          let exists = false
          for (const chapter of data.chapters) {
            if (chapter.courses.some((c) => c.id === prev)) {
              exists = true
              break
            }
          }
          return exists ? prev : ''
        })
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '讀取資料失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchCurriculum()
  }, [])

  async function createChapter() {
    if (!selectedSemesterId || !newChapterTitle.trim()) return

    setMessage('')
    const res = await fetch('/api/dashboard/curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'chapter',
        semester_id: selectedSemesterId,
        title: newChapterTitle.trim(),
      }),
    })

    if (!res.ok) {
      const errorBody = (await res.json()) as { error?: string }
      setMessage(errorBody.error || '新增章節失敗')
      return
    }

    setNewChapterTitle('')
    setActiveModal(null)
    await fetchCurriculum(selectedSemesterId)
    setMessage('章節新增成功')
  }

  async function createCourse() {
    if (!courseChapterId || !newCourseName.trim()) return

    setMessage('')
    const generatedId = normalizeSlug(newCourseName)

    if (!generatedId) {
      setMessage('課程名稱格式不合法')
      return
    }

    const res = await fetch('/api/dashboard/curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'course',
        chapter_id: courseChapterId,
        id: generatedId,
        name: newCourseName.trim(),
        description: newCourseDescription.trim(),
        order_index: Number(newCourseOrderIndex || 0),
      }),
    })

    if (!res.ok) {
      const errorBody = (await res.json()) as { error?: string }
      setMessage(errorBody.error || '新增課程失敗，請確認 slug 是否重複')
      return
    }

    setNewCourseName('')
    setNewCourseDescription('')
    setActiveModal(null)
    await fetchCurriculum(selectedSemesterId)
    setSelectedCourseId(generatedId)
    setMessage('課程新增成功')
  }

  async function createContent() {
    if (!selectedCourseId || !newContentBody.trim()) return

    setMessage('')
    const res = await fetch('/api/dashboard/curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'content',
        course_id: selectedCourseId,
        content_type: newContentType,
        content: newContentBody.trim(),
      }),
    })

    if (!res.ok) {
      const errorBody = (await res.json()) as { error?: string }
      setMessage(errorBody.error || '新增內容失敗')
      return
    }

    setNewContentBody('')
    setActiveModal(null)
    await fetchCurriculum(selectedSemesterId)
    setMessage('內容區塊新增成功')
  }

  async function persistContentOrder(course: CourseTreeNode) {
    const rows: ReorderRow[] = course.contents.map((item, idx) => ({
      id: item.id,
      order_index: idx + 1,
    }))

    const res = await fetch('/api/dashboard/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'course_contents',
        rows,
      }),
    })

    if (!res.ok) {
      const errorBody = (await res.json()) as { error?: string }
      setMessage(errorBody.error || '排序儲存失敗')
      await fetchCurriculum(selectedSemesterId)
    }
  }

  function reorderContents(fromId: string, toId: string) {
    const chapterIdx = chapters.findIndex((chapter) =>
      chapter.courses.some((course) => course.id === selectedCourseId),
    )
    if (chapterIdx < 0) return

    const courseIdx = chapters[chapterIdx].courses.findIndex(
      (course) => course.id === selectedCourseId,
    )
    if (courseIdx < 0) return

    const course = chapters[chapterIdx].courses[courseIdx]
    const fromIndex = course.contents.findIndex((item) => item.id === fromId)
    const toIndex = course.contents.findIndex((item) => item.id === toId)
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return

    const nextContents = [...course.contents]
    const [moved] = nextContents.splice(fromIndex, 1)
    nextContents.splice(toIndex, 0, moved)

    const nextChapters = [...chapters]
    nextChapters[chapterIdx] = {
      ...nextChapters[chapterIdx],
      courses: nextChapters[chapterIdx].courses.map((row, idx) =>
        idx === courseIdx ? { ...row, contents: nextContents } : row,
      ),
    }
    setChapters(nextChapters)
    void persistContentOrder({ ...course, contents: nextContents })
  }

  async function togglePublished(courseId: string, isPublished: boolean) {
    const res = await fetch('/api/dashboard/curriculum', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: courseId,
        is_published: isPublished,
      }),
    })

    if (!res.ok) {
      const errorBody = (await res.json()) as { error?: string }
      setMessage(errorBody.error || '更新發布狀態失敗')
      return
    }

    await fetchCurriculum(selectedSemesterId)
  }

  // --- Render Functions for Main Content ---

  function renderSemesterManager() {
    return (
      <article className={styles.listCard}>
        <div className={styles.cardHeader}>
          <h3>學期管理 (尚未實作 API)</h3>
          <button className={styles.addButton} disabled>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>學期名稱</th>
                <th style={{ width: 120 }}>活躍狀態</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.is_active ? '✅' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    )
  }

  function renderChapterManager() {
    return (
      <article className={styles.listCard}>
        <div className={styles.cardHeader}>
          <h3>本學期章節列表</h3>
          <button
            className={styles.addButton}
            onClick={() => setActiveModal('chapter')}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 80 }}>順序</th>
                <th>章節標題</th>
                <th style={{ width: 100 }}>課程數</th>
                <th style={{ width: 80 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {chapters.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.empty}>
                    尚無資料
                  </td>
                </tr>
              ) : (
                chapters.map((chapter) => (
                  <tr key={chapter.id}>
                    <td className={styles.center}>{chapter.order_index}</td>
                    <td>{chapter.title}</td>
                    <td className={styles.center}>
                      {chapter.courses.length} 堂
                    </td>
                    <td className={styles.actions}>
                      <button className={styles.iconButton} title="修改">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    )
  }

  function renderCourseManager() {
    return (
      <article className={styles.listCard}>
        <div className={styles.cardHeader}>
          <h3>{selectedChapter?.title} - 課程列表</h3>
          <button
            className={styles.addButton}
            onClick={() => {
              setCourseChapterId(selectedChapterId)
              const nextOrder = (coursesForSelectedChapter.length || 0) + 1
              setNewCourseOrderIndex(String(nextOrder))
              setActiveModal('course')
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>課程名稱</th>
                <th style={{ width: 120 }}>狀態</th>
                <th style={{ width: 120 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {coursesForSelectedChapter.length === 0 ? (
                <tr>
                  <td colSpan={3} className={styles.empty}>
                    尚無資料
                  </td>
                </tr>
              ) : (
                coursesForSelectedChapter.map((course) => (
                  <tr key={course.id}>
                    <td>{course.name}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={course.is_published}
                          onChange={(e) =>
                            void togglePublished(course.id, e.target.checked)
                          }
                        />
                        <span className={styles.slider}></span>
                      </label>
                      <span className={styles.switchLabel}>
                        {course.is_published ? '開放' : '草稿'}
                      </span>
                    </td>
                    <td
                      className={styles.actions}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className={styles.iconButton} title="修改">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    )
  }

  function renderContentManager() {
    return (
      <article className={styles.listCard}>
        <div className={styles.cardHeader}>
          <h3>內容編輯：{selectedCourse?.name}</h3>
          <button
            className={styles.addButton}
            onClick={() => setActiveModal('content')}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <div className={styles.dragList}>
          {!selectedCourse ? (
            <div className={styles.empty}>請先點選上方課程</div>
          ) : selectedCourse.contents.length === 0 ? (
            <div className={styles.empty}>目前沒有內容</div>
          ) : (
            selectedCourse.contents.map((content) => (
              <div
                key={content.id}
                className={styles.dragItem}
                draggable
                onDragStart={() => setDraggingContentId(content.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggingContentId) {
                    reorderContents(draggingContentId, content.id)
                    setDraggingContentId(null)
                  }
                }}
              >
                <div className={styles.dragHandle}>
                  <FontAwesomeIcon icon={faGripVertical} />
                </div>
                <div className={styles.itemIndex}>{content.order_index}</div>
                <div className={styles.itemType}>{content.type}</div>
                <div className={styles.itemContent}>
                  {content.content.slice(0, 100)}{' '}
                  {content.content.length > 100 ? '...' : ''}
                </div>
                <div className={styles.itemActions}>
                  <button className={styles.iconButton} title="修改">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className={styles.iconButtonDanger} title="刪除">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    )
  }

  return (
    <div className={styles.layout}>
      <Aside className={styles.sidebar}>
        <div className={styles.asideHeader}>
          <Link href="/dashboard" className={styles.backLink}>
            <FontAwesomeIcon icon={faArrowLeft} /> 返回模組總覽
          </Link>
          <div className={styles.semesterSelectorRow}>
            <div className={styles.selectorWrapper}>
              <Selector<string>
                mode="single"
                options={semesterOptions}
                value={selectedSemesterId}
                onChange={(value) => {
                  setSelectedSemesterId(value)
                  void fetchCurriculum(value)
                }}
                placeholder="請選擇學期..."
              />
            </div>
            <button
              className={`${styles.settingsBtn} ${isManagingSemester ? styles.active : ''}`}
              onClick={() => {
                setIsManagingSemester(true)
                setSelectedChapterId('')
                setSelectedCourseId('')
              }}
              title="管理學期"
            >
              <FontAwesomeIcon icon={faCog} />
            </button>
          </div>
        </div>

        <div className={styles.columnScroller}>
          {/* Chapters Column */}
          <div className={styles.column}>
            <div className={styles.columnHeader}>章節列表</div>
            {chapters.length === 0 ? (
              <div className={styles.empty}>無資料</div>
            ) : (
              chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className={`${styles.listItem} ${selectedChapterId === chapter.id ? styles.active : ''}`}
                  onClick={() => {
                    setIsManagingSemester(false)
                    setSelectedChapterId(chapter.id)
                    setSelectedCourseId('')
                  }}
                >
                  <div className={styles.itemInfo}>
                    <span className={styles.itemTitle}>{chapter.title}</span>
                    <span className={styles.itemMeta}>
                      {chapter.courses.length} 堂課程
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={styles.itemChevron}
                  />
                </div>
              ))
            )}
          </div>

          {/* Courses Column (only if chapter selected) */}
          {selectedChapterId && (
            <div className={styles.column}>
              <div className={styles.columnHeader}>課程列表</div>
              {coursesForSelectedChapter.length === 0 ? (
                <div className={styles.empty}>無課程資料</div>
              ) : (
                coursesForSelectedChapter.map((course) => (
                  <div
                    key={course.id}
                    className={`${styles.listItem} ${selectedCourseId === course.id ? styles.active : ''} ${!course.is_published ? styles.draft : ''}`}
                    onClick={() => {
                      setIsManagingSemester(false)
                      setSelectedCourseId(course.id)
                    }}
                  >
                    <div className={styles.itemInfo}>
                      <span className={styles.itemTitle}>{course.name}</span>
                      <span className={styles.itemMeta}>
                        {course.is_published ? '開放' : '草稿'}
                      </span>
                    </div>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className={styles.itemChevron}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Aside>

      <section className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h2>
              {isManagingSemester
                ? '學期管理'
                : selectedCourseId
                  ? '課程內容編輯'
                  : selectedChapterId
                    ? '課程管理'
                    : '章節管理'}
            </h2>
          </div>
        </header>

        {message && <div className={styles.messagePanel}>{message}</div>}
        {loading && <div className={styles.loading}>載入中...</div>}

        {!loading && (
          <div className={styles.mainGrid}>
            {isManagingSemester
              ? renderSemesterManager()
              : selectedCourseId
                ? renderContentManager()
                : selectedChapterId
                  ? renderCourseManager()
                  : renderChapterManager()}
          </div>
        )}
      </section>

      {/* 彈出式新增表單 Modal */}
      <Modal
        isOpen={activeModal === 'chapter'}
        onClose={() => setActiveModal(null)}
        title="新增章節"
        footer={
          <>
            <button
              className={styles.btnSecondary}
              onClick={() => setActiveModal(null)}
            >
              取消
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => void createChapter()}
            >
              新增
            </button>
          </>
        }
      >
        <div className={styles.formGroup}>
          <label className={styles.label}>章節標題 *</label>
          <input
            className={styles.input}
            placeholder="請輸入章節標題..."
            value={newChapterTitle}
            onChange={(event) => setNewChapterTitle(event.target.value)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'course'}
        onClose={() => setActiveModal(null)}
        title="新增課程"
        footer={
          <>
            <button
              className={styles.btnSecondary}
              onClick={() => setActiveModal(null)}
            >
              取消
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => void createCourse()}
            >
              新增
            </button>
          </>
        }
      >
        <div className={styles.formGroup}>
          <label className={styles.label}>所屬章節 *</label>
          <select
            className={styles.select}
            value={courseChapterId}
            onChange={(event) => setCourseChapterId(event.target.value)}
          >
            <option value="">請選擇章節</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>課程名稱 *</label>
          <input
            className={styles.input}
            placeholder="例如: React 入門"
            value={newCourseName}
            onChange={(event) => setNewCourseName(event.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>課程描述</label>
          <textarea
            className={styles.textarea}
            placeholder="請輸入課程簡介（可選）"
            value={newCourseDescription}
            onChange={(event) => setNewCourseDescription(event.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>排序指數</label>
          <input
            className={styles.input}
            type="number"
            placeholder="指數越大越後面..."
            value={newCourseOrderIndex}
            onChange={(event) => setNewCourseOrderIndex(event.target.value)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'content'}
        onClose={() => setActiveModal(null)}
        title={`新增 ${selectedCourse?.name || ''} 內容區塊`}
        maxWidth="800px"
        footer={
          <>
            <button
              className={styles.btnSecondary}
              onClick={() => setActiveModal(null)}
            >
              取消
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => void createContent()}
            >
              新增
            </button>
          </>
        }
      >
        <div className={styles.formGroup}>
          <label className={styles.label}>內容類型 *</label>
          <select
            className={styles.select}
            value={newContentType}
            onChange={(event) => setNewContentType(event.target.value)}
          >
            <option value="markdown">Markdown 文字段落</option>
            <option value="text">一般純文字</option>
            <option value="header1">大標題 H1</option>
            <option value="header2">中標題 H2</option>
            <option value="header3">小標題 H3</option>
            <option value="code">程式碼區塊</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>內容 *</label>
          <textarea
            className={styles.textareaLarge}
            placeholder="請根據選擇的內容類型輸入對應內容..."
            value={newContentBody}
            onChange={(event) => setNewContentBody(event.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}
