import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Button, Input, Modal, Badge } from '../components/ui';
import { MOCK_STOCK_ENTRIES } from '../data';

export default function StockView() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [selectedXmlItem, setSelectedXmlItem] = useState<string | null>(null);
  const [conversionFactor, setConversionFactor] = useState('1');
  const [systemUnit, setSystemUnit] = useState('UN');

  const xmlItems = [
    { name: 'CX Hamburguer 200g', qtd: 2, unit: 'CX', total: 120.0, mapped: false },
    { name: 'FARINHA DE TRIGO 5KG', qtd: 5, unit: 'UN', total: 85.0, mapped: true, stockMap: 'Farinha Trigo (Kg)' },
    { name: 'OLEO DE SOJA LIZA', qtd: 10, unit: 'L', total: 60.0, mapped: false },
  ];
  const unitOptions = ['UN', 'CX', 'KG', 'G', 'L', 'ML'];
  const currentXmlItem = xmlItems.find((item) => item.name === selectedXmlItem) || null;

  const renderImportWizard = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between px-8 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  importStep >= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 3 && <div className={`w-24 h-1 mx-2 ${importStep > step ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {importStep === 1 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">Clique para selecionar o XML</p>
            <p className="text-xs text-gray-500">ou arraste e solte o arquivo aqui</p>
            <Button className="mt-4" onClick={() => setImportStep(2)}>
              Simular Upload
            </Button>
          </div>
        )}

        {importStep === 2 && (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-md">
              <h4 className="font-semibold text-indigo-900">Fornecedor Identificado no XML</h4>
              <p className="text-sm text-indigo-700">DISTRIBUIDORA ALIMENTOS LTDA (12.345.678/0001-90)</p>
            </div>
            <div className="p-4 border rounded-md bg-white">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <Check size={18} />
                <span className="font-medium">Fornecedor ja cadastrado</span>
              </div>
              <p className="text-sm text-gray-500">O sistema vinculou automaticamente esta nota ao fornecedor existente.</p>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setImportStep(3)}>Continuar para Mapeamento</Button>
            </div>
          </div>
        )}

        {importStep === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[450px]">
            <div className="md:col-span-1 border rounded-md overflow-hidden flex flex-col">
              <div className="bg-gray-50 p-2 border-b font-medium text-xs text-gray-500 uppercase">Itens da Nota</div>
              <div className="overflow-y-auto flex-1">
                {xmlItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedXmlItem(item.name)}
                    className={`p-3 border-b cursor-pointer hover:bg-indigo-50 transition-colors ${
                      selectedXmlItem === item.name ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm text-gray-900 truncate w-32" title={item.name}>
                        {item.name}
                      </span>
                      {item.mapped ? <Check size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-amber-500" />}
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>
                        {item.qtd} {item.unit}
                      </span>
                      <span>R$ {item.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 border rounded-md p-4 bg-gray-50 flex flex-col justify-center overflow-y-auto">
              {!selectedXmlItem ? (
                <div className="text-center text-gray-400">
                  <ArrowRight className="mx-auto h-8 w-8 mb-2" />
                  <p>Selecione um item a esquerda para mapear</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedXmlItem}</h3>
                    <Badge color="yellow">Não Mapeado</Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded shadow-sm border">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vincular a Produto Existente</label>
                      <div className="flex gap-2">
                        <Input placeholder="Buscar produto..." className="flex-1" icon={<FileText size={16} />} />
                        <Button variant="secondary">Buscar</Button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded shadow-sm border">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Conversao de Unidade</label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-2 border rounded p-2 bg-gray-50">
                          <span className="font-semibold text-gray-700">1</span>
                          <span className="text-sm text-gray-500">{currentXmlItem?.unit || 'UN'} (XML)</span>
                        </div>
                        <span className="text-gray-400">=</span>
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="number"
                            min="0.0001"
                            step="0.0001"
                            value={conversionFactor}
                            onChange={(e) => setConversionFactor(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                          <select
                            value={systemUnit}
                            onChange={(e) => setSystemUnit(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-2 text-sm"
                          >
                            {unitOptions.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                          <span className="text-sm text-gray-500 whitespace-nowrap">(Sistema)</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        1 {currentXmlItem?.unit || 'UN'} (XML) = {conversionFactor || '0'} {systemUnit} (Sistema)
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Ex: Se a nota diz "1 caixa", mas voce vende por unidade, informe quantas unidades vem na caixa.
                      </p>
                    </div>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-gray-50 px-2 text-sm text-gray-500">OU</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full justify-center" icon={<Plus size={16} />}>
                      Criar Novo Produto a partir deste item
                    </Button>

                    <div className="pt-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded text-indigo-600" />
                        <span className="text-sm text-gray-700">Salvar fator de conversao para este fornecedor</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="secondary" onClick={() => setSelectedXmlItem(null)}>
                      Cancelar
                    </Button>
                    <Button>Confirmar Mapeamento</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Compras & Estoque</h2>
        <div className="space-x-2">
          <Button variant="secondary" onClick={() => setIsManualEntryOpen(true)}>
            Entrada Manual
          </Button>
          <Button onClick={() => setIsImportModalOpen(true)} icon={<Upload size={16} />}>
            Importar XML
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd. Itens</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {MOCK_STOCK_ENTRIES.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.supplier}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.itemsCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">R$ {entry.total.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge color={entry.status === 'Aprovada' ? 'green' : 'yellow'}>{entry.status}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900">
                    Ver detalhes
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportStep(1);
        }}
        title="Importar Nota Fiscal (XML)"
        size="2xl"
      >
        {renderImportWizard()}
        {importStep === 3 && (
          <div className="mt-6 flex justify-between border-t pt-4">
            <Button variant="ghost" onClick={() => setImportStep(2)}>
              Voltar
            </Button>
            <Button disabled={true}>Concluir e Importar</Button>
          </div>
        )}
      </Modal>

      <Modal isOpen={isManualEntryOpen} onClose={() => setIsManualEntryOpen(false)} title="Entrada Manual de Nota" size="2xl">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fornecedor" placeholder="Buscar fornecedor..." className="col-span-2" />
            <Input label="Número da Nota" />
            <Input label="Data de Emissao" type="date" />
            <Input label="Chave de Acesso (Opcional)" className="col-span-2" />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
              <h4 className="font-medium text-sm text-gray-700">Itens da Nota</h4>
              <Button size="sm" variant="secondary" icon={<Plus size={14} />}>
                Adicionar Item
              </Button>
            </div>
            <div className="p-4 bg-gray-50/50 space-y-3">
              <div className="flex gap-2 items-end">
                <Input placeholder="Produto" className="flex-[3]" />
                <Input placeholder="Qtd" type="number" className="flex-1" />
                <Input placeholder="UN" className="w-16" />
                <Input placeholder="V. Unit" type="number" className="flex-1" />
                <Input placeholder="Total" type="number" className="flex-1" disabled />
                <Button variant="ghost" className="text-red-500 hover:text-red-700 mb-[2px]">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total da Nota</span>
            <span className="text-xl font-bold text-gray-900">R$ 0,00</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsManualEntryOpen(false)}>
              Cancelar
            </Button>
            <Button>Salvar Entrada</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
