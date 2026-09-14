import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function getUsuarioLogado() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user_id')?.value;

    if (userId) {
      const usuario = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (usuario) return usuario;
    }

    return await prisma.user.findFirst();
  } catch (error) {
    console.error('Erro ao buscar usuário logado:', error);
    return null;
  }
}