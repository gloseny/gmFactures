import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  Send, 
  Plus, 
  Trash2, 
  X,
  Calendar,
  User
} from 'lucide-react';
import { formatCurrency, formatDate, calculateTotalTTC } from '../../utils/formatters.js';

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [entreprise, setEntreprise] = useState(null);

  const [formData, setFormData] = useState({
    numero: '',
    client_id: '',
    date_emission: new Date().toISOString().split('T')[0],
    date_echeance: '',
    statut: 'brouillon',
    notes: '',
    tva_rate: 20,
    lignes: [
      {
        description: '',
        quantite: 1,
        prix_unitaire: 0,
        total: 0
      }
    ]
  });

  const [totals, setTotals] = useState({
    sousTotal: 0,
    tvaAmount: 0,
    totalTTC: 0
  });

  useEffect(() => {
    loadInitialData();
  }, [id]);

  useEffect(() => {
    calculateTotals();
  }, [formData.lignes, formData.tva_rate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Charger les clients
      const clientsData = await window.electronAPI.getClients();
      setClients(clientsData);

      // Charger les infos entreprise
      const entrepriseData = await window.electronAPI.getEntreprise();
      setEntreprise(entrepriseData);

      if (isEditing) {
        // Charger la facture existante
        const invoice = await window.electronAPI.getFacture(id);
        setFormData({
          ...invoice,
          date_emission: invoice.date_emission?.split('T')[0] || '',
          date_echeance: invoice.date_echeance?.split('T')[0] || '',
          lignes: invoice.lignes?.length > 0 ? invoice.lignes : [{
            description: '',
            quantite: 1,
            prix_unitaire: 0,
            total: 0
          }]
        });
      } else {
        // Générer un numéro de facture
        const numero = await window.electronAPI.generateNumeroFacture();
        setFormData(prev => ({ ...prev, numero }));
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const sousTotal = formData.lignes.reduce((sum, ligne) => {
      return sum + (parseFloat(ligne.quantite) * parseFloat(ligne.prix_unitaire || 0));
    }, 0);

    const { tvaAmount, totalTTC } = calculateTotalTTC(sousTotal, formData.tva_rate);

    setTotals({
      sousTotal,
      tvaAmount,
      totalTTC
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLigneChange = (index, field, value) => {
    const newLignes = [...formData.lignes];
    newLignes[index] = {
      ...newLignes[index],
      [field]: value
    };

    // Recalculer le total de la ligne
    if (field === 'quantite' || field === 'prix_unitaire') {
      const quantite = parseFloat(newLignes[index].quantite) || 0;
      const prixUnitaire = parseFloat(newLignes[index].prix_unitaire) || 0;
      newLignes[index].total = quantite * prixUnitaire;
    }

    setFormData(prev => ({
      ...prev,
      lignes: newLignes
    }));
  };

  const addLigne = () => {
    setFormData(prev => ({
      ...prev,
      lignes: [
        ...prev.lignes,
        {
          description: '',
          quantite: 1,
          prix_unitaire: 0,
          total: 0
        }
      ]
    }));
  };

  const removeLigne = (index) => {
    if (formData.lignes.length > 1) {
      const newLignes = formData.lignes.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        lignes: newLignes
      }));
    }
  };

  const handleSubmit = async (e, saveAsDraft = true) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Validation
      if (!formData.client_id) {
        alert('Veuillez sélectionner un client');
        return;
      }

      if (formData.lignes.some(ligne => !ligne.description || ligne.quantite <= 0 || ligne.prix_unitaire <= 0)) {
        alert('Veuillez remplir toutes les lignes de facture correctement');
        return;
      }

      const invoiceData = {
        ...formData,
        statut: saveAsDraft ? 'brouillon' : 'envoyée',
        sous_total: totals.sousTotal,
        tva_montant: totals.tvaAmount,
        total_ttc: totals.totalTTC,
        lignes: formData.lignes.map(ligne => ({
          ...ligne,
          quantite: parseFloat(ligne.quantite),
          prix_unitaire: parseFloat(ligne.prix_unitaire),
          total: parseFloat(ligne.total)
        }))
      };

      if (isEditing) {
        await window.electronAPI.updateFacture(id, invoiceData);
      } else {
        await window.electronAPI.createFacture(invoiceData);
      }

      navigate('/invoices');
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la facture');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.numero) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-in">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">
            {isEditing ? 'Modifier la facture' : 'Nouvelle facture'}
          </h1>
          <p className="text-secondary">
            {isEditing ? 'Modifiez les informations de la facture' : 'Créez une nouvelle facture'}
          </p>
        </div>
        
        <button
          onClick={() => navigate('/invoices')}
          className="btn btn-outline"
        >
          <X className="w-4 h-4 mr-2" />
          Annuler
        </button>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Informations générales */}
        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-primary mb-4">Informations générales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Numéro */}
            <div>
              <label className="form-label">Numéro de facture</label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Client */}
            <div>
              <label className="form-label">Client</label>
              <select
                value={formData.client_id}
                onChange={(e) => handleInputChange('client_id', e.target.value)}
                className="form-input"
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Date d'émission */}
            <div>
              <label className="form-label">Date d'émission</label>
              <input
                type="date"
                value={formData.date_emission}
                onChange={(e) => handleInputChange('date_emission', e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Date d'échéance */}
            <div>
              <label className="form-label">Date d'échéance</label>
              <input
                type="date"
                value={formData.date_echeance}
                onChange={(e) => handleInputChange('date_echeance', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Lignes de facture */}
        <div className="kpi-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-primary">Lignes de facture</h3>
            <button
              type="button"
              onClick={addLigne}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une ligne</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="w-24">Quantité</th>
                  <th className="w-32">Prix unitaire</th>
                  <th className="w-32">Total</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {formData.lignes.map((ligne, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={ligne.description}
                        onChange={(e) => handleLigneChange(index, 'description', e.target.value)}
                        placeholder="Description du produit/service"
                        className="form-input w-full"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={ligne.quantite}
                        onChange={(e) => handleLigneChange(index, 'quantite', e.target.value)}
                        min="0.01"
                        step="0.01"
                        className="form-input w-full"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={ligne.prix_unitaire}
                        onChange={(e) => handleLigneChange(index, 'prix_unitaire', e.target.value)}
                        min="0"
                        step="0.01"
                        className="form-input w-full"
                        required
                      />
                    </td>
                    <td>
                      <div className="form-input w-full bg-secondary">
                        {formatCurrency(ligne.total)}
                      </div>
                    </td>
                    <td>
                      {formData.lignes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLigne(index)}
                          className="p-1 text-danger hover:text-danger/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totaux */}
        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-primary mb-4">Totaux</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sous-total */}
            <div>
              <label className="form-label">Sous-total HT</label>
              <div className="form-input bg-secondary">
                {formatCurrency(totals.sousTotal)}
              </div>
            </div>

            {/* TVA */}
            <div>
              <label className="form-label">Taux de TVA</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={formData.tva_rate}
                  onChange={(e) => handleInputChange('tva_rate', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="form-input flex-1"
                />
                <span className="flex items-center text-secondary">%</span>
              </div>
            </div>

            {/* Montant TVA */}
            <div>
              <label className="form-label">Montant TVA</label>
              <div className="form-input bg-secondary">
                {formatCurrency(totals.tvaAmount)}
              </div>
            </div>

            {/* Total TTC */}
            <div>
              <label className="form-label">Total TTC</label>
              <div className="form-input bg-accent/10 text-accent font-bold">
                {formatCurrency(totals.totalTTC)}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-primary mb-4">Notes</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Notes ou conditions particulières..."
            rows={4}
            className="form-input w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="btn btn-secondary"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer comme brouillon
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            <Send className="w-4 h-4 mr-2" />
            Enregistrer et envoyer
          </button>
        </div>
      </form>
    </div>
  );
}
