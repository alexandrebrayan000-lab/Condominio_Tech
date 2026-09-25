'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { solicitarRedefinicaoSenha } from './actions';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setMensagemSucesso(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('email', email);

    try {
      const res = await solicitarRedefinicaoSenha(formData);
      if (res?.error) {
        setErro(res.error);
      } else if (res?.message) {
        setMensagemSucesso(res.message);
      }
    } catch {
      setErro('Ocorreu um erro ao solicitar redefinição. Tente novamente.');
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

          <h1 className="text-xl font-semibold text-white">Recuperação de Senha</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">
            Informe seu e-mail cadastrado e enviaremos um link para criar uma nova senha
          </p>
        </div>

        <Card className="p-6">
          {mensagemSucesso ? (
            <div className="flex flex-col gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto text-xl font-bold">
                ✉️
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Verifique sua caixa de entrada</h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {mensagemSucesso}
                </p>
              </div>

              <div className="pt-2">
                <Link href="/login">
                  <Button variant="primary" className="w-full">
                    Voltar para o Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {erro && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {erro}
                </div>
              )}

              <Input
                label="Seu E-mail"
                type="email"
                name="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
              </Button>

              <div className="relative my-4 text-center text-xs">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative bg-slate-900 px-3 text-slate-500 font-medium">
                  Lembrou sua senha?
                </span>
              </div>

              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Voltar para o Login
                </Button>
              </Link>
            </form>
          )}
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
