import React, { useState, useRef } from 'react';
import { ArrowRight, RotateCcw, Clipboard, Trash2, LogOut, ShieldCheck } from 'lucide-react';

interface InitialScreenProps {
  initialHtml: string;
  onOpenEditor: (html: string) => void;
  onClearHtml?: () => void;
  userEmail?: string;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
}

export const InitialScreen: React.FC<InitialScreenProps> = ({
  initialHtml,
  onOpenEditor,
  onClearHtml,
  userEmail,
  isAdmin,
  onOpenAdmin,
  onLogout,
}) => {
  const [htmlInput, setHtmlInput] = useState(initialHtml || '');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!htmlInput.trim()) return;
    onOpenEditor(htmlInput.trim());
  };

  const handleClearCode = () => {
    setHtmlInput('');
    if (onClearHtml) {
      onClearHtml();
    }
    textareaRef.current?.focus();
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setHtmlInput(text.trim());
        textareaRef.current?.focus();
      }
    } catch {
      // If clipboard access is blocked, focus textarea for manual Ctrl+V
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080808] text-neutral-100 flex flex-col justify-between p-4 sm:p-8 md:p-12 selection:bg-[#EFFF00] selection:text-black">
      {/* Minimal Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFFF00] text-black font-extrabold flex items-center justify-center text-sm shadow-[0_0_15px_rgba(239,255,0,0.4)]">
            BS
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-white">
              Bio Studio
            </span>
            {userEmail && (
              <span className="text-[10px] text-neutral-500 truncate max-w-[160px] sm:max-w-xs">
                {userEmail}
              </span>
            )}
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2">
          {isAdmin && onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[#EFFF00] border border-[#EFFF00]/30 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Acessar painel de aprovação de usuários"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Painel Admin</span>
            </button>
          )}

          {htmlInput.trim().length > 0 && (
            <button
              type="button"
              onClick={handleClearCode}
              className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-neutral-800 text-neutral-300 hover:text-[#EFFF00] border border-neutral-800 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              title="Limpar o campo e colar um novo código"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#EFFF00]" />
              <span className="hidden sm:inline">Novo código</span>
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
              title="Sair da conta"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Focus Area */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center my-4">
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="relative group">
            {/* Top right quick actions inside textarea container */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              {htmlInput.trim().length > 0 ? (
                <button
                  type="button"
                  onClick={handleClearCode}
                  className="px-3 py-1.5 bg-[#1a1a1a]/90 hover:bg-[#252525] border border-neutral-700/70 text-neutral-200 hover:text-[#EFFF00] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  title="Apagar código atual e colar novo"
                >
                  <Trash2 className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#EFFF00]" />
                  <span>Novo código</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="px-3 py-1.5 bg-[#1a1a1a]/90 hover:bg-[#252525] border border-neutral-700/70 text-neutral-200 hover:text-[#EFFF00] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  title="Colar da área de transferência"
                >
                  <Clipboard className="w-3.5 h-3.5 text-[#EFFF00]" />
                  <span>Colar</span>
                </button>
              )}
            </div>

            <textarea
              ref={textareaRef}
              rows={14}
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Cole seu código HTML aqui"
              autoFocus
              className="w-full bg-[#111111] border border-neutral-800 rounded-2xl p-5 sm:p-6 pr-32 font-mono text-sm text-neutral-200 placeholder:text-neutral-500 placeholder:font-sans placeholder:text-base focus:outline-none focus:border-[#EFFF00] focus:shadow-[0_0_20px_rgba(239,255,0,0.2)] transition-all resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <p className="text-xs text-neutral-500">
              Cole o código completo de qualquer bio site em HTML.
            </p>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {htmlInput.trim().length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCode}
                  className="px-4 py-3 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Novo código</span>
                </button>
              )}

              <button
                type="submit"
                disabled={!htmlInput.trim()}
                className="neon-btn px-7 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer disabled:shadow-none"
              >
                <span>Abrir editor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center pt-6 text-[11px] text-neutral-600">
        Bio Studio Editor · Edição direta no preview e download pronto
      </footer>
    </div>
  );
};
