//Gráfico de oxígeno del Dashboard (en el Canva: "Sensor 001 - Grafica")
//Parte mostrando el sensor más crítico y se puede cambiar con el selector
//La franja verde es el rango seguro del sensor (oxygen_min a oxygen_max)

import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea, ReferenceLine,
} from 'recharts';
import { formatOxygen, ESTADOS_SENSOR, MENSAJE_SIN_DATOS } from '../utils/format';

//Colores del gráfico: línea en brand-dark, franja segura en un verde suave y mínimo con el rosado de alerta
const COLOR_LINEA = '#124045';
const COLOR_RANGO = '#9cc4b8';
const COLOR_MINIMO = ESTADOS_SENSOR.no_data.color;
const COLOR_MAXIMO = ESTADOS_SENSOR.ok.color;

//Leyenda propia, más legible que la de Recharts
function Leyenda({ tieneRango }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-gray-700">
      <li className="flex items-center gap-1.5">
        <span className="h-0.5 w-5 rounded" style={{ backgroundColor: COLOR_LINEA }} aria-hidden="true" />
        Oxígeno (mg/L)
      </li>
      {tieneRango && (
        <>
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: COLOR_RANGO, opacity: 0.6 }} aria-hidden="true" />
            Rango seguro
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-5 border-t-2 border-dashed" style={{ borderColor: COLOR_MINIMO }} aria-hidden="true" />
            Mínimo
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-5 border-t-2 border-dashed" style={{ borderColor: COLOR_MAXIMO }} aria-hidden="true" />
            Máximo
          </li>
        </>
      )}
    </ul>
  );
}

export function OxygenChart({ sensors, selected, onSelect, points, loading, sinDatos = false }) {
  const min = selected?.min;
  const max = selected?.max;
  const tieneRango = min !== null && min !== undefined && max !== null && max !== undefined;

  return (
    <section className="card flex h-full flex-col max-lg:p-4" aria-busy={loading}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="card-title truncate">
            Oxígeno{selected ? ` · ${selected.sensorName}` : ''}
          </h2>
          <p className="text-sm text-gray-600">
            Últimas 24 h{selected && tieneRango ? ` · rango seguro ${min}–${max} mg/L` : ''}
          </p>
        </div>
        {sensors.length > 0 && (
          <div className="flex min-w-0 items-center gap-2">
            <label htmlFor="selector-sensor" className="field-label shrink-0">Sensor</label>
            <select
              id="selector-sensor"
              value={selected?.sensorId ?? ''}
              onChange={(e) => onSelect(Number(e.target.value))}
              className="input mt-0 w-auto max-w-full cursor-pointer font-semibold"
            >
              {sensors.map((s) => (
                <option key={s.sensorId} value={s.sensorId}>
                  {s.sensorName} · {s.siteName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Recuadro interior del gráfico, como en el Canva (en el proyector, unos 260 px de alto) */}
      <div className="flex min-h-64 flex-1 max-lg:min-h-0 max-lg:h-[260px] max-lg:flex-none flex-col rounded-xl border border-brand-gray bg-white p-3">
        {loading && (
          <div className="flex flex-1 animate-pulse flex-col justify-end gap-2 p-2" aria-hidden="true">
            <div className="w-full flex-1 rounded-lg bg-brand-gray/50" />
            <div className="h-3 w-full rounded bg-brand-gray/70" />
          </div>
        )}

        {!loading && points.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            {sinDatos && !selected ? (
              <>
                <p className="font-semibold text-gray-700">{MENSAJE_SIN_DATOS}</p>
                <p className="text-sm text-gray-600">El gráfico aparecerá al recuperar la conexión.</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-brand-dark">Sin mediciones</p>
                <p className="text-sm text-gray-600">
                  {selected ? 'Este sensor no tiene mediciones en las últimas 24 h.' : 'No hay sensores para mostrar.'}
                </p>
              </>
            )}
          </div>
        )}

        {!loading && points.length > 0 && (
          <>
            <div className="min-h-56 flex-1 max-lg:min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#e3e8eb" vertical={false} />
                  <XAxis dataKey="hora" tick={{ fontSize: 12, fill: '#4b5563' }} minTickGap={32} />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                    width={44}
                    domain={[
                      (dataMin) => Math.floor(Math.min(dataMin, tieneRango ? min : dataMin) - 1),
                      (dataMax) => Math.ceil(Math.max(dataMax, tieneRango ? max : dataMax) + 1),
                    ]}
                  />
                  {tieneRango && <ReferenceArea y1={min} y2={max} fill={COLOR_RANGO} fillOpacity={0.3} />}
                  {tieneRango && <ReferenceLine y={min} stroke={COLOR_MINIMO} strokeDasharray="5 4" />}
                  {tieneRango && <ReferenceLine y={max} stroke={COLOR_MAXIMO} strokeDasharray="5 4" />}
                  <Tooltip
                    formatter={(valor) => [formatOxygen(valor), 'Oxígeno']}
                    labelFormatter={(hora, payload) => {
                      const punto = payload?.[0]?.payload;
                      if (!punto) return hora;
                      return punto.temperatura !== undefined ? `${punto.fecha} · ${punto.temperatura} °C` : punto.fecha;
                    }}
                    contentStyle={{ borderRadius: 8, borderColor: '#86b4a7', fontSize: 13 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke={COLOR_LINEA}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 border-t border-surface pt-2">
              <Leyenda tieneRango={tieneRango} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
