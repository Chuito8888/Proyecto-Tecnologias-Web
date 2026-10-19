//"Estado de la red": reemplaza las 4 tarjetas del Canva por un anillo con el % de sensores funcionando bien
//Debajo van los conteos por estado, lo más grave primero

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function NetworkHealth({ counts, totalSensors, totalCenters, loading }) {
  const estados = [
    { label: 'Fuera de rango', valor: counts.outOfRange, color: '#e9b949', texto: 'text-[#855c00]' },
    { label: 'Sin transmitir', valor: counts.noData, color: '#e57373', texto: 'text-[#a32d2d]' },
    { label: 'Buen funcionamiento', valor: counts.ok, color: '#54867d', texto: 'text-[#124045]' },
  ];
  const porcentaje = totalSensors ? Math.round((counts.ok / totalSensors) * 100) : 0;

  return (
    <section className="flex flex-col rounded-2xl bg-[#124045] p-5 text-white shadow-lg">
      <h2 className="text-lg font-bold text-[#c8d1d9]">Estado de la red</h2>

      {/* Anillo con el porcentaje al centro */}
      <div className="relative mx-auto my-2 h-48 w-48">
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
          <span className="text-5xl font-extrabold">{loading ? '–' : `${porcentaje}%`}</span>
          <span className="text-sm text-[#86b4a7]">operativos</span>
        </div>
      </div>

      {/* Conteos por estado */}
      <ul className="mt-2 flex flex-col gap-2">
        {estados.map((e) => (
          <li key={e.label} className="flex items-center justify-between rounded-lg bg-[#eceeed] px-3 py-2">
            <span className="flex items-center gap-2 font-semibold text-black">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: e.color }} />
              {e.label}
            </span>
            <span className={`text-xl font-extrabold ${e.texto}`}>{loading ? '–' : e.valor}</span>
          </li>
        ))}
      </ul>

      <p className="mt-auto pt-4 text-center text-sm text-[#86b4a7]">
        {totalCenters} centros de cultivo · {totalSensors} sensores
      </p>
    </section>
  );
}
