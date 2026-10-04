import React, { useState } from 'react';
import { X, Upload, Code2, AlertTriangle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { analyzeHtml } from '../utils/htmlAnalyzer';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportHtml: (html: string, name?: string) => void;
  hasUnsavedChanges: boolean;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportHtml,
  hasUnsavedChanges,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [pastedHtml, setPastedHtml] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [analyzedPreview, setAnalyzedPreview] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleHtmlChange = (content: string) => {
    setPastedHtml(content);
    if (content.trim().length > 20) {
      try {
        const preview = analyzeHtml(content);
        setAnalyzedPreview(preview);
      } catch {
        setAnalyzedPreview(null);
      }
    } else {
      setAnalyzedPreview(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleHtmlChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (!pastedHtml.trim()) return;

    if (hasUnsavedChanges) {
      if (
        !confirm(
          'Atenção: Você tem alterações não salvas no projeto atual. Deseja realmente carregar este novo modelo e substituir?'
        )
      ) {
        return;
      }
    }

    const detectedName = analyzedPreview?.companyName || selectedFileName.replace(/\.html$/i, '') || 'Novo Bio Site';
    onImportHtml(pastedHtml, detectedName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-neutral-100">
                Importar Modelo de Bio Site
              </h2>
              <p className="text-[11px] text-neutral-400">
                Cole o código HTML completo ou faça upload do seu arquivo .html
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="px-6 pt-4 flex gap-2 border-b border-neutral-800/60 bg-neutral-950/40 text-xs">
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-3 px-3 font-medium transition-all relative ${
              activeTab === 'paste'
                ? 'text-amber-400 border-b-2 border-amber-500'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Colar Código HTML
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`pb-3 px-3 font-medium transition-all relative ${
              activeTab === 'file'
                ? 'text-amber-400 border-b-2 border-amber-500'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Upload de Arquivo .html
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'paste' ? (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Código HTML do Modelo
              </label>
              <textarea
                rows={9}
                value={pastedHtml}
                onChange={(e) => handleHtmlChange(e.target.value)}
                placeholder="<!DOCTYPE html><html><head>...</head><body>...</body></html>"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 font-mono text-xs text-neutral-200 focus:outline-none focus:border-amber-500 resize-none transition-colors"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-2xl p-8 text-center bg-neutral-950/50 transition-colors">
              <Upload className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
              <div className="font-medium text-neutral-200 text-sm mb-1">
                {selectedFileName || 'Selecione um arquivo .html do seu computador'}
              </div>
              <p className="text-xs text-neutral-400 mb-4 max-w-sm mx-auto">
                Modelos de barbearia, consultórios, restaurantes ou bio links estáticos com CSS e JS embutidos.
              </p>
              <label className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg cursor-pointer text-xs font-medium transition-colors inline-block">
                <span>Escolher Arquivo HTML</span>
                <input
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Real-time Analysis Result Card */}
          {analyzedPreview && (
            <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Modelo Analisado com Sucesso</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
                <div>
                  <span className="text-neutral-500">Empresa / Título:</span>{' '}
                  <span className="text-neutral-200 font-medium">{analyzedPreview.companyName || 'Não especificado'}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Botões WhatsApp:</span>{' '}
                  <span className="text-neutral-200 font-medium">{analyzedPreview.whatsAppButtons.length}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Imagens Encontradas:</span>{' '}
                  <span className="text-neutral-200 font-medium">{analyzedPreview.images.length}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Tipo de Modelo:</span>{' '}
                  <span className="text-amber-400 font-medium">
                    {analyzedPreview.configModel ? `Dinâmico (${analyzedPreview.configModel.variableName})` : 'HTML5 Estático'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {hasUnsavedChanges && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Você possui alterações não salvas. Importar um novo modelo irá descartá-las se não foram salvas.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-lg text-xs font-medium transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={!pastedHtml.trim()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-neutral-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <span>Carregar no Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
