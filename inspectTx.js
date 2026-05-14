import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: 'AIzaSyCQBDjr9N06eM8WQo5hjssL43tNKIsmmJY',
  authDomain: 'opticore-markets-20bba.firebaseapp.com',
  projectId: 'opticore-markets-20bba',
  storageBucket: 'opticore-markets-20bba.firebasestorage.app',
  messagingSenderId: '758547476611',
  appId: '1:758547476611:web:73aa43322648ad42d72bb6'
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const q = query(collection(db,'transactions'), orderBy('createdAt','desc'));
const snapshot = await getDocs(q);
console.log('transactions', snapshot.size);
for (const doc of snapshot.docs.slice(0,20)) {
  console.log(doc.id, JSON.stringify(doc.data()));
}
