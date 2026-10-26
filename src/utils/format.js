//Helpers para mostrar datos de la API de forma legible

//Paleta de los estados de un sensor, compartida por todo el Dashboard (los mismos colores del Canva)
//chip: insignia con fondo, texto: número destacado, color: punto/anillo, linea: trazo del minigráfico
//El amarillo y el rosado no están en el tema, por eso se definen solo aquí
export const ESTADOS_SENSOR = {
  out_of_range: {
    label: 'Fuera de rango',
    chip: 'bg-[#f7d77a] text-[#5a4100]',
    texto: 'text-[#855c00]',
    color: '#e9b949',
    linea: '#c98a00',
  },
  no_data: {
    label: 'Sin transmitir',
    chip: 'bg-[#f4a3a3] text-[#6e1c1c]',
    texto: 'text-danger',
    color: '#e57373',
    linea: '#e57373',
  },
  ok: {
    label: 'Buen funcionamiento',
    chip: 'bg-surface text-brand-dark',
    texto: 'text-brand-dark',
    color: '#54867d',
    linea: '#54867d',
  },
};

//Mensaje común cuando la primera carga falla y no hay datos que mostrar
export const MENSAJE_SIN_DATOS = 'No se pudieron cargar los datos';

//Formatea el oxígeno con coma decimal, como se escribe en Chile
export function formatOxygen(valor) {
  if (valor === null || valor === undefined) return '—';
  return `${Number(valor).toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mg/L`;
}

//Convierte una fecha en algo como "hace 3 h"
export function timeAgo(fecha) {
  if (!fecha) return 'sin registros';
  const minutos = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  if (minutos < 1) return 'recién';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 48) return `hace ${horas} h`;
  return `hace ${Math.floor(horas / 24)} días`;
}

//La API manda las fechas en hora de Chile, ej: "2026-10-18T14:05:00" -> "18-10 14:05"
export function formatDate(fecha) {
  if (!fecha) return '';
  const [dia, hora] = fecha.split('T');
  const [, mes, d] = dia.split('-');
  return `${d}-${mes} ${hora.slice(0, 5)}`;
}
