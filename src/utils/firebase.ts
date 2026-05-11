import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCQBDjr9N06eM8WQo5hjssL43tNKIsmmJY",
  authDomain: "opticore-markets-20bba.firebaseapp.com",
  projectId: "opticore-markets-20bba",
  storageBucket: "opticore-markets-20bba.firebasestorage.app",
  messagingSenderId: "758547476611",
  appId: "1:758547476611:web:73aa43322648ad42d72bb6"
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;