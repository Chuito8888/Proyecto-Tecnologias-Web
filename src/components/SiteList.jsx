//muestra centros ordenados por estado y permite filtrarlos
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSites } from '../hooks/useSites';

const FILTROS = [
  { value: 'todos', label: 'Todos los centros' },
  { value: 'problemas', label: 'Con problemas' },
  { value: 'operativos', label: 'Operativos' },
  { value: 'inactivos', label: 'Inactivos' },
];

const ESTADOS = {
  outOfRange: { label: 'Fuera de rango', clase: 'bg-[#fee2e2] text-[#991b1b] ring-1 ring-[#f87171]' },
  noData: { label: 'Sin transmitir', clase: 'bg-[#dc2626] text-white ring-1 ring-[#991b1b]' },
  ok: { label: 'Operativos', clase: 'bg-[#c8d1d9] text-[#124045]' },
};

const ESTADOS_SENSOR = {
  out_of_range: { label: 'Fuera de rango', clase: 'bg-[#dc2626] text-white' },
  no_data: { label: 'Sin transmitir', clase: 'bg-[#991b1b] text-white' },
};

function ordenarCentros(a, b) {
  if (Boolean(a.problemCount) !== Boolean(b.problemCount)) {
    return b.problemCount - a.problemCount;
  }
  if (a.outOfRange !== b.outOfRange) return b.outOfRange - a.outOfRange;
  if (a.noData !== b.noData) return b.noData - a.noData;
  return a.name.localeCompare(b.name, 'es');
}

