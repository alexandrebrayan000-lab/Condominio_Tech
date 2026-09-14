import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUsuarioLogado } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const usuarioLogado = await getUsuarioLogado();

  if (!usuarioLogado) {
    redirect('/login');
  }

  // Redireciona perfis administrativos para seus respectivos painéis principais
  if (usuarioLogado.tipo === 'SINDICO') {
    redirect('/dashboard/admin');
  } else if (usuarioLogado.tipo === 'PORTARIA') {
    redirect('/dashboard/portaria');
  }

  // Busca as informações completas do usuário no banco
  const usuario = await prisma.user.findUnique({
    where: { id: usuarioLogado.id },
  });

  if (!usuario) {
    redirect('/login');
  }

  const agora = new Date();

  // 1. Busca as reservas do morador
  const [minhasReservas, totalAvisos, ultimosAvisos, meusChamados, totalEspacos] = await Promise.all([
    prisma.reserva.findMany({
      where: { userId: usuario.id },
      include: { espaco: true },
      orderBy: { dataInicio: 'asc' },
    }),
    prisma.aviso.count(),
    prisma.aviso.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.chamado.findMany({
      where: { userId: usuario.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.espaco.count(),
  ]);

  // Próxima reserva ativa (que ainda não terminou)
  const proximaReserva = minhasReservas.find((r) => new Date(r.dataFim) >= agora) || minhasReservas[0];

  // Chamados pendentes
  const chamadosAbertos = meusChamados.filter((c) => c.status !== 'CONCLUIDO').length;

  const infoApartamento =
    usuario.bloco || usuario.apartamento
      ? `${usuario.bloco ? `Bloco ${usuario.bloco}` : ''}${usuario.bloco && usuario.apartamento ? ' • ' : ''}${usuario.apartamento ? `Apto ${usuario.apartamento}` : ''}`
      : 'Condomínio Tech';

  return (
    <DashboardLayout userType="MORADOR">
      {/* Cabeçalho de Boas-vindas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Olá, {usuario.nome} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {infoApartamento} • Painel Geral do Morador
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/chamadas">
            <Button variant="outline" size="sm">
              + Abrir Ocorrência
            </Button>
          </Link>
          <Link href="/dashboard/reservas">
            <Button size="sm">
              + Nova Reserva
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de Métricas e Indicadores Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Próxima Reserva */}
        <Card className="p-5 flex flex-col justify-between hover:border-cyan-500/40 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Próxima Reserva
              </span>
              <span className="text-base">📅</span>
            </div>
            <p className="text-lg font-bold text-white mt-2 truncate">
              {proximaReserva?.espaco?.nome || 'Sem reservas'}
            </p>
          </div>
          <p className="text-xs text-cyan-400 font-medium mt-3">
            {proximaReserva
              ? new Date(proximaReserva.dataInicio).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Nenhum agendamento futuro'}
          </p>
        </Card>

        {/* Mural de Avisos */}
        <Card className="p-5 flex flex-col justify-between hover:border-blue-500/40 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Mural de Avisos
              </span>
              <span className="text-base">📢</span>
            </div>
            <p className="text-lg font-bold text-white mt-2">
              {totalAvisos} {totalAvisos === 1 ? 'Comunicado' : 'Comunicados'}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-3 truncate">
            {ultimosAvisos[0]?.titulo ? `Último: ${ultimosAvisos[0].titulo}` : 'Nenhum aviso publicado'}
          </p>
        </Card>

        {/* Minhas Ocorrências */}
        <Card className="p-5 flex flex-col justify-between hover:border-amber-500/40 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Minhas Ocorrências
              </span>
              <span className="text-base">📝</span>
            </div>
            <p className="text-lg font-bold text-white mt-2">
              {chamadosAbertos} {chamadosAbertos === 1 ? 'Em Aberto' : 'Em Aberto'}
            </p>
          </div>
          <p className="text-xs text-amber-400 mt-3">
            {chamadosAbertos > 0 ? 'Aguardando retorno do Síndico' : 'Nenhuma pendência ativa'}
          </p>
        </Card>

        {/* Espaços Comuns */}
        <Card className="p-5 flex flex-col justify-between hover:border-emerald-500/40 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Áreas Comuns
              </span>
              <span className="text-base">🏢</span>
            </div>
            <p className="text-lg font-bold text-white mt-2">
              {totalEspacos} {totalEspacos === 1 ? 'Espaço' : 'Espaços'}
            </p>
          </div>
          <p className="text-xs text-emerald-400 mt-3">
            Disponíveis para agendamento
          </p>
        </Card>
      </div>

      {/* Grade com Minhas Reservas e Últimos Avisos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Minhas Reservas (2 Colunas) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Minhas Reservas Agendadas</h2>
            <Link href="/dashboard/reservas" className="text-xs text-cyan-400 hover:underline">
              Ver todas →
            </Link>
          </div>

          {minhasReservas.length === 0 ? (
            <Card className="p-8 text-center bg-slate-900/60">
              <p className="text-slate-300 font-medium text-sm">
                Você não possui reservas agendadas.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Agende o salão de festas, churrasqueira ou quadra poliesportiva para o seu evento.
              </p>
              <Link href="/dashboard/reservas" className="mt-4 inline-block">
                <Button size="sm">Fazer um Agendamento</Button>
              </Link>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {minhasReservas.slice(0, 4).map((reserva) => {
                const dataInicio = new Date(reserva.dataInicio);
                const dataFim = new Date(reserva.dataFim);
                const expirada = dataFim < agora;

                return (
                  <Card
                    key={reserva.id}
                    className="p-4 bg-slate-900/80 border-slate-800 flex justify-between items-center hover:border-slate-700 transition"
                  >
                    <div>
                      <p className="font-semibold text-sm text-white">
                        {reserva.espaco?.nome || 'Espaço do Condomínio'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        🗓️ {dataInicio.toLocaleDateString('pt-BR')} das{' '}
                        {dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às{' '}
                        {dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        expirada
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {expirada ? 'Concluída' : 'Confirmada'}
                    </span>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Últimos Comunicados Oficiais (1 Coluna) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Mural Oficial</h2>
            <Link href="/dashboard/avisos" className="text-xs text-cyan-400 hover:underline">
              Ver mural →
            </Link>
          </div>

          {ultimosAvisos.length === 0 ? (
            <Card className="p-6 text-center text-slate-400 text-xs">
              Nenhum comunicado recente.
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {ultimosAvisos.map((aviso) => (
                <Card key={aviso.id} className="p-4 bg-slate-900/80 border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white truncate">{aviso.titulo}</h3>
                    <span className="text-[10px] text-slate-500">
                      {new Date(aviso.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {aviso.conteudo}
                  </p>
                </Card>
              ))}
            </div>
          )}

          {/* Ocorrências Recentes do Morador */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Minhas Ocorrências</h3>
              <Link href="/dashboard/chamadas" className="text-[11px] text-cyan-400 hover:underline">
                Abrir nova →
              </Link>
            </div>

            {meusChamados.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Você não possui ocorrências abertas.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {meusChamados.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-xs font-medium text-white truncate">{item.titulo}</p>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                        item.status === 'CONCLUIDO'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : item.visto
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {item.status === 'CONCLUIDO'
                        ? 'Concluído'
                        : item.visto
                        ? 'Em Análise'
                        : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}