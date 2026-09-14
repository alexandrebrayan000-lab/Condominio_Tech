'use server';

import { prisma } from '@/lib/prisma';

export async function getReservasDoDia() {
  const hojeInicio = new Date();
  hojeInicio.setHours(0, 0, 0, 0);

  const hojeFim = new Date();
  hojeFim.setHours(23, 59, 59, 999);

  return await prisma.reserva.findMany({
    where: {
      dataInicio: {
        gte: hojeInicio,
        lte: hojeFim,
      },
    },
    include: {
      espaco: true,
      user: {
        select: {
          nome: true,
          email: true,
          bloco: true,
          apartamento: true,
        },
      },
    },
    orderBy: { dataInicio: 'asc' },
  });
}