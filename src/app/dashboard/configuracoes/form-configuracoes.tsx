'use client';

import { useState } from 'react';
import { atualizarPerfil, alterarSenha } from './actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FormConfiguracoesProps {
  usuario: {
    id: string;
    nome: string;
    email: string;
    bloco: string | null;
    apartamento: string | null;
    tipo: string;
  };
}

export function FormConfiguracoes({ usuario }: FormConfiguracoesProps) {
  // Estados para formulário de perfil
  const [nome, setNome] = useState(usuario.nome);
  const [bloco, setBloco] = useState(usuario.bloco || '');
  const [apartamento, setApartamento] = useState(usuario.apartamento || '');
  const [erroPerfil, setErroPerfil] = useState<string | null>(null);
  const [sucessoPerfil, setSucessoPerfil] = useState(false);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false);

  // Estados para formulário de senha
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [sucessoSenha, setSucessoSenha] = useState(false);
  const [carregandoSenha, setCarregandoSenha] = useState(false);

  async function handleSalvarPerfil(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErroPerfil(null);
    setSucessoPerfil(false);
    setCarregandoPerfil(true);

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('bloco', bloco);
    formData.append('apartamento', apartamento);

    try {
      await atualizarPerfil(formData);
      setSucessoPerfil(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErroPerfil(err.message);
      } else {
        setErroPerfil('Erro ao atualizar perfil.');
      }
    } finally {
      setCarregandoPerfil(false);
    }
  }

  async function handleAlterarSenha(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErroSenha(null);
    setSucessoSenha(false);
    setCarregandoSenha(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await alterarSenha(formData);
      setSucessoSenha(true);
      form.reset();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErroSenha(err.message);
      } else {
        setErroSenha('Erro ao alterar senha.');
      }
    } finally {
      setCarregandoSenha(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
      {/* Dados do Perfil */}
      <Card className="p-6 bg-slate-900/90 border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>👤</span> Dados do Perfil
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                usuario.tipo === 'SINDICO'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : usuario.tipo === 'PORTARIA'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              }`}
            >
              {usuario.tipo}
            </span>
          </div>

          {erroPerfil && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs mb-4 flex items-center gap-2">
              <span>⚠️</span>
              <span>{erroPerfil}</span>
            </div>
          )}

          {sucessoPerfil && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs mb-4 flex items-center gap-2">
              <span>✅</span>
              <span>Dados atualizados com sucesso!</span>
            </div>
          )}

          <form id="form-perfil" onSubmit={handleSalvarPerfil} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nome Completo
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg bg-slate-800/80 text-white border border-slate-700 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                E-mail (Identificador único de acesso)
              </label>
              <input
                type="email"
                value={usuario.email}
                disabled
                className="w-full p-2.5 rounded-lg bg-slate-800/40 text-slate-400 border border-slate-800 text-sm cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Bloco
                </label>
                <input
                  type="text"
                  placeholder="Ex: Bloco A"
                  value={bloco}
                  onChange={(e) => setBloco(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-800/80 text-white border border-slate-700 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Apartamento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Apt 102"
                  value={apartamento}
                  onChange={(e) => setApartamento(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-800/80 text-white border border-slate-700 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <Button type="submit" disabled={carregandoPerfil} size="md" className="mt-2 self-start">
              {carregandoPerfil ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </div>
      </Card>

      {/* Alteração de Senha */}
      <Card className="p-6 bg-slate-900/90 border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>🔒</span> Segurança e Senha
            </h2>
            <span className="text-[11px] text-slate-400">Proteção da Conta</span>
          </div>

          {erroSenha && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs mb-4 flex items-center gap-2">
              <span>⚠️</span>
              <span>{erroSenha}</span>
            </div>
          )}

          {sucessoSenha && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs mb-4 flex items-center gap-2">
              <span>✅</span>
              <span>Senha alterada com sucesso!</span>
            </div>
          )}

          <form onSubmit={handleAlterarSenha} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Senha Atual
              </label>
              <input
                type="password"
                name="senhaAtual"
                placeholder="••••••••"
                required
                className="w-full p-2.5 rounded-lg bg-slate-800/80 text-white border border-slate-700 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nova Senha
              </label>
              <input
                type="password"
                name="novaSenha"
                placeholder="••••••••"
                required
                className="w-full p-2.5 rounded-lg bg-slate-800/80 text-white border border-slate-700 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                name="confirmarSenha"
                placeholder="••••••••"
                required
                className="w-full p-2.5 rounded-lg bg-slate-800/80 text-white border border-slate-700 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <Button type="submit" disabled={carregandoSenha} size="md" className="mt-2 self-start">
              {carregandoSenha ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
