import React, { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Undo2,
  Redo2,
  Code,
  Download,
  FolderOpen,
  Save,
  Check,
  MousePointer,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { DeviceMode, EditorMode } from '../types';

interface HeaderProps {
  projectName: string;
  onRenameProject: (newName: string) => void;
  deviceMode: DeviceMode;
  onChangeDeviceMode: (mode: DeviceMode) => void;
  editorMode: EditorMode;
  onChangeEditorMode: (mode: EditorMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isDirty: boolean;
  onSave: () => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
  onOpenCodeEditor: () => void;
  onResetToSample: (sampleType: 'barbearia' | 'gastronomia') => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  onRenameProject,
  deviceMode,
  onChangeDeviceMode,
  editorMode,
  onChangeEditorMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isDirty,
  onSave,
  onOpenImport,
  onOpenExport,
  onOpenCodeEditor,
  onResetToSample,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectName);
  const [sampleMenuOpen, setSampleMenuOpen] = useState(false);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onRenameProject(titleInput.trim());
    } else {
      setTitleInput(projectName);
    }
  };

  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand & Project Name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 pr-3 border-r border-neutral-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-neutral-950 font-bold text-sm tracking-tight">
            BS
          </div>
          <span className="font-semibold text-sm tracking-tight text-neutral-100 hidden sm:inline-block">
            Bio Studio
          </span>
        </div>

        {/* Project Name editable */}
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              autoFocus
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTitleInput(projectName);
                  setIsEditingTitle(false);
                }
              }}
              className="bg-neutral-800 border border-amber-500/50 rounded px-2 py-1 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500 w-48"
            />
          ) : (
            <button
              onClick={() => {
                setTitleInput(projectName);
                setIsEditingTitle(true);
              }}
              className="text-xs font-medium text-neutral-300 hover:text-neutral-100 truncate max-w-[160px] md:max-w-[220px] px-2 py-1 rounded hover:bg-neutral-800/80 transition-colors text-left flex items-center gap-1.5"
              title="Clique para renomear o projeto"
            >
              <span className="truncate">{projectName}</span>
            </button>
          )}

          {/* Saved state indicator */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-neutral-500">
            {isDirty ? (
              <span className="flex items-center gap-1 text-amber-400/90">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Não salvo
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400/90">
                <Check className="w-3 h-3" />
                Salvo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center: Device Switcher & Edit/Test Toggle */}
      <div className="flex items-center gap-2">
        {/* Device Switcher */}
        <div className="hidden md:flex items-center p-0.5 bg-neutral-950/80 border border-neutral-800 rounded-lg">
          <button
            onClick={() => onChangeDeviceMode('mobile')}
            className={`p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              deviceMode === 'mobile'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Visualização Celular (390px)"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden xl:inline">Celular</span>
          </button>
          <button
            onClick={() => onChangeDeviceMode('tablet')}
            className={`p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              deviceMode === 'tablet'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Visualização Tablet (768px)"
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden xl:inline">Tablet</span>
          </button>
          <button
            onClick={() => onChangeDeviceMode('desktop')}
            className={`p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              deviceMode === 'desktop'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Visualização Computador (100%)"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden xl:inline">Desktop</span>
          </button>
        </div>

        {/* Edit vs Test Mode Switcher */}
        <div className="flex items-center p-0.5 bg-neutral-950/80 border border-neutral-800 rounded-lg">
          <button
            onClick={() => onChangeEditorMode('edit')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              editorMode === 'edit'
                ? 'bg-amber-500 text-neutral-950 shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Modo Editar: clique nos elementos para alterar textos, links e imagens"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => onChangeEditorMode('test')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              editorMode === 'test'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Modo Testar: simula navegação real, botões de WhatsApp e carrosséis"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Testar</span>
          </button>
        </div>
      </div>

      {/* Right: Actions (Undo/Redo, Code, Import, Save, Export) */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${
              canUndo
                ? 'text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100'
                : 'text-neutral-600 cursor-not-allowed'
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
                ? 'text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100'
                : 'text-neutral-600 cursor-not-allowed'
            }`}
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Code Editor */}
        <button
          onClick={onOpenCodeEditor}
          className="p-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 rounded-md transition-colors hidden md:flex items-center gap-1.5 text-xs font-medium"
          title="Ver e Editar Código HTML"
        >
          <Code className="w-4 h-4" />
          <span className="hidden lg:inline">Código</span>
        </button>

        {/* Samples Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSampleMenuOpen(!sampleMenuOpen)}
            className="p-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 rounded-md transition-colors flex items-center gap-1 text-xs font-medium"
            title="Modelos de exemplo prontos"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden xl:inline">Modelos</span>
          </button>

          {sampleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Carregar Modelo de Exemplo
              </div>
              <button
                onClick={() => {
                  onResetToSample('barbearia');
                  setSampleMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-800 text-neutral-200 transition-colors flex flex-col gap-0.5"
              >
                <div className="font-medium text-neutral-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Barbearia (Modelo Dinâmico JS)
                </div>
                <div className="text-[11px] text-neutral-400">
                  Usa objeto CONFIGURACAO, carrossel de fotos e serviços.
                </div>
              </button>

              <button
                onClick={() => {
                  onResetToSample('gastronomia');
                  setSampleMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-neutral-800 text-neutral-200 transition-colors flex flex-col gap-0.5"
              >
                <div className="font-medium text-neutral-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Bistrô & Café (HTML Estático Puro)
                </div>
                <div className="text-[11px] text-neutral-400">
                  HTML5 puro com variáveis CSS e reserva por WhatsApp.
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Import */}
        <button
          onClick={onOpenImport}
          className="p-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Colar ou Importar HTML"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Importar</span>
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          className="p-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Salvar no navegador"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Salvar</span>
        </button>

        {/* Export / Download CTA */}
        <button
          onClick={onOpenExport}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold shadow-md shadow-amber-500/20"
        >
          <Download className="w-4 h-4" />
          <span>Baixar Site</span>
        </button>
      </div>
    </header>
  );
};
