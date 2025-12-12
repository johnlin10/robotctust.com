import Image from 'next/image'
import styles from './LessonIntro.module.scss'

export default function LessonIntro() {
  return (
    <div className={styles.lessonIntro}>
      <div className={styles.lessonIntroContainer}>
        <div className={styles.header}>
          <h1>課程介紹</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2>標題文字</h2>
              <p>
                描述文字描述文字描述文字，描述文字描述文字，描述文字描述文字描述文字，描述文字描述文字。
              </p>
            </div>
            <div className={styles.sectionImage}>
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/robot-group.firebasestorage.app/o/posts%2Fmanual_uploads%2F20251029-course-2%2F20251029%20%E7%A4%BE%E5%9C%98%E8%AA%B2%E7%A8%8B-%E8%87%AA%E8%B5%B0%E8%BB%8A%E7%A8%8B%E5%BC%8F-9.jpg?alt=media&token=ccc62f36-e8b1-4fcf-ba75-ba2587722180"
                width={800}
                height={600}
                alt="課程介紹"
                loading="lazy"
                quality={85}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
