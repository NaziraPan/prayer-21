import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import PrayerApp from './PrayerApp';
import RevelationApp from './revelations/RevelationApp';

const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PrayerApp />} />
        <Route path="/revelations" element={<RevelationApp />} />
      </Routes>
    </HashRouter>
  );
};

export default AppRouter;
