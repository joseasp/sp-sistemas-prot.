import React, { useMemo, useState } from 'react';
import { Download, FileCheck, FileText, Filter, Info, Loader2, CheckCircle2, XCircle, Printer, RefreshCw } from 'lucide-react';
import { Badge, Button, Input, Modal, Tabs } from '../components/ui';

type ScopeMode = 'mode_a' | 'mode_b';
type GenerationState = 'idle' | 'generating' | 'ready' | 'failed';
type FiscalDocumentStatus = 'Autorizada' | 'Cancelada' | 'Pendente' | 'Contingencia';
type FiscalOperation = 'saida' | 'entrada';

type FiscalDocument = {
  id: string;
  issuedAt: string;
  operation: FiscalOperation;
  model: '55' | '65';
  number: string;
  series: string;
  party: string;
  value: number;
  status: FiscalDocumentStatus;
  sefazUpdatedAt: string;
};

const STEP_LABELS = ['1. Coletando dados', '2. Gerando PDFs', '3. Compactando ZIP'];
const PAYMENT_DATA: [string, number][] = [
  ['Dinheiro', 5000],
  ['PIX', 8000],
  ['Cartao Debito', 7000],
  ['Cartao Credito', 5000],
  ['Outros', 250],
];

const currency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const safeStorage = (k: string, f: string) => (typeof window === 'undefined' ? f : window.localStorage.getItem(k) || f);
const slugify = (v: string) => v.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
const scopeLabel = (m: ScopeMode) => (m === 'mode_a' ? 'Modo Fiscal (NF-e/NFC-e)' : 'Modo Interno (Geral)');
const confidenceLevel = (c: number) =>
  c >= 95
    ? { level: 1, name: 'Alta (Fiscal)', color: '#28A745' }
    : c >= 85
      ? { level: 2, name: 'Boa (Fiscal + Estimada)', color: '#007BFF' }
      : c >= 60
        ? { level: 3, name: 'Regular (Misto)', color: '#FFC107' }
        : { level: 4, name: 'Baixa (Incompleto)', color: '#DC3545' };

const formatDateTime = (value: string) => new Date(value).toLocaleString('pt-BR');

