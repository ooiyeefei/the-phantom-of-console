/**
 * Main Entry Point - The Phantom of the Console
 * 
 * Web 2.0 compliant React application
 * This is where the haunting begins...
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/retro.css';

// Mount the haunted console - enterprise-grade initialization
var rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
