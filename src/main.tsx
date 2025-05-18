// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Changed from './App.tsx'
import './index.css'; // Assuming you have a global CSS file

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error("Failed to find the root element. Ensure your HTML has <div id='root'></div>.");
}