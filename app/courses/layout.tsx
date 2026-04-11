import { ReactNode } from 'react'
import styles from './courses.module.scss'

import Page from '../components/page/Page'
import { CourseSidebar } from './components/CourseSidebar/CourseSidebar'

// contexts
import { CourseMobileFabProvider } from './contexts/CourseMobileFabContext'

// types
import { getPublishedSemestersTree } from '@/app/utils/courseService'

export default async function CoursesLayout({
  children,
}: {
  children: ReactNode
}) {
  const typedSemesters = await getPublishedSemestersTree()

  return (
    <CourseMobileFabProvider>
      <Page
        style={styles.container}
        config={{
          paddingBottom: false,
        }}
        maxWidth="max-content"
        aside={<CourseSidebar semesters={typedSemesters} />}
      >
        {children}
      </Page>
    </CourseMobileFabProvider>
  )
}
