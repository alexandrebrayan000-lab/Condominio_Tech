import { getUsuarioLogado } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import FormReserva from './form-reserva';
import { getEspacos, getReservas, cancelarReserva } from './actions';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function ReservasPage() {
  const usuario = await getUsuarioLogado();

  if (!usuario) {
    redirect('/login');
  }

  const [espacos, reservas] = await Promise.all([
    getEspacos(),
    getReservas(),
  ]);

  const isSindico = usuario.tipo === 'SINDICO';
  const isPortaria = usuario.tipo === 'PORTARIA';
  const isGestor = isSindico || isPortaria;

  const agora = new Date();
  const reservasFuturas = reservas.filter((r) => new Date(r.dataFim) >= agora);
  const reservasPassadas = reservas.filter((r) => new Date(r.dataFim) < agora);

  return (
    <DashboardLayout userType={usuario.tipo as 'MORADOR' | 'SINDICO' | 'PORTARIA'}>
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📅</span>
          <h1 className="text-2xl font-bold text-white">
            {isGestor ? 'Gestão e Controle de Reservas' : 'Minhas Reservas de Espaços'}
          </h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          {isGestor
            ? 'Visualização completa de todas as reservas agendadas pelos moradores nas áreas comuns.'
            : 'Agende salão de festas, churrasqueira, quadra ou academia para seus eventos com horários padronizados.'}
        </p>
      </div>

      {/* Formulário de Agendamento */}
      <FormReserva espacos={espacos} />

      {/* Lista de Reservas Ativas / Futuras */}
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isGestor ? 'Próximas Reservas do Condomínio' : 'Meus Próximos Agendamentos'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reservas ativas e confirmadas para os próximos dias
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
            {reservasFuturas.length} ativa(s)
          </span>
        </div>

        {reservasFuturas.length === 0 ? (
          <Card className="p-8 text-center bg-slate-900/60 border-slate-800">
            <p className="text-base font-medium text-slate-300">Nenhum agendamento futuro no momento.</p>
            <p className="text-xs text-slate-500 mt-1">
              Utilize o formulário acima para escolher uma data e reservar um espaço.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {reservasFuturas.map((reserva) => {
              const dataInicio = new Date(reserva.dataInicio);
              const dataFim = new Date(reserva.dataFim);
              const ehProprioDono = reserva.userId === usuario.id;
              const podeCancelar = ehProprioDono || isSindico;

              return (
                <Card
                  key={reserva.id}
                  className="p-5 bg-slate-900/90 border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-700 transition shadow-sm"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-base">
                        {reserva.espaco?.nome || 'Espaço do Condomínio'}
                      </h3>
                      {reserva.espaco?.capacidade && (
                        <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded border border-slate-700">
                          Capacidade: {reserva.espaco.capacidade} pessoas
                        </span>
                      )}
                      {isGestor && (
                        <span className="text-xs bg-cyan-950/80 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800/80 font-medium">
                          👤 {reserva.user?.nome} (B. {reserva.user?.bloco || 'ADM'} • Apt {reserva.user?.apartamento || '000'})
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300 flex flex-col sm:flex-row sm:gap-4 gap-1">
                      <span className="flex items-center gap-1.5">
                        <strong className="text-slate-400">Data:</strong>{' '}
                        {dataInicio.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <strong className="text-slate-400">Horário:</strong>{' '}
                        {dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} até às{' '}
                        {dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs px-3 py-1.5 rounded-full font-semibold border bg-emerald-950/60 text-emerald-400 border-emerald-800/80">
                      Confirmada
                    </span>

                    {podeCancelar && (
                      <form
                        action={async () => {
                          'use server';
                          await cancelarReserva(reserva.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                          title={isSindico && !ehProprioDono ? 'Cancelar reserva como Síndico' : 'Cancelar minha reserva'}
                        >
                          Cancelar
                        </button>
                      </form>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Histórico de Reservas Concluídas / Passadas */}
        {reservasPassadas.length > 0 && (
          <div className="pt-6 border-t border-slate-800/80 space-y-3">
            <h3 className="text-sm font-semibold text-slate-400">
              Histórico de Reservas Concluídas ({reservasPassadas.length})
            </h3>
            <div className="flex flex-col gap-2">
              {reservasPassadas.slice(0, 5).map((reserva) => (
                <div
                  key={reserva.id}
                  className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800/60 flex justify-between items-center text-xs opacity-75"
                >
                  <div>
                    <span className="font-semibold text-slate-300">
                      {reserva.espaco?.nome || 'Espaço'}
                    </span>
                    {isGestor && (
                      <span className="text-slate-400 ml-2">
                        • {reserva.user?.nome} (B. {reserva.user?.bloco || 'ADM'} • Apt {reserva.user?.apartamento || '000'})
                      </span>
                    )}
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(reserva.dataInicio).toLocaleDateString('pt-BR')} das{' '}
                      {new Date(reserva.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às{' '}
                      {new Date(reserva.dataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                    Finalizada
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}