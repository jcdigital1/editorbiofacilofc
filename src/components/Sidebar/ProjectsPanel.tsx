import React from 'react';
import { FolderKanban, Plus, Copy, Trash2, Download, Upload, ExternalLink, Sparkles } from 'lucide-react';
import { ProjectData } from '../../types';

interface ProjectsPanelProps {
  projects: ProjectData[];
  currentProjectId: string;
  onSelectProject: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateNewProject: () => void;
  onExportProjectFile: (projectId: string) => void;
  onImportProjectFile: (file: File) => void;
}

export const ProjectsPanel: React.FC<ProjectsPanelProps> = ({
  projects,
  currentProjectId,
  onSelectProject,
  onDuplicateProject,
  onDeleteProject,
  onCreateNewProject,
  onExportProjectFile,
  onImportProjectFile,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportProjectFile(file);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-none">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-neutral-200">
          <FolderKanban className="w-4 h-4 text-amber-400" />
          <span>Projetos Salvos ({projects.length})</span>
        </div>

        <button
          onClick={onCreateNewProject}
          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium rounded-lg flex items-center gap-1 transition-colors"
          title="Novo Projeto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-2">
        {projects.map((proj) => {
          const isCurrent = proj.id === currentProjectId;
          const formattedDate = new Date(proj.updatedAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={proj.id}
              className={`p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-amber-500/60 bg-amber-500/5 ring-1 ring-amber-500/20'
                  : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div
                  onClick={() => !isCurrent && onSelectProject(proj.id)}
                  className="cursor-pointer flex-1 min-w-0"
                >
                  <div className="font-semibold text-neutral-100 truncate flex items-center gap-1.5">
                    <span>{proj.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-normal">
                        Ativo
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    Modificado em: {formattedDate}
                  </div>
                </div>
              </div>

              {/* Action Buttons for each project */}
              <div className="flex items-center gap-1 pt-2 border-t border-neutral-800/80">
                <button
                  onClick={() => onDuplicateProject(proj.id)}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] flex items-center gap-1 transition-colors"
                  title="Duplicar projeto para outra empresa"
                >
                  <Copy className="w-3 h-3 text-amber-400" />
                  <span>Duplicar</span>
                </button>

                <button
                  onClick={() => onExportProjectFile(proj.id)}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] flex items-center gap-1 transition-colors"
                  title="Exportar arquivo .biostudio editável"
                >
                  <Download className="w-3 h-3" />
                  <span>Backup</span>
                </button>

                {projects.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Deseja realmente excluir o projeto "${proj.name}"?`)) {
                        onDeleteProject(proj.id);
                      }
                    }}
                    className="p-1 hover:bg-rose-950/60 text-neutral-500 hover:text-rose-400 rounded transition-colors ml-auto"
                    title="Excluir projeto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Import / Export JSON Project */}
      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
        <div className="font-semibold text-neutral-200">Importar Projeto (.biostudio)</div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Carregue um arquivo de projeto salvo anteriormente para continuar editando.
        </p>

        <label className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 font-medium text-xs">
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span>Selecionar Arquivo de Projeto</span>
          <input
            type="file"
            accept=".json,.biostudio"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};
