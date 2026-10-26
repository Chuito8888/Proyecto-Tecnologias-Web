//"Estado de la red": reemplaza las 4 tarjetas del Canva por un anillo con el % de sensores funcionando bien
//Debajo van los conteos por estado, lo más grave primero

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ESTADOS_SENSOR, MENSAJE_SIN_DATOS } from '../utils/format';

export function NetworkHealth({ counts, totalSensors, totalCenters, loading, sinDatos = false }) {
  const estados = [
    { ...ESTADOS_SENSOR.out_of_range, valor: counts.outOfRange },
    { ...ESTADOS_SENSOR.no_data, valor: counts.noData },
    { ...ESTADOS_SENSOR.ok, valor: counts.ok },
  ];
  const porcentaje = totalSensors ? Math.round((counts.ok / totalSensors) * 100) : 0;
  const sinSensores = !loading && totalSensors === 0;

  //Pie de la tarjeta según el estado de la carga
  let pie = `${totalCenters} ${totalCenters === 1 ? 'centro' : 'centros'} de cultivo · ${totalSensors} ${totalSensors === 1 ? 'sensor' : 'sensores'}`;
  if (loading) pie = 'Cargando resumen…';
  else if (sinDatos) pie = MENSAJE_SIN_DATOS;

  //En pantallas medianas (proyector 800 px) la tarjeta pasa a ser horizontal:
  //anillo chico a la izquierda y los conteos como mosaicos a su lado
  return (
    <section
      className="card flex flex-col bg-brand-dark text-white md:max-lg:grid md:max-lg:grid-cols-[auto_1fr] md:max-lg:gap-x-6 md:max-lg:p-4"
      aria-busy={loading}
    >
      <h2 className="card-title text-brand-gray md:max-lg:col-start-2">Estado de la red</h2>
      <p className="text-sm text-brand-light md:max-lg:col-start-2">Sensores según su última medición</p>

      {/* Anillo con el porcentaje al centro (mientras carga se muestra un anillo gris que late) */}
      <div className="relative mx-auto my-4 h-44 w-44 md:max-lg:col-start-1 md:max-lg:row-span-4 md:max-lg:row-start-1 md:max-lg:my-0 md:max-lg:h-32 md:max-lg:w-32 md:max-lg:self-center">
        {loading && <div className="h-full w-full animate-pulse rounded-full border-[14px] border-white/15" />}
        {sinSensores && <div className="h-full w-full rounded-full border-[14px] border-white/15" />}
        {!loading && totalSensors > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={estados}
                dataKey="valor"
                innerRadius="72%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={3}
                stroke="none"
                isAnimationActive={false}
              >
                {estados.map((e) => <Cell key={e.label} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {loading ? (
            <span className="h-10 w-20 animate-pulse rounded-lg bg-white/15" />
          ) : (
            <span className="text-5xl font-extrabold md:max-lg:text-3xl">{sinSensores ? '–' : `${porcentaje}%`}</span>
          )}
          <span className="mt-1 text-sm text-brand-light md:max-lg:mt-0 md:max-lg:text-xs">{sinDatos ? 'sin datos' : 'operativos'}</span>
        </div>
      </div>

      {/* Conteos por estado */}
      <ul className="flex flex-col gap-2 md:max-lg:col-start-2 md:max-lg:mt-3 md:max-lg:flex-row">
        {estados.map((e) => (
          <li key={e.label} className="flex h-11 items-center justify-between rounded-lg bg-surface px-3 md:max-lg:h-auto md:max-lg:flex-1 md:max-lg:flex-col-reverse md:max-lg:items-start md:max-lg:justify-end md:max-lg:py-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 md:max-lg:text-xs">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: e.color }} aria-hidden="true" />
              {e.label}
            </span>
            {loading ? (
              <span className="h-5 w-8 animate-pulse rounded bg-brand-gray" />
            ) : sinDatos ? (
              <span className="text-xl font-extrabold text-gray-400">–<span className="sr-only"> sin datos</span></span>
            ) : (
              <span className={`text-xl font-extrabold tabular-nums md:max-lg:text-2xl ${e.texto}`}>{e.valor}</span>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-auto pt-4 text-center text-sm text-brand-light md:max-lg:col-start-2 md:max-lg:pt-2 md:max-lg:text-left">
        {pie}
      </p>
    </section>
  );
}
