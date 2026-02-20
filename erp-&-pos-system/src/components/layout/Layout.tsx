import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, ClipboardList, Menu, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">
            E
          </div>
          <span className="hidden lg:block ml-3 font-bold text-lg tracking-tight">ERP System</span>
        </div>

        <nav className="flex-1 py-6 space-y-1 px-2">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/pdv" icon={<ShoppingCart size={20} />} label="PDV" />
          <NavItem to="/operacoes" icon={<ClipboardList size={20} />} label="Operações" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center justify-center lg:justify-start w-full p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
            <Settings size={20} />
            <span className="hidden lg:block ml-3 text-sm font-medium">Configurações</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-center lg:justify-start px-3 py-3 rounded-lg transition-colors group relative",
          isActive
            ? "bg-blue-600 text-white"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        )
      }
    >
      {icon}
      <span className="hidden lg:block ml-3 text-sm font-medium">{label}</span>
      {/* Tooltip for mobile/collapsed */}
      <div className="lg:hidden absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
        {label}
      </div>
    </NavLink>
  );
}
