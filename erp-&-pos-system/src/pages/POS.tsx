import React, { useState, useEffect } from 'react';
import { useERP, ServiceType, Order, OrderItem, Customer } from '@/context/ERPContext';
import { Search, Plus, Trash2, User, CreditCard, Calendar, Clock, ChevronDown, Monitor, Utensils, FileText, Truck, X, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function POS() {
  const { products, customers, addOrder, addCustomer } = useERP();
  
  // State
  const [serviceType, setServiceType] = useState<ServiceType>('BALCAO');
  const [serviceDetail, setServiceDetail] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAnonymousCustomer, setIsAnonymousCustomer] = useState(false);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [observations, setObservations] = useState('');
  const [discount, setDiscount] = useState<{ type: 'value' | 'percent', value: number }>({ type: 'value', value: 0 });
  const [orderDate, setOrderDate] = useState(new Date());

  // Derived
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountValue = discount.type === 'value' ? discount.value : (subtotal * discount.value / 100);
  const total = Math.max(0, subtotal - discountValue);

  // Handlers
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: Math.random().toString(36).substr(2, 9), productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleSubmitOrder = () => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      number: Math.floor(Math.random() * 1000) + 1000,
      status: 'EM_ATENDIMENTO',
      serviceType,
      serviceDetail,
      customer: isAnonymousCustomer ? null : selectedCustomer,
      items: cart,
      subtotal,
      discount: discountValue,
      total,
      payments: [],
      paymentStatus: 'NAO_INFORMADO',
      createdAt: orderDate,
      observations
    };
    addOrder(newOrder);
    // Reset form
    setCart([]);
    setServiceType('BALCAO');
    setServiceDetail('');
    setSelectedCustomer(null);
    setObservations('');
    alert('Pedido lançado com sucesso!');
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));

  return (
    <div className="flex h-full bg-slate-100 overflow-hidden">
      {/* Left: Product Catalog */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
          <Search className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar produtos..." 
            className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-start text-left group border border-transparent hover:border-blue-500"
            >
              <div className="w-full aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-300 transition-colors">
                <ShoppingBag size={32} />
              </div>
              <h3 className="font-semibold text-slate-800 line-clamp-2">{product.name}</h3>
              <p className="text-blue-600 font-bold mt-auto">R$ {product.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Order Panel */}
      <div className="w-96 bg-white shadow-xl flex flex-col border-l border-slate-200 z-10">
        {/* Header: Service Type */}
        <div className="p-4 border-b border-slate-100">
          <div className="grid grid-cols-4 gap-2 mb-4">
            <ServiceTypeBtn type="MESA" icon={<Utensils size={16} />} active={serviceType === 'MESA'} onClick={() => setServiceType('MESA')} />
            <ServiceTypeBtn type="COMANDA" icon={<FileText size={16} />} active={serviceType === 'COMANDA'} onClick={() => setServiceType('COMANDA')} />
            <ServiceTypeBtn type="BALCAO" icon={<Monitor size={16} />} active={serviceType === 'BALCAO'} onClick={() => setServiceType('BALCAO')} />
            <ServiceTypeBtn type="DELIVERY" icon={<Truck size={16} />} active={serviceType === 'DELIVERY'} onClick={() => setServiceType('DELIVERY')} />
          </div>
          
          {serviceType === 'MESA' && (
            <input 
              type="text" 
              placeholder="Número/Nome da Mesa" 
              className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500"
              value={serviceDetail}
              onChange={e => setServiceDetail(e.target.value)}
            />
          )}
          {serviceType === 'DELIVERY' && (
            <input 
              type="text" 
              placeholder="Endereço de entrega" 
              className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500"
              value={serviceDetail}
              onChange={e => setServiceDetail(e.target.value)}
            />
          )}
        </div>

        {/* Customer Section */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Avulso</span>
              <button 
                onClick={() => setIsAnonymousCustomer(!isAnonymousCustomer)}
                className={cn("w-8 h-4 rounded-full transition-colors relative", isAnonymousCustomer ? "bg-blue-500" : "bg-slate-300")}
              >
                <div className={cn("w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all", isAnonymousCustomer ? "left-4.5" : "left-0.5")} />
              </button>
            </div>
          </div>
          
          {!isAnonymousCustomer && (
            <div className="relative">
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-900">
                  <span className="text-sm font-medium">{selectedCustomer.name}</span>
                  <button onClick={() => setSelectedCustomer(null)} className="text-blue-400 hover:text-blue-600"><X size={16} /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="Buscar cliente..." 
                      className="w-full p-2 pl-8 bg-white rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500"
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                    />
                    <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                    {customerSearch && (
                      <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-1 border border-slate-100 max-h-40 overflow-y-auto z-20">
                        {filteredCustomers.map(c => (
                          <button 
                            key={c.id} 
                            className="w-full text-left p-2 hover:bg-slate-50 text-sm"
                            onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowNewCustomerModal(true)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingBag size={48} className="mb-2 opacity-20" />
              <p className="text-sm">Carrinho vazio</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 group">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">R$ {item.price.toFixed(2)} un.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-white rounded shadow-sm">-</button>
                  <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-white rounded shadow-sm">+</button>
                </div>
                <div className="text-right min-w-[60px]">
                  <p className="text-sm font-semibold text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-xs text-rose-500 opacity-0 group-hover:opacity-100 hover:underline">Remover</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Totals & Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          {/* Discount & Date */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Clock size={14} />
              {format(orderDate, 'HH:mm')}
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Calendar size={14} />
              {format(orderDate, 'dd/MM')}
            </button>
          </div>
          
          <textarea 
            placeholder="Observações do pedido..." 
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none resize-none h-16"
            value={observations}
            onChange={e => setObservations(e.target.value)}
          />

          <div className="space-y-1 pt-2 border-t border-slate-200">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Desconto</span>
              <span className="text-emerald-600">- R$ {discountValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-900 pt-2">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="p-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Pagamento
            </button>
            <button 
              onClick={handleSubmitOrder}
              disabled={cart.length === 0}
              className="p-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
            >
              Lançar Pedido
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewCustomerModal && (
        <NewCustomerModal onClose={() => setShowNewCustomerModal(false)} onSave={addCustomer} />
      )}
      {showPaymentModal && (
        <PaymentModal 
          total={total} 
          onClose={() => setShowPaymentModal(false)} 
          items={cart}
        />
      )}
    </div>
  );
}

function ServiceTypeBtn({ type, icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-2 rounded-lg transition-all gap-1",
        active ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-1" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold">{type}</span>
    </button>
  );
}

function NewCustomerModal({ onClose, onSave }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
        <h2 className="text-lg font-bold mb-4">Novo Cliente</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Nome</label>
            <input 
              type="text" 
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Telefone</label>
            <input 
              type="text" 
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
          <button 
            onClick={() => {
              onSave({ id: Math.random().toString(), name, phone });
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ total, onClose, items }: any) {
  const [splitType, setSplitType] = useState<'PERCENT' | 'VALUE' | 'ITEMS'>('PERCENT');
  const [payersCount, setPayersCount] = useState(1);
  const [payers, setPayers] = useState<any[]>([{ id: 1, amount: total, paid: false }]);

  const handleSplitEqually = () => {
    const amountPerPerson = total / payersCount;
    setPayers(Array(payersCount).fill(0).map((_, i) => ({
      id: i + 1,
      amount: amountPerPerson,
      paid: false
    })));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Pagamento dividido</h2>
            <p className="text-sm text-slate-500">Divida o total entre os pagadores.</p>
          </div>
          <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-100 flex gap-4 overflow-x-auto">
          <button 
            onClick={() => setSplitType('PERCENT')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap", splitType === 'PERCENT' ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-200")}
          >
            POR PORCENTAGEM
          </button>
          <button 
            onClick={() => setSplitType('VALUE')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap", splitType === 'VALUE' ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-200")}
          >
            POR VALOR
          </button>
          <button 
            onClick={() => setSplitType('ITEMS')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap", splitType === 'ITEMS' ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-200")}
          >
            POR ITENS
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-end gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Qtd. pagadores</label>
              <input 
                type="number" 
                min="1"
                className="w-24 p-2 border border-slate-300 rounded-lg"
                value={payersCount}
                onChange={e => setPayersCount(parseInt(e.target.value) || 1)}
              />
            </div>
            <button 
              onClick={handleSplitEqually}
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg uppercase tracking-wide"
            >
              Dividir Igualmente
            </button>
          </div>

          <div className="space-y-4">
            {payers.map((payer, idx) => (
              <div key={payer.id} className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800">Pagador {idx + 1}</h3>
                  <span className="font-bold text-slate-900">R$ {payer.amount.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <select className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-sm">
                    <option>Cliente cadastrado</option>
                    <option>Cliente Avulso</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-5 bg-slate-300 rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                    </div>
                    <span className="text-sm text-slate-600">Cliente avulso</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Formas do Pagador</span>
                    <button className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Plus size={12} /> ADICIONAR FORMA
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <select className="flex-1 p-2 border border-slate-200 rounded-lg text-sm">
                      <option>Dinheiro</option>
                      <option>Cartão Crédito</option>
                      <option>Cartão Débito</option>
                      <option>Pix</option>
                    </select>
                    <div className="relative w-32">
                      <span className="absolute left-2 top-2 text-xs text-slate-400">Valor</span>
                      <input type="text" value={`R$ ${payer.amount}`} className="w-full p-2 pt-4 border border-slate-200 rounded-lg text-sm font-medium" readOnly />
                    </div>
                    <button className="text-rose-400 hover:text-rose-600"><X size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">CANCELAR</button>
          <button onClick={onClose} className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-200">CONFIRMAR</button>
        </div>
      </div>
    </div>
  );
}
