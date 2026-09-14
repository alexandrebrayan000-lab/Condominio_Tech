import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">

      {/* Header / Navegação */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="CondomínioTech Logo"
              width={160}
              height={40}
              style={{ width: 'auto', height: '40px' }}
              className="object-contain"
              priority
            />
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button variant="primary" size="sm">Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20 flex-1 flex flex-col justify-center items-center text-center">

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
          Tecnologia que conecta, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">simplifica e transforma</span> a vida em condomínio.
        </h1>

        <p className="mt-6 text-lg text-slate-400 max-w-2xl leading-relaxed">
          Centralize avisos, reservas e a comunicação do seu condomínio em uma plataforma inteligente. Adeus grupos desorganizados e processos manuais.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/cadastro">
            <Button size="lg" className="w-full sm:w-auto">Começar Agora</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">Acessar Minha Conta</Button>
          </Link>
        </div>

        {/* Grade de Benefícios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
          <Card>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4">
              📅
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Reservas Sem Conflito</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Agende salão de festas, churrasqueiras e quadras em segundos com checagem automática de disponibilidade.
            </p>
          </Card>

          <Card>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4">
              📢
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Comunicação Unificada</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mantenha todos informados com avisos oficiais em um só lugar, substituindo murais e grupos ruidosos.
            </p>
          </Card>

          <Card>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4">
              🤖
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Ecossistema Inteligente</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Preparado para automações e assistência via Inteligência Artificial para facilitar o dia a dia de todos.
            </p>
          </Card>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Condomínio Tech. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}