import React, { useEffect, useState } from 'react';
import { START_DATE, CHALLENGE_DAYS, USERS, ORDERED_USER_IDS } from '../constants';
import { ProgressData, UserConfig } from '../types';
import { Grape, Leaf, Calendar as CalendarIcon, LayoutList } from 'lucide-react';

interface VineProgressProps {
  progressData: ProgressData;
  currentUser: UserConfig;
  onCheckIn: (dateStr: string) => void;
}

export const VineProgress: React.FC<VineProgressProps> = ({ progressData, currentUser, onCheckIn }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const days = Array.from({ length: CHALLENGE_DAYS }, (_, i) => i + 1);

  const now = new Date();
  const diffTime = now.getTime() - START_DATE.getTime();
  const rawDayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const maxUnlockedDay = now < START_DATE ? 1 : rawDayIndex;

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const getDayStatus = (dayIndex: number) => {
    const targetDate = new Date(START_DATE);
    targetDate.setDate(START_DATE.getDate() + (dayIndex - 1));
    const dateStr = targetDate.toISOString().split('T')[0];
    const record = progressData[dateStr];

    const isComplete = record && record.xiaolu && record.jingfang && record.jingyi;
    
    const individuals = ORDERED_USER_IDS.map(uid => ({
      uid,
      done: record ? record[uid] : false
    }));

    const isCurrentUserDone = record ? record[currentUser.id] : false;

    return {
      dateStr,
      displayDate: `${targetDate.getMonth() + 1}/${targetDate.getDate()}`,
      isComplete,
      individuals,
      isCurrentUserDone
    };
  };

  const shouldPlayIntro = !hasAnimated && viewMode === 'list';

  return (
    <div className="w-full max-w-lg mx-auto mt-8 p-4">
      <style>{`
        @keyframes grow-height {
          from { height: 0; opacity: 0; }
          to { height: 100%; opacity: 1; }
        }
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-vine {
          animation: grow-height 2s ease-out forwards;
        }
        .animate-pop {
          animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>

      <div className="flex flex-col items-center mb-6">
        <h3 className="text-center flex flex-col items-center">
          <span className="text-2xl font-sans font-bold text-indigo-900 tracking-wide">枝子連於葡萄樹</span>
          {/* Updated subtitle color to deeper indigo */}
          <span className="text-2xl font-sans font-extrabold text-indigo-900 block mt-2">21天與主親密連結之旅</span>
        </h3>

        <div className="mt-6 bg-white p-1 rounded-full border border-indigo-100 shadow-sm flex items-center">
           <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-400 hover:text-indigo-600'}`}
           >
              <LayoutList size={16} /> 列表
           </button>
           <button
              onClick={() => setViewMode('calendar')}
               className={`px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-400 hover:text-indigo-600'}`}
           >
              <CalendarIcon size={16} /> 月曆
           </button>
        </div>
        
        <p className="mt-3 text-xs font-bold text-fuchsia-600 bg-fuchsia-50 px-3 py-1 rounded-full animate-pulse">
           💡 點擊 {viewMode === 'list' ? '藤蔓上的圓點' : '日曆格子'} 即可補打卡
        </p>
      </div>

      {viewMode === 'list' ? (
        <div className="relative min-h-[800px]">
          {/* Main Stem: Darker, more organic color */}
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 w-1.5 bg-gradient-to-b from-indigo-300 via-fuchsia-300 to-indigo-300 rounded-full ${shouldPlayIntro ? 'animate-vine' : 'h-full'}`} 
          />

          {days.map((day, index) => {
             const status = getDayStatus(day);
             const isPastOrToday = day <= maxUnlockedDay;
             const side = index % 2 === 0 ? 'left' : 'right';
             const delayStyle = shouldPlayIntro ? { animationDelay: `${index * 0.08}s` } : {};
             const popClass = shouldPlayIntro ? 'animate-pop' : '';

             return (
               <div key={day} className={`relative h-24 flex items-center justify-center ${popClass}`} style={delayStyle}>
                  
                  {/* Day Label */}
                  <div className={`absolute ${side === 'left' ? 'right-1/2 pr-8 text-right' : 'left-1/2 pl-8 text-left'} top-1/2 transform -translate-y-1/2`}>
                    <span className="text-xl font-extrabold text-indigo-900 block">Day {day}</span>
                    <span className="text-lg font-bold text-fuchsia-700 block mt-0.5">{status.displayDate}</span>
                  </div>

                  {/* Interactive Node */}
                  <div 
                    onClick={() => isPastOrToday && onCheckIn(status.dateStr)}
                    className={`relative z-10 w-8 h-8 rounded-full border-4 shadow-md flex items-center justify-center transition-all duration-300 
                      ${status.isCurrentUserDone ? 'bg-indigo-600 border-indigo-200 scale-110' : 'bg-fuchsia-50 border-fuchsia-200'}
                      ${isPastOrToday ? 'cursor-pointer hover:scale-125 hover:border-fuchsia-400' : 'opacity-50 cursor-not-allowed'}
                    `}
                    title={isPastOrToday ? "點擊補打卡" : "尚未開放"}
                  >
                    {status.isCurrentUserDone ? (
                      <div className="w-3 h-3 bg-fuchsia-200 rounded-full animate-pop"></div>
                    ) : (
                      <div className="w-2 h-2 bg-fuchsia-200 rounded-full"></div>
                    )}
                  </div>

                  {/* Leaves: Unified color to match Berry/Indigo theme */}
                  <div className={`absolute ${side === 'left' ? 'left-1/2 pl-8' : 'right-1/2 pr-8'} flex gap-1 transform ${side === 'left' ? '' : 'flex-row-reverse'}`}>
                    {status.individuals.map((ind, i) => (
                      <div key={ind.uid} className={`transition-all duration-500 ${ind.done ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                         {/* Using a rich Teal/Slate color for all leaves to avoid color clash */}
                         <Leaf 
                           className="w-6 h-6 text-teal-700 fill-teal-700/40 drop-shadow-sm" 
                         />
                      </div>
                    ))}
                  </div>

                  {/* Grapes */}
                  {status.isComplete && (
                     <div className={`absolute ${side === 'left' ? 'left-1/2 pl-2 pt-8' : 'right-1/2 pr-2 pt-8'} animate-pop z-20`}>
                        <Grape className="w-10 h-10 text-fuchsia-700 fill-fuchsia-700 drop-shadow-lg" />
                     </div>
                  )}
               </div>
             );
          })}
        </div>
      ) : (
        /* CALENDAR VIEW */
        <div className="grid grid-cols-7 gap-2 bg-white p-4 rounded-xl shadow-inner border border-indigo-50">
           {['一', '二', '三', '四', '五', '六', '日'].map(d => (
             <div key={d} className="text-center text-xs font-bold text-indigo-300 mb-2">{d}</div>
           ))}
           
           {days.map((day) => {
             const status = getDayStatus(day);
             const isUnlocked = day <= maxUnlockedDay;
             
             return (
               <div 
                 key={day} 
                 onClick={() => isUnlocked && onCheckIn(status.dateStr)}
                 className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative transition-all duration-200
                   ${status.isCurrentUserDone ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}
                   ${isUnlocked ? 'cursor-pointer hover:border-fuchsia-400 hover:shadow-md' : 'opacity-40 cursor-not-allowed'}
                 `}
               >
                  <span className={`text-xs font-bold ${status.isCurrentUserDone ? 'text-indigo-700' : 'text-gray-300'}`}>{day}</span>
                  
                  {status.isComplete ? (
                    <Grape size={16} className="text-fuchsia-600 fill-fuchsia-600 mt-1 animate-pop" />
                  ) : (
                    <div className="flex gap-0.5 mt-1">
                      {status.individuals.map(ind => (
                        <div 
                          key={ind.uid} 
                          className={`w-1.5 h-1.5 rounded-full transition-all ${ind.done ? 'bg-teal-600' : 'bg-gray-100'}`}
                        />
                      ))}
                    </div>
                  )}
               </div>
             )
           })}
        </div>
      )}
    </div>
  );
};