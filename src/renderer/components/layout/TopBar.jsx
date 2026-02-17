import React from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, User, Bell } from 'lucide-react';

export default function TopBar({ onNewInvoice }) {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Tableau de bord';
      case '/invoices':
        return 'Factures';
      case '/clients':
        return 'Clients';
      case '/reports':
        return 'Rapports';
      case '/settings':
        return 'Paramètres';
      default:
        if (location.pathname.startsWith('/invoices/')) {
          return 'Détail Facture';
        }
        return 'GestionFactures';
    }
  };

  const showNewInvoiceButton = () => {
    return location.pathname === '/invoices' || location.pathname === '/';
  };

  return (
    <div className="topbar">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-primary">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {showNewInvoiceButton() && (
          <button
            onClick={onNewInvoice}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Facture</span>
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-2 text-secondary hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>

        {/* Avatar utilisateur */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-primary">Admin</span>
        </div>
      </div>
    </div>
  );
}
