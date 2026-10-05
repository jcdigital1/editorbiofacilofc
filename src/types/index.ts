export type DeviceMode = 'mobile' | 'tablet' | 'desktop';
export type EditorMode = 'edit' | 'test';
export type SidebarTab = 'fields' | 'inspector' | 'colors' | 'seo' | 'projects';

export interface WhatsAppConfig {
  ddi: string; // e.g. "55"
  ddd: string; // e.g. "11"
  number: string; // e.g. "987654321"
  message: string;
  applyToAll: boolean;
}

export interface DetectedWhatsApp {
  id: string; // data-bio-id or selector
  elementText: string;
  originalHref: string;
  type: 'wame' | 'api' | 'walink' | 'custom' | 'other';
  ddi?: string;
  ddd?: string;
  phone?: string;
  message?: string;
  isShortLink: boolean;
}

export interface DetectedSocial {
  id: string;
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'maps' | 'link';
  label: string;
  href: string;
}

export interface DetectedImage {
  id: string;
  src: string;
  alt: string;
  role: 'logo' | 'hero' | 'gallery' | 'service' | 'avatar' | 'other';
  width?: string;
  height?: string;
  isCarouselItem?: boolean;
}

export interface DetectedService {
  id: string;
  title: string;
  price?: string;
  description?: string;
  duration?: string;
  buttonHref?: string;
}

export interface DetectedColor {
  hex: string;
  count: number;
  role: 'background' | 'text' | 'primary' | 'other';
}

export interface CssVariable {
  name: string;
  value: string;
}

export interface ConfigModelInfo {
  variableName: 'CONFIG' | 'CONFIGURACAO';
  data: Record<string, any>;
  scriptTagIndex: number;
  rawJsSnippet: string;
}

export interface DetectedSiteData {
  companyName: string;
  pageTitle: string;
  pageDescription: string;
  favicon: string;
  whatsAppButtons: DetectedWhatsApp[];
  socialLinks: DetectedSocial[];
  images: DetectedImage[];
  services: DetectedService[];
  colors: DetectedColor[];
  cssVariables: CssVariable[];
  configModel: ConfigModelInfo | null;
  carousel: {
    detected: boolean;
    slideCount: number;
    images: string[];
    autoplay?: boolean;
    interval?: number;
  } | null;
}

export interface BreadcrumbItem {
  id: string;
  tagName: string;
  preview: string;
}

export interface SelectedElementProperties {
  bioId: string;
  tagName: string;
  textNodeContent: string; // The primary direct text node (icons preserved)
  fullTextContent: string;
  hasChildElements: boolean;
  childTags: string[];
  attributes: Record<string, string>;
  styles: {
    color: string;
    backgroundColor: string;
    fontSize: string;
    fontFamily: string;
    fontWeight: string;
    textAlign: string;
    borderRadius: string;
    padding: string;
    margin: string;
    border: string;
    display: string;
    objectFit?: string;
  };
  ancestors: BreadcrumbItem[];
  rect?: {
    top: number;
    left: number;
    width: number;
    height: number;
    bottom: number;
    right: number;
  };
  isLink: boolean;
  isButton: boolean;
  isImage: boolean;
  imageSrc?: string;
  targetImageBioId?: string;
  hasBackgroundImage?: boolean;
  backgroundImageSrc?: string;
  isCarousel?: boolean;
  carouselInfo?: {
    totalSlides: number;
    currentIndex: number;
    carouselBioId?: string;
    slides: Array<{
      bioId: string;
      src: string;
      alt?: string;
      isBackground?: boolean;
      active?: boolean;
    }>;
  };
  isWhatsApp: boolean;
  whatsAppData?: {
    ddi?: string;
    ddd?: string;
    phone?: string;
    message?: string;
    isShortLink?: boolean;
  };
}

export interface ProjectData {
  id: string;
  name: string;
  htmlContent: string;
  updatedAt: number;
  isConfigDriven?: boolean;
}
