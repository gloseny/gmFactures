import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  Building,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, formatDate, formatPhone, formatSiret } from '../../utils/formatters.js';

export default function ClientList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadClients();
  }, [currentPage, searchTerm]);

  const loadClients = async () => {
    try {
      setLoading(true);
      
      let response;
      if (searchTerm) {
        response = await window.electronAPI.searchClients(searchTerm);
      } else {
        response = await window.electronAPI.getClients();
      }
      
      setClients(response);
      
      // Calculer le nombre total de pages
      setTotalPages(Math.ceil(response.length / itemsPerPage) || 1);
      
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id) => {
    const client = clients.find(c => c.id === id);
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le client "${client.nom}" ?`)) {
      return;
    }

    try {
      await window.electronAPI.deleteClient(id);
      loadClients();
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
      alert(error.message || 'Erreur lors de la suppression du client');
    }
  };

  // Pagination des clients
  const paginatedClients = clients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">Chargement des clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">Clients</h1>
          <p className="text-secondary">
            Gérez votre base de clients et leur historique de factures
          </p>
        </div>
        
        <button
          onClick={() => navigate('/clients/new')}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="kpi-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou SIRET..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Tableau des clients */}
      <div className="kpi-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>Factures</th>
                <th>CA Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-secondary">
                    {searchTerm ? 'Aucun client trouvé pour cette recherche' : 'Aucun client enregistré'}
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <div className="font-medium text-primary">{client.nom}</div>
                          {client.siret && (
                            <div className="text-xs text-secondary">
                              SIRET: {formatSiret(client.siret)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td>
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center text-sm text-secondary">
                            <Mail className="w-3 h-3 mr-1" />
                            {client.email}
                          </div>
                        )}
                        {client.telephone && (
                          <div className="flex items-center text-sm text-secondary">
                            <Phone className="w-3 h-3 mr-1" />
                            {formatPhone(client.telephone)}
                          </div>
                        )}
                        {!client.email && !client.telephone && (
                          <span className="text-sm text-secondary">-</span>
                        )}
                      </div>
                    </td>
                    
                    <td>
                      <div className="text-center">
                        <div className="font-medium">{client.invoice_count || 0}</div>
                        <div className="text-xs text-secondary">factures</div>
                      </div>
                    </td>
                    
                    <td>
                      <div className="font-medium">
                        {formatCurrency(client.total_revenue || 0)}
                      </div>
                    </td>
                    
                    <td>
                      <div className="flex items-center space-x-2">
                        {/* Voir */}
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="p-1 text-secondary hover:text-primary transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Éditer */}
                        <button
                          onClick={() => navigate(`/clients/${client.id}/edit`)}
                          className="p-1 text-secondary hover:text-primary transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Supprimer */}
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1 text-secondary hover:text-danger transition-colors"
                          title="Supprimer"
                          disabled={(client.invoice_count || 0) > 0}
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
              {clients.length} client{clients.length > 1 ? 's' : ''} au total
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
                Page {currentPage} sur {totalPages}
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

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">Total clients</p>
              <p className="text-2xl font-bold text-primary">{clients.length}</p>
            </div>
            <Building className="w-8 h-8 text-accent opacity-20" />
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">Clients actifs</p>
              <p className="text-2xl font-bold text-primary">
                {clients.filter(c => (c.invoice_count || 0) > 0).length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-success opacity-20" />
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">CA total</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(clients.reduce((sum, c) => sum + (c.total_revenue || 0), 0))}
              </p>
            </div>
            <span className="text-2xl">€</span>
          </div>
        </div>
      </div>
    </div>
  );
}
