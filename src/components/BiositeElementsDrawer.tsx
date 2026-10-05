import React, { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  MessageCircle,
  Link as LinkIcon,
  Type,
  Palette,
  Upload,
  Check,
  ExternalLink,
  Sparkles,
  Search,
  Eye,
} from 'lucide-react';
import { analyzeHtml } from '../utils/htmlAnalyzer';
import { buildWhatsAppUrl, parseWhatsAppUrl } from '../utils/whatsappHelper';

interface BiositeElementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  onUpdateAttribute: (bioId: string, attr: string, value: string) => void;
  onUpdateText: (bioId: string, text: string) => void;
  onUpdateStyle: (bioId: string, property: string, value: string) => void;
  onUpdateWhatsAppGlobal: (phoneUrl: string, rawPhone: string, message: string) => void;
  onReplaceColorGlobal: (oldColor: string, newColor: string) => void;
  onSelectElementInPreview: (bioId: string) => void;
}

export const BiositeElementsDrawer: React.FC<BiositeElementsDrawerProps> = ({
  isOpen,
  onClose,
  htmlContent,
  onUpdateAttribute,
  onUpdateText,
  onUpdateStyle,
  onUpdateWhatsAppGlobal,
  onReplaceColorGlobal,
  onSelectElementInPreview,
}) => {
  const [activeTab, setActiveTab] = useState<'images' | 'whatsapp' | 'links' | 'texts' | 'colors'>('images');
  const [searchFilter, setSearchFilter] = useState('');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Parse HTML into live DOM for deep element extraction
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const detected = analyzeHtml(htmlContent);

  // 1. Extract all images and carousel slides
  const allImagesList: Array<{
    bioId: string;
    src: string;
    alt: string;
    label: string;
    isCarousel: boolean;
    isBackground: boolean;
    elementTag: string;
  }> = [];

  // Find all <img> tags
  doc.querySelectorAll('img').forEach((img, idx) => {
    const src = img.getAttribute('src') || '';
    if (!src) return;
    const bioId = img.getAttribute('data-bio-id') || `img-${idx}`;
    const alt = img.getAttribute('alt') || '';
    const parent = img.parentElement;
    const parentClass = (parent?.className || '').toString().toLowerCase();
    const isCarousel =
      parentClass.includes('slide') ||
      parentClass.includes('swiper') ||
      parentClass.includes('carousel') ||
      img.className.toLowerCase().includes('carousel') ||
      img.className.toLowerCase().includes('slide') ||
      !!img.closest('.carousel, .swiper, .slider, [data-carousel]');

    let label = `Foto ${allImagesList.length + 1}`;
    if (isCarousel) {
      label = `Carrossel (Foto ${allImagesList.length + 1})`;
    } else if (alt) {
      label = alt.length > 25 ? alt.substring(0, 25) + '...' : alt;
    } else if (img.className.toLowerCase().includes('logo') || parentClass.includes('logo')) {
      label = 'Logotipo';
    } else if (img.className.toLowerCase().includes('avatar') || img.className.toLowerCase().includes('profile')) {
      label = 'Foto de Perfil';
    }

    allImagesList.push({
      bioId,
      src,
      alt,
      label,
      isCarousel,
      isBackground: false,
      elementTag: 'img',
    });
  });

  // Find elements with inline background-image
  doc.querySelectorAll('[style*="background-image"], [style*="url("]').forEach((el, idx) => {
    const styleAttr = el.getAttribute('style') || '';
    const match = styleAttr.match(/url\(["']?([^"']+)["']?\)/);
    if (match && match[1]) {
      const bioId = el.getAttribute('data-bio-id') || `bg-${idx}`;
      const src = match[1];
      const isCarousel = el.className.toLowerCase().includes('slide') || el.className.toLowerCase().includes('carousel');
      allImagesList.push({
        bioId,
        src,
        alt: 'Imagem de Fundo',
        label: isCarousel ? `Carrossel Fundo ${idx + 1}` : `Fundo / Seção ${idx + 1}`,
        isCarousel,
        isBackground: true,
        elementTag: el.tagName.toLowerCase(),
      });
    }
  });

  // 2. Extract all WhatsApp links
  const allWhatsAppList: Array<{
    bioId: string;
    text: string;
    href: string;
    parsedPhone: string;
    parsedMsg: string;
  }> = [];

  doc.querySelectorAll('a').forEach((a, idx) => {
    const href = a.getAttribute('href') || '';
    const text = a.textContent?.trim() || '';
    if (href.includes('wa.me') || href.includes('whatsapp') || href.includes('wa.link') || /whatsapp|agendar/i.test(text)) {
      const bioId = a.getAttribute('data-bio-id') || `wa-${idx}`;
      const parsed = parseWhatsAppUrl(href);
      const cleanPhone = `${parsed.ddi || '55'}${parsed.ddd || '11'}${parsed.number || ''}`;
      allWhatsAppList.push({
        bioId,
        text: text || 'Conversar no WhatsApp',
        href,
        parsedPhone: cleanPhone,
        parsedMsg: parsed.message || '',
      });
    }
  });

  // 3. Extract other Buttons & Links
  const allLinksList: Array<{
    bioId: string;
    text: string;
    href: string;
    isButton: boolean;
  }> = [];

  doc.querySelectorAll('a, button').forEach((el, idx) => {
    const href = el.getAttribute('href') || '';
    const text = el.textContent?.trim() || '';
    if (el.tagName.toLowerCase() === 'a' && (href.includes('wa.me') || href.includes('whatsapp'))) {
      return; // Already in WhatsApp tab
    }
    if (text || href) {
      allLinksList.push({
        bioId: el.getAttribute('data-bio-id') || `link-${idx}`,
        text: text || el.getAttribute('aria-label') || 'Link',
        href,
        isButton: el.tagName.toLowerCase() === 'button' || el.classList.contains('btn'),
      });
    }
  });

  // 4. Extract Titles and Main Paragraphs
  const allTextsList: Array<{
    bioId: string;
    tagName: string;
    text: string;
  }> = [];

  doc.querySelectorAll('h1, h2, h3, h4, p').forEach((el, idx) => {
    const text = el.textContent?.trim() || '';
    if (text.length > 2 && text.length < 400) {
      allTextsList.push({
        bioId: el.getAttribute('data-bio-id') || `text-${idx}`,
        tagName: el.tagName.toUpperCase(),
        text,
      });
    }
  });

  // Handlers
  const handleUpdateImageSrc = (bioId: string, newSrc: string, isBackground: boolean) => {
    if (!newSrc.trim()) return;
    if (isBackground) {
      onUpdateStyle(bioId, 'backgroundImage', `url("${newSrc.trim()}")`);
    } else {
      onUpdateAttribute(bioId, 'src', newSrc.trim());
    }
    setSavedFeedback(bioId);
    setTimeout(() => setSavedFeedback(null), 2000);
  };

  const handleFileUpload = (bioId: string, isBackground: boolean, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        handleUpdateImageSrc(bioId, dataUrl, isBackground);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0e0e0e] border-l border-neutral-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250 select-none">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EFFF00] text-black font-extrabold flex items-center justify-center text-sm shadow-[0_0_12px_rgba(239,255,0,0.35)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Elementos do Biosite
              </h3>
              <p className="text-[11px] text-neutral-400">
                Puxamos todos os elementos do modelo para você editar facilmente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 bg-[#0a0a0a] px-3 pt-2 gap-1 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('images')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'images'
                ? 'border-[#EFFF00] text-[#EFFF00]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Fotos & Carrossel ({allImagesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'whatsapp'
                ? 'border-[#EFFF00] text-[#EFFF00]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp ({allWhatsAppList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'links'
                ? 'border-[#EFFF00] text-[#EFFF00]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Botões & Links ({allLinksList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('texts')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'texts'
                ? 'border-[#EFFF00] text-[#EFFF00]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Textos ({allTextsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('colors')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'colors'
                ? 'border-[#EFFF00] text-[#EFFF00]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Cores ({detected.colors.length})</span>
          </button>
        </div>

        {/* Search filter */}
        <div className="p-3 border-b border-neutral-800/80 bg-[#0e0e0e]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
            <input
              type="text"
              placeholder="Filtrar elementos..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#141414] border border-neutral-800 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-[#EFFF00] transition-colors"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB 1: IMAGES & CAROUSEL */}
          {activeTab === 'images' && (
            <div className="space-y-3">
              <div className="p-2.5 bg-[#EFFF00]/10 border border-[#EFFF00]/30 rounded-xl text-[11px] text-[#EFFF00] flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  Você pode <strong>subir outra imagem</strong> do seu aparelho ou <strong>colar o link de hospedagem</strong> em qualquer foto abaixo.
                </span>
              </div>

              {allImagesList.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  Nenhuma imagem encontrada no código HTML.
                </div>
              ) : (
                allImagesList
                  .filter((item) =>
                    searchFilter ? item.label.toLowerCase().includes(searchFilter.toLowerCase()) || item.src.toLowerCase().includes(searchFilter.toLowerCase()) : true
                  )
                  .map((item, idx) => (
                    <ImageElementCard
                      key={item.bioId + idx}
                      item={item}
                      onUpdateSrc={(newSrc) => handleUpdateImageSrc(item.bioId, newSrc, item.isBackground)}
                      onUploadFile={(file) => handleFileUpload(item.bioId, item.isBackground, file)}
                      onLocate={() => {
                        onSelectElementInPreview(item.bioId);
                        onClose();
                      }}
                      isSaved={savedFeedback === item.bioId}
                    />
                  ))
              )}
            </div>
          )}

          {/* TAB 2: WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-3">
              {allWhatsAppList.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  Nenhum botão de WhatsApp detectado.
                </div>
              ) : (
                allWhatsAppList
                  .filter((w) =>
                    searchFilter ? w.text.toLowerCase().includes(searchFilter.toLowerCase()) || w.parsedPhone.includes(searchFilter) : true
                  )
                  .map((w, idx) => (
                    <WhatsAppElementCard
                      key={w.bioId + idx}
                      item={w}
                      onUpdateWhatsAppGlobal={onUpdateWhatsAppGlobal}
                      onLocate={() => {
                        onSelectElementInPreview(w.bioId);
                        onClose();
                      }}
                    />
                  ))
              )}
            </div>
          )}

          {/* TAB 3: BUTTONS & LINKS */}
          {activeTab === 'links' && (
            <div className="space-y-3">
              {allLinksList
                .filter((l) =>
                  searchFilter ? l.text.toLowerCase().includes(searchFilter.toLowerCase()) || l.href.toLowerCase().includes(searchFilter.toLowerCase()) : true
                )
                .map((l, idx) => (
                  <div key={l.bioId + idx} className="p-3 bg-[#141414] border border-neutral-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate max-w-[240px]">
                        {l.text}
                      </span>
                      <button
                        onClick={() => {
                          onSelectElementInPreview(l.bioId);
                          onClose();
                        }}
                        className="text-[10px] text-[#EFFF00] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400">Texto do botão:</label>
                      <input
                        type="text"
                        defaultValue={l.text}
                        onBlur={(e) => onUpdateText(l.bioId, e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-[#EFFF00]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400">Link de destino (URL):</label>
                      <input
                        type="text"
                        defaultValue={l.href}
                        onBlur={(e) => onUpdateAttribute(l.bioId, 'href', e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-2 py-1 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#EFFF00]"
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* TAB 4: TEXTS */}
          {activeTab === 'texts' && (
            <div className="space-y-3">
              {allTextsList
                .filter((t) => (searchFilter ? t.text.toLowerCase().includes(searchFilter.toLowerCase()) : true))
                .map((t, idx) => (
                  <div key={t.bioId + idx} className="p-3 bg-[#141414] border border-neutral-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 font-mono text-neutral-300">
                        {t.tagName}
                      </span>
                      <button
                        onClick={() => {
                          onSelectElementInPreview(t.bioId);
                          onClose();
                        }}
                        className="text-[10px] text-[#EFFF00] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver</span>
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      defaultValue={t.text}
                      onBlur={(e) => onUpdateText(t.bioId, e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-[#EFFF00] resize-none"
                    />
                  </div>
                ))}
            </div>
          )}

          {/* TAB 5: COLORS */}
          {activeTab === 'colors' && (
            <div className="space-y-3">
              <p className="text-[11px] text-neutral-400">
                Altere qualquer cor utilizada no biosite para que seja atualizada em todos os lugares:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {detected.colors.map((c, idx) => (
                  <div key={c.hex + idx} className="p-2.5 bg-[#141414] border border-neutral-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg border border-neutral-700 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div>
                        <span className="font-mono text-xs text-neutral-200">{c.hex}</span>
                        <span className="block text-[9px] text-neutral-500">{c.count} usos</span>
                      </div>
                    </div>

                    <input
                      type="color"
                      defaultValue={c.hex}
                      onChange={(e) => onReplaceColorGlobal(c.hex, e.target.value)}
                      className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer p-0.5"
                      title="Substituir esta cor globalmente"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-[#111111] flex items-center justify-between text-[11px] text-neutral-400">
          <span>{allImagesList.length} fotos detectadas no modelo</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual image card with URL or Upload options
const ImageElementCard: React.FC<{
  item: {
    bioId: string;
    src: string;
    alt: string;
    label: string;
    isCarousel: boolean;
    isBackground: boolean;
  };
  onUpdateSrc: (newSrc: string) => void;
  onUploadFile: (file: File) => void;
  onLocate: () => void;
  isSaved: boolean;
}> = ({ item, onUpdateSrc, onUploadFile, onLocate, isSaved }) => {
  const [urlInput, setUrlInput] = useState(item.src);

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onUpdateSrc(urlInput.trim());
    }
  };

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        item.isCarousel
          ? 'bg-[#151515] border-[#EFFF00]/30 ring-1 ring-[#EFFF00]/10'
          : 'bg-[#141414] border-neutral-800'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {item.isCarousel && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFFF00] text-black">
              Carrossel
            </span>
          )}
          <span className="font-semibold text-white text-xs truncate max-w-[200px]">
            {item.label}
          </span>
        </div>

        <button
          onClick={onLocate}
          className="text-[10px] text-[#EFFF00] hover:underline flex items-center gap-1 cursor-pointer"
          title="Ver este elemento no preview"
        >
          <Eye className="w-3 h-3" />
          <span>Ver no preview</span>
        </button>
      </div>

      <div className="flex items-start gap-3">
        {/* Thumbnail Preview */}
        <div className="w-16 h-16 rounded-lg bg-black border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center relative">
          <img src={item.src} alt="" className="w-full h-full object-cover" />
          {isSaved && (
            <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center text-white">
              <Check className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Inputs & Actions */}
        <div className="flex-1 space-y-2">
          {/* Option A: Link de hospedagem */}
          <div>
            <label className="block text-[10px] text-neutral-400 mb-0.5">
              Link de hospedagem da imagem:
            </label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyUrl()}
                placeholder="https://..."
                className="flex-1 bg-[#0a0a0a] border border-neutral-800 rounded-lg px-2 py-1 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#EFFF00]"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium cursor-pointer transition-colors shrink-0"
              >
                Aplicar
              </button>
            </div>
          </div>

          {/* Option B: Subir arquivo do dispositivo */}
          <div className="flex items-center gap-2">
            <label className="flex-1 py-1 px-2.5 rounded-lg bg-[#EFFF00]/10 hover:bg-[#EFFF00]/20 border border-[#EFFF00]/40 text-[#EFFF00] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Subir foto do dispositivo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadFile(file);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for WhatsApp element card
const WhatsAppElementCard: React.FC<{
  item: {
    bioId: string;
    text: string;
    href: string;
    parsedPhone: string;
    parsedMsg: string;
  };
  onUpdateWhatsAppGlobal: (phoneUrl: string, rawPhone: string, message: string) => void;
  onLocate: () => void;
}> = ({ item, onUpdateWhatsAppGlobal, onLocate }) => {
  const [phone, setPhone] = useState(item.parsedPhone || '5511999999999');
  const [msg, setMsg] = useState(item.parsedMsg || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const rawClean = phone.replace(/\D/g, '');
    const cleanMsg = encodeURIComponent(msg);
    const newUrl = `https://wa.me/${rawClean}${cleanMsg ? `?text=${cleanMsg}` : ''}`;
    onUpdateWhatsAppGlobal(newUrl, rawClean, msg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-3 bg-[#141414] border border-neutral-800 rounded-xl space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-emerald-400 flex items-center gap-1 text-xs">
          <MessageCircle className="w-3.5 h-3.5" />
          {item.text}
        </span>
        <button
          onClick={onLocate}
          className="text-[10px] text-[#EFFF00] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-3 h-3" />
          <span>Ver</span>
        </button>
      </div>

      <div className="space-y-1.5">
        <div>
          <label className="text-[10px] text-neutral-400 block mb-0.5">
            Número do WhatsApp (DDI + DDD + Número):
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="5511999999999"
            className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-2.5 py-1 text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#EFFF00]"
          />
        </div>

        <div>
          <label className="text-[10px] text-neutral-400 block mb-0.5">
            Mensagem inicial automática:
          </label>
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Olá! Gostaria de mais informações..."
            className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-[#EFFF00]"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
        >
          {saved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Salvo com sucesso!</span>
            </>
          ) : (
            <span>Atualizar em todos os botões</span>
          )}
        </button>
      </div>
    </div>
  );
};
