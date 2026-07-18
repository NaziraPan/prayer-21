import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { db } from "./firebaseApp";
import { DailyRecord, ProgressData, UserID } from "../types";

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