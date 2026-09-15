'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { marcarTodasNotificacoesComoLidas, marcarComoVisto } from '@/app/dashboard/chamadas/actions';

export interface NotificacaoItem {
  id: string;
  dbId?: string;
  tipo: 'CHAMADO' | 'AVISO' | 'CHAMADO_STATUS' | 'RESERVA';
  titulo: string;
  descricao: string;
  data: Date;
  lido: boolean;
  link: string;
}

interface NotificationsDropdownProps {
  notificacoes: NotificacaoItem[];
  unreadCount: number;
}

export function NotificationsDropdown({ notificacoes: initialNotificacoes, unreadCount: initialUnreadCount }: NotificationsDropdownProps) {
  const [aberto, setAberto] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notificacoes, setNotificacoes] = useState(initialNotificacoes);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
    setNotificacoes(initialNotificacoes);
  }, [initialUnreadCount, initialNotificacoes]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleMarcarTodasLidas() {
    setUnreadCount(0);
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lido: true })));
    try {
      await marcarTodasNotificacoesComoLidas();
    } catch (e) {
      console.error('Erro ao marcar notificações como lidas:', e);
    }
  }

  async function handleClickItem(item: NotificacaoItem) {
    setAberto(false);
    if (!item.lido) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, lido: true } : n))
      );
      if (item.tipo === 'CHAMADO' && item.dbId) {
        try {
          await marcarComoVisto(item.dbId);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setAberto(!aberto)}
        className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center cursor-pointer shadow-sm"
        aria-label="Notificações"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {aberto && (
        <div className="fixed sm:absolute right-4 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 rounded-2xl bg-slate-900/98 border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[9999] overflow-hidden backdrop-blur-xl">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Central de Alertas</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  {unreadCount} pendente(s)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tudo lido
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarcarTodasLidas}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer font-medium"
              >
                Limpar alertas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notificacoes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <span className="text-2xl block mb-2">✨</span>
                Nenhuma notificação recente.
              </div>
            ) : (
              notificacoes.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => handleClickItem(item)}
                  className={`block p-3.5 hover:bg-slate-800/80 transition ${
                    !item.lido ? 'bg-cyan-950/25 border-l-2 border-cyan-400' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">
                      {item.tipo === 'CHAMADO'
                        ? '🚨'
                        : item.tipo === 'RESERVA'
                        ? '📅'
                        : item.tipo === 'AVISO'
                        ? '📢'
                        : '📋'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs truncate ${!item.lido ? 'font-bold text-white' : 'font-medium text-slate-200'}`}>
                          {item.titulo}
                        </p>
                        {!item.lido && (
                          <span className="h-2 w-2 rounded-full bg-cyan-400 ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                        {item.descricao}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(item.data).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
