import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Auto-attach JWT to all /api fetch calls
const _fetch = window.fetch.bind(window);
window.fetch = function(url, options = {}) {
  if (typeof url === 'string' && url.startsWith('/api')) {
    const token = localStorage.getItem('token');
    if (token) {
      options = {
        ...options,
        headers: { Authorization: `Bearer ${token}`, ...options.headers },
      };
    }
  }
  return _fetch(url, options);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
