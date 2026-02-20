import React from 'react';
import { useERP } from '@/context/ERPContext';
import { DollarSign, ShoppingBag, Users, TrendingUp, AlertTriangle, CalendarClock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { orders, cashRegister } = useERP();

  const totalSales = orders.reduce((acc, order) => acc + order.total, 0);
  const activeOrders = orders.filter((o) => o.status === 'EM_ATENDIMENTO').length;

  const data = [
    { name: 'Seg', vendas: 4000 },
    { name: 'Ter', vendas: 3000 },
    { name: 'Qua', vendas: 2000 },
    { name: 'Qui', vendas: 2780 },
    { name: 'Sex', vendas: 1890 },
    { name: 'Sab', vendas: 2390 },
    { name: 'Dom', vendas: 3490 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Visão geral do seu negócio hoje.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Avisos</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-900">Certificado ausente, adicione para conseguir emitir documentos fiscais.</p>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <CalendarClock size={18} className="text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-900">Sua conta de luz está com vencimento previsto para amanhã.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Vendas Totais" value={`R$ ${totalSales.toFixed(2)}`} icon={<DollarSign className="text-emerald-500" />} trend="+12.5%" trendUp={true} />
        <StatCard title="Pedidos Ativos" value={activeOrders.toString()} icon={<ShoppingBag className="text-blue-500" />} trend="Atual" trendUp={true} />
        <StatCard title="Caixa Atual" value={`R$ ${cashRegister.currentBalance.toFixed(2)}`} icon={<TrendingUp className="text-amber-500" />} trend="Aberto" trendUp={true} />
        <StatCard title="Novos Clientes" value="12" icon={<Users className="text-purple-500" />} trend="+2" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Vendas da Semana</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Atividade Recente</h3>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn('w-2 h-2 rounded-full', order.status === 'FINALIZADO' ? 'bg-emerald-500' : 'bg-amber-500')} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Pedido #{order.number}</p>
                    <p className="text-xs text-slate-500">{order.serviceType}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-900">R$ {order.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
        <span className={cn('text-xs font-medium px-2 py-1 rounded-full', trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
          {trend}
        </span>
      </div>
    </div>
  );
}
