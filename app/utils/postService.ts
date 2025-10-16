import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { User } from 'firebase/auth'
import { UserProfile } from '../types/user'
import { db, storage } from './firebase'
import {
  Post,
  CreatePostData,
  UpdatePostData,
  PostCategory,
  AccessControlDocument,
} from '../types/post'
import { revalidateUpdatePage } from '../action/revalidate'

const POSTS_COLLECTION = 'posts'
const ACCESS_CONTROL_COLLECTION = 'accessControl'
const ACCESS_CONTROL_DOC = 'canPostNews'

/**
 * 檢查使用者是否有發布權限
 */
export async function checkUserPermission(
  user: User | UserProfile
): Promise<boolean> {
  if (!user?.email) return false

  try {
    const accessControlRef = doc(
      db,
      ACCESS_CONTROL_COLLECTION,
      ACCESS_CONTROL_DOC
    )
    const accessControlSnap = await getDoc(accessControlRef)

    if (!accessControlSnap.exists()) {
      console.warn('Access control document does not exist')
      return false
    }

    const data = accessControlSnap.data() as AccessControlDocument
    const authorizedUser = data.authorizedUsers?.find(
      (u) => u.email === user.email && u.active
    )

    return !!authorizedUser
  } catch (error) {
    console.error('Error checking user permission:', error)
    return false
  }
}

/**
 * 獲取所有文章
 */
export async function getAllPosts(): Promise<Post[]> {
  try {
    const postsRef = collection(db, POSTS_COLLECTION)
    const q = query(postsRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[]
  } catch (error) {
    console.error('Error fetching posts:', error)
    throw new Error('無法獲取文章列表')
  }
}

/**
 * 根據分類獲取文章
 */
export async function getPostsByCategory(
  category: PostCategory
): Promise<Post[]> {
  try {
    const postsRef = collection(db, POSTS_COLLECTION)
    const q = query(
      postsRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[]
  } catch (error) {
    console.error('Error fetching posts by category:', error)
    throw new Error('無法獲取分類文章')
  }
}

/**
 * 獲取單篇文章
 */
export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId)
    const postSnap = await getDoc(postRef)

    if (!postSnap.exists()) {
      return null
    }

    const data = postSnap.data()
    return {
      id: postSnap.id,
      ...data,
      // 確保 Timestamp 對象正確處理
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Post
  } catch (error) {
    console.error('Error fetching post:', error)
    throw new Error('無法獲取文章')
  }
}

/**
 * 上傳圖片到 Firebase Storage
 * @param postId 文章 ID，如果是新文章可以使用臨時 ID
 * @param file 要上傳的圖片檔案
 */
