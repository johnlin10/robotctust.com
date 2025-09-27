import { Post, PostCategory } from './post'

/**
 * 序列化後的文章資料型別（用於 server/client 間傳遞）
 */
export interface SerializedPost {
  id: string
  title: string
  contentMarkdown: string
  category: PostCategory
  coverImageUrl: string | null
  authorId: string
  authorDisplayName: string
  // 將 Timestamp 轉為 ISO 字串
  createdAt: string
  updatedAt: string
}

/**
 * 將 Post 轉為 SerializedPost
 */
export function serializePost(post: Post): SerializedPost {
  return {
    id: post.id,
    title: post.title,
    contentMarkdown: post.contentMarkdown,
    category: post.category,
    coverImageUrl: post.coverImageUrl,
    authorId: post.authorId,
    authorDisplayName: post.authorDisplayName,
    createdAt: post.createdAt.toDate().toISOString(),
    updatedAt: post.updatedAt.toDate().toISOString(),
  }
}

/**
 * 將 SerializedPost 轉回 Post（在 client 端使用）
 */
export function deserializePost(serializedPost: SerializedPost): Post {
  return {
    id: serializedPost.id,
    title: serializedPost.title,
    contentMarkdown: serializedPost.contentMarkdown,
    category: serializedPost.category,
    coverImageUrl: serializedPost.coverImageUrl,
    authorId: serializedPost.authorId,
    authorDisplayName: serializedPost.authorDisplayName,
    createdAt: {
      toDate: () => new Date(serializedPost.createdAt),
      seconds: Math.floor(new Date(serializedPost.createdAt).getTime() / 1000),
      nanoseconds: 0,
    } as unknown as import('firebase/firestore').Timestamp,
    updatedAt: {
      toDate: () => new Date(serializedPost.updatedAt),
      seconds: Math.floor(new Date(serializedPost.updatedAt).getTime() / 1000),
      nanoseconds: 0,
    } as unknown as import('firebase/firestore').Timestamp,
  }
}
