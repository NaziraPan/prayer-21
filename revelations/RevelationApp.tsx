import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Flame, UploadCloud } from 'lucide-react';
import { Category, Revelation, RevelationDraft, Status } from './types';
import { CATEGORIES, STATUSES, RECUR_CALLOUT_THRESHOLD } from './constants';
import {
  subscribeToRevelations,
  addRevelation,
  updateRevelation,
  deleteRevelation,
  bumpRecurrence,
  importSeedData,
} from './firebaseService';
import RevelationCard from './components/RevelationCard';
import RevelationFormModal from './components/RevelationFormModal';

interface RevelationAppProps {
  // When embedded inside the prayer check-in site's router, show a link
  // back to that site. The standalone deployment has no such link — it's
  // a separate, independent app with no visible tie to the other site.
  showBackLink?: boolean;
}

const RevelationApp: React.FC<RevelationAppProps> = ({ showBackLink = false }) => {
  const [revelations, setRevelations] = useState<Revelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | '全部'>('全部');
  const [statusFilter, setStatusFilter] = useState<Status | '全部'>('全部');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRevelation, setEditingRevelation] = useState<Revelation | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToRevelations((data) => {
      setRevelations(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return revelations.filter((r) => {
      if (categoryFilter !== '全部' && r.category !== categoryFilter) return false;
      if (statusFilter !== '全部' && r.status !== statusFilter) return false;
      if (keyword && !r.text.toLowerCase().includes(keyword)) return false;
      return true;
    });
  }, [revelations, categoryFilter, statusFilter, search]);

  const stats = useMemo(() => {
    const counts = { 尚未開始: 0, 進行中: 0, 已建立習慣: 0, 已成就: 0 };
    revelations.forEach((r) => counts[r.status]++);
    return { total: revelations.length, ...counts };
  }, [revelations]);

  const recurCallout = useMemo(() => {
    return revelations
      .filter(
        (r) =>
          r.recurCount >= RECUR_CALLOUT_THRESHOLD && r.status !== '已建立習慣' && r.status !== '已成就'
      )
      .sort((a, b) => b.recurCount - a.recurCount)
      .slice(0, 4);
  }, [revelations]);

  const openCreateModal = () => {
    setEditingRevelation(null);
    setModalOpen(true);
  };

  const openEditModal = (rev: Revelation) => {
    setEditingRevelation(rev);
    setModalOpen(true);
  };

  const handleSubmit = async (draft: RevelationDraft) => {
    if (editingRevelation) {
      await updateRevelation(editingRevelation.id, draft);
    } else {
      await addRevelation(draft);
    }
  };

  const handleDelete = async (rev: Revelation) => {
    if (window.confirm('確定要刪除這則啟示嗎？此動作無法復原。')) {
      await deleteRevelation(rev.id);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const count = await importSeedData();
      window.alert(`已匯入 ${count} 則舊有啟示！`);
    } catch (e) {
      window.alert('匯入失敗，請稍後再試一次。');
      console.error(e);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDE9F7] pb-24">
      <header className="pt-8 pb-6 px-4 text-center">
        {showBackLink && (
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-violet-500 hover:text-violet-700 mb-3"
          >
            <ArrowLeft size={14} /> 回到打卡首頁
          </Link>
        )}
        <div className="flex items-center justify-center gap-2 mb-1">
          <Flame className="text-violet-600 w-7 h-7" />
          <h1 className="font-serif-tc text-3xl font-bold text-[#232A63] tracking-wide">
            啟示追蹤器
          </h1>
        </div>
        <p className="font-serif-tc italic text-violet-600/80 text-sm mb-1">
          祢的話是我腳前的燈，是我路上的光。——詩篇 119:105
        </p>
        <p className="text-violet-500/70 text-xs">記下每一則神的話語，點亮成長的軌跡</p>
      </header>

      <main className="max-w-2xl mx-auto px-4 space-y-5">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white rounded-xl border-t-4 border-[#232A63] px-2 py-3 text-center shadow-sm">
            <span className="font-serif-tc block text-2xl font-bold text-[#232A63]">
              {stats.total}
            </span>
            <span className="text-[11px] text-violet-500/80">總啟示數</span>
          </div>
          <div className="bg-white rounded-xl border-t-4 border-slate-300 px-2 py-3 text-center shadow-sm">
            <span className="font-serif-tc block text-2xl font-bold text-slate-500">
              {stats.尚未開始}
            </span>
            <span className="text-[11px] text-violet-500/80">尚未開始</span>
          </div>
          <div className="bg-white rounded-xl border-t-4 border-violet-500 px-2 py-3 text-center shadow-sm">
            <span className="font-serif-tc block text-2xl font-bold text-violet-600">
              {stats.進行中 + stats.已建立習慣}
            </span>
            <span className="text-[11px] text-violet-500/80">進行中／習慣</span>
          </div>
          <div className="bg-white rounded-xl border-t-4 border-amber-400 px-2 py-3 text-center shadow-sm">
            <span className="font-serif-tc block text-2xl font-bold text-amber-600">
              {stats.已成就}
            </span>
            <span className="text-[11px] text-violet-500/80">已成就</span>
          </div>
        </div>

        {recurCallout.length > 0 && (
          <div className="bg-violet-50 border-l-4 border-violet-500 rounded-r-xl px-4 py-3 text-sm leading-relaxed text-[#232A63]">
            <b>神反覆提醒、但尚未標記為習慣或成就：</b>
            {recurCallout
              .map((r) => `「${r.text.length > 20 ? r.text.slice(0, 20) + '…' : r.text}」`)
              .join('、')}
            。這些通常是最值得優先排入行動的項目。
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-300" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋啟示內容..."
            className="w-full bg-white rounded-2xl border border-violet-100 pl-11 pr-4 py-3 text-[#232A63] placeholder:text-violet-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {(['全部', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c as Category | '全部')}
              className={`shrink-0 text-sm px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
                categoryFilter === c
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'bg-white border-violet-200 text-violet-600 hover:bg-violet-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {(['全部', ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as Status | '全部')}
              className={`shrink-0 text-sm px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[#232A63] border-[#232A63] text-white'
                  : 'bg-white border-violet-200 text-violet-600 hover:bg-violet-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-violet-400">載入中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-violet-400 space-y-4">
            <p>
              {revelations.length === 0
                ? '還沒有記錄，點右下角新增第一則啟示，或匯入你的舊資料吧！'
                : '找不到符合條件的啟示'}
            </p>
            {revelations.length === 0 && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 bg-white border border-violet-200 hover:bg-violet-50 px-4 py-2 rounded-full shadow-sm disabled:opacity-50 transition-colors"
              >
                <UploadCloud size={16} />
                {importing ? '匯入中...' : '匯入舊有 81 則啟示'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((rev) => (
              <RevelationCard
                key={rev.id}
                revelation={rev}
                onEdit={() => openEditModal(rev)}
                onDelete={() => handleDelete(rev)}
                onBumpRecurrence={() => bumpRecurrence(rev)}
              />
            ))}
          </div>
        )}

        {revelations.length > 0 && (
          <div className="text-center pt-4">
            <button
              onClick={handleImport}
              disabled={importing}
              className="text-xs text-violet-400 hover:text-violet-600 underline disabled:opacity-50"
            >
              {importing ? '匯入中...' : '重新匯入舊有啟示（不會產生重複）'}
            </button>
          </div>
        )}
      </main>

      <button
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-violet-600 text-white shadow-lg shadow-violet-300 flex items-center justify-center hover:bg-violet-700 active:scale-95 transition-all"
        aria-label="新增啟示"
      >
        <Plus size={26} />
      </button>

      {modalOpen && (
        <RevelationFormModal
          initial={editingRevelation}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default RevelationApp;
