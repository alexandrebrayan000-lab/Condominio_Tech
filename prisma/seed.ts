import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.aviso.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.espaco.deleteMany();

  await prisma.user.upsert({
    where: { email: 'sindico@condominio.com' },
    update: { tipo: 'SINDICO' },
    create: {
      nome: 'Síndico Principal',
      email: 'sindico@condominio.com',
      senha: '123',
      tipo: 'SINDICO',
      bloco: 'ADM',
      apartamento: '000',
    },
  });

  await prisma.user.upsert({
    where: { email: 'portaria@condominio.com' },
    update: { tipo: 'PORTARIA' },
    create: {
      nome: 'Portaria Principal',
      email: 'portaria@condominio.com',
      senha: '123',
      tipo: 'PORTARIA',
      bloco: 'ADM',
      apartamento: '000',
    },
  });

  await prisma.espaco.createMany({
    data: [
      { nome: 'Salão de Festas', descricao: 'Espaço para até 50 pessoas', capacidade: 50 },
      { nome: 'Churrasqueira', descricao: 'Área coberta com grelha', capacidade: 15 },
      { nome: 'Quadra Poliesportiva', descricao: 'Quadra para jogos em geral', capacidade: 20 },
    ],
  });

  console.log('✅ Síndico, Portaria e Espaços criados com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao rodar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });