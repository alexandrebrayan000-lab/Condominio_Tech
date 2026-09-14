'use server';

import { prisma } from '@/lib/prisma';
import { getUsuarioLogado } from '@/lib/auth';

export async function getEstatisticasAdmin() {
  const usuario = await getUsuarioLogado();
  if (!usuario || (usuario.tipo !== 'SINDICO' && usuario.tipo !== 'PORTARIA')) {
    return {
      totalMoradores: 0,
      totalChamadosPendentes: 0,
      totalChamadosConcluidos: 0,
      totalReservas: 0,
      totalAvisos: 0,
      ultimosChamados: [],
      ultimasReservas: [],
    };
  }

  const [
    totalMoradores,
    totalChamadosPendentes,
    totalChamadosConcluidos,
    totalReservas,
    totalAvisos,
    ultimosChamados,
    ultimasReservas,
  ] = await Promise.all([
    prisma.user.count({ where: { tipo: 'MORADOR' } }),
    prisma.chamado.count({ where: { visto: false } }),
    prisma.chamado.count({ where: { status: 'CONCLUIDO' } }),
    prisma.reserva.count(),
    prisma.aviso.count(),
    prisma.chamado.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { nome: true, email: true, bloco: true, apartamento: true },
        },
      },
    }),
    prisma.reserva.findMany({
      take: 6,
      orderBy: { dataInicio: 'desc' },
      include: {
        espaco: true,
        user: {
          select: { nome: true, email: true, bloco: true, apartamento: true },
        },
      },
    }),
  ]);

  return {
    totalMoradores,
    totalChamadosPendentes,
    totalChamadosConcluidos,
    totalReservas,
    totalAvisos,
    ultimosChamados,
    ultimasReservas,
  };
}