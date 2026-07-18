import React, { useState } from 'react';
import { Category, RevelationDraft, RevelationType } from '../types';
import { CATEGORIES, TYPES } from '../constants';

interface AddFormProps {
  onAdd: (draft: RevelationDraft) => Promise<void>;
}

const AddForm: React.FC<AddFormProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [type, setType] = useState<RevelationType>(TYPES[0]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onAdd({ text: trimmed, category, type, status: '尚未開始' });
      setText('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h3>+ 新增啟示</h3>
      <textarea
        rows={2}
        placeholder="輸入 rhema 內容..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
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
      <button className="add-btn" type="submit" disabled={saving || !text.trim()}>
        {saving ? '加入中...' : '加入追蹤'}
      </button>
      <div className="save-note">所有資料儲存在真正的資料庫中，跨裝置、重開機都不會遺失。</div>
    </form>
  );
};

export default AddForm;
