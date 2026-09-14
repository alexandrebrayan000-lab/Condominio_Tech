'use server';

import { prisma } from '@/lib/prisma';
import { getUsuarioLogado } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function criarChamado(formData: FormData) {
  const usuario = await getUsuarioLogado();
  if (!usuario) throw new Error('Não autorizado');

  const titulo = formData.get('titulo') as string;
  const descricao = formData.get('descricao') as string;

  if (!titulo || !descricao) {
    throw new Error('Título e descrição são obrigatórios.');
  }

  await prisma.chamado.create({
    data: {
      titulo,
      descricao,
      userId: usuario.id,
      status: 'PENDENTE',
      visto: false,
    },
  });

  revalidatePath('/dashboard/chamadas');
  revalidatePath('/dashboard/chamadas/morador');
  revalidatePath('/dashboard/chamadas/sindico');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/admin');
}

export async function getChamadosMorador() {
  const usuario = await getUsuarioLogado();
  if (!usuario) return [];

  return await prisma.chamado.findMany({
    where: { userId: usuario.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getChamadosSindico() {
  return await prisma.chamado.findMany({
    include: {
      user: {
        select: { nome: true, email: true, bloco: true, apartamento: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function marcarComoVisto(chamadoId: string) {
  await prisma.chamado.update({
    where: { id: chamadoId },
    data: { visto: true, status: 'EM_ANALISE' },
  });

  revalidatePath('/dashboard/chamadas');
  revalidatePath('/dashboard/chamadas/sindico');
  revalidatePath('/dashboard/chamadas/morador');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/admin');
}

export async function atualizarStatusChamado(chamadoId: string, status: string) {
  const usuario = await getUsuarioLogado();
  if (!usuario || (usuario.tipo !== 'SINDICO' && usuario.tipo !== 'PORTARIA')) {
    throw new Error('Não autorizado');
  }

  await prisma.chamado.update({
    where: { id: chamadoId },
    data: {
      status,
      visto: true,
    },
  });

  revalidatePath('/dashboard/chamadas');
  revalidatePath('/dashboard/chamadas/sindico');
  revalidatePath('/dashboard/chamadas/morador');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/admin');
}

export async function marcarTodasNotificacoesComoLidas() {
  const usuario = await getUsuarioLogado();
  if (!usuario) return;

  if (usuario.tipo === 'SINDICO') {
    await prisma.chamado.updateMany({
      where: { visto: false },
      data: { visto: true, status: 'EM_ANALISE' },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/chamadas/sindico');
  revalidatePath('/dashboard/reservas');
}

export async function getNotificacoesSummary() {
  const usuario = await getUsuarioLogado();
  if (!usuario) {
    return {
      chamadosPendentesCount: 0,
      avisosRecentesCount: 0,
      notificacoes: [],
    };
  }

  try {
    if (usuario.tipo === 'SINDICO') {
      const [chamadosNaoVistos, ultimosAvisos, ultimosChamados, ultimasReservas] = await Promise.all([
        prisma.chamado.count({ where: { visto: false } }),
        prisma.aviso.count(),
        prisma.chamado.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { nome: true, bloco: true, apartamento: true } },
          },
        }),
        prisma.reserva.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            espaco: true,
            user: { select: { nome: true, bloco: true, apartamento: true } },
          },
        }),
      ]);

      const notificacoesChamados = ultimosChamados.map((c) => ({
        id: `c-${c.id}`,
        dbId: c.id,
        tipo: 'CHAMADO' as const,
        titulo: `Novo chamado: ${c.titulo}`,
        descricao: `Por ${c.user?.nome || 'Morador'} (B. ${c.user?.bloco || 'ADM'} / Apt ${c.user?.apartamento || '000'})`,
        data: c.createdAt,
        lido: c.visto,
        link: '/dashboard/chamadas/sindico',
      }));

      const notificacoesReservas = ultimasReservas.map((r) => {
        const dataFmt = new Date(r.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        const horaFmt = new Date(r.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return {
          id: `r-${r.id}`,
          dbId: r.id,
          tipo: 'RESERVA' as const,
          titulo: `Nova reserva: ${r.espaco?.nome || 'Espaço'}`,
          descricao: `${r.user?.nome || 'Morador'} (B. ${r.user?.bloco || 'ADM'} • Apt ${r.user?.apartamento || '000'}) para ${dataFmt} às ${horaFmt}`,
          data: r.createdAt,
          lido: true,
          link: '/dashboard/reservas',
        };
      });

      const todasNotificacoes = [...notificacoesChamados, ...notificacoesReservas]
        .sort((a, b) => b.data.getTime() - a.data.getTime())
        .slice(0, 8);

      return {
        chamadosPendentesCount: chamadosNaoVistos,
        avisosRecentesCount: ultimosAvisos,
        notificacoes: todasNotificacoes,
      };
    } else {
      // Para Morador
      const [avisosCount, ultimosAvisos, meusChamadosAtualizados] = await Promise.all([
        prisma.aviso.count(),
        prisma.aviso.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.chamado.findMany({
          where: { userId: usuario.id },
          take: 4,
          orderBy: { updatedAt: 'desc' },
        }),
      ]);

      const notificacoes = [
        ...ultimosAvisos.map((a) => ({
          id: `a-${a.id}`,
          dbId: a.id,
          tipo: 'AVISO' as const,
          titulo: `Comunicado: ${a.titulo}`,
          descricao: a.conteudo.slice(0, 80) + '...',
          data: a.createdAt,
          lido: true,
          link: '/dashboard/avisos',
        })),
        ...meusChamadosAtualizados.map((c) => ({
          id: `cs-${c.id}`,
          dbId: c.id,
          tipo: 'CHAMADO_STATUS' as const,
          titulo: `Status da Ocorrência: ${c.titulo}`,
          descricao: c.status === 'CONCLUIDO' ? 'Marcado como Concluído' : c.visto ? 'Em Análise pelo Síndico' : 'Pendente de visualização',
          data: c.updatedAt,
          lido: c.visto,
          link: '/dashboard/chamadas',
        })),
      ].sort((a, b) => b.data.getTime() - a.data.getTime()).slice(0, 6);

      return {
        chamadosPendentesCount: 0,
        avisosRecentesCount: avisosCount,
        notificacoes,
      };
    }
  } catch (error) {
    console.error('Erro ao buscar resumo de notificações:', error);
    return {
      chamadosPendentesCount: 0,
      avisosRecentesCount: 0,
      notificacoes: [],
    };
  }
}