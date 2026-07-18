import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Revelation } from '../types';
import { CATEGORY_BADGE_CLASS, STATUS_BADGE_CLASS } from '../constants';
import OilLamp from './OilLamp';

interface RevelationCardProps {
  revelation: Revelation;
  onEdit: () => void;
  onDelete: () => void;
}

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};

const RevelationCard: React.FC<RevelationCardProps> = ({ revelation, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl border border-violet-100 shadow-sm hover:shadow-md transition-shadow p-5 flex gap-4">
      <OilLamp status={revelation.status} size={36} className="mt-1" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${CATEGORY_BADGE_CLASS[revelation.category]}`}
          >
            {revelation.category}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_BADGE_CLASS[revelation.status]}`}
          >
            {revelation.status}
          </span>
        </div>
        <p className="text-[#16244F] whitespace-pre-wrap leading-relaxed break-words">
          {revelation.text}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-violet-400">
            {revelation.updatedAt !== revelation.createdAt
              ? `更新於 ${formatDate(revelation.updatedAt)}`
              : `記錄於 ${formatDate(revelation.createdAt)}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg text-violet-500 hover:bg-violet-50 hover:text-violet-700 transition-colors"
              title="編輯"
              aria-label="編輯"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              title="刪除"
              aria-label="刪除"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevelationCard;
