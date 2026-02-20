import React, { useMemo, useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, AlertTriangle, Power, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Button, Input, Badge, Modal, Tabs } from '../components/ui';
import { MOCK_PRODUCTS } from '../data';
import { Product } from '../types';

const ORIGEM_OPTIONS = [
  { value: '0', label: '0 - Nacional' },
  { value: '1', label: '1 - Estrangeira (Importacao direta)' },
  { value: '2', label: '2 - Estrangeira (Adquirida no mercado interno)' },
  { value: '3', label: '3 - Nacional com mais de 40% de conteudo estrangeiro' },
  { value: '4', label: '4 - Nacional produzida conforme processos produtivos basicos' },
  { value: '5', label: '5 - Nacional com menos de 40% de conteudo estrangeiro' },
  { value: '6', label: '6 - Estrangeira (Importacao direta) sem similar nacional' },
  { value: '7', label: '7 - Estrangeira (Adquirida no mercado interno) sem similar nacional' },
  { value: '8', label: '8 - Nacional com mais de 70% de conteudo de importacao' },
];

const CSOSN_OPTIONS = ['101', '102', '103', '201', '202', '203', '300', '400', '500', '900'];
const ST_CODES = new Set(['201', '202', '203', '10', '30', '60', '70']);

const NCM_DB: Record<string, string> = {
  '21069090': 'Preparacoes alimenticias',
  '22021000': 'Aguas, inclui aguas minerais e gaseificadas',
  '20041000': 'Produtos horticolas preparados ou conservados',
};

const digitsOnly = (value: string) => value.replace(/\D/g, '');

const formatNcm = (value: string) => {
  const d = digitsOnly(value).slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`;
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`;
};

