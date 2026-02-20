import React, { useState } from 'react';
import { Download, Share2, CheckCircle, Clock, Eye, EyeOff, Search, Home, Wifi, Zap, Plus } from 'lucide-react';
import { Button, Input, Drawer, Tabs, Badge, Modal } from '../components/ui';
import { MOCK_CLIENTS, MOCK_STATEMENT, MOCK_PAYABLES } from '../data';
import { Client, PaymentStatus } from '../types';

type FixedAccount = {
  id: string;
  name: string;
  amount: number;
  type: 'Fixo' | 'Variavel';
  icon: 'energy' | 'internet' | 'home' | 'generic';
};

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatMoneyInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const cents = digits.padStart(3, '0');
  const intPart = cents.slice(0, -2);
  const decimalPart = cents.slice(-2);
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${intFormatted},${decimalPart}`;
};

export default function FinanceView() {
  const [activeTab, setActiveTab] = useState('Contas a Receber');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  const [showReceivablesTotal, setShowReceivablesTotal] = useState(false);
  const [showPayablesTotal, setShowPayablesTotal] = useState(false);

  const [receivablesSearch, setReceivablesSearch] = useState('');
  const [receivablesFilter, setReceivablesFilter] = useState<'all' | 'debtors' | 'paid' | 'credit'>('all');

  const handleOpenStatement = (client: Client) => {
    setSelectedClient(client);
    setIsStatementOpen(true);
  };

  const filterClients = (clients: Client[]) => {
    return clients.filter((c) => {
      if (receivablesSearch && !c.name.toLowerCase().includes(receivablesSearch.toLowerCase())) return false;

      if (receivablesFilter === 'debtors') return c.balance > 0;
      if (receivablesFilter === 'paid') return c.balance === 0;
      if (receivablesFilter === 'credit') return c.balance < 0;

      return true;
    });
  };

  const Receivables = () => {
    const filteredClients = filterClients(MOCK_CLIENTS);

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center relative">
          <button onClick={() => setShowReceivablesTotal(!showReceivablesTotal)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            {showReceivablesTotal ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <span className="text-gray-500 text-sm font-medium">Total a Receber</span>
          <span className="text-3xl font-bold text-gray-900 mt-1">{showReceivablesTotal ? 'R$ 606,50' : '********'}</span>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b bg-gray-50 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Carteira de Clientes</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative w-full md:w-64">
                <Input placeholder="Buscar cliente..." icon={<Search size={16} />} value={receivablesSearch} onChange={(e) => setReceivablesSearch(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setReceivablesFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    receivablesFilter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setReceivablesFilter('debtors')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    receivablesFilter === 'debtors' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Devedores
                </button>
                <button
                  onClick={() => setReceivablesFilter('paid')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    receivablesFilter === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Quitados
                </button>
                <button
                  onClick={() => setReceivablesFilter('credit')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    receivablesFilter === 'credit' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Com Credito
                </button>
              </div>
            </div>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Limite</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo Devedor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acao</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{client.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{client.document}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">R$ {client.creditLimit}</td>
                    <td className={`px-6 py-4 text-sm font-bold ${client.balance > 0 ? 'text-red-600' : client.balance < 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                      {client.balance === 0 ? '--' : `R$ ${Math.abs(client.balance).toFixed(2)} ${client.balance < 0 ? '(CR)' : ''}`}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => handleOpenStatement(client)}>
                        Ver Extrato
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const Payables = () => {
    const [payablesTab, setPayablesTab] = useState<'titles' | 'fixed'>('titles');
    const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);
    const [fixedAccounts, setFixedAccounts] = useState<FixedAccount[]>([
      { id: 'f1', name: 'Energia Eletrica', amount: 500, type: 'Variavel', icon: 'energy' },
      { id: 'f2', name: 'Internet Fibra', amount: 129.9, type: 'Fixo', icon: 'internet' },
      { id: 'f3', name: 'Aluguel', amount: 3500, type: 'Fixo', icon: 'home' },
    ]);
    const [fixedForm, setFixedForm] = useState({ name: '', type: 'Fixo' as 'Fixo' | 'Variavel', amount: '0,00', dueDay: '10', notes: '' });

    const resetFixedForm = () => {
      setFixedForm({ name: '', type: 'Fixo', amount: '0,00', dueDay: '10', notes: '' });
    };

    const saveFixedAccount = () => {
      if (!fixedForm.name.trim()) return;
      const parsedAmount = Number(fixedForm.amount.replace(/\./g, '').replace(',', '.')) || 0;
      const icon = fixedForm.name.toLowerCase().includes('internet') ? 'internet' : fixedForm.name.toLowerCase().includes('energia') ? 'energy' : 'generic';

      setFixedAccounts((old) => [
        ...old,
        {
          id: `fixed-${Date.now()}`,
          name: fixedForm.name.trim(),
          amount: parsedAmount,
          type: fixedForm.type,
          icon,
        },
      ]);

      setIsFixedModalOpen(false);
      resetFixedForm();
    };

    const cardIcon = (account: FixedAccount) => {
      if (account.icon === 'energy') return <Zap size={20} />;
      if (account.icon === 'internet') return <Wifi size={20} />;
      if (account.icon === 'home') return <Home size={20} />;
      return <Home size={20} />;
    };

    const cardIconStyle = (account: FixedAccount) => {
      if (account.icon === 'energy') return 'bg-yellow-100 text-yellow-600';
      if (account.icon === 'internet') return 'bg-blue-100 text-blue-600';
      if (account.icon === 'home') return 'bg-indigo-100 text-indigo-600';
      return 'bg-gray-100 text-gray-600';
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center relative">
          <button onClick={() => setShowPayablesTotal(!showPayablesTotal)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            {showPayablesTotal ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <span className="text-gray-500 text-sm font-medium">Total a Pagar</span>
          <span className="text-3xl font-bold text-red-600 mt-1">{showPayablesTotal ? 'R$ 1.700,00' : '********'}</span>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setPayablesTab('titles')}
              className={`flex-1 py-3 text-sm font-medium text-center ${payablesTab === 'titles' ? 'bg-gray-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Titulos a Pagar
            </button>
            <button
              onClick={() => setPayablesTab('fixed')}
              className={`flex-1 py-3 text-sm font-medium text-center ${payablesTab === 'fixed' ? 'bg-gray-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Contas Fixas (Recorrentes)
            </button>
          </div>

          {payablesTab === 'titles' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descricao</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {MOCK_PAYABLES.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(bill.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{bill.supplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{bill.description}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">R$ {bill.value.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <Badge color={bill.status === 'Pago' ? 'green' : 'red'}>{bill.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">{bill.status === 'Aberto' && <Button size="sm" variant="primary">Pagar</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {payablesTab === 'fixed' && (
            <>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fixedAccounts.map((account) => (
                  <div key={account.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-2 rounded-lg ${cardIconStyle(account)}`}>{cardIcon(account)}</div>
                      <Badge color={account.type === 'Fixo' ? 'blue' : 'gray'}>{account.type}</Badge>
                    </div>
                    <h4 className="font-semibold text-gray-900">{account.name}</h4>
                    <p className="text-sm text-gray-500 mb-4">{account.type === 'Variavel' ? 'Estimativa' : 'Valor'}: {formatCurrency(account.amount)}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Lancar Fatura
                    </Button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setIsFixedModalOpen(true)}
                  className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors min-h-[160px]"
                >
                  <Plus size={26} />
                  <span className="mt-2 font-medium">Nova Conta Fixa</span>
                </button>
              </div>

              <Modal isOpen={isFixedModalOpen} onClose={() => setIsFixedModalOpen(false)} title="Nova Conta Fixa" size="md">
                <div className="space-y-4">
                  <Input label="Nome da Conta" value={fixedForm.name} onChange={(e) => setFixedForm((old) => ({ ...old, name: e.target.value }))} />
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">Tipo</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={fixedForm.type}
                      onChange={(e) => setFixedForm((old) => ({ ...old, type: e.target.value as 'Fixo' | 'Variavel' }))}
                    >
                      <option value="Fixo">Fixo</option>
                      <option value="Variavel">Variavel</option>
                    </select>
                  </div>
                  <Input label="Valor Base (R$)" value={fixedForm.amount} onChange={(e) => setFixedForm((old) => ({ ...old, amount: formatMoneyInput(e.target.value) }))} />
                  <Input label="Dia de Vencimento" type="number" value={fixedForm.dueDay} onChange={(e) => setFixedForm((old) => ({ ...old, dueDay: e.target.value }))} />
                  <Input label="Observacoes (Opcional)" value={fixedForm.notes} onChange={(e) => setFixedForm((old) => ({ ...old, notes: e.target.value }))} />

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={() => setIsFixedModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={saveFixedAccount}>Salvar Conta Fixa</Button>
                  </div>
                </div>
              </Modal>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Financeiro</h2>
      <Tabs tabs={['Contas a Receber', 'Contas a Pagar']} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'Contas a Receber' ? <Receivables /> : <Payables />}

      <Drawer isOpen={isStatementOpen} onClose={() => setIsStatementOpen(false)} title={selectedClient ? `Extrato: ${selectedClient.name}` : 'Extrato'}>
        {selectedClient && (
          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg border text-center space-y-2">
              <p className="text-sm text-gray-500">Saldo Devedor Atual</p>
              <p className="text-4xl font-bold text-red-600">R$ {selectedClient.balance.toFixed(2)}</p>
              <div className="flex justify-center gap-2 pt-2">
                <p className="text-xs text-gray-500">Limite: R$ {selectedClient.creditLimit}</p>
                <span className="text-gray-300">|</span>
                <p className="text-xs text-green-600">Disponivel: R$ {(selectedClient.creditLimit || 0) - selectedClient.balance}</p>
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="secondary" size="sm" icon={<Share2 size={14} />}>
                  Zap
                </Button>
                <Button variant="secondary" size="sm" icon={<Download size={14} />}>
                  PDF
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 shadow-sm bg-white">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" /> Receber Pagamento
              </h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Input label="Valor (R$)" defaultValue={selectedClient.balance.toFixed(2)} />
                <div className="flex flex-col">
                  <label className="mb-1 text-xs font-medium text-gray-700">Forma</label>
                  <select className="border-gray-300 border rounded-md p-2 text-sm h-[38px]">
                    <option>Dinheiro</option>
                    <option>Pix</option>
                    <option>Debito</option>
                    <option>Credito</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  <span className="text-xs text-gray-600">Baixar debitos mais antigos automaticamente (FIFO)</span>
                </label>
              </div>
              <Button className="w-full">Confirmar Recebimento</Button>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Clock size={16} /> Ultimas Movimentacoes
              </h4>
              <div className="space-y-3">
                {MOCK_STATEMENT.map((move) => (
                  <div key={move.id} className="border rounded p-3 text-sm relative">
                    <div className="flex justify-between font-medium mb-1">
                      <span>Venda #{move.id}</span>
                      <span>R$ {move.value.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{move.date}</div>
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2">{move.items.join(', ')}</div>
                    <div className="flex justify-end">
                      <Badge color={move.status === PaymentStatus.PAGO ? 'green' : move.status === PaymentStatus.NAO_PAGO ? 'red' : 'gray'}>{move.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
