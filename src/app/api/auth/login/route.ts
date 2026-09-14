import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json();

    const usuario = await prisma.user.findUnique({
      where: { email },
    });

    if (!usuario || usuario.senha !== senha) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Cria a resposta e grava o cookie nela de forma limpa
    const response = NextResponse.json({ success: true, tipo: usuario.tipo });

    response.cookies.set('session_user_id', usuario.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}