import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// Chemin vers la base de données dans userData
const dbPath = path.join(app.getPath('userData'), 'gestionfactures.db');

export function initializeDatabase() {
  const db = new Database(dbPath);

  // Activer les clés étrangères
  db.pragma('foreign_keys = ON');

  // Table clients
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      email TEXT,
      telephone TEXT,
      adresse TEXT,
      siret TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table factures
  db.exec(`
    CREATE TABLE IF NOT EXISTS factures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT UNIQUE NOT NULL,
      client_id INTEGER NOT NULL,
      date_emission DATE NOT NULL,
      date_echeance DATE,
      statut TEXT DEFAULT 'brouillon',
      sous_total REAL DEFAULT 0,
      tva_rate REAL DEFAULT 20,
      tva_montant REAL DEFAULT 0,
      total_ttc REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )
  `);

  // Table lignes de facture
  db.exec(`
    CREATE TABLE IF NOT EXISTS lignes_facture (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facture_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      quantite REAL DEFAULT 1,
      prix_unitaire REAL DEFAULT 0,
      total REAL DEFAULT 0,
      FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE
    )
  `);

  // Table paramètres entreprise
  db.exec(`
    CREATE TABLE IF NOT EXISTS entreprise (
      id INTEGER PRIMARY KEY DEFAULT 1,
      nom TEXT,
      adresse TEXT,
      telephone TEXT,
      email TEXT,
      siret TEXT,
      tva_numero TEXT,
      logo_path TEXT,
      iban TEXT
    )
  `);

  // Créer les index pour optimiser les performances
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_factures_client_id ON factures(client_id);
    CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
    CREATE INDEX IF NOT EXISTS idx_factures_date_emission ON factures(date_emission);
    CREATE INDEX IF NOT EXISTS idx_lignes_facture_facture_id ON lignes_facture(facture_id);
  `);

  // Insérer les données par défaut pour l'entreprise si elles n'existent pas
  const entrepriseExists = db.prepare('SELECT COUNT(*) as count FROM entreprise').get().count > 0;
  
  if (!entrepriseExists) {
    db.prepare(`
      INSERT INTO entreprise (nom, adresse, telephone, email, siret, tva_numero, iban)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Mon Entreprise',
      '123 Rue de l\'Entreprise\n75001 Paris',
      '+33 1 23 45 67 89',
      'contact@entreprise.fr',
      '12345678901234',
      'FR12345678901',
      'FR7630004000031234567890143'
    );
  }

  console.log('Base de données initialisée avec succès');
  return db;
}

export function getDatabase() {
  return new Database(dbPath);
}
