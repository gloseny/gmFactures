import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  X, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  FileText
} from 'lucide-react';
import { isValidEmail, isValidFrenchPhone, isValidSiret } from '../../utils/formatters.js';

export default function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    siret: ''
  });

  useEffect(() => {
    if (isEditing) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const client = await window.electronAPI.getClient(id);
      setFormData(client);
    } catch (error) {
      console.error('Erreur lors du chargement du client:', error);
      alert('Erreur lors du chargement du client');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur pour ce champ lorsque l'utilisateur modifie la valeur
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Nom obligatoire
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom du client est obligatoire';
    }

    // Email si fourni
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Adresse email invalide';
    }

    // Téléphone si fourni
    if (formData.telephone && !isValidFrenchPhone(formData.telephone)) {
      newErrors.telephone = 'Numéro de téléphone français invalide';
    }

    // SIRET si fourni
    if (formData.siret && !isValidSiret(formData.siret)) {
      newErrors.siret = 'Numéro SIRET invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const clientData = {
        ...formData,
        nom: formData.nom.trim(),
        email: formData.email.trim() || null,
        telephone: formData.telephone.trim() || null,
        adresse: formData.adresse.trim() || null,
        siret: formData.siret.trim() || null
      };

      if (isEditing) {
        await window.electronAPI.updateClient(id, clientData);
      } else {
        await window.electronAPI.createClient(clientData);
      }

      navigate('/clients');
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du client');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">Chargement du client...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-in">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">
            {isEditing ? 'Modifier le client' : 'Nouveau client'}
          </h1>
          <p className="text-secondary">
            {isEditing ? 'Modifiez les informations du client' : 'Ajoutez un nouveau client à votre base'}
          </p>
        </div>
        
        <button
          onClick={() => navigate('/clients')}
          className="btn btn-outline"
        >
          <X className="w-4 h-4 mr-2" />
          Annuler
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations principales */}
        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Informations principales
          </h3>
          
          <div className="space-y-4">
            {/* Nom */}
            <div>
              <label className="form-label">
                Nom du client <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                placeholder="Nom de l'entreprise ou du client"
                className={`form-input ${errors.nom ? 'border-danger' : ''}`}
                required
              />
              {errors.nom && (
                <p className="text-xs text-danger mt-1">{errors.nom}</p>
              )}
            </div>

            {/* SIRET */}
            <div>
              <label className="form-label">SIRET</label>
              <input
                type="text"
                value={formData.siret}
                onChange={(e) => handleInputChange('siret', e.target.value)}
                placeholder="123 456 789 01234"
                className={`form-input ${errors.siret ? 'border-danger' : ''}`}
              />
              {errors.siret && (
                <p className="text-xs text-danger mt-1">{errors.siret}</p>
              )}
              <p className="text-xs text-secondary mt-1">
                14 chiffres obligatoires pour une entreprise française
              </p>
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Coordonnées
          </h3>
          
          <div className="space-y-4">
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
                className={`form-input ${errors.email ? 'border-danger' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-danger mt-1">{errors.email}</p>
              )}
            </div>

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
                placeholder="01 23 45 67 89"
                className={`form-input ${errors.telephone ? 'border-danger' : ''}`}
              />
              {errors.telephone && (
                <p className="text-xs text-danger mt-1">{errors.telephone}</p>
              )}
              <p className="text-xs text-secondary mt-1">
                Format français: 01 23 45 67 89
              </p>
            </div>

            {/* Adresse */}
            <div>
              <label className="form-label flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Adresse
              </label>
              <textarea
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                placeholder="123 Rue de l'Entreprise&#10;75001 Paris&#10;France"
                rows={3}
                className="form-input"
              />
              <p className="text-xs text-secondary mt-1">
                Adresse postale complète
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="btn btn-outline"
          >
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Sauvegarde...' : (isEditing ? 'Mettre à jour' : 'Créer le client')}
          </button>
        </div>
      </form>
    </div>
  );
}
