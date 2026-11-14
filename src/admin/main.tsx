import React from 'react';
import { createRoot } from 'react-dom/client';
import { AdminProvider } from './context/AdminContext';
import { AdminApp } from './App';
import '../index.css';

const container = document.getElementById('admin-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AdminProvider>
        <AdminApp />
      </AdminProvider>
    </React.StrictMode>
  );
}
