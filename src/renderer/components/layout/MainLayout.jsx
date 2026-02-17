import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';

export default function MainLayout() {
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);

  const handleNewInvoice = () => {
    setShowNewInvoiceModal(true);
  };

  return (
    <div className="flex h-screen bg-primary">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onNewInvoice={handleNewInvoice} />
        
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Modal Nouvelle Facture */}
      {showNewInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-primary">
                Créer une nouvelle facture
              </h2>
            </div>
            <div className="modal-body">
              <p className="text-secondary">
                Cette fonctionnalité sera bientôt disponible. 
                Pour l'instant, utilisez le bouton "Nouvelle Facture" 
                depuis la page des factures.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowNewInvoiceModal(false)}
                className="btn btn-secondary"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowNewInvoiceModal(false);
                  window.location.href = '/invoices/new';
                }}
                className="btn btn-primary"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
