//El enunciado dice que no hay un endpoint para el Dashboard asi que o hacemo nosotros con el front end combinando las rutas anteriores
//Es la pantalla principal posterior al inicio de sesión y muestra un resumen de los datos y las métricas
//Orden de arriba hacia abajo: estado general y mapa, lo que requiere atención, y el detalle del centro elegido
//Todo lo crítico aparece primero

import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { NetworkHealth } from './NetworkHealth';
import { SitesMap } from './SitesMap';
import { AlertsTable } from './AlertsTable';
import { RecentInterventions } from './RecentInterventions';
import { SiteProfile } from './SiteProfile';
import { OxygenChart } from './OxygenChart';
import { timeAgo } from '../utils/format';

/* 
// --- CÓDIGO ANTERIOR COMENTADO (Ícono de refrescar) ---
function IconoRefrescar({ girando }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 ${girando ? 'animate-spin' : ''}`}
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}
*/

// Barra de estado simplificada: solo muestra el cuadro "EN VIVO" o "SIN CONEXIÓN"
function LiveStatus({ error }) {
  // Si la última carga falló se avisa en la insignia en vez de mostrar "En vivo"
  const conexionOk = !error;

  return (
    <div className="flex max-w-full items-center gap-2 rounded-xl bg-white/80 p-1 shadow-sm ring-1 ring-brand-light/50">
      <span
        className={`flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-bold tracking-wider text-white ${conexionOk ? 'bg-brand-dark' : 'bg-danger'}`}
      >
        <span className="relative flex h-2.5 w-2.5">
          {conexionOk && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-light" />}
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${conexionOk ? 'bg-brand-light' : 'bg-white'}`} />
        </span>
        {conexionOk ? 'EN VIVO' : 'SIN CONEXIÓN'}
      </span>

      {/* --- CÓDIGO ANTERIOR COMENTADO (Texto de actualización y botón Actualizar) ---
      <span className="h-6 w-px bg-brand-gray" aria-hidden="true" />

      <span
        className="min-w-0 truncate px-1 text-xs leading-10 font-medium text-gray-500"
        title={updatedAt ? `Última carga: ${updatedAt.toLocaleString('es-CL')}` : undefined}
        aria-live="polite"
      >
        {textoEstado}
      </span>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="btn btn-primary shrink-0"
        title="Volver a cargar los datos"
      >
        <IconoRefrescar girando={refreshing} />
        <span className="hidden sm:inline">Actualizar</span>
        <span className="sr-only sm:hidden">Actualizar</span>
      </button>
      -------------------------------------------------------------------------------- */}
    </div>
  );
}

export function Dashboard() {
  const d = useDashboard();
  const detalleRef = useRef(null);
  //La primera carga falló: las tarjetas muestran "sin datos" en vez de sus estados vacíos
  const sinDatos = Boolean(d.error) && !d.updatedAt;

  //Desde la tabla de alertas: elige el sensor y baja hasta su detalle
  const verDetalle = (sensorId) => {
    d.setSelectedId(sensorId);
    detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 text-black max-lg:gap-4 bajo:gap-4">
      {/* Encabezado: título a la izquierda y estado en vivo a la derecha (en proyector, más compacto) */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-brand-light/60 pb-4 max-lg:items-center max-lg:gap-3 max-lg:pb-3 bajo:pb-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark sm:text-4xl max-lg:text-2xl!">Dashboard</h1>
          <p className="mt-1 text-gray-600 max-lg:mt-0 max-lg:text-sm">Oxígeno disuelto en tus centros de cultivo</p>
        </div>
        {/* Pasamos únicamente el error para que LiveStatus determine si está en vivo o sin conexión */}
        <LiveStatus error={d.error} />
      </header>

      {/* Error general de carga, con opción de reintentar */}
      {d.error && (
        <div className="alert-error flex flex-wrap items-center justify-between gap-3" role="alert">
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            {d.error}
          </span>
          <button type="button" onClick={d.refresh} disabled={d.refreshing} className="btn btn-secondary btn-sm">
            Reintentar
          </button>
        </div>
      )}

      {/* Estado general y mapa */}
      <div className="grid gap-6 lg:grid-cols-3 max-lg:gap-4">
        <NetworkHealth
          counts={d.counts}
          totalSensors={d.sensors.length}
          totalCenters={d.counts.sites}
          loading={d.loading}
          sinDatos={sinDatos}
        />
        <div className="lg:col-span-2">
          <SitesMap
            centers={d.centers}
            selectedId={d.selectedCenter?.id}
            onSelect={d.selectCenter}
            loading={d.loading}
            sinDatos={sinDatos}
          />
        </div>
      </div>

      {/*Se muestra el gráfico del sensor seleccionado en el centro seleccionado*/}
      <div ref={detalleRef} className="grid scroll-mt-6 gap-6 xl:grid-cols-5 max-lg:scroll-mt-4 max-lg:gap-4">
        {/* En pantallas angostas el gráfico va primero, así "Ver gráfico" lo deja a la vista */}
        <div className="min-w-0 xl:col-span-3 max-lg:order-first">
          <OxygenChart
            sensors={d.selectedCenter?.sensors ?? []}
            selected={d.selected}
            onSelect={d.setSelectedId}
            points={d.points}
            loading={d.chartLoading}
            sinDatos={sinDatos}
          />
        </div>
        {/* El perfil de centro se retira de momento
        <div className="min-w-0 xl:col-span-2">
          <SiteProfile
            center={d.selectedCenter}
            selectedSensorId={d.selected?.sensorId}
            onSelectSensor={d.setSelectedId}
            loading={d.loading}
            sinDatos={sinDatos}
          />
        </div>*/}

      </div>

      {/* Lo que requiere atención, luego del mapa y del gráfico */}
      <div className="grid gap-6 xl:grid-cols-3 max-lg:gap-4">
        <div className="min-w-0 xl:col-span-2">
          <AlertsTable
            alerts={d.alerts}
            trends={d.trends}
            loading={d.loading}
            sinDatos={sinDatos}
            onOpenIntervention={d.openIntervention}
            onShowChart={verDetalle}
          />
        </div>
        {/*Se muestra una lista con las ultimas intervenciones realizadas*/}
        <RecentInterventions interventions={d.recentInterventions} loading={d.loading} sinDatos={sinDatos} />
      </div>

    </div>
  );
}