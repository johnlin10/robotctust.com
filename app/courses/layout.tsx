import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import styles from './courses.module.scss'

// util
import { createClient } from '@/app/utils/supabase/server'
import Page from '../components/page/Page'
import { CourseSidebar } from './components/CourseSidebar/CourseSidebar'

// contexts
import { CourseSidebarProvider } from './contexts/CourseSidebarContext'
import { CourseMobileFabProvider } from './contexts/CourseMobileFabContext'

// types
import { SemesterNode } from './types/course'

import { getAccessibleSemestersTree } from '@/app/utils/courseService'
import { isUserSemesterMember } from '@/app/utils/auth/membership'

export default async function CoursesLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  if (!authData?.user) {
    redirect('/login?next=/courses')
  }

  // 檢查是否為學期社員
  const isMember = await isUserSemesterMember()
  if (!isMember) {
    redirect('/')
  }

  // Fetch semesters to pass to the sidebar via Service Layer
  const typedSemesters = await getAccessibleSemestersTree()

  return (
    <CourseSidebarProvider>
      <CourseMobileFabProvider>
        <Page
          style={styles.container}
          config={{
            paddingBottom: false,
          }}
          maxWidth="fit-content"
        >
          <div className={styles.layoutWrapper}>
            <CourseSidebar semesters={typedSemesters} />
            <main className={styles.mainContent}>{children}</main>
          </div>
        </Page>
      </CourseMobileFabProvider>
    </CourseSidebarProvider>
  )
}
