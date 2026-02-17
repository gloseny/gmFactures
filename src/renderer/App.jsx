import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.jsx';

// Pages (à créer)
import Dashboard from './pages/Dashboard.jsx';
import InvoiceList from './pages/Invoices/InvoiceList.jsx';
import InvoiceForm from './pages/Invoices/InvoiceForm.jsx';
import InvoiceDetail from './pages/Invoices/InvoiceDetail.jsx';
import ClientList from './pages/Clients/ClientList.jsx';
import ClientForm from './pages/Clients/ClientForm.jsx';
import ReportPage from './pages/Reports/ReportPage.jsx';

import Settings from './pages/Settings.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        
        {/* Routes Factures */}
        <Route path="invoices" element={<InvoiceList />} />
        <Route path="invoices/new" element={<InvoiceForm />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="invoices/:id/edit" element={<InvoiceForm />} />
        
        {/* Routes Clients */}
        <Route path="clients" element={<ClientList />} />
        <Route path="clients/new" element={<ClientForm />} />
        <Route path="clients/:id/edit" element={<ClientForm />} />
        
        {/* Routes Rapports */}
        <Route path="reports" element={<ReportPage />} />
        
        {/* Routes Paramètres */}
        <Route path="settings" element={<Settings />} />
        
        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
