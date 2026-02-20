import React, { useState } from 'react';
import { Package, Users, ShoppingCart, DollarSign, FileText, BarChart, Settings, LogOut, Menu, LayoutDashboard, MonitorSmartphone, ClipboardList } from 'lucide-react';
import ProductsView from './views/Products';
import StockView from './views/Stock';
import FinanceView from './views/Finance';
import FiscalView from './views/Fiscal';
import { ClientsView, SettingsView } from './views/GeneralViews';
import DashboardView from './views/Dashboard';
import POSView from './views/POS';
import OperationsView from './views/Operations';
import ReportsView from './views/Reports';

type ViewName = 'dashboard' | 'pdv' | 'operations' | 'products' | 'clients' | 'stock' | 'finance' | 'fiscal' | 'reports' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewName>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'pdv', label: 'PDV', icon: <MonitorSmartphone size={20} /> },
    { id: 'operations', label: 'Operações', icon: <ClipboardList size={20} /> },
    { id: 'products', label: 'Produtos', icon: <Package size={20} /> },
    { id: 'clients', label: 'Clientes', icon: <Users size={20} /> },
    { id: 'stock', label: 'Compras & Estoque', icon: <ShoppingCart size={20} /> },
    { id: 'finance', label: 'Financeiro', icon: <DollarSign size={20} /> },
    { id: 'fiscal', label: 'Fiscal', icon: <FileText size={20} /> },
    { id: 'reports', label: 'Relatórios', icon: <BarChart size={20} /> },
    { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'pdv': return <POSView />;
      case 'operations': return <OperationsView />;
      case 'products': return <ProductsView />;
      case 'clients': return <ClientsView />;
      case 'stock': return <StockView />;
      case 'finance': return <FinanceView />;
      case 'fiscal': return <FiscalView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-gray-900">
      
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-20`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold text-indigo-700 tracking-tight">SP Sistemas</h1>
          ) : (
            <span className="text-xl font-bold text-indigo-700">S</span>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewName)}
              className={`
                w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors
                ${currentView === item.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                ${!isSidebarOpen && 'justify-center'}
              `}
              title={!isSidebarOpen ? item.label : ''}
            >
              {item.icon}
              {isSidebarOpen && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 rounded-lg transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-3">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header / Breadcrumbs placeholder */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
           <div className="flex items-center">
             <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 text-gray-500 mr-4">
                <Menu size={20} />
             </button>
             <h2 className="text-lg font-semibold text-gray-800 capitalize">{navItems.find(n => n.id === currentView)?.label}</h2>
           </div>
           <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Olá, <strong>Operador</strong></span>
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">OP</div>
           </div>
        </header>

        <main className="flex-1 overflow-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
