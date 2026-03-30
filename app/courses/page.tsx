import { Metadata } from 'next'
import { getAccessibleSemestersTree } from '@/app/utils/courseService'
import { metadata as buildMetadata } from '@/app/utils/metadata'
import Link from 'next/link'
import styles from './page.module.scss'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapLocationDot } from '@fortawesome/free-solid-svg-icons'

function collectCourseKeywords(
  semesters: Awaited<ReturnType<typeof getAccessibleSemestersTree>>,
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
  const semesters = await getAccessibleSemestersTree()
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
  const typedSemesters = await getAccessibleSemestersTree()

  return (
    <div className={styles.roadmapContainer}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <FontAwesomeIcon icon={faMapLocationDot} />
        </div>
        <h1>課程總覽</h1>
        <p>歡迎來到機器人研究社的學習園區，在這裡開始你的機器人學習之旅。</p>
      </div>

      <div className={styles.roadmap}>
        {typedSemesters.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>目前沒有可見的內容</h2>
            <p>
              您可能尚未加入任何學期，或者目前學期沒有已發布的單元。如有問題，請聯絡管理員。
            </p>
          </div>
        ) : (
          typedSemesters.map((semester) => (
            <div key={semester.id} className={styles.semesterBlock}>
              <h2 className={styles.semesterTitle}>{semester.name}</h2>
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
                            <Link
                              href={`/courses/${course.id}`}
                              key={course.id}
                              className={styles.courseCard}
                            >
                              <div className={styles.cardHeader}>
                                <h4>{course.name}</h4>
                              </div>
                              <div className={styles.cardFooter}>
                                <span>開始學習 →</span>
                              </div>
                            </Link>
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
          ))
        )}
      </div>
    </div>
  )
}
