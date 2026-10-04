import { DetectedSiteData, DetectedWhatsApp, DetectedSocial, DetectedImage, DetectedService, DetectedColor, CssVariable } from '../types';
import { extractConfigFromHtml } from './safeJsParser';
import { parseWhatsAppUrl, isWhatsAppUrl } from './whatsappHelper';

/**
 * Analyzes HTML content and extracts structured information without modifying the source.
 */
export function analyzeHtml(html: string): DetectedSiteData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Check for CONFIG or CONFIGURACAO object
  const configModel = extractConfigFromHtml(html);

  // 1. Meta / SEO
  const titleEl = doc.querySelector('title');
  const pageTitle = titleEl?.textContent?.trim() || '';

  const metaDesc = doc.querySelector('meta[name="description"]') || doc.querySelector('meta[property="og:description"]');
  const pageDescription = metaDesc?.getAttribute('content')?.trim() || '';

  const faviconEl = doc.querySelector('link[rel="icon"]') || doc.querySelector('link[rel="shortcut icon"]');
  const favicon = faviconEl?.getAttribute('href') || '';

  // 2. Company Name
  let companyName = '';
  if (configModel?.data) {
    companyName =
      configModel.data.nome ||
      configModel.data.empresa ||
      configModel.data.titulo ||
      configModel.data.name ||
      '';
  }

  if (!companyName) {
    const brandEl =
      doc.querySelector('[data-role="brand"]') ||
      doc.querySelector('.brand-name, .logo-text, .company-name, .profile-name, h1');
    companyName = brandEl?.textContent?.trim() || pageTitle.split(/[-–|]/)[0]?.trim() || 'Meu Negócio';
  }

  // 3. WhatsApp Buttons
  const whatsAppButtons: DetectedWhatsApp[] = [];
  const allLinks = Array.from(doc.querySelectorAll('a'));

  allLinks.forEach((a, index) => {
    const href = a.getAttribute('href') || '';
    const text = a.textContent?.trim() || '';
    const isWa = isWhatsAppUrl(href) || /whatsapp|zap|agendar|agendamento/i.test(text);

    if (isWa) {
      const parsed = parseWhatsAppUrl(href);
      whatsAppButtons.push({
        id: a.getAttribute('data-bio-id') || `wa-btn-${index}`,
        elementText: text || 'Conversar no WhatsApp',
        originalHref: href,
        type: parsed.type,
        ddi: parsed.ddi,
        ddd: parsed.ddd,
        phone: parsed.number,
        message: parsed.message,
        isShortLink: parsed.isShortLink,
      });
    }
  });

  // 4. Social Links
  const socialLinks: DetectedSocial[] = [];
  allLinks.forEach((a, index) => {
    const href = a.getAttribute('href') || '';
    const lowerHref = href.toLowerCase();
    const text = a.textContent?.trim() || '';

    let platform: DetectedSocial['platform'] | null = null;
    let label = text || 'Link';

    if (lowerHref.includes('instagram.com')) {
      platform = 'instagram';
      label = label || 'Instagram';
    } else if (lowerHref.includes('facebook.com')) {
      platform = 'facebook';
      label = label || 'Facebook';
    } else if (lowerHref.includes('tiktok.com')) {
      platform = 'tiktok';
      label = label || 'TikTok';
    } else if (lowerHref.includes('youtube.com')) {
      platform = 'youtube';
      label = label || 'YouTube';
    } else if (lowerHref.includes('twitter.com') || lowerHref.includes('x.com')) {
      platform = 'twitter';
      label = label || 'X / Twitter';
    } else if (lowerHref.includes('linkedin.com')) {
      platform = 'linkedin';
      label = label || 'LinkedIn';
    } else if (lowerHref.includes('google.com/maps') || lowerHref.includes('goo.gl/maps') || lowerHref.includes('waze.com')) {
      platform = 'maps';
      label = label || 'Localização no Mapa';
    }

    if (platform) {
      socialLinks.push({
        id: a.getAttribute('data-bio-id') || `social-${index}`,
        platform,
        label,
        href,
      });
    }
  });

  // 5. Images
  const images: DetectedImage[] = [];
  const allImgs = Array.from(doc.querySelectorAll('img'));

  allImgs.forEach((img, index) => {
    const src = img.getAttribute('src') || '';
    if (!src) return;

    const alt = img.getAttribute('alt') || '';
    const className = (img.getAttribute('class') || '').toLowerCase();
    const parentClass = (img.parentElement?.getAttribute('class') || '').toLowerCase();

    let role: DetectedImage['role'] = 'other';

    if (className.includes('logo') || parentClass.includes('logo') || /logo/i.test(alt)) {
      role = 'logo';
    } else if (className.includes('avatar') || className.includes('profile') || /perfil|foto/i.test(alt)) {
      role = 'avatar';
    } else if (className.includes('hero') || className.includes('banner') || /banner|destaque/i.test(alt)) {
      role = 'hero';
    } else if (
      className.includes('carousel') ||
      className.includes('slide') ||
      className.includes('swiper') ||
      parentClass.includes('carousel') ||
      parentClass.includes('slide') ||
      parentClass.includes('swiper')
    ) {
      role = 'gallery';
    } else if (className.includes('service') || parentClass.includes('service') || /serviço/i.test(alt)) {
      role = 'service';
    }

    images.push({
      id: img.getAttribute('data-bio-id') || `img-${index}`,
      src,
      alt,
      role,
      width: img.getAttribute('width') || undefined,
      height: img.getAttribute('height') || undefined,
      isCarouselItem: role === 'gallery',
    });
  });

  // 6. Services & Prices
  const services: DetectedService[] = [];
  // If config has services array
  if (configModel?.data) {
    const cfgServices =
      configModel.data.servicos ||
      configModel.data.services ||
      configModel.data.itens;

    if (Array.isArray(cfgServices)) {
      cfgServices.forEach((s: any, idx: number) => {
        services.push({
          id: `cfg-service-${idx}`,
          title: s.nome || s.titulo || s.title || `Serviço ${idx + 1}`,
          price: s.preco || s.valor || s.price || '',
          description: s.descricao || s.description || '',
          duration: s.tempo || s.duracao || s.duration || '',
          buttonHref: s.link || s.url || '',
        });
      });
    }
  }

  // If no services from config, search DOM for service cards
  if (services.length === 0) {
    const serviceCards = Array.from(
      doc.querySelectorAll('.service-card, .service-item, .servico, [data-role="service"]')
    );

    serviceCards.forEach((card, idx) => {
      const titleEl = card.querySelector('h3, h4, .service-title, strong');
      const priceEl = card.querySelector('.price, .preco, .service-price, span');
      const descEl = card.querySelector('p, .service-desc');
      const btnEl = card.querySelector('a, button');

      const title = titleEl?.textContent?.trim() || '';
      if (title) {
        services.push({
          id: card.getAttribute('data-bio-id') || `dom-service-${idx}`,
          title,
          price: priceEl?.textContent?.trim() || '',
          description: descEl?.textContent?.trim() || '',
          buttonHref: btnEl?.getAttribute('href') || undefined,
        });
      }
    });
  }

  // 7. Colors & CSS Variables
  const colorMap = new Map<string, number>();
  const hexPattern = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
  const rgbPattern = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+\s*)?\)/gi;

  const styleTags = Array.from(doc.querySelectorAll('style'));
  let allCssText = styleTags.map(s => s.textContent || '').join('\n');

  // Add inline styles
  doc.querySelectorAll('[style]').forEach(el => {
    allCssText += ' ' + (el.getAttribute('style') || '');
  });

  const hexMatches = allCssText.match(hexPattern) || [];
  hexMatches.forEach(hex => {
    const normalized = hex.toUpperCase();
    colorMap.set(normalized, (colorMap.get(normalized) || 0) + 1);
  });

  // Extract CSS variables (--primary: #..., --bg: ...)
  const cssVariables: CssVariable[] = [];
  const varPattern = /(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  let varMatch: RegExpExecArray | null;
  while ((varMatch = varPattern.exec(allCssText)) !== null) {
    const name = varMatch[1].trim();
    const value = varMatch[2].trim();
    if (!cssVariables.some(v => v.name === name)) {
      cssVariables.push({ name, value });
    }
  }

  const colors: DetectedColor[] = Array.from(colorMap.entries())
    .map(([hex, count]) => ({
      hex,
      count,
      role: (count > 4 ? 'primary' : 'other') as 'primary' | 'other',
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 16);

  // 8. Carousel Detection
  const carouselContainer = doc.querySelector('.carousel, .swiper, .slider, .slideshow, [data-carousel]');
  let carousel: DetectedSiteData['carousel'] = null;

  if (carouselContainer) {
    const slideImgs = Array.from(carouselContainer.querySelectorAll('img')).map(
      img => img.getAttribute('src') || ''
    ).filter(Boolean);

    carousel = {
      detected: true,
      slideCount: slideImgs.length,
      images: slideImgs,
      autoplay: true,
      interval: 4000,
    };
  } else if (configModel?.data?.fotosCarrossel || configModel?.data?.galeria) {
    const photos = configModel.data.fotosCarrossel || configModel.data.galeria;
    if (Array.isArray(photos)) {
      carousel = {
        detected: true,
        slideCount: photos.length,
        images: photos,
        autoplay: true,
        interval: 4000,
      };
    }
  }

  return {
    companyName,
    pageTitle,
    pageDescription,
    favicon,
    whatsAppButtons,
    socialLinks,
    images,
    services,
    colors,
    cssVariables,
    configModel,
    carousel,
  };
}
