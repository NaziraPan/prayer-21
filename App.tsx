import React, { useEffect, useState, useMemo } from 'react';
import { Grape, Sparkles, Leaf } from 'lucide-react';
import { USERS, START_DATE, ORDERED_USER_IDS, INDIVIDUAL_QUOTES, GROUP_VERSES } from './constants';
// ✅ 修改重點：移除 services/，直接找同一層的 firebase
import { subscribeToProgress, toggleCheckIn } from './firebase'; 
import { ProgressData, UserConfig } from './types';
// ✅ 修改重點：移除 components/，直接找同一層的檔案
import { CheckInButton } from './CheckInButton';
import { VineProgress } from './VineProgress';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserConfig | null>(null);
  const [progressData, setProgressData] = useState<ProgressData>({});
  const [todayDateStr, setTodayDateStr] = useState<string>('');
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Initialize User and Date
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pParam = params.get('p')?.toLowerCase();
    
    if (pParam && USERS[pParam]) {
      setCurrentUser(USERS[pParam]);
    } else {
      setCurrentUser(USERS['user']);
    }

    const now = new Date();
    let effectiveDate = now;

    if (now < START_DATE) {
      effectiveDate = START_DATE;
      setIsDemoMode(true);
    }
    
    const diffTime = effectiveDate.getTime() - START_DATE.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const calculatedDayIndex = diffDays + 1;
    setCurrentDayIndex(calculatedDayIndex);
    
    const yyyy = effectiveDate.getFullYear();
    const mm = String(effectiveDate.getMonth() + 1).padStart(2, '0');
    const dd = String(effectiveDate.getDate()).padStart(2, '0');
    setTodayDateStr(`${yyyy}-${mm}-${dd}`);

  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToProgress((data) => {
      setProgressData(data);
    });
    return () => unsubscribe();
  }, []);

  const todayRecord = progressData[todayDateStr];
  const isUserCheckedIn = currentUser ? !!todayRecord?.[currentUser.id] : false;
  
  const allUsersCheckedIn = useMemo(() => {
    if (!todayRecord) return false;
    return ORDERED_USER_IDS.every(uid => todayRecord[uid]);
  }, [todayRecord]);

  const handleCheckIn = () => {
    if (!currentUser || !todayDateStr) return;
    toggleCheckIn(todayDateStr, currentUser.id, isUserCheckedIn);
  };

  const handleManualCheckIn = (targetDateStr: string) => {
    if (!currentUser) return;
    
    const targetDate = new Date(targetDateStr);
    const now = new Date();
    const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (targetMidnight > todayMidnight && !isDemoMode) {
      alert("還沒到的日子不能先打卡喔！");
      return;
    }

    const record = progressData[targetDateStr];
    const currentStatus = record ? record[currentUser.id] : false;
    toggleCheckIn(targetDateStr, currentUser.id, currentStatus);
  };

  const getEncouragement = () => {
    if (allUsersCheckedIn) {
      const index = todayDateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % GROUP_VERSES.length;
      return GROUP_VERSES[index];
    }
    const index = Math.floor(Math.random() * INDIVIDUAL_QUOTES.length);
    return { text: INDIVIDUAL_QUOTES[index], ref: "" };
  };

  const encouragement = useMemo(getEncouragement, [allUsersCheckedIn, isUserCheckedIn, todayDateStr]);

  const formatDateDisplay = () => {
    const dateToShow = isDemoMode ? START_DATE : new Date();
    const month = dateToShow.getMonth() + 1;
    const date = dateToShow.getDate();
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const dayName = days[dateToShow.getDay()];
    return `${month}/${date} 週${dayName}`;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF4FF]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Grape className="w-10 h-10 text-fuchsia-700" />
          <span className="text-fuchsia-800 font-sans font-medium text-xl">載入中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 px-4 md:px-0 bg-[#FDF4FF]">
      <header className="pt-8 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Grape className="text-fuchsia-700 w-8 h-8 fill-fuchsia-100" />
          <h1 className="text-3xl font-sans font-bold text-gray-900 tracking-wide">
            21天禁禱結果子打卡
          </h1>
        </div>
        <h2 className="text-lg font-sans font-medium text-fuchsia-900/90 mb-4 tracking-wide flex flex-col items-center gap-1">
          <span>12/1起，三人同心，展開</span>
          <span>與神更親密同行的神蹟之旅！</span>
        </h2>
        <div className="inline-block bg-white px-4 py-1 rounded-full shadow-sm text-sm text-gray-500 border border-gray-100">
          您目前的身份是: <span className="font-bold text-indigo-700">{currentUser.name}</span>
        </div>
        {isDemoMode && (
           <div className="mt-2 text-xs text-amber-600 font-medium bg-amber-50 inline-block px-3 py-1 rounded-lg">
             ⚠️ 預演模式：目前日期早於開始日，系統模擬為 Day 1
           </div>
        )}
      </header>

      <main className="max-w-md mx-auto space-y-8">
        <div className="bg-white rounded-3xl p-6 border-4 border-fuchsia-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-baseline mb-6 border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-medium tracking-wider">今日進度</span>
              <div className="text-right">
                <span className="text-3xl font-bold text-fuchsia-700">
                  Day {currentDayIndex}
                  <span className="text-lg text-fuchsia-400 font-normal"> / 21</span>
                </span>
                <div className="text-lg font-bold text-gray-600 mt-1">
                  {formatDateDisplay()}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {ORDERED_USER_IDS.map((uid) => {
                const user = USERS[uid];
                const isDone = todayRecord?.[uid];
                
                return (
                  <div key={uid} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className={`w-5 h-5 ${user.color}`} />
                      <span className="text-xl font-extrabold text-indigo-800 tracking-tight">
                        {user.name}
                      </span>
                    </div>
                    <div className="text-right">
                      {isDone ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold animate-pop">
                          <Leaf className="w-4 h-4 fill-emerald-600" />
                          完成
                        </span>
                      ) : (
                        <span className="font-sans font-medium text-lg text-gray-600 animate-pulse">
                          寶貝緊來打卡
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <CheckInButton 
                currentUser={currentUser}
                isChecked={isUserCheckedIn}
                isToday={true} 
                onCheckIn={handleCheckIn}
              />
              <div className="bg-indigo-50/50 rounded-xl p-4 text-center border border-indigo-100 mt-6 transition-all duration-500">
                <p className="font-sans font-medium text-lg text-indigo-900 leading-relaxed">
                  "{encouragement.text}"
                </p>
                {encouragement.ref && (
                  <p className="text-xs font-bold text-indigo-400 mt-2 uppercase tracking-widest">
                    — {encouragement.ref}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <VineProgress 
          progressData={progressData} 
          currentUser={currentUser}
          onCheckIn={handleManualCheckIn}
        />

      </main>
    </div>
  );
};

export default App;
