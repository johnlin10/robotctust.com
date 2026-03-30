import * as admin from 'firebase-admin'

let app: admin.app.App

if (!admin.apps.length) {
  try {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  } catch (error) {
    console.error('Firebase Admin initialization error', error)
    app = admin.initializeApp()
  }
} else {
  app = admin.apps[0]!
}

export const adminDb = admin.firestore()
export default admin
