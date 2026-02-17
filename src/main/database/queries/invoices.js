import Database from 'better-sqlite3';

export class InvoiceQueries {
  constructor(db) {
    this.db = db;
  }

  // Récupérer toutes les factures avec filtres optionnels
  getInvoices(filters = {}) {
    let query = `
      SELECT f.*, c.nom as client_nom, c.email as client_email
      FROM factures f
      LEFT JOIN clients c ON f.client_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.client_id) {
      query += ' AND f.client_id = ?';
      params.push(filters.client_id);
    }
    
    if (filters.statut) {
      query += ' AND f.statut = ?';
      params.push(filters.statut);
    }
    
    if (filters.search) {
      query += ' AND (f.numero LIKE ? OR c.nom LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (filters.date_debut) {
      query += ' AND f.date_emission >= ?';
      params.push(filters.date_debut);
    }
    
    if (filters.date_fin) {
      query += ' AND f.date_emission <= ?';
      params.push(filters.date_fin);
    }
    
    query += ' ORDER BY f.date_emission DESC, f.id DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
      
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }
    
    return this.db.prepare(query).all(...params);
  }

  // Récupérer une facture par son ID avec ses lignes
  getInvoiceById(id) {
    const invoice = this.db.prepare(`
      SELECT f.*, c.nom as client_nom, c.email as client_email, c.telephone as client_telephone, 
             c.adresse as client_adresse, c.siret as client_siret
      FROM factures f
      LEFT JOIN clients c ON f.client_id = c.id
      WHERE f.id = ?
    `).get(id);

    if (invoice) {
      invoice.lignes = this.db.prepare(`
        SELECT * FROM lignes_facture WHERE facture_id = ? ORDER BY id
      `).all(id);
    }

    return invoice;
  }

  // Créer une nouvelle facture
  createInvoice(invoiceData) {
    const stmt = this.db.prepare(`
      INSERT INTO factures (
        numero, client_id, date_emission, date_echeance, statut,
        sous_total, tva_rate, tva_montant, total_ttc, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      invoiceData.numero,
      invoiceData.client_id,
      invoiceData.date_emission,
      invoiceData.date_echeance,
      invoiceData.statut || 'brouillon',
      invoiceData.sous_total || 0,
      invoiceData.tva_rate || 20,
      invoiceData.tva_montant || 0,
      invoiceData.total_ttc || 0,
      invoiceData.notes || null
    );

    // Insérer les lignes de facture
    if (invoiceData.lignes && invoiceData.lignes.length > 0) {
      const lineStmt = this.db.prepare(`
        INSERT INTO lignes_facture (facture_id, description, quantite, prix_unitaire, total)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const ligne of invoiceData.lignes) {
        lineStmt.run(
          result.lastInsertRowid,
          ligne.description,
          ligne.quantite,
          ligne.prix_unitaire,
          ligne.total
        );
      }
    }

    return result.lastInsertRowid;
  }

  // Mettre à jour une facture
  updateInvoice(id, invoiceData) {
    const stmt = this.db.prepare(`
      UPDATE factures SET
        client_id = ?, date_emission = ?, date_echeance = ?, statut = ?,
        sous_total = ?, tva_rate = ?, tva_montant = ?, total_ttc = ?, notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      invoiceData.client_id,
      invoiceData.date_emission,
      invoiceData.date_echeance,
      invoiceData.statut,
      invoiceData.sous_total,
      invoiceData.tva_rate,
      invoiceData.tva_montant,
      invoiceData.total_ttc,
      invoiceData.notes,
      id
    );

    // Supprimer les anciennes lignes et en insérer de nouvelles
    this.db.prepare('DELETE FROM lignes_facture WHERE facture_id = ?').run(id);

    if (invoiceData.lignes && invoiceData.lignes.length > 0) {
      const lineStmt = this.db.prepare(`
        INSERT INTO lignes_facture (facture_id, description, quantite, prix_unitaire, total)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const ligne of invoiceData.lignes) {
        lineStmt.run(
          id,
          ligne.description,
          ligne.quantite,
          ligne.prix_unitaire,
          ligne.total
        );
      }
    }

    return result.changes > 0;
  }

  // Supprimer une facture
  deleteInvoice(id) {
    const stmt = this.db.prepare('DELETE FROM factures WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Générer un numéro de facture unique
  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const prefix = `FAC-${year}-`;
    
    const lastInvoice = this.db.prepare(`
      SELECT numero FROM factures 
      WHERE numero LIKE ? 
      ORDER BY numero DESC 
      LIMIT 1
    `).get(`${prefix}%`);

    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.numero.split('-')[2]);
      const nextNumber = lastNumber + 1;
      return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    } else {
      return `${prefix}0001`;
    }
  }

  // Compter les factures par statut
  getInvoiceStats() {
    return this.db.prepare(`
      SELECT 
        statut,
        COUNT(*) as count,
        SUM(total_ttc) as total
      FROM factures
      GROUP BY statut
    `).all();
  }

  // Calculer le chiffre d'affaires par mois
  getRevenueByMonths(months = 6) {
    return this.db.prepare(`
      SELECT 
        strftime('%Y-%m', date_emission) as month,
        SUM(total_ttc) as revenue,
        COUNT(*) as invoice_count
      FROM factures
      WHERE statut = 'payée' 
        AND date_emission >= date('now', '-${months} months')
      GROUP BY strftime('%Y-%m', date_emission)
      ORDER BY month
    `).all();
  }
}
