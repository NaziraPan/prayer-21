import React from 'react';
import { Status } from '../types';

interface OilLampProps {
  status: Status;
  className?: string;
}

const FILL_MAP: Record<Status, string> = {
  尚未開始: 'none',
  進行中: 'var(--lavender)',
  已建立習慣: 'var(--violet)',
  已成就: 'var(--navy)',
};

const STROKE_MAP: Record<Status, string> = {
  尚未開始: 'var(--muted)',
  進行中: 'var(--violet)',
  已建立習慣: 'var(--violet)',
  已成就: 'var(--navy)',
};

const OilLamp: React.FC<OilLampProps> = ({ status, className = '' }) => {
  const fill = FILL_MAP[status];
  const stroke = STROKE_MAP[status];
  return (
    <svg
      className={`lamp ${className}`}
      viewBox="0 0 26 34"
      role="img"
      aria-label={`油燈狀態：${status}`}
    >
      <path
        d="M13 3 C 18 8, 19 14, 13 19 C 7 14, 8 8, 13 3 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.6"
      />
      <line x1="13" y1="19" x2="13" y2="26" stroke={stroke} strokeWidth="1.6" />
      <line x1="6" y1="30" x2="20" y2="30" stroke={stroke} strokeWidth="1.6" />
      <line x1="8" y1="26" x2="18" y2="26" stroke={stroke} strokeWidth="1.6" />
    </svg>
  );
};

export default OilLamp;
