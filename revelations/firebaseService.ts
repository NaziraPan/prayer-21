import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../services/firebaseApp';
import { Revelation, RevelationDraft } from './types';

const COLLECTION_NAME = 'revelations';
const LOCAL_STORAGE_KEY = 'revelation_tracker_local_data';

// --- Local storage fallback (used only if Firebase isn't configured) ---
const getLocalData = (): Revelation[] => {
  const str = localStorage.getItem(LOCAL_STORAGE_KEY);
  return str ? JSON.parse(str) : [];
};

const saveLocalData = (data: Revelation[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('revelation-local-update'));
};

export const subscribeToRevelations = (onUpdate: (data: Revelation[]) => void) => {
  if (db) {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const data: Revelation[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Revelation, 'id'>),
        }));
        onUpdate(data);
      },
      (error) => {
        console.error('啟示資料監聽錯誤:', error);
      }
    );
  } else {
    const handleLocalUpdate = () => {
      const data = [...getLocalData()].sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(data);
    };
    handleLocalUpdate();
    window.addEventListener('revelation-local-update', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);
    return () => {
      window.removeEventListener('revelation-local-update', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }
};

export const addRevelation = async (draft: RevelationDraft): Promise<void> => {
  const now = Date.now();
  if (db) {
    await addDoc(collection(db, COLLECTION_NAME), { ...draft, createdAt: now, updatedAt: now });
  } else {
    const data = getLocalData();
    data.push({
      id: `local-${now}-${Math.random().toString(36).slice(2)}`,
      ...draft,
      createdAt: now,
      updatedAt: now,
    });
    saveLocalData(data);
  }
};

export const updateRevelation = async (
  id: string,
  patch: Partial<RevelationDraft>
): Promise<void> => {
  const now = Date.now();
  if (db) {
    await updateDoc(doc(db, COLLECTION_NAME, id), { ...patch, updatedAt: now });
  } else {
    const data = getLocalData();
    const idx = data.findIndex((r) => r.id === id);
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...patch, updatedAt: now };
      saveLocalData(data);
    }
  }
};

export const deleteRevelation = async (id: string): Promise<void> => {
  if (db) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } else {
    const data = getLocalData().filter((r) => r.id !== id);
    saveLocalData(data);
  }
};
