'use client';

import { useState } from 'react';
import { criarReserva } from './actions';
import { Button } from '@/components/ui/button';

interface Espaco {
  id: string;
  nome: string;
  descricao?: string | null;
  capacidade?: number | null;
}

interface FormReservaProps {
  espacos: Espaco[];
}

const HORARIOS_INICIO = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

const DURACOES = [
  { label: '30 minutos', minutos: 30 },
  { label: '1 hora (60 min)', minutos: 60 },
  { label: '1 hora e 30 min (90 min)', minutos: 90 },
  { label: '2 horas (120 min)', minutos: 120 },
  { label: '3 horas (180 min)', minutos: 180 },
  { label: '4 horas (240 min)', minutos: 240 },
];

export default function FormReserva({ espacos }: FormReservaProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Data mínima: hoje em formato YYYY-MM-DD
  const hojeStr = new Date().toISOString().split('T')[0];

  const [dataSelecionada, setDataSelecionada] = useState(hojeStr);
  const [horarioInicio, setHorarioInicio] = useState('10:00');
  const [duracaoMinutos, setDuracaoMinutos] = useState(60);

  // Calcula o horário de término previsto para exibir ao usuário
  function calcularFimFormatado(): string {
    if (!horarioInicio) return '--:--';
    const [h, m] = horarioInicio.split(':').map(Number);
    const totalMin = h * 60 + m + duracaoMinutos;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);
    setCarregando(true);

    const form = e.currentTarget;
    const formDataRaw = new FormData(form);

    const espacoId = formDataRaw.get('espacoId') as string;
    if (!espacoId || !dataSelecionada || !horarioInicio) {
      setErro('Por favor, selecione todos os campos do agendamento.');
      setCarregando(false);
      return;
    }

    // Monta os objetos de data e hora
    const [ano, mes, dia] = dataSelecionada.split('-').map(Number);
    const [hora, min] = horarioInicio.split(':').map(Number);

    const dataInicio = new Date(ano, mes - 1, dia, hora, min, 0);
    const dataFim = new Date(dataInicio.getTime() + duracaoMinutos * 60 * 1000);

    const agora = new Date();
    if (dataInicio < agora) {
      setErro('Não é permitido agendar horários que já passaram. Escolha uma data e horário futuro.');
      setCarregando(false);
      return;
    }

    const payload = new FormData();
    payload.append('espacoId', espacoId);
    payload.append('dataInicio', dataInicio.toISOString());
    payload.append('dataFim', dataFim.toISOString());

    try {
      await criarReserva(payload);
      setSucesso(true);
      form.reset();
      setDataSelecionada(hojeStr);
      setHorarioInicio('10:00');
      setDuracaoMinutos(60);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErro(err.message);
      } else {
        setErro('Erro ao registrar a reserva. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 bg-slate-900/90 p-6 rounded-xl border border-slate-800 mb-8 max-w-3xl shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-white">Solicitar Novo Agendamento</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Horários padronizados em intervalos de 30 ou 60 minutos
          </p>
        </div>
        <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-full">
          Disponibilidade Imediata
        </span>
      </div>

      {erro && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <span>{erro}</span>
        </div>
      )}

      {sucesso && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <span className="text-base">✅</span>
          <span>Reserva agendada e confirmada com sucesso!</span>
        </div>
      )}

      {/* Seleção do Espaço */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Espaço Comum *
        </label>
        <select
          name="espacoId"
          required
          defaultValue=""
          className="w-full p-3 rounded-lg bg-slate-800/80 text-white border border-slate-700 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
        >
          <option value="" disabled>
            -- Selecione a área desejada --
          </option>
          {espacos.map((espaco) => (
            <option key={espaco.id} value={espaco.id}>
              {espaco.nome} {espaco.capacidade ? `(Capacidade: até ${espaco.capacidade} pessoas)` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Grade de Data, Horário e Duração */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Data */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Data da Reserva *
          </label>
          <input
            type="date"
            min={hojeStr}
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-slate-800/80 text-white border border-slate-700 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
        </div>

        {/* Horário de Início */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Horário de Início *
          </label>
          <select
            value={horarioInicio}
            onChange={(e) => setHorarioInicio(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-slate-800/80 text-white border border-slate-700 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          >
            {HORARIOS_INICIO.map((hora) => (
              <option key={hora} value={hora}>
                {hora}
              </option>
            ))}
          </select>
        </div>

        {/* Duração */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Duração da Reserva *
          </label>
          <select
            value={duracaoMinutos}
            onChange={(e) => setDuracaoMinutos(Number(e.target.value))}
            required
            className="w-full p-3 rounded-lg bg-slate-800/80 text-white border border-slate-700 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          >
            {DURACOES.map((d) => (
              <option key={d.minutos} value={d.minutos}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumo do Período */}
      <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="text-slate-400">
          Período do Agendamento:{' '}
          <strong className="text-white">
            {dataSelecionada ? new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR') : '--/--/----'}
          </strong>{' '}
          das <strong className="text-cyan-400">{horarioInicio}</strong> até às{' '}
          <strong className="text-cyan-400">{calcularFimFormatado()}</strong>
        </span>
        <span className="text-slate-500">Intervalo de 30/60 min padronizado</span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-slate-400">
          Cancelamentos podem ser efetuados a qualquer momento pelo titular da reserva.
        </p>
        <Button type="submit" disabled={carregando} size="md" className="min-w-[160px]">
          {carregando ? 'Validando...' : 'Confirmar Agendamento'}
        </Button>
      </div>
    </form>
  );
}