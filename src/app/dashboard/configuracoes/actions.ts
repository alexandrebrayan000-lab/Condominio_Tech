'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getUsuarioLogado } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function atualizarPerfil(formData: FormData) {
  const usuario = await getUsuarioLogado();

  if (!usuario) {
    throw new Error('Não autenticado');
  }

  const nome = formData.get('nome') as string;
  const bloco = formData.get('bloco') as string;
  const apartamento = formData.get('apartamento') as string;

  if (!nome) {
    throw new Error('O nome é obrigatório.');
  }

  await prisma.user.update({
    where: { id: usuario.id },
    data: {
      nome,
      bloco: bloco || usuario.bloco || '',
      apartamento: apartamento || usuario.apartamento || '',
    },
  });

  revalidatePath('/dashboard/configuracoes');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/admin');
}

export async function alterarSenha(formData: FormData) {
  const usuario = await getUsuarioLogado();

  if (!usuario) {
    throw new Error('Não autenticado');
  }

  const senhaAtual = formData.get('senhaAtual') as string;
  const novaSenha = formData.get('novaSenha') as string;
  const confirmarSenha = formData.get('confirmarSenha') as string;

  if (!senhaAtual || !novaSenha || !confirmarSenha) {
    throw new Error('Todos os campos de senha são obrigatórios.');
  }

  if (novaSenha !== confirmarSenha) {
    throw new Error('A nova senha e a confirmação não conferem.');
  }

  if (novaSenha.length < 3) {
    throw new Error('A nova senha deve ter no mínimo 3 caracteres.');
  }

  // Verifica senha atual
  const userNoBanco = await prisma.user.findUnique({
    where: { id: usuario.id },
  });

  if (!userNoBanco || userNoBanco.senha !== senhaAtual) {
    throw new Error('A senha atual informada está incorreta.');
  }

  await prisma.user.update({
    where: { id: usuario.id },
    data: { senha: novaSenha },
  });

  revalidatePath('/dashboard/configuracoes');
}

export async function atualizarTipoUsuario(formData: FormData) {
  const usuario = await getUsuarioLogado();

  if (!usuario || usuario.tipo !== 'SINDICO') {
    throw new Error('Apenas o Síndico pode alterar níveis de permissão.');
  }

  const userId = formData.get('userId') as string;
  const novoTipo = formData.get('tipo') as string;

  if (!userId || !novoTipo) return;

  await prisma.user.update({
    where: { id: userId },
    data: { 
      tipo: novoTipo as Role,
    },
  });

  revalidatePath('/dashboard', 'layout');
}