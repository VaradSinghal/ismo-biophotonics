import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

const serviceAccountPath = path.resolve(__dirname, '../../../FIREBASE_SERVICE_ACCOUNT.json');

export const initFirebaseAdmin = () => {
  if (fs.existsSync(serviceAccountPath)) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath)),
      });
      console.log('Firebase Admin initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT.json not found. Push notifications are disabled.');
  }
};
