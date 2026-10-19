//Panel "Requieren atención" del Dashboard
//Muestra los sensores con problemas, primero los fuera de rango con el oxígeno más bajo
//y después los que no transmiten (el que lleva más tiempo sin datos primero)
//Desde aquí se puede abrir una intervención sin salir del Dashboard

import React, { useState } from 'react';
import { LineChart, Line, YAxis, ReferenceLine } from 'recharts';
import { formatOxygen, timeAgo } from '../utils/format';

//Colores de cada estado, los mismos del Canva
const ESTADOS = {
  out_of_range: { label: 'Fuera de rango', clase: 'bg-[#f7d77a] text-[#5a4100]', linea: '#c98a00' },
  no_data: { label: 'Sin transmitir', clase: 'bg-[#f4a3a3] text-[#6e1c1c]', linea: '#e57373' },
};

//Minigráfico de las últimas 24 h, con la línea punteada del mínimo permitido
function Sparkline({ puntos, minimo, color }) {
  if (!puntos || puntos.length < 2) {
    return <span className="text-sm text-gray-500">sin datos 24 h</span>;
  }
  return (
    <LineChart width={130} height={36} data={puntos} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
      <YAxis hide domain={[(min) => Math.min(min, minimo ?? min) - 0.5, 'dataMax']} />
      {minimo !== undefined && <ReferenceLine y={minimo} stroke="#e57373" strokeDasharray="3 3" />}
      <Line type="monotone" dataKey="valor" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
    </LineChart>
  );
}

//Motivo que se propone al abrir la intervención, el usuario lo puede editar
function defaultReason(alerta) {
  if (alerta.status === 'out_of_range') {
    return `Fuera de rango: ${formatOxygen(alerta.lastValue)} (rango ${alerta.min}–${alerta.max} mg/L)`;
  }
  return `Sin transmisión, último dato ${timeAgo(alerta.lastAt)}`;
}

export function AlertsTable({ alerts, trends, loading, onOpenIntervention, onShowChart }) {
  //Sensor al que se le está abriendo una intervención (solo uno a la vez)
  const [editando, setEditando] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const empezar = (alerta) => {
    setEditando(alerta.sensorId);
    setMotivo(defaultReason(alerta));
    setError(null);
  };

  const enviar = async (alerta) => {
    if (!motivo.trim()) {
      setError('Escribe un motivo.');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await onOpenIntervention(alerta, motivo.trim());
      setEditando(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="rounded-2xl bg-[#eceeed] p-5 shadow-lg">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Requieren atención</h2>
        {!loading && alerts.length > 0 && (
          <span className="rounded-full bg-[#124045] px-3 py-1 text-sm font-semibold text-white">
            {alerts.length} {alerts.length === 1 ? 'sensor' : 'sensores'}
          </span>
        )}
      </div>

      {loading && <p className="text-gray-500">Cargando sensores...</p>}

      {!loading && alerts.length === 0 && (
        <p className="rounded-lg bg-[#9cc4b8] p-3 font-semibold text-[#123c33]">
          Todos los sensores funcionan bien.
        </p>
      )}

      {!loading && alerts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="text-sm text-gray-600">
                <th className="py-2 pr-3 font-semibold">Sensor</th>
                <th className="py-2 pr-3 font-semibold">Estado</th>
                <th className="py-2 pr-3 font-semibold">Último dato</th>
                <th className="py-2 pr-3 font-semibold">Tendencia 24 h</th>
                <th className="py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alerta) => (
                <React.Fragment key={alerta.sensorId}>
                  <tr className="border-t border-[#c8d1d9]">
                    <td className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => onShowChart(alerta.sensorId)}
                        className="font-semibold text-[#124045] underline-offset-2 hover:underline"
                        title="Ver el detalle de este sensor"
                      >
                        {alerta.sensorName}
                      </button>
                      <p className="text-sm text-gray-600">{alerta.siteName}</p>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold ${ESTADOS[alerta.status].clase}`}>
                        {ESTADOS[alerta.status].label}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      {alerta.status === 'out_of_range' ? (
                        <span className="font-bold text-[#a32d2d]">{formatOxygen(alerta.lastValue)}</span>
                      ) : (
                        <span className="whitespace-nowrap">{timeAgo(alerta.lastAt)}</span>
                      )}
                    </td>
                    <td className="py-1 pr-3">
                      <Sparkline puntos={trends[alerta.sensorId]} minimo={alerta.min} color={ESTADOS[alerta.status].linea} />
                    </td>
                    <td className="py-2 text-right">
                      {alerta.hasOpenIntervention ? (
                        <span className="whitespace-nowrap rounded-full bg-[#9cc4b8] px-3 py-1 text-sm font-semibold text-[#123c33]">
                          Intervención abierta
                        </span>
                      ) : (
                        editando !== alerta.sensorId && (
                          <button
                            type="button"
                            onClick={() => empezar(alerta)}
                            className="whitespace-nowrap rounded bg-[#54867d] px-3 py-1.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#124045]"
                          >
                            Abrir intervención
                          </button>
                        )
                      )}
                    </td>
                  </tr>

                  {/* Formulario en línea para abrir la intervención de este sensor */}
                  {editando === alerta.sensorId && (
                    <tr>
                      <td colSpan={5} className="pb-3">
                        <div className="flex flex-col gap-2 rounded-lg bg-white p-3 sm:flex-row sm:items-center">
                          <input
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            className="flex-1 rounded bg-[#c8d1d9] px-3 py-2"
                            aria-label="Motivo de la intervención"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditando(null)}
                              className="rounded bg-[#86b4a7] px-3 py-2 text-sm font-semibold"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => enviar(alerta)}
                              disabled={enviando}
                              className="rounded bg-[#54867d] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              {enviando ? 'Enviando…' : 'Enviar'}
                            </button>
                          </div>
                        </div>
                        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
