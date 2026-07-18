import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../services/firebaseApp';
import { Revelation, RevelationDraft } from './types';
import { SEED_REVELATIONS } from './seedData';

const COLLECTION_NAME = 'revelations';
const LOCAL_STORAGE_KEY = 'revelation_tracker_local_data';

const todayStr = () => new Date().toISOString().slice(0, 10);

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
    const q = query(collection(db, COLLECTION_NAME), orderBy('recurCount', 'desc'));
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
      const data = [...getLocalData()].sort((a, b) => b.recurCount - a.recurCount);
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
  const today = todayStr();
  const full = { ...draft, firstDate: today, lastDate: today, recurCount: 1, createdAt: now, updatedAt: now };
  if (db) {
    await addDoc(collection(db, COLLECTION_NAME), full);
  } else {
    const data = getLocalData();
    data.push({ id: `local-${now}-${Math.random().toString(36).slice(2)}`, ...full });
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

// "又來一次" — the same word recurred: bump the count and push the date
// forward without touching anything else about the entry.
export const bumpRecurrence = async (revelation: Revelation): Promise<void> => {
  const now = Date.now();
  const patch = { recurCount: revelation.recurCount + 1, lastDate: todayStr(), updatedAt: now };
  if (db) {
    await updateDoc(doc(db, COLLECTION_NAME, revelation.id), patch);
  } else {
    const data = getLocalData();
    const idx = data.findIndex((r) => r.id === revelation.id);
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...patch };
      saveLocalData(data);
    }
  }
};

// One-time import of the historical rhema archive. Uses the legacy id as
// the Firestore document id (setDoc, not addDoc) so re-running this is
// always safe — it just overwrites the same 81 docs, never duplicates them.
export const importSeedData = async (): Promise<number> => {
  const now = Date.now();
  if (db) {
    const existingSnap = await getDocs(collection(db, COLLECTION_NAME));
    const existingIds = new Set(existingSnap.docs.map((d) => d.id));
    await Promise.all(
      SEED_REVELATIONS.map((seed) => {
        const id = `seed-${seed.legacyId}`;
        const payload: Record<string, unknown> = {
          text: seed.text,
          category: seed.category,
          type: seed.type,
          firstDate: seed.firstDate,
          lastDate: seed.lastDate,
          recurCount: seed.recurCount,
          updatedAt: now,
        };
        // Only set status/createdAt the first time, so re-running the
        // import never clobbers status changes made through the app.
        if (!existingIds.has(id)) {
          payload.status = '尚未開始';
          payload.createdAt = now;
        }
        return setDoc(doc(db, COLLECTION_NAME, id), payload, { merge: true });
      })
    );
  } else {
    const data = getLocalData();
    const byId = new Map(data.map((r) => [r.id, r]));
    for (const seed of SEED_REVELATIONS) {
      const id = `seed-${seed.legacyId}`;
      const existing = byId.get(id);
      byId.set(id, {
        id,
        text: seed.text,
        category: seed.category,
        type: seed.type,
        status: existing?.status ?? '尚未開始',
        firstDate: seed.firstDate,
        lastDate: seed.lastDate,
        recurCount: seed.recurCount,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
    }
    saveLocalData(Array.from(byId.values()));
  }
  return SEED_REVELATIONS.length;
};
