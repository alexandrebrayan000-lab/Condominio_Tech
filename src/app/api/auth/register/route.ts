import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { nome, email, senha, bloco, apartamento } = await request.json();

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { message: 'Preencha todos os campos obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica se e-mail já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este e-mail já está cadastrado' },
        { status: 400 }
      );
    }

    // Cria o usuário com o perfil de MORADOR fixo e seguro
    const newUser = await prisma.user.create({
      data: {
        nome,
        email,
        senha,
        bloco: bloco || null,
        apartamento: apartamento || null,
        tipo: 'MORADOR',
      },
    });

    return NextResponse.json(
      { message: 'Usuário criado com sucesso', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro no cadastro de usuário:', error);
    return NextResponse.json(
      { message: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}