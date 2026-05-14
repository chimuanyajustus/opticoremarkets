import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const q = query(collection(db,'transactions'), orderBy('createdAt','desc'));
const snapshot = await getDocs(q);
console.log('transactions', snapshot.size);
for (const doc of snapshot.docs.slice(0,20)) {
  console.log(doc.id, JSON.stringify(doc.data()));
}
