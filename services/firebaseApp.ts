import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// Shared Firebase project config (used by both the prayer check-in app
// and the revelation tracker, each in its own Firestore collection).
const firebaseConfig = {
  apiKey: "AIzaSyCzoTNUH7yekyS2-Uu2LwOLRrmDuNa437o",
  authDomain: "prayer-21.firebaseapp.com",
  projectId: "prayer-21",
  storageBucket: "prayer-21.firebasestorage.app",
  messagingSenderId: "107274688872",
  appId: "1:107274688872:web:0ebe3be91935cef9b81edd",
  measurementId: "G-8NSHBSE3L7"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.warn("⚠️ 尚未設定 Firebase API Key，目前處於單機演示模式。");
  }
} catch (e) {
  console.error("Firebase 初始化失敗:", e);
}

export { db };
