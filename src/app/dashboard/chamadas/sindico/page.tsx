import { getUsuarioLogado } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { getChamadosSindico, marcarComoVisto, atualizarStatusChamado } from '../actions';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function ChamadasSindicoPage() {
  const usuario = await getUsuarioLogado();

  if (!usuario || (usuario.tipo !== 'SINDICO' && usuario.tipo !== 'PORTARIA')) {
    redirect('/dashboard');
  }

  const chamadas = await getChamadosSindico();
  const pendentes = chamadas.filter((c) => !c.visto).length;

  return (
    <DashboardLayout userType={usuario.tipo as 'SINDICO' | 'PORTARIA'}>
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <h1 className="text-2xl font-bold text-white">Gestão de Ocorrências e Chamados</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Acompanhe, visualize e dê baixa nas ocorrências registradas pelos moradores.
        </p>
      </div>

      <div className="space-y-4 max-w-5xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Todas as Ocorrências</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Total: {chamadas.length}
            </span>
            {pendentes > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                {pendentes} Pendente(s)
              </span>
            )}
          </div>
        </div>

        {chamadas.length === 0 ? (
          <Card className="p-8 text-center text-slate-400">
            Nenhuma ocorrência registrada no condomínio.
          </Card>
        ) : (
          chamadas.map((item) => (
            <Card
              key={item.id}
              className={`p-5 bg-slate-900/90 border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${
                !item.visto ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
              }`}
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-bold text-white text-base">{item.titulo}</h3>
                  <span className="text-xs text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 font-medium">
                    {item.user?.nome} • B. {item.user?.bloco || 'ADM'} / Apt {item.user?.apartamento || '000'}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                      item.status === 'CONCLUIDO'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : item.visto
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {item.status === 'CONCLUIDO' ? 'Concluído' : item.visto ? 'Em Análise' : 'Novo'}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {item.descricao}
                </p>

                <span className="text-xs text-slate-500 block">
                  Aberto em: {new Date(item.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                {!item.visto ? (
                  <form
                    action={async () => {
                      'use server';
                      await marcarComoVisto(item.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-lg transition cursor-pointer"
                    >
                      Marcar como Visto
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
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition cursor-pointer"
                    >
                      Concluir Chamado
                    </button>
                  </form>
                ) : (
                  <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1.5 rounded border border-slate-700">
                    ✓ Finalizado
                  </span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}