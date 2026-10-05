import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Type,
  Link as LinkIcon,
  Image as ImageIcon,
  Palette,
  ArrowUp,
  Upload,
  MessageCircle,
  Check,
  Trash2,
  Copy,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { SelectedElementProperties } from '../types';
import { buildWhatsAppUrl, parseWhatsAppUrl, validateBrazilianPhone, formatPhoneForDisplay } from '../utils/whatsappHelper';

interface FloatingToolbarProps {
  element: SelectedElementProperties;
  onClose: () => void;
  onSelectParent: () => void;
  onUpdateText: (bioId: string, text: string) => void;
  onUpdateAttribute: (bioId: string, attr: string, value: string) => void;
  onUpdateStyle: (bioId: string, property: string, value: string) => void;
  onUpdateWhatsAppGlobal: (phoneUrl: string, rawPhone: string, message: string) => void;
  onDeleteElement: (bioId: string) => void;
  onDuplicateElement: (bioId: string) => void;
  onSelectElement?: (bioId: string) => void;
  iframeRect?: DOMRect | null;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  element,
  onClose,
  onSelectParent,
  onUpdateText,
  onUpdateAttribute,
  onUpdateStyle,
  onUpdateWhatsAppGlobal,
  onDeleteElement,
  onDuplicateElement,
  onSelectElement,
  iframeRect,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Editable local values
  const [textValue, setTextValue] = useState(element.textNodeContent || element.fullTextContent);
  const [linkValue, setLinkValue] = useState(element.attributes.href || '');
  const [imageSrc, setImageSrc] = useState(element.attributes.src || element.backgroundImageSrc || '');
  const [imageSaved, setImageSaved] = useState(false);

  // Detect type
  const isImage = element.isImage || element.hasBackgroundImage;
  const isBodyOrSection =
    element.tagName === 'body' ||
    element.tagName === 'section' ||
    element.tagName === 'main' ||
    element.tagName === 'header' ||
    element.tagName === 'footer' ||
    element.bioId === 'bio-body';

  const isLinkOrButton = element.isLink || element.isButton || element.tagName === 'a';
  const isWhatsApp =
    element.isWhatsApp ||
    linkValue.includes('wa.me') ||
    linkValue.includes('whatsapp') ||
    linkValue.includes('wa.link');

