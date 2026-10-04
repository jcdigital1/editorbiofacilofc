import React, { useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, ShieldAlert } from 'lucide-react';
import { DeviceMode, EditorMode } from '../types';
import { generatePreviewInjectionScript } from '../utils/previewScript';

interface PreviewCanvasProps {
  htmlContent: string;
  deviceMode: DeviceMode;
  editorMode: EditorMode;
  onElementSelected: (elementData: any) => void;
  onHtmlUpdatedFromIframe: (newHtml: string) => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onIframeRectChange?: (rect: DOMRect | null) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  htmlContent,
  deviceMode,
  editorMode,
  onElementSelected,
  onHtmlUpdatedFromIframe,
  iframeRef,
  onIframeRectChange,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [hasScriptError, setHasScriptError] = useState(false);

  // Inject preview script into html before feeding to iframe
  const preparePreviewHtml = (rawHtml: string): string => {
    const injectionScript = generatePreviewInjectionScript(editorMode);
    const scriptTag = `<script id="bio-studio-preview-script">\n${injectionScript}\n</script>`;

    if (rawHtml.includes('</body>')) {
      return rawHtml.replace('</body>', `${scriptTag}\n</body>`);
    }
    return `${rawHtml}\n${scriptTag}`;
  };

  // Reload iframe content
  const updateIframeContent = () => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    try {
      doc.open();
      doc.write(preparePreviewHtml(htmlContent));
      doc.close();
      setHasScriptError(false);

      if (onIframeRectChange && iframeRef.current) {
        onIframeRectChange(iframeRef.current.getBoundingClientRect());
      }
    } catch (err) {
      console.error('Error writing to preview iframe:', err);
      setHasScriptError(true);
    }
  };

  useEffect(() => {
    updateIframeContent();
  }, [htmlContent, editorMode]);

  // Keep track of iframe rect on window resize
  useEffect(() => {
    const updateRect = () => {
      if (iframeRef.current && onIframeRectChange) {
        onIframeRectChange(iframeRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [onIframeRectChange]);

  // Listen for messages from preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'BIO_ELEMENT_SELECTED') {
        if (iframeRef.current && onIframeRectChange) {
          onIframeRectChange(iframeRef.current.getBoundingClientRect());
        }
        onElementSelected(data.payload);
      } else if (data.type === 'BIO_HTML_UPDATED') {
        onHtmlUpdatedFromIframe(data.html);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onElementSelected, onHtmlUpdatedFromIframe, onIframeRectChange]);

  const isMobile = deviceMode === 'mobile';

  return (
    <div className="relative flex-1 h-full bg-[#080808] overflow-hidden flex flex-col items-center justify-center p-2 sm:p-6 md:p-8">
      {hasScriptError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-rose-950/90 border border-rose-800 text-rose-200 px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xl">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Aviso: Alguns scripts externos bloquearam a injeção do preview. O editor permanece funcional.</span>
        </div>
      )}

      {/* Frame Container */}
      <div
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
        className={`relative transition-all duration-300 flex items-center justify-center ${
          isMobile
            ? 'w-[390px] h-[844px] max-w-full rounded-[42px] p-3 bg-[#111111] border-4 border-[#222222] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-[#333333]'
            : 'w-full h-full rounded-xl overflow-hidden border border-[#1f1f1f] shadow-2xl'
        }`}
      >
        {/* Mobile Camera notch */}
        {isMobile && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 flex items-center justify-center pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c1c] mr-2"></div>
            <div className="w-8 h-1 rounded-full bg-[#1c1c1c]"></div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          title="Bio Site Preview"
          style={{
            width: isMobile ? '390px' : '100%',
            height: isMobile ? '844px' : '100%',
            maxWidth: '100%',
            minHeight: isMobile ? '844px' : '100%',
          }}
          className={`border-0 bg-white transition-all ${
            isMobile ? 'rounded-[32px]' : 'rounded-lg'
          }`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>

      {/* Subtle Floating Zoom Controls on Bottom Right */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center bg-[#141414]/90 backdrop-blur border border-neutral-800 rounded-lg p-1 text-xs text-neutral-400 shadow-lg">
        <button
          onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
          className="p-1 hover:text-white transition-colors"
          title="Diminuir zoom"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="px-1.5 font-mono text-[10px] text-neutral-300 w-9 text-center">
          {zoomLevel}%
        </span>
        <button
          onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
          className="p-1 hover:text-white transition-colors"
          title="Aumentar zoom"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoomLevel(100)}
          className="p-1 hover:text-white border-l border-neutral-800 transition-colors ml-0.5"
          title="100%"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
