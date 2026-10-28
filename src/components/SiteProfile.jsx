//Perfil del centro seleccionado: cada jaula y pontón se dibuja como una columna de agua
//y sus sensores aparecen a la profundidad real a la que están instalados, con el color de su estado
//Así se ve de un vistazo si el problema está en la superficie o en el fondo
//Al tocar un sensor se muestra su gráfico

//NOTA: por ahora esta sección está comentada en el dashboard, por lo que aunque no se use el componente queda ahí para implementarse

import React from 'react';
import { formatOxygen, ESTADOS_SENSOR, MENSAJE_SIN_DATOS } from '../utils/format';

//Posición vertical (en %) de una profundidad dentro de la columna, dejando aire arriba y abajo
function alturaPorcentaje(profundidad, maxima) {
  return (profundidad / maxima) * 84 + 8;
}

//"Jaula 101 10m" -> "Jaula 101"
function nombreEstructura(sensorName) {
  return sensorName.replace(/\s+[\d.]+\s*m$/i, '');
}

export function SiteProfile({ center, selectedSensorId, onSelectSensor, loading = false, sinDatos = false }) {
  //Sin centro: si está cargando se muestra un esqueleto; si la carga falló, un aviso neutro; si no, cómo elegir uno
  if (!center) {
    return (
      <section className="card h-full" aria-busy={loading}>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Perfil del centro</p>
        {loading ? (
          <div className="animate-pulse" aria-hidden="true">
            <div className="mt-2 h-6 w-40 rounded bg-brand-gray" />
            <div className="mt-4 flex gap-3">
              {[0, 1, 2].map((i) => <div key={i} className="h-72 flex-1 rounded-2xl bg-brand-gray/70" />)}
            </div>
          </div>
        ) : sinDatos ? (
          <div className="mt-4 flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-brand-gray bg-white/60 p-6 text-center">
            <p className="font-semibold text-gray-700">{MENSAJE_SIN_DATOS}</p>
            <p className="text-sm text-gray-600">El perfil del centro aparecerá al recuperar la conexión.</p>
          </div>
        ) : (
          <div className="mt-4 flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-brand-light bg-white/60 p-6 text-center">
            <p className="font-semibold text-brand-dark">Sin centro seleccionado</p>
            <p className="text-sm text-gray-600">Elige un centro en el mapa para ver sus sensores por profundidad.</p>
          </div>
        )}
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

  //En pantallas angostas (proyector) las columnas de agua son más bajas
  return (
    <section className="card h-full max-lg:p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand">Perfil del centro</p>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="card-title">{center.name}</h2>
        <span className="text-sm text-gray-600">{center.area}</span>
        {!center.active && (
          <span className="rounded-full bg-gray-300 px-2 py-0.5 text-xs font-semibold text-gray-700">Inactivo</span>
        )}
      </div>

      {center.sensors.length === 0 ? (
        <div className="mt-4 flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-brand-light bg-white/60 p-6 text-center">
          <p className="font-semibold text-brand-dark">Este centro no tiene sensores</p>
          <p className="text-sm text-gray-600">Cuando se instalen aparecerán aquí según su profundidad.</p>
        </div>
      ) : (
        <>
          <div className="mt-4 flex gap-2 max-lg:mt-3">
            {/* Eje de profundidad */}
            <div className="relative mt-7 h-72 w-10 shrink-0 max-lg:h-60 text-right text-xs font-semibold text-gray-500" aria-hidden="true">
              {marcas.map((m) => (
                <span key={m} className="absolute right-1 -translate-y-1/2" style={{ top: `${alturaPorcentaje(m, maxima)}%` }}>
                  {m} m
                </span>
              ))}
            </div>

            {/* Una columna de agua por estructura */}
            {Object.entries(estructuras).map(([nombre, sensores]) => (
              <div key={nombre} className="min-w-0 flex-1">
                <p className="mb-2 truncate text-center text-sm font-semibold text-brand-dark" title={nombre}>{nombre}</p>
                <div className="relative h-72 overflow-hidden max-lg:h-60 rounded-b-2xl rounded-t-md border-t-4 border-brand-light bg-linear-to-b from-[#9cc4b8] via-[#3f7d74] to-[#0d2a2e]">
                  {/* Líneas de referencia de profundidad */}
                  {marcas.slice(1).map((m) => (
                    <div
                      key={m}
                      className="absolute inset-x-0 border-t border-dashed border-white/25"
                      style={{ top: `${alturaPorcentaje(m, maxima)}%` }}
                    />
                  ))}

                  {sensores.map((s) => {
                    const estilo = ESTADOS_SENSOR[s.status] ?? ESTADOS_SENSOR.ok;
                    const elegido = s.sensorId === selectedSensorId;
                    return (
                      <button
                        key={s.sensorId}
                        type="button"
                        onClick={() => onSelectSensor(s.sensorId)}
                        title={`${s.sensorName} · ${estilo.label}`}
                        aria-label={`${s.sensorName}, ${estilo.label}${s.status === 'no_data' ? '' : `, ${formatOxygen(s.lastValue)}`}`}
                        aria-pressed={elegido}
                        className={`absolute left-1/2 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold shadow-lg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white ${estilo.chip} ${elegido ? 'scale-110 ring-4 ring-white' : ''}`}
                        style={{ top: `${alturaPorcentaje(s.depth ?? 0, maxima)}%` }}
                      >
                        {s.status === 'out_of_range' && <span className="h-2 w-2 animate-pulse rounded-full bg-danger" />}
                        {s.status === 'no_data' ? 'Sin datos' : formatOxygen(s.lastValue)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Leyenda de colores de los sensores */}
          <ul className="mt-4 flex flex-wrap justify-center max-lg:mt-3 gap-x-4 gap-y-1 text-xs font-semibold text-gray-700">
            {Object.values(ESTADOS_SENSOR).map((e) => (
              <li key={e.label} className="flex items-center gap-1.5">
                <span className={`h-3 w-3 rounded-full ring-1 ring-brand-light ${e.chip}`} aria-hidden="true" />
                {e.label}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-center text-xs text-gray-500">Selecciona un sensor para ver su gráfico</p>
        </>
      )}
    </section>
  );
}
