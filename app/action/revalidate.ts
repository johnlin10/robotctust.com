'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateUpdatePage(postId?: string) {
  try {
    revalidatePath('/news')
    revalidatePath('/en/news')

    if (postId) {
      revalidatePath(`/news/${postId}`)
      revalidatePath(`/en/news/${postId}`)
    }

    return {
      success: true,
      message: 'News pages revalidated successfully',
    }
  } catch (error) {
    console.error('Error revalidating news pages:', error)
    throw new Error('Error revalidating news pages: ' + String(error))
  }
}
