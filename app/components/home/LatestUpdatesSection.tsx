import React from 'react'
import Link from 'next/link'
import styles from './LatestUpdatesSection.module.scss'
import { getAllPosts } from '@/app/utils/postService'
import { formatPostDate } from '@/app/utils/postService'
// import { POST_CATEGORY_COLORS } from '@/app/types/post'
// import { TiltCard } from '../TiltCard'
import { Post } from '@/app/types/post'
import Image from 'next/image'
import ScrollAnimation from '../animation/ScrollAnimation/ScrollAnimation'

const LatestUpdatesSection = async () => {
  let posts: Post[] = []
  try {
    const allPosts = await getAllPosts()
    posts = allPosts.slice(0, 3)
  } catch (error) {
    console.error('Failed to fetch posts:', error)
  }

  return (
    <section className={styles.latestUpdatesSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <ScrollAnimation animation="fadeInUp" threshold={0.5}>
            <h2>最新資訊</h2>
          </ScrollAnimation>
        </div>
        <div className={styles.cardsContainer}>
          {posts.map((post, index) => (
            <ScrollAnimation
              animation="fadeInUp"
              threshold={0.5}
              delay={index * 100}
              key={post.id}
            >
              <div className={styles.card}>
                <div className={styles.cardContent}>
                  {post.coverImageUrl && (
                    <div className={styles.coverImageContainer}>
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        width={120}
                        height={90}
                      />
                    </div>
                  )}
                  <div className={styles.content}>
                    <h3>{post.title}</h3>
                    <p className={styles.excerpt}>
                      {post.contentMarkdown
                        ? post.contentMarkdown
                            .substring(0, 100)
                            .replace(/[#*`]/g, '') + '...'
                        : ''}
                    </p>
                  </div>
                  <div className={styles.footer}>
                    <span className={styles.date}>
                      {formatPostDate(post.createdAt)}
                    </span>
                    <Link
                      href={`/update/${post.id}`}
                      className={styles.viewFull}
                    >
                      查看全文
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>

        <Link href="/update" className={styles.viewAll}>
          查看更多文章
        </Link>
      </div>
    </section>
  )
}

export default LatestUpdatesSection
