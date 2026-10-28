// "Listar intervenciones con filtro por estado"
// Muestra un historial de las intervenciones, permitiendo también filtrarlas por estado

import { timeAgo } from '../utils/format';

// Botones de filtro por estado
const Estados = [
  { label: "Todas", value: "" },
  { label: "Abiertas", value: "open" },
  { label: "Cerradas", value: "closed" },
];

// Insignia de color para cada estado
const Insignias = {
  open: { label: "Abierta", clase: "bg-amber-100 text-amber-800 ring-amber-300" },
  closed: { label: "Cerrada", clase: "bg-emerald-100 text-emerald-800 ring-emerald-300" },
};

// La API manda fechas en hora de Chile, ej: "2026-10-18T14:05:00" -> "18-10-2026 14:05"
function fechaLegible(fecha) {
  if (!fecha) return '—';
  const [dia, hora = ''] = fecha.split('T');
  const [anio, mes, d] = dia.split('-');
  return `${d}-${mes}-${anio} ${hora.slice(0, 5)}`.trim();
}

export function InterventionList({ interventions, loading, error, status, onStatusChange, page, hasNext, onPageChange, sites }) {
  const vacia = !loading && !error && interventions.length === 0;
  const hayDatos = !loading && !error && interventions.length > 0;

  return (
    <section className="card flex flex-col gap-4 text-brand-dark max-lg:gap-3 max-lg:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="card-title max-lg:text-lg">Historial de intervenciones</h2>

        {/* Filtro por estado como control segmentado */}
        <div role="group" aria-label="Filtrar por estado" className="inline-flex rounded-lg border border-brand-light bg-white p-1">
          {Estados.map((estado) => {
            const activo = status === estado.value;
            return (
              <button
                key={estado.value}
                type="button"
                aria-pressed={activo}
                onClick={() => onStatusChange(estado.value)}
                className={`btn btn-sm ${activo ? 'btn-primary' : 'btn-ghost'}`}
              >
                {estado.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Estados de carga, error y vacío */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-12 text-sm text-gray-500" role="status">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" aria-hidden="true" />
          Cargando intervenciones…
        </div>
      )}
      {!loading && error && <div className="alert-error" role="alert">{error}</div>}
      {vacia && (
        <div className="rounded-xl border border-dashed border-brand-light bg-white/60 py-12 text-center text-sm text-gray-500">
          {page > 1
            ? 'No hay más intervenciones en esta página.'
            : status === 'open'
              ? 'No hay intervenciones abiertas.'
              : status === 'closed'
                ? 'No hay intervenciones cerradas.'
                : 'Aún no hay intervenciones registradas.'}
        </div>
      )}

      {/* Tabla de intervenciones optimizada para evitar scroll horizontal */}
      {hayDatos && (
        <div className="overflow-x-auto rounded-lg border border-brand-gray bg-white">
          <table className="w-full text-left text-sm table-fixed">
            <thead className="bg-surface text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                {/* Definimos porcentajes de ancho fijos para cada columna */}
                <th scope="col" className="w-[24%] px-3 py-3">Centro / Sensor</th>
                <th scope="col" className="w-[22%] px-3 py-3">Fecha</th>
                <th scope="col" className="w-[38%] px-3 py-3">Motivo</th>
                <th scope="col" className="w-[16%] px-2 py-3 text-center">Estado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-brand-gray/70">
              {interventions.map((intervention) => {
                const insignia = Insignias[intervention.status] ?? { label: intervention.status, clase: "bg-gray-100 text-gray-700 ring-gray-300" };
                return (
                  <tr key={intervention.id} className="align-top transition-colors odd:bg-white even:bg-surface/50 hover:bg-brand-light/15">
                    {/* Centro y sensor con texto adaptado */}
                    <td className="px-3 py-3 break-words">
                      <div className="font-semibold text-xs sm:text-sm">
                        {sites.find((s) => s.id === intervention.site_id)?.name ?? `Centro ${intervention.site_id}`}
                      </div>
                      {intervention.sensor_id && (
                        <div className="text-[11px] sm:text-xs text-gray-500">Sensor {intervention.sensor_id}</div>
                      )}
                    </td>

                    {/* Fecha compactada para que no gaste espacio de más */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-xs sm:text-sm">{fechaLegible(intervention.created_at)}</div>
                      <div className="text-[11px] sm:text-xs text-gray-500">{timeAgo(intervention.created_at)}</div>
                    </td>

                    {/* Motivo con ajuste de línea fluido */}
                    <td className="px-3 py-3 break-words text-xs sm:text-sm text-gray-700">
                      <span className="line-clamp-3">{intervention.reason}</span>
                    </td>

                    {/* Estado con espacio reservado garantizado */}
                    <td className="px-2 py-3 text-center align-middle">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] sm:text-xs font-semibold ring-1 ring-inset ${insignia.clase}`}>
                        {insignia.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {!error && (hayDatos || page > 1) && (
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || loading}
            className="btn btn-secondary btn-sm"
          >
            Anterior
          </button>
          <span className="text-sm font-semibold text-gray-600">Página {page}</span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext || loading}
            className="btn btn-secondary btn-sm"
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
  );
}