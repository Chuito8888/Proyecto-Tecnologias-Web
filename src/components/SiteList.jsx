//muestra centros ordenados por estado y permite filtrarlos
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSites } from '../hooks/useSites';
import { ESTADOS_SENSOR as COLORES } from '../utils/format';

const FILTROS = [
  { value: 'todos', label: 'Todos los centros' },
  { value: 'problemas', label: 'Con problemas' },
  { value: 'operativos', label: 'Operativos' },
  { value: 'inactivos', label: 'Inactivos' },
];

const ESTADOS = {
  outOfRange: { label: 'Fuera de rango', clase: COLORES.out_of_range.chip },
  noData: { label: 'Sin transmitir', clase: COLORES.no_data.chip },
  ok: { label: 'Operativos', clase: 'bg-brand-gray text-brand-dark' },
};

const ESTADOS_SENSOR = {
  out_of_range: { label: 'Fuera de rango', clase: COLORES.out_of_range.chip },
  no_data: { label: 'Sin transmitir', clase: COLORES.no_data.chip },
};

//Íconos simples en SVG, igual que en Login.jsx
function IconoLupa() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function IconoCerrar({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconoFlecha() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ordenarCentros(a, b) {
  if (Boolean(a.problemCount) !== Boolean(b.problemCount)) {
    return b.problemCount - a.problemCount;
  }
  if (a.outOfRange !== b.outOfRange) return b.outOfRange - a.outOfRange;
  if (a.noData !== b.noData) return b.noData - a.noData;
  return (a.name ?? '').localeCompare(b.name ?? '', 'es');
}

function plural(n, singular, pluralTexto) {
  return n === 1 ? singular : pluralTexto;
}

//Panel modal con el detalle del centro: se cierra con Escape, con la X o haciendo clic fuera
function DetalleCentro({ site, onClose, onSolicitar }) {
  const cerrarRef = useRef(null);
  const panelRef = useRef(null);
  const sensoresConProblemas = site.sensors.filter((sensor) => sensor.status !== 'ok');
  const conProblemas = site.problemCount > 0;

  useEffect(() => {
    //foco inicial en el botón de cerrar y bloqueo del scroll de fondo
    const focoAnterior = document.activeElement;
    cerrarRef.current?.focus();
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const alPresionar = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      //el foco con Tab queda atrapado dentro del panel mientras esté abierto
      if (event.key !== 'Tab' || !panelRef.current) return;
      const enfocables = Array.from(panelRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (enfocables.length === 0) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      const dentro = panelRef.current.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === primero || !dentro)) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && (document.activeElement === ultimo || !dentro)) {
        event.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', alPresionar);

    return () => {
      document.removeEventListener('keydown', alPresionar);
      document.body.style.overflow = overflowAnterior;
      //devolvemos el foco a la tarjeta que abrió el panel
      if (focoAnterior instanceof HTMLElement) focoAnterior.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/75 p-4 backdrop-blur-sm bajo:p-2"
      onClick={onClose}
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-centro-titulo"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col bajo:max-h-[calc(100vh-1rem)] overflow-hidden rounded-2xl bg-surface text-black shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Encabezado fijo del panel */}
        <div className="flex items-start justify-between gap-4 border-b border-brand-gray px-6 pb-4 pt-6 max-lg:px-5 bajo:pb-3 bajo:pt-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-brand">Detalle del centro</p>
            <h2 id="detalle-centro-titulo" className="mt-1 break-words text-2xl font-bold text-brand-dark sm:text-3xl max-lg:text-2xl! bajo:mt-0 bajo:text-xl!">{site.name}</h2>
            <p className="text-sm text-gray-600">{site.area || 'Área no informada'}</p>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle del centro"
            title="Cerrar (Esc)"
            className="btn btn-ghost h-10 w-10 shrink-0 px-0"
          >
            <IconoCerrar className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="overflow-y-auto px-6 py-5 max-lg:px-5 bajo:py-3">
          {conProblemas ? (
            <div className="rounded-xl border-2 border-danger bg-red-50 p-4 text-red-800 bajo:p-3">
              <p className="flex items-center gap-2 text-lg font-extrabold">
                <span className="h-3 w-3 animate-pulse rounded-full bg-danger" aria-hidden="true" />
                Atención requerida
              </p>
              <p className="mt-1 text-sm font-semibold">
                Hay {site.problemCount} {plural(site.problemCount, 'sensor', 'sensores')} con problemas en este centro.
              </p>
            </div>
          ) : (
            <div className="alert-success">No hay problemas críticos registrados en este centro.</div>
          )}

          <div className="mt-5 grid grid-cols-3 gap-2 text-center bajo:mt-3">
            <div className={`rounded-xl p-3 bajo:py-2 ${COLORES.out_of_range.chip}`}>
              <strong className="block text-2xl">{site.outOfRange}</strong>
              <span className="text-xs font-bold">Fuera de rango</span>
            </div>
            <div className={`rounded-xl p-3 bajo:py-2 ${COLORES.no_data.chip}`}>
              <strong className="block text-2xl">{site.noData}</strong>
              <span className="text-xs font-bold">Sin transmitir</span>
            </div>
            <div className="rounded-xl bg-brand-gray p-3 text-brand-dark bajo:py-2">
              <strong className="block text-2xl">{site.ok}</strong>
              <span className="text-xs font-bold">Operativos</span>
            </div>
          </div>

          <div className="mt-6 bajo:mt-4">
            <h3 className="text-lg font-bold text-brand-dark">Sensores que requieren atención</h3>
            {sensoresConProblemas.length > 0 ? (
              <ul className="mt-3 flex flex-col gap-2">
                {sensoresConProblemas.map((sensor) => {
                  const estado = ESTADOS_SENSOR[sensor.status];
                  return (
                    <li key={sensor.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-white p-3">
                      <div>
                        <p className="font-bold text-brand-dark">{sensor.sensor_name || `Sensor ${sensor.id}`}</p>
                        <p className="text-sm text-gray-600">
                          Profundidad: {sensor.depth != null ? `${sensor.depth} m` : 'No informada'}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${estado?.clase ?? 'bg-danger text-white'}`}>
                        {estado?.label ?? 'Con problemas'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 rounded-xl bg-white p-4 text-sm text-gray-600">
                {site.sensors.length === 0 ? 'Este centro no tiene sensores registrados.' : 'Todos los sensores están operativos.'}
              </p>
            )}
          </div>
        </div>

        {/* Acciones fijas al pie del panel */}
        <div className="flex flex-col-reverse gap-2 border-t border-brand-gray bg-surface px-6 py-4 sm:flex-row sm:justify-end sm:gap-3 max-lg:px-5 bajo:py-3">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cerrar</button>
          <button
            type="button"
            onClick={onSolicitar}
            className={`btn ${conProblemas ? 'btn-danger' : 'btn-primary'}`}
          >
            Solicitar intervención
          </button>
        </div>
      </section>
    </div>
  );
}

export function SiteList() {
  const { sites, loading, error, reload } = useSites();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [selectedSite, setSelectedSite] = useState(null);
  const buscadorRef = useRef(null);

  const cerrarDetalle = React.useCallback(() => setSelectedSite(null), []);

  const solicitarIntervencion = () => {
    navigate('/intervenciones', { state: { siteId: selectedSite.id } });
  };

  const limpiarBusqueda = () => {
    setSearch('');
    buscadorRef.current?.focus();
  };

  const limpiarFiltros = () => {
    setSearch('');
    setFilter('todos');
  };

  const hayFiltros = search.trim() !== '' || filter !== 'todos';

  const visibles = sites
    .filter((site) => (site.name ?? '').toLowerCase().includes(search.trim().toLowerCase()))
    .filter((site) => {
      if (filter === 'problemas') return site.problemCount > 0;
      if (filter === 'operativos') return site.problemCount === 0 && site.active;
      if (filter === 'inactivos') return !site.active;
      return true;
    })
    .sort(ordenarCentros);

  const conProblemas = sites.filter((site) => site.problemCount > 0).length;
  //si la carga falló y no hay datos, basta con el aviso de error (sin lista vacía ni contador)
  const soloError = Boolean(error) && !loading && sites.length === 0;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 text-black max-lg:gap-4 bajo:gap-3">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-brand-light/60 pb-4 max-lg:items-center max-lg:gap-3 max-lg:pb-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark sm:text-4xl max-lg:text-2xl!">Centros</h1>
          <p className="mt-1 text-gray-600 max-lg:mt-0 max-lg:text-sm">Estado de los centros de cultivo y sus sensores</p>
        </div>
        {!loading && !error && sites.length > 0 && (
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <span className="rounded-full bg-surface px-3 py-1.5 text-brand-dark shadow-sm">
              {sites.length} {plural(sites.length, 'centro', 'centros')}
            </span>
            <span className={`rounded-full px-3 py-1.5 shadow-sm ${conProblemas ? 'bg-red-100 text-red-800' : 'bg-emerald-50 text-emerald-700'}`}>
              {conProblemas ? `${conProblemas} con problemas` : 'Sin alertas'}
            </span>
          </div>
        )}
      </header>

      {/* Buscador y filtro */}
      <section className="card max-lg:p-4" aria-label="Buscar y filtrar centros">
        <div className="flex flex-col gap-4 md:flex-row md:items-end max-lg:gap-3">
          <div className="flex-1">
            <label htmlFor="buscar-centro" className="field-label max-lg:bajo:sr-only">Buscar por nombre</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-brand max-lg:bajo:mt-0">
                <IconoLupa />
              </span>
              <input
                ref={buscadorRef}
                id="buscar-centro"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape' && search) limpiarBusqueda();
                }}
                placeholder="Escribe el nombre de un centro"
                autoComplete="off"
                className="input pl-9 pr-10 max-lg:bajo:mt-0"
              />
              {search && (
                <button
                  type="button"
                  onClick={limpiarBusqueda}
                  aria-label="Limpiar búsqueda"
                  title="Limpiar búsqueda"
                  className="absolute right-1.5 top-1/2 mt-0.5 max-lg:bajo:mt-0 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-surface hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                >
                  <IconoCerrar />
                </button>
              )}
            </div>
          </div>
          <div className="md:w-64 max-lg:w-52!">
            <label htmlFor="filtro-centro" className="field-label max-lg:bajo:sr-only">Filtrar por estado</label>
            <select
              id="filtro-centro"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="input cursor-pointer max-lg:bajo:mt-0"
            >
              {FILTROS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <button
            type="button"
            onClick={limpiarFiltros}
            disabled={!hayFiltros}
            className="btn btn-secondary md:self-end"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      {error && (
        <div role="alert" className="alert-error flex flex-wrap items-center justify-between gap-3">
          <span>{error}</span>
          <button type="button" onClick={reload} className="btn btn-secondary btn-sm">Reintentar</button>
        </div>
      )}

      {!soloError && (
      <section className="card max-lg:p-4" aria-labelledby="lista-centros-titulo">
        <div className="mb-4 max-lg:mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="lista-centros-titulo" className="card-title max-lg:text-lg">Lista de centros</h2>
          <span className="text-sm font-semibold text-gray-600" aria-live="polite">
            {loading
              ? 'Cargando centros...'
              : hayFiltros
                ? `Mostrando ${visibles.length} de ${sites.length} ${plural(sites.length, 'centro', 'centros')}`
                : `${visibles.length} ${plural(visibles.length, 'centro', 'centros')}`}
          </span>
        </div>

        {loading ? (
          //esqueletos con la misma forma que las tarjetas
          <div className="grid gap-3 md:grid-cols-2" aria-hidden="true">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex animate-pulse flex-col gap-3 rounded-xl bg-white p-4 ring-1 ring-black/5">
                <div className="h-5 w-1/2 rounded bg-brand-gray/70" />
                <div className="h-3 w-1/3 rounded bg-brand-gray/50" />
                <div className="mt-2 flex gap-2">
                  <div className="h-6 w-24 rounded-full bg-brand-gray/50" />
                  <div className="h-6 w-24 rounded-full bg-brand-gray/50" />
                  <div className="h-6 w-20 rounded-full bg-brand-gray/50" />
                </div>
                <div className="h-3 w-2/5 rounded bg-brand-gray/50" />
              </div>
            ))}
          </div>
        ) : visibles.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-brand">
              <IconoLupa />
            </span>
            {sites.length === 0 ? (
              <>
                <p className="font-semibold text-brand-dark">No hay centros para mostrar</p>
                <p className="text-sm text-gray-600">Aún no hay centros registrados.</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-brand-dark">No hay centros que coincidan con la búsqueda</p>
                <p className="text-sm text-gray-600">Prueba con otro nombre o cambia el filtro de estado.</p>
                <button type="button" onClick={limpiarFiltros} className="btn btn-secondary mt-1">Limpiar filtros</button>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {visibles.map((site) => (
              <article
                key={site.id}
                role="button"
                tabIndex={0}
                aria-label={`Ver detalle de ${site.name}`}
                onClick={() => setSelectedSite(site)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedSite(site);
                  }
                }}
                className={`group flex h-full cursor-pointer flex-col rounded-xl border-2 p-4 shadow-sm max-lg:p-3 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${site.problemCount ? 'border-danger/70 bg-red-50' : 'border-transparent bg-white ring-1 ring-black/5'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className={`truncate text-lg font-bold ${site.problemCount ? 'text-red-800' : 'text-brand-dark'}`}>{site.name}</h3>
                    <p className="text-sm text-gray-600">{site.area || 'Área no informada'}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${site.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                    {site.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {site.problemCount > 0 && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-300 bg-red-100 px-3 py-2 text-sm max-lg:mt-3 max-lg:py-1.5 font-bold uppercase tracking-wide text-red-800">
                    <span className="relative flex h-3 w-3 shrink-0" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-danger" />
                    </span>
                    Atención requerida
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2 max-lg:mt-3 max-lg:gap-1.5">
                  {Object.entries(ESTADOS).map(([key, estado]) => (
                    <span key={key} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estado.clase}`}>
                      {estado.label}: {site[key]}
                    </span>
                  ))}
                </div>
                {/* El pie queda siempre abajo para que todas las tarjetas se vean alineadas */}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 max-lg:gap-x-2 max-lg:gap-y-1 max-lg:pt-3">
                  <p className={`text-sm font-bold ${site.problemCount ? 'text-red-800' : 'text-emerald-700'}`}>
                    {site.problemCount
                      ? `${site.problemCount} ${plural(site.problemCount, 'sensor requiere', 'sensores requieren')} atención`
                      : 'Sin problemas detectados'}
                  </p>
                  <span className="flex items-center gap-1 text-sm font-semibold text-brand group-hover:text-brand-dark">
                    Ver detalle
                    <IconoFlecha />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      )}

      {selectedSite && (
        <DetalleCentro
          site={selectedSite}
          onClose={cerrarDetalle}
          onSolicitar={solicitarIntervencion}
        />
      )}
    </div>
  );
}
