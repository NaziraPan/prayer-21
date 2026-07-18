import React from 'react';
import { Status } from '../types';
import { STATUS_LAMP_STAGE } from '../constants';

interface OilLampProps {
  status: Status;
  size?: number;
  className?: string;
}

const STAGE_FLAME_OPACITY: Record<1 | 2 | 3 | 4, number> = {
  1: 0,
  2: 0.55,
  3: 1,
  4: 1,
};

const STAGE_FLAME_SCALE: Record<1 | 2 | 3 | 4, number> = {
  1: 0.35,
  2: 0.7,
  3: 1,
  4: 1.08,
};

// 油燈圖示：未點燈 / 半亮 / 全亮 / 穩定發光（呼吸光暈）
const OilLamp: React.FC<OilLampProps> = ({ status, size = 28, className = '' }) => {
  const stage = STATUS_LAMP_STAGE[status];
  const flameOpacity = STAGE_FLAME_OPACITY[stage];
  const flameScale = STAGE_FLAME_SCALE[stage];
  const isGlowing = stage === 4;

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`油燈狀態：${status}`}
      title={status}
    >
      {isGlowing && (
        <span
          aria-hidden="true"
          className="absolute inset-[-35%] rounded-full animate-lamp-glow pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(247,183,51,0.65) 0%, rgba(247,183,51,0) 72%)',
          }}
        />
      )}
      <svg viewBox="0 0 48 48" width={size} height={size} className="relative z-10">
        <g
          style={{
            opacity: flameOpacity,
            transform: `scale(${flameScale})`,
            transformOrigin: '24px 20px',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          <path
            d="M24 6 C18 13, 16 19, 20 24 C21.5 26.5, 26.5 26.5, 28 24 C32 19, 30 13, 24 6 Z"
            fill={stage >= 3 ? '#F7B733' : '#E8B15A'}
          />
          <path
            d="M24 13 C21 17, 20 20.5, 22.5 23 C23.3 24, 24.7 24, 25.5 23 C28 20.5, 27 17, 24 13 Z"
            fill="#FFE9A8"
          />
        </g>

        {stage === 1 && <circle cx="24" cy="22" r="2" fill="#94A3B8" />}

        <rect x="20" y="25" width="8" height="6" rx="1.5" fill="#5B21B6" />

        <path
          d="M10 30 C10 27, 15 26, 24 26 C33 26, 38 27, 38 30 C38 38, 32 43, 24 43 C16 43, 10 38, 10 30 Z"
          fill="#232A63"
        />
        <ellipse cx="24" cy="30" rx="12.5" ry="3.2" fill="#2C3E7A" opacity="0.6" />

        <path d="M38 31 C44 31, 47 34, 46 38 C45 41, 40 41.5, 38 39 Z" fill="#7C3AED" />

        <ellipse cx="24" cy="44.5" rx="9" ry="2" fill="#5B21B6" opacity="0.5" />
      </svg>
    </span>
  );
};

export default OilLamp;
