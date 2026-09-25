'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { redefinirSenha } from './actions';

function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  if (!token) {
    return (
      <div className="text-center flex flex-col gap-4">
        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          Token de redefinição não encontrado na URL. Certifique-se de acessar o link completo enviado por e-mail.
        </div>
        <Link href="/esqueci-senha">
          <Button variant="outline" className="w-full">
            Solicitar Novo Link
          </Button>
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    if (novaSenha.length < 3) {
      setErro('A nova senha deve ter no mínimo 3 caracteres.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('token', token);
    formData.append('novaSenha', novaSenha);
    formData.append('confirmarSenha', confirmarSenha);

    try {
      const res = await redefinirSenha(formData);
      if (res?.error) {
        setErro(res.error);
      } else {
        setSucesso(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch {
      setErro('Ocorreu um erro ao atualizar sua senha.');
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <div className="text-center flex flex-col gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Senha alterada com sucesso!</h2>
          <p className="text-xs text-slate-400 mt-2">
            Você será redirecionado para a tela de login em alguns segundos...
          </p>
        </div>
        <Link href="/login">
          <Button variant="primary" className="w-full mt-2">
            Ir para o Login Agora
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {erro && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {erro}
        </div>
      )}

      <Input
        label="Nova Senha"
        type="password"
        name="novaSenha"
        required
        placeholder="••••••••"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
      />

      <Input
        label="Confirmar Nova Senha"
        type="password"
        name="confirmarSenha"
        required
        placeholder="••••••••"
        value={confirmarSenha}
        onChange={(e) => setConfirmarSenha(e.target.value)}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full mt-2"
        disabled={loading}
      >
        {loading ? 'Salvando...' : 'Salvar Nova Senha'}
      </Button>
    </form>
  );
}

export default function RedefinirSenhaPage() {
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

          <h1 className="text-xl font-semibold text-white">Criar Nova Senha</h1>
          <p className="text-xs text-slate-400 mt-1">
            Digite sua nova credencial para restabelecer o acesso
          </p>
        </div>

        <Card className="p-6">
          <Suspense fallback={<div className="text-center text-xs text-slate-400 py-6">Carregando formulário...</div>}>
            <RedefinirSenhaForm />
          </Suspense>
        </Card>

        <div className="text-center mt-6">
          <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Voltar para a tela de login
          </Link>
        </div>

      </div>
    </div>
  );
}
