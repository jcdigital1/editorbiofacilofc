import React, { useState } from 'react';
import { X, Download, FileCode, Archive, FolderArchive, CheckCircle2, Globe, ShieldCheck, AlertCircle } from 'lucide-react';
import { exportSingleHtml, exportZipPackage } from '../utils/exporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  projectName: string;
  onExportProjectBackup: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  htmlContent,
  projectName,
  onExportProjectBackup,
}) => {
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);
  const [htmlSuccess, setHtmlSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadHtml = () => {
    exportSingleHtml(htmlContent, projectName);
    setHtmlSuccess(true);
    setTimeout(() => setHtmlSuccess(false), 2500);
  };

  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    try {
      await exportZipPackage(htmlContent, projectName);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 2500);
    } catch (err) {
      console.error('Error generating zip:', err);
      alert('Houve um erro ao gerar o arquivo ZIP.');
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-neutral-100">
                Baixar Site Pronto para Hospedagem
              </h2>
              <p className="text-[11px] text-neutral-400">
                Arquivos 100% limpos e autônomos, sem scripts ou dependências do editor.
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

        {/* Content Options */}
        <div className="p-6 space-y-4">
          {/* Option 1: Baixar ZIP Completo (Recomendado) */}
          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60 transition-all space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-100 text-sm flex items-center gap-2">
                    <span>Pacote Completo (Arquivo .ZIP)</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Contém <code className="text-neutral-300">index.html</code>, pasta <code className="text-neutral-300">assets/</code> com imagens locais e guia de hospedagem gratuita na Vercel e Netlify.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-neutral-950 font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Archive className="w-4 h-4" />
              <span>{isExportingZip ? 'Gerando pacote ZIP...' : 'Baixar Pacote .ZIP'}</span>
            </button>
          </div>

          {/* Option 2: Baixar HTML Único */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 transition-all space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-100 text-sm">
                    Arquivo Único (index.html)
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Todo o código HTML, CSS, JavaScript e imagens incorporadas em um único arquivo autônomo.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadHtml}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-medium rounded-lg text-xs transition-all flex items-center justify-center gap-2"
            >
              <FileCode className="w-4 h-4" />
              <span>Baixar Apenas index.html</span>
            </button>
          </div>

          {/* Option 3: Exportar Projeto Editável (.biostudio) */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>Deseja salvar um backup do projeto para editar depois?</span>
            <button
              onClick={onExportProjectBackup}
              className="text-amber-400 hover:underline font-medium"
            >
              Exportar Arquivo do Projeto
            </button>
          </div>

          {/* Success messages */}
          {zipSuccess && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Arquivo ZIP baixado com sucesso! Descompacte e arraste para a Vercel.</span>
            </div>
          )}

          {htmlSuccess && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>index.html baixado com sucesso!</span>
            </div>
          )}

          {/* Transparency info */}
          <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl text-[11px] text-neutral-400 space-y-1">
            <div className="font-medium text-neutral-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garantia de Independência</span>
            </div>
            <p className="leading-relaxed">
              Todos os contornos de seleção, scripts do editor e links temporários foram removidos. O código exportado é 100% puro e funcionará em qualquer provedor de hospedagem estática.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