  // WhatsApp sub-state
  const [waMode, setWaMode] = useState<'phone' | 'custom'>(isWhatsApp ? 'phone' : 'phone');
  const [waDdi, setWaDdi] = useState('55');
  const [waDdd, setWaDdd] = useState('11');
  const [waNumber, setWaNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [waApplyAll, setWaApplyAll] = useState(false);
  const [waSaved, setWaSaved] = useState(false);
  const [waError, setWaError] = useState<string | null>(null);

  // Sync state when element changes
  useEffect(() => {
    setTextValue(element.textNodeContent || element.fullTextContent);
    setLinkValue(element.attributes.href || '');
    const currentImg = element.attributes.src || element.backgroundImageSrc || '';
    setImageSrc(currentImg);

    if (element.attributes.href) {
      const parsed = parseWhatsAppUrl(element.attributes.href);
      if (parsed.isWhatsApp) {
        setWaDdi(parsed.ddi || '55');
        setWaDdd(parsed.ddd || '11');
        setWaNumber(parsed.number || '');
        setWaMessage(parsed.message || '');
        if (parsed.isShortLink) {
          setWaMode('custom');
        }
      }
    }
  }, [element]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // If clicked inside iframe, preview script handles selection
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApplyWhatsApp = () => {
    setWaError(null);
    let finalUrl = '';

    if (waMode === 'phone') {
      const validation = validateBrazilianPhone(waDdd, waNumber);
      if (!validation.isValid && waDdi === '55') {
        setWaError(validation.error || 'Número de telefone inválido');
        return;
      }
      finalUrl = buildWhatsAppUrl(waDdi, waDdd, waNumber, waMessage);
    } else {
      finalUrl = linkValue;
    }

    setLinkValue(finalUrl);

    if (waApplyAll) {
      const fullPhone = `${waDdi}${waDdd}${waNumber}`;
      onUpdateWhatsAppGlobal(finalUrl, fullPhone, waMessage);
    } else {
      onUpdateAttribute(element.bioId, 'href', finalUrl);
    }

    setWaSaved(true);
    setTimeout(() => setWaSaved(false), 2000);
  };

  const handleApplyImageSrc = (targetSrc: string) => {
    const finalUrl = targetSrc.trim();
    if (!finalUrl) return;

    setImageSrc(finalUrl);

    if (element.hasBackgroundImage || element.tagName !== 'img') {
      onUpdateStyle(element.bioId, 'backgroundImage', `url("${finalUrl}")`);
      onUpdateStyle(element.bioId, 'backgroundSize', 'cover');
      onUpdateStyle(element.bioId, 'backgroundPosition', 'center');
    } else {
      onUpdateAttribute(element.bioId, 'src', finalUrl);
    }

    setImageSaved(true);
    setTimeout(() => setImageSaved(false), 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        handleApplyImageSrc(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Calculate position on desktop near clicked element
  const getDesktopPositionStyle = (): React.CSSProperties => {
    if (!element.rect || !iframeRect) {
      return { top: 70, right: 24 };
    }

    // Relative to viewport
    const elemTopInViewport = iframeRect.top + element.rect.top;
    const elemLeftInViewport = iframeRect.left + element.rect.left;

    let top = elemTopInViewport;
    let left = elemLeftInViewport + element.rect.width + 16;

    // Boundary clamps
    const popoverWidth = 330;
    const popoverHeight = 360;

    if (left + popoverWidth > window.innerWidth - 16) {
      left = Math.max(16, elemLeftInViewport - popoverWidth - 16);
    }

    if (top + popoverHeight > window.innerHeight - 20) {
      top = Math.max(70, window.innerHeight - popoverHeight - 20);
    }

    top = Math.max(70, top);

    return {
      top: `${top}px`,
      left: `${left}px`,
      position: 'fixed',
    };
  };

  return (
    <div
      ref={containerRef}
      style={window.innerWidth >= 768 ? getDesktopPositionStyle() : undefined}
      className={`z-50 bg-[#121212] border border-[#2a2a2a] text-neutral-100 shadow-[0_12px_40px_rgba(0,0,0,0.85)] animate-in fade-in duration-150 select-none ${
        window.innerWidth < 768
          ? 'fixed bottom-0 left-0 right-0 rounded-t-2xl max-h-[80vh] overflow-y-auto p-4 border-t-2 border-t-[#EFFF00]'
          : 'w-[340px] rounded-2xl p-4 max-h-[85vh] overflow-y-auto ring-1 ring-[#EFFF00]/30'
      }`}
    >
      {/* Header of Floating Box */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EFFF00] shadow-[0_0_8px_#EFFF00]"></span>
          <span className="font-bold text-xs uppercase tracking-wider text-[#EFFF00]">
            {isBodyOrSection
              ? 'Fundo / Área'
              : isImage
              ? 'Imagem / Logo'
              : isWhatsApp
              ? 'WhatsApp'
              : isLinkOrButton
              ? 'Botão / Link'
              : 'Texto'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Action: Select Area (Parent) */}
          {element.ancestors.length > 0 && element.tagName !== 'body' && (
            <button
              onClick={onSelectParent}
              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors"
              title="Selecionar o contêiner ao redor deste elemento"
            >
              <ArrowUp className="w-3 h-3 text-[#EFFF00]" />
              <span>Selecionar área</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
            title="Fechar controles"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body of Floating Box - Only Context-Relevant Controls */}
      <div className="py-3 space-y-3.5 text-xs">
        {/* 1. TEXT CONTROLS */}
        {!isImage && !isBodyOrSection && (
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-neutral-300">
              Texto
            </label>
            <textarea
              rows={2}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onBlur={() => onUpdateText(element.bioId, textValue)}
              placeholder="Digite o novo texto..."
              className="w-full bg-[#080808] border border-neutral-800 rounded-xl p-2.5 text-neutral-100 text-xs focus:outline-none focus:border-[#EFFF00] transition-colors resize-none"
            />

            {/* Quick text color and size */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400">Cor:</span>
                <input
                  type="color"
                  defaultValue={element.styles.color.startsWith('#') ? element.styles.color : '#ffffff'}
                  onChange={(e) => onUpdateStyle(element.bioId, 'color', e.target.value)}
                  className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer p-0.5"
                />
              </div>

              {/* Font size presets */}
              <div className="flex items-center gap-1 bg-[#080808] p-0.5 rounded-lg border border-neutral-800">
                <button
                  type="button"
                  onClick={() => onUpdateStyle(element.bioId, 'fontSize', '13px')}
                  className="px-2 py-0.5 text-[10px] text-neutral-400 hover:text-white rounded"
                >
                  P
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStyle(element.bioId, 'fontSize', '16px')}
                  className="px-2 py-0.5 text-[10px] text-neutral-400 hover:text-white rounded"
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStyle(element.bioId, 'fontSize', '22px')}
                  className="px-2 py-0.5 text-[10px] text-neutral-400 hover:text-white rounded font-bold"
                >
                  G
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. IMAGE OR LOGO CONTROLS */}
        {isImage && (
          <div className="space-y-3.5">
            {/* Carousel Slide Switcher */}
            {element.isCarousel && element.carouselInfo && element.carouselInfo.slides.length > 0 && (
              <div className="p-2.5 bg-[#080808] rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#EFFF00] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Fotos do Carrossel ({element.carouselInfo.slides.length})
                  </span>
                  <span className="text-[10px] text-neutral-400">Clique na foto para editar</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                  {element.carouselInfo.slides.map((slide, idx) => {
                    const isCurrent = slide.active || slide.bioId === element.bioId;
                    return (
                      <button
                        key={slide.bioId || idx}
                        type="button"
                        onClick={() => {
                          if (onSelectElement && slide.bioId) {
                            onSelectElement(slide.bioId);
                          }
                        }}
                        className={`relative shrink-0 w-13 h-13 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-[#EFFF00] ring-2 ring-[#EFFF00]/40 scale-105'
                            : 'border-neutral-700/60 hover:border-neutral-400 opacity-70 hover:opacity-100'
                        }`}
                        title={`Slide ${idx + 1}`}
                      >
                        <img src={slide.src} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 right-0 bg-black/85 text-[9px] px-1 font-mono text-white rounded-tl">
                          {idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Image Preview */}
            <div className="relative w-full h-28 bg-[#080808] rounded-xl border border-neutral-800 flex items-center justify-center p-2 overflow-hidden">
              <img
                src={imageSrc}
                alt="Prévia"
                className="max-h-full max-w-full object-contain rounded"
              />
              {imageSaved && (
                <div className="absolute inset-0 bg-emerald-500/80 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold gap-1.5 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>Foto atualizada!</span>
                </div>
              )}
            </div>

            {/* Option A: Upload file from computer / mobile */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1.5">
                Opção 1: Subir outra imagem
              </label>
              <label className="w-full py-2 px-3 bg-[#EFFF00]/10 hover:bg-[#EFFF00]/20 border border-[#EFFF00]/40 hover:border-[#EFFF00] text-[#EFFF00] rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 font-bold text-xs shadow-sm">
                <Upload className="w-4 h-4" />
                <span>Escolher foto do dispositivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Option B: Enter image hosting link */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-neutral-300">
                Opção 2: Link de hospedagem da imagem
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={imageSrc}
                  onChange={(e) => setImageSrc(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyImageSrc(imageSrc)}
                  placeholder="https://exemplo.com/sua-foto.jpg"
                  className="flex-1 bg-[#080808] border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#EFFF00]"
                />
                <button
                  type="button"
                  onClick={() => handleApplyImageSrc(imageSrc)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0"
                >
                  Aplicar
                </button>
              </div>
            </div>

            {/* Object Fit Controls */}
            <div className="space-y-1 pt-1 border-t border-neutral-800/80">
              <span className="text-[11px] text-neutral-400">Enquadramento da foto:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateStyle(element.bioId, 'objectFit', 'cover')}
                  className="flex-1 py-1 bg-[#080808] hover:bg-neutral-800 border border-neutral-800 rounded-lg text-center text-[11px] text-neutral-300 hover:text-white"
                >
                  Preencher
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStyle(element.bioId, 'objectFit', 'contain')}
                  className="flex-1 py-1 bg-[#080808] hover:bg-neutral-800 border border-neutral-800 rounded-lg text-center text-[11px] text-neutral-300 hover:text-white"
                >
                  Conter
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStyle(element.bioId, 'borderRadius', '9999px')}
                  className="flex-1 py-1 bg-[#080808] hover:bg-neutral-800 border border-neutral-800 rounded-lg text-center text-[11px] text-neutral-300 hover:text-white"
                >
                  Redondo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. BUTTON & LINK CONTROLS */}
        {isLinkOrButton && !isImage && (
          <div className="space-y-3 pt-1 border-t border-neutral-800">
            {/* WhatsApp Specific Controls */}
            {isWhatsApp ? (
              <div className="space-y-2.5 bg-[#080808] p-3 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWaMode(waMode === 'phone' ? 'custom' : 'phone')}
                    className="text-[10px] text-neutral-400 hover:text-white underline"
                  >
                    {waMode === 'phone' ? 'Usar link personalizado' : 'Digitar número'}
                  </button>
                </div>

                {waMode === 'phone' ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-1.5">
                      <div className="col-span-1">
                        <label className="block text-[10px] text-neutral-500 mb-0.5">DDI</label>
                        <input
                          type="text"
                          value={waDdi}
                          onChange={(e) => setWaDdi(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-[#141414] border border-neutral-800 rounded px-1.5 py-1 text-center font-mono text-xs"
                          placeholder="55"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] text-neutral-500 mb-0.5">DDD</label>
                        <input
                          type="text"
                          maxLength={2}
                          value={waDdd}
                          onChange={(e) => setWaDdd(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-[#141414] border border-neutral-800 rounded px-1.5 py-1 text-center font-mono text-xs"
                          placeholder="11"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-neutral-500 mb-0.5">Telefone</label>
                        <input
                          type="text"
                          maxLength={11}
                          value={waNumber}
                          onChange={(e) => setWaNumber(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-[#141414] border border-neutral-800 rounded px-2 py-1 font-mono text-xs focus:border-[#EFFF00]"
                          placeholder="99999-8888"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-400 mb-0.5">Mensagem opcional</label>
                      <input
                        type="text"
                        value={waMessage}
                        onChange={(e) => setWaMessage(e.target.value)}
                        placeholder="Ex: Olá, gostaria de saber mais..."
                        className="w-full bg-[#141414] border border-neutral-800 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-0.5">Link direto</label>
                    <input
                      type="text"
                      value={linkValue}
                      onChange={(e) => setLinkValue(e.target.value)}
                      placeholder="https://wa.link/..."
                      className="w-full bg-[#141414] border border-neutral-800 rounded px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                )}

                {waError && (
                  <div className="text-[11px] text-rose-400 font-medium">
                    {waError}
                  </div>
                )}

                {waSaved && (
                  <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>WhatsApp atualizado!</span>
                  </div>
                )}

                {/* Option to apply to all or current only */}
                <div className="pt-1 space-y-1.5">
                  <label className="flex items-center gap-2 text-[11px] text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waApplyAll}
                      onChange={(e) => setWaApplyAll(e.target.checked)}
                      className="rounded bg-[#080808] border-neutral-700 text-[#EFFF00] focus:ring-0"
                    />
                    <span>Atualizar em todos os botões de WhatsApp</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleApplyWhatsApp}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Salvar contato</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Link Destination */
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-neutral-300">
                  Destino do link
                </label>
                <input
                  type="text"
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  onBlur={() => onUpdateAttribute(element.bioId, 'href', linkValue)}
                  placeholder="https://..."
                  className="w-full bg-[#080808] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#EFFF00]"
                />
              </div>
            )}

            {/* Button Background & Text Colors */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400">Fundo:</span>
                <input
                  type="color"
                  defaultValue={element.styles.backgroundColor.startsWith('#') ? element.styles.backgroundColor : '#ffffff'}
                  onChange={(e) => onUpdateStyle(element.bioId, 'backgroundColor', e.target.value)}
                  className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer p-0.5"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400">Texto:</span>
                <input
                  type="color"
                  defaultValue={element.styles.color.startsWith('#') ? element.styles.color : '#000000'}
                  onChange={(e) => onUpdateStyle(element.bioId, 'color', e.target.value)}
                  className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer p-0.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. SECTION / BODY / BACKGROUND CONTROLS */}
        {isBodyOrSection && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-neutral-300">
                Cor de Fundo da Página / Seção
              </label>
              <div className="flex items-center gap-3 bg-[#080808] p-2 rounded-xl border border-neutral-800">
                <input
                  type="color"
                  defaultValue={element.styles.backgroundColor.startsWith('#') ? element.styles.backgroundColor : '#000000'}
                  onChange={(e) => onUpdateStyle(element.bioId, 'backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-700 bg-transparent cursor-pointer p-0.5"
                />
                <span className="font-mono text-xs text-neutral-300">
                  {element.styles.backgroundColor}
                </span>
              </div>
            </div>

            {/* Padding / Espaçamento */}
            <div className="space-y-1">
              <span className="text-[11px] text-neutral-400">Espaçamento interno:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateStyle(element.bioId, 'padding', '12px')}
                  className="flex-1 py-1 bg-[#080808] hover:bg-neutral-800 border border-neutral-800 rounded text-center text-[11px]"
                >
                  Compacto
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStyle(element.bioId, 'padding', '24px 16px')}
                  className="flex-1 py-1 bg-[#080808] hover:bg-neutral-800 border border-neutral-800 rounded text-center text-[11px]"
                >
                  Padrão
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStyle(element.bioId, 'padding', '48px 20px')}
                  className="flex-1 py-1 bg-[#080808] hover:bg-neutral-800 border border-neutral-800 rounded text-center text-[11px]"
                >
                  Amplo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions (Duplicar, Excluir) */}
      {element.tagName !== 'body' && (
        <div className="pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs">
          <button
            onClick={() => onDuplicateElement(element.bioId)}
            className="text-neutral-400 hover:text-white flex items-center gap-1 py-1 px-1.5 rounded transition-colors text-[11px]"
          >
            <Copy className="w-3 h-3 text-[#EFFF00]" />
            <span>Duplicar</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Deseja excluir este elemento?')) {
                onDeleteElement(element.bioId);
              }
            }}
            className="text-neutral-500 hover:text-rose-400 flex items-center gap-1 py-1 px-1.5 rounded transition-colors text-[11px]"
          >
            <Trash2 className="w-3 h-3" />
            <span>Excluir</span>
          </button>
        </div>
      )}
    </div>
  );
};
