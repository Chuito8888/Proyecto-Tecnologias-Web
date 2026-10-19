//Gráfico de oxígeno del Dashboard (en el Canva: "Sensor 001 - Grafica")
//Parte mostrando el sensor más crítico y se puede cambiar con el selector
//La franja verde es el rango seguro del sensor (oxygen_min a oxygen_max)

import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea, ReferenceLine,
} from 'recharts';
import { formatOxygen } from '../utils/format';

export function OxygenChart({ sensors, selected, onSelect, points, loading }) {
  const min = selected?.min;
  const max = selected?.max;
  const tieneRango = min !== null && min !== undefined && max !== null && max !== undefined;

  return (
    <section className="flex h-full flex-col rounded-2xl bg-[#eceeed] p-5 shadow-lg">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">
          Oxígeno{selected ? ` · ${selected.sensorName}` : ''}
        </h2>
        {sensors.length > 0 && (
          <select
            value={selected?.sensorId ?? ''}
            onChange={(e) => onSelect(Number(e.target.value))}
            className="max-w-full rounded bg-[#c8d1d9] px-2 py-1 text-sm font-semibold"
            aria-label="Elegir sensor"
          >
            {sensors.map((s) => (
              <option key={s.sensorId} value={s.sensorId}>
                {s.sensorName} · {s.siteName}
              </option>
            ))}
          </select>
        )}
      </div>

      {selected && (
        <p className="mb-2 text-sm text-gray-600">
          Últimas 24 h{tieneRango ? ` · rango seguro ${min}–${max} mg/L` : ''}
        </p>
      )}

      {/* Recuadro interior del gráfico, como en el Canva */}
      <div className="min-h-64 flex-1 rounded-lg border-4 border-[#c8d1d9] bg-white p-2">
        {loading && <p className="p-4 text-gray-500">Cargando mediciones...</p>}

        {!loading && points.length === 0 && (
          <p className="p-4 text-gray-500">
            {selected ? 'Este sensor no tiene mediciones en las últimas 24 h.' : 'No hay sensores para mostrar.'}
          </p>
        )}

        {!loading && points.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#e3e8eb" vertical={false} />
              <XAxis dataKey="hora" tick={{ fontSize: 12 }} minTickGap={32} />
              <YAxis
                tick={{ fontSize: 12 }}
                width={44}
                domain={[
                  (dataMin) => Math.floor(Math.min(dataMin, tieneRango ? min : dataMin) - 1),
                  (dataMax) => Math.ceil(Math.max(dataMax, tieneRango ? max : dataMax) + 1),
                ]}
              />
              {tieneRango && <ReferenceArea y1={min} y2={max} fill="#9cc4b8" fillOpacity={0.3} />}
              {tieneRango && <ReferenceLine y={min} stroke="#e57373" strokeDasharray="5 4" />}
              {tieneRango && <ReferenceLine y={max} stroke="#54867d" strokeDasharray="5 4" />}
              <Tooltip
                formatter={(valor) => [formatOxygen(valor), 'Oxígeno']}
                labelFormatter={(hora, payload) => {
                  const punto = payload?.[0]?.payload;
                  if (!punto) return hora;
                  return punto.temperatura !== undefined ? `${punto.fecha} · ${punto.temperatura} °C` : punto.fecha;
                }}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#4a6cf7"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