export default function FiscalView() {
  const [activeTab, setActiveTab] = useState('Painel & PendÃªncias');
  const [monthRef, setMonthRef] = useState('2026-01');
  const [scopeMode, setScopeMode] = useState<ScopeMode>('mode_b');
  const [exportType, setExportType] = useState<'complete' | 'custom'>('complete');
  const [customSalesScope, setCustomSalesScope] = useState<'all' | 'fiscal_only'>('all');
  const [paymentMethods, setPaymentMethods] = useState({ money: true, pix: true, debit: true, credit: true, others: true });
  const [includeInbound, setIncludeInbound] = useState(true);
  const [includeOutbound, setIncludeOutbound] = useState(true);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [genState, setGenState] = useState<GenerationState>('idle');
  const [genStep, setGenStep] = useState(0);
  const [genError, setGenError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [requestId, setRequestId] = useState('');

  const [documents, setDocuments] = useState<FiscalDocument[]>([
    { id: 'd1', issuedAt: '2026-01-27T14:30:00', operation: 'saida', model: '65', number: '00001023', series: '1', party: 'Consumidor Final', value: 150, status: 'Autorizada', sefazUpdatedAt: '2026-01-27T14:31:00' },
    { id: 'd2', issuedAt: '2026-01-27T10:10:00', operation: 'saida', model: '55', number: '00000098', series: '1', party: 'Joao Silva', value: 540, status: 'Autorizada', sefazUpdatedAt: '2026-01-27T10:20:00' },
    { id: 'd3', issuedAt: '2026-01-12T09:15:00', operation: 'entrada', model: '55', number: '0044512', series: '3', party: 'Atacadao de Bebidas LTDA', value: 1250, status: 'Autorizada', sefazUpdatedAt: '2026-01-12T09:20:00' },
    { id: 'd4', issuedAt: '2026-01-09T19:10:00', operation: 'saida', model: '65', number: '00000910', series: '1', party: 'Consumidor Final', value: 89.9, status: 'Cancelada', sefazUpdatedAt: '2026-01-09T19:25:00' },
  ]);
  const [docSearch, setDocSearch] = useState('');
  const [docOperationFilter, setDocOperationFilter] = useState<'all' | FiscalOperation>('all');
  const [docStatusFilter, setDocStatusFilter] = useState<'all' | FiscalDocumentStatus>('all');
  const [docNotice, setDocNotice] = useState('');

  const companyName = safeStorage('sp_company_name', 'Restaurante Silva LTDA');
  const companyCnpj = safeStorage('sp_company_cnpj', '12.345.678/0001-90');
  const companyIe = safeStorage('sp_company_ie', 'ISENTO');
  const companyFantasy = safeStorage('sp_company_fantasy_name', 'restaurante-silva');

  const classes = useMemo(() => (scopeMode === 'mode_a' ? { F: 25000, E: 0, P: 0, Z: 0 } : { F: 21000, E: 3200, P: 1200, Z: 800 }), [scopeMode]);
  const totalRevenue = classes.F + classes.E + classes.P + classes.Z;
  const confidence = useMemo(() => ((classes.F * 1 + classes.E * 0.85 + classes.P * 0.5 + classes.Z * 0) / totalRevenue) * 100, [classes, totalRevenue]);
  const level = confidenceLevel(confidence);

  const pgdasRows = useMemo(() => (
    scopeMode === 'mode_a'
      ? [
          { label: 'Receita Normal', receita: 15000 },
          { label: 'Receita com ST', receita: 5000 },
          { label: 'Receita Monofasica', receita: 3000 },
          { label: 'Monofasica + ST', receita: 2000 },
        ]
      : [
          { label: 'Receita Normal', receita: 15800 },
          { label: 'Receita com ST', receita: 5200 },
          { label: 'Receita Monofasica', receita: 3400 },
          { label: 'Monofasica + ST', receita: 1800 },
        ]
  ), [scopeMode]);

  const paymentLines = useMemo(() => {
    if (exportType === 'complete') return PAYMENT_DATA;
    return PAYMENT_DATA.filter(([n]) =>
      n === 'Dinheiro'
        ? paymentMethods.money
        : n === 'PIX'
          ? paymentMethods.pix
          : n === 'Cartao Debito'
            ? paymentMethods.debit
            : n === 'Cartao Credito'
              ? paymentMethods.credit
              : paymentMethods.others,
    );
  }, [exportType, paymentMethods]);

  const effectiveIncludeInbound = exportType === 'complete' ? true : includeInbound;
  const effectiveIncludeOutbound = exportType === 'complete' ? true : includeOutbound;
  const filesInPackage = useMemo(() => {
    const f = [`PDF/pdf_master_${monthRef}.pdf`];
    if (effectiveIncludeOutbound) f.push(`PDF/pdf_saidas_${monthRef}.pdf`, 'XML/SAIDAS/*.xml');
    if (effectiveIncludeInbound) f.push(`PDF/pdf_entradas_${monthRef}.pdf`, 'XML/ENTRADAS/*.xml');
    f.push(`PDF/pdf_cancelamentos_${monthRef}.pdf`, 'XML/CANCELAMENTOS/*.xml');
    return f;
  }, [monthRef, effectiveIncludeInbound, effectiveIncludeOutbound]);
  const packageName = useMemo(() => `pacote_contabil_${monthRef}_${slugify(companyFantasy)}.zip`, [monthRef, companyFantasy]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (docOperationFilter !== 'all' && doc.operation !== docOperationFilter) return false;
      if (docStatusFilter !== 'all' && doc.status !== docStatusFilter) return false;
      if (!docSearch) return true;
      const q = docSearch.toLowerCase();
      return doc.number.toLowerCase().includes(q) || doc.party.toLowerCase().includes(q);
    });
  }, [documents, docOperationFilter, docStatusFilter, docSearch]);

  const downloadBlob = (name: string, content: string, mime: string) => {
    const b = new Blob([content], { type: mime });
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMasterPdf = () => {
    const txt = [
      'PDF MASTER',
      `Empresa: ${companyName} | CNPJ: ${companyCnpj} | IE: ${companyIe}`,
      `Periodo: ${monthRef}`,
      `Tipo: ${exportType === 'complete' ? 'Completo' : 'Customizado'}`,
      `Escopo: ${scopeLabel(scopeMode)}`,
      `Confiabilidade: ${confidence.toFixed(2)}% | Nivel ${level.level} - ${level.name}`,
      `Receita total: ${currency(totalRevenue)}`,
      ...filesInPackage.map((f) => `- ${f}`),
    ].join('\n');
    downloadBlob(`pdf_master_${monthRef}.pdf`, txt, 'application/pdf');
  };

  const downloadCsv = () => downloadBlob(`documentos_fiscais_${monthRef}.csv`, 'data,tipo,numero,valor,status\n2026-01-25,NFC-e,00001023,150.00,Autorizada', 'text/csv;charset=utf-8');
  const downloadZip = () => downloadBlob(packageName, [`PACOTE ${packageName}`, ...filesInPackage].join('\n'), 'application/zip');

  const generatePackage = () => {
    setGenModalOpen(true);
    setGenState('generating');
    setGenStep(1);
    setShowDetails(false);
    setRequestId(`REQ-${Date.now()}`);
    if (exportType === 'custom' && paymentLines.length === 0) {
      setTimeout(() => setGenStep(2), 500);
      setTimeout(() => { setGenState('failed'); setGenError('Nenhuma forma de pagamento selecionada no relatorio customizado.'); }, 1000);
      return;
    }
    setTimeout(() => setGenStep(2), 500);
    setTimeout(() => setGenStep(3), 1000);
    setTimeout(() => setGenState('ready'), 1500);
  };

  const canCancelDocument = (doc: FiscalDocument) => {
    if (doc.operation !== 'saida' || doc.status !== 'Autorizada') return false;
    const issuedAt = new Date(doc.issuedAt).getTime();
    const elapsedMs = Date.now() - issuedAt;
    const maxMs = doc.model === '65' ? 30 * 60 * 1000 : 24 * 60 * 60 * 1000;
    return elapsedMs <= maxMs;
  };

  const cancelReason = (doc: FiscalDocument) => {
    if (doc.operation !== 'saida') return 'Notas de entrada nÃ£o podem ser canceladas por este painel.';
    if (doc.status !== 'Autorizada') return 'Somente notas autorizadas podem ser canceladas.';
    if (canCancelDocument(doc)) return '';
    return 'Esta nota nÃ£o pode mais ser cancelada. O prazo legal para cancelamento foi encerrado. Para devolver a mercadoria, consulte seu contador para emissÃ£o de NF-e de devoluÃ§Ã£o.';
  };

  const handleCancelDocument = (doc: FiscalDocument) => {
    if (!canCancelDocument(doc)) {
      setDocNotice(cancelReason(doc));
      return;
    }
    setDocuments((old) => old.map((item) => (item.id === doc.id ? { ...item, status: 'Cancelada', sefazUpdatedAt: new Date().toISOString() } : item)));
    setDocNotice(`Documento ${doc.number} cancelado e sincronizado com a SEFAZ.`);
  };

  const handleRefreshSefaz = (doc: FiscalDocument) => {
    setDocuments((old) => old.map((item) => (item.id === doc.id ? { ...item, sefazUpdatedAt: new Date().toISOString() } : item)));
    setDocNotice(`Documento ${doc.number} atualizado com status da SEFAZ.`);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Fiscal</h2>
      <Tabs tabs={['Painel & PendÃªncias', 'RelatÃ³rios', 'Documentos Fiscais Emitidos', 'ExportaÃ§Ã£o']} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'Painel & PendÃªncias' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50 border rounded-lg p-4"><div className="text-2xl font-bold">12</div><p className="text-sm">Produtos sem NCM</p></div>
            <div className="bg-white border rounded-lg p-4"><div className="text-2xl font-bold">3</div><p className="text-sm">Origem Invalida</p></div>
            <div className="bg-red-50 border rounded-lg p-4"><div className="text-2xl font-bold">2</div><p className="text-sm">CEST obrigatorio ausente</p></div>
          </div>
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b"><h3 className="font-medium">Produtos com Pendencia Fiscal</h3></div>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Produto</th><th className="px-6 py-3 text-left">Erro</th><th className="px-6 py-3 text-right">Acao</th></tr></thead>
              <tbody>
                <tr><td className="px-6 py-3">Suco de Laranja</td><td className="px-6 py-3 text-red-600">NCM em branco</td><td className="px-6 py-3 text-right"><Button size="sm" variant="outline">Corrigir</Button></td></tr>
                <tr><td className="px-6 py-3">Batata Frita G</td><td className="px-6 py-3 text-red-600">Situacao Tributaria Invalida</td><td className="px-6 py-3 text-right"><Button size="sm" variant="outline">Corrigir</Button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'RelatÃ³rios' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
            <div className="flex gap-4 items-end"><Input type="month" label="Mes de Referencia" value={monthRef} onChange={(e) => setMonthRef(e.target.value)} /><Button variant="secondary" icon={<Filter size={16} />}>Aplicar</Button></div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setScopeMode('mode_a')} className={`px-4 py-2 rounded-md text-sm ${scopeMode === 'mode_a' ? 'bg-white text-indigo-600' : 'text-gray-600'}`}>Modo Fiscal (NF-e/NFC-e)</button>
              <button onClick={() => setScopeMode('mode_b')} className={`px-4 py-2 rounded-md text-sm ${scopeMode === 'mode_b' ? 'bg-white text-indigo-600' : 'text-gray-600'}`}>Modo Interno (Geral)</button>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Nivel de Confiabilidade do Documento</h3><Badge color={level.level === 1 ? 'green' : level.level === 2 ? 'blue' : level.level === 3 ? 'yellow' : 'red'}>Nivel {level.level} - {level.name}</Badge></div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden"><div className="h-6 text-white text-xs flex items-center justify-center" style={{ width: `${Math.max(confidence, 4)}%`, backgroundColor: level.color }}>{confidence.toFixed(2)}%</div></div>
            <div className="text-sm">Receita total considerada: <strong>{currency(totalRevenue)}</strong></div>
          </div>

          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50"><h3 className="font-medium">Mapa PGDAS - Revenda de Mercadorias</h3></div>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left">Combinacao</th><th className="px-4 py-2 text-right">Receita</th></tr></thead>
              <tbody>{pgdasRows.map((r) => <tr key={r.label}><td className="px-4 py-2">{r.label}</td><td className="px-4 py-2 text-right">{currency(r.receita)}</td></tr>)}</tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3"><Button variant="secondary" icon={<Printer size={16} />} onClick={() => setIsPdfModalOpen(true)}>Exportar PDF</Button><Button variant="secondary" icon={<FileText size={16} />} onClick={downloadCsv}>Exportar CSV</Button></div>
        </div>
      )}

      {activeTab === 'Documentos Fiscais Emitidos' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-4 flex flex-col lg:flex-row gap-3 lg:items-end">
            <Input label="Busca por numero ou cliente/fornecedor" value={docSearch} onChange={(e) => setDocSearch(e.target.value)} className="lg:flex-1" />
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">OperaÃ§Ã£o</label>
              <select className="border rounded-md px-3 py-2 text-sm" value={docOperationFilter} onChange={(e) => setDocOperationFilter(e.target.value as 'all' | FiscalOperation)}>
                <option value="all">Todas</option>
                <option value="saida">Saidas</option>
                <option value="entrada">Entradas</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">Status</label>
              <select className="border rounded-md px-3 py-2 text-sm" value={docStatusFilter} onChange={(e) => setDocStatusFilter(e.target.value as 'all' | FiscalDocumentStatus)}>
                <option value="all">Todos</option>
                <option value="Autorizada">Autorizada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Pendente">Pendente</option>
                <option value="Contingencia">Contingencia</option>
              </select>
            </div>
          </div>

          {docNotice && <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{docNotice}</div>}

          <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Regras de cancelamento: NFC-e ate 30 minutos apos autorizacao e NF-e ate 24 horas apos autorizacao.</div>

          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">Data/Hora</th><th className="px-4 py-3 text-left">OperaÃ§Ã£o</th><th className="px-4 py-3 text-left">Modelo</th><th className="px-4 py-3 text-left">NÃºmero/SÃ©rie</th><th className="px-4 py-3 text-left">Cliente / Fornecedor</th><th className="px-4 py-3 text-left">Valor</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">SEFAZ</th><th className="px-4 py-3 text-right">AÃ§Ãµes</th></tr></thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-4 py-3">{formatDateTime(doc.issuedAt)}</td>
                    <td className="px-4 py-3">{doc.operation === 'saida' ? 'Saida' : 'Entrada'}</td>
                    <td className="px-4 py-3">{doc.model === '65' ? 'NFC-e (65)' : 'NF-e (55)'}</td>
                    <td className="px-4 py-3">{doc.number} / {doc.series}</td>
                    <td className="px-4 py-3">{doc.party}</td>
                    <td className="px-4 py-3">{currency(doc.value)}</td>
                    <td className="px-4 py-3"><Badge color={doc.status === 'Autorizada' ? 'green' : doc.status === 'Cancelada' ? 'red' : 'yellow'}>{doc.status}</Badge></td>
                    <td className="px-4 py-3">{formatDateTime(doc.sefazUpdatedAt)}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2 flex-wrap"><Button size="sm" variant="secondary" icon={<RefreshCw size={14} />} onClick={() => handleRefreshSefaz(doc)}>SEFAZ</Button><Button size="sm" variant="outline">XML</Button><Button size="sm" variant="outline" disabled={doc.operation !== 'saida'}>DANFE</Button><Button size="sm" variant="danger" disabled={!canCancelDocument(doc)} onClick={() => handleCancelDocument(doc)}>Cancelar</Button></div></td>
                  </tr>
                ))}
                {filteredDocuments.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">Nenhum documento encontrado para os filtros selecionados.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ExportaÃ§Ã£o' && (
        <div className="max-w-4xl space-y-6">
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileCheck size={20} className="text-indigo-600" />
              Pacote Contabil
            </h3>

            <Input type="month" label="Mes de Referencia" value={monthRef} onChange={(e) => setMonthRef(e.target.value)} />

            <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              Essa configuracao impacta o conteudo do PDF Master e dos PDFs detalhados exibidos na previa.
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={exportType === 'complete'}
                  onChange={() => {
                    setExportType('complete');
                    setScopeMode('mode_b');
                    setCustomSalesScope('all');
                  }}
                />
                Pacote Completo
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={exportType === 'custom'} onChange={() => setExportType('custom')} />
                Relatorio Customizado
              </label>
            </div>

            {exportType === 'custom' && (
              <div className="rounded border bg-gray-50 p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Escopo das Vendas</p>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        className="accent-blue-600"
                        checked={customSalesScope === 'all'}
                        onChange={() => {
                          setCustomSalesScope('all');
                          setScopeMode('mode_b');
                        }}
                      />
                      Todas as vendas (Fiscal + Interno)
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        className="accent-blue-600"
                        checked={customSalesScope === 'fiscal_only'}
                        onChange={() => {
                          setCustomSalesScope('fiscal_only');
                          setScopeMode('mode_a');
                        }}
                      />
                      Somente com Documento Fiscal
                    </label>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Formas de Pagamento</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="accent-blue-600" checked={paymentMethods.money} onChange={(e) => setPaymentMethods((s) => ({ ...s, money: e.target.checked }))} />
                      Dinheiro
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="accent-blue-600" checked={paymentMethods.pix} onChange={(e) => setPaymentMethods((s) => ({ ...s, pix: e.target.checked }))} />
                      PIX
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="accent-blue-600" checked={paymentMethods.debit} onChange={(e) => setPaymentMethods((s) => ({ ...s, debit: e.target.checked }))} />
                      Debito
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="accent-blue-600" checked={paymentMethods.credit} onChange={(e) => setPaymentMethods((s) => ({ ...s, credit: e.target.checked }))} />
                      Credito
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="accent-blue-600" checked={paymentMethods.others} onChange={(e) => setPaymentMethods((s) => ({ ...s, others: e.target.checked }))} />
                      Outros
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <label className="flex items-center gap-2 border rounded p-3">
                <input type="checkbox" className="accent-blue-600" checked={effectiveIncludeInbound} disabled={exportType === 'complete'} onChange={(e) => setIncludeInbound(e.target.checked)} />
                XML de Entrada (Compras)
              </label>
              <label className="flex items-center gap-2 border rounded p-3">
                <input type="checkbox" className="accent-blue-600" checked={effectiveIncludeOutbound} disabled={exportType === 'complete'} onChange={(e) => setIncludeOutbound(e.target.checked)} />
                XML de Saida (NFC-e/NF-e)
              </label>
            </div>

            <div className="flex gap-3">
              <Button size="lg" icon={<Download size={18} />} onClick={generatePackage}>Gerar Pacote (.zip)</Button>
              {genState === 'ready' && <Button size="lg" variant="secondary" onClick={downloadZip}>Baixar pacote pronto</Button>}
            </div>
          </div>
        </div>
      )}
      <Modal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} title="Pre-visualizacao do PDF Master" size="xl">
        <div className="space-y-4">
          <div className="border rounded-lg bg-white p-4"><div className="text-sm text-gray-500">Empresa</div><div className="font-semibold text-gray-900">{companyName}</div><div className="text-sm text-gray-600">CNPJ: {companyCnpj} | IE: {companyIe}</div></div>
          <div className="border rounded-lg bg-gray-50 p-4"><div className="text-sm text-gray-500">Resumo do Relatorio</div><div className="mt-2 text-sm space-y-1"><div>Periodo: {monthRef}</div><div>Tipo: {exportType === 'complete' ? 'Completo' : 'Customizado'}</div><div>Modo: {scopeLabel(scopeMode)}</div><div>Confiabilidade: {confidence.toFixed(2)}% (Nivel {level.level} - {level.name})</div><div>Receita Total: {currency(totalRevenue)}</div></div></div>
          <div className="border rounded-lg bg-white p-4"><h4 className="font-medium mb-2">Mapa PGDAS (pre-visualizacao)</h4><div className="space-y-1 text-sm">{pgdasRows.map((r) => <div key={r.label} className="flex justify-between border-b pb-1"><span>{r.label}</span><span>{currency(r.receita)}</span></div>)}</div></div>
          <div className="border rounded-lg bg-gray-50 p-4 text-sm"><div className="font-medium mb-1">Arquivos previstos no pacote</div><ul>{filesInPackage.map((f) => <li key={f}>- {f}</li>)}</ul></div>
          <div className="flex justify-end gap-2 pt-2"><Button variant="secondary" onClick={() => setIsPdfModalOpen(false)}>Fechar</Button><Button onClick={() => { downloadMasterPdf(); setIsPdfModalOpen(false); }}>Confirmar e Exportar PDF</Button></div>
        </div>
      </Modal>

      <Modal isOpen={genModalOpen} onClose={() => setGenModalOpen(false)} title="Geracao do Pacote Contabil" size="md">
        <div className="space-y-4">
          {genState === 'generating' && (<><div className="flex items-center gap-2 text-blue-700"><Loader2 size={16} className="animate-spin" />Gerando...</div>{STEP_LABELS.map((s, i) => <div key={s} className="flex justify-between text-sm"><span>{s}</span><span className={genStep > i + 1 ? 'text-emerald-700' : genStep === i + 1 ? 'text-blue-700' : 'text-gray-400'}>{genStep > i + 1 ? 'Concluido' : genStep === i + 1 ? 'Em andamento' : 'Aguardando'}</span></div>)}</>)}
          {genState === 'ready' && <div className="space-y-3"><div className="flex items-center gap-2 text-emerald-700"><CheckCircle2 size={18} />Pronto para baixar</div><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setGenModalOpen(false)}>Fechar</Button><Button onClick={downloadZip}>Baixar pacote</Button></div></div>}
          {genState === 'failed' && <div className="space-y-3"><div className="flex items-center gap-2 text-red-700"><XCircle size={18} />Falhou</div><p className="text-sm">{genError}</p><button className="text-sm text-indigo-700 inline-flex items-center gap-1" onClick={() => setShowDetails((v) => !v)}><Info size={14} />Ver detalhes</button>{showDetails && <div className="rounded border bg-gray-50 p-3 text-xs">stack_trace: package_generation_failed<br />request_id: {requestId}<br />context: fiscal.export.zip_generation</div>}<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setGenModalOpen(false)}>Fechar</Button><Button onClick={generatePackage}>Tentar novamente</Button></div></div>}
        </div>
      </Modal>
    </div>
  );
}