export function SiteList() {
  const { sites, loading, error } = useSites();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [selectedSite, setSelectedSite] = useState(null);

  const solicitarIntervencion = () => {
    navigate('/intervenciones', { state: { siteId: selectedSite.id } });
  };

  const visibles = sites
    .filter((site) => site.name.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((site) => {
      if (filter === 'problemas') return site.problemCount > 0;
      if (filter === 'operativos') return site.problemCount === 0 && site.active;
      if (filter === 'inactivos') return !site.active;
      return true;
    })
    .sort(ordenarCentros);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 text-black">
      <header>
        <h1 className="text-4xl font-bold">Centros</h1>
        <p className="mt-1 text-gray-600">Estado de los centros de cultivo y sus sensores</p>
      </header>

      <section className="rounded-2xl bg-[#124045] p-5 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row">
          <label className="flex-1">
            <span className="mb-1 block text-sm font-semibold text-[#c8d1d9]">Buscar por nombre</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Escribe el nombre de un centro"
              className="h-11 w-full rounded-lg border border-[#86b4a7] bg-white px-4 text-[#124045] outline-none focus:ring-2 focus:ring-[#f7d77a]"
            />
          </label>
          <label className="md:w-64">
            <span className="mb-1 block text-sm font-semibold text-[#c8d1d9]">Filtrar por estado</span>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="h-11 w-full rounded-lg border border-[#86b4a7] bg-white px-4 text-[#124045] outline-none focus:ring-2 focus:ring-[#f7d77a]"
            >
              {FILTROS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      {error && <p className="rounded-lg border border-red-500 bg-red-100 p-3 font-semibold text-red-700">{error}</p>}

      <section className="rounded-2xl bg-[#eceeed] p-5 shadow-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">Lista de centros</h2>
          <span className="text-sm font-semibold text-gray-600">
            {loading ? 'Cargando...' : `${visibles.length} centro${visibles.length === 1 ? '' : 's'}`}
          </span>
        </div>

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-36 animate-pulse rounded-xl bg-white" />)}
          </div>
        ) : visibles.length === 0 ? (
          <p className="rounded-xl bg-white p-8 text-center text-gray-600">No hay centros que coincidan con la búsqueda.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {visibles.map((site) => (
              <article
                key={site.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedSite(site)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') setSelectedSite(site);
                }}
                className={`cursor-pointer rounded-xl border-2 p-4 shadow-sm transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#124045] ${site.problemCount ? 'border-[#dc2626] bg-[#fff7f7] shadow-[#dc2626]/20 shadow-lg' : 'border-transparent bg-white ring-1 ring-black/5'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={`text-lg font-bold ${site.problemCount ? 'text-[#991b1b]' : 'text-[#124045]'}`}>{site.name}</h3>
                    <p className="text-sm text-gray-600">{site.area || 'Área no informada'}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${site.active ? 'bg-[#d9eee5] text-[#24634f]' : 'bg-gray-200 text-gray-600'}`}>
                    {site.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {site.problemCount > 0 && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#f87171] bg-[#fee2e2] px-3 py-2 text-sm font-extrabold uppercase tracking-wide text-[#991b1b]">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#dc2626] opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-[#dc2626]" />
                    </span>
                    Atención requerida
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(ESTADOS).map(([key, estado]) => (
                    <span key={key} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estado.clase}`}>
                      {estado.label}: {site[key]}
                    </span>
                  ))}
                </div>
                <p className={`mt-3 text-sm font-bold ${site.problemCount ? 'text-[#991b1b]' : 'text-[#24634f]'}`}>
                  {site.problemCount ? `${site.problemCount} sensor${site.problemCount === 1 ? '' : 'es'} requiere${site.problemCount === 1 ? '' : 'n'} atención` : 'Sin problemas detectados'}
                </p>
                <p className="mt-3 text-sm font-bold text-[#54867d]">Ver información del centro</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedSite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#061d20]/75 p-4"
          onClick={() => setSelectedSite(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalle-centro-titulo"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#eceeed] p-6 text-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#54867d]">Detalle del centro</p>
                <h2 id="detalle-centro-titulo" className="text-3xl font-bold text-[#124045]">{selectedSite.name}</h2>
                <p className="text-gray-600">{selectedSite.area || 'Área no informada'}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSite(null)}
                aria-label="Cerrar detalle"
                className="rounded-lg bg-[#c8d1d9] px-3 py-2 text-xl font-bold text-[#124045] hover:bg-[#86b4a7]"
              >
                ×
              </button>
            </div>

            {selectedSite.problemCount > 0 ? (
              <div className="mt-5 rounded-xl border-2 border-[#dc2626] bg-[#fee2e2] p-4 text-[#991b1b]">
                <p className="flex items-center gap-2 text-lg font-extrabold">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-[#dc2626]" />
                  Atención requerida
                </p>
                <p className="mt-1 font-semibold">Hay {selectedSite.problemCount} sensor{selectedSite.problemCount === 1 ? '' : 'es'} con problemas en este centro.</p>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-[#86b4a7] bg-[#d9eee5] p-4 font-bold text-[#24634f]">
                No hay problemas críticos registrados en este centro.
              </div>
            )}

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-[#fee2e2] p-3 text-[#991b1b]"><strong className="block text-2xl">{selectedSite.outOfRange}</strong><span className="text-xs font-bold">Fuera de rango</span></div>
              <div className="rounded-lg bg-[#fecaca] p-3 text-[#7f1d1d]"><strong className="block text-2xl">{selectedSite.noData}</strong><span className="text-xs font-bold">Sin transmitir</span></div>
              <div className="rounded-lg bg-[#c8d1d9] p-3 text-[#124045]"><strong className="block text-2xl">{selectedSite.ok}</strong><span className="text-xs font-bold">Operativos</span></div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-bold text-[#124045]">Sensores que requieren atención</h3>
              {selectedSite.sensors.filter((sensor) => sensor.status !== 'ok').length > 0 ? (
                <div className="mt-3 flex flex-col gap-2">
                  {selectedSite.sensors.filter((sensor) => sensor.status !== 'ok').map((sensor) => {
                    const estado = ESTADOS_SENSOR[sensor.status];
                    return (
                      <div key={sensor.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#f87171] bg-white p-3">
                        <div>
                          <p className="font-bold text-[#124045]">{sensor.sensor_name || `Sensor ${sensor.id}`}</p>
                          <p className="text-sm text-gray-600">Profundidad: {sensor.depth ?? 'No informada'} m</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${estado?.clase ?? 'bg-[#dc2626] text-white'}`}>
                          {estado?.label ?? 'Con problemas'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 rounded-lg bg-white p-4 text-gray-600">Todos los sensores están operativos.</p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setSelectedSite(null)} className="rounded-lg bg-[#c8d1d9] px-4 py-2 font-bold text-[#124045] hover:bg-[#86b4a7]">Cerrar</button>
              <button type="button" onClick={solicitarIntervencion} className="rounded-lg bg-[#dc2626] px-4 py-2 font-bold text-white hover:bg-[#991b1b]">Solicitar intervención</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}