'use client';

import { useState } from 'react';
import { criarReserva } from './actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Gera a lista de horários de 1 em 1 hora, das 06:00 às 22:00
const HORARIOS_DISPONIVEIS = Array.from({ length: 16 }, (_, i) => {
  const horaInicio = (i + 6).toString().padStart(2, '0');
  const horaFim = (i + 7).toString().padStart(2, '0');
  return `${horaInicio}:00 - ${horaFim}:00`;
});

export function FormReserva({ espacos, todasReservas }: { espacos: any[]; todasReservas: any[] }) {
  const [espacoId, setEspacoId] = useState('');
  const [data, setData] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // Verifica se o slot de 1 hora está ocupado para a data/espaço selecionados
  const isHorarioOcupado = (horario: string) => {
    if (!espacoId || !data) return false;
    const dataIso = new Date(`${data}T00:00:00.000Z`).toISOString();

    return todasReservas.some(
      (r) =>
        r.espacoId === espacoId &&
        new Date(r.data).toISOString() === dataIso &&
        r.horario === horario
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!horarioSelecionado) {
      setErro('Selecione um horário disponível.');
      return;
    }

    setLoading(true);
    setErro('');

    const formData = new FormData();
    formData.append('espacoId', espacoId);
    formData.append('data', data);
    formData.append('horario', horarioSelecionado);

    try {
      await criarReserva(formData);
      setHorarioSelecionado('');
      setData('');
    } catch (err: any) {
      setErro(err.message || 'Erro ao realizar reserva.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {erro && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded">
            {erro}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300">Espaço</label>
          <select
            required
            value={espacoId}
            onChange={(e) => {
              setEspacoId(e.target.value);
              setHorarioSelecionado('');
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Selecione um espaço...</option>
            {espacos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300">Data</label>
          <input
            type="date"
            required
            value={data}
            onChange={(e) => {
              setData(e.target.value);
              setHorarioSelecionado('');
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Grade de Horários de 1h (06:00 até 22:00) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300">
            Selecione o Horário (1 hora)
          </label>
          
          {!data || !espacoId ? (
            <p className="text-xs text-slate-500 italic">
              Selecione o espaço e a data para ver a disponibilidade.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {HORARIOS_DISPONIVEIS.map((horario) => {
                const ocupado = isHorarioOcupado(horario);
                const selecionado = horarioSelecionado === horario;

                return (
                  <button
                    type="button"
                    key={horario}
                    disabled={ocupado}
                    onClick={() => setHorarioSelecionado(horario)}
                    className={`p-2 text-xs font-medium rounded-lg border text-center transition-all ${
                      ocupado
                        ? 'bg-slate-950 text-slate-600 border-slate-800 line-through cursor-not-allowed opacity-50'
                        : selecionado
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500 font-bold'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {horario}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Button type="submit" className="w-full mt-2" disabled={loading || !horarioSelecionado}>
          {loading ? 'Reservando...' : 'Confirmar Reserva'}
        </Button>
      </form>
    </Card>
  );
}