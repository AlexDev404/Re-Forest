// src/lib/server/firebase.ts
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';


const serviceAccount = JSON.parse(
  readFileSync(resolve('src/lib/server/refores-71a01-firebase-adminsdk-fbsvc-fadef4d6b1.json'), 'utf8')
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const messaging = admin.messaging();
