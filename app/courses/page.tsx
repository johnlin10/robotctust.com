import { Metadata } from 'next'
import { getPublishedSemestersTree } from '@/app/utils/courseService'
import { metadata as buildMetadata } from '@/app/utils/metadata'
import Link from 'next/link'
import styles from './page.module.scss'
import { createClient } from '@/app/utils/supabase/server'
import { isUserSemesterMember } from '@/app/utils/auth/membership'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMapLocationDot,
  faLock,
  faGraduationCap,
  faArrowRight,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons'

function collectCourseKeywords(
  semesters: Awaited<ReturnType<typeof getPublishedSemestersTree>>,
): string[] {
  const seen = new Set<string>()
  const push = (s: string) => {
    const t = s.trim()
    if (t && !seen.has(t)) seen.add(t)
  }
  push('課程總覽')
  push('學習園區')
  push('線上課程')
  for (const sem of semesters) {
    push(sem.name)
    for (const ch of sem.chapters) {
      push(ch.title)
      for (const c of ch.courses) {
        push(c.name)
      }
    }
  }
  return [...seen].slice(0, 40)
}

export async function generateMetadata(): Promise<Metadata> {
  const semesters = await getPublishedSemestersTree()
  const courseCount = semesters.reduce(
    (acc, s) =>
      acc +
      s.chapters.reduce((a, ch) => a + ch.courses.length, 0),
    0,
  )
  const semesterPreview = semesters
    .map((s) => s.name)
    .filter(Boolean)
    .slice(0, 4)
    .join('、')

  const description =
    semesters.length === 0
      ? '歡迎來到機器人研究社的學習園區，依學期與章節瀏覽已發布的課程單元，開始你的機器人學習之旅。'
      : `本頁收錄共 ${courseCount} 堂已發布課程，涵蓋${semesterPreview}${semesters.length > 4 ? '等' : ''}學期內容。歡迎來到機器人研究社的學習園地，依章節展開單元並開始學習。`

  return buildMetadata({
    title: '課程總覽｜中臺機器人研究社',
    description: description.slice(0, 160),
    keywords: collectCourseKeywords(semesters),
    url: '/courses',
    category: 'courses',
  })
}

export default async function CoursesHome() {
  const typedSemesters = await getPublishedSemestersTree()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isMember = user ? await isUserSemesterMember() : false
  const canViewCourseContent = Boolean(user && isMember)

  return (
    <div className={styles.roadmapContainer}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <FontAwesomeIcon icon={faMapLocationDot} />
        <h1>學習工坊</h1>
        </div>
        <p>探索機器人技術的奧秘，從基礎理論到實戰應用，開啟你的機器人學習之旅。</p>
      </div>

      {!canViewCourseContent && (
        <div className={styles.accessNotice}>
          <div className={styles.noticeIcon}>
            <FontAwesomeIcon icon={faLock} />
          </div>
          <div className={styles.noticeContent}>
            <h2>訪問課程內容需登入社員帳號</h2>
            <p>
              {user ? (
                '您目前尚未具備課程內容的查看權限。如需查看完整教材，請使用具社員資格的帳號登入。'
              ) : (
                <>
                  您目前正在瀏覽公開課程總覽。若要查看完整課程內容，請先
                  <Link href="/login?next=/courses">登入社員帳號</Link>。
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <div className={styles.roadmap}>
        {typedSemesters.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FontAwesomeIcon icon={faLayerGroup} />
            </div>
            <h2>目前沒有可見的內容</h2>
            <p>
              目前尚未公開任何已發布課程，或相關內容仍在整理中。如有問題，請聯絡管理員。
            </p>
          </div>
        ) : (
          typedSemesters.map((semester) => {
            const courseCount = semester.chapters.reduce(
              (acc, ch) => acc + ch.courses.length,
              0,
            )
            return (
              <div key={semester.id} className={styles.semesterBlock}>
                <div className={styles.semesterHeader}>
                  <h2 className={styles.semesterTitle}>{semester.name}</h2>
                  <span className={styles.courseBadge}>
                    {courseCount} 堂課程
                  </span>
                </div>

                <div className={styles.chapterTimeline}>
                  {semester.chapters.map((chapter, chapterIndex) => (
                    <div key={chapter.id} className={styles.chapterNode}>
                      <div className={styles.nodeMarker}>
                        <div className={styles.nodeDot} />
                        {chapterIndex < semester.chapters.length - 1 && (
                          <div className={styles.nodeLine} />
                        )}
                      </div>
                      <div className={styles.chapterContent}>
                        <h3 className={styles.chapterTitle}>{chapter.title}</h3>
                        <div className={styles.courseGrid}>
                          {chapter.courses.length > 0 ? (
                            chapter.courses.map((course) => (
                              canViewCourseContent ? (
                                <Link
                                  href={`/courses/${course.id}`}
                                  key={course.id}
                                  className={styles.courseCard}
                                >
                                  <div className={styles.cardHeader}>
                                    {/* <div className={styles.courseIcon}>
                                      <FontAwesomeIcon
                                        icon={faGraduationCap}
                                      />
                                    </div> */}
                                    <h4>{course.name}</h4>
                                  </div>
                                  {course.description && (
                                    <p className={styles.courseDescription}>
                                      {course.description}
                                    </p>
                                  )}
                                  <div className={styles.cardFooter}>
                                    <span>
                                      開始學習{' '}
                                      <FontAwesomeIcon icon={faArrowRight} />
                                    </span>
                                  </div>
                                </Link>
                              ) : (
                                <div
                                  key={course.id}
                                  className={`${styles.courseCard} ${styles.lockedCourseCard}`}
                                >
                                  <div className={styles.cardHeader}>
                                    <div className={styles.courseIcon}>
                                      <FontAwesomeIcon icon={faLock} />
                                    </div>
                                    <h4>{course.name}</h4>
                                  </div>
                                  {course.description && (
                                    <p className={styles.courseDescription}>
                                      {course.description}
                                    </p>
                                  )}
                                  <div className={styles.cardFooter}>
                                    <span>需登入社員帳號</span>
                                  </div>
                                </div>
                              )
                            ))
                          ) : (
                            <div className={styles.emptyCourses}>
                              此章節尚無已發布的課程單元
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
