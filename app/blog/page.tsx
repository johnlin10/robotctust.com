// import Link from 'next/link'
import styles from './blog.module.scss'
// import { testPosts } from './posts'
import Page from '../components/page/Page'

export default function Blog() {
  return (
    <Page style={styles.blogContainer}>
      <h1>部落格</h1>
      <p>正在建置中...</p>
      {/* <ul className={styles.postList}>
          {testPosts.map((post) => (
            <li key={post.id} className={styles.postContainer}>
              <Link href={`/blog/${post.id}`} key={post.id}>
                <div className={styles.postContent}>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul> */}
    </Page>
  )
}

export async function generateMetadata() {
  return {
    title: '部落格｜中臺機器人研究社',
    description: '中臺機器人研究社的部落格',
    openGraph: {
      title: '部落格｜中臺機器人研究社',
      description: '中臺機器人研究社的部落格',
    },
  }
}
