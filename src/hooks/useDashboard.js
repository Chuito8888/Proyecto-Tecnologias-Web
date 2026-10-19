//Lógica del Dashboard
//No hay un endpoint para el Dashboard, así que combinamos sensores, centros, intervenciones y mediciones
//Todo se ordena para que lo crítico (y el oxígeno más bajo) aparezca primero
import { useState, useEffect } from "react";
import { getToken } from "./useAuth";

const API_URL = import.meta.env.VITE_API_URL;
const REFRESCO_MS = 60000; // El Dashboard se recarga solo cada 1 minuto, como un monitor en vivo

//Helper para llamar a la API con el token
async function apiFetch(ruta, opciones = {}) {
    const response = await fetch(`${API_URL}${ruta}`, {
        ...opciones,
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            ...opciones.headers,
        },
    });
    if (response.status === 401) {
        throw new Error("Tu sesión expiró, vuelve a iniciar sesión.");
    }
    if (!response.ok) {
        throw new Error("No se pudieron cargar los datos del Dashboard.");
    }
    return response.json();
}

//La API trabaja en hora de Chile y sin "Z" al final, ej: "2026-10-18T14:05:00"
function horaChile(fecha) {
    return fecha.toLocaleString('sv-SE', { timeZone: 'America/Santiago' }).replace(' ', 'T');
}

function fechaMs(fecha) {
    return fecha ? new Date(fecha).getTime() : 0;
}

//Pasa un sensor de la API al formato que usan los componentes
function toSensor(sensor, nombresCentros, sensoresConIntervencion) {
    return {
        sensorId: sensor.id,
        sensorName: sensor.sensor_name ?? `Sensor ${sensor.id}`,
        siteId: sensor.site_id,
        siteName: nombresCentros[sensor.site_id] ?? `Centro ${sensor.site_id}`,
        status: sensor.status,
        depth: sensor.depth,
        lastValue: sensor.last_reading?.value,
        lastAt: sensor.last_reading?.at,
        min: sensor.oxygen_min,
        max: sensor.oxygen_max,
        hasOpenIntervention: sensoresConIntervencion.has(sensor.id),
    };
}

//Orden de prioridad: fuera de rango (oxígeno más bajo primero), luego sin transmitir
//(el que lleva más tiempo sin datos primero) y al final los que funcionan bien
const PRIORIDAD = { out_of_range: 0, no_data: 1, ok: 2 };

function porCriticidad(a, b) {
    if (PRIORIDAD[a.status] !== PRIORIDAD[b.status]) {
        return PRIORIDAD[a.status] - PRIORIDAD[b.status];
    }
    if (a.status === 'no_data') {
        return fechaMs(a.lastAt) - fechaMs(b.lastAt);
    }
    return (a.lastValue ?? Infinity) - (b.lastValue ?? Infinity);
}

