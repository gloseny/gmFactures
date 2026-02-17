import { initializeDatabase } from './migrations.js';
import { InvoiceQueries } from './queries/invoices.js';
import { ClientQueries } from './queries/clients.js';
import { ReportQueries } from './queries/reports.js';

// Initialiser la base de données
const db = initializeDatabase();

// Exporter les instances des classes de requêtes
export const invoiceQueries = new InvoiceQueries(db);
export const clientQueries = new ClientQueries(db);
export const reportQueries = new ReportQueries(db);

// Exporter la connexion à la base de données pour les opérations directes
export { db };
