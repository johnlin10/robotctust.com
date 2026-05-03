import styles from './blog-post.module.scss'
import { Metadata } from 'next'
import { getPostById, testPosts } from '../posts'

export async function generateStaticParams() {
  return testPosts.map((post) => ({
    slug: post.id,
  }))
}

export default async function Page({
  params,
}: // searchParams,
{
  params: Promise<{ slug: string }>
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params

  const post = getPostById(slug)

  if (!post) {
    return <div>Post not found</div>
  }

  return (
    <div className="page">
      <article className={`page-container ${styles.blogPost}`}>
        <h1>{post.title}</h1>
        <p>{post.publishedAt}</p>
        <p>{post.content}</p>
      </article>
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostById(slug)

  return {
    title: `${post?.title}｜中臺機器人研究社`,
    description: post?.content,
    openGraph: {
      title: `${post?.title}｜中臺機器人研究社`,
      description: post?.content,
    },
  }
}
