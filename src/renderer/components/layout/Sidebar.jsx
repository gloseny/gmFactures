import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  ChartBar, 
  Settings,
  Building2
} from 'lucide-react';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { name: 'Factures', href: '/invoices', icon: FileText },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Rapports', href: '/reports', icon: ChartBar },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-custom">
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-accent" />
          <div>
            <h1 className="text-lg font-bold text-primary">gmFactures</h1>
            <p className="text-xs text-secondary">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-custom">
        <div className="text-xs text-secondary text-center">
          © 2026 G-MANAGER
        </div>
      </div>
    </div>
  );
}
