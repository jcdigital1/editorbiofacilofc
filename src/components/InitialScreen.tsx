import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface InitialScreenProps {
  initialHtml: string;
  onOpenEditor: (html: string) => void;
}

export const InitialScreen: React.FC<InitialScreenProps> = ({
  initialHtml,
  onOpenEditor,
}) => {
  const [htmlInput, setHtmlInput] = useState(initialHtml || '');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!htmlInput.trim()) return;
    onOpenEditor(htmlInput.trim());
  };

  return (
    <div className="min-h-screen w-full bg-[#080808] text-neutral-100 flex flex-col justify-between p-4 sm:p-8 md:p-12 selection:bg-[#EFFF00] selection:text-black">
      {/* Minimal Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFFF00] text-black font-extrabold flex items-center justify-center text-sm shadow-[0_0_15px_rgba(239,255,0,0.4)]">
            BS
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            Bio Studio
          </span>
        </div>

        <span className="text-xs text-neutral-500 font-medium">
          Editor visual de bio sites
        </span>
      </header>

      {/* Main Focus Area */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center my-4">
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="relative group">
            <textarea
              rows={14}
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Cole seu código HTML aqui"
              autoFocus
              className="w-full bg-[#111111] border border-neutral-800 rounded-2xl p-5 sm:p-6 font-mono text-sm text-neutral-200 placeholder:text-neutral-500 placeholder:font-sans placeholder:text-base focus:outline-none focus:border-[#EFFF00] focus:shadow-[0_0_20px_rgba(239,255,0,0.2)] transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <p className="text-xs text-neutral-500">
              Cole o código completo de qualquer bio site em HTML.
            </p>

            <button
              type="submit"
              disabled={!htmlInput.trim()}
              className="neon-btn px-7 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer disabled:shadow-none"
            >
              <span>Abrir editor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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
