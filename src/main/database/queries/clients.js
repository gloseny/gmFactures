import Database from 'better-sqlite3';

export class ClientQueries {
  constructor(db) {
    this.db = db;
  }

  // Récupérer tous les clients
  getAllClients() {
    return this.db.prepare(`
      SELECT c.*, 
             COUNT(f.id) as invoice_count,
             COALESCE(SUM(f.total_ttc), 0) as total_revenue
      FROM clients c
      LEFT JOIN factures f ON c.id = f.client_id
      GROUP BY c.id
      ORDER BY c.nom
    `).all();
  }

  // Récupérer un client par son ID
  getClientById(id) {
    const client = this.db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    
    if (client) {
      // Récupérer les factures du client
      client.factures = this.db.prepare(`
        SELECT id, numero, date_emission, date_echeance, statut, total_ttc
        FROM factures
        WHERE client_id = ?
        ORDER BY date_emission DESC
      `).all(id);
    }
    
    return client;
  }

  // Rechercher des clients
  searchClients(searchTerm) {
    return this.db.prepare(`
      SELECT * FROM clients 
      WHERE nom LIKE ? OR email LIKE ? OR siret LIKE ?
      ORDER BY nom
    `).all(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
  }

  // Créer un nouveau client
  createClient(clientData) {
    const stmt = this.db.prepare(`
      INSERT INTO clients (nom, email, telephone, adresse, siret)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      clientData.nom,
      clientData.email || null,
      clientData.telephone || null,
      clientData.adresse || null,
      clientData.siret || null
    );

    return result.lastInsertRowid;
  }

  // Mettre à jour un client
  updateClient(id, clientData) {
    const stmt = this.db.prepare(`
      UPDATE clients SET
        nom = ?, email = ?, telephone = ?, adresse = ?, siret = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      clientData.nom,
      clientData.email || null,
      clientData.telephone || null,
      clientData.adresse || null,
      clientData.siret || null,
      id
    );

    return result.changes > 0;
  }

  // Supprimer un client
  deleteClient(id) {
    // Vérifier si le client a des factures
    const invoiceCount = this.db.prepare(
      'SELECT COUNT(*) as count FROM factures WHERE client_id = ?'
    ).get(id).count;

    if (invoiceCount > 0) {
      throw new Error('Impossible de supprimer un client qui a des factures associées');
    }

    const stmt = this.db.prepare('DELETE FROM clients WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Obtenir les meilleurs clients par chiffre d'affaires
  getTopClients(limit = 5, dateDebut = null, dateFin = null) {
    let query = `
      SELECT 
        c.id,
        c.nom,
        c.email,
        COUNT(f.id) as invoice_count,
        COALESCE(SUM(f.total_ttc), 0) as total_revenue
      FROM clients c
      INNER JOIN factures f ON c.id = f.client_id
      WHERE f.statut = 'payée'
    `;

    const params = [];

    if (dateDebut) {
      query += ' AND f.date_emission >= ?';
      params.push(dateDebut);
    }

    if (dateFin) {
      query += ' AND f.date_emission <= ?';
      params.push(dateFin);
    }

    query += `
      GROUP BY c.id, c.nom, c.email
      ORDER BY total_revenue DESC
      LIMIT ?
    `;

    params.push(limit);

    return this.db.prepare(query).all(...params);
  }

  // Compter le nombre total de clients
  getClientCount() {
    return this.db.prepare('SELECT COUNT(*) as count FROM clients').get().count;
  }
}
