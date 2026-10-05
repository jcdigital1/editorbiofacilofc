import React, { useState } from 'react';
import { useAuth, isDesignatedAdminEmail } from '../../firebase/authContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Clock, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register, sendPasswordReset, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const isAdminInput = isDesignatedAdminEmail(email);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setLocalError('Digite seu e-mail acima para receber o link de redefinição.');
      return;
    }
    clearError();
    setLocalError(null);
    setResetLoading(true);
    try {
      await sendPasswordReset(email);
      setResetSent(true);
    } catch {
      // Error handled in auth context
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Informe seu e-mail.');
      return;
    }

    if (!password) {
      setLocalError('Informe sua senha.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setLocalError('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('As senhas não coincidem.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch {
      // Error is set in context
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    clearError();
    setLocalError(null);
    setMode(newMode);
  };

  const displayedError = localError || error;

  return (
    <div className="min-h-screen w-full bg-[#080808] text-neutral-100 flex flex-col justify-center items-center p-4 selection:bg-[#EFFF00] selection:text-black">
      {/* Container */}
      <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#EFFF00] text-black font-extrabold flex items-center justify-center text-base shadow-[0_0_20px_rgba(239,255,0,0.35)] mb-3">
            BS
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Bio Studio Editor</h1>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'login'
              ? 'Acesse sua conta para utilizar o editor'
              : 'Cadastre-se para solicitar acesso ao editor'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-[#080808] p-1 rounded-xl border border-neutral-800/80 mb-5">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[#EFFF00] text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-[#EFFF00] text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Criar conta
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-[#080808] border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#EFFF00] transition-colors"
              />
            </div>
            {isAdminInput && (
              <div className="mt-2 p-2 bg-[#EFFF00]/10 border border-[#EFFF00]/30 rounded-lg flex items-center gap-1.5 text-[11px] text-[#EFFF00]">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>E-mail de administrador detectado. Acesso direto pelo botão <strong>Entrar</strong>.</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Senha
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                  className="text-[11px] text-neutral-400 hover:text-[#EFFF00] transition-colors cursor-pointer"
                >
                  {resetLoading ? 'Enviando...' : 'Esqueci minha senha'}
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#080808] border border-neutral-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#EFFF00] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300 cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {resetSent && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/70 rounded-xl flex items-start gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Link de redefinição de senha enviado para <strong>{email}</strong>! Verifique sua caixa de entrada e pasta de spam.</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Confirmar senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#080808] border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-[#EFFF00] transition-colors"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-start gap-2 text-[11px] text-neutral-400">
              <Clock className="w-4 h-4 text-[#EFFF00] shrink-0 mt-0.5" />
              <span>
                Novos cadastros entram como <strong className="text-neutral-200">pendentes</strong> e necessitam da aprovação do administrador para acesso ao editor.
              </span>
            </div>
          )}

          {displayedError && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-start gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{displayedError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full neon-btn py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            <span>{submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#EFFF00]" />
          <span>Autenticação protegida por Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
};
