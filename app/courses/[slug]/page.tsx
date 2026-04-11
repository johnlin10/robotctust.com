import { Metadata } from 'next'
import {
  getCourseWithContents,
  getPublishedCourseSummary,
} from '@/app/utils/courseService'
import {
  generateDescriptionFromMarkdown,
  metadata as buildMetadata,
} from '@/app/utils/metadata'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import styles from './courseDetail.module.scss'
import { createClient } from '@/app/utils/supabase/server'
import { isUserSemesterMember } from '@/app/utils/auth/membership'

// components
import { CourseContentRenderer } from './components/CourseContentRenderer'
import { TableOfContents } from './components/TableOfContents'
import { CourseVerification } from './components/CourseVerification'

interface CoursePageProps {
  params: Promise<{ slug: string }>
}

function buildCourseSeoDescription(
  course: NonNullable<Awaited<ReturnType<typeof getCourseWithContents>>>,
): string {
  const fromField = course.description?.trim()
  if (fromField) {
    return fromField.length > 160 ? `${fromField.slice(0, 157)}...` : fromField
  }
  const blocks = course.course_contents || []
  const textBlock = blocks.find(
    (b) =>
      b.type === 'markdown' ||
      b.type === 'header1' ||
      b.type === 'header2' ||
      b.type === 'header3',
  )
  if (textBlock?.content?.trim()) {
    return generateDescriptionFromMarkdown(textBlock.content, 160)
  }
  return `${course.name}為中臺機器人研究社的線上課程單元，提供章節化教材與完成驗證流程，協助你循序學習機器人相關主題。`
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isMember = user ? await isUserSemesterMember() : false
  const course = isMember ? await getCourseWithContents(slug) : null
  const publicCourse = course ?? (await getPublishedCourseSummary(slug))

  if (!publicCourse) {
    notFound()
  }

  if (!course) {
    return buildMetadata({
      title: `${publicCourse.name}｜課程｜中臺機器人研究社`,
      description: '本課程內容需使用具社員權限的帳號登入後查看。',
      keywords: [publicCourse.name, '課程', '社員登入'],
      url: `/courses/${slug}`,
      category: 'courses',
      noIndex: true,
    })
  }

  const description = buildCourseSeoDescription(course)
  const title = `${course.name}｜課程｜中臺機器人研究社`

  return buildMetadata({
    title,
    description,
    keywords: [course.name, '課程', '線上課程', '機器人', '教學單元'],
    url: `/courses/${slug}`,
    type: 'article',
    category: 'courses',
  })
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isMember = user ? await isUserSemesterMember() : false
  const course = isMember ? await getCourseWithContents(slug) : null
  const publicCourse = course ?? (await getPublishedCourseSummary(slug))

  if (!publicCourse) {
    notFound()
  }

  if (!course) {
    return (
      <div className={styles.courseSplitLayout}>
        <div className={styles.mainContentArea}>
          <div className={styles.accessGuard}>
            <h1>{publicCourse.name}</h1>
            <p>
              這堂課的內容目前僅提供具社員權限的帳號查看。請登入符合權限的帳號後再繼續。
            </p>
            {!user && (
              <Link href={`/login?next=/courses/${slug}`} className={styles.accessLink}>
                前往登入
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }
  const contents = course.course_contents || []

  return (
    <div className={styles.courseSplitLayout}>
      <div className={styles.mainContentArea}>
        <div className={styles.courseHeader}>
          <h1>{course.name}</h1>
          {course.description && (
            <p className={styles.description}>{course.description}</p>
          )}
        </div>

        <div className={styles.articleBody}>
          <CourseContentRenderer contents={contents} />
          <CourseVerification courseId={course.id} />
        </div>
      </div>

      {/* Right Sidebar for Table of Contents */}
      <div className={styles.rightSidebar}>
        {/* We pass the contents so the TOC can parse the headers */}
        <TableOfContents contents={contents} />
      </div>
    </div>
  )
}
