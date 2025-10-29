'use client'

import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './SubDocsClient.module.scss'
import { subDocs } from '../../docs'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

export default function SubDocsClient() {
  return (
    <div className={styles.subDocs}>
      {subDocs.map((docGroup) => (
        <div className={styles.docGroup} key={docGroup.id}>
          <h2>{docGroup.title}</h2>
          {docGroup.docs.map((subDoc) => {
            // 取得今天日期
            const todayDate = new Date()
            const today = todayDate
              .toISOString()
              .split('T')[0]
              .split('-')
              .join('/')
            // 取得明天日期
            const tomorrow = new Date(todayDate.getTime() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0]
              .split('-')
              .join('/')

            // 取得文件日期
            const date = subDoc.date.split('-').join('/')
            // 判斷是否為今天或明天
            const isToday = date === today
            const isTomorrow = date === tomorrow

            return (
              <div className={styles.subDoc} key={subDoc.id}>
                <h4 className={styles.subDocTitle}>
                  <span
                    className={`${styles.subDocDate} ${
                      isToday ? styles.subDocToday : ''
                    } ${isTomorrow ? styles.subDocTomorrow : ''}`}
                  >
                    {isToday ? '今天' : isTomorrow ? '明天' : date}
                  </span>
                  {subDoc.title}
                </h4>
                <div className={styles.subDocDocs}>
                  {subDoc.docs.map((doc) => (
                    <Link
                      key={doc.id}
                      href={doc.filePath}
                      className={styles.subDocLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`查看 ${doc.title} 文件`}
                    >
                      {doc.icon && (
                        <FontAwesomeIcon
                          icon={doc.icon}
                          className={styles.fileIcon}
                        />
                      )}
                      <h4 className={styles.subDocTitle}>{doc.title}</h4>
                      <span className={styles.subDocType}>{doc.type}</span>
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className={styles.linkIcon}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