const formatCest = (value: string) => {
  const d = digitsOnly(value).slice(0, 7);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 7)}`;
};

const isNcmValid = (value: string) => digitsOnly(value).length === 8;
const isCestValid = (value: string) => digitsOnly(value).length === 7;

const isProductFiscalEligible = (product: Product) => {
  if (product.taxNeedsReview) return false;
  const ncmOk = isNcmValid(product.ncm || '');
  const origemOk = Boolean(product.origem);
  const taxCodeOk = Boolean(product.taxCode);
  const unitOk = Boolean(product.unit && product.unit.trim().length <= 6);
  const needsCest = ST_CODES.has(product.taxCode || '');
  const cestOk = !needsCest || isCestValid(product.cest || '');
  return ncmOk && origemOk && taxCodeOk && unitOk && cestOk;
};

export default function ProductsView() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('Geral');
  const [formError, setFormError] = useState('');
  const [ncmNotice, setNcmNotice] = useState('');

  const productsWithTaxReview = products.filter((p) => p.taxNeedsReview).length;

  const taxOptions = CSOSN_OPTIONS;

  const handleEdit = (prod: Product) => {
    setSelectedProduct(prod);
    setActiveTab('Geral');
    setFormError('');
    setNcmNotice('');
    setIsEditModalOpen(true);
  };

  const handleNew = () => {
    setSelectedProduct({
      id: Math.random().toString(),
      name: '',
      category: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 5,
      unit: 'UN',
      status: 'Ativo',
      origem: '0',
      taxCode: '102',
      ncm: '',
      cest: '',
      fiscalGroup: '',
      ncmNeedsReview: false,
      taxNeedsReview: false,
    });
    setActiveTab('Geral');
    setFormError('');
    setNcmNotice('');
    setIsEditModalOpen(true);
  };

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.ean?.includes(searchTerm),
      ),
    [products, searchTerm],
  );

  const updateProductField = (key: keyof Product, value: string | number | undefined | boolean) => {
    if (!selectedProduct) return;
    setSelectedProduct({ ...selectedProduct, [key]: value });
  };

  const handleNcmChange = (value: string) => {
    const masked = formatNcm(value);
    const raw = digitsOnly(masked);
    const desc = raw.length === 8 ? NCM_DB[raw] : undefined;

    updateProductField('ncm', masked);
    updateProductField('ncmDescription', desc);

    if (raw.length === 8 && !desc) {
      setNcmNotice('NCM não encontrado na base. Confira se está correto.');
      updateProductField('ncmNeedsReview', true);
    } else {
      setNcmNotice('');
      updateProductField('ncmNeedsReview', false);
    }
  };

  const saveProduct = () => {
    if (!selectedProduct) return;
    const ncmDigits = digitsOnly(selectedProduct.ncm || '');
    const cestDigits = digitsOnly(selectedProduct.cest || '');
    const needsCest = ST_CODES.has(selectedProduct.taxCode || '');

    if (ncmDigits.length !== 8) {
      setFormError('NCM deve conter 8 digitos para salvar o produto.');
      setActiveTab('Fiscal');
      return;
    }

    if (!selectedProduct.unit || selectedProduct.unit.trim().length > 6) {
      setFormError('Unidade (Venda) e obrigatoria e deve ter no maximo 6 caracteres.');
      setActiveTab('Geral');
      return;
    }

    if (needsCest && cestDigits.length !== 7) {
      setFormError('CEST obrigatorio para produtos enquadrados em ST.');
      setActiveTab('Fiscal');
      return;
    }

    setProducts((old) => {
      const exists = old.some((p) => p.id === selectedProduct.id);
      const nextProduct = { ...selectedProduct, taxNeedsReview: false };
      if (!exists) return [nextProduct, ...old];
      return old.map((p) => (p.id === selectedProduct.id ? nextProduct : p));
    });
    setIsEditModalOpen(false);
    setFormError('');
    setNcmNotice('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Buscar por nome, codigo ou EAN..."
            icon={<Search size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={<Filter size={16} />}>
            Filtros
          </Button>
          <Button variant="secondary">Ajuste Fiscal em Lote</Button>
          <Button icon={<Plus size={16} />} onClick={handleNew}>
            Novo Produto
          </Button>
        </div>
      </div>

      {productsWithTaxReview > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {productsWithTaxReview} produto(s) com flag "Tributacao precisa revisao" apos mudanca de regime.
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo Fiscal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preco Venda</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Elegibilidade Fiscal</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((prod) => {
              const eligible = isProductFiscalEligible(prod);
              return (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{prod.name}</div>
                    {!prod.ncm && (
                      <div className="flex items-center text-xs text-amber-600 mt-1">
                        <AlertTriangle size={12} className="mr-1" /> Sem NCM
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prod.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prod.fiscalGroup || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">R$ {prod.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${prod.stock <= prod.minStock ? 'text-red-600' : 'text-gray-900'}`}>
                      {prod.stock} {prod.unit}
                    </div>
                    {prod.stock <= prod.minStock && <span className="text-xs text-red-500">Abaixo do min ({prod.minStock})</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color={eligible ? 'green' : 'yellow'}>
                      {prod.taxNeedsReview ? 'Tributacao precisa revisao' : eligible ? 'Apto para Emissao' : 'Uso apenas Interno'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900" onClick={() => handleEdit(prod)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Power size={16} />
                    </button>
                    <button className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedProduct?.name ? `Editar: ${selectedProduct.name}` : 'Novo Produto'}
        size="lg"
      >
        {selectedProduct && (
          <>
            <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border p-3 bg-gray-50">
              <div className="flex items-center gap-2">
                {isProductFiscalEligible(selectedProduct) ? (
                  <ShieldCheck size={18} className="text-emerald-600" />
                ) : (
                  <TriangleAlert size={18} className="text-amber-600" />
                )}
                <span className="text-sm font-medium text-gray-800">
                  {isProductFiscalEligible(selectedProduct) ? 'Apto para Emissao' : 'Uso apenas Interno'}
                </span>
              </div>
            </div>

            {selectedProduct.taxNeedsReview && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Tributação precisa revisão: emissão fiscal deve permanecer bloqueada até revisar CST/CSOSN deste item.
              </div>
            )}

            <Tabs tabs={['Geral', 'Estoque', 'Fiscal', 'Combos']} activeTab={activeTab} onChange={setActiveTab} />

            <div className="space-y-6">
              {activeTab === 'Geral' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome do Produto"
                    value={selectedProduct.name}
                    onChange={(e) => updateProductField('name', e.target.value)}
                    className="md:col-span-2"
                  />
                  <Input label="Categoria" value={selectedProduct.category} onChange={(e) => updateProductField('category', e.target.value)} />
                  <Input
                    label="Grupo Fiscal"
                    value={selectedProduct.fiscalGroup || ''}
                    onChange={(e) => updateProductField('fiscalGroup', e.target.value)}
                    placeholder="Ex: Revenda - Receita Normal"
                  />
                  <Input
                    label="Unidade (Venda)"
                    value={selectedProduct.unit}
                    maxLength={6}
                    onChange={(e) => updateProductField('unit', e.target.value.toUpperCase())}
                  />
                  <Input
                    label="Preco de Custo (R$)"
                    value={String(selectedProduct.cost)}
                    onChange={(e) => updateProductField('cost', Number(e.target.value || 0))}
                  />
                  <Input
                    label="Preco de Venda (R$)"
                    value={String(selectedProduct.price)}
                    onChange={(e) => updateProductField('price', Number(e.target.value || 0))}
                  />
                  <Input label="Código Interno" placeholder="001" />
                  <Input label="GTIN/EAN" value={selectedProduct.ean || ''} onChange={(e) => updateProductField('ean', e.target.value)} />
                </div>
              )}

              {activeTab === 'Estoque' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                    <div>
                      <span className="text-sm text-gray-500">Estoque Atual</span>
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedProduct.stock} {selectedProduct.unit}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-700 font-medium">Estoque Minimo</label>
                      <input
                        type="number"
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm border p-1"
                        value={selectedProduct.minStock}
                        onChange={(e) => updateProductField('minStock', Number(e.target.value || 0))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Fiscal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="NCM"
                      value={selectedProduct.ncm || ''}
                      onChange={(e) => handleNcmChange(e.target.value)}
                      placeholder="9999.99.99"
                    />
                    <Input
                      label={`CEST ${ST_CODES.has(selectedProduct.taxCode || '') ? '(Obrigatorio)' : '(Condicional)'}`}
                      value={selectedProduct.cest || ''}
                      onChange={(e) => updateProductField('cest', formatCest(e.target.value))}
                      placeholder="99.999.99"
                    />

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Origem</label>
                      <select
                        className="w-full border-gray-300 rounded-md shadow-sm border p-2 text-sm"
                        value={selectedProduct.origem || '0'}
                        onChange={(e) => updateProductField('origem', e.target.value)}
                      >
                        {ORIGEM_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        CSOSN (Situacao Tributaria)
                      </label>
                      <select
                        className="w-full border-gray-300 rounded-md shadow-sm border p-2 text-sm"
                        value={selectedProduct.taxCode || taxOptions[0]}
                        onChange={(e) => updateProductField('taxCode', e.target.value)}
                      >
                        {taxOptions.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedProduct.ncmDescription && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded p-3 text-sm text-emerald-700">
                      Descricao NCM: <strong>{selectedProduct.ncmDescription}</strong>
                    </div>
                  )}

                  {ncmNotice && (
                    <div className="bg-amber-50 border border-amber-100 rounded p-3 text-sm text-amber-700">
                      {ncmNotice} Produto sera marcado para revisao.
                    </div>
                  )}

                  <div className="text-xs bg-blue-50 text-blue-700 rounded border border-blue-100 p-3">
                    Dica: para vendas PDV, em Simples Nacional geralmente usa-se CSOSN 102 ou 500.
                  </div>
                </div>
              )}

              {activeTab === 'Combos' && (
                <div className="text-center py-8 space-y-4">
                  <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <Search size={24} />
                  </div>
                  <h3 className="text-gray-900 font-medium">Gestão de Combos</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Este produto não participa de nenhum combo atualmente.
                  </p>
                  <Button variant="outline">Ir para Configuração de Combos</Button>
                </div>
              )}

              {formError && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveProduct}>Salvar Produto</Button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
