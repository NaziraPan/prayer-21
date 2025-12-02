import React, { useEffect, useState, useMemo } from 'react';
import { Grape, Sparkles, Leaf } from 'lucide-react';
import { USERS, START_DATE, ORDERED_USER_IDS, INDIVIDUAL_QUOTES, GROUP_VERSES } from './constants';
// ✅ 修正路徑：因為您有 services 資料夾，這裡必須加上 ./services/
import { subscribeToProgress, toggleCheckIn } from './services/firebase'; 
import { ProgressData, UserConfig } from './types';
// ✅ 修正路徑：因為您有 components 資料夾，這裡必須加上 ./components/
import { CheckInButton } from './components/CheckInButton';
import { VineProgress } from './components/VineProgress';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserConfig | null>(null);
  const [progressData, setProgressData] = useState<ProgressData>({});
  const [todayDateStr, setTodayDateStr] = useState<string>('');
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Initialize User and Date
  useEffect(() => {
    // 1. Parse URL Params for Identity
    const params = new URLSearchParams(window.location.search);
    const pParam = params.get('p')?.toLowerCase();
    
    if (pParam && USERS[pParam]) {
      setCurrentUser(USERS[pParam]);
    } else {
      setCurrentUser(USERS['user']);
    }

    // 2. Calculate Date
    const now = new Date();
    let effectiveDate = now;

    // DEMO LOGIC: If today is before START_DATE, pretend it is Day 1 (START_DATE)
    if (now < START_DATE) {
      effectiveDate = START_DATE;
      setIsDemoMode(true);
    }
    
    const diffTime = effectiveDate.getTime() - START_DATE.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Day 1 is index 0 in time diff logic, but we want 1-based index
    const calculatedDayIndex = diffDays + 1;
    setCurrentDayIndex(calculatedDayIndex);
    
    // Generate YYYY-MM-DD string for DB key
    const yyyy = effectiveDate.getFullYear();
    const mm = String(effectiveDate.getMonth() + 1).padStart(2, '0');
    const dd = String(effectiveDate.getDate()).padStart(2, '0');
    setTodayDateStr(`${yyyy}-${mm}-${dd}`);

  }, []);

  // Sync Firebase
  useEffect(() => {
    const unsubscribe = subscribeToProgress((data) => {
      setProgressData(data);
    });
    return () => unsubscribe();
  }, []);

  // Derived State
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
    
    // Prevent checking in for future dates (unless in demo mode)
    const targetDate = new Date(targetDateStr);
    const now = new Date();
    // Normalize to start of day for accurate comparison
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
      // Use date hash to pick a consistent verse for the day
      const index = todayDateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % GROUP_VERSES.length;
      return GROUP_VERSES[index];
    }
    // Random individual quote
    const index = Math.floor(Math.random() * INDIVIDUAL_QUOTES.length);
    return { text: INDIVIDUAL_QUOTES[index], ref: "" };
  };

  const encouragement = useMemo(getEncouragement, [allUsersCheckedIn, isUserCheckedIn, todayDateStr]);

  const formatDateDisplay = () => {
    // If in demo mode, show the Start Date to match the UI
    const dateToShow = isDemoMode ? START_DATE : new Date();
    const month = dateToShow.getMonth() + 1;
    const date = dateToShow.getDate();
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const dayName = days[dateToShow.getDay()];
    // Updated format: No parentheses, use "週" instead of "星期"
    return `${month}/${date} 週${dayName}`;
  };

  // Safe Guard: Prevent rendering until user is determined to avoid crash
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
      
      {/* Header */}
      <header className="pt-8 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Grape className="text-fuchsia-700 w-8 h-8 fill-fuchsia-100" />
          <h1 className="text-3xl font-sans font-bold text-gray-900 tracking-wide">
            21天禁禱結果子打卡
          </h1>
        </div>
        {/* Updated Layout: Split into two lines, sans-serif font */}
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

      {/* Main Container */}
      <main className="max-w-md mx-auto space-y-8">
        
        {/* Status Card */}
        <div className="bg-white rounded-3xl p-6 border-4 border-fuchsia-700 shadow-xl relative overflow-hidden">
          {/* Decorative bg elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10">
            {/* Header: Today's Progress */}
            <div className="flex justify-between items-baseline mb-6 border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-medium tracking-wider">今日進度</span>
              <div className="text-right">
                <span className="text-3xl font-bold text-fuchsia-700">
                  Day {currentDayIndex}
                  <span className="text-lg text-fuchsia-400 font-normal"> / 21</span>
                </span>
                {/* Updated Date Style: Larger, Bold, Dark Gray */}
                <div className="text-lg font-bold text-gray-600 mt-1">
                  {formatDateDisplay()}
                </div>
              </div>
            </div>

            {/* Names & Status List */}
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
                        // Updated Font Style & Text: Sans-serif, removed exclamation mark
                        <span className="font-sans font-medium text-lg text-gray-600 animate-pulse">
                          寶貝緊來打卡
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Area */}
            <div className="space-y-4">
              <CheckInButton 
                currentUser={currentUser}
                isChecked={isUserCheckedIn}
                isToday={true} 
                onCheckIn={handleCheckIn}
              />
              
              {/* Encouragement Box - Updated Font Style */}
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

        {/* Visualization */}
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
