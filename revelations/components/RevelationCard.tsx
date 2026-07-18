import React, { useState } from 'react';
import { Category, Revelation, RevelationDraft, RevelationType, Status } from '../types';
import { CATEGORIES, STATUSES, STATUS_KEY, TYPES } from '../constants';
import OilLamp from './OilLamp';

interface RevelationCardProps {
  revelation: Revelation;
  onSave: (patch: Partial<RevelationDraft>) => Promise<void>;
  onSetStatus: (status: Status) => void;
  onDelete: () => void;
  onBumpRecurrence: () => void;
}

const RevelationCard: React.FC<RevelationCardProps> = ({
  revelation,
  onSave,
  onSetStatus,
  onDelete,
  onBumpRecurrence,
}) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(revelation.text);
  const [category, setCategory] = useState<Category>(revelation.category);
  const [type, setType] = useState<RevelationType>(revelation.type);

  const startEdit = () => {
    setText(revelation.text);
    setCategory(revelation.category);
    setType(revelation.type);
    setEditing(true);
  };

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await onSave({ text: trimmed, category, type });
    setEditing(false);
  };

  return (
    <div className="entry">
      <div>
        <OilLamp status={revelation.status} />
      </div>
      {editing ? (
        <div className="edit-box">
          <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="row">
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value as RevelationType)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="edit-actions">
            <button className="save-btn" type="button" onClick={handleSave}>
              儲存
            </button>
            <button className="cancel-btn" type="button" onClick={() => setEditing(false)}>
              取消
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="entry-text">{revelation.text}</p>
          <div className="entry-meta">
            <span className="tag">{revelation.category}</span>
            <span className="tag">{revelation.type}</span>
            首次：{revelation.firstDate}
            {revelation.recurCount > 1 && (
              <>
                　· 重複 <span className="recur-num">{revelation.recurCount}</span> 次
              </>
            )}
          </div>
          <div className="status-row">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={`status-btn ${s === revelation.status ? 'active' : ''}`}
                data-s={STATUS_KEY[s]}
                onClick={() => onSetStatus(s)}
              >
                {s}
              </button>
            ))}
            <button className="icon-btn" type="button" onClick={onBumpRecurrence}>
              🔥 又來一次
            </button>
            <button className="icon-btn" type="button" onClick={startEdit}>
              ✏️ 編輯
            </button>
            <button className="icon-btn danger" type="button" onClick={onDelete}>
              🗑 刪除
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevelationCard;
