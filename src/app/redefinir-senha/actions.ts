'use server';

import { prisma } from '@/lib/prisma';

export async function redefinirSenha(formData: FormData) {
  const token = formData.get('token') as string;
  const novaSenha = formData.get('novaSenha') as string;
  const confirmarSenha = formData.get('confirmarSenha') as string;

  if (!token) {
    return { error: 'Token de redefinição não informado ou inválido.' };
  }

  if (!novaSenha || !confirmarSenha) {
    return { error: 'Por favor, preencha todos os campos.' };
  }

  if (novaSenha !== confirmarSenha) {
    return { error: 'As senhas informadas não coincidem.' };
  }

  if (novaSenha.length < 3) {
    return { error: 'A nova senha deve ter no mínimo 3 caracteres.' };
  }

  try {
    // 1. Valida se o token existe em PasswordResetToken
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { error: 'Link de redefinição inválido ou já utilizado.' };
    }

    // 2. Valida se não está expirado
    if (new Date() > resetToken.expiresAt) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return { error: 'Este link expirou. Por favor, solicite uma nova redefinição de senha.' };
    }

    // 3. Atualiza a senha do usuário
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { senha: novaSenha },
    });

    // 4. Remove o token utilizado
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return {
      success: true,
      message: 'Senha alterada com sucesso! Você já pode entrar com sua nova senha.',
    };
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return { error: 'Ocorreu um erro ao atualizar sua senha. Tente novamente.' };
  }
}

export async function verificarTokenValido(token: string) {
  if (!token) return false;
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });
    if (!resetToken) return false;
    if (new Date() > resetToken.expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}
