import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  FileText, 
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  ChevronDown
} from 'lucide-react';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters.js';

export default function ReportPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [showCustomRange, setShowCustomRange] = useState(false);

  // Presets de périodes
  const periodPresets = [
    {
      label: 'Ce mois',
      value: 'current-month',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Mois dernier',
      value: 'last-month',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Ce trimestre',
      value: 'current-quarter',
      getRange: () => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const start = new Date(now.getFullYear(), quarter * 3, 1);
        const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Cette année',
      value: 'current-year',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Personnalisé',
      value: 'custom',
      getRange: () => dateRange
    }
  ];

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getReport(dateRange.start, dateRange.end);
      setReportData(data);
    } catch (error) {
      console.error('Erreur lors du chargement du rapport:', error);
      alert('Erreur lors du chargement du rapport');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (preset) => {
    if (preset.value === 'custom') {
      setShowCustomRange(true);
    } else {
      setShowCustomRange(false);
      const range = preset.getRange();
      setDateRange(range);
    }
  };

  const handleExportPDF = async () => {
    try {
      // Pour l'instant, nous allons juste imprimer la page
      // Dans une version complète, il faudrait utiliser jsPDF
      window.print();
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de l\'export PDF');
    }
  };

  const handleExportCSV = async () => {
    try {
      const exportData = await window.electronAPI.getExportData(dateRange.start, dateRange.end);
      const filename = `rapport-factures-${dateRange.start}-au-${dateRange.end}.csv`;
      exportToCSV(exportData, filename);
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      alert('Erreur lors de l\'export CSV');
    }
  };

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">Génération du rapport...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">Rapports</h1>
          <p className="text-secondary">
            Analysez vos performances et exportez vos données
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exporter CSV</span>
          </button>
          
          <button
            onClick={handleExportPDF}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Exporter PDF</span>
          </button>
        </div>
      </div>

      {/* Sélecteur de période */}
      <div className="kpi-card">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Période d'analyse
        </h3>
        
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {periodPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePeriodChange(preset)}
                className={`btn ${
                  !showCustomRange && 
                  dateRange.start === preset.getRange().start && 
                  dateRange.end === preset.getRange().end
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom range */}
          {showCustomRange && (
            <div className="flex items-center space-x-4">
              <div>
                <label className="form-label">Date de début</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Date de fin</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {reportData && (
        <>
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="kpi-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">Total factures</p>
                  <p className="text-2xl font-bold text-primary">{reportData.stats.total_invoices}</p>
                </div>
                <FileText className="w-8 h-8 text-accent opacity-20" />
              </div>
            </div>
            
            <div className="kpi-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">Chiffre d'affaires HT</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(reportData.stats.revenue_ht)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-success opacity-20" />
              </div>
            </div>
            
            <div className="kpi-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">Montant TVA</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(reportData.stats.tva_total)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-warning opacity-20" />
              </div>
            </div>
            
            <div className="kpi-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary">Chiffre d'affaires TTC</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(reportData.stats.revenue_ttc)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent opacity-20" />
              </div>
            </div>
          </div>

          {/* Répartition par statut */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="kpi-card">
              <h3 className="text-lg font-semibold text-primary mb-4">Répartition par statut</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Brouillons</span>
                  <span className="font-medium">{reportData.stats.draft_invoices}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Envoyées</span>
                  <span className="font-medium">{reportData.stats.sent_invoices}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Payées</span>
                  <span className="font-medium text-success">{reportData.stats.paid_invoices}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Annulées</span>
                  <span className="font-medium text-danger">{reportData.stats.cancelled_invoices}</span>
                </div>
              </div>
            </div>

            {/* Top clients */}
            <div className="kpi-card">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Top clients
              </h3>
              <div className="space-y-3">
                {reportData.topClients.length === 0 ? (
                  <p className="text-secondary text-center py-4">Aucun client sur cette période</p>
                ) : (
                  reportData.topClients.map((client, index) => (
                    <div key={client.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center text-xs font-medium text-accent">
                          {index + 1}
                        </span>
                        <span className="text-sm">{client.nom}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(client.revenue)}</div>
                        <div className="text-xs text-secondary">{client.invoice_count} factures</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tableau détaillé */}
          <div className="kpi-card">
            <h3 className="text-lg font-semibold text-primary mb-4">Détail des factures</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Statut</th>
                    <th className="text-right">Total TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.invoices.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-secondary">
                        Aucune facture sur cette période
                      </td>
                    </tr>
                  ) : (
                    reportData.invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="font-medium">{invoice.numero}</td>
                        <td>{formatDate(invoice.date_emission)}</td>
                        <td>{invoice.client_nom}</td>
                        <td>
                          <span className={`badge badge-${invoice.statut}`}>
                            {invoice.statut === 'brouillon' && 'Brouillon'}
                            {invoice.statut === 'envoyée' && 'Envoyée'}
                            {invoice.statut === 'payée' && 'Payée'}
                            {invoice.statut === 'annulée' && 'Annulée'}
                          </span>
                        </td>
                        <td className="text-right font-medium">
                          {formatCurrency(invoice.total_ttc)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
