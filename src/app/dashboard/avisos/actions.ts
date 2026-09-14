'use server';

import { prisma } from '@/lib/prisma';
import { getUsuarioLogado } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getAvisos() {
  return await prisma.aviso.findMany({
    include: {
      user: {
        select: { nome: true, tipo: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function criarAviso(formData: FormData) {
  const usuario = await getUsuarioLogado();

  if (!usuario || (usuario.tipo !== 'SINDICO' && usuario.tipo !== 'PORTARIA')) {
    throw new Error('Apenas o Síndico ou Portaria podem publicar avisos.');
  }

  const titulo = formData.get('titulo') as string;
  const conteudo = formData.get('conteudo') as string;

  if (!titulo || !conteudo) {
    throw new Error('Título e conteúdo são obrigatórios.');
  }

  await prisma.aviso.create({
    data: {
      titulo,
      conteudo,
      userId: usuario.id,
    },
  });

  revalidatePath('/dashboard/avisos');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/admin/avisos');
}

export async function deletarAviso(avisoId: string) {
  const usuario = await getUsuarioLogado();

  if (!usuario || usuario.tipo !== 'SINDICO') {
    throw new Error('Não autorizado');
  }

  await prisma.aviso.delete({
    where: { id: avisoId },
  });

  revalidatePath('/dashboard/avisos');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/admin/avisos');
}