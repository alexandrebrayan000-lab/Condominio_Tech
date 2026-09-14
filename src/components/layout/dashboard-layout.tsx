import { getUsuarioLogado } from '@/lib/auth';
import { getNotificacoesSummary } from '@/app/dashboard/chamadas/actions';
import { DashboardLayoutClient } from './dashboard-layout-client';

type DashboardLayoutProps = {
  children: React.ReactNode;
  userType?: 'MORADOR' | 'SINDICO' | 'PORTARIA';
};

export async function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const usuario = await getUsuarioLogado();
  const summary = await getNotificacoesSummary();

  const finalUserType = userType || usuario?.tipo || 'MORADOR';

  return (
    <DashboardLayoutClient
      userType={finalUserType}
      userName={usuario?.nome || 'Usuário'}
      userBloco={usuario?.bloco || null}
      userApto={usuario?.apartamento || null}
      chamadosPendentesCount={summary.chamadosPendentesCount}
      avisosRecentesCount={summary.avisosRecentesCount}
      notificacoes={summary.notificacoes}
    >
      {children}
    </DashboardLayoutClient>
  );
}