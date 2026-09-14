import { redirect } from 'next/navigation';
import { getUsuarioLogado } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { criarChamado, getChamadosMorador } from './actions';

export const dynamic = 'force-dynamic';

export default async function ChamadosPage() {
  const usuario = await getUsuarioLogado();

  if (!usuario) {
    redirect('/login');
  }

  const chamados = await getChamadosMorador();

  return (
    <DashboardLayout userType={usuario.tipo as 'MORADOR' | 'SINDICO' | 'PORTARIA'}>
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <h1 className="text-2xl font-bold text-white">Abrir Ocorrência ou Chamado</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Registre solicitações de manutenção, dúvidas ou ocorrências para o Síndico e a Administração.
        </p>
      </div>

      <form
        action={criarChamado}
        className="flex flex-col gap-4 bg-slate-900/90 p-6 rounded-xl border border-slate-800 mb-8 max-w-2xl shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-semibold text-white">Nova Solicitação</h3>
          <span className="text-xs text-slate-400">Resposta em até 24h</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Título da Ocorrência *
          </label>
          <input
            name="titulo"
            placeholder="Ex: Lâmpada queimada no corredor do 3º andar"
            required
            className="w-full p-3 rounded-lg bg-slate-800/80 text-white border border-slate-700 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Descrição Detalhada *
          </label>
          <textarea
            name="descricao"
            placeholder="Descreva o ocorrido com o máximo de detalhes para facilitar o atendimento..."
            rows={4}
            required
            className="w-full p-3 rounded-lg bg-slate-800/80 text-white border border-slate-700 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
          />
        </div>

        <Button type="submit" size="md" className="self-start mt-2">
          Enviar Ocorrência
        </Button>
      </form>

      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Meu Histórico de Ocorrências</h2>
          <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            Total: {chamados.length}
          </span>
        </div>

        {chamados.length === 0 ? (
          <Card className="p-8 text-center bg-slate-900/60">
            <p className="text-slate-300 font-medium text-sm">Nenhum chamado aberto até o momento.</p>
            <p className="text-xs text-slate-500 mt-1">
              Caso identifique algum problema nas áreas comuns, utilize o formulário acima.
            </p>
          </Card>
        ) : (
          chamados.map((item) => (
            <Card
              key={item.id}
              className="p-5 bg-slate-900/90 border-slate-800 flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-slate-700 transition"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-white text-base">{item.titulo}</h3>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                      item.status === 'CONCLUIDO'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : item.visto
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {item.status === 'CONCLUIDO'
                      ? 'Concluído'
                      : item.visto
                      ? 'Em Análise pelo Síndico'
                      : 'Pendente'}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {item.descricao}
                </p>
                <span className="text-xs text-slate-500 block">
                  Registrado em: {new Date(item.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}