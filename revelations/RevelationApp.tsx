import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';
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
import AddForm from './components/AddForm';

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
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToRevelations((data) => {
      setRevelations(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach((c) => (counts[c] = 0));
    revelations.forEach((r) => (counts[r.category] = (counts[r.category] || 0) + 1));
    return counts;
  }, [revelations]);

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

  const handleAdd = async (draft: RevelationDraft) => {
    await addRevelation(draft);
  };

  const handleSave = async (id: string, patch: Partial<RevelationDraft>) => {
    await updateRevelation(id, patch);
  };

  const handleSetStatus = async (id: string, status: Status) => {
    await updateRevelation(id, { status });
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
    <div className="rhema-app">
      <div className="wrap">
        {showBackLink && (
          <div className="top-links">
            <Link to="/">← 回到打卡首頁</Link>
          </div>
        )}

        <div className="masthead">
          <h1>啟示追蹤器</h1>
          <div className="verse">祢的話是我腳前的燈，是我路上的光。——詩篇 119:105</div>
        </div>

        <div className="stats">
          <div className="stat-box navy">
            <span className="num">{stats.total}</span>
            <span className="lbl">總啟示數</span>
          </div>
          <div className="stat-box">
            <span className="num">{stats.尚未開始}</span>
            <span className="lbl">尚未開始</span>
          </div>
          <div className="stat-box violet">
            <span className="num">{stats.進行中 + stats.已建立習慣}</span>
            <span className="lbl">進行中／已成習慣</span>
          </div>
          <div className="stat-box lavender">
            <span className="num">{stats.已成就}</span>
            <span className="lbl">已成就</span>
          </div>
        </div>

        {recurCallout.length > 0 && (
          <div className="recur-callout">
            <b>神反覆提醒、但尚未標記為習慣或成就：</b>
            {recurCallout
              .map((r) => `「${r.text.length > 20 ? r.text.slice(0, 20) + '…' : r.text}」`)
              .join('、')}
            。這些通常是最值得優先排入行動的項目。
          </div>
        )}

        <div className="layout">
          <div className="sidebar">
            <input
              className="search-box"
              placeholder="搜尋啟示內容…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className={`cat-btn ${categoryFilter === '全部' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('全部')}
              type="button"
            >
              <span>全部</span>
              <span className="n">{revelations.length}</span>
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`cat-btn ${categoryFilter === c ? 'active' : ''}`}
                onClick={() => setCategoryFilter(c)}
                type="button"
              >
                <span>{c}</span>
                <span className="n">{categoryCounts[c] || 0}</span>
              </button>
            ))}

            <div style={{ marginTop: 18, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
              <button
                className={`cat-btn ${statusFilter === '全部' ? 'active' : ''}`}
                onClick={() => setStatusFilter('全部')}
                type="button"
              >
                <span>全部狀態</span>
              </button>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className={`cat-btn ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                  type="button"
                >
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="main">
            {loading ? (
              <div className="empty">載入中...</div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                {revelations.length === 0 ? (
                  <>
                    還沒有記錄，用下方「+ 新增啟示」開始，或
                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={importing}
                      className="icon-btn"
                      style={{ display: 'inline', marginLeft: 4 }}
                    >
                      {importing ? '匯入中...' : '匯入舊有 81 則啟示'}
                    </button>
                  </>
                ) : (
                  '這個分類目前沒有紀錄。'
                )}
              </div>
            ) : (
              filtered.map((rev) => (
                <RevelationCard
                  key={rev.id}
                  revelation={rev}
                  onSave={(patch) => handleSave(rev.id, patch)}
                  onSetStatus={(status) => handleSetStatus(rev.id, status)}
                  onDelete={() => handleDelete(rev)}
                  onBumpRecurrence={() => bumpRecurrence(rev)}
                />
              ))
            )}

            <AddForm onAdd={handleAdd} />

            {revelations.length > 0 && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing}
                  className="icon-btn"
                  style={{ margin: '0 auto' }}
                >
                  <UploadCloud size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {importing ? '匯入中...' : '重新匯入舊有啟示（不會產生重複）'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevelationApp;
