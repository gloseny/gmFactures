import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Send
} from 'lucide-react';
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '../../utils/formatters.js';

export default function InvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadInvoices();
  }, [currentPage, searchTerm, statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      const filters = {
        search: searchTerm || undefined,
        statut: statusFilter || undefined,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      };

      const response = await window.electronAPI.getFactures(filters);
      setInvoices(response);
      
      // Pour l'instant, nous simulons le nombre total de pages
      // Dans une vraie application, il faudrait un appel séparé pour compter
      setTotalPages(Math.ceil(response.length / itemsPerPage) || 1);
      
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      return;
    }

    try {
      await window.electronAPI.deleteFacture(id);
      loadInvoices();
    } catch (error) {
      console.error('Erreur lors de la suppression de la facture:', error);
      alert('Erreur lors de la suppression de la facture');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Récupérer la facture actuelle
      const invoice = await window.electronAPI.getFacture(id);
      
      // Mettre à jour le statut
      await window.electronAPI.updateFacture(id, {
        ...invoice,
        statut: newStatus
      });
      
      loadInvoices();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const statusOptions = [
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'envoyée', label: 'Envoyée' },
    { value: 'payée', label: 'Payée' },
    { value: 'annulée', label: 'Annulée' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">Factures</h1>
          <p className="text-secondary">
            Gérez toutes vos factures et suivez leur statut
          </p>
        </div>
        
        <button
          onClick={() => navigate('/invoices/new')}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Facture</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="kpi-card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="text"
                placeholder="Rechercher par numéro ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>

          {/* Filtre par statut */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="">Tous les statuts</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des factures */}
      <div className="kpi-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Date d'émission</th>
                <th>Échéance</th>
                <th>Total TTC</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-secondary">
                    Aucune facture trouvée
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-medium">{invoice.numero}</td>
                    <td>
                      <div>
                        <div className="font-medium">{invoice.client_nom}</div>
                        {invoice.client_email && (
                          <div className="text-xs text-secondary">{invoice.client_email}</div>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(invoice.date_emission)}</td>
                    <td>{formatDate(invoice.date_echeance)}</td>
                    <td className="font-medium">{formatCurrency(invoice.total_ttc)}</td>
                    <td>
                      <span className={`badge ${getStatusColor(invoice.statut)}`}>
                        {formatStatus(invoice.statut)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        {/* Voir */}
                        <button
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                          className="p-1 text-secondary hover:text-primary transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Éditer */}
                        <button
                          onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                          className="p-1 text-secondary hover:text-primary transition-colors"
                          title="Éditer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Changer statut */}
                        <select
                          value={invoice.statut}
                          onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                          className="text-xs bg-card border border-custom rounded px-1 py-0.5"
                          title="Changer le statut"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        {/* Supprimer */}
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="p-1 text-secondary hover:text-danger transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-custom">
            <div className="text-sm text-secondary">
              Page {currentPage} sur {totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-sm text-primary px-3">
                {currentPage}
              </span>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