export function useDashboard() {
    const [counts, setCounts] = useState({ noData: 0, outOfRange: 0, ok: 0, sites: 0 });
    const [sensors, setSensors] = useState([]); // Todos los sensores, ya ordenados por criticidad
    const [sites, setSites] = useState([]);
    const [trends, setTrends] = useState({}); // Oxígeno promedio por hora de los sensores en alerta, para los minigráficos
    const [recentInterventions, setRecentInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [reload, setReload] = useState(0);

    //Para el gráfico: se guarda a qué sensor pertenecen los puntos para saber si siguen cargando
    const [selectedId, setSelectedId] = useState(null);
    const [chart, setChart] = useState({ sensorId: null, points: [] });

    //Carga principal: tarjetas, alertas e intervenciones. Se repite cada REFRESCO_MS
    useEffect(() => {
        let cancelado = false;

        async function cargar() {
            try {
                const [fuera, sinDatos, ok, centros, abiertas, cerradas] = await Promise.all([
                    apiFetch(`/sensors?status=out_of_range&page_size=100`),
                    apiFetch(`/sensors?status=no_data&page_size=100`),
                    apiFetch(`/sensors?status=ok&page_size=100`),
                    apiFetch(`/sites?page_size=100`),
                    apiFetch(`/interventions?status=open&page_size=100`),
                    apiFetch(`/interventions?status=closed&page_size=5`),
                ]);
                if (cancelado) return;

                const nombresCentros = {};
                centros.data.forEach((c) => { nombresCentros[c.id] = c.name; });

                const sensoresConIntervencion = new Set(
                    abiertas.data.filter((i) => i.sensor_id).map((i) => i.sensor_id)
                );

                const todos = [...fuera.data, ...sinDatos.data, ...ok.data]
                    .map((s) => toSensor(s, nombresCentros, sensoresConIntervencion))
                    .sort(porCriticidad);

                const nombresSensores = {};
                todos.forEach((s) => { nombresSensores[s.sensorId] = s.sensorName; });

                //Tendencia de las últimas 24 h (promedio por hora) solo de los centros con alertas
                //Si esta parte falla el Dashboard sigue funcionando, solo sin minigráficos
                const centrosConAlerta = [...new Set(todos.filter((s) => s.status !== 'ok').map((s) => s.siteId))];
                const resumenes = await Promise.all(
                    centrosConAlerta.map((id) =>
                        apiFetch(`/measurements/overview?site_id=${id}&bucket=hour&days=1`).catch(() => ({ data: [] }))
                    )
                );
                if (cancelado) return;
                const tendencias = {};
                resumenes.forEach((resumen) => resumen.data.forEach((s) => {
                    tendencias[s.sensor_id] = s.points.map((p) => ({ hora: p.bucket.slice(11, 16), valor: p.oxygen_avg }));
                }));

                //Las abiertas primero (trabajo pendiente) y se completa con las últimas cerradas
                const ultimas = [...abiertas.data, ...cerradas.data].slice(0, 5).map((i) => ({
                    id: i.id,
                    target: (nombresCentros[i.site_id] ?? `Centro ${i.site_id}`)
                        + (i.sensor_id ? ` · ${nombresSensores[i.sensor_id] ?? `Sensor ${i.sensor_id}`}` : ''),
                    reason: i.reason,
                    status: i.status,
                    createdAt: i.created_at,
                }));

                setCounts({
                    noData: sinDatos.meta.totalCount,
                    outOfRange: fuera.meta.totalCount,
                    ok: ok.meta.totalCount,
                    sites: centros.meta.totalCount,
                });
                setSensors(todos);
                setSites(centros.data);
                setTrends(tendencias);
                setRecentInterventions(ultimas);
                setError(null);
                setUpdatedAt(new Date());
            } catch (err) {
                if (!cancelado) setError(err.message);
            } finally {
                if (!cancelado) setLoading(false);
            }
        }

        cargar();
        const intervalo = setInterval(cargar, REFRESCO_MS);
        return () => {
            cancelado = true;
            clearInterval(intervalo);
        };
    }, [reload]);

    //Si el usuario no eligió un sensor, se muestra el más crítico (y su centro)
    const selected = sensors.find((s) => s.sensorId === selectedId) ?? sensors[0] ?? null;
    const selectedSensorId = selected?.sensorId;

    //Resumen de cada centro para el mapa y el perfil: sus sensores y cuántos hay en cada estado
    const centers = sites.map((site) => {
        const propios = sensors.filter((s) => s.siteId === site.id);
        return {
            id: site.id,
            name: site.name,
            area: site.area,
            active: site.active,
            latitude: site.latitude,
            longitude: site.longitude,
            sensors: propios,
            outOfRange: propios.filter((s) => s.status === 'out_of_range').length,
            noData: propios.filter((s) => s.status === 'no_data').length,
            ok: propios.filter((s) => s.status === 'ok').length,
        };
    });
    const selectedCenter = centers.find((c) => c.id === selected?.siteId) ?? null;

    //Al elegir un centro se selecciona su sensor más crítico (la lista ya viene ordenada)
    const selectCenter = (siteId) => {
        const masCritico = sensors.find((s) => s.siteId === siteId);
        if (masCritico) setSelectedId(masCritico.sensorId);
    };

    //Mediciones de las últimas 24 h del sensor del gráfico (se refrescan junto con lo demás)
    useEffect(() => {
        if (!selectedSensorId) return;
        let cancelado = false;

        const desde = horaChile(new Date(Date.now() - 24 * 60 * 60 * 1000));
        apiFetch(`/measurements?sensor_id=${selectedSensorId}&from=${desde}&page_size=1000`)
            .then((json) => {
                if (cancelado) return;
                //La API manda lo más nuevo primero, el gráfico va de izquierda (antiguo) a derecha (nuevo)
                const puntos = [...json.data].reverse().map((m) => ({
                    hora: m.timestamp.slice(11, 16),
                    fecha: m.timestamp.replace('T', ' ').slice(0, 16),
                    valor: m.oxygen,
                    temperatura: m.temperature,
                }));
                setChart({ sensorId: selectedSensorId, points: puntos });
            })
            .catch(() => {
                if (!cancelado) setChart({ sensorId: selectedSensorId, points: [] });
            });

        return () => { cancelado = true; };
    }, [selectedSensorId, updatedAt]);

    //Solo se muestra "cargando" al cambiar de sensor; en la recarga automática se mantienen los puntos anteriores
    const chartLoading = Boolean(selectedSensorId) && chart.sensorId !== selectedSensorId;
    const points = chartLoading ? [] : chart.points;

    //Abre una intervención desde el panel de alertas y recarga el Dashboard
    const openIntervention = async (alerta, motivo) => {
        const response = await fetch(`${API_URL}/interventions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`,
            },
            body: JSON.stringify({
                site_id: alerta.siteId,
                sensor_id: alerta.sensorId,
                reason: motivo,
            }),
        });
        if (!response.ok) {
            throw new Error("No se pudo abrir la intervención. Inténtalo de nuevo.");
        }
        setReload((prev) => prev + 1);
    };

    return {
        counts, loading, error, updatedAt,
        alerts: sensors.filter((s) => s.status !== 'ok'),
        sensors, selected, setSelectedId, points, chartLoading, trends,
        centers, selectedCenter, selectCenter,
        recentInterventions,
        openIntervention,
        refresh: () => setReload((prev) => prev + 1),
    };
}
