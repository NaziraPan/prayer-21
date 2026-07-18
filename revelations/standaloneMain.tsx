import React from 'react';
import ReactDOM from 'react-dom/client';
import RevelationApp from './RevelationApp';
import '../styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RevelationApp />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline caching is a nice-to-have; ignore registration failures.
    });
  });
}
