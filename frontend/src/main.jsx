import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App.jsx';

// Configure live API base URL when hosted (e.g. Render / Railway / Vercel)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
if (API_BASE_URL) {
  // Strip trailing slash if entered
  axios.defaults.baseURL = API_BASE_URL.replace(/\/+$/, '');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
