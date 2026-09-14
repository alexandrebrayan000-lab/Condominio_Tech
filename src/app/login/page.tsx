'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.get('email'),
          senha: formData.get('senha'),
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || 'E-mail ou senha incorretos.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 py-12 selection:bg-cyan-500 selection:text-slate-950">
      <div className="w-full max-w-md">
        
        {/* Cabeçalho com Logo Oficial */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="CondomínioTech Logo"
              width={240}
              height={80}
              priority
              className="h-16 w-auto object-contain"
            />
          </Link>

          <h1 className="text-xl font-semibold text-white">Acesse sua conta</h1>
          <p className="text-xs text-slate-400 mt-1">
            Informe suas credenciais para entrar na plataforma
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            
            {/* Box de Erro Elegante */}
            {error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">E-mail</label>
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="seu@email.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Senha</label>
              <input 
                type="password" 
                name="senha" 
                required 
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full mt-2" 
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Divisor Visual */}
          <div className="relative my-6 text-center text-xs">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-3 text-slate-500 font-medium">
              Ainda não tem uma conta?
            </span>
          </div>

          <Link href="/cadastro">
            <Button variant="outline" className="w-full">
              Criar Conta
            </Button>
          </Link>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Voltar para a página inicial
          </Link>
        </div>

      </div>
    </div>
  );
}