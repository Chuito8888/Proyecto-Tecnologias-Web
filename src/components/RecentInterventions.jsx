//"Ultimas intervenciones" del Dashboard, como línea de tiempo
//Las abiertas van primero porque son el trabajo pendiente, después las cerradas más recientes

import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, timeAgo } from '../utils/format';

//La API solo maneja estos dos estados (el "En curso" del Canva no existe en la API)
const ESTADOS = {
  open: { label: 'Abierta', punto: 'bg-[#e57373]', chip: 'bg-[#f4a3a3] text-[#6e1c1c]' },
  closed: { label: 'Cerrada', punto: 'bg-[#54867d]', chip: 'bg-[#9cc4b8] text-[#123c33]' },
};

export function RecentInterventions({ interventions, loading }) {
  return (
    <section className="flex flex-col rounded-2xl bg-[#eceeed] p-5 shadow-lg">
      <h2 className="mb-4 text-xl font-bold">Últimas intervenciones</h2>

      {loading && <p className="text-gray-500">Cargando intervenciones...</p>}

      {!loading && interventions.length === 0 && (
        <p className="text-gray-500">Todavía no hay intervenciones registradas.</p>
      )}

      {/* Línea de tiempo: la raya vertical une los puntos de cada intervención */}
      <ol className="relative ml-2 flex flex-col gap-4 border-l-2 border-[#c8d1d9] pl-5">
        {interventions.map((i) => {
          const estado = ESTADOS[i.status] ?? ESTADOS.closed;
          return (
            <li key={i.id} className="relative">
              <span className={`absolute -left-[1.72rem] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-[#eceeed] ${estado.punto}`} />
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${estado.chip}`}>{estado.label}</span>
                <span className="text-xs text-gray-500" title={formatDate(i.createdAt)}>{timeAgo(i.createdAt)}</span>
              </div>
              <p className="mt-1 font-semibold text-[#124045]">{i.target}</p>
              <p className="line-clamp-2 text-sm text-gray-700">{i.reason}</p>
            </li>
          );
        })}
      </ol>

      <Link
        to="/intervenciones"
        className="mt-auto pt-4 text-right text-sm font-semibold text-[#124045] hover:underline"
      >
        Ver todas →
      </Link>
    </section>
  );
}
