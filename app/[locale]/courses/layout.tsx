import { ReactNode } from 'react'
import styles from './courses.module.scss'

import Page from '@/app/components/page/Page'

// contexts
import { CourseMobileFabProvider } from './contexts/CourseMobileFabContext'

export default async function CoursesLayout({
  children,
  aside,
}: {
  children: ReactNode
  aside?: ReactNode
}) {
  return (
    <CourseMobileFabProvider>
      <Page
        style={styles.container}
        config={{
          paddingBottom: false,
        }}
        maxWidth="max-content"
        aside={aside}
      >
        {children}
      </Page>
    </CourseMobileFabProvider>
  )
}
