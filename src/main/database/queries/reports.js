import Database from 'better-sqlite3';

export class ReportQueries {
  constructor(db) {
    this.db = db;
  }

  // Générer un rapport pour une période donnée
  getPeriodReport(dateDebut, dateFin) {
    // Statistiques générales
    const stats = this.db.prepare(`
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN statut = 'payée' THEN 1 END) as paid_invoices,
        COUNT(CASE WHEN statut = 'envoyée' THEN 1 END) as sent_invoices,
        COUNT(CASE WHEN statut = 'brouillon' THEN 1 END) as draft_invoices,
        COUNT(CASE WHEN statut = 'annulée' THEN 1 END) as cancelled_invoices,
        SUM(CASE WHEN statut = 'payée' THEN total_ttc ELSE 0 END) as revenue_ttc,
        SUM(CASE WHEN statut = 'payée' THEN sous_total ELSE 0 END) as revenue_ht,
        SUM(CASE WHEN statut = 'payée' THEN tva_montant ELSE 0 END) as tva_total
      FROM factures
      WHERE date_emission BETWEEN ? AND ?
    `).get(dateDebut, dateFin);

    // Détail des factures de la période
    const invoices = this.db.prepare(`
      SELECT 
        f.id,
        f.numero,
        f.date_emission,
        f.date_echeance,
        f.statut,
        f.total_ttc,
        c.nom as client_nom,
        c.email as client_email
      FROM factures f
      LEFT JOIN clients c ON f.client_id = c.id
      WHERE f.date_emission BETWEEN ? AND ?
      ORDER BY f.date_emission DESC
    `).all(dateDebut, dateFin);

    // Top clients de la période
    const topClients = this.db.prepare(`
      SELECT 
        c.id,
        c.nom,
        c.email,
        COUNT(f.id) as invoice_count,
        COALESCE(SUM(CASE WHEN f.statut = 'payée' THEN f.total_ttc ELSE 0 END), 0) as revenue
      FROM clients c
      INNER JOIN factures f ON c.id = f.client_id
      WHERE f.date_emission BETWEEN ? AND ?
        AND f.statut = 'payée'
      GROUP BY c.id, c.nom, c.email
      ORDER BY revenue DESC
      LIMIT 10
    `).all(dateDebut, dateFin);

    // Évolution mensuelle du CA
    const monthlyRevenue = this.db.prepare(`
      SELECT 
        strftime('%Y-%m', date_emission) as month,
        SUM(CASE WHEN statut = 'payée' THEN total_ttc ELSE 0 END) as revenue,
        COUNT(*) as invoice_count
      FROM factures
      WHERE date_emission BETWEEN ? AND ?
        AND statut = 'payée'
      GROUP BY strftime('%Y-%m', date_emission)
      ORDER BY month
    `).all(dateDebut, dateFin);

    return {
      period: { start: dateDebut, end: dateFin },
      stats,
      invoices,
      topClients,
      monthlyRevenue
    };
  }

  // Obtenir les statistiques pour le dashboard
  getDashboardStats() {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

    // CA du mois en cours
    const currentMonthRevenue = this.db.prepare(`
      SELECT COALESCE(SUM(total_ttc), 0) as revenue
      FROM factures
      WHERE strftime('%Y-%m', date_emission) = ?
        AND statut = 'payée'
    `).get(currentMonth).revenue;

    // CA du mois précédent
    const lastMonthRevenue = this.db.prepare(`
      SELECT COALESCE(SUM(total_ttc), 0) as revenue
      FROM factures
      WHERE strftime('%Y-%m', date_emission) = ?
        AND statut = 'payée'
    `).get(lastMonth).revenue;

    // Factures en attente
    const pendingInvoices = this.db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_ttc), 0) as total
      FROM factures
      WHERE statut = 'envoyée'
    `).get();

    // Factures payées ce mois
    const paidThisMonth = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM factures
      WHERE strftime('%Y-%m', date_emission) = ?
        AND statut = 'payée'
    `).get(currentMonth).count;

    // Total clients actifs
    const activeClients = this.db.prepare(`
      SELECT COUNT(DISTINCT client_id) as count
      FROM factures
    `).get().count;

    // Variation du CA
    const revenueVariation = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    return {
      currentMonthRevenue,
      lastMonthRevenue,
      revenueVariation: parseFloat(revenueVariation),
      pendingInvoices: pendingInvoices.count,
      pendingAmount: pendingInvoices.total,
      paidThisMonth,
      activeClients
    };
  }

  // Obtenir les données pour les graphiques du dashboard
  getChartData() {
    // CA des 6 derniers mois
    const revenueChart = this.db.prepare(`
      SELECT 
        strftime('%Y-%m', date_emission) as month,
        SUM(CASE WHEN statut = 'payée' THEN total_ttc ELSE 0 END) as revenue
      FROM factures
      WHERE date_emission >= date('now', '-6 months')
        AND statut = 'payée'
      GROUP BY strftime('%Y-%m', date_emission)
      ORDER BY month
    `).all();

    // Répartition des statuts
    const statusChart = this.db.prepare(`
      SELECT 
        statut,
        COUNT(*) as count,
        COALESCE(SUM(total_ttc), 0) as total
      FROM factures
      GROUP BY statut
    `).all();

    return {
      revenueChart,
      statusChart
    };
  }

  // Exporter les données pour CSV
  getExportData(dateDebut, dateFin) {
    return this.db.prepare(`
      SELECT 
        f.numero as 'Numéro Facture',
        f.date_emission as 'Date Émission',
        f.date_echeance as 'Date Échéance',
        c.nom as 'Client',
        c.email as 'Email Client',
        f.statut as 'Statut',
        f.sous_total as 'Sous-total HT',
        f.tva_montant as 'Montant TVA',
        f.total_ttc as 'Total TTC',
        f.notes as 'Notes'
      FROM factures f
      LEFT JOIN clients c ON f.client_id = c.id
      WHERE f.date_emission BETWEEN ? AND ?
      ORDER BY f.date_emission DESC
    `).all(dateDebut, dateFin);
  }
}
