'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './CourseSidebar.module.scss'

// components
import { Aside, useAside } from '@/app/components/Aside'

// contexts
import { useCourseMobileFab } from '../../contexts/CourseMobileFabContext'

// types
import { SemesterNode } from '../../types/course'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronUp,
  faBook,
} from '@fortawesome/free-solid-svg-icons'

interface CourseSidebarProps {
  semesters: SemesterNode[]
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({ semesters }) => {
  const pathname = usePathname()
  const { setIsOpen } = useAside()
  const { registerAction, unregisterAction } = useCourseMobileFab()

  // To keep track of which semester's folder is expanded
  const [expandedSemesters, setExpandedSemesters] = useState<
    Record<string, boolean>
  >(() => {
    // Expand the first semester by default
    const initial: Record<string, boolean> = {}
    if (semesters.length > 0) {
      initial[semesters[0].id] = true
    }
    return initial
  })

  // To keep track of expanded chapters inside semesters
  const [expandedChapters, setExpandedChapters] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {}
    if (semesters.length > 0 && semesters[0].chapters.length > 0) {
      initial[semesters[0].chapters[0].id] = true
    }
    return initial
  })

  const toggleSemester = (id: string) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleChapter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setExpandedChapters((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 859px)')
    const updateFab = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        registerAction({
          id: 'toc',
          type: 'button',
          icon: faBook,
          label: '目錄',
          priority: 20,
          onClick: () => setIsOpen(true),
        })
      } else {
        unregisterAction('toc')
      }
    }

    // Initial check
    updateFab(mql)

    // Listen for changes
    mql.addEventListener('change', updateFab)
    return () => {
      mql.removeEventListener('change', updateFab)
      unregisterAction('toc')
    }
  }, [setIsOpen, registerAction, unregisterAction])

  const customContent = (
    <div className={styles.navContent}>
      <Link
        href="/courses"
        className={`${styles.overviewLink} ${pathname === '/courses' ? styles.active : ''}`}
        onClick={() => setIsOpen(false)}
      >
        <FontAwesomeIcon icon={faBook} />
        總覽
      </Link>

      <div className={styles.semesterList}>
        {semesters.map((semester) => (
          <div key={semester.id} className={styles.semesterSection}>
            <button
              className={`${styles.semesterHeader} ${expandedSemesters[semester.id] ? styles.active : ''}`}
              onClick={() => toggleSemester(semester.id)}
            >
              <h3>{semester.name}</h3>
              <FontAwesomeIcon
                icon={
                  expandedSemesters[semester.id]
                    ? faChevronUp
                    : faChevronDown
                }
              />
            </button>

            {expandedSemesters[semester.id] && (
              <div className={styles.chapterList}>
                {semester.chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className={`${styles.chapterGroup} ${expandedChapters[chapter.id] ? styles.expanded : ''}`}
                  >
                    <button
                      className={styles.chapterHeader}
                      onClick={(e) => toggleChapter(chapter.id, e)}
                    >
                      <span className={styles.chapterTitle}>
                        {chapter.title}
                      </span>
                      <FontAwesomeIcon
                        icon={
                          expandedChapters[chapter.id]
                            ? faChevronUp
                            : faChevronDown
                        }
                        className={styles.chapterIcon}
                      />
                    </button>

                    {expandedChapters[chapter.id] && (
                      <div className={styles.courseList}>
                        {chapter.courses.map((course, index) => {
                          const courseUrl = `/courses/${course.id}`
                          const isCourseActive = pathname === courseUrl

                          return (
                            <Link
                              key={course.id}
                              href={courseUrl}
                              onClick={() => setIsOpen(false)}
                              className={`${styles.courseLink} ${isCourseActive ? styles.active : ''}`}
                            >
                              <p className={styles.courseIndex}>
                                {index + 1}
                              </p>
                              {course.name}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {semesters.length === 0 && (
          <div className={styles.emptyState}>
            暫無可用的課程，或您尚未成為任何學期的成員。
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Aside
      mode="custom"
      header={{ title: '學習工坊', subtitle: '社團課程' }}
      customContent={customContent}
      className={styles.sidebar}
    />
  )
}
