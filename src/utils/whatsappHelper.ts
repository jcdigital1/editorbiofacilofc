/**
 * Utilities for parsing, validating, and generating WhatsApp links
 */

export interface ParsedWhatsAppUrl {
  isWhatsApp: boolean;
  type: 'wame' | 'api' | 'walink' | 'other';
  ddi: string;
  ddd: string;
  number: string;
  fullPhone: string;
  message: string;
  isShortLink: boolean;
}

/**
 * Checks if a URL or text is a WhatsApp link
 */
export function isWhatsAppUrl(href: string): boolean {
  if (!href) return false;
  const lower = href.toLowerCase();
  return (
    lower.includes('wa.me') ||
    lower.includes('api.whatsapp.com') ||
    lower.includes('wa.link') ||
    lower.includes('whatsapp.com/send') ||
    lower.startsWith('whatsapp://')
  );
}

/**
 * Parses an existing WhatsApp URL
 */
export function parseWhatsAppUrl(href: string): ParsedWhatsAppUrl {
  const result: ParsedWhatsAppUrl = {
    isWhatsApp: false,
    type: 'other',
    ddi: '55',
    ddd: '',
    number: '',
    fullPhone: '',
    message: '',
    isShortLink: false,
  };

  if (!href || !isWhatsAppUrl(href)) {
    return result;
  }

  result.isWhatsApp = true;

  try {
    const url = new URL(href.startsWith('http') ? href : `https://${href}`);

    // wa.link (e.g. https://wa.link/abc123)
    if (url.hostname.includes('wa.link')) {
      result.type = 'walink';
      result.isShortLink = true;
      return result;
    }

    // api.whatsapp.com/send?phone=...&text=...
    if (url.hostname.includes('api.whatsapp.com') || url.pathname.includes('/send')) {
      result.type = 'api';
      const phoneParam = url.searchParams.get('phone') || '';
      const textParam = url.searchParams.get('text') || '';
      result.message = decodeURIComponent(textParam);
      extractPhoneParts(phoneParam, result);
      return result;
    }

    // wa.me/<number>?text=...
    if (url.hostname.includes('wa.me')) {
      result.type = 'wame';
      const pathPhone = url.pathname.replace(/^\//, '');
      const textParam = url.searchParams.get('text') || '';
      result.message = decodeURIComponent(textParam);
      extractPhoneParts(pathPhone, result);
      return result;
    }
  } catch {
    // If not a valid standard URL, try regex fallback
    const digitsOnly = href.replace(/\D/g, '');
    if (digitsOnly.length >= 10) {
      extractPhoneParts(digitsOnly, result);
    }
  }

  return result;
}

function extractPhoneParts(rawPhone: string, out: ParsedWhatsAppUrl) {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return;

  out.fullPhone = digits;

  // Brazilian standard phone parsing:
  // Usually starts with 55 (Brazil DDI), then 2 digits DDD, then 8 or 9 digits number
  if (digits.startsWith('55') && digits.length >= 12) {
    out.ddi = '55';
    out.ddd = digits.slice(2, 4);
    out.number = digits.slice(4);
  } else if (digits.length === 10 || digits.length === 11) {
    // Missing DDI, assume Brazil 55
    out.ddi = '55';
    out.ddd = digits.slice(0, 2);
    out.number = digits.slice(2);
  } else {
    // Non-standard or international
    out.ddi = digits.slice(0, 2);
    out.number = digits.slice(2);
  }
}

/**
 * Builds a clean wa.me URL
 */
export function buildWhatsAppUrl(ddi: string, ddd: string, number: string, message?: string): string {
  const cleanDdi = (ddi || '55').replace(/\D/g, '');
  const cleanDdd = (ddd || '').replace(/\D/g, '');
  let cleanNumber = (number || '').replace(/\D/g, '');

  // Prevent duplicating DDI if user accidentally typed it in number or ddd
  if (cleanNumber.startsWith(cleanDdi) && cleanNumber.length > 10) {
    cleanNumber = cleanNumber.slice(cleanDdi.length);
  }

  const fullPhone = `${cleanDdi}${cleanDdd}${cleanNumber}`;

  if (!fullPhone || fullPhone === cleanDdi) {
    return 'https://wa.me/';
  }

  if (message && message.trim()) {
    const encoded = encodeURIComponent(message.trim());
    return `https://wa.me/${fullPhone}?text=${encoded}`;
  }

  return `https://wa.me/${fullPhone}`;
}

/**
 * Validates Brazilian phone numbers (DDD 10-99 and 8 or 9 digits)
 */
export function validateBrazilianPhone(ddd: string, number: string): { isValid: boolean; error?: string } {
  const cleanDdd = ddd.replace(/\D/g, '');
  const cleanNumber = number.replace(/\D/g, '');

  if (!cleanDdd) {
    return { isValid: false, error: 'Informe o DDD (ex: 11)' };
  }

  const dddNum = parseInt(cleanDdd, 10);
  if (cleanDdd.length !== 2 || dddNum < 11 || dddNum > 99) {
    return { isValid: false, error: 'DDD brasileiro inválido (deve ter 2 dígitos entre 11 e 99)' };
  }

  if (!cleanNumber) {
    return { isValid: false, error: 'Informe o número do celular ou fixo' };
  }

  if (cleanNumber.length !== 8 && cleanNumber.length !== 9) {
    return { isValid: false, error: 'O número nacional deve ter 8 ou 9 dígitos' };
  }

  return { isValid: true };
}

/**
 * Formats a phone number for display: (11) 98765-4321
 */
export function formatPhoneForDisplay(ddd: string, number: string): string {
  const cleanDdd = ddd.replace(/\D/g, '');
  const cleanNum = number.replace(/\D/g, '');

  if (!cleanDdd && !cleanNum) return '';

  if (cleanNum.length === 9) {
    return `(${cleanDdd}) ${cleanNum.slice(0, 5)}-${cleanNum.slice(5)}`;
  } else if (cleanNum.length === 8) {
    return `(${cleanDdd}) ${cleanNum.slice(0, 4)}-${cleanNum.slice(4)}`;
  }

  return `(${cleanDdd}) ${cleanNum}`;
}
