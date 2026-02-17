// Formatage des montants monétaires
export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

// Formatage des dates
export const formatDate = (dateString, format = 'short') => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  
  if (format === 'datetime') {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return date.toLocaleDateString('fr-FR');
};

// Formatage des numéros de téléphone
export const formatPhone = (phone) => {
  if (!phone) return '-';
  
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Format français
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return phone;
};

// Formatage des numéros SIRET
export const formatSiret = (siret) => {
  if (!siret) return '-';
  
  const cleaned = siret.replace(/\D/g, '');
  
  if (cleaned.length === 14) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4');
  }
  
  return siret;
};

// Formatage du statut des factures
export const formatStatus = (status) => {
  const statusMap = {
    'brouillon': 'Brouillon',
    'envoyée': 'Envoyée',
    'payée': 'Payée',
    'annulée': 'Annulée',
  };
  
  return statusMap[status] || status;
};

// Couleur du statut
export const getStatusColor = (status) => {
  const colorMap = {
    'brouillon': 'badge-brouillon',
    'envoyée': 'badge-envoyee',
    'payée': 'badge-payee',
    'annulée': 'badge-annulee',
  };
  
  return colorMap[status] || 'badge-brouillon';
};

// Calcul du total TTC
export const calculateTotalTTC = (sousTotal, tvaRate = 20) => {
  const ht = parseFloat(sousTotal) || 0;
  const tva = ht * (parseFloat(tvaRate) / 100);
  const ttc = ht + tva;
  
  return {
    sousTotal: ht,
    tvaAmount: tva,
    totalTTC: ttc,
  };
};

// Génération d'une référence unique
export const generateReference = (prefix = 'REF') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Validation d'email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation de téléphone français
export const isValidFrenchPhone = (phone) => {
  const phoneRegex = /^(0[1-9])(\d{2}){4}$/;
  const cleaned = phone.replace(/\D/g, '');
  return phoneRegex.test(cleaned);
};

// Validation de SIRET
export const isValidSiret = (siret) => {
  const siretRegex = /^\d{14}$/;
  const cleaned = siret.replace(/\D/g, '');
  
  if (!siretRegex.test(cleaned)) {
    return false;
  }
  
  // Algorithme de Luhn pour la validation
  let sum = 0;
  let digit;
  let tmp;
  
  for (let i = 0; i < 14; i++) {
    digit = parseInt(cleaned[i]);
    
    if (i % 2 === 0) {
      tmp = digit * 2;
      sum += tmp > 9 ? tmp - 9 : tmp;
    } else {
      sum += digit;
    }
  }
  
  return sum % 10 === 0;
};

// Tronquer le texte
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Export en CSV
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Échapper les guillemets et les virgules
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });
  
  const csvContent = [csvHeaders, ...csvRows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
