import React, { useEffect, useState } from 'react';
import { useAuth } from '../../firebase/authContext';
import {
  fetchAllUsers,
  approveUserAccount,
  blockUserAccount,
  reactivateUserAccount,
} from '../../firebase/adminService';
import { UserProfile } from '../../firebase/authContext';
import {
  ShieldCheck,
  Users,
  CheckCircle,
  Ban,
  RotateCcw,
  LogOut,
  ArrowRight,
  Search,
  Clock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardProps {
  onGoToEditor: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onGoToEditor }) => {
  const { currentUser, logout } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'blocked'>('all');
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Falha ao listar usuários:', err);
      setFeedback({ text: 'Erro ao carregar lista de usuários.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (uid: string, email: string) => {
    setActionLoading(uid);
    try {
      await approveUserAccount(uid);
      setFeedback({ text: `Usuário ${email} foi aprovado com sucesso!`, type: 'success' });
      await loadUsers();
    } catch (err: any) {
      setFeedback({ text: `Erro ao aprovar usuário: ${err.message}`, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async (uid: string, email: string) => {
    if (!confirm(`Deseja realmente bloquear o acesso de ${email}?`)) return;
    setActionLoading(uid);
    try {
      await blockUserAccount(uid);
      setFeedback({ text: `Usuário ${email} foi bloqueado.`, type: 'success' });
      await loadUsers();
    } catch (err: any) {
      setFeedback({ text: `Erro ao bloquear usuário: ${err.message}`, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (uid: string, email: string) => {
    setActionLoading(uid);
    try {
      await reactivateUserAccount(uid);
      setFeedback({ text: `Usuário ${email} foi reativado com sucesso!`, type: 'success' });
      await loadUsers();
    } catch (err: any) {
      setFeedback({ text: `Erro ao reativar usuário: ${err.message}`, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '—';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const countPending = users.filter((u) => u.status === 'pending').length;
  const countApproved = users.filter((u) => u.status === 'approved').length;
  const countBlocked = users.filter((u) => u.status === 'blocked').length;

  return (
    <div className="min-h-screen w-full bg-[#080808] text-neutral-100 flex flex-col selection:bg-[#EFFF00] selection:text-black">
      {/* Top Header */}
      <header className="h-14 bg-[#111111] border-b border-neutral-800 px-4 sm:px-8 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EFFF00] text-black font-extrabold flex items-center justify-center text-sm shadow-[0_0_15px_rgba(239,255,0,0.4)]">
            BS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">Painel Administrativo</span>
              <span className="text-[10px] font-bold bg-[#EFFF00]/15 text-[#EFFF00] px-2 py-0.5 rounded-full border border-[#EFFF00]/30">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 truncate max-w-xs">{currentUser?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onGoToEditor}
            className="neon-btn px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            title="Ir para o editor de bio sites"
          >
            <span>Ir para o Editor</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={logout}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Sair da conta"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#111111] border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-xs font-medium">Total Usuários</span>
              <Users className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-2xl font-bold text-white">{users.length}</div>
          </div>

          <div className="bg-[#111111] border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-xs font-medium">Aguardando Aprovação</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">{countPending}</div>
          </div>

          <div className="bg-[#111111] border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-xs font-medium">Aprovados</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300">{countApproved}</div>
          </div>

          <div className="bg-[#111111] border border-rose-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between text-rose-400 mb-1">
              <span className="text-xs font-medium">Bloqueados</span>
              <Ban className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-300">{countBlocked}</div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-neutral-400 hover:text-white font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-[#111111] border border-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por e-mail..."
              className="w-full bg-[#080808] border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-[#EFFF00]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Pendentes ({countPending})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Aprovados ({countApproved})
            </button>
            <button
              onClick={() => setStatusFilter('blocked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'blocked'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Bloqueados ({countBlocked})
            </button>

            <button
              onClick={loadUsers}
              disabled={loading}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors ml-auto"
              title="Recarregar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#111111] border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080808] border-b border-neutral-800 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Data de Cadastro</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Data da Aprovação</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 italic">
                      {loading ? 'Carregando usuários...' : 'Nenhum usuário encontrado.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.uid === currentUser?.uid;
                    const isUserAdmin = u.role === 'admin';

                    return (
                      <tr key={u.uid} className="hover:bg-neutral-900/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">
                          <div className="flex items-center gap-2">
                            <span>{u.email}</span>
                            {isUserAdmin && (
                              <span className="text-[9px] bg-[#EFFF00]/20 text-[#EFFF00] px-1.5 py-0.5 rounded font-bold">
                                ADMIN
                              </span>
                            )}
                            {isSelf && (
                              <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                                Você
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-neutral-400 font-mono text-[11px]">
                          {formatDate(u.createdAt)}
                        </td>

                        <td className="px-4 py-3">
                          {u.status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Clock className="w-3 h-3" />
                              Pendente
                            </span>
                          )}
                          {u.status === 'approved' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle className="w-3 h-3" />
                              Aprovado
                            </span>
                          )}
                          {u.status === 'blocked' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              <Ban className="w-3 h-3" />
                              Bloqueado
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-neutral-400 font-mono text-[11px]">
                          {formatDate(u.approvedAt)}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {isSelf ? (
                            <span className="text-[11px] text-neutral-500 italic">Conta principal</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Action: Aprovar */}
                              {u.status === 'pending' && (
                                <button
                                  onClick={() => handleApprove(u.uid, u.email)}
                                  disabled={actionLoading === u.uid}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  <span>APROVAR</span>
                                </button>
                              )}

                              {/* Action: Bloquear */}
                              {u.status === 'approved' && (
                                <button
                                  onClick={() => handleBlock(u.uid, u.email)}
                                  disabled={actionLoading === u.uid}
                                  className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 hover:text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1"
                                >
                                  <Ban className="w-3 h-3" />
                                  <span>BLOQUEAR</span>
                                </button>
                              )}

                              {/* Action: Reativar */}
                              {u.status === 'blocked' && (
                                <button
                                  onClick={() => handleReactivate(u.uid, u.email)}
                                  disabled={actionLoading === u.uid}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>REATIVAR</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
