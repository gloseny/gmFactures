import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  Upload, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  CreditCard
} from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    siret: '',
    tva_numero: '',
    iban: '',
    logo_path: ''
  });

  useEffect(() => {
    loadEntrepriseData();
  }, []);

  const loadEntrepriseData = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getEntreprise();
      if (data) {
        setFormData(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données entreprise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await window.electronAPI.updateEntreprise(formData);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des informations');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async () => {
    try {
      // Pour l'instant, nous allons juste simuler l'upload
      // Dans une version complète, il faudrait utiliser file dialog et stocker l'image
      alert('Fonctionnalité d\'upload de logo bientôt disponible');
    } catch (error) {
      console.error('Erreur lors de l\'upload du logo:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-in">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">Paramètres</h1>
          <p className="text-secondary">
            Configurez les informations de votre entreprise
          </p>
        </div>
        
        {success && (
          <div className="bg-success/10 border border-success text-success px-4 py-2 rounded-lg">
            Informations sauvegardées avec succès
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Informations générales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom de l'entreprise */}
            <div>
              <label className="form-label">Nom de l'entreprise</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                placeholder="Mon Entreprise"
                className="form-input"
              />
            </div>

            {/* SIRET */}
            <div>
              <label className="form-label">SIRET</label>
              <input
                type="text"
                value={formData.siret}
                onChange={(e) => handleInputChange('siret', e.target.value)}
                placeholder="12345678901234"
                className="form-input"
              />
            </div>

            {/* Numéro TVA */}
            <div>
              <label className="form-label">Numéro de TVA intracommunautaire</label>
              <input
                type="text"
                value={formData.tva_numero}
                onChange={(e) => handleInputChange('tva_numero', e.target.value)}
                placeholder="FR12345678901"
                className="form-input"
              />
            </div>

            {/* Logo */}
            <div>
              <label className="form-label">Logo</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={formData.logo_path || ''}
                  onChange={(e) => handleInputChange('logo_path', e.target.value)}
                  placeholder="/path/to/logo.png"
                  className="form-input flex-1"
                  readOnly
                />
                <button
                  type="button"
                  onClick={handleLogoUpload}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Uploader</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Coordonnées
          </h3>
          
          <div className="space-y-4">
            {/* Adresse */}
            <div>
              <label className="form-label">Adresse postale</label>
              <textarea
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                placeholder="123 Rue de l'Entreprise&#10;75001 Paris&#10;France"
                rows={3}
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Téléphone */}
              <div>
                <label className="form-label flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                  className="form-input"
                />
              </div>

              {/* Email */}
              <div>
                <label className="form-label flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@entreprise.fr"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informations bancaires */}
        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Informations bancaires
          </h3>
          
          <div>
            <label className="form-label">IBAN</label>
            <input
              type="text"
              value={formData.iban}
              onChange={(e) => handleInputChange('iban', e.target.value)}
              placeholder="FR7630004000031234567890143"
              className="form-input"
            />
            <p className="text-xs text-secondary mt-1">
              Utilisé pour les mentions légales sur les factures
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={loadEntrepriseData}
            className="btn btn-outline"
          >
            Annuler les modifications
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>

      {/* Informations supplémentaires */}
      <div className="kpi-card">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Informations sur l'application
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-primary mb-2">Version</h4>
            <p className="text-secondary">gmFactures v1.0.0</p>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Auteur</h4>
            <p className="text-secondary">G-MANAGER <a href="https://lesprojetsdegloire.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">lesprojetsdegloire.com</a></p>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Base de données</h4>
            <p className="text-secondary">Stockage local sécurisé</p>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Support</h4>
            <p className="text-secondary">lesprojetsdegloire@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
