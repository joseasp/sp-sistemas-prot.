import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Calendar, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  ChevronDown,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Mock Data ---
const salesData = [
  { name: 'Jan', revenue: 4000, profit: 2400, orders: 240 },
  { name: 'Feb', revenue: 3000, profit: 1398, orders: 198 },
  { name: 'Mar', revenue: 2000, profit: 9800, orders: 580 },
  { name: 'Apr', revenue: 2780, profit: 3908, orders: 290 },
  { name: 'May', revenue: 1890, profit: 4800, orders: 480 },
  { name: 'Jun', revenue: 2390, profit: 3800, orders: 380 },
  { name: 'Jul', revenue: 3490, profit: 4300, orders: 430 },
];

const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Clothing', value: 300 },
  { name: 'Home', value: 300 },
  { name: 'Books', value: 200 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const recentTransactions = [
  { id: '#TRX-9821', customer: 'Alice Johnson', date: '2023-10-24', amount: '$120.50', status: 'Completed', method: 'Credit Card' },
  { id: '#TRX-9822', customer: 'Bob Smith', date: '2023-10-24', amount: '$85.00', status: 'Pending', method: 'PayPal' },
  { id: '#TRX-9823', customer: 'Charlie Brown', date: '2023-10-23', amount: '$230.00', status: 'Completed', method: 'Credit Card' },
  { id: '#TRX-9824', customer: 'Diana Ross', date: '2023-10-23', amount: '$45.00', status: 'Refunded', method: 'Debit Card' },
  { id: '#TRX-9825', customer: 'Evan Wright', date: '2023-10-22', amount: '$560.00', status: 'Completed', method: 'Bank Transfer' },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button 
    className={cn(
      "flex items-center w-full px-4 py-3 text-sm font-medium transition-colors rounded-lg group",
      active 
        ? "bg-blue-50 text-blue-600" 
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    <Icon className={cn("w-5 h-5 mr-3", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
    {label}
  </button>
);

const StatCard = ({ title, value, change, trend, icon: Icon }: { title: string, value: string, change: string, trend: 'up' | 'down', icon: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-slate-50 rounded-lg">
        <Icon className="w-6 h-6 text-slate-600" />
      </div>
      <span className={cn(
        "flex items-center text-xs font-medium px-2 py-1 rounded-full",
        trend === 'up' ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
      )}>
        {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {change}
      </span>
    </div>
    <h3 className="text-sm font-medium text-slate-500">{title}</h3>
    <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
  </motion.div>
);

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:static lg:translate-x-0",
        !sidebarOpen && "-translate-x-full"
      )}>
        <div className="flex items-center justify-center h-16 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-slate-900">ERP<span className="text-blue-600">Pro</span></span>
          </div>
        </div>

        <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Main
          </div>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem icon={DollarSign} label="Relatórios" active />
          <SidebarItem icon={ShoppingCart} label="Vendas" />
          <SidebarItem icon={Package} label="Produtos" />
          <SidebarItem icon={Users} label="Clientes" />
          
          <div className="mt-8 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            System
          </div>
          <SidebarItem icon={Settings} label="Configurações" />
          <SidebarItem icon={LogOut} label="Sair" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar relatórios..." 
                className="pl-10 pr-4 py-2 w-64 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
              <img src="https://picsum.photos/seed/admin/40/40" alt="Admin" className="w-8 h-8 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900">Carlos Silva</p>
                <p className="text-xs text-slate-500">Gerente</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Relatórios de Vendas</h1>
                <p className="text-slate-500 mt-1">Visão geral do desempenho financeiro da loja.</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                  <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                  Últimos 30 dias
                </button>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Receita Total" 
                value="R$ 124.500,00" 
                change="+12.5%" 
                trend="up" 
                icon={DollarSign} 
              />
              <StatCard 
                title="Lucro Líquido" 
                value="R$ 45.200,00" 
                change="+8.2%" 
                trend="up" 
                icon={TrendingUp} 
              />
              <StatCard 
                title="Pedidos" 
                value="1,240" 
                change="-2.1%" 
                trend="down" 
                icon={ShoppingCart} 
              />
              <StatCard 
                title="Ticket Médio" 
                value="R$ 100,40" 
                change="+4.3%" 
                trend="up" 
                icon={CreditCard} 
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Receita vs Lucro</h3>
                  <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                      <CartesianGrid vertical={false} stroke="#f1f5f9" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Receita" />
                      <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Lucro" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Secondary Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Vendas por Categoria</h3>
                <div className="h-64 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-900">1.2k</span>
                    <span className="text-xs text-slate-500">Total Items</span>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {categoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-medium text-slate-900">{((item.value / 1200) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Data Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Transações Recentes</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Ver todas</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Cliente</th>
                      <th className="px-6 py-3">Data</th>
                      <th className="px-6 py-3">Valor</th>
                      <th className="px-6 py-3">Método</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentTransactions.map((trx) => (
                      <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{trx.id}</td>
                        <td className="px-6 py-4 text-slate-600">{trx.customer}</td>
                        <td className="px-6 py-4 text-slate-500">{trx.date}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{trx.amount}</td>
                        <td className="px-6 py-4 text-slate-500">{trx.method}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium",
                            trx.status === 'Completed' && "bg-emerald-50 text-emerald-700",
                            trx.status === 'Pending' && "bg-amber-50 text-amber-700",
                            trx.status === 'Refunded' && "bg-rose-50 text-rose-700",
                          )}>
                            {trx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-slate-600">
                            <Settings className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
}
