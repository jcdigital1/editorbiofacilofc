import React, { useState } from 'react';
import { useAuth } from '../../firebase/authContext';
import { Clock, LogOut, RotateCcw, CheckCircle2 } from 'lucide-react';

export const PendingScreen: React.FC = () => {
  const { currentUser, logout, refreshProfile } = useAuth();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCheck = async () => {
    setChecking(true);
    setMessage(null);
    try {
      await refreshProfile();
      setMessage('Status atualizado.');
    } catch {
      setMessage('Não foi possível verificar no momento.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080808] text-neutral-100 flex flex-col justify-center items-center p-4 selection:bg-[#EFFF00] selection:text-black">
      <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
        {/* Icon with glowing yellow aura */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-[#EFFF00] shadow-[0_0_25px_rgba(239,255,0,0.2)]">
          <Clock className="w-8 h-8 text-[#EFFF00]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Cadastro em Análise
          </h2>
          <p className="text-sm text-neutral-300 font-medium">
            Seu cadastro está aguardando aprovação.
          </p>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
            A conta <strong className="text-neutral-200">{currentUser?.email}</strong> foi registrada com sucesso e aguarda liberação pelo administrador.
          </p>
        </div>

        {message && (
          <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-[#EFFF00] flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleCheck}
            disabled={checking}
            className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#EFFF00] ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Verificando...' : 'Verificar aprovação'}</span>
          </button>

          <button
            onClick={logout}
            className="py-2.5 px-4 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-medium text-neutral-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
};
