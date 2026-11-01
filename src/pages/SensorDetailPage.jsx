import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SensorDetail } from '../components/SensorDetail';
import { useSites } from '../hooks/useSites';
import { getToken } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

export function SensorDetailPage() {
  const { siteId, sensorId } = useParams();
  const { sites, loading: sitesLoading, error: sitesError, reload } = useSites();
  const [points, setPoints] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);
  const site = sites.find((item) => String(item.id) === siteId);
  const sensors = site?.sensors ?? [];
  const sensor = sensors.find((item) => String(item.id) === sensorId);
  const selectedSensorId = sensor?.id;

  useEffect(() => {
    if (!selectedSensorId) return undefined;
    let cancelled = false;
    const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    setChartLoading(true);
    setChartError(null);
    fetch(`${API_URL}/measurements?sensor_id=${selectedSensorId}&from=${from}&page_size=1000`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudieron cargar las mediciones.');
        return response.json();
      })
      .then((json) => {
        if (cancelled) return;
        setPoints([...(json.data ?? [])].reverse().map((measurement) => ({
          hora: measurement.timestamp.slice(11, 16),
          fecha: measurement.timestamp.replace('T', ' ').slice(0, 16),
          valor: measurement.oxygen,
          temperatura: measurement.temperature,
        })));
      })
      .catch((error) => {
        if (!cancelled) {
          setPoints([]);
          setChartError(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) setChartLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedSensorId]);

  if (sitesLoading) return <div className="card text-brand-dark">Cargando detalle del sensor...</div>;
  if (sitesError || !site || !sensor) {
    return <div className="alert-error">{sitesError || 'Sensor no encontrado.'}<button type="button" onClick={reload} className="btn btn-secondary btn-sm ml-4">Reintentar</button></div>;
  }
  return <SensorDetail site={site} sensors={sensors} sensor={sensor} points={points} loading={chartLoading} error={chartError} onRetry={reload} />;
}
