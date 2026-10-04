import React, { useState } from 'react';
import {
  Building2,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Scissors,
  Settings2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { DetectedSiteData } from '../../types';
import { buildWhatsAppUrl, validateBrazilianPhone, formatPhoneForDisplay } from '../../utils/whatsappHelper';

interface DetectedFieldsPanelProps {
  data: DetectedSiteData;
  onUpdateCompanyName: (name: string) => void;
  onUpdateWhatsAppGlobal: (phoneUrl: string, rawPhone: string, message: string) => void;
  onUpdateSocialLink: (id: string, newHref: string) => void;
  onUpdateImageSrc: (id: string, newSrc: string, newAlt?: string) => void;
  onUpdateService: (index: number, updatedService: any) => void;
  onSelectElementInPreview: (elementId: string) => void;
  onAddCarouselImage?: (url: string) => void;
  onRemoveCarouselImage?: (index: number) => void;
}

export const DetectedFieldsPanel: React.FC<DetectedFieldsPanelProps> = ({
  data,
  onUpdateCompanyName,
  onUpdateWhatsAppGlobal,
  onUpdateSocialLink,
  onUpdateImageSrc,
  onUpdateService,
  onSelectElementInPreview,
  onAddCarouselImage,
  onRemoveCarouselImage,
}) => {
  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    company: true,
    whatsapp: true,
    social: true,
    images: true,
    services: true,
    config: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // WhatsApp form state
  const primaryWa = data.whatsAppButtons[0];
  const [waMode, setWaMode] = useState<'phone' | 'custom'>(
    primaryWa?.isShortLink ? 'custom' : 'phone'
  );
  const [waDdi, setWaDdi] = useState(primaryWa?.ddi || '55');
  const [waDdd, setWaDdd] = useState(primaryWa?.ddd || '11');
  const [waNumber, setWaNumber] = useState(primaryWa?.phone || '');
  const [waMessage, setWaMessage] = useState(primaryWa?.message || '');
  const [waCustomUrl, setWaCustomUrl] = useState(primaryWa?.originalHref || '');
  const [waSuccess, setWaSuccess] = useState(false);
  const [waError, setWaError] = useState<string | null>(null);

  // New carousel image url input
  const [newSlideUrl, setNewSlideUrl] = useState('');

  const handleApplyWhatsApp = (applyToAll: boolean) => {
    setWaError(null);

    let finalUrl = '';
    if (waMode === 'phone') {
      const validation = validateBrazilianPhone(waDdd, waNumber);
      if (!validation.isValid && waDdi === '55') {
        setWaError(validation.error || 'Número inválido');
        return;
      }
      finalUrl = buildWhatsAppUrl(waDdi, waDdd, waNumber, waMessage);
    } else {
      if (!waCustomUrl.trim()) {
        setWaError('Informe a URL personalizada');
        return;
      }
      finalUrl = waCustomUrl.trim();
    }

    const fullPhone = `${waDdi}${waDdd}${waNumber}`;
    onUpdateWhatsAppGlobal(finalUrl, fullPhone, waMessage);
    setWaSuccess(true);
    setTimeout(() => setWaSuccess(false), 2500);
  };

  const handleFileUpload = (elementId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateImageSrc(elementId, dataUrl, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-none">
      {/* Dynamic Config Banner if model uses CONFIG */}
      {data.configModel && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-neutral-200 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="font-semibold text-neutral-100 flex items-center gap-1.5">
              <span>Modelo Dinâmico Detectado</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {data.configModel.variableName}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              As alterações feitas aqui sincronizam perfeitamente tanto o HTML renderizado quanto o código JavaScript do objeto de configuração (sem usar eval).
            </p>
          </div>
        </div>
      )}

      {/* 1. Empresa & Título */}
      <div className="border border-neutral-800 bg-neutral-900/60 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('company')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-neutral-200 hover:bg-neutral-800/40 transition-colors font-medium"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Nome da Empresa e Título</span>
          </div>
          {openSections.company ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {openSections.company && (
          <div className="p-3.5 border-t border-neutral-800 space-y-3 bg-neutral-900/30">
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                Nome do Negócio
              </label>
              <input
                type="text"
                defaultValue={data.companyName}
                onBlur={(e) => onUpdateCompanyName(e.target.value)}
                placeholder="Ex: Barbearia Dom Pedro"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. WhatsApp por Número */}
      <div className="border border-neutral-800 bg-neutral-900/60 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('whatsapp')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-neutral-200 hover:bg-neutral-800/40 transition-colors font-medium"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp e Agendamento</span>
            <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">
              {data.whatsAppButtons.length} botão(ões)
            </span>
          </div>
          {openSections.whatsapp ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {openSections.whatsapp && (
          <div className="p-3.5 border-t border-neutral-800 space-y-3 bg-neutral-900/30">
            {/* Mode selection tabs */}
            <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              <button
                type="button"
                onClick={() => setWaMode('phone')}
                className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                  waMode === 'phone'
                    ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Informar Telefone
              </button>
              <button
                type="button"
                onClick={() => setWaMode('custom')}
                className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                  waMode === 'custom'
                    ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Link Personalizado (wa.link)
              </button>
            </div>

            {waMode === 'phone' ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      DDI
                    </label>
                    <input
                      type="text"
                      value={waDdi}
                      onChange={(e) => setWaDdi(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-center text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                      placeholder="55"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      DDD
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={waDdd}
                      onChange={(e) => setWaDdd(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-center text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                      placeholder="11"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Número (8 ou 9 dígitos)
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                      placeholder="987654321"
                    />
                  </div>
                </div>

                {waDdd && waNumber && (
                  <div className="text-[11px] text-neutral-400 flex items-center justify-between px-1">
                    <span>Formato nacional:</span>
                    <span className="font-mono text-emerald-400">
                      {formatPhoneForDisplay(waDdd, waNumber)}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Mensagem Inicial Automática (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="Ex: Olá, gostaria de agendar um horário..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-100 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  URL Encurtada ou Personalizada
                </label>
                <input
                  type="text"
                  value={waCustomUrl}
                  onChange={(e) => setWaCustomUrl(e.target.value)}
                  placeholder="https://wa.link/..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 focus:outline-none focus:border-amber-500 font-mono"
                />
                <p className="mt-1 text-[10px] text-neutral-500">
                  Links do tipo wa.link são preservados sem sobrescrever seu destino.
                </p>
              </div>
            )}

            {waError && (
              <div className="p-2 bg-rose-950/80 border border-rose-800 text-rose-300 rounded text-[11px]">
                {waError}
              </div>
            )}

            {waSuccess && (
              <div className="p-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Endereço do WhatsApp atualizado em todo o site!</span>
              </div>
            )}

            <button
              onClick={() => handleApplyWhatsApp(true)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Atualizar Botões de WhatsApp</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Redes Sociais */}
      <div className="border border-neutral-800 bg-neutral-900/60 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('social')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-neutral-200 hover:bg-neutral-800/40 transition-colors font-medium"
        >
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-sky-400" />
            <span>Redes Sociais e Destinos</span>
            <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">
              {data.socialLinks.length}
            </span>
          </div>
          {openSections.social ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {openSections.social && (
          <div className="p-3.5 border-t border-neutral-800 space-y-2.5 bg-neutral-900/30">
            {data.socialLinks.length === 0 ? (
              <p className="text-[11px] text-neutral-500 italic">Nenhum link social externo detectado.</p>
            ) : (
              data.socialLinks.map((social) => (
                <div key={social.id} className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-200 capitalize">
                      {social.platform}: {social.label}
                    </span>
                    <button
                      onClick={() => onSelectElementInPreview(social.id)}
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Inspecionar
                    </button>
                  </div>
                  <input
                    type="text"
                    defaultValue={social.href}
                    onBlur={(e) => onUpdateSocialLink(social.id, e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-[11px] text-neutral-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 4. Imagens & Carrossel */}
      <div className="border border-neutral-800 bg-neutral-900/60 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('images')}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-neutral-200 hover:bg-neutral-800/40 transition-colors font-medium"
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span>Imagens, Logo e Galeria</span>
            <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">
              {data.images.length}
            </span>
          </div>
          {openSections.images ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {openSections.images && (
          <div className="p-3.5 border-t border-neutral-800 space-y-3 bg-neutral-900/30">
            {data.images.map((img, idx) => (
              <div key={img.id || idx} className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0">
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-200 capitalize truncate">
                        {img.role === 'logo' ? 'Logo Principal' : img.role === 'avatar' ? 'Foto de Perfil' : `Imagem ${idx + 1}`}
                      </span>
                      <button
                        onClick={() => onSelectElementInPreview(img.id)}
                        className="text-[10px] text-amber-400 hover:underline"
                      >
                        Selecionar
                      </button>
                    </div>
                    <span className="text-[10px] text-neutral-500 truncate block">
                      {img.alt || 'Sem texto alt'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={img.src}
                      onBlur={(e) => onUpdateImageSrc(img.id, e.target.value)}
                      placeholder="URL da imagem (https://...)"
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-[11px] text-neutral-300 font-mono focus:outline-none focus:border-amber-500"
                    />

                    {/* Upload File button */}
                    <label className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded cursor-pointer transition-colors flex items-center gap-1 shrink-0 text-[11px]">
                      <Upload className="w-3 h-3" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(img.id, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {/* If Carousel exists */}
            {data.carousel && (
              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <div className="font-semibold text-neutral-200 flex items-center justify-between">
                  <span>Carrossel de Slides ({data.carousel.slideCount} slides)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newSlideUrl}
                    onChange={(e) => setNewSlideUrl(e.target.value)}
                    placeholder="URL de nova foto para a galeria"
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-[11px] text-neutral-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => {
                      if (newSlideUrl.trim() && onAddCarouselImage) {
                        onAddCarouselImage(newSlideUrl.trim());
                        setNewSlideUrl('');
                      }
                    }}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium rounded flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Serviços e Preços */}
      {data.services.length > 0 && (
        <div className="border border-neutral-800 bg-neutral-900/60 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('services')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-neutral-200 hover:bg-neutral-800/40 transition-colors font-medium"
          >
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-400" />
              <span>Serviços e Preços</span>
              <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">
                {data.services.length} itens
              </span>
            </div>
            {openSections.services ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {openSections.services && (
            <div className="p-3.5 border-t border-neutral-800 space-y-3 bg-neutral-900/30">
              {data.services.map((svc, idx) => (
                <div key={svc.id || idx} className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200">Item #{idx + 1}</span>
                    <button
                      onClick={() => onSelectElementInPreview(svc.id)}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Inspecionar
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] text-neutral-500 mb-0.5">Título do Serviço</label>
                      <input
                        type="text"
                        defaultValue={svc.title}
                        onBlur={(e) => onUpdateService(idx, { ...svc, title: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-100 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] text-neutral-500 mb-0.5">Preço</label>
                      <input
                        type="text"
                        defaultValue={svc.price}
                        onBlur={(e) => onUpdateService(idx, { ...svc, price: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-100 text-xs font-mono focus:outline-none focus:border-amber-500 text-right"
                      />
                    </div>
                  </div>

                  {svc.description !== undefined && (
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-0.5">Descrição</label>
                      <input
                        type="text"
                        defaultValue={svc.description}
                        onBlur={(e) => onUpdateService(idx, { ...svc, description: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-neutral-300 text-[11px] focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
