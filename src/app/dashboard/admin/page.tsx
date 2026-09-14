import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUsuarioLogado } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getEstatisticasAdmin } from './actions';
import { marcarComoVisto, atualizarStatusChamado } from '@/app/dashboard/chamadas/actions';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const usuario = await getUsuarioLogado();

  if (!usuario) {
    redirect('/login');
  }

  // Trava de segurança: apenas Síndico acessa este painel
  if (usuario.tipo !== 'SINDICO') {
    redirect(usuario.tipo === 'PORTARIA' ? '/dashboard/portaria' : '/dashboard');
  }

  const stats = await getEstatisticasAdmin();

  return (
    <DashboardLayout userType="SINDICO">
      {/* Cabeçalho do Painel Administrativo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Painel Administrativo do Síndico
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Gestão operacional, ocorrências dos moradores e controle de reservas do condomínio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/avisos">
            <Button size="sm">
              + Publicar Comunicado
            </Button>
          </Link>
          <Link href="/dashboard/chamadas/sindico">
            <Button variant="outline" size="sm">
              Ver Ocorrências ({stats.totalChamadosPendentes})
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de KPIs Administrativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Ocorrências Pendentes */}
        <Card
          className={`p-5 flex flex-col justify-between transition ${
            stats.totalChamadosPendentes > 0
              ? 'border-red-500/40 bg-gradient-to-b from-red-950/20 to-slate-900/60'
              : 'hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ocorrências Pendentes
              </span>
              <span className="text-base">🚨</span>
            </div>
            <p className="text-3xl font-extrabold text-white mt-2">
              {stats.totalChamadosPendentes}
            </p>
          </div>
          <p className={`text-xs font-medium mt-3 ${stats.totalChamadosPendentes > 0 ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
            {stats.totalChamadosPendentes > 0
              ? `${stats.totalChamadosPendentes} chamado(s) aguardando visualização`
              : 'Todas as ocorrências foram vistas'}
          </p>
        </Card>

        {/* Moradores Cadastrados */}
        <Card className="p-5 flex flex-col justify-between hover:border-cyan-500/40 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total de Moradores
              </span>
              <span className="text-base">👥</span>
            </div>
            <p className="text-3xl font-extrabold text-white mt-2">
              {stats.totalMoradores}
            </p>
          </div>
          <p className="text-xs text-cyan-400 mt-3 font-medium">
            Usuários ativos na plataforma
          </p>
        </Card>

        {/* Total de Reservas */}
        <Card className="p-5 flex flex-col justify-between hover:border-blue-500/40 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Reservas Realizadas
              </span>
              <span className="text-base">📅</span>
            </div>
            <p className="text-3xl font-extrabold text-white mt-2">
              {stats.totalReservas}
            </p>
          </div>
          <p className="text-xs text-blue-400 mt-3 font-medium">
            Agendamentos em áreas comuns
          </p>
        </Card>

        {/* Comunicados Publicados */}
        <Card className="p-5 flex flex-col justify-between hover:border-emerald-500/40 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Avisos no Mural
              </span>
              <span className="text-base">📢</span>
            </div>
            <p className="text-3xl font-extrabold text-white mt-2">
              {stats.totalAvisos}
            </p>
          </div>
          <p className="text-xs text-emerald-400 mt-3 font-medium">
            Informativos oficiais ativos
          </p>
        </Card>
      </div>

      {/* Seção Principal: Ocorrências e Reservas Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ocorrências Recentes (2 Colunas) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Últimas Ocorrências dos Moradores</h2>
              {stats.totalChamadosPendentes > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  {stats.totalChamadosPendentes} Nova(s)
                </span>
              )}
            </div>
            <Link href="/dashboard/chamadas/sindico" className="text-xs text-cyan-400 hover:underline">
              Gerenciar todas →
            </Link>
          </div>

          {stats.ultimosChamados.length === 0 ? (
            <Card className="p-8 text-center bg-slate-900/60">
              <p className="text-slate-300 font-medium text-sm">
                Nenhum chamado aberto até o momento.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                As solicitações registradas pelos moradores aparecerão aqui.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.ultimosChamados.map((item) => (
                <Card
                  key={item.id}
                  className={`p-4 bg-slate-900/80 border transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                    !item.visto ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-sm truncate">{item.titulo}</h3>
                      <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {item.user?.nome} (B. {item.user?.bloco || 'ADM'} • Apt {item.user?.apartamento || '000'})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{item.descricao}</p>
                    <span className="text-[10px] text-slate-500 block">
                      Aberto em: {new Date(item.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!item.visto ? (
                      <form
                        action={async () => {
                          'use server';
                          await marcarComoVisto(item.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          Marcar Visto
                        </button>
                      </form>
                    ) : item.status !== 'CONCLUIDO' ? (
                      <form
                        action={async () => {
                          'use server';
                          await atualizarStatusChamado(item.id, 'CONCLUIDO');
                        }}
                      >
                        <button
                          type="submit"
                          className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          Concluir
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        ✓ Concluído
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Agenda de Reservas Recentes do Condomínio (1 Coluna) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Agenda de Espaços</h2>
            <Link href="/dashboard/reservas" className="text-xs text-cyan-400 hover:underline">
              Ver todas →
            </Link>
          </div>

          {stats.ultimasReservas.length === 0 ? (
            <Card className="p-6 text-center text-slate-400 text-xs">
              Nenhuma reserva registrada.
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.ultimasReservas.map((reserva) => (
                <Card
                  key={reserva.id}
                  className="p-4 bg-slate-900/80 border-slate-800 flex flex-col gap-1.5 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">
                      {reserva.espaco?.nome || 'Espaço'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(reserva.dataInicio).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-white font-medium">
                    {reserva.user?.nome} (B. {reserva.user?.bloco || 'ADM'} • Apt {reserva.user?.apartamento || '000'})
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Das {new Date(reserva.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} até{' '}
                    {new Date(reserva.dataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </Card>
              ))}
            </div>
          )}

          {/* Card de Atalhos Rápidos */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <h3 className="text-sm font-semibold text-white mb-3">Atalhos Operacionais</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/admin/avisos"
                className="p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-center transition block"
              >
                <span className="text-lg block">📢</span>
                <span className="text-xs font-medium text-slate-200 mt-1 block">Criar Aviso</span>
              </Link>
              <Link
                href="/dashboard/reservas"
                className="p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-center transition block"
              >
                <span className="text-lg block">📅</span>
                <span className="text-xs font-medium text-slate-200 mt-1 block">Gestão Reservas</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}