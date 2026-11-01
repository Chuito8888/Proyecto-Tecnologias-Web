import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSites } from '../hooks/useSites';
import { ESTADOS_SENSOR as COLORES, formatOxygen } from '../utils/format';

const ESTADOS = {
  out_of_range: { label: 'Fuera de rango', clase: COLORES.out_of_range.chip },
  no_data: { label: 'Sin transmitir', clase: COLORES.no_data.chip },
  ok: { label: 'Operativo', clase: 'bg-brand-gray text-brand-dark' },
};

function ArrowLeft() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
}

export function SiteDetailPage() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { sites, loading, error, reload } = useSites();
  const site = sites.find((item) => String(item.id) === siteId);
  const sensors = [...(site?.sensors ?? [])].sort((a, b) => {
    const priority = { no_data: 1, out_of_range: 2, ok: 3 };
    return (priority[a.status] ?? 9) - (priority[b.status] ?? 9)
      || (a.sensor_name ?? '').localeCompare(b.sensor_name ?? '', 'es');
  });

  if (loading) return <div className="card mx-auto max-w-4xl text-brand-dark">Cargando detalle del centro...</div>;
  if (error) return <div className="mx-auto max-w-4xl alert-error flex items-center justify-between gap-3"><span>{error}</span><button type="button" onClick={reload} className="btn btn-secondary btn-sm">Reintentar</button></div>;
  if (!site) return <div className="mx-auto max-w-4xl card text-brand-dark"><p className="font-semibold">Centro no encontrado.</p><button type="button" onClick={() => navigate('/centros')} className="btn btn-secondary mt-4">Volver a centros</button></div>;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 text-black">
      <button type="button" onClick={() => navigate('/centros')} className="btn btn-ghost self-start">
        <ArrowLeft /> Volver a centros
      </button>
      <section className="card">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Detalle del centro</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="card-title text-3xl">{site.name}</h1>
            <p className="text-sm text-gray-600">{site.area || 'Área no informada'}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${site.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
            {site.active ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <button type="button" onClick={() => navigate('/intervenciones', { state: { siteId: site.id } })} className={`btn mt-4 ${site.problemCount > 0 ? 'btn-danger' : 'btn-primary'}`}>
          Solicitar intervención
        </button>
        {site.problemCount > 0
          ? <div className="mt-5 rounded-xl border-2 border-danger bg-red-50 p-4 text-red-800"><strong>Atención requerida</strong><p className="text-sm">{site.problemCount} sensor{site.problemCount === 1 ? '' : 'es'} con problemas.</p></div>
          : <div className="alert-success mt-5">No hay problemas críticos registrados en este centro.</div>}
      </section>

      <section className="card" aria-labelledby="sensores-centro">
        <div className="flex items-center justify-between gap-3">
          <h2 id="sensores-centro" className="card-title">Sensores del centro</h2>
          <span className="text-sm text-gray-600">{sensors.length} sensor{sensors.length === 1 ? '' : 'es'}</span>
        </div>
        {sensors.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {sensors.map((sensor) => {
              const estado = ESTADOS[sensor.status] ?? ESTADOS.ok;
              return (
                <button key={sensor.id} type="button" onClick={() => navigate(`/centros/${site.id}/sensores/${sensor.id}`)} className="group rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="truncate font-bold text-brand-dark">{sensor.sensor_name || `Sensor ${sensor.id}`}</p><p className="mt-1 text-sm text-gray-600">Profundidad: {sensor.depth != null ? `${sensor.depth} m` : 'No informada'}</p></div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${estado.clase}`}>{estado.label}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-brand group-hover:text-brand-dark">{sensor.status === 'no_data' ? 'Sin datos' : formatOxygen(sensor.last_reading?.value)} <span aria-hidden="true">→</span></p>
                </button>
              );
            })}
          </div>
        ) : <p className="mt-4 rounded-xl bg-white p-4 text-sm text-gray-600">Este centro no tiene sensores registrados.</p>}
      </section>
    </div>
  );
}
