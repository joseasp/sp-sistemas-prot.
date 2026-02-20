import React, { useMemo, useState } from 'react';
import {
  Users,
  Plus,
  BarChart2,
  Settings,
  Save,
  User,
  Building2,
  Search,
  MapPin,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Button, Input, Modal, Badge, Tabs } from '../components/ui';
import { MOCK_CLIENTS } from '../data';
import { Client, ClientType } from '../types';

const ONLY_DIGITS = (value: string) => value.replace(/\D/g, '');
const getStored = (key: string, fallback: string) => (typeof window === 'undefined' ? fallback : window.localStorage.getItem(key) || fallback);

const formatCpf = (value: string) => {
  const v = ONLY_DIGITS(value).slice(0, 11);
  return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const formatCnpj = (value: string) => {
  const v = ONLY_DIGITS(value).slice(0, 14);
  return v
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const formatCep = (value: string) => {
  const v = ONLY_DIGITS(value).slice(0, 8);
  return v.replace(/^(\d{5})(\d)/, '$1-$2');
};

const formatMoneyInput = (value: string) => {
  const digits = ONLY_DIGITS(value).slice(0, 11);
  const cents = digits.padStart(3, '0');
  const intPart = cents.slice(0, -2);
  const decimalPart = cents.slice(-2);
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${intFormatted},${decimalPart}`;
};

const isValidCPF = (cpf: string) => {
  const c = ONLY_DIGITS(cpf);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(c[i]) * (10 - i);
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== Number(c[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(c[i]) * (11 - i);
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  return digit === Number(c[10]);
};

const isValidCNPJ = (cnpj: string) => {
  const c = ONLY_DIGITS(cnpj);
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false;
  const calc = (base: string) => {
    const factors = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const total = base.split('').reduce((acc, n, i) => acc + Number(n) * factors[i], 0);
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const d1 = calc(c.slice(0, 12));
  const d2 = calc(c.slice(0, 12) + d1);
  return d1 === Number(c[12]) && d2 === Number(c[13]);
};

const CEP_DB: Record<string, { street: string; district: string; city: string; uf: string; cityCode: string }> = {
  '30130110': {
    street: 'Av. Afonso Pena',
    district: 'Centro',
    city: 'Belo Horizonte',
    uf: 'MG',
    cityCode: '3106200',
  },
  '29010000': {
    street: 'Rua Sete de Setembro',
    district: 'Centro',
    city: 'Vitoria',
    uf: 'ES',
    cityCode: '3205309',
  },
};

const CITY_CODE_DB: Record<string, string> = {
  'BELO HORIZONTE-MG': '3106200',
  'VITORIA-ES': '3205309',
};

const getClientNfeEligibility = (c: Partial<Client>) => {
  const ufExterior = (c.uf || '').toUpperCase() === 'EX';
  const docOk = ufExterior ? true : c.type === ClientType.PF ? isValidCPF(c.document || '') : isValidCNPJ(c.document || '');
  const nameOk = Boolean(c.name && c.name.trim());
  const addrOk = ufExterior
    ? true
    : Boolean(c.cep && c.street && c.number && c.district && c.city && c.uf && c.cityCode && c.cityCode.trim());
  const ieOk = ufExterior ? c.ieIndicator === '9' : c.ieIndicator !== '1' || Boolean(c.ie && c.ie.trim());
  return docOk && nameOk && addrOk && ieOk;
};

type ClientForm = {
  type: ClientType;
  name: string;
  document: string;
  phone: string;
  enableCreditLimit: boolean;
  creditLimit: string;
  ieIndicator: '1' | '2' | '3' | '9';
  ie: string;
  cep: string;
  street: string;
  number: string;
  district: string;
  city: string;
  uf: string;
  complement: string;
  cityCode: string;
};

const emptyClientForm: ClientForm = {
  type: ClientType.PF,
  name: '',
  document: '',
  phone: '',
  enableCreditLimit: false,
  creditLimit: '0,00',
  ieIndicator: '3',
  ie: '',
  cep: '',
  street: '',
  number: '',
  district: '',
  city: '',
  uf: 'MG',
  complement: '',
  cityCode: '',
};

export const ClientsView: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<ClientForm>(emptyClientForm);
  const [formError, setFormError] = useState('');
  const [cepNotice, setCepNotice] = useState('');

  const normalizedExistingDocs = useMemo(() => clients.map((c) => ONLY_DIGITS(c.document)), [clients]);
  const nfeEligible = getClientNfeEligibility({ ...form });

  const updateForm = <K extends keyof ClientForm>(key: K, value: ClientForm[K]) => {
    setForm((old) => ({ ...old, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyClientForm);
    setFormError('');
    setCepNotice('');
  };

  const lookupCep = () => {
    const cepDigits = ONLY_DIGITS(form.cep);
    if (cepDigits.length !== 8) {
      setCepNotice('CEP inválido. Informe 8 dígitos.');
      return;
    }

    const exact = CEP_DB[cepDigits];
    if (exact) {
      setForm((old) => ({
        ...old,
        street: exact.street,
        district: exact.district,
        city: exact.city,
        uf: exact.uf,
        cityCode: exact.cityCode,
      }));
      setCepNotice('Endereço localizado na base do IBGE.');
      return;
    }

    const cityKey = `${(form.city || '').toUpperCase()}-${(form.uf || '').toUpperCase()}`;
    const fallbackCityCode = CITY_CODE_DB[cityKey] || '';
    setForm((old) => ({ ...old, cityCode: fallbackCityCode }));
    setCepNotice(
      fallbackCityCode
        ? 'CEP não localizado na base. Endereço manual permitido; código IBGE obtido por cidade/UF.'
        : 'CEP não localizado na base. Endereço manual permitido e localização IBGE pendente.',
    );
  };

  const saveClient = () => {
    const normalizedDocument = ONLY_DIGITS(form.document);
    const ufExterior = form.uf.toUpperCase() === 'EX';

    if (!form.name.trim()) {
      setFormError('Nome/Razão Social é obrigatório.');
      return;
    }

    if (!ufExterior) {
      if (form.type === ClientType.PF && !isValidCPF(form.document)) {
        setFormError('CPF inválido (dígito verificador incorreto).');
        return;
      }
      if (form.type === ClientType.PJ && !isValidCNPJ(form.document)) {
        setFormError('CNPJ inválido (dígito verificador incorreto).');
        return;
      }
    }

    if (normalizedDocument && normalizedExistingDocs.includes(normalizedDocument)) {
      setFormError('Já existe cliente cadastrado com esse CPF/CNPJ.');
      return;
    }

    if (!ufExterior && form.type === ClientType.PJ && form.ieIndicator === '1' && !form.ie.trim()) {
      setFormError('IE obrigatória para Contribuinte ICMS.');
      return;
    }

    const newClient: Client = {
      id: String(Date.now()),
      name: form.name,
      type: form.type,
      document: form.document,
      phone: form.phone,
      creditLimit: form.enableCreditLimit
        ? Number(form.creditLimit.replace(/\./g, '').replace(',', '.')) || 0
        : 0,
      status: 'Ativo',
      balance: 0,
      ieIndicator: ufExterior ? '9' : form.ieIndicator,
      ie: !ufExterior && form.ieIndicator === '1' ? form.ie : '',
      cep: form.cep,
      street: form.street,
      number: form.number,
      district: form.district,
      city: form.city,
      uf: form.uf.toUpperCase(),
      cityCode: form.cityCode,
      nfeEligible,
    };

    setClients((old) => [newClient, ...old]);
    setIsModalOpen(false);
    resetForm();
  };

  const filteredClients = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q) || c.document.includes(searchTerm));
  }, [clients, searchTerm]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Buscar por nome, CPF/CNPJ..."
          className="w-96"
          icon={<Search size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          icon={<Plus size={16} />}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          Novo Cliente
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NF-e</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {c.type === ClientType.PF ? <User size={14} className="text-blue-500" /> : <Building2 size={14} className="text-indigo-500" />}
                    {c.type}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.document}</td>
                <td className="px-6 py-4">
                  <Badge color={c.nfeEligible ? 'green' : 'yellow'}>{c.nfeEligible ? 'Apto para NF-e' : 'Pendente de NF-e'}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge color={c.status === 'Ativo' ? 'green' : 'gray'}>{c.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Cliente" size="xl">
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border p-3 bg-gray-50">
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="type"
                  checked={form.type === ClientType.PF}
                  onChange={() => updateForm('type', ClientType.PF)}
                />
                <span>Pessoa Física (CPF)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="type"
                  checked={form.type === ClientType.PJ}
                  onChange={() => updateForm('type', ClientType.PJ)}
                />
                <span>Pessoa Jurídica (CNPJ)</span>
              </label>
            </div>
            <Badge color={nfeEligible ? 'green' : 'yellow'}>{nfeEligible ? 'Apto para NF-e' : 'Pendente de NF-e'}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome Completo / Razão Social" value={form.name} onChange={(e) => updateForm('name', e.target.value)} className="md:col-span-2" />
            <Input
              label={form.type === ClientType.PF ? 'CPF' : 'CNPJ'}
              value={form.document}
              onChange={(e) => updateForm('document', form.type === ClientType.PF ? formatCpf(e.target.value) : formatCnpj(e.target.value))}
            />
            <Input label="Telefone / WhatsApp" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} />
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <h4 className="font-medium text-gray-900">Indicador de IE</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700">Indicador de IE</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.ieIndicator}
                  disabled={form.uf.toUpperCase() === 'EX'}
                  onChange={(e) => updateForm('ieIndicator', e.target.value as '1' | '2' | '3' | '9')}
                >
                  <option value="1">1. Contribuinte ICMS</option>
                  <option value="2">2. Contribuinte Isento</option>
                  <option value="3">3. Não Contribuinte</option>
                  <option value="9">9. Exterior</option>
                </select>
              </div>
              <Input
                label="Inscrição Estadual (IE)"
                value={form.ie}
                disabled={form.ieIndicator !== '1' || form.uf.toUpperCase() === 'EX'}
                onChange={(e) => updateForm('ie', e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-4 bg-gray-50">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-gray-800">Habilitar Limite de Crédito (Fiado)</span>
              <input
                type="checkbox"
                checked={form.enableCreditLimit}
                onChange={(e) => updateForm('enableCreditLimit', e.target.checked)}
                className="rounded text-indigo-600"
              />
            </label>
            <Input
              label="Limite (R$)"
              value={form.creditLimit}
              disabled={!form.enableCreditLimit}
              onChange={(e) => updateForm('creditLimit', formatMoneyInput(e.target.value))}
            />
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <MapPin size={16} /> Endereço
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="CEP" value={form.cep} onChange={(e) => updateForm('cep', formatCep(e.target.value))} />
              <div className="md:col-span-1 pt-[22px]">
                <Button variant="secondary" className="w-full" onClick={lookupCep}>
                  Buscar CEP
                </Button>
              </div>
              <Input label="Logradouro" value={form.street} onChange={(e) => updateForm('street', e.target.value)} className="md:col-span-2" />
              <Input label="Número" value={form.number} onChange={(e) => updateForm('number', e.target.value)} />
              <Input label="Bairro" value={form.district} onChange={(e) => updateForm('district', e.target.value)} />
              <Input label="Cidade" value={form.city} onChange={(e) => updateForm('city', e.target.value)} />
              <Input
                label="UF"
                value={form.uf}
                onChange={(e) => {
                  const nextUf = e.target.value.toUpperCase().slice(0, 2);
                  setForm((old) => ({
                    ...old,
                    uf: nextUf,
                    ieIndicator: nextUf === 'EX' ? '9' : old.ieIndicator === '9' ? '3' : old.ieIndicator,
                    ie: nextUf === 'EX' ? '' : old.ie,
                  }));
                }}
              />
              <Input label="Complemento (Opcional)" value={form.complement} onChange={(e) => updateForm('complement', e.target.value)} />
            </div>

            <div className="text-sm">
              {form.cityCode ? (
                <span className="inline-flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 size={16} /> Localizado na base do IBGE (código {form.cityCode})
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-amber-700">
                  <AlertTriangle size={16} /> Pendente de localização IBGE
                </span>
              )}
            </div>

            {cepNotice && <div className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">{cepNotice}</div>}
            {form.uf.toUpperCase() === 'EX' && (
              <div className="rounded border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
                Cliente exterior: ind_ie_dest deve ser 9. CPF/CNPJ pode ficar vazio.
              </div>
            )}
          </div>

          {formError && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}

          <div className="flex justify-end pt-2">
            <Button onClick={saveClient}>Salvar Cadastro</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const ReportsView: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Relatórios</h2>
      <Tabs tabs={['Visão Geral', 'Vendas', 'Financeiro', 'Auditoria']} activeTab="Visão Geral" onChange={() => {}} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Faturamento Hoje', 'Ticket Medio', 'Vendas (Qtd)', 'Lucro Est.'].map((label, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
        ))}
      </div>
      <div className="bg-white border rounded-lg p-12 text-center text-gray-400">
        <BarChart2 className="mx-auto h-12 w-12 mb-2" />
        <p>Gráficos de evolução diária apareceriam aqui.</p>
      </div>
    </div>
  );
};

export const SettingsView: React.FC = () => {
  const [companyName, setCompanyName] = useState(() => getStored('sp_company_name', 'Restaurante Silva LTDA'));
  const [companyFantasy, setCompanyFantasy] = useState(() => getStored('sp_company_fantasy_name', 'Restaurante Silva'));
  const [companyCnpj, setCompanyCnpj] = useState(() => getStored('sp_company_cnpj', '12.345.678/0001-90'));
  const [companyIe, setCompanyIe] = useState(() => getStored('sp_company_ie', 'ISENTO'));
  const [uf, setUf] = useState<'MG' | 'ES'>('MG');
  const [regime, setRegime] = useState<'Simples Nacional' | 'Regime Normal'>('Simples Nacional');
  const [environment, setEnvironment] = useState<'homologacao' | 'producao'>('homologacao');

  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPassword, setCertPassword] = useState('');
  const [certStatus, setCertStatus] = useState<'idle' | 'valido' | 'expirado' | 'cnpj_divergente' | 'invalido'>('idle');
  const [certDraftSaved, setCertDraftSaved] = useState(false);
  const [certOwnerCnpj, setCertOwnerCnpj] = useState('');
  const [certExpireInDays, setCertExpireInDays] = useState<number | null>(null);

  const [tokenId, setTokenId] = useState('000001');
  const [tokenCode, setTokenCode] = useState('ABC-123-XYZ');
  const [nfeSéries, setNfeSéries] = useState('1');
  const [nfeNext, setNfeNext] = useState('1');
  const [nfceSéries, setNfceSéries] = useState('1');
  const [nfceNext, setNfceNext] = useState('1');
  const [saveMessage, setSaveMessage] = useState('');

  const currentNfeNumber = 1;
  const currentNfceNumber = 1;

  const validateCertificate = () => {
    setCertDraftSaved(false);
    if (!certFile || !certPassword) {
      setCertStatus('invalido');
      setSaveMessage('Informe arquivo e senha do certificado.');
      return;
    }

    const fileName = certFile.name.toLowerCase();
    if (!fileName.endsWith('.pfx') && !fileName.endsWith('.p12')) {
      setCertStatus('invalido');
      setSaveMessage('Certificado inválido. Use arquivo .pfx ou .p12.');
      return;
    }

    if (fileName.includes('expirado')) {
      setCertStatus('expirado');
      setCertOwnerCnpj(companyCnpj);
      setCertExpireInDays(0);
      setSaveMessage('Certificado expirado.');
      return;
    }

    if (fileName.includes('divergente')) {
      setCertStatus('cnpj_divergente');
      setCertOwnerCnpj('99.999.999/0001-99');
      setCertExpireInDays(210);
      setSaveMessage('CNPJ do certificado diverge da empresa logada.');
      return;
    }

    setCertStatus('valido');
    setCertOwnerCnpj(companyCnpj);
    setCertExpireInDays(210);
    setSaveMessage('Certificado válido para emissão.');
  };

  const persistCompanySettings = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('sp_company_name', companyName);
    window.localStorage.setItem('sp_company_fantasy_name', companyFantasy);
    window.localStorage.setItem('sp_company_cnpj', companyCnpj);
    window.localStorage.setItem('sp_company_ie', companyIe);
  };

  const saveFiscalSettings = () => {
    const nextNfe = Number(nfeNext || 0);
    const nextNfce = Number(nfceNext || 0);
    if (nextNfe <= 0 || nextNfce <= 0) {
      setSaveMessage('Próximo número deve ser inteiro positivo.');
      return;
    }
    if (nextNfe < currentNfeNumber || nextNfce < currentNfceNumber) {
      setSaveMessage('Não é permitido reduzir o próximo número após iniciar emissões.');
      return;
    }
    persistCompanySettings();
    if (certStatus === 'cnpj_divergente') {
      setSaveMessage('Configurações salvas. Certificado com CNPJ divergente não pode ser ativado; use Salvar como rascunho.');
      return;
    }
    setSaveMessage('Configurações fiscais salvas.');
  };

  const saveCertificateDraft = () => {
    if (certStatus !== 'cnpj_divergente') return;
    setCertDraftSaved(true);
    setSaveMessage('Certificado salvo como rascunho para conferência. Não será usado em emissões.');
  };

  const certBadge = () => {
    if (certStatus === 'valido') return <Badge color="green">Válido</Badge>;
    if (certStatus === 'expirado') return <Badge color="red">Expirado</Badge>;
    if (certStatus === 'cnpj_divergente') return <Badge color="yellow">CNPJ divergente</Badge>;
    if (certStatus === 'invalido') return <Badge color="red">Inválido</Badge>;
    return <Badge color="gray">Não validado</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {environment === 'homologacao' && (
        <div className="rounded-lg border border-amber-300 bg-amber-100 px-4 py-3 text-amber-900 font-semibold">
          AMBIENTE DE TESTE ATIVO
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800">Configurações Fiscais</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
            <Settings size={18} /> Empresa e Ambiente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Razão Social" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <Input label="Nome Fantasia" value={companyFantasy} onChange={(e) => setCompanyFantasy(e.target.value)} />
            <Input label="CNPJ" value={companyCnpj} onChange={(e) => setCompanyCnpj(e.target.value)} />
            <Input label="Inscrição Estadual (IE)" value={companyIe} onChange={(e) => setCompanyIe(e.target.value)} />
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">UF de operação</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={uf} onChange={(e) => setUf(e.target.value as 'MG' | 'ES')}>
                <option value="MG">MG</option>
                <option value="ES">ES</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700">Regime Tributário</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={regime}
                onChange={(e) => setRegime(e.target.value as 'Simples Nacional' | 'Regime Normal')}
              >
                <option>Simples Nacional</option>
                <option disabled>Regime Normal (em breve)</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block mb-2 text-xs font-medium text-gray-700">Ambiente de emissão</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={environment === 'homologacao'}
                  onChange={() => setEnvironment('homologacao')}
                />
                Homologação
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={environment === 'producao'} onChange={() => setEnvironment('producao')} />
                Produção
              </label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
            <ShieldCheck size={18} /> Certificado Digital A1
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-700">{certFile ? certFile.name : 'Arraste ou selecione .pfx/.p12'}</span>
              <input
                type="file"
                accept=".pfx,.p12"
                className="hidden"
                onChange={(e) => setCertFile(e.target.files?.[0] || null)}
              />
            </label>
            <Input label="Senha do Certificado" type="password" value={certPassword} onChange={(e) => setCertPassword(e.target.value)} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {certBadge()}
            {certDraftSaved && <Badge color="gray">Rascunho salvo</Badge>}
            {certExpireInDays !== null && <span className="text-sm text-gray-600">Expira em {certExpireInDays} dias</span>}
            {certOwnerCnpj && <span className="text-sm text-gray-600">CNPJ do titular: {certOwnerCnpj}</span>}
            <Button variant="secondary" onClick={validateCertificate}>
              Validar certificado
            </Button>
            {certStatus === 'cnpj_divergente' && (
              <Button variant="outline" onClick={saveCertificateDraft}>
                Salvar como rascunho
              </Button>
            )}
          </div>

        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Dados NFC-e (CSC)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="ID do Token (CSC)" value={tokenId} onChange={(e) => setTokenId(ONLY_DIGITS(e.target.value))} />
            <Input label="Código CSC (Token)" value={tokenCode} onChange={(e) => setTokenCode(e.target.value)} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Numeração e Série</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded border p-4 space-y-3">
              <h4 className="font-medium text-sm text-gray-800">NF-e (Modelo 55)</h4>
              <Input label="Série" value={nfeSéries} onChange={(e) => setNfeSéries(ONLY_DIGITS(e.target.value))} />
              <Input label="Proximo Número" value={nfeNext} onChange={(e) => setNfeNext(ONLY_DIGITS(e.target.value))} />
              <p className="text-xs text-gray-500">Atual registrado: {currentNfeNumber}</p>
            </div>
            <div className="rounded border p-4 space-y-3">
              <h4 className="font-medium text-sm text-gray-800">NFC-e (Modelo 65)</h4>
              <Input label="Série" value={nfceSéries} onChange={(e) => setNfceSéries(ONLY_DIGITS(e.target.value))} />
              <Input label="Proximo Número" value={nfceNext} onChange={(e) => setNfceNext(ONLY_DIGITS(e.target.value))} />
              <p className="text-xs text-gray-500">Atual registrado: {currentNfceNumber}</p>
            </div>
          </div>
        </div>

        <div className="rounded border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
          Seguranca esperada no backend: certificado e senha devem ser armazenados com criptografia AES-256 (ou vault seguro).
        </div>

        {saveMessage && (
          <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 flex items-center gap-2">
            <CheckCircle2 size={16} />
            {saveMessage}
          </div>
        )}

        <div className="pt-2">
          <Button icon={<Save size={16} />} onClick={saveFiscalSettings}>
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};

