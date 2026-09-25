'use server';

import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { enviarEmailRedefinicao } from '@/lib/mail';

export async function solicitarRedefinicaoSenha(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();

  if (!email) {
    return { error: 'Por favor, informe seu e-mail cadastrado.' };
  }

  try {
    // 1. Valida se o e-mail inserido existe no banco
    const usuario = await prisma.user.findUnique({
      where: { email },
    });

    // Para evitar enumeração de usuários, retornamos sucesso genérico mesmo se não existir
    if (!usuario) {
      return {
        success: true,
        message: 'Se o e-mail informado estiver cadastrado, você receberá um link para redefinir sua senha.',
      };
    }

    // 2. Remove tokens anteriores não utilizados deste e-mail
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // 3. Gera um token aleatório e expiração de 1 hora
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    // 4. Salva no banco
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // 5. Dispara o e-mail
    await enviarEmailRedefinicao(email, token);

    return {
      success: true,
      message: 'Se o e-mail informado estiver cadastrado, você receberá um link para redefinir sua senha.',
    };
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return { error: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.' };
  }
}
