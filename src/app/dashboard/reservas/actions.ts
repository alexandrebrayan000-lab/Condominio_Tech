'use server';

import { prisma } from '@/lib/prisma';
import { getUsuarioLogado } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const ESPACOS_PADRAO = [
  { nome: 'Salão de Festas', descricao: 'Espaço climatizado com mesas, cadeiras e cozinha completa', capacidade: 60 },
  { nome: 'Churrasqueira Gourmet', descricao: 'Área coberta equipada com grelha, freezer e mesas', capacidade: 20 },
  { nome: 'Quadra Poliesportiva', descricao: 'Quadra para futebol de salão, vôlei e basquete', capacidade: 25 },
  { nome: 'Espaço Academia / Fitness', descricao: 'Aparelhos de musculação e esteiras', capacidade: 15 },
];

export async function getEspacos() {
  try {
    let espacos = await prisma.espaco.findMany({
      orderBy: { nome: 'asc' },
    });

    if (espacos.length === 0) {
      await prisma.espaco.createMany({
        data: ESPACOS_PADRAO,
      });
      espacos = await prisma.espaco.findMany({
        orderBy: { nome: 'asc' },
      });
    }

    return espacos;
  } catch (error) {
    console.error('Erro ao buscar espaços:', error);
    return [];
  }
}

export async function getReservas() {
  const usuario = await getUsuarioLogado();

  if (!usuario) {
    return [];
  }

  try {
    const isSindicoOuPortaria = usuario.tipo === 'SINDICO' || usuario.tipo === 'PORTARIA';

    // Síndico e Portaria veem todas as reservas; Morador vê exclusivamente as suas próprias reservas
    const reservas = await prisma.reserva.findMany({
      where: isSindicoOuPortaria ? {} : { userId: usuario.id },
      include: {
        espaco: true,
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            bloco: true,
            apartamento: true,
          },
        },
      },
      orderBy: {
        dataInicio: 'asc',
      },
    });

    return reservas;
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    return [];
  }
}

export async function criarReserva(formData: FormData) {
  const usuario = await getUsuarioLogado();

  if (!usuario) {
    throw new Error('Usuário não autenticado');
  }

  const espacoId = formData.get('espacoId') as string;
  const dataInicioStr = formData.get('dataInicio') as string;
  const dataFimStr = formData.get('dataFim') as string;

  if (!espacoId || !dataInicioStr || !dataFimStr) {
    throw new Error('Todos os campos são obrigatórios.');
  }

  const dataInicio = new Date(dataInicioStr);
  const dataFim = new Date(dataFimStr);

  if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
    throw new Error('Datas e horários informados são inválidos.');
  }

  // Regra 1: Não permitir agendamentos no passado
  const agora = new Date();
  if (dataInicio < agora) {
    throw new Error('Não é permitido realizar reservas para datas ou horários anteriores ao momento atual.');
  }

  // Regra 2: Fim deve ser estritamente posterior ao início
  if (dataFim <= dataInicio) {
    throw new Error('O horário de término deve ser posterior ao horário de início.');
  }

  // Regra 3: Horários não podem ser quebrados (devem ser múltiplos de 30 ou 60 minutos)
  if (dataInicio.getMinutes() % 30 !== 0 || dataInicio.getSeconds() !== 0) {
    throw new Error('O horário de início deve ser cheio ou de meia hora (ex: 14:00 ou 14:30).');
  }

  if (dataFim.getMinutes() % 30 !== 0 || dataFim.getSeconds() !== 0) {
    throw new Error('O horário de término deve ser cheio ou de meia hora (ex: 15:00 ou 15:30).');
  }

  const duracaoMinutos = (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60);
  if (duracaoMinutos < 30 || duracaoMinutos % 30 !== 0) {
    throw new Error('A duração da reserva deve ser de no mínimo 30 minutos em blocos de 30 ou 60 minutos.');
  }

  // Regra 4: Limite razoável de duração contínua (máximo 8 horas por agendamento)
  if (duracaoMinutos > 480) {
    throw new Error('A duração máxima de um agendamento individual é de 8 horas.');
  }

  // Verifica se o espaço realmente existe
  const espaco = await prisma.espaco.findUnique({
    where: { id: espacoId },
  });

  if (!espaco) {
    throw new Error('Espaço selecionado não encontrado.');
  }

  // Regra 5: Conflito de agenda no espaço
  const conflito = await prisma.reserva.findFirst({
    where: {
      espacoId,
      AND: [
        { dataInicio: { lt: dataFim } },
        { dataFim: { gt: dataInicio } },
      ],
    },
    include: {
      user: { select: { nome: true } },
    },
  });

  if (conflito) {
    const inicioFmt = new Date(conflito.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const fimFmt = new Date(conflito.dataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    throw new Error(`Este espaço já está reservado neste período (das ${inicioFmt} às ${fimFmt}). Escolha outro horário.`);
  }

  await prisma.reserva.create({
    data: {
      espacoId,
      dataInicio,
      dataFim,
      userId: usuario.id,
    },
  });

  revalidatePath('/dashboard/reservas');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/portaria');
}

export async function cancelarReserva(reservaId: string) {
  const usuario = await getUsuarioLogado();

  if (!usuario) {
    throw new Error('Não autorizado');
  }

  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
  });

  if (!reserva) {
    throw new Error('Reserva não encontrada.');
  }

  // Apenas o próprio dono da reserva ou o Síndico pode cancelar
  if (reserva.userId !== usuario.id && usuario.tipo !== 'SINDICO') {
    throw new Error('Você não tem permissão para cancelar a reserva de outro morador.');
  }

  await prisma.reserva.delete({
    where: { id: reservaId },
  });

  revalidatePath('/dashboard/reservas');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/portaria');
}