import { redirect } from 'next/navigation';
import { getUsuarioLogado } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FormConfiguracoes } from './form-configuracoes';

export const dynamic = 'force-dynamic';

export default async function ConfiguracoesPage() {
  const usuario = await getUsuarioLogado();

  if (!usuario) {
    redirect('/login');
  }

  return (
    <DashboardLayout userType={usuario.tipo as 'MORADOR' | 'SINDICO' | 'PORTARIA'}>
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Minha Conta & Configurações</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Gerencie suas informações cadastrais, localização de moradia e segurança de acesso.
        </p>
      </div>

      <FormConfiguracoes
        usuario={{
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          bloco: usuario.bloco,
          apartamento: usuario.apartamento,
          tipo: usuario.tipo,
        }}
      />
    </DashboardLayout>
  );
}