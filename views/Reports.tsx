import React from 'react';
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Settings,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

const dadosVendas = [
  { nome: 'Jan', receita: 4000, lucro: 2400 },
  { nome: 'Fev', receita: 3000, lucro: 1398 },
  { nome: 'Mar', receita: 2000, lucro: 1800 },
  { nome: 'Abr', receita: 2780, lucro: 1908 },
  { nome: 'Mai', receita: 1890, lucro: 1400 },
  { nome: 'Jun', receita: 2390, lucro: 1800 },
  { nome: 'Jul', receita: 3490, lucro: 2300 },
];

const dadosCategorias = [
  { nome: 'Bebidas', valor: 420 },
  { nome: 'Lanches', valor: 330 },
  { nome: 'Porções', valor: 260 },
  { nome: 'Sobremesas', valor: 190 },
];

const CORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const transacoesRecentes = [
  { id: '#TRX-9821', cliente: 'Ana Souza', data: '24/10/2023', valor: 'R$ 120,50', status: 'Concluída', metodo: 'Cartão de Crédito' },
  { id: '#TRX-9822', cliente: 'Bruno Lima', data: '24/10/2023', valor: 'R$ 85,00', status: 'Pendente', metodo: 'Pix' },
  { id: '#TRX-9823', cliente: 'Carlos Melo', data: '23/10/2023', valor: 'R$ 230,00', status: 'Concluída', metodo: 'Cartão de Crédito' },
  { id: '#TRX-9824', cliente: 'Daniela Rocha', data: '23/10/2023', valor: 'R$ 45,00', status: 'Estornada', metodo: 'Cartão de Débito' },
  { id: '#TRX-9825', cliente: 'Eduardo Nunes', data: '22/10/2023', valor: 'R$ 560,00', status: 'Concluída', metodo: 'Transferência Bancária' },
];

function StatCard({
  titulo,
  valor,
  variacao,
  tendencia,
  icon,
}: {
  titulo: string;
  valor: string;
  variacao: string;
  tendencia: 'alta' | 'baixa';
  icon: React.ReactNode;
}) {
  return (
    <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
        <span
          className={cn(
            'flex items-center text-xs font-medium px-2 py-1 rounded-full',
            tendencia === 'alta' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50',
          )}
        >
          {tendencia === 'alta' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {variacao}
        </span>
      </div>
      <h3 className="text-sm font-medium text-slate-500">{titulo}</h3>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{valor}</p>
    </div>
  );
}

export default function Reports() {
  return (
    <div className="p-6 space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard titulo="Receita Total" valor="R$ 124.500,00" variacao="+12,5%" tendencia="alta" icon={<DollarSign className="w-6 h-6 text-slate-600" />} />
        <StatCard titulo="Lucro Líquido" valor="R$ 45.200,00" variacao="+8,2%" tendencia="alta" icon={<TrendingUp className="w-6 h-6 text-slate-600" />} />
        <StatCard titulo="Pedidos" valor="1.240" variacao="-2,1%" tendencia="baixa" icon={<ShoppingCart className="w-6 h-6 text-slate-600" />} />
        <StatCard titulo="Ticket Médio" valor="R$ 100,40" variacao="+4,3%" tendencia="alta" icon={<CreditCard className="w-6 h-6 text-slate-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Receita x Lucro</h3>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosVendas} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="receita" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorReceita)" name="Receita" />
                <Area type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLucro)" name="Lucro" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Vendas por Categoria</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dadosCategorias} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="valor">
                  {dadosCategorias.map((item, index) => (
                    <Cell key={item.nome} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">1,2k</span>
              <span className="text-xs text-slate-500">Itens totais</span>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {dadosCategorias.map((item, index) => (
              <div key={item.nome} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: CORES[index % CORES.length] }} />
                  <span className="text-slate-600">{item.nome}</span>
                </div>
                <span className="font-medium text-slate-900">{((item.valor / 1200) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
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
              {transacoesRecentes.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{trx.id}</td>
                  <td className="px-6 py-4 text-slate-600">{trx.cliente}</td>
                  <td className="px-6 py-4 text-slate-500">{trx.data}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{trx.valor}</td>
                  <td className="px-6 py-4 text-slate-500">{trx.metodo}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium',
                        trx.status === 'Concluída' && 'bg-emerald-50 text-emerald-700',
                        trx.status === 'Pendente' && 'bg-amber-50 text-amber-700',
                        trx.status === 'Estornada' && 'bg-rose-50 text-rose-700',
                      )}
                    >
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
      </div>
    </div>
  );
}
