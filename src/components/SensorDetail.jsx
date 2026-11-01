import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OxygenChart } from './OxygenChart';
import { ESTADOS_SENSOR } from '../utils/format';

function ArrowLeft() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
}

export function SensorDetail({ site, sensors, sensor, points, loading, error, onRetry }) {
  const navigate = useNavigate();
  const selected = sensor ? {
    sensorId: sensor.id,
    sensorName: sensor.sensor_name || `Sensor ${sensor.id}`,
    siteName: site.name,
    status: sensor.status,
    min: sensor.oxygen_min,
    max: sensor.oxygen_max,
  } : null;
  const options = sensors.map((item) => ({
    sensorId: item.id,
    sensorName: item.sensor_name || `Sensor ${item.id}`,
    siteName: site.name,
  }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 text-black">
      <button type="button" onClick={() => navigate(`/centros/${site.id}`)} className="btn btn-ghost self-start"><ArrowLeft /> Volver al detalle del centro</button>
      <div className="grid gap-5 lg:grid-cols-[minmax(190px,260px)_1fr]">
        <aside className="card h-fit" aria-labelledby="otros-sensores">
          <h1 id="otros-sensores" className="card-title text-lg">Sensores del centro</h1>
          <ul className="mt-3 flex flex-col gap-2">
            {sensors.map((item) => {
              const estado = ESTADOS_SENSOR[item.status] || ESTADOS_SENSOR.ok;
              return (
                <li key={item.id}>
                  <button type="button" onClick={() => navigate(`/centros/${site.id}/sensores/${item.id}`, { replace: true })} className={`w-full rounded-lg border p-3 text-left transition hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${item.id === sensor.id ? 'border-brand bg-brand-gray/50' : 'border-gray-200 bg-white'}`}>
                    <span className="block truncate text-sm font-bold text-brand-dark">{item.sensor_name || `Sensor ${item.id}`}</span>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${estado.chip}`}>{estado.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
        <div className="min-w-0">
          {error && <div role="alert" className="alert-error mb-4 flex items-center justify-between gap-3"><span>{error}</span><button type="button" onClick={onRetry} className="btn btn-secondary btn-sm">Reintentar</button></div>}
          <OxygenChart sensors={options} selected={selected} onSelect={(id) => navigate(`/centros/${site.id}/sensores/${id}`, { replace: true })} points={points} loading={loading} />
        </div>
      </div>
    </div>
  );
}
