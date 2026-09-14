'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function realizarLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const senha = formData.get('senha') as string;

  if (!email || !senha) {
    throw new Error('Preencha todos os campos.');
  }

  const usuario = await prisma.user.findUnique({
    where: { email },
  });

  if (!usuario || usuario.senha !== senha) {
    throw new Error('Credenciais inválidas.');
  }

  // Grava o cookie explicitamente
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'session_user_id',
    value: usuario.id,
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    sameSite: 'lax',
  });

  if (usuario.tipo === 'SINDICO') {
    redirect('/dashboard/admin');
  } else if (usuario.tipo === 'PORTARIA') {
    redirect('/dashboard/portaria');
  } else {
    redirect('/dashboard');
  }
}