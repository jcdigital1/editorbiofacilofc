import React, { useState, useEffect } from 'react';
import { X, Code, Check, Copy, CheckCircle2, RotateCcw } from 'lucide-react';
import { cleanHtmlForExport } from '../utils/exporter';

interface CodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  onApplyCode: (newHtml: string) => void;
}

export const CodeEditorModal: React.FC<CodeEditorModalProps> = ({
  isOpen,
  onClose,
  htmlContent,
  onApplyCode,
}) => {
  const [code, setCode] = useState(htmlContent);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    setCode(cleanHtmlForExport(htmlContent));
  }, [htmlContent, isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onApplyCode(code);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 text-amber-400 flex items-center justify-center border border-neutral-700">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-neutral-100 flex items-center gap-2">
                <span>Editor de Código HTML Fonte</span>
                <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full font-mono">
                  {code.split('\n').length} linhas
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Altere diretamente o HTML, CSS e scripts do bio site com sincronização instantânea.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Copiar código"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Editor Area */}
        <div className="flex-1 p-4 bg-neutral-950 overflow-hidden flex flex-col font-mono text-xs">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 text-neutral-200 focus:outline-none focus:border-amber-500/80 resize-none font-mono text-xs leading-relaxed selection:bg-amber-500/30 selection:text-amber-200"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-xs">
          <span className="text-neutral-500">
            Dica: Tags <code className="text-neutral-400">&lt;script&gt;</code> e <code className="text-neutral-400">&lt;style&gt;</code> são totalmente editáveis.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleApply}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              {applied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                  <span>Aplicado!</span>
                </>
              ) : (
                <span>Aplicar Alterações</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
