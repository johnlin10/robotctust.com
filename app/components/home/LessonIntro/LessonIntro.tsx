'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import styles from './LessonIntro.module.scss'
import { useTranslations } from 'next-intl'

// component
import ScrollAnimation from '@/app/components/animation/ScrollAnimation/ScrollAnimation'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlay,
  faPause,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'

interface LessonCard {
  id: string
  imageUrl: string
  cta?: {
    textKey: string
    link: string
  }
}

const lessonData: LessonCard[] = [
  {
    id: 'lesson-1',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/robot-group.firebasestorage.app/o/posts%2Fmanual_uploads%2F20251008%2F_JIN0322.jpg?alt=media&token=0d7bff2b-5c23-425c-9ef8-85d57d146e8e',
  },
  {
    id: 'lesson-2',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/robot-group.firebasestorage.app/o/posts%2Fmanual_uploads%2F20251015-club-activity-robot-diy%2F251015-club-activity-robot-diy-17.jpg?alt=media&token=fcaf6b77-e262-4014-92e0-976fb763f26c',
  },
  {
    id: 'lesson-3',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/robot-group.firebasestorage.app/o/posts%2Fmanual_uploads%2F20251029-course-2%2F20251029%20%E7%A4%BE%E5%9C%98%E8%AA%B2%E7%A8%8B-%E8%87%AA%E8%B5%B0%E8%BB%8A%E7%A8%8B%E5%BC%8F-5.jpg?alt=media&token=77da0b8a-6e34-4cba-9766-a470dd7e85a6',
  },
  {
    id: 'lesson-4',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/robot-group.firebasestorage.app/o/posts%2Fmanual_uploads%2F20251227%2F20251227-1.jpeg?alt=media&token=ab7b0c27-42a0-48d5-aaa8-4bf543bcc268',
  },
]

/**
 * [Component] 課程概覽
 * @returns {JSX.Element}
 */
export default function LessonIntro() {
  const t = useTranslations('Home.LessonIntro')
  // 目前顯示的卡片索引
  const [currentIndex, setCurrentIndex] = useState(0)
  // 是否暫停
  const [isPaused, setIsPaused] = useState(false)
  // 進度
  const [progress, setProgress] = useState(0)
  // 觸摸起始 X 座標
  const touchStartX = useRef<number | null>(null)

  // 自動播放間隔
  const autoPlayInterval = 5000 // 5 seconds
  // 更新進度間隔
  const updateInterval = 50 // Update progress every 50ms

  /**
   * [Function] 下一張卡片
   * @returns {void}
   */
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % lessonData.length)
    setProgress(0)
  }, [])

  /**
   * [Function] 上一張卡片
   * @returns {void}
   */
  const prevSlide = useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + lessonData.length) % lessonData.length,
    )
    setProgress(0)
  }, [])

  /**
   * [Function] 跳轉到指定卡片
   * @param {number} index - 卡片索引
   * @returns {void}
   */
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setProgress(0)
  }

  /**
   * [Effect] 自動播放與進度更新
   * @returns {void}
   */
  useEffect(() => {
    if (isPaused) return

    // 計時器
    const startTime = Date.now()
    const timer = setInterval(() => {
      // 計算經過時間
      const elapsed = Date.now() - startTime
      // 計算進度
      const currentProgress = Math.min((elapsed / autoPlayInterval) * 100, 100)
      // 更新進度
      setProgress(currentProgress)

      // 如果經過時間大於或等於自動播放間隔，則跳轉到下一張卡片
      if (elapsed >= autoPlayInterval) {
        nextSlide()
      }
    }, updateInterval)
    return () => clearInterval(timer)
  }, [isPaused, currentIndex, nextSlide])

  /**
   * [Function] 觸摸起始
   * @param {React.TouchEvent} e - 觸摸事件
   * @returns {void}
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    // 觸摸起始 X 座標
    touchStartX.current = e.touches[0].clientX
  }

  /**
   * [Function] 觸摸結束
   * @param {React.TouchEvent} e - 觸摸事件
   * @returns {void}
   */
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return

    // 觸摸結束 X 座標
    const touchEndX = e.changedTouches[0].clientX
    // 計算 X 座標差值
    const deltaX = touchStartX.current - touchEndX

    if (deltaX > 50) {
      // 如果 X 座標差值大於 50px，則跳轉到下一張卡片
      nextSlide()
    } else if (deltaX < -50) {
      // 如果 X 座標差值小於 -50px，則跳轉到上一張卡片
      prevSlide()
    }

    // 清除觸摸起始 X 座標
    touchStartX.current = null
  }

  return (
    <div className={styles.lessonIntro}>
      <div className={styles.lessonIntroContainer}>
        <div className={styles.header}>
          <h1>{t('title')}</h1>
        </div>

        <ScrollAnimation
          animation="fadeInUp"
          once={false}
          className={styles.carouselWrapper}
          style={{ '--current-index': currentIndex } as React.CSSProperties}
        >
          <div
            className={styles.carousel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={styles.track}
              style={{
                transform: `translateX(calc(-1 * var(--current-index) * (var(--card-width) + var(--gap))))`,
              }}
            >
              {lessonData.map((lesson, index) => (
                <div
                  key={`${lesson.id}-${index}`}
                  className={styles.slide}
                  aria-hidden={currentIndex !== index}
                >
                  <div className={styles.imageWrapper}>
                    <Image
                      src={lesson.imageUrl}
                      alt={t(`lessons.${index}.title`)}
                      fill
                      sizes="(max-width: 768px) 100vw, 1200px"
                      style={{ objectFit: 'cover' }}
                      priority={index === 0}
                      quality={85}
                    />
                  </div>
                  <div className={styles.gradient_blur}>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <div className={styles.overlay} />
                  <div className={styles.textContainer}>
                    <h2>{t(`lessons.${index}.title`)}</h2>
                    <p>{t(`lessons.${index}.description`)}</p>
                    {lesson.cta && (
                      <a href={lesson.cta.link} className={styles.ctaButton}>
                        {t(lesson.cta.textKey)}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <FontAwesomeIcon icon={faChevronLeft} size="lg" />
            </button>
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <FontAwesomeIcon icon={faChevronRight} size="lg" />
            </button>
          </div>

          <div className={styles.controls}>
            <button
              className={styles.playPauseButton}
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? (
                <FontAwesomeIcon
                  className={styles.playIcon}
                  icon={faPlay}
                  size="lg"
                />
              ) : (
                <FontAwesomeIcon
                  className={styles.pauseIcon}
                  icon={faPause}
                  size="lg"
                />
              )}
            </button>
            <div className={styles.indicators}>
              {lessonData.map((_, index) => (
                <div
                  key={index}
                  className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
                  onClick={() => goToSlide(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {index === currentIndex && (
                    <div
                      className={styles.progress}
                      style={{
                        width: `${progress}%`,
                        transition: 'width 50ms linear',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  )
}
