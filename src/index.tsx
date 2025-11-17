import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Force light theme
document.documentElement.setAttribute('data-theme', 'light');
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.remove('dark');
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
