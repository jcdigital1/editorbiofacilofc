import React from 'react';
import { Layers, MousePointerClick, Palette, Search, FolderKanban } from 'lucide-react';
import { SidebarTab } from '../../types';

interface SidebarTabsProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  hasSelectedElement: boolean;
}

export const SidebarTabs: React.FC<SidebarTabsProps> = ({
  activeTab,
  onSelectTab,
  hasSelectedElement,
}) => {
  return (
    <div className="flex border-b border-neutral-800 bg-neutral-900/90 text-xs font-medium">
      <button
        onClick={() => onSelectTab('fields')}
        className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition-colors relative ${
          activeTab === 'fields'
            ? 'text-amber-400 font-semibold bg-neutral-800/40'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/20'
        }`}
        title="Campos Detectados do Modelo"
      >
        <Layers className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Campos</span>
        {activeTab === 'fields' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('inspector')}
        className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition-colors relative ${
          activeTab === 'inspector'
            ? 'text-amber-400 font-semibold bg-neutral-800/40'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/20'
        }`}
        title="Inspetor do Elemento Clicado"
      >
        <MousePointerClick className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Inspetor</span>
        {hasSelectedElement && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
        )}
        {activeTab === 'inspector' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('colors')}
        className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition-colors relative ${
          activeTab === 'colors'
            ? 'text-amber-400 font-semibold bg-neutral-800/40'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/20'
        }`}
        title="Cores & Estilos Globais"
      >
        <Palette className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Cores</span>
        {activeTab === 'colors' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('seo')}
        className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition-colors relative ${
          activeTab === 'seo'
            ? 'text-amber-400 font-semibold bg-neutral-800/40'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/20'
        }`}
        title="SEO e Metadados"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">SEO</span>
        {activeTab === 'seo' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('projects')}
        className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 transition-colors relative ${
          activeTab === 'projects'
            ? 'text-amber-400 font-semibold bg-neutral-800/40'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/20'
        }`}
        title="Meus Projetos"
      >
        <FolderKanban className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Projetos</span>
        {activeTab === 'projects' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></span>
        )}
      </button>
    </div>
  );
};
