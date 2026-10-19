//consulta centros y sensores para construir el estado de cada centro
import { useEffect, useState } from 'react';
import { getToken } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

export function useSites() {
	const [sites, setSites] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let cancelado = false;

		async function cargar() {
			try {
				const headers = { Authorization: `Bearer ${getToken()}` };
				const [sitesResponse, sensorsResponse] = await Promise.all([
					fetch(`${API_URL}/sites?page_size=100`, { headers }),
					fetch(`${API_URL}/sensors?page_size=100`, { headers }),
				]);

				if (!sitesResponse.ok || !sensorsResponse.ok) {
					throw new Error('No se pudieron cargar los centros.');
				}

				const [sitesJson, sensorsJson] = await Promise.all([
					sitesResponse.json(),
					sensorsResponse.json(),
				]);
				if (cancelado) return;

				const sensoresPorCentro = {};
				sensorsJson.data.forEach((sensor) => {
					(sensoresPorCentro[sensor.site_id] ??= []).push(sensor);
				});

				setSites(sitesJson.data.map((site) => {
					const sensors = sensoresPorCentro[site.id] ?? [];
					const outOfRange = sensors.filter((sensor) => sensor.status === 'out_of_range').length;
					const noData = sensors.filter((sensor) => sensor.status === 'no_data').length;
					const ok = sensors.filter((sensor) => sensor.status === 'ok').length;

					return {
						...site,
						sensors,
						outOfRange,
						noData,
						ok,
						problemCount: outOfRange + noData,
					};
				}));
				setError(null);
			} catch (err) {
				if (!cancelado) setError(err.message);
			} finally {
				if (!cancelado) setLoading(false);
			}
		}

		cargar();
		return () => { cancelado = true; };
	}, []);

	return { sites, loading, error };
}