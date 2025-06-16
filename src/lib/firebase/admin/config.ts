import * as admin from 'firebase-admin';

// Check if already initialized
if (!admin.apps.length) {
  try {
    // Using base64-encoded credentials from environment variable
    if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
      const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_ADMIN_CREDENTIALS, 'base64').toString()
      );
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      console.log('Firebase Admin SDK initialized with encoded credentials');
    }
    // Using local file (fallback)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      console.log('Firebase Admin SDK initialized with credential file');
    } 
    else {
      console.error('No Firebase Admin credentials provided');
    }
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    console.error(error);
  }
}

// Export the admin SDK instances
export default admin;
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();