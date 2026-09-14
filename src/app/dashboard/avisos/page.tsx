import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUsuarioLogado } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAvisos, deletarAviso } from './actions';

export const dynamic = 'force-dynamic';

export default async function MuralAvisosPage() {
  const usuario = await getUsuarioLogado();

  if (!usuario) {
    redirect('/login');
  }

  const avisos = await getAvisos();
  const isSindico = usuario.tipo === 'SINDICO';

  return (
    <DashboardLayout userType={usuario.tipo as 'MORADOR' | 'SINDICO' | 'PORTARIA'}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📢</span>
            <h1 className="text-2xl font-bold text-white">Mural de Avisos & Comunicados</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Comunicações oficiais, avisos de manutenção e circulares da administração.
          </p>
        </div>

        {(isSindico || usuario.tipo === 'PORTARIA') && (
          <Link href="/dashboard/admin/avisos">
            <Button size="sm">+ Publicar Novo Aviso</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-4 max-w-4xl">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-white">Comunicados Oficiais</h2>
          <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            Total: {avisos.length} aviso(s)
          </span>
        </div>

        {avisos.length === 0 ? (
          <Card className="p-8 text-center bg-slate-900/60">
            <p className="text-slate-300 font-medium text-sm">Nenhum aviso publicado até o momento.</p>
            <p className="text-xs text-slate-500 mt-1">Os comunicados oficiais da administração aparecerão aqui.</p>
          </Card>
        ) : (
          avisos.map((aviso) => (
            <Card
              key={aviso.id}
              className="p-6 bg-slate-900/90 border-slate-800 flex flex-col gap-3 hover:border-slate-700 transition"
            >
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📌</span>
                  <h3 className="text-base font-bold text-white">{aviso.titulo}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                    {new Date(aviso.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>

                  {isSindico && (
                    <form
                      action={async () => {
                        'use server';
                        await deletarAviso(aviso.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-2.5 py-1 rounded font-medium transition cursor-pointer"
                        title="Excluir comunicado"
                      >
                        Excluir
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed border-t border-slate-800/80 pt-3">
                {aviso.conteudo}
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-800/40">
                <span>Publicado por: {aviso.user?.nome || 'Administração'} ({aviso.user?.tipo || 'SÍNDICO'})</span>
                <span>CondomínioTech</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}