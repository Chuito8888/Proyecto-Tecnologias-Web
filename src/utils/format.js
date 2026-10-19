//Helpers para mostrar datos de la API de forma legible

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
