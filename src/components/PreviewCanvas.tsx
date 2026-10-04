import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
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
  const [hasScriptError, setHasScriptError] = useState(false);

  // Inject preview script into html before feeding to iframe
  const preparePreviewHtml = (rawHtml: string): string => {
    const injectionScript = generatePreviewInjectionScript(editorMode);
    const scriptTag = `<script id="bio-studio-preview-script">\n${injectionScript}\n</script>`;

    // Ensure there is a viewport meta tag locking scale
    let htmlWithMeta = rawHtml;
    if (!htmlWithMeta.includes('name="viewport"')) {
      const metaTag = '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">';
      if (htmlWithMeta.includes('<head>')) {
        htmlWithMeta = htmlWithMeta.replace('<head>', `<head>\n  ${metaTag}`);
      }
    }

    if (htmlWithMeta.includes('</body>')) {
      return htmlWithMeta.replace('</body>', `${scriptTag}\n</body>`);
    }
    return `${htmlWithMeta}\n${scriptTag}`;
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
    <div className="relative flex-1 h-full w-full bg-[#080808] overflow-hidden flex items-center justify-center p-2 sm:p-4">
      {hasScriptError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-rose-950/90 border border-rose-800 text-rose-200 px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-xl">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Aviso: Alguns scripts externos bloquearam a injeção do preview. O editor permanece funcional.</span>
        </div>
      )}

      {/* Frame Container - Completely Fixed, Zero Scaling or Shifting */}
      <div
        className={`relative flex items-center justify-center transition-all ${
          isMobile
            ? 'w-[390px] max-w-full h-full max-h-[820px] rounded-[38px] p-2.5 bg-[#121212] border-2 border-[#262626] shadow-[0_20px_50px_rgba(0,0,0,0.9)] ring-1 ring-neutral-800'
            : 'w-full h-full rounded-lg overflow-hidden border border-[#1f1f1f] shadow-xl'
        }`}
      >
        {/* Mobile Camera Notch */}
        {isMobile && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black rounded-full z-20 flex items-center justify-center pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-[#1c1c1c] mr-1.5"></div>
            <div className="w-6 h-1 rounded-full bg-[#1c1c1c]"></div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          title="Bio Site Preview"
          style={{
            width: '100%',
            height: '100%',
          }}
          className={`border-0 bg-white block ${
            isMobile ? 'rounded-[28px]' : 'rounded-lg'
          }`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
};
