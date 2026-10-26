//"Últimas intervenciones" del Dashboard, como línea de tiempo
//Las abiertas van primero porque son el trabajo pendiente, después las cerradas más recientes

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, timeAgo, ESTADOS_SENSOR, MENSAJE_SIN_DATOS } from '../utils/format';

//La API solo maneja estos dos estados (el "En curso" del Canva no existe en la API)
//La abierta usa el mismo rosado de "Sin transmitir" (paleta compartida en utils/format)
const ESTADOS = {
  open: { label: 'Abierta', punto: 'bg-danger', chip: ESTADOS_SENSOR.no_data.chip },
  closed: { label: 'Cerrada', punto: 'bg-brand', chip: 'bg-brand-light/50 text-brand-dark' },
};

export function RecentInterventions({ interventions, loading, sinDatos = false }) {
  return (
    <section className="card flex flex-col max-lg:p-4" aria-busy={loading}>
      <div className="mb-4 max-lg:mb-3">
        <h2 className="card-title">Últimas intervenciones</h2>
        <p className="text-sm text-gray-600">Las abiertas aparecen primero</p>
      </div>

      {/* Cargando: puntos y líneas grises que laten */}
      {loading && (
        <ul className="ml-2 flex flex-col gap-4 border-l-2 border-brand-gray pl-5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="animate-pulse space-y-2">
              <div className="h-4 w-24 rounded-full bg-brand-gray" />
              <div className="h-4 w-40 rounded bg-brand-gray" />
              <div className="h-3 w-full rounded bg-brand-gray/70" />
            </li>
          ))}
        </ul>
      )}

      {/* Estado vacío */}
      {!loading && interventions.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-brand-light bg-white/60 p-6 text-center">
          {sinDatos ? (
            <>
              <p className="font-semibold text-gray-700">{MENSAJE_SIN_DATOS}</p>
              <p className="text-sm text-gray-600">Las intervenciones aparecerán al reconectar.</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-brand-dark">Sin intervenciones</p>
              <p className="text-sm text-gray-600">Todavía no hay intervenciones registradas.</p>
            </>
          )}
        </div>
      )}

      {/* Línea de tiempo: la raya vertical une los puntos de cada intervención */}
      {!loading && interventions.length > 0 && (
        <ol className="relative ml-2 flex flex-col gap-4 border-l-2 border-brand-gray pl-5 max-lg:gap-3">
          {interventions.map((i) => {
            const estado = ESTADOS[i.status] ?? ESTADOS.closed;
            return (
              <li key={i.id} className="relative">
                <span className={`absolute -left-[1.72rem] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-surface ${estado.punto}`} aria-hidden="true" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${estado.chip}`}>{estado.label}</span>
                  <time className="text-xs text-gray-500" dateTime={i.createdAt} title={formatDate(i.createdAt)}>
                    {timeAgo(i.createdAt)}
                  </time>
                </div>
                <p className="mt-1 font-semibold text-brand-dark">{i.target}</p>
                <p className="line-clamp-2 text-sm text-gray-700" title={i.reason}>{i.reason}</p>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-auto flex justify-end pt-4 max-lg:pt-3">
        <Link to="/intervenciones" className="btn btn-secondary btn-sm">
          Ver todas
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.64l-3.22-3.22a.75.75 0 1 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
