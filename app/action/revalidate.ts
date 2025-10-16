'use server'

import { revalidatePath } from 'next/cache'

/** */
export async function revalidateUpdatePage(postId?: string) {
  try {
    revalidatePath('/update')

    if (postId) {
      revalidatePath(`/update/${postId}`)
    }

    return {
      success: true,
      message: 'Update page revalidated successfully',
    }
  } catch (error) {
    console.error('Error revalidating update page:', error)
    throw new Error('Error revalidating update page: ' + String(error))
  }
}
