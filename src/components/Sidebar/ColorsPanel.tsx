import React, { useState } from 'react';
import { Palette, Replace, Check, Sliders, Sparkles } from 'lucide-react';
import { DetectedColor, CssVariable } from '../../types';

interface ColorsPanelProps {
  colors: DetectedColor[];
  cssVariables: CssVariable[];
  onReplaceColorGlobal: (oldColor: string, newColor: string) => void;
  onUpdateCssVariable: (varName: string, newValue: string) => void;
}

export const ColorsPanel: React.FC<ColorsPanelProps> = ({
  colors,
  cssVariables,
  onReplaceColorGlobal,
  onUpdateCssVariable,
}) => {
  const [selectedColorToReplace, setSelectedColorToReplace] = useState<string | null>(
    colors[0]?.hex || null
  );
  const [targetReplacementColor, setTargetReplacementColor] = useState<string>('#f59e0b');
  const [replacedSuccess, setReplacedSuccess] = useState(false);

  const handleGlobalReplace = () => {
    if (!selectedColorToReplace || !targetReplacementColor) return;
    onReplaceColorGlobal(selectedColorToReplace, targetReplacementColor);
    setReplacedSuccess(true);
    setTimeout(() => setReplacedSuccess(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-none">
      {/* 1. CSS Variables Editor (First-Class if detected) */}
      {cssVariables.length > 0 && (
        <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 font-medium text-neutral-200">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Variáveis CSS do Tema (:root)</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Este modelo utiliza variáveis modernas de CSS. Alterar esses valores afeta harmoniosamente todo o tema.
          </p>

          <div className="space-y-2 pt-1">
            {cssVariables.map((v) => {
              const isColor = v.value.startsWith('#') || v.value.startsWith('rgb');
              return (
                <div
                  key={v.name}
                  className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[11px] text-amber-300 block truncate">
                      {v.name}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400 block truncate">
                      {v.value}
                    </span>
                  </div>

                  {isColor ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="color"
                        defaultValue={v.value.startsWith('#') ? v.value : '#000000'}
                        onChange={(e) => onUpdateCssVariable(v.name, e.target.value)}
                        className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      defaultValue={v.value}
                      onBlur={(e) => onUpdateCssVariable(v.name, e.target.value)}
                      className="w-24 bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-[11px] font-mono text-neutral-200 text-right focus:outline-none focus:border-amber-500"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Detected Colors Palette */}
      <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-neutral-200">
            <Palette className="w-4 h-4 text-amber-400" />
            <span>Paleta de Cores Detectadas</span>
          </div>
          <span className="text-[10px] text-neutral-500">
            {colors.length} cores
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-1">
          {colors.map((c) => {
            const isSelected = selectedColorToReplace === c.hex;
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => setSelectedColorToReplace(c.hex)}
                className={`p-1.5 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                }`}
              >
                <div
                  className="w-full h-7 rounded-md border border-neutral-700/50 shadow-inner"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="font-mono text-[9px] text-neutral-300 truncate w-full text-center">
                  {c.hex}
                </span>
                <span className="text-[8px] text-neutral-400">
                  {c.count}x
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Global Color Replacement Tool */}
      <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3">
        <div className="flex items-center gap-2 font-medium text-neutral-200">
          <Replace className="w-4 h-4 text-emerald-400" />
          <span>Substituição Global de Cor</span>
        </div>
        <p className="text-[11px] text-neutral-400">
          Substitua todas as ocorrências de uma cor em todo o HTML e regras de estilo do site de uma só vez.
        </p>

        <div className="flex items-center gap-3 pt-1">
          {/* Source color */}
          <div className="flex-1 p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-center">
            <span className="text-[10px] text-neutral-500 block mb-1">Cor Atual</span>
            <div className="flex items-center justify-center gap-1.5">
              <div
                className="w-4 h-4 rounded border border-neutral-700"
                style={{ backgroundColor: selectedColorToReplace || '#ffffff' }}
              />
              <span className="font-mono text-neutral-200">
                {selectedColorToReplace || 'Nenhuma'}
              </span>
            </div>
          </div>

          <span className="text-neutral-500 font-bold">→</span>

          {/* Replacement color */}
          <div className="flex-1 p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-center">
            <span className="text-[10px] text-neutral-500 block mb-1">Nova Cor</span>
            <div className="flex items-center justify-center gap-1.5">
              <input
                type="color"
                value={targetReplacementColor}
                onChange={(e) => setTargetReplacementColor(e.target.value)}
                className="w-5 h-5 rounded border border-neutral-700 cursor-pointer bg-transparent"
              />
              <span className="font-mono text-neutral-200">
                {targetReplacementColor}
              </span>
            </div>
          </div>
        </div>

        {replacedSuccess && (
          <div className="p-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded text-[11px] flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cor substituída em todo o modelo com sucesso!</span>
          </div>
        )}

        <button
          onClick={handleGlobalReplace}
          disabled={!selectedColorToReplace}
          className="w-full py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-neutral-950 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Substituir em Todo o Site</span>
        </button>
      </div>
    </div>
  );
};
