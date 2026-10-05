import React, { useState, useEffect } from 'react';
import { useAuth } from '../../firebase/authContext';
import { auth } from '../../firebase/config';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { ShieldCheck, Check, X, BookmarkCheck } from 'lucide-react';

export const SaveLoginPrompt: React.FC = () => {
  const { currentUser, isApproved, isAdmin } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser || (!isApproved && !isAdmin)) {
      setShowPrompt(false);
      return;
    }

    // Check if user has already answered the save login prompt on this device
    const promptStatus = localStorage.getItem(`bio_studio_save_login_${currentUser.uid}`);
    if (!promptStatus) {
      // Delay slightly for smooth entrance after login
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, isApproved, isAdmin]);

  if (!showPrompt || !currentUser) return null;

  const handleSaveLogin = async () => {
    setSaving(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      localStorage.setItem(`bio_studio_save_login_${currentUser.uid}`, 'saved');
      setShowPrompt(false);
    } catch (err) {
      console.error('Erro ao salvar persistência:', err);
      localStorage.setItem(`bio_studio_save_login_${currentUser.uid}`, 'saved');
      setShowPrompt(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeclineSave = async () => {
    try {
      await setPersistence(auth, browserSessionPersistence);
      localStorage.setItem(`bio_studio_save_login_${currentUser.uid}`, 'session_only');
      setShowPrompt(false);
    } catch (err) {
      console.error('Erro ao definir sessão temporária:', err);
      localStorage.setItem(`bio_studio_save_login_${currentUser.uid}`, 'session_only');
      setShowPrompt(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] bg-[#121212] border border-[#EFFF00]/40 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#EFFF00]/15 border border-[#EFFF00]/30 text-[#EFFF00] flex items-center justify-center shrink-0">
          <BookmarkCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-white tracking-wide">Acesso Aprovado!</h4>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EFFF00]/20 text-[#EFFF00]">
              Bio Studio
            </span>
          </div>
          <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
            Deseja salvar seu login neste dispositivo para entrar direto no editor das próximas vezes sem precisar digitar seus dados novamente?
          </p>
        </div>
        <button
          onClick={handleDeclineSave}
          className="text-neutral-500 hover:text-neutral-300 p-1 rounded-lg transition-colors"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center gap-2">
        <button
          onClick={handleSaveLogin}
          disabled={saving}
          className="flex-1 py-2 px-3 rounded-xl bg-[#EFFF00] hover:bg-[#dcee00] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{saving ? 'Salvando...' : 'Sim, salvar login'}</span>
        </button>
        <button
          onClick={handleDeclineSave}
          className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-700/60 transition-colors cursor-pointer"
        >
          Agora não
        </button>
      </div>
    </div>
  );
};
