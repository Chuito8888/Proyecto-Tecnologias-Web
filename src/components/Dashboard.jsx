//El enunciado dice que no hay un endpoint para el Dashboard asi que lo hacemo nosotros con el front end combinando las rutas anteriores
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

//Indicador "En vivo" + "Actualizado hace X", se refresca solo para no re-dibujar todo el Dashboard cada segundo
function LiveStatus({ updatedAt, onRefresh }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
      <span className="flex items-center gap-2 rounded-full bg-[#124045] px-3 py-1 font-bold tracking-wider text-white">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#86b4a7]" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#86b4a7]" />
        </span>
        EN VIVO
      </span>
      {updatedAt && <span>Actualizado {timeAgo(updatedAt)}</span>}
      <button
        type="button"
        onClick={onRefresh}
        className="rounded bg-[#54867d] px-3 py-1.5 font-semibold text-white transition-colors duration-200 hover:bg-[#124045]"
      >
        Actualizar
      </button>
    </div>
  );
}

export function Dashboard() {
  const d = useDashboard();
  const detalleRef = useRef(null);

  //Desde la tabla de alertas: elige el sensor y baja hasta su detalle
  const verDetalle = (sensorId) => {
    d.setSelectedId(sensorId);
    detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 text-black">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Oxígeno disuelto en tus centros de cultivo</p>
        </div>
        <LiveStatus updatedAt={d.updatedAt} onRefresh={d.refresh} />
      </header>

      {d.error && (
        <p className="rounded-lg border border-red-500 bg-red-100 p-3 font-semibold text-red-700">{d.error}</p>
      )}

      {/* Estado general y mapa */}
      <div className="grid gap-6 lg:grid-cols-3">
        <NetworkHealth
          counts={d.counts}
          totalSensors={d.sensors.length}
          totalCenters={d.counts.sites}
          loading={d.loading}
        />
        <div className="lg:col-span-2">
          <SitesMap centers={d.centers} selectedId={d.selectedCenter?.id} onSelect={d.selectCenter} />
        </div>
      </div>

      {/* Lo que requiere atención, justo después del resumen */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <AlertsTable
            alerts={d.alerts}
            trends={d.trends}
            loading={d.loading}
            onOpenIntervention={d.openIntervention}
            onShowChart={verDetalle}
          />
        </div>
        <RecentInterventions interventions={d.recentInterventions} loading={d.loading} />
      </div>

      {/* Detalle del centro elegido: su perfil de profundidad y el gráfico del sensor */}
      <div ref={detalleRef} className="grid scroll-mt-6 gap-6 xl:grid-cols-5">
        <div className="min-w-0 xl:col-span-2">
          <SiteProfile
            center={d.selectedCenter}
            selectedSensorId={d.selected?.sensorId}
            onSelectSensor={d.setSelectedId}
          />
        </div>
        <div className="min-w-0 xl:col-span-3">
          <OxygenChart
            sensors={d.selectedCenter?.sensors ?? []}
            selected={d.selected}
            onSelect={d.setSelectedId}
            points={d.points}
            loading={d.chartLoading}
          />
        </div>
      </div>
    </div>
  );
}
