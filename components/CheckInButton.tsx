
import React from 'react';
import { UserConfig } from '../types';

interface CheckInButtonProps {
  currentUser: UserConfig;
  isChecked: boolean;
  isToday: boolean;
  onCheckIn: () => void;
  disabled?: boolean;
}

export const CheckInButton: React.FC<CheckInButtonProps> = ({ 
  currentUser, 
  isChecked, 
  isToday, 
  onCheckIn,
  disabled 
}) => {
  const baseClasses = "w-full py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 font-bold text-lg";
  
  if (isChecked) {
    return (
      <div className={`${baseClasses} bg-indigo-900 text-white border-2 border-indigo-700 cursor-default shadow-indigo-200/50`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-fuchsia-300"><path d="M20 6 9 17l-5-5"/></svg>
        <span className="tracking-wide">{currentUser.name} 已完成打卡</span>
      </div>
    );
  }

  if (!isToday || disabled) {
    return (
      <button 
        disabled 
        className={`${baseClasses} bg-gray-200 text-gray-400 cursor-not-allowed`}
      >
        尚未開放打卡
      </button>
    );
  }

  return (
    <button 
      onClick={onCheckIn}
      className={`${baseClasses} bg-indigo-800 hover:bg-indigo-900 text-white shadow-indigo-200 hover:shadow-xl`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
      點擊打卡 ({currentUser.name})
    </button>
  );
};
