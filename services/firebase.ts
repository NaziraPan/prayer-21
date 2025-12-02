import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  getDoc
} from "firebase/firestore";
import { DailyRecord, ProgressData, UserID } from "../types";

// ------------------------------------------------------------------
// 🔥 關鍵步驟：請將下方的設定替換為您從 Firebase 控制台複製的內容
// ------------------------------------------------------------------
// 1. 前往 https://console.firebase.google.com/
// 2. 建立專案 -> 建立 Firestore Database (選擇測試模式 Test Mode)
// 3. 專案設定 -> 一般 -> 新增網頁應用程式 (Web App) -> 複製 firebaseConfig
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyCzoTNUH7yekyS2-Uu2LwOLRrmDuNa437o",
  authDomain: "prayer-21.firebaseapp.com",
  projectId: "prayer-21",
  storageBucket: "prayer-21.firebasestorage.app",
  messagingSenderId: "107274688872",
  appId: "1:107274688872:web:0ebe3be91935cef9b81edd",
  measurementId: "G-8NSHBSE3L7"
};

// Initialize Firebase
let db: any = null;

try {
  // 檢查是否已經填入真實的 API Key
  // 如果您填入了真實的 Key，這裡就會啟動 Firebase 連線
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("✅ Firebase 連線成功！資料將會同步。");
  } else {
    console.warn("⚠️ 尚未設定 Firebase API Key。目前處於「單機演示模式」，資料僅存在您的瀏覽器中，無法與他人同步。");
  }
} catch (e) {
  console.error("Firebase 初始化失敗:", e);
}

// 修改這裡：將 2026 改回 2025
const COLLECTION_NAME = "prayer_challenge_2025";
const LOCAL_STORAGE_KEY = "prayer_challenge_local_data";

// --- Helper for Local Storage (備用方案) ---
const getLocalData = (): ProgressData => {
  const str = localStorage.getItem(LOCAL_STORAGE_KEY);
  return str ? JSON.parse(str) : {};
};

const saveLocalData = (data: ProgressData) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('local-data-update'));
};

// --- Service Functions ---

/**
 * 監聽資料變更 (三人同步的核心)
 */
export const subscribeToProgress = (onUpdate: (data: ProgressData) => void) => {
  if (db) {
    // 🔥 雲端模式：監聽 Firebase 資料庫變更
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(colRef, (snapshot) => {
      const data: ProgressData = {};
      snapshot.forEach((doc) => {
        data[doc.id] = doc.data() as DailyRecord;
      });
      onUpdate(data);
    }, (error) => {
      console.error("Firebase 監聽錯誤:", error);
    });
  } else {
    // 🏠 單機模式：監聽 LocalStorage
    const handleLocalUpdate = () => {
      onUpdate(getLocalData());
    };
    handleLocalUpdate();
    window.addEventListener('local-data-update', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);
    return () => {
      window.removeEventListener('local-data-update', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }
};

/**
 * 執行打卡動作
 */
export const toggleCheckIn = async (dateStr: string, userId: UserID, currentStatus: boolean) => {
  if (db) {
    // 🔥 雲端模式：寫入 Firebase
    try {
      const docRef = doc(db, COLLECTION_NAME, dateStr);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // 如果該日期的資料不存在，建立新資料
        const initialData: DailyRecord = {
          date: dateStr,
          xiaolu: false,
          jingfang: false,
          jingyi: false,
          [userId]: !currentStatus
        };
        await setDoc(docRef, initialData);
      } else {
        // 如果存在，只更新該使用者的狀態
        await updateDoc(docRef, {
          [userId]: !currentStatus
        });
      }
    } catch (e) {
      console.error("打卡失敗 (Firebase):", e);
      alert("打卡失敗，請檢查網路連線");
    }
  } else {
    // 🏠 單機模式：寫入 LocalStorage
    const data = getLocalData();
    const record = data[dateStr] || {
      date: dateStr,
      xiaolu: false,
      jingfang: false,
      jingyi: false
    };

    record[userId] = !currentStatus;
    data[dateStr] = record;
    saveLocalData(data);
  }
};