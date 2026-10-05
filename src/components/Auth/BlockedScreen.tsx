import React from 'react';
import { useAuth } from '../../firebase/authContext';
import { Ban, LogOut } from 'lucide-react';

export const BlockedScreen: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen w-full bg-[#080808] text-neutral-100 flex flex-col justify-center items-center p-4 selection:bg-[#EFFF00] selection:text-black">
      <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.2)]">
          <Ban className="w-8 h-8 text-rose-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Acesso Bloqueado
          </h2>
          <p className="text-sm text-neutral-300 font-medium">
            Seu acesso ao editor está bloqueado.
          </p>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
            A conta <strong className="text-neutral-200">{currentUser?.email}</strong> foi desativada pelo administrador. Entre em contato com o suporte para mais informações.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={logout}
            className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da conta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
