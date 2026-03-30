'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './CourseSidebar.module.scss'

// components
import { Aside } from '@/app/components/Aside'

// contexts
import { useCourseSidebar } from '../../contexts/CourseSidebarContext'

// types
import { SemesterNode } from '../../types/course'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronUp,
  faBook,
  faLockOpen,
} from '@fortawesome/free-solid-svg-icons'

interface CourseSidebarProps {
  semesters: SemesterNode[]
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({ semesters }) => {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useCourseSidebar()

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

  return (
    <>
      <Aside
        className={styles.sidebar}
        isMobileDrawer={true}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className={styles.header}>
          <h2>社團課程</h2>
        </div>

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
                            {chapter.courses.map((course) => {
                              const courseUrl = `/courses/${course.id}`
                              const isCourseActive = pathname === courseUrl

                              return (
                                <Link
                                  key={course.id}
                                  href={courseUrl}
                                  onClick={() => setIsOpen(false)}
                                  className={`${styles.courseLink} ${isCourseActive ? styles.active : ''}`}
                                >
                                  {/* <span className={styles.iconWrapper}>
                                    <FontAwesomeIcon
                                      icon={faLockOpen}
                                      className={styles.courseIcon}
                                    />
                                  </span> */}
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
      </Aside>

      {/* Floating Action Button for Mobile Drawer */}
      <button
        className={styles.mobileFab}
        onClick={() => setIsOpen(true)}
        aria-label="開啟課程目錄"
      >
        <FontAwesomeIcon icon={faBook} />
        目錄
      </button>
    </>
  )
}
