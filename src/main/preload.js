const { contextBridge, ipcRenderer } = require('electron');

// Exposer les API sécurisées au processus renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Factures
  getFactures: (filters) => ipcRenderer.invoke('get-factures', filters),
  getFacture: (id) => ipcRenderer.invoke('get-facture', id),
  createFacture: (data) => ipcRenderer.invoke('create-facture', data),
  updateFacture: (id, data) => ipcRenderer.invoke('update-facture', id, data),
  deleteFacture: (id) => ipcRenderer.invoke('delete-facture', id),
  generateNumeroFacture: () => ipcRenderer.invoke('generate-numero-facture'),
  
  // Clients
  getClients: () => ipcRenderer.invoke('get-clients'),
  getClient: (id) => ipcRenderer.invoke('get-client', id),
  createClient: (data) => ipcRenderer.invoke('create-client', data),
  updateClient: (id, data) => ipcRenderer.invoke('update-client', id, data),
  deleteClient: (id) => ipcRenderer.invoke('delete-client', id),
  searchClients: (searchTerm) => ipcRenderer.invoke('search-clients', searchTerm),
  
  // Rapports
  getReport: (dateDebut, dateFin) => ipcRenderer.invoke('get-report', dateDebut, dateFin),
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
  getChartData: () => ipcRenderer.invoke('get-chart-data'),
  getExportData: (dateDebut, dateFin) => ipcRenderer.invoke('get-export-data', dateDebut, dateFin),
  
  // Entreprise
  getEntreprise: () => ipcRenderer.invoke('get-entreprise'),
  updateEntreprise: (data) => ipcRenderer.invoke('update-entreprise', data),
  
  // Utilitaires
  openSaveDialog: (options) => ipcRenderer.invoke('open-save-dialog', options),
  
  // Écouteurs d'événements (pour les mises à jour en temps réel si nécessaire)
  onFactureUpdate: (callback) => {
    ipcRenderer.on('facture-updated', callback);
    return () => ipcRenderer.removeListener('facture-updated', callback);
  },
  
  onClientUpdate: (callback) => {
    ipcRenderer.on('client-updated', callback);
    return () => ipcRenderer.removeListener('client-updated', callback);
  }
});
