/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InitialScreen } from './components/InitialScreen';
import { MinimalHeader } from './components/MinimalHeader';
import { PreviewCanvas } from './components/PreviewCanvas';
import { FloatingToolbar } from './components/FloatingToolbar';
import { CodeEditorModal } from './components/CodeEditorModal';

import { DeviceMode, EditorMode, SelectedElementProperties } from './types';
import { analyzeHtml } from './utils/htmlAnalyzer';
import { updateConfigInHtml } from './utils/safeJsParser';
import { exportSingleHtml, exportZipPackage } from './utils/exporter';

const STORAGE_KEY_HTML = 'bio_studio_current_html_v3';

export default function App() {
  // Current view: 'input' (initial screen) vs 'editor' (visual preview editor)
  const [view, setView] = useState<'input' | 'editor'>('input');

  // Main canonical HTML state (starts empty on first load)
  const [htmlContent, setHtmlContent] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HTML);
      return saved || '';
    } catch {
      return '';
    }
  });

  const [isDirty, setIsDirty] = useState(false);

  // Undo / Redo Stacks
  const [historyPast, setHistoryPast] = useState<string[]>([]);
  const [historyFuture, setHistoryFuture] = useState<string[]>([]);

  // Editor modes & device
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [editorMode, setEditorMode] = useState<EditorMode>('edit');

  // Floating Contextual Toolbar State
  const [selectedElement, setSelectedElement] = useState<SelectedElementProperties | null>(null);
  const [iframeRect, setIframeRect] = useState<DOMRect | null>(null);

  // Discreet Code Editor Modal
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Persist current work in localStorage
  useEffect(() => {
    if (htmlContent) {
      try {
        localStorage.setItem(STORAGE_KEY_HTML, htmlContent);
      } catch (err) {
        console.warn('Failed to save to localStorage:', err);
      }
    }
  }, [htmlContent]);

  // Push to history when making changes
  const updateHtmlWithHistory = useCallback((newHtml: string) => {
    setHistoryPast((prev) => [...prev, htmlContent]);
    setHistoryFuture([]);
    setHtmlContent(newHtml);
    setIsDirty(true);
  }, [htmlContent]);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((prev) => prev.slice(0, prev.length - 1));
    setHistoryFuture((prev) => [htmlContent, ...prev]);
    setHtmlContent(previous);
    setIsDirty(true);
  }, [historyPast, htmlContent]);

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture((prev) => prev.slice(1));
    setHistoryPast((prev) => [...prev, htmlContent]);
    setHtmlContent(next);
    setIsDirty(true);
  }, [historyFuture, htmlContent]);

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Send message to preview iframe
  const postToIframe = (message: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, '*');
    }
  };

  // Open Editor from Initial Screen
  const handleOpenEditor = (code: string) => {
    setHtmlContent(code);
    setHistoryPast([]);
    setHistoryFuture([]);
    setIsDirty(false);
    setSelectedElement(null);
    setView('editor');
  };

  // Return to Initial Screen
  const handleBackToInput = () => {
    if (isDirty) {
      if (!confirm('Deseja voltar para a tela inicial? Suas edições atuais serão mantidas no campo.')) {
        return;
      }
    }
    setView('input');
    setSelectedElement(null);
  };

  // Mode switcher (Edit vs Test)
  const handleChangeEditorMode = (mode: EditorMode) => {
    setEditorMode(mode);
    if (mode === 'test') {
      setSelectedElement(null);
    }
    postToIframe({ type: 'BIO_SET_MODE', mode });
  };

  // "Fundo do site" button
  const handleSelectSiteBackground = () => {
    postToIframe({ type: 'BIO_SELECT_BODY' });
  };

  // Element selected from preview click
  const handleElementSelected = (elData: SelectedElementProperties) => {
    if (editorMode === 'test') return;
    setSelectedElement(elData);
  };

  // Deselect / Close floating toolbar
  const handleCloseToolbar = () => {
    setSelectedElement(null);
    postToIframe({ type: 'BIO_DESELECT' });
  };

  // Select parent element ("Selecionar área")
  const handleSelectParent = () => {
    postToIframe({ type: 'BIO_SELECT_PARENT' });
  };

  // Update text (preserving child elements/icons)
  const handleUpdateText = (bioId: string, text: string) => {
    postToIframe({ type: 'BIO_UPDATE_TEXT', bioId, newText: text });

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const el = bioId === 'bio-body' ? doc.body : doc.querySelector(`[data-bio-id="${bioId}"]`);

    if (el) {
      let textNodeFound = false;
      for (let i = 0; i < el.childNodes.length; i++) {
        if (el.childNodes[i].nodeType === Node.TEXT_NODE && el.childNodes[i].nodeValue?.trim()) {
          el.childNodes[i].nodeValue = text;
          textNodeFound = true;
          break;
        }
      }
      if (!textNodeFound) {
        if (el.childNodes.length === 0) {
          el.textContent = text;
        } else {
          el.appendChild(doc.createTextNode(text));
        }
      }

      let updatedHtml = '<!DOCTYPE html>\n<html lang="' + (doc.documentElement.lang || 'pt-BR') + '">\n' + doc.documentElement.innerHTML + '\n</html>';

      // Check if model uses CONFIG/CONFIGURACAO and this was company name
      const detected = analyzeHtml(updatedHtml);
      if (detected.configModel && (el.id === 'nome-empresa' || el.tagName === 'H1' || el.classList.contains('brand-title'))) {
        const newConfigData = { ...detected.configModel.data, nome: text };
        updatedHtml = updateConfigInHtml(updatedHtml, detected.configModel, newConfigData);
      }

      updateHtmlWithHistory(updatedHtml);
    }
  };

  // Update attribute (href, src, etc.)
  const handleUpdateAttribute = (bioId: string, attr: string, value: string) => {
    postToIframe({ type: 'BIO_UPDATE_ATTRIBUTE', bioId, attribute: attr, value });

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const el = bioId === 'bio-body' ? doc.body : doc.querySelector(`[data-bio-id="${bioId}"]`);

    if (el) {
      if (value === '' || value === null) {
        el.removeAttribute(attr);
      } else {
        el.setAttribute(attr, value);
      }
      const updatedHtml = '<!DOCTYPE html>\n<html lang="' + (doc.documentElement.lang || 'pt-BR') + '">\n' + doc.documentElement.innerHTML + '\n</html>';
      updateHtmlWithHistory(updatedHtml);
    }
  };

  // Update style (color, backgroundColor, etc.)
  const handleUpdateStyle = (bioId: string, property: string, value: string) => {
    postToIframe({ type: 'BIO_UPDATE_STYLE', bioId, property, value });

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const el = (bioId === 'bio-body' ? doc.body : doc.querySelector(`[data-bio-id="${bioId}"]`)) as HTMLElement;

    if (el) {
      el.style[property as any] = value;
      const updatedHtml = '<!DOCTYPE html>\n<html lang="' + (doc.documentElement.lang || 'pt-BR') + '">\n' + doc.documentElement.innerHTML + '\n</html>';
      updateHtmlWithHistory(updatedHtml);
    }
  };

  // Update WhatsApp Globally (across all buttons)
  const handleUpdateWhatsAppGlobal = (phoneUrl: string, rawPhone: string, message: string) => {
    let updatedHtml = htmlContent;

    // 1. If CONFIG exists, update CONFIG.whatsapp
    const detected = analyzeHtml(updatedHtml);
    if (detected.configModel) {
      const newConfigData = {
        ...detected.configModel.data,
        whatsapp: rawPhone,
        whatsappMensagem: message,
      };
      updatedHtml = updateConfigInHtml(updatedHtml, detected.configModel, newConfigData);
    }

    // 2. Update all WhatsApp links in DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(updatedHtml, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'));

    links.forEach((a) => {
      const href = a.getAttribute('href') || '';
      const text = a.textContent || '';
      if (
        href.includes('wa.me') ||
        href.includes('api.whatsapp.com') ||
        href.includes('wa.link') ||
        /whatsapp|agendar|agendamento/i.test(text)
      ) {
        a.setAttribute('href', phoneUrl);
      }
    });

    updatedHtml = '<!DOCTYPE html>\n<html lang="' + (doc.documentElement.lang || 'pt-BR') + '">\n' + doc.documentElement.innerHTML + '\n</html>';
    updateHtmlWithHistory(updatedHtml);
  };

  // Delete element
  const handleDeleteElement = (bioId: string) => {
    postToIframe({ type: 'BIO_DELETE_ELEMENT', bioId });
    setSelectedElement(null);

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const el = doc.querySelector(`[data-bio-id="${bioId}"]`);
    if (el && el.parentElement && el !== doc.body) {
      el.parentElement.removeChild(el);
      const updatedHtml = '<!DOCTYPE html>\n<html lang="' + (doc.documentElement.lang || 'pt-BR') + '">\n' + doc.documentElement.innerHTML + '\n</html>';
      updateHtmlWithHistory(updatedHtml);
    }
  };

  // Duplicate element
  const handleDuplicateElement = (bioId: string) => {
    postToIframe({ type: 'BIO_DUPLICATE_ELEMENT', bioId });

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const el = doc.querySelector(`[data-bio-id="${bioId}"]`);
    if (el && el.parentElement && el !== doc.body) {
      const clone = el.cloneNode(true) as HTMLElement;
      clone.removeAttribute('data-bio-id');
      el.parentElement.insertBefore(clone, el.nextSibling);
      const updatedHtml = '<!DOCTYPE html>\n<html lang="' + (doc.documentElement.lang || 'pt-BR') + '">\n' + doc.documentElement.innerHTML + '\n</html>';
      updateHtmlWithHistory(updatedHtml);
    }
  };

  // Download Standalone index.html
  const handleDownloadHtml = () => {
    exportSingleHtml(htmlContent, 'bio-site');
  };

  // Download Complete ZIP Package
  const handleDownloadZip = async () => {
    try {
      await exportZipPackage(htmlContent, 'bio-site');
    } catch (err) {
      console.error('Error generating zip:', err);
      alert('Erro ao gerar arquivo ZIP.');
    }
  };

  // If in Initial Screen View
  if (view === 'input') {
    return (
      <InitialScreen
        initialHtml={htmlContent}
        onOpenEditor={handleOpenEditor}
      />
    );
  }

  // Visual Editor View (site occupying virtually the entire screen, no sidebars!)
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080808] text-neutral-100 antialiased font-sans select-none">
      {/* Minimal Top Bar */}
      <MinimalHeader
        onBack={handleBackToInput}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        deviceMode={deviceMode}
        onChangeDeviceMode={setDeviceMode}
        editorMode={editorMode}
        onChangeEditorMode={handleChangeEditorMode}
        onSelectSiteBackground={handleSelectSiteBackground}
        onDownloadHtml={handleDownloadHtml}
        onDownloadZip={handleDownloadZip}
        onOpenCode={() => setIsCodeModalOpen(true)}
      />

      {/* Main Preview Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
        <PreviewCanvas
          htmlContent={htmlContent}
          deviceMode={deviceMode}
          editorMode={editorMode}
          onElementSelected={handleElementSelected}
          onHtmlUpdatedFromIframe={(updatedCleanHtml) => {
            updateHtmlWithHistory(updatedCleanHtml);
          }}
          iframeRef={iframeRef}
          onIframeRectChange={setIframeRect}
        />

        {/* Floating Contextual Toolbar (Appears right near clicked element) */}
        {selectedElement && editorMode === 'edit' && (
          <FloatingToolbar
            element={selectedElement}
            onClose={handleCloseToolbar}
            onSelectParent={handleSelectParent}
            onUpdateText={handleUpdateText}
            onUpdateAttribute={handleUpdateAttribute}
            onUpdateStyle={handleUpdateStyle}
            onUpdateWhatsAppGlobal={handleUpdateWhatsAppGlobal}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            iframeRect={iframeRect}
          />
        )}
      </main>

      {/* Code Editor Modal (Accessible via top bar menu) */}
      <CodeEditorModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        htmlContent={htmlContent}
        onApplyCode={(newCode) => {
          updateHtmlWithHistory(newCode);
        }}
      />
    </div>
  );
}
