import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ERPProvider } from '@/context/ERPContext';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import POS from '@/pages/POS';
import Operations from '@/pages/Operations';

export default function App() {
  return (
    <ERPProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="pdv" element={<POS />} />
            <Route path="operacoes" element={<Operations />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ERPProvider>
  );
}
