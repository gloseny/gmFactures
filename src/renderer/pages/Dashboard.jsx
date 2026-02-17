import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Users, 
  Euro,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '../utils/formatters.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques du dashboard
      const dashboardStats = await window.electronAPI.getDashboardStats();
      setStats(dashboardStats);
      
      // Charger les données des graphiques
      const chartResponse = await window.electronAPI.getChartData();
      setChartData(chartResponse);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!stats || !chartData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <p className="text-secondary">Impossible de charger les données du tableau de bord</p>
        </div>
      </div>
    );
  }

  // Préparer les données pour le graphique linéaire
  const revenueChartData = chartData.revenueChart.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
    revenue: item.revenue,
    invoices: item.invoice_count
  }));

  // Préparer les données pour le graphique circulaire
  const statusChartData = chartData.statusChart.map(item => ({
    name: formatStatus(item.statut),
    value: item.count,
    amount: item.total
  }));

  const COLORS = {
    'Brouillon': '#6b7280',
    'Envoyée': '#3b82f6', 
    'Payée': '#10b981',
    'Annulée': '#ef4444'
  };

  const kpiCards = [
    {
      title: 'Chiffre d\'affaires',
      value: formatCurrency(stats.currentMonthRevenue),
      change: stats.revenueVariation,
      icon: Euro,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Factures en attente',
      value: stats.pendingInvoices,
      subtitle: formatCurrency(stats.pendingAmount),
      icon: AlertCircle,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Factures payées ce mois',
      value: stats.paidThisMonth,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Clients actifs',
      value: stats.activeClients,
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-primary mb-2">Tableau de bord</h1>
        <p className="text-secondary">
          Vue d'ensemble de votre activité facturation
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.change >= 0;
          
          return (
            <div key={index} className="kpi-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                {kpi.change !== undefined && (
                  <div className={`flex items-center text-sm font-medium ${
                    isPositive ? 'text-success' : 'text-danger'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(kpi.change)}%
                  </div>
                )}
              </div>
              
              <div className="kpi-value">{kpi.value}</div>
              <div className="kpi-label">{kpi.title}</div>
              {kpi.subtitle && (
                <div className="text-xs text-secondary mt-1">{kpi.subtitle}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique linéaire - Évolution du CA */}
        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Évolution du chiffre d'affaires
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.style.getPropertyValue('--border')} />
              <XAxis 
                dataKey="month" 
                stroke={document.documentElement.style.getPropertyValue('--text-secondary')}
                tick={{ fill: document.documentElement.style.getPropertyValue('--text-secondary') }}
              />
              <YAxis 
                stroke={document.documentElement.style.getPropertyValue('--text-secondary')}
                tick={{ fill: document.documentElement.style.getPropertyValue('--text-secondary') }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: document.documentElement.style.getPropertyValue('--bg-card'),
                  border: `1px solid ${document.documentElement.style.getPropertyValue('--border')}`,
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(value) : value,
                  name === 'revenue' ? 'CA' : 'Factures'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke={document.documentElement.style.getPropertyValue('--accent')}
                strokeWidth={2}
                dot={{ fill: document.documentElement.style.getPropertyValue('--accent') }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique circulaire - Répartition des statuts */}
        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Répartition des factures par statut
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: document.documentElement.style.getPropertyValue('--bg-card'),
                  border: `1px solid ${document.documentElement.style.getPropertyValue('--border')}`,
                  borderRadius: '8px'
                }}
                formatter={(value, name, props) => [
                  `${value} factures`,
                  props.payload.name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="kpi-card">
        <h3 className="text-lg font-semibold text-primary mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/invoices/new')}
            className="btn btn-primary flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Créer une facture</span>
          </button>
          
          <button
            onClick={() => navigate('/clients/new')}
            className="btn btn-secondary flex items-center justify-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Ajouter un client</span>
          </button>
          
          <button
            onClick={() => navigate('/reports')}
            className="btn btn-outline flex items-center justify-center space-x-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Voir les rapports</span>
          </button>
        </div>
      </div>
    </div>
  );
}
