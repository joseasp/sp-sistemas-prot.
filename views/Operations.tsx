import React, { useState } from 'react';
import { useERP, Order, ServiceType } from '@/context/ERPContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, ChevronRight, Search, Filter, Monitor, Printer, 
  CreditCard, DollarSign, X, CheckCircle, Clock, AlertCircle, 
  ChevronDown, ChevronUp, LayoutList, Calendar as CalendarIcon,
  Utensils, Truck, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Operations() {
  const { orders, cashRegister, openCashRegister, closeCashRegister, updateOrder } = useERP();
  
  // State
  const [dateFilter, setDateFilter] = useState(new Date());
  const [typeFilter, setTypeFilter] = useState<ServiceType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EM_ATENDIMENTO' | 'FINALIZADO'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCashModal, setShowCashModal] = useState<'OPEN' | 'CLOSE' | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isConfigExpanded, setIsConfigExpanded] = useState(true);

  // Derived
  const filteredOrders = orders.filter(order => {
    // Date Filter (Simple day match)
    const orderDate = new Date(order.createdAt);
    const isSameDay = orderDate.getDate() === dateFilter.getDate() &&
                      orderDate.getMonth() === dateFilter.getMonth() &&
                      orderDate.getFullYear() === dateFilter.getFullYear();
    if (!isSameDay) return false;

    // Type Filter
    if (typeFilter !== 'ALL' && order.serviceType !== typeFilter) return false;

    // Search Filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = order.customer?.name.toLowerCase().includes(searchLower);
      const matchesNumber = order.number.toString().includes(searchLower);
      const matchesDetail = order.serviceDetail?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesNumber && !matchesDetail) return false;
    }

    return true;
  });

  const inServiceOrders = filteredOrders.filter(o => o.status === 'EM_ATENDIMENTO');
  const finalizedOrders = filteredOrders.filter(o => o.status === 'FINALIZADO');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header / Operational Panel */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h6 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Operação do dia</h6>
            <h1 className="text-xl font-bold text-rose-700 flex items-center gap-2">
              {format(dateFilter, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h1>
            {dateFilter.getDate() !== new Date().getDate() && (
              <span className="text-xs text-rose-500 font-medium">Dia diferente do atual</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-sm font-medium">
              <Monitor size={16} />
              <span>T: PRINCIPAL</span>
              <ChevronDown size={14} />
            </div>
            
            <button 
              onClick={() => setShowCashModal(cashRegister.isOpen ? 'CLOSE' : 'OPEN')}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                cashRegister.isOpen 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                  : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
              )}
              title={cashRegister.isOpen ? "Fechar Caixa" : "Abrir Caixa"}
            >
              <DollarSign size={20} />
            </button>
            
            <button 
              onClick={() => setIsConfigExpanded(!isConfigExpanded)}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
            >
              {isConfigExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {isConfigExpanded && (
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <button onClick={() => setDateFilter(d => new Date(d.setDate(d.getDate() - 1)))} className="p-1.5 hover:bg-slate-100 rounded-lg"><ChevronLeft size={18} /></button>
              <div className="px-3 py-1.5 bg-slate-100 rounded-lg font-medium text-sm text-slate-700 min-w-[100px] text-center">
                {format(dateFilter, 'dd/MM/yy')}
              </div>
              <button onClick={() => setDateFilter(d => new Date(d.setDate(d.getDate() + 1)))} className="p-1.5 hover:bg-slate-100 rounded-lg"><ChevronRight size={18} /></button>
              <button onClick={() => setDateFilter(new Date())} className="ml-2 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-700">
                Voltar para hoje
              </button>
            </div>

            <div className="flex-1 w-full lg:w-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar (cliente/mesa/comanda/funcionário)" 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {isConfigExpanded && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <FilterBtn label="Todos" active={typeFilter === 'ALL'} onClick={() => setTypeFilter('ALL')} />
            <FilterBtn label="Mesa" active={typeFilter === 'MESA'} onClick={() => setTypeFilter('MESA')} />
            <FilterBtn label="Comanda" active={typeFilter === 'COMANDA'} onClick={() => setTypeFilter('COMANDA')} />
            <FilterBtn label="Balcão" active={typeFilter === 'BALCAO'} onClick={() => setTypeFilter('BALCAO')} />
            <FilterBtn label="Delivery" active={typeFilter === 'DELIVERY'} onClick={() => setTypeFilter('DELIVERY')} />
          </div>
        )}
      </div>

      {/* Main Content: Orders List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        
        {/* Em Atendimento Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2">
              <Clock size={12} /> EM ATENDIMENTO
            </div>
            <span className="text-sm font-medium text-slate-500">{inServiceOrders.length} pedidos</span>
          </div>

          <div className="space-y-3">
            {inServiceOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm italic">Nenhum pedido em atendimento.</div>
            ) : (
              inServiceOrders.map(order => (
                <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
              ))
            )}
          </div>
        </section>

        {/* Finalizados Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2">
              <CheckCircle size={12} /> FINALIZADOS
            </div>
            <span className="text-sm font-medium text-slate-500">{finalizedOrders.length} pedidos</span>
          </div>

          <div className="space-y-3">
            {finalizedOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm italic">Nenhum pedido finalizado.</div>
            ) : (
              finalizedOrders.map(order => (
                <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      {showCashModal === 'OPEN' && (
        <OpenCashModal onClose={() => setShowCashModal(null)} onConfirm={openCashRegister} />
      )}
      {showCashModal === 'CLOSE' && (
        <CloseCashModal onClose={() => setShowCashModal(null)} onConfirm={closeCashRegister} cashRegister={cashRegister} />
      )}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdate={(updates: any) => {
            updateOrder(selectedOrder.id, updates);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

function FilterBtn({ label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
        active ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      )}
    >
      {label}
    </button>
  );
}

function OrderCard({ order, onClick }: { order: Order, onClick: () => void }) {
  const isFinalized = order.status === 'FINALIZADO';
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white p-4 rounded-xl shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-all group",
        isFinalized ? "border-l-emerald-500" : "border-l-amber-500"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", isFinalized ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
            {order.serviceType === 'MESA' && <Utensils size={18} />}
            {order.serviceType === 'BALCAO' && <Monitor size={18} />}
            {order.serviceType === 'DELIVERY' && <Truck size={18} />}
            {order.serviceType === 'COMANDA' && <FileText size={18} />}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">
              {order.serviceType === 'BALCAO' ? 'Balcão' : order.serviceType} 
              {order.serviceDetail ? ` - ${order.serviceDetail}` : ''}
            </h3>
            <p className="text-xs text-slate-500">
              {format(new Date(order.createdAt), 'HH:mm')} • {order.items.length} itens
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-slate-900">R$ {order.total.toFixed(2)}</p>
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1",
            order.paymentStatus === 'PAGO' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
          )}>
            {order.paymentStatus === 'PAGO' ? 'Pago' : 'Não informado'}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
        <p className="text-xs text-slate-400 truncate max-w-[70%]">
          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
        </p>
        {!isFinalized && (
          <button className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1">
            <CheckCircle size={12} /> Marcar pronto
          </button>
        )}
      </div>
    </div>
  );
}

function OpenCashModal({ onClose, onConfirm }: any) {
  const [amount, setAmount] = useState('250');
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
        <h2 className="text-xl font-bold text-amber-900 mb-6">Abrir Caixa</h2>
        
        <div className="space-y-4 mb-8">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500">Responsável</span>
            <span className="text-sm font-bold text-slate-900">José Silva</span>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Valor de abertura</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 font-medium">R$</span>
              <input 
                type="number" 
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">CANCELAR</button>
          <button 
            onClick={() => { onConfirm(parseFloat(amount), 'José Silva'); onClose(); }}
            className="px-6 py-3 bg-amber-400 text-amber-950 font-bold rounded-xl hover:bg-amber-500 shadow-lg shadow-amber-100 transition-all"
          >
            ABRIR
          </button>
        </div>
      </div>
    </div>
  );
}

function CloseCashModal({ onClose, onConfirm, cashRegister }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[500px] shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Fechamento de Caixa</h2>
        
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">Abertura</p>
              <p className="text-lg font-bold text-slate-900">R$ {cashRegister.openingBalance.toFixed(2)}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl">
              <p className="text-xs text-emerald-600 mb-1">Total em Vendas</p>
              <p className="text-lg font-bold text-emerald-900">R$ {(cashRegister.currentBalance - cashRegister.openingBalance).toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
             <div className="bg-rose-50 p-2 rounded-lg text-center">
               <p className="text-[10px] text-rose-600 font-bold uppercase">Sangria</p>
               <p className="font-bold text-rose-900">R$ 0,00</p>
             </div>
             <div className="bg-blue-50 p-2 rounded-lg text-center">
               <p className="text-[10px] text-blue-600 font-bold uppercase">Suprimento</p>
               <p className="font-bold text-blue-900">R$ 0,00</p>
             </div>
             <div className="bg-amber-50 p-2 rounded-lg text-center">
               <p className="text-[10px] text-amber-600 font-bold uppercase">Correção</p>
               <p className="font-bold text-amber-900">R$ 0,00</p>
             </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Conferência</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Dinheiro em Caixa</span>
              <input type="text" className="w-32 p-2 border border-slate-200 rounded-lg text-right" placeholder="0,00" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Cartões</span>
              <input type="text" className="w-32 p-2 border border-slate-200 rounded-lg text-right" placeholder="0,00" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Observações / Justificativa</label>
            <textarea className="w-full p-2 border border-slate-200 rounded-lg h-20 text-sm resize-none"></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">CANCELAR</button>
          <button 
            onClick={() => { onConfirm({}); onClose(); }}
            className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
          >
            FECHAR CAIXA
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailsModal({ order, onClose, onUpdate }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pedido #{order.number}</h2>
            <p className="text-xs text-slate-500">{format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm")}</p>
          </div>
          <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-6 mb-6">
            <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs font-bold text-blue-400 uppercase mb-1">Cliente</p>
              <p className="font-bold text-blue-900">{order.customer?.name || 'Cliente Avulso'}</p>
            </div>
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status</p>
              <p className={cn("font-bold", order.status === 'FINALIZADO' ? "text-emerald-600" : "text-amber-600")}>
                {order.status === 'FINALIZADO' ? 'Finalizado' : 'Em Atendimento'}
              </p>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 mb-4">Itens do Pedido</h3>
          <div className="space-y-2 mb-6">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">
                    {item.quantity}x
                  </span>
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-y-1 flex-col items-end border-t border-slate-100 pt-4">
            <div className="flex justify-between w-64 text-sm text-slate-500">
              <span>Subtotal</span>
              <span>R$ {order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between w-64 text-sm text-emerald-600">
                <span>Desconto</span>
                <span>- R$ {order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between w-64 text-xl font-bold text-slate-900 pt-2">
              <span>Total</span>
              <span>R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex gap-2">
            <button className="p-2 text-slate-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-200" title="Imprimir Cupom">
              <Printer size={20} />
            </button>
            <button className="p-2 text-slate-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-200" title="NFCE">
              <FileText size={20} />
            </button>
          </div>
          
          <div className="flex gap-3">
            {order.status !== 'FINALIZADO' && (
              <>
                <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50">
                  Editar Pedido
                </button>
                <button 
                  onClick={() => onUpdate({ status: 'FINALIZADO', paymentStatus: 'PAGO' })}
                  className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                >
                  Finalizar e Pagar
                </button>
              </>
            )}
            {order.status === 'FINALIZADO' && (
               <button className="px-4 py-2 bg-slate-200 text-slate-500 font-bold rounded-lg cursor-not-allowed">
                 Pedido Finalizado
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
