import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Category, Revelation, RevelationDraft, RevelationType, Status } from '../types';
import { CATEGORIES, STATUSES, TYPES } from '../constants';
import OilLamp from './OilLamp';

interface RevelationFormModalProps {
  initial?: Revelation | null;
  onClose: () => void;
  onSubmit: (draft: RevelationDraft) => Promise<void>;
}

const RevelationFormModal: React.FC<RevelationFormModalProps> = ({ initial, onClose, onSubmit }) => {
  const [text, setText] = useState(initial?.text ?? '');
  const [category, setCategory] = useState<Category>(initial?.category ?? CATEGORIES[0]);
  const [status, setStatus] = useState<Status>(initial?.status ?? STATUSES[0]);
  const [type, setType] = useState<RevelationType>(initial?.type ?? TYPES[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onSubmit({ text: trimmed, category, status, type });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#232A63]/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-violet-100">
          <h2 className="text-xl font-bold text-[#232A63]">{initial ? '編輯啟示' : '新增啟示'}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-violet-400 hover:bg-violet-50 hover:text-violet-700"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#232A63] mb-2">啟示內容</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              required
              placeholder="記下神對你說的話..."
              className="w-full rounded-xl border border-violet-200 px-4 py-3 text-[#232A63] placeholder:text-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#232A63] mb-2">分類</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    category === c
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-white border-violet-200 text-violet-600 hover:bg-violet-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#232A63] mb-2">類型</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    type === t
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-white border-violet-200 text-violet-600 hover:bg-violet-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#232A63] mb-2">狀態</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    status === s
                      ? 'bg-[#232A63] border-[#232A63] text-white'
                      : 'bg-white border-violet-200 text-violet-600 hover:bg-violet-50'
                  }`}
                >
                  <OilLamp status={s} size={18} />
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-violet-500 font-medium hover:bg-violet-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving || !text.trim()}
              className="px-5 py-2 rounded-xl bg-violet-600 text-white font-bold shadow-md shadow-violet-200 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RevelationFormModal;
