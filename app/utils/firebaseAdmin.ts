import * as admin from 'firebase-admin'
import path from 'path'
import fs from 'fs'

let app: admin.app.App

if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.join(process.cwd(), 'robot-group-firebase-adminsdk-fbsvc-21357d1bbe.json')
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
    } else {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      })
    }
  } catch (error) {
    console.error('Firebase Admin initialization error', error)
    app = admin.initializeApp()
  }
} else {
  app = admin.apps[0]!
}

export const adminDb = admin.firestore()
export default admin
