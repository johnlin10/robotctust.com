'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { CourseContent } from '@/app/types/course-admin'
import styles from './TableOfContents.module.scss'

interface TableOfContentsProps {
  contents: CourseContent[]
}

interface TocItem {
  id: string
  title: string
  level: number
}

// Helper to extract text from markdown heading
const extractMarkdownHeader = (content: string): { title: string, level: number } | null => {
  const match = content.match(/^(#{1,3})\s+(.*)$/m)
  if (match) {
    return {
      title: match[2].trim(),
      level: match[1].length
    }
  }
  return null
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ contents }) => {
  const [activeId, setActiveId] = useState<string>('')

  // Parse headers from the content list
  const tocItems = useMemo(() => {
    const items: TocItem[] = []
    
    contents.forEach(block => {
      // Direct headers
      if (block.type === 'header1' || block.type === 'header2' || block.type === 'header3') {
        items.push({
          id: `block-${block.id}`,
          title: block.content,
          level: parseInt(block.type.replace('header', '')),
        })
      } 
      // Markdown parsing for headers (simplified for first match)
      else if (block.type === 'markdown') {
        const mdHeader = extractMarkdownHeader(block.content)
        if (mdHeader) {
          items.push({
            id: `block-${block.id}-mdh${mdHeader.level}`,
            title: mdHeader.title,
            level: mdHeader.level,
          })
        }
      }
    })
    
    return items
  }, [contents])

  // Use IntersectionObserver to highlight active item
  useEffect(() => {
    if (tocItems.length === 0) return

    const callbacks: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }
    
    const observer = new IntersectionObserver(callbacks, {
      rootMargin: '-10% 0px -80% 0px',
    })

    tocItems.forEach(item => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [tocItems])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -100 // Account for header offset
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      })
      setActiveId(id)
    }
  }

  if (tocItems.length === 0) {
    return null
  }

  return (
    <div className={styles.tocContainer}>
      <h4 className={styles.tocTitle}>本頁大綱</h4>
      <nav className={styles.tocNav}>
        <ul>
          {tocItems.map(item => (
            <li key={item.id} className={`${styles[`level${item.level}`]} ${activeId === item.id ? styles.active : ''}`}>
              <a 
                href={`#${item.id}`} 
                onClick={(e) => handleClick(e, item.id)}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
