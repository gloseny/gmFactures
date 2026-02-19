import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import { invoiceQueries, clientQueries, reportQueries, db } from './database/db.js';

// Correction ESM compatible Windows
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('isDev:', isDev);
console.log('__dirname:', __dirname);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, '../../assets/icon.png'),
    titleBarStyle: 'hiddenInset',
    show: false
  });

  if (isDev) {
    console.log('Chargement en mode développement sur http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    setTimeout(() => {
      mainWindow.webContents.openDevTools();
    }, 1000);
  } else {
    const htmlPath = path.join(__dirname, '../../dist/index.html');
    console.log('Chemin HTML:', htmlPath);
    mainWindow.loadFile(htmlPath).catch((err) => {
      console.error('Erreur lors du chargement du HTML:', err);
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

// IPC Handlers pour les factures
ipcMain.handle('get-factures', async (event, filters) => {
  try {
    return invoiceQueries.getInvoices(filters);
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    throw error;
  }
});

ipcMain.handle('get-facture', async (event, id) => {
  try {
    return invoiceQueries.getInvoiceById(id);
  } catch (error) {
    console.error('Erreur lors de la récupération de la facture:', error);
    throw error;
  }
});

ipcMain.handle('create-facture', async (event, data) => {
  try {
    return invoiceQueries.createInvoice(data);
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    throw error;
  }
});

ipcMain.handle('update-facture', async (event, id, data) => {
  try {
    return invoiceQueries.updateInvoice(id, data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    throw error;
  }
});

ipcMain.handle('delete-facture', async (event, id) => {
  try {
    return invoiceQueries.deleteInvoice(id);
  } catch (error) {
    console.error('Erreur lors de la suppression de la facture:', error);
    throw error;
  }
});

ipcMain.handle('generate-numero-facture', async () => {
  try {
    return invoiceQueries.generateInvoiceNumber();
  } catch (error) {
    console.error('Erreur lors de la génération du numéro de facture:', error);
    throw error;
  }
});

// IPC Handlers pour les clients
ipcMain.handle('get-clients', async () => {
  try {
    return clientQueries.getAllClients();
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    throw error;
  }
});

ipcMain.handle('get-client', async (event, id) => {
  try {
    return clientQueries.getClientById(id);
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    throw error;
  }
});

ipcMain.handle('create-client', async (event, data) => {
  try {
    return clientQueries.createClient(data);
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    throw error;
  }
});

ipcMain.handle('update-client', async (event, id, data) => {
  try {
    return clientQueries.updateClient(id, data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    throw error;
  }
});

ipcMain.handle('delete-client', async (event, id) => {
  try {
    return clientQueries.deleteClient(id);
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    throw error;
  }
});

ipcMain.handle('search-clients', async (event, searchTerm) => {
  try {
    return clientQueries.searchClients(searchTerm);
  } catch (error) {
    console.error('Erreur lors de la recherche des clients:', error);
    throw error;
  }
});

// IPC Handlers pour les rapports
ipcMain.handle('get-report', async (event, dateDebut, dateFin) => {
  try {
    return reportQueries.getPeriodReport(dateDebut, dateFin);
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    throw error;
  }
});

ipcMain.handle('get-dashboard-stats', async () => {
  try {
    return reportQueries.getDashboardStats();
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
});

ipcMain.handle('get-chart-data', async () => {
  try {
    return reportQueries.getChartData();
  } catch (error) {
    console.error('Erreur lors de la récupération des données de graphique:', error);
    throw error;
  }
});

ipcMain.handle('get-export-data', async (event, dateDebut, dateFin) => {
  try {
    return reportQueries.getExportData(dateDebut, dateFin);
  } catch (error) {
    console.error('Erreur lors de l\'export des données:', error);
    throw error;
  }
});

// IPC Handlers pour l'entreprise
ipcMain.handle('get-entreprise', async () => {
  try {
    return db.prepare('SELECT * FROM entreprise WHERE id = 1').get();
  } catch (error) {
    console.error('Erreur lors de la récupération des infos entreprise:', error);
    throw error;
  }
});

ipcMain.handle('update-entreprise', async (event, data) => {
  try {
    const stmt = db.prepare(`
      UPDATE entreprise SET
        nom = ?, adresse = ?, telephone = ?, email = ?, siret = ?, 
        tva_numero = ?, logo_path = ?, iban = ?
      WHERE id = 1
    `);

    const result = stmt.run(
      data.nom,
      data.adresse,
      data.telephone,
      data.email,
      data.siret,
      data.tva_numero,
      data.logo_path || null,
      data.iban
    );

    return result.changes > 0;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des infos entreprise:', error);
    throw error;
  }
});

// Utilitaires
ipcMain.handle('open-save-dialog', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du dialogue de sauvegarde:', error);
    throw error;
  }
});

// Gestion du cycle de vie de l'application
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Nettoyage à la fermeture
app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejet non géré:', reason);
});