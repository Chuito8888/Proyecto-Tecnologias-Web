//Perfil del centro seleccionado: cada jaula y pontón se dibuja como una columna de agua
//y sus sensores aparecen a la profundidad real a la que están instalados, con el color de su estado
//Así se ve de un vistazo si el problema está en la superficie o en el fondo
//Al tocar un sensor se muestra su gráfico

import React from 'react';
import { formatOxygen } from '../utils/format';

const ESTILO_ESTADO = {
  out_of_range: { clase: 'bg-[#f7d77a] text-[#5a4100]', label: 'Fuera de rango' },
  no_data: { clase: 'bg-[#f4a3a3] text-[#6e1c1c]', label: 'Sin transmitir' },
  ok: { clase: 'bg-[#eceeed] text-[#124045]', label: 'Buen funcionamiento' },
};

//Posición vertical (en %) de una profundidad dentro de la columna, dejando aire arriba y abajo
function alturaPorcentaje(profundidad, maxima) {
  return (profundidad / maxima) * 84 + 8;
}

//"Jaula 101 10m" -> "Jaula 101"
function nombreEstructura(sensorName) {
  return sensorName.replace(/\s+[\d.]+\s*m$/i, '');
}

export function SiteProfile({ center, selectedSensorId, onSelectSensor }) {
  if (!center) {
    return (
      <section className="rounded-2xl bg-[#eceeed] p-5 shadow-lg">
        <p className="text-gray-500">Cargando centro...</p>
      </section>
    );
  }

  const maxima = Math.max(15, ...center.sensors.map((s) => s.depth ?? 0));
  const marcas = [0, 5, 10, 15].filter((m) => m <= maxima);

  //Agrupa los sensores por estructura (jaula o pontón)
  const estructuras = {};
  center.sensors.forEach((s) => {
    const nombre = nombreEstructura(s.sensorName);
    (estructuras[nombre] ??= []).push(s);
  });

  return (
    <section className="h-full rounded-2xl bg-[#eceeed] p-5 shadow-lg">
      <p className="text-sm font-semibold uppercase tracking-wider text-[#54867d]">Perfil del centro</p>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-2xl font-bold">{center.name}</h2>
        <span className="text-gray-600">{center.area}</span>
        {!center.active && (
          <span className="rounded-full bg-gray-300 px-2 py-0.5 text-xs font-semibold text-gray-700">Inactivo</span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {/* Eje de profundidad */}
        <div className="relative mt-7 h-72 w-10 shrink-0 text-right text-xs font-semibold text-gray-500">
          {marcas.map((m) => (
            <span key={m} className="absolute right-1 -translate-y-1/2" style={{ top: `${alturaPorcentaje(m, maxima)}%` }}>
              {m} m
            </span>
          ))}
        </div>

        {/* Una columna de agua por estructura */}
        {Object.entries(estructuras).map(([nombre, sensores]) => (
          <div key={nombre} className="min-w-0 flex-1">
            <p className="mb-2 truncate text-center font-semibold">{nombre}</p>
            <div className="relative h-72 overflow-hidden rounded-b-2xl rounded-t-md border-t-4 border-[#86b4a7] bg-linear-to-b from-[#9cc4b8] via-[#3f7d74] to-[#0d2a2e]">
              {/* Líneas de referencia de profundidad */}
              {marcas.slice(1).map((m) => (
                <div
                  key={m}
                  className="absolute inset-x-0 border-t border-dashed border-white/25"
                  style={{ top: `${alturaPorcentaje(m, maxima)}%` }}
                />
              ))}

              {sensores.map((s) => {
                const estilo = ESTILO_ESTADO[s.status] ?? ESTILO_ESTADO.ok;
                const elegido = s.sensorId === selectedSensorId;
                return (
                  <button
                    key={s.sensorId}
                    type="button"
                    onClick={() => onSelectSensor(s.sensorId)}
                    title={`${s.sensorName} · ${estilo.label}`}
                    className={`absolute left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-sm font-bold shadow-lg transition-transform hover:scale-110 ${estilo.clase} ${elegido ? 'scale-110 ring-4 ring-white' : ''}`}
                    style={{ top: `${alturaPorcentaje(s.depth ?? 0, maxima)}%` }}
                  >
                    {s.status === 'out_of_range' && <span className="h-2 w-2 animate-pulse rounded-full bg-[#a32d2d]" />}
                    {s.status === 'no_data' ? 'Sin datos' : formatOxygen(s.lastValue)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
