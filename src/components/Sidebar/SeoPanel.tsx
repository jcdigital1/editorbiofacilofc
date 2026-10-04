import React, { useState } from 'react';
import { Search, Globe, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface SeoPanelProps {
  pageTitle: string;
  pageDescription: string;
  favicon: string;
  onUpdateSeo: (fields: { title?: string; description?: string; favicon?: string }) => void;
}

export const SeoPanel: React.FC<SeoPanelProps> = ({
  pageTitle,
  pageDescription,
  favicon,
  onUpdateSeo,
}) => {
  const [title, setTitle] = useState(pageTitle);
  const [description, setDescription] = useState(pageDescription);
  const [fav, setFav] = useState(favicon);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateSeo({ title, description, favicon: fav });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-none">
      <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
        <div className="flex items-center gap-2 font-medium text-neutral-200">
          <Search className="w-4 h-4 text-amber-400" />
          <span>SEO e Metadados do Site</span>
        </div>
        <p className="text-[11px] text-neutral-400">
          Essas informações aparecem no topo do navegador e quando alguém compartilha o link no WhatsApp, Instagram ou Google.
        </p>

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">
              Título da Página (&lt;title&gt;)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Barbearia Dom Pedro | Cortes e Barba em SP"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">
              Descrição para Motores de Busca e WhatsApp
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve resumo atraente do seu negócio..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100 text-xs focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">
              Ícone da Aba / Favicon (URL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={fav}
                onChange={(e) => setFav(e.target.value)}
                placeholder="https://.../favicon.ico"
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 font-mono text-[11px] focus:outline-none focus:border-amber-500"
              />
              {fav && (
                <div className="w-8 h-8 rounded border border-neutral-800 bg-neutral-950 flex items-center justify-center p-1 shrink-0">
                  <img src={fav} alt="Favicon" className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>

        {saved && (
          <div className="p-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded text-[11px] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Metadados salvos com sucesso!</span>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Atualizar Metadados</span>
        </button>
      </div>

      {/* Google Preview Simulation Card */}
      <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
        <div className="flex items-center gap-2 font-medium text-neutral-300">
          <Globe className="w-4 h-4 text-sky-400" />
          <span>Prévia de Compartilhamento</span>
        </div>

        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1">
          <div className="text-[11px] text-neutral-500 truncate">
            https://seusite.com
          </div>
          <div className="text-xs font-semibold text-sky-400 truncate">
            {title || 'Título da sua Página'}
          </div>
          <div className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
            {description || 'A descrição do seu bio site aparecerá aqui quando enviado por mensagem.'}
          </div>
        </div>
      </div>
    </div>
  );
};
