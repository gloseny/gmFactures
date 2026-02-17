import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Download, 
  Copy, 
  Send,
  CheckCircle,
  Clock,
  FileText,
  Building2
} from 'lucide-react';
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '../../utils/formatters.js';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState(null);
  const [entreprise, setEntreprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    loadInvoiceData();
  }, [id]);

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      
      // Charger la facture
      const invoiceData = await window.electronAPI.getFacture(id);
      setInvoice(invoiceData);
      
      // Charger les infos entreprise
      const entrepriseData = await window.electronAPI.getEntreprise();
      setEntreprise(entrepriseData);
      
    } catch (error) {
      console.error('Erreur lors du chargement de la facture:', error);
      alert('Erreur lors du chargement de la facture');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await window.electronAPI.updateFacture(id, {
        ...invoice,
        statut: newStatus
      });
      
      setInvoice(prev => ({ ...prev, statut: newStatus }));
      setShowStatusModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      return;
    }

    try {
      await window.electronAPI.deleteFacture(id);
      navigate('/invoices');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la facture');
    }
  };

  const handleDuplicate = async () => {
    try {
      // Créer une nouvelle facture basée sur l'actuelle
      const newInvoiceData = {
        ...invoice,
        numero: undefined, // Sera généré automatiquement
        date_emission: new Date().toISOString().split('T')[0],
        statut: 'brouillon',
        lignes: invoice.lignes
      };

      const newId = await window.electronAPI.createFacture(newInvoiceData);
      navigate(`/invoices/${newId}/edit`);
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      alert('Erreur lors de la duplication de la facture');
    }
  };

  const handleExportPDF = async () => {
    try {
      // Pour l'instant, nous allons juste imprimer la page
      // Dans une version complète, il faudrait utiliser jsPDF
      window.print();
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de l\'export PDF');
    }
  };

  const statusOptions = [
    { value: 'brouillon', label: 'Brouillon', icon: FileText },
    { value: 'envoyée', label: 'Envoyée', icon: Send },
    { value: 'payée', label: 'Payée', icon: CheckCircle },
    { value: 'annulée', label: 'Annulée', icon: Trash2 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">Chargement de la facture...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="w-12 h-12 text-danger mx-auto mb-4" />
          <p className="text-secondary">Facture non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-in">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/invoices')}
            className="btn btn-outline flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-primary">Facture {invoice.numero}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`badge ${getStatusColor(invoice.statut)}`}>
                {formatStatus(invoice.statut)}
              </span>
              <span className="text-secondary text-sm">
                Créée le {formatDate(invoice.created_at, 'long')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/invoices/${id}/edit`)}
            className="btn btn-secondary"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </button>
          
          <button
            onClick={handleDuplicate}
            className="btn btn-secondary"
          >
            <Copy className="w-4 h-4 mr-2" />
            Dupliquer
          </button>
          
          <button
            onClick={handleExportPDF}
            className="btn btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter PDF
          </button>
          
          <button
            onClick={() => setShowStatusModal(true)}
            className="btn btn-primary"
          >
            <Clock className="w-4 h-4 mr-2" />
            Changer statut
          </button>
          
          <button
            onClick={handleDelete}
            className="btn btn-danger"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenu de la facture */}
      <div className="kpi-card print:shadow-none print:border-none">
        {/* En-tête entreprise et client */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Entreprise */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Building2 className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-primary">Entreprise</h3>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">{entreprise?.nom}</p>
              <p className="text-secondary whitespace-pre-line">{entreprise?.adresse}</p>
              <p className="text-secondary">{entreprise?.telephone}</p>
              <p className="text-secondary">{entreprise?.email}</p>
              {entreprise?.siret && <p className="text-secondary">SIRET: {entreprise?.siret}</p>}
              {entreprise?.tva_numero && <p className="text-secondary">TVA: {entreprise?.tva_numero}</p>}
            </div>
          </div>

          {/* Client */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-primary">Client</h3>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">{invoice.client_nom}</p>
              {invoice.client_email && <p className="text-secondary">{invoice.client_email}</p>}
              {invoice.client_telephone && <p className="text-secondary">{invoice.client_telephone}</p>}
              {invoice.client_adresse && (
                <p className="text-secondary whitespace-pre-line">{invoice.client_adresse}</p>
              )}
              {invoice.client_siret && <p className="text-secondary">SIRET: {invoice.client_siret}</p>}
            </div>
          </div>
        </div>

        {/* Informations facture */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-secondary rounded-lg">
          <div>
            <p className="text-xs text-secondary mb-1">Numéro</p>
            <p className="font-semibold text-primary">{invoice.numero}</p>
          </div>
          <div>
            <p className="text-xs text-secondary mb-1">Date d'émission</p>
            <p className="font-semibold text-primary">{formatDate(invoice.date_emission)}</p>
          </div>
          <div>
            <p className="text-xs text-secondary mb-1">Date d'échéance</p>
            <p className="font-semibold text-primary">
              {invoice.date_echeance ? formatDate(invoice.date_echeance) : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary mb-1">Statut</p>
            <span className={`badge ${getStatusColor(invoice.statut)}`}>
              {formatStatus(invoice.statut)}
            </span>
          </div>
        </div>

        {/* Lignes de facture */}
        <div className="mb-8">
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="text-right w-24">Quantité</th>
                <th className="text-right w-32">Prix unitaire</th>
                <th className="text-right w-32">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lignes?.map((ligne, index) => (
                <tr key={index}>
                  <td>{ligne.description}</td>
                  <td className="text-right">{ligne.quantite}</td>
                  <td className="text-right">{formatCurrency(ligne.prix_unitaire)}</td>
                  <td className="text-right font-medium">{formatCurrency(ligne.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="flex justify-end">
          <div className="w-full md:w-80 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Sous-total HT:</span>
              <span>{formatCurrency(invoice.sous_total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">TVA ({invoice.tva_rate}%):</span>
              <span>{formatCurrency(invoice.tva_montant)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-custom">
              <span>Total TTC:</span>
              <span>{formatCurrency(invoice.total_ttc)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 pt-8 border-t border-custom">
            <h4 className="font-semibold text-primary mb-2">Notes</h4>
            <p className="text-secondary whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        {/* Mentions légales */}
        {entreprise && (
          <div className="mt-8 pt-8 border-t border-custom text-xs text-secondary">
            <p>En cas de retard de paiement, une pénalité de trois fois le taux d'intérêt légal sera appliquée.</p>
            <p className="mt-1">Aucun escompte pour paiement anticipé.</p>
            {entreprise.iban && (
              <p className="mt-2">IBAN: {entreprise.iban}</p>
            )}
          </div>
        )}
      </div>

      {/* Modal changement de statut */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-primary">
                Changer le statut de la facture
              </h2>
            </div>
            <div className="modal-body">
              <div className="space-y-2">
                {statusOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Icon className="w-5 h-5 text-secondary" />
                      <span>{option.label}</span>
                      {invoice.statut === option.value && (
                        <CheckCircle className="w-4 h-4 text-success ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowStatusModal(false)}
                className="btn btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
