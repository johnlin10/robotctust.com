import {
  doc,
  getDoc,
  query,
  where,
  collection,
  getDocs,
} from 'firebase/firestore'
import { db } from './firebase'
import { processFirestoreDoc } from './firestoreHelpers'
import { UserProfile } from '../types/user'

//* 服務器端從 username 獲取使用者資料
export const getUserProfileByUsernameServer = async (
  username: string
): Promise<UserProfile | null> => {
  try {
    const q = query(collection(db, 'users'), where('username', '==', username))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      return null
    }
    const userDoc = querySnapshot.docs[0]
    const data = userDoc.data()
    return processFirestoreDoc<UserProfile>(data)
  } catch (error) {
    console.error('從 username 獲取使用者資料時發生錯誤:', error)
    return null
  }
}

//* 服務器端從 uid 獲取使用者資料
export const getUserProfileServer = async (
  uid: string
): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      const data = userDoc.data()
      return processFirestoreDoc<UserProfile>(data)
    }
    return null
  } catch (error) {
    console.error('獲取使用者資料時發生錯誤:', error)
    return null
  }
}
