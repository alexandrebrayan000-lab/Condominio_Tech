import { redirect } from 'next/navigation';
import { getUsuarioLogado } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { getReservasDoDia } from './actions';

export const dynamic = 'force-dynamic';

export default async function PortariaPage() {
  const usuario = await getUsuarioLogado();

  if (!usuario) redirect('/login');
  // Apenas PORTARIA tem acesso a este painel
  if (usuario.tipo !== 'PORTARIA') {
    redirect(usuario.tipo === 'SINDICO' ? '/dashboard/admin' : '/dashboard');
  }

  const reservas = await getReservasDoDia();

  return (
    <DashboardLayout userType="PORTARIA">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚪</span>
          <h1 className="text-2xl font-bold text-white">Controle de Portaria & Acessos</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Liberação e uso das áreas comuns do condomínio na data de hoje.
        </p>
      </div>

      <Card className="p-6 bg-slate-900/90 border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-white">
            Agenda do Dia: {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </h2>
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {reservas.length} liberação(ões) hoje
          </span>
        </div>

        {reservas.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm font-medium text-slate-300">Nenhuma reserva agendada para o dia de hoje.</p>
            <p className="text-xs text-slate-500 mt-1">Os espaços comuns estão livres para manutenção ou novas solicitações.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Morador / Unidade</th>
                  <th className="py-3 px-4">Espaço Reservado</th>
                  <th className="py-3 px-4">Horário</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reservas.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{r.user?.nome || 'Morador'}</p>
                      <p className="text-xs text-slate-400">
                        Bloco {r.user?.bloco || 'ADM'} • Apt {r.user?.apartamento || '000'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-cyan-400">
                        {r.espaco?.nome || 'Espaço'}
                      </span>
                      {r.espaco?.capacidade && (
                        <span className="text-[11px] text-slate-500 block">
                          Capacidade: até {r.espaco.capacidade} pessoas
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {new Date(r.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às{' '}
                      {new Date(r.dataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                        LIBERADO
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}