//Mapa de centros: cada centro se ubica con su latitud y longitud de la API
//El marcador es un anillo que muestra qué parte de sus sensores está en cada estado,
//al centro va la cantidad de sensores con problemas y los centros con alertas "laten"
//Al tocar un centro se muestra su detalle más abajo

import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

//Arma el ícono del centro con HTML (Leaflet no usa componentes de React para los íconos)
function iconoCentro(centro, seleccionado) {
  const total = centro.sensors.length || 1;
  const gFuera = (centro.outOfRange / total) * 360;
  const gSin = gFuera + (centro.noData / total) * 360;
  const anillo = `conic-gradient(#e9b949 0deg ${gFuera}deg, #e57373 ${gFuera}deg ${gSin}deg, #54867d ${gSin}deg 360deg)`;
  const problemas = centro.outOfRange + centro.noData;
  const tamano = seleccionado ? 54 : 42;
  const colorPulso = centro.outOfRange ? '#e9b949' : '#e57373';

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
  return partes.join(' · ');
}

export function SitesMap({ centers, selectedId, onSelect }) {
  const conCoordenadas = centers.filter((c) => c.latitude !== null && c.longitude !== null);

  return (
    <section className="relative h-full min-h-[24rem] overflow-hidden rounded-2xl bg-[#eceeed] shadow-lg">
      {conCoordenadas.length === 0 ? (
        <p className="p-5 text-gray-500">Cargando mapa...</p>
      ) : (
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

      {/* Título y leyenda encima del mapa */}
      <div className="pointer-events-none absolute right-4 top-4 z-[500] rounded-xl bg-[#124045]/90 px-4 py-2 text-right text-white shadow-md">
        <h2 className="font-bold">Mapa de centros</h2>
        <p className="text-xs text-[#c8d1d9]">Toca un centro para ver su detalle</p>
      </div>
      <div className="pointer-events-none absolute bottom-6 left-4 z-[500] flex flex-wrap gap-3 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-black shadow-md">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#e9b949]" />Fuera de rango</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#e57373]" />Sin transmitir</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#54867d]" />Bien</span>
      </div>
    </section>
  );
}
