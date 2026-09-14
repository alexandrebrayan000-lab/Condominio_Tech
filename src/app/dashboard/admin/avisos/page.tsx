import { redirect } from 'next/navigation';
import { getUsuarioLogado } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { criarAviso } from '@/app/dashboard/avisos/actions';

export const dynamic = 'force-dynamic';

export default async function AdminAvisosPage() {
  const usuario = await getUsuarioLogado();

  if (!usuario) redirect('/login');
  if (usuario.tipo !== 'SINDICO' && usuario.tipo !== 'PORTARIA') redirect('/dashboard/avisos');

  return (
    <DashboardLayout userType={usuario.tipo as 'SINDICO' | 'PORTARIA'}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Publicar Comunicado</h1>
        <p className="text-sm text-slate-400 mt-1">Crie avisos oficiais que aparecerão no mural de todos os moradores.</p>
      </div>

      <Card className="p-6 max-w-2xl bg-slate-900/90 border-slate-800">
        <form action={criarAviso} className="flex flex-col gap-4">
          <Input label="Título do Aviso" name="titulo" type="text" placeholder="Ex: Manutenção no Elevador" required />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Mensagem</label>
            <textarea 
              name="conteudo" 
              rows={5} 
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" 
              placeholder="Digite os detalhes do comunicado oficial..." 
              required 
            />
          </div>

          <Button type="submit" size="md" className="w-full mt-2">Publicar no Mural</Button>
        </form>
      </Card>
    </DashboardLayout>
  );
}