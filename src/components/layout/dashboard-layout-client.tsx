'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { fazerLogout } from '@/lib/auth-actions';
import { NotificationsDropdown, NotificacaoItem } from './notifications-dropdown';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userType: 'MORADOR' | 'SINDICO' | 'PORTARIA';
  userName: string;
  userBloco: string | null;
  userApto: string | null;
  chamadosPendentesCount: number;
  avisosRecentesCount: number;
  notificacoes: NotificacaoItem[];
}

export function DashboardLayoutClient({
  children,
  userType,
  userName,
  userBloco,
  userApto,
  chamadosPendentesCount,
  avisosRecentesCount,
  notificacoes,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();

  const menus = {
    MORADOR: [
      { label: '📊 Painel Geral', href: '/dashboard', badge: 0 },
      { label: '📅 Minhas Reservas', href: '/dashboard/reservas', badge: 0 },
      { label: '📝 Abrir Ocorrência', href: '/dashboard/chamadas', badge: 0 },
      { label: '📢 Mural de Avisos', href: '/dashboard/avisos', badge: avisosRecentesCount },
      { label: '⚙️ Minha Conta', href: '/dashboard/configuracoes', badge: 0 },
    ],
    SINDICO: [
      { label: '📊 Painel Geral', href: '/dashboard/admin', badge: 0 },
      { label: '📋 Ocorrências', href: '/dashboard/chamadas/sindico', badge: chamadosPendentesCount },
      { label: '📅 Gestão de Reservas', href: '/dashboard/reservas', badge: 0 },
      { label: '📝 Publicar Avisos', href: '/dashboard/admin/avisos', badge: 0 },
      { label: '📢 Mural de Avisos', href: '/dashboard/avisos', badge: avisosRecentesCount },
      { label: '⚙️ Minha Conta', href: '/dashboard/configuracoes', badge: 0 },
    ],
    PORTARIA: [
      { label: '📋 Reservas do Dia', href: '/dashboard/portaria', badge: 0 },
      { label: '📅 Todas as Reservas', href: '/dashboard/reservas', badge: 0 },
      { label: '📢 Mural de Avisos', href: '/dashboard/avisos', badge: avisosRecentesCount },
      { label: '⚙️ Minha Conta', href: '/dashboard/configuracoes', badge: 0 },
    ],
  };

  const navItems = menus[userType] || menus.MORADOR;
  const unreadTotal = userType === 'SINDICO' ? chamadosPendentesCount : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/95 border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col justify-between backdrop-blur-md">
        <div>
          {/* Logo & Perfil de Operador */}
          <div className="mb-6 flex items-center justify-between md:block">
            <Link
              href={userType === 'SINDICO' ? '/dashboard/admin' : userType === 'PORTARIA' ? '/dashboard/portaria' : '/dashboard'}
              className="flex items-center gap-2.5 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/favicon.ico"
                alt="Logo CondomínioTech"
                className="w-7 h-7 rounded-lg object-contain drop-shadow-md group-hover:scale-105 transition-transform"
              />
              <span className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent tracking-tight">
                CondomínioTech
              </span>
            </Link>
            <div className="mt-2.5 flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase ${
                  userType === 'SINDICO'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : userType === 'PORTARIA'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                }`}
              >
                ● {userType}
              </span>
            </div>
          </div>

          {/* Navegação Principal */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-between ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 ml-2 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col gap-3">
          <div className="px-2">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <p className="text-[11px] text-slate-400">
              {userBloco && userApto ? `Bloco. ${userBloco} • Apt ${userApto}` : 'Condomínio Tech'}
            </p>
          </div>

          <button
            onClick={async () => await fazerLogout()}
            className="text-left text-xs text-red-400 hover:text-red-300 font-medium px-3 py-2 rounded-lg hover:bg-red-500/10 transition w-full cursor-pointer flex items-center gap-2"
          >
            <span>🚪</span>
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Wrapper com Topbar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar com z-index de camada superior para dropdown */}
        <header className="relative z-50 h-16 bg-slate-900/80 border-b border-slate-800/80 px-8 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">Portal do Condomínio</span>
            <span className="text-xs text-slate-600 hidden sm:inline">/</span>
            <span className="text-xs font-semibold text-cyan-400 capitalize">
              {pathname.replace('/dashboard', '').replace('/', '') || 'Início'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationsDropdown
              notificacoes={notificacoes}
              unreadCount={unreadTotal}
            />

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block">
                <span className="text-xs font-medium text-slate-200 block truncate max-w-[120px]">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5 capitalize">
                  {userType.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
