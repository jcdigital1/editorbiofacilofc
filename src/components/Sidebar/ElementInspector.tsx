import React, { useState, useEffect } from 'react';
import {
  MousePointerClick,
  ArrowUp,
  Type,
  Link as LinkIcon,
  Image as ImageIcon,
  Palette,
  Layout,
  Copy,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SelectedElementProperties } from '../../types';
import { buildWhatsAppUrl, parseWhatsAppUrl, validateBrazilianPhone, formatPhoneForDisplay } from '../../utils/whatsappHelper';

interface ElementInspectorProps {
  element: SelectedElementProperties | null;
  onSelectParent: () => void;
  onSelectAncestor: (bioId: string) => void;
  onUpdateText: (bioId: string, text: string) => void;
  onUpdateAttribute: (bioId: string, attr: string, value: string) => void;
  onUpdateStyle: (bioId: string, property: string, value: string) => void;
  onDeleteElement: (bioId: string) => void;
  onDuplicateElement: (bioId: string) => void;
}

export const ElementInspector: React.FC<ElementInspectorProps> = ({
  element,
  onSelectParent,
  onSelectAncestor,
  onUpdateText,
  onUpdateAttribute,
  onUpdateStyle,
  onDeleteElement,
  onDuplicateElement,
}) => {
  if (!element) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-500 text-xs">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3 text-neutral-400">
          <MousePointerClick className="w-6 h-6 text-amber-500/70" />
        </div>
        <div className="font-medium text-neutral-300 mb-1">Nenhum elemento selecionado</div>
        <p className="max-w-[220px] text-[11px] text-neutral-400 leading-relaxed">
          No preview ao lado, clique em qualquer texto, botão, imagem ou bloco para inspecionar e editar suas propriedades visuais.
        </p>
      </div>
    );
  }

  // Local state for instant editing
  const [textInput, setTextInput] = useState(element.textNodeContent || element.fullTextContent);
  const [hrefInput, setHrefInput] = useState(element.attributes.href || '');
  const [srcInput, setSrcInput] = useState(element.attributes.src || '');
  const [altInput, setAltInput] = useState(element.attributes.alt || '');

  // WhatsApp helper inside inspector
  const isWhatsAppLink = element.isWhatsApp || hrefInput.includes('wa.me') || hrefInput.includes('whatsapp');
  const [waMode, setWaMode] = useState<'phone' | 'custom'>(isWhatsAppLink ? 'phone' : 'custom');
  const [waDdi, setWaDdi] = useState('55');
  const [waDdd, setWaDdd] = useState('11');
  const [waNumber, setWaNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [waSuccess, setWaSuccess] = useState(false);

  useEffect(() => {
    setTextInput(element.textNodeContent || element.fullTextContent);
    setHrefInput(element.attributes.href || '');
    setSrcInput(element.attributes.src || '');
    setAltInput(element.attributes.alt || '');

    if (element.attributes.href) {
      const parsed = parseWhatsAppUrl(element.attributes.href);
      if (parsed.isWhatsApp) {
        setWaDdi(parsed.ddi || '55');
        setWaDdd(parsed.ddd || '11');
        setWaNumber(parsed.number || '');
        setWaMessage(parsed.message || '');
        setWaMode(parsed.isShortLink ? 'custom' : 'phone');
      }
    }
  }, [element]);

  const handleApplyWhatsApp = () => {
    let finalUrl = '';
    if (waMode === 'phone') {
      const validation = validateBrazilianPhone(waDdd, waNumber);
      if (!validation.isValid && waDdi === '55') {
        alert(validation.error || 'Número de telefone inválido');
        return;
      }
      finalUrl = buildWhatsAppUrl(waDdi, waDdd, waNumber, waMessage);
    } else {
      finalUrl = hrefInput;
    }
    setHrefInput(finalUrl);
    onUpdateAttribute(element.bioId, 'href', finalUrl);
    setWaSuccess(true);
    setTimeout(() => setWaSuccess(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSrcInput(dataUrl);
        onUpdateAttribute(element.bioId, 'src', dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-none">
      {/* Element Identification & Breadcrumb */}
      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
              &lt;{element.tagName}&gt;
            </span>
            {element.attributes.id && (
              <span className="text-neutral-400">#{element.attributes.id}</span>
            )}
          </div>

          {/* Navigate to parent element */}
          {element.ancestors.length > 0 && (
            <button
              onClick={onSelectParent}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
              title="Selecionar elemento pai na hierarquia HTML"
            >
              <ArrowUp className="w-3 h-3 text-amber-400" />
              <span>Elemento Pai</span>
            </button>
          )}
        </div>

        {/* Ancestor Breadcrumb Trail */}
        {element.ancestors.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-neutral-400 flex-wrap overflow-x-auto py-1">
            <span>Hierarquia:</span>
            {element.ancestors.slice().reverse().map((anc, idx) => (
              <React.Fragment key={anc.id || idx}>
                <button
                  onClick={() => onSelectAncestor(anc.id)}
                  className="hover:text-amber-400 hover:underline transition-colors font-mono"
                >
                  {anc.tagName}
                </button>
                <span className="text-neutral-600">&gt;</span>
              </React.Fragment>
            ))}
            <span className="text-amber-400 font-semibold font-mono">{element.tagName}</span>
          </div>
        )}
      </div>

      {/* 1. Text Content Editor (with child icon protection) */}
      {(element.textNodeContent || element.fullTextContent || !element.isImage) && (
        <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium text-neutral-200">
              <Type className="w-4 h-4 text-amber-400" />
              <span>Texto do Elemento</span>
            </div>
            {element.hasChildElements && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Ícones preservados
              </span>
            )}
          </div>

          <textarea
            rows={3}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onBlur={() => onUpdateText(element.bioId, textInput)}
            placeholder="Digite o texto aqui..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100 text-xs focus:outline-none focus:border-amber-500 resize-none transition-colors"
          />

          {element.hasChildElements && (
            <p className="text-[10px] text-neutral-400 leading-tight">
              Este elemento possui ícones ou formatação interna ({element.childTags.join(', ')}). Apenas o texto direto é alterado, mantendo seus ícones intactos!
            </p>
          )}
        </div>
      )}

      {/* 2. Link / Button / WhatsApp Properties */}
      {(element.isLink || element.isButton || element.tagName === 'a') && (
        <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium text-neutral-200">
              <LinkIcon className="w-4 h-4 text-emerald-400" />
              <span>Destino do Link (href)</span>
            </div>
            {isWhatsAppLink && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.5 rounded">
                WhatsApp
              </span>
            )}
          </div>

          {/* Toggle between Normal URL vs WhatsApp Generator */}
          <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              type="button"
              onClick={() => setWaMode('custom')}
              className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                waMode === 'custom'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              URL / Link Livre
            </button>
            <button
              type="button"
              onClick={() => setWaMode('phone')}
              className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                waMode === 'phone'
                  ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Gerar WhatsApp
            </button>
          </div>

          {waMode === 'custom' ? (
            <div className="space-y-2">
              <input
                type="text"
                value={hrefInput}
                onChange={(e) => setHrefInput(e.target.value)}
                onBlur={() => onUpdateAttribute(element.bioId, 'href', hrefInput)}
                placeholder="https://..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-neutral-400 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={element.attributes.target === '_blank'}
                    onChange={(e) =>
                      onUpdateAttribute(element.bioId, 'target', e.target.checked ? '_blank' : '')
                    }
                    className="rounded bg-neutral-950 border-neutral-800 text-amber-500 focus:ring-0"
                  />
                  <span>Abrir em nova aba (target="_blank")</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="block text-[10px] text-neutral-400 mb-0.5">DDI</label>
                  <input
                    type="text"
                    value={waDdi}
                    onChange={(e) => setWaDdi(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-center font-mono"
                    placeholder="55"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] text-neutral-400 mb-0.5">DDD</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={waDdd}
                    onChange={(e) => setWaDdd(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-center font-mono"
                    placeholder="11"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-neutral-400 mb-0.5">Número</label>
                  <input
                    type="text"
                    maxLength={11}
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 font-mono"
                    placeholder="987654321"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 mb-0.5">Mensagem Inicial</label>
                <textarea
                  rows={2}
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  placeholder="Olá, gostaria de agendar..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-xs resize-none"
                />
              </div>

              {waSuccess && (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Link de WhatsApp aplicado ao elemento!</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleApplyWhatsApp}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Aplicar Link WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Image Properties */}
      {element.isImage && (
        <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3">
          <div className="flex items-center gap-1.5 font-medium text-neutral-200">
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span>Propriedades da Imagem</span>
          </div>

          <div className="w-full h-32 bg-neutral-950 rounded-lg border border-neutral-800 overflow-hidden flex items-center justify-center relative">
            <img
              src={srcInput}
              alt={altInput}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[10px] text-neutral-400 mb-0.5">URL da Imagem</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={srcInput}
                  onChange={(e) => setSrcInput(e.target.value)}
                  onBlur={() => onUpdateAttribute(element.bioId, 'src', srcInput)}
                  placeholder="https://..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 font-mono text-[11px]"
                />
                <label className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded cursor-pointer transition-colors flex items-center gap-1 shrink-0 text-[11px]">
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 mb-0.5">Texto Alternativo (alt)</label>
              <input
                type="text"
                value={altInput}
                onChange={(e) => setAltInput(e.target.value)}
                onBlur={() => onUpdateAttribute(element.bioId, 'alt', altInput)}
                placeholder="Descrição acessível da imagem"
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs"
              />
            </div>

            {/* Object Fit */}
            <div>
              <label className="block text-[10px] text-neutral-400 mb-0.5">Enquadramento (object-fit)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['cover', 'contain', 'fill'] as const).map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => onUpdateStyle(element.bioId, 'objectFit', fit)}
                    className={`py-1 rounded text-center text-[11px] capitalize border ${
                      element.styles.objectFit === fit
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Visual Styles (Colors, Spacing, Border Radius) */}
      <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3">
        <div className="flex items-center gap-1.5 font-medium text-neutral-200">
          <Palette className="w-4 h-4 text-amber-400" />
          <span>Aparência e Estilos</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Text Color */}
          <div>
            <label className="block text-[10px] text-neutral-400 mb-1">Cor do Texto</label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                defaultValue="#ffffff"
                onChange={(e) => onUpdateStyle(element.bioId, 'color', e.target.value)}
                className="w-7 h-7 rounded border border-neutral-800 bg-transparent cursor-pointer p-0.5"
              />
              <span className="font-mono text-[11px] text-neutral-300 truncate">
                {element.styles.color}
              </span>
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-[10px] text-neutral-400 mb-1">Cor de Fundo</label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                defaultValue="#000000"
                onChange={(e) => onUpdateStyle(element.bioId, 'backgroundColor', e.target.value)}
                className="w-7 h-7 rounded border border-neutral-800 bg-transparent cursor-pointer p-0.5"
              />
              <span className="font-mono text-[11px] text-neutral-300 truncate">
                {element.styles.backgroundColor}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/80">
          {/* Border Radius */}
          <div>
            <label className="block text-[10px] text-neutral-400 mb-0.5">Arredondamento</label>
            <input
              type="text"
              defaultValue={element.styles.borderRadius}
              onBlur={(e) => onUpdateStyle(element.bioId, 'borderRadius', e.target.value)}
              placeholder="Ex: 12px ou 9999px"
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[11px] font-mono"
            />
          </div>

          {/* Padding */}
          <div>
            <label className="block text-[10px] text-neutral-400 mb-0.5">Espaçamento Interno</label>
            <input
              type="text"
              defaultValue={element.styles.padding}
              onBlur={(e) => onUpdateStyle(element.bioId, 'padding', e.target.value)}
              placeholder="Ex: 12px 16px"
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[11px] font-mono"
            />
          </div>
        </div>
      </div>

      {/* 5. Element Actions (Duplicate / Delete) */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={() => onDuplicateElement(element.bioId)}
          className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 text-xs"
        >
          <Copy className="w-3.5 h-3.5 text-amber-400" />
          <span>Duplicar</span>
        </button>

        <button
          onClick={() => {
            if (confirm('Tem certeza que deseja excluir este elemento?')) {
              onDeleteElement(element.bioId);
            }
          }}
          className="py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 text-xs"
          title="Excluir Elemento"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Excluir</span>
        </button>
      </div>
    </div>
  );
};
