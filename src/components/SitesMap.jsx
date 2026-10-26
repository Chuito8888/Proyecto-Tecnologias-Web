//Mapa de centros: cada centro se ubica con su latitud y longitud de la API
//El marcador es un anillo que muestra qué parte de sus sensores está en cada estado,
//al centro va la cantidad de sensores con problemas y los centros con alertas "laten"
//Al tocar un centro se muestra su detalle más abajo

import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ESTADOS_SENSOR, MENSAJE_SIN_DATOS } from '../utils/format';

//Colores de la leyenda (los mismos del anillo de cada marcador)
const { out_of_range: FUERA, no_data: SIN, ok: OK } = ESTADOS_SENSOR;
const LEYENDA = [FUERA, SIN, OK];

//Arma el ícono del centro con HTML (Leaflet no usa componentes de React para los íconos)
function iconoCentro(centro, seleccionado) {
  const total = centro.sensors.length || 1;
  const gFuera = (centro.outOfRange / total) * 360;
  const gSin = gFuera + (centro.noData / total) * 360;
  const anillo = `conic-gradient(${FUERA.color} 0deg ${gFuera}deg, ${SIN.color} ${gFuera}deg ${gSin}deg, ${OK.color} ${gSin}deg 360deg)`;
  const problemas = centro.outOfRange + centro.noData;
  const tamano = seleccionado ? 54 : 42;
  const colorPulso = centro.outOfRange ? FUERA.color : SIN.color;

  const html = `
    <div class="relative flex items-center justify-center" style="width:${tamano}px;height:${tamano}px">
      ${problemas ? `<span class="absolute inset-0 animate-ping rounded-full" style="background:${colorPulso};opacity:.5"></span>` : ''}
      <span class="relative flex h-full w-full items-center justify-center rounded-full shadow-lg"
        style="background:${anillo};${seleccionado ? 'outline:3px solid #124045;outline-offset:2px;' : ''}${centro.active ? '' : 'filter:grayscale(.6);'}">
        <span class="flex items-center justify-center rounded-full bg-white text-sm font-extrabold"
          style="width:62%;height:62%;color:#124045">${problemas || '✓'}</span>
      </span>
    </div>`;

  return L.divIcon({ html, className: '', iconSize: [tamano, tamano], iconAnchor: [tamano / 2, tamano / 2] });
}

//Texto del resumen de un centro, ej: "2 fuera de rango · 2 bien"
function resumen(centro) {
  const partes = [];
  if (centro.outOfRange) partes.push(`${centro.outOfRange} fuera de rango`);
  if (centro.noData) partes.push(`${centro.noData} sin transmitir`);
  if (centro.ok) partes.push(`${centro.ok} bien`);
  return partes.join(' · ') || 'Sin sensores';
}

export function SitesMap({ centers, selectedId, onSelect, loading = false, sinDatos = false }) {
  const conCoordenadas = centers.filter((c) => c.latitude !== null && c.longitude !== null);

  return (
    <section className="card flex h-full min-h-[26rem] flex-col overflow-hidden p-0 max-lg:min-h-0" aria-busy={loading}>
      {/* Encabezado de la tarjeta con su leyenda (en pantallas angostas: más compacto y mapa de 260 px) */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 pb-3 max-lg:items-end max-lg:px-4 max-lg:pt-4 max-lg:pb-2">
        <div>
          <h2 className="card-title">Mapa de centros</h2>
          <p className="text-sm text-gray-600">Selecciona un centro para ver su detalle</p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-gray-700 max-lg:gap-x-3" aria-label="Leyenda del mapa">
          {LEYENDA.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full ring-2 ring-white" style={{ backgroundColor: l.color }} aria-hidden="true" />
              {l.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative min-h-[20rem] flex-1 border-t border-brand-gray max-lg:h-[260px] max-lg:min-h-0 max-lg:flex-none">
        {/* Cargando: bloque gris que late */}
        {loading && conCoordenadas.length === 0 && (
          <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-brand-gray/50">
            <span className="text-sm font-medium text-gray-600">Cargando mapa…</span>
          </div>
        )}

        {/* La carga falló y no hay centros */}
        {!loading && sinDatos && conCoordenadas.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-brand-gray/30 p-6 text-center">
            <p className="font-semibold text-gray-700">{MENSAJE_SIN_DATOS}</p>
            <p className="text-sm text-gray-600">El mapa se mostrará cuando se recupere la conexión.</p>
          </div>
        )}

        {/* Sin centros con ubicación */}
        {!loading && !sinDatos && conCoordenadas.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/60 p-6 text-center">
            <p className="font-semibold text-brand-dark">No hay centros para mostrar en el mapa</p>
            <p className="text-sm text-gray-600">Los centros sin coordenadas registradas no aparecen aquí.</p>
          </div>
        )}

        {conCoordenadas.length > 0 && (
          <MapContainer
            bounds={conCoordenadas.map((c) => [c.latitude, c.longitude])}
            boundsOptions={{ padding: [60, 60] }}
            scrollWheelZoom={false}
            className="absolute inset-0 z-0"
          >
            {/* Mapa base gris claro de Esri: gratuito con atribución y combina con la paleta */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap"
              maxZoom={16}
            />
            {conCoordenadas.map((c) => (
              <Marker
                key={c.id}
                position={[c.latitude, c.longitude]}
                icon={iconoCentro(c, c.id === selectedId)}
                zIndexOffset={c.id === selectedId ? 1000 : 0}
                title={c.name}
                eventHandlers={{ click: () => onSelect(c.id) }}
              >
                <Tooltip direction="top" offset={[0, -26]}>
                  <strong>{c.name}</strong> · {c.area}{c.active ? '' : ' (inactivo)'}
                  <br />
                  {resumen(c)}
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </section>
  );
}