export async function uploadPostImage(
  postId: string,
  file: File
): Promise<string> {
  try {
    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExtension}`
    const imagePath = `posts/${postId}/${fileName}`
    const imageRef = ref(storage, imagePath)

    console.log('Uploading image to:', imagePath)
    const snapshot = await uploadBytes(imageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log('Image uploaded successfully, URL:', downloadURL)

    return downloadURL
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error(
      '圖片上傳失敗：' + (error instanceof Error ? error.message : '未知錯誤')
    )
  }
}

/**
 * 為新文章生成臨時 ID（用於圖片上傳路徑）
 */
function generateTempPostId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 刪除圖片從 Firebase Storage
 */
export async function deletePostImage(imageUrl: string): Promise<void> {
  try {
    // 從 URL 中提取檔案路徑
    const url = new URL(imageUrl)
    const pathStart = url.pathname.indexOf('/o/') + 3
    const pathEnd = url.pathname.indexOf('?')
    const filePath = decodeURIComponent(
      url.pathname.substring(pathStart, pathEnd)
    )

    const imageRef = ref(storage, filePath)
    await deleteObject(imageRef)
  } catch (error) {
    console.error('Error deleting image:', error)
    // 不拋出錯誤，因為圖片刪除失敗不應該阻止文章操作
  }
}

/**
 * 建立新文章
 * 先上傳圖片（如果有），然後創建包含圖片 URL 的完整文章
 */
export async function createPost(
  user: User | UserProfile,
  postData: CreatePostData,
  coverImage?: File
): Promise<string> {
  // 檢查權限
  const hasPermission = await checkUserPermission(user)
  if (!hasPermission) {
    throw new Error('您沒有發布文章的權限')
  }

  let coverImageUrl: string | null = null
  let tempPostId: string | null = null

  try {
    // 如果有封面圖片，先上傳圖片
    if (coverImage) {
      console.log('Starting image upload process...')
      tempPostId = generateTempPostId()
      coverImageUrl = await uploadPostImage(tempPostId, coverImage)
      console.log('Image uploaded successfully, proceeding to create post...')
    }

    // 準備完整的文章資料（包含圖片 URL）
    const postDocData = {
      title: postData.title,
      contentMarkdown: postData.contentMarkdown,
      category: postData.category,
      coverImageUrl: coverImageUrl,
      authorId: user.uid,
      authorDisplayName:
        ('displayName' in user
          ? user.displayName
          : (user as User).displayName) ||
        user.email ||
        '匿名使用者',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // 一次性建立完整的文章文件
    console.log('Creating post with data:', {
      ...postDocData,
      coverImageUrl: coverImageUrl ? '[IMAGE_URL]' : null,
    })
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), postDocData)
    console.log('Post created successfully with ID:', docRef.id)

    //* 重新驗證更新頁面
    await revalidateUpdatePage(docRef.id)

    return docRef.id
  } catch (error) {
    console.error('Error in createPost:', error)

    // 如果圖片已經上傳但文章創建失敗，嘗試清理上傳的圖片
    if (coverImageUrl && tempPostId) {
      try {
        console.log(
          'Cleaning up uploaded image due to post creation failure...'
        )
        await deletePostImage(coverImageUrl)
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded image:', cleanupError)
      }
    }

    throw new Error(
      '建立文章失敗：' + (error instanceof Error ? error.message : '未知錯誤')
    )
  }
}

/**
 * 更新文章
 */
export async function updatePost(
  user: User | UserProfile,
  postId: string,
  updateData: UpdatePostData,
  newCoverImage?: File,
  removeCoverImage?: boolean
): Promise<void> {
  // 檢查權限
  const hasPermission = await checkUserPermission(user)
  if (!hasPermission) {
    throw new Error('您沒有編輯文章的權限')
  }

  try {
    const postRef = doc(db, POSTS_COLLECTION, postId)
    const currentPost = await getPostById(postId)

    if (!currentPost) {
      throw new Error('文章不存在')
    }

    let coverImageUrl = currentPost.coverImageUrl

    // 處理封面圖片
    if (removeCoverImage && coverImageUrl) {
      await deletePostImage(coverImageUrl)
      coverImageUrl = null
    } else if (newCoverImage) {
      // 刪除舊圖片
      if (coverImageUrl) {
        await deletePostImage(coverImageUrl)
      }
      // 上傳新圖片
      coverImageUrl = await uploadPostImage(postId, newCoverImage)
    }

    // 更新文章
    const updatePayload = {
      ...updateData,
      updatedAt: serverTimestamp(),
    }

    // 只有在圖片有變化時才更新 coverImageUrl
    if (removeCoverImage || newCoverImage) {
      Object.assign(updatePayload, { coverImageUrl })
    }

    //* 重新驗證更新頁面
    await revalidateUpdatePage(postId)

    await updateDoc(postRef, updatePayload)
  } catch (error) {
    console.error('Error updating post:', error)
    throw new Error('更新文章失敗')
  }
}

/**
 * 刪除文章
 */
export async function deletePost(
  user: User | UserProfile,
  postId: string
): Promise<void> {
  // 檢查權限
  const hasPermission = await checkUserPermission(user)
  if (!hasPermission) {
    throw new Error('您沒有刪除文章的權限')
  }

  try {
    const post = await getPostById(postId)
    if (!post) {
      throw new Error('文章不存在')
    }

    // 刪除封面圖片
    if (post.coverImageUrl) {
      await deletePostImage(post.coverImageUrl)
    }

    // 刪除文章文件
    const postRef = doc(db, POSTS_COLLECTION, postId)

    //* 重新驗證更新頁面
    await revalidateUpdatePage(postId)

    await deleteDoc(postRef)
  } catch (error) {
    console.error('Error deleting post:', error)
    throw new Error('刪除文章失敗')
  }
}

/**
 * 格式化時間顯示
 */
export function formatPostDate(timestamp: Timestamp): string {
  const date = timestamp.toDate()
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60)
    return `${diffInMinutes} 分鐘前`
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    return `${hours} 小時前`
  } else if (diffInHours < 24 * 7) {
    const days = Math.floor(diffInHours / 24)
    return `${days} 天前`
  } else {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}
