import React, { useState } from 'react';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Smartphone,
  Monitor,
  Play,
  RotateCcw,
  Download,
  PaintBucket,
  MoreVertical,
  Archive,
  Code,
  FilePlus,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { DeviceMode, EditorMode } from '../types';

interface MinimalHeaderProps {
  onBack: () => void;
  onNewCode: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  deviceMode: DeviceMode;
  onChangeDeviceMode: (mode: DeviceMode) => void;
  editorMode: EditorMode;
  onChangeEditorMode: (mode: EditorMode) => void;
  onSelectSiteBackground: () => void;
  onDownloadHtml: () => void;
  onDownloadZip: () => void;
  onOpenCode: () => void;
  onOpenElements?: () => void;
  userEmail?: string;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  onBack,
  onNewCode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  deviceMode,
  onChangeDeviceMode,
  editorMode,
  onChangeEditorMode,
  onSelectSiteBackground,
  onDownloadHtml,
  onDownloadZip,
  onOpenCode,
  onOpenElements,
  userEmail,
  isAdmin,
  onOpenAdmin,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-13 bg-[#080808] border-b border-[#1f1f1f] px-3 sm:px-5 flex items-center justify-between z-30 select-none text-xs">
      {/* Left: Voltar, Novo código & Undo/Redo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onBack}
          className="px-2.5 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors flex items-center gap-1.5 font-medium"
          title="Voltar para a tela inicial de HTML mantendo as alterações"
        >
          <ArrowLeft className="w-4 h-4 text-[#EFFF00]" />
          <span className="hidden sm:inline">Voltar</span>
        </button>

        <button
          onClick={onNewCode}
          className="px-2 py-1.5 rounded-lg text-neutral-400 hover:text-[#EFFF00] hover:bg-neutral-900 transition-colors flex items-center gap-1.5 font-medium"
          title="Colar outro código HTML do zero"
        >
          <FilePlus className="w-3.5 h-3.5 text-[#EFFF00]" />
          <span className="hidden md:inline">Novo código</span>
        </button>

        <div className="h-4 w-[1px] bg-neutral-800"></div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${
              canUndo
                ? 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                : 'text-neutral-700 cursor-not-allowed'
            }`}
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${
              canRedo
                ? 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                : 'text-neutral-700 cursor-not-allowed'
            }`}
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center: Device Switcher & Fundo do Site */}
      <div className="flex items-center gap-2">
        {/* Device toggle (Mobile / Desktop) */}
        <div className="flex items-center bg-[#141414] border border-neutral-800 rounded-lg p-0.5">
          <button
            onClick={() => onChangeDeviceMode('mobile')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              deviceMode === 'mobile'
                ? 'bg-[#EFFF00] text-black font-semibold shadow-[0_0_10px_rgba(239,255,0,0.3)]'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Visualização Celular"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Celular</span>
          </button>

          <button
            onClick={() => onChangeDeviceMode('desktop')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              deviceMode === 'desktop'
                ? 'bg-[#EFFF00] text-black font-semibold shadow-[0_0_10px_rgba(239,255,0,0.3)]'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Visualização Computador"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Computador</span>
          </button>
        </div>

        {/* Fundo do site quick button */}
        <button
          onClick={onSelectSiteBackground}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-900 border border-neutral-800/80 transition-colors font-medium text-xs cursor-pointer"
          title="Alterar a cor de fundo do site"
        >
          <PaintBucket className="w-3.5 h-3.5 text-[#EFFF00]" />
          <span>Fundo do site</span>
        </button>

        {/* Smart Biosite Elements Drawer Button */}
        {onOpenElements && (
          <button
            onClick={onOpenElements}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-neutral-800 text-[#EFFF00] border border-[#EFFF00]/40 hover:border-[#EFFF00] transition-colors font-bold text-xs shadow-sm cursor-pointer"
            title="Abrir painel inteligente com todos os elementos e fotos do biosite"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Elementos do Biosite</span>
          </button>
        )}
      </div>

      {/* Right: Testar & Baixar HTML */}
      <div className="flex items-center gap-2">
        {/* Mode Switcher: Testar vs Voltar à edição */}
        {editorMode === 'edit' ? (
          <button
            onClick={() => onChangeEditorMode('test')}
            className="px-3 py-1.5 bg-[#141414] hover:bg-neutral-800 text-neutral-200 border border-neutral-700/60 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
            title="Testar links e interações do site"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Testar</span>
          </button>
        ) : (
          <button
            onClick={() => onChangeEditorMode('edit')}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Voltar à edição</span>
          </button>
        )}

        {/* Download HTML Button */}
        <button
          onClick={onDownloadHtml}
          className="neon-btn px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          title="Baixar arquivo index.html pronto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Baixar HTML</span>
        </button>

        {/* Discreet Menu for secondary actions */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
            title="Mais opções"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#141414] border border-neutral-800 rounded-xl shadow-2xl p-1 z-50 text-xs">
              {onOpenElements && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenElements();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-800 text-[#EFFF00] transition-colors flex items-center gap-2 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Elementos do Biosite</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNewCode();
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-800 text-neutral-200 transition-colors flex items-center gap-2"
              >
                <FilePlus className="w-3.5 h-3.5 text-[#EFFF00]" />
                <span>Novo código HTML</span>
              </button>

              <button
                onClick={() => {
                  onSelectSiteBackground();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-800 text-neutral-200 transition-colors flex items-center gap-2 sm:hidden"
              >
                <PaintBucket className="w-3.5 h-3.5 text-[#EFFF00]" />
                <span>Fundo do site</span>
              </button>

              <button
                onClick={() => {
                  onDownloadZip();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-800 text-neutral-200 transition-colors flex items-center gap-2"
              >
                <Archive className="w-3.5 h-3.5 text-[#EFFF00]" />
                <span>Baixar Pacote .ZIP</span>
              </button>

              <button
                onClick={() => {
                  onOpenCode();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-800 text-neutral-200 transition-colors flex items-center gap-2"
              >
                <Code className="w-3.5 h-3.5 text-neutral-400" />
                <span>Ver código HTML</span>
              </button>

              {isAdmin && onOpenAdmin && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-800 text-[#EFFF00] transition-colors flex items-center gap-2 font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Painel de Administração</span>
                </button>
              )}

              {userEmail && (
                <div className="px-3 py-1.5 border-t border-neutral-800/80 my-1 text-[10px] text-neutral-500 truncate">
                  Conectado como:<br />
                  <strong className="text-neutral-300 font-mono">{userEmail}</strong>
                </div>
              )}

              {onLogout && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-950/40 text-rose-400 transition-colors flex items-center gap-2 font-medium border-t border-neutral-800/80"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da conta</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
