/**
 * Formatea la fecha de hoy en español, por ejemplo: «lunes, 2 de noviembre».
 */
export function formatearFechaHoy(date: Date = new Date()): string {
  const formato = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return formato.format(date);
}

/**
 * Formatea una fecha dada (YYYY-MM-DD o Date) en formato corto en español,
 * por ejemplo: «2 nov.».
 */
export function formatearFechaCorta(fechaInput: string | Date): string {
  if (!fechaInput) return '';

  let fecha: Date;
  if (typeof fechaInput === 'string') {
    // Evita desajustes por zona horaria al separar YYYY-MM-DD
    const partes = fechaInput.split('-');
    if (partes.length === 3) {
      fecha = new Date(
        parseInt(partes[0], 10),
        parseInt(partes[1], 10) - 1,
        parseInt(partes[2], 10)
      );
    } else {
      fecha = new Date(fechaInput);
    }
  } else {
    fecha = fechaInput;
  }

  if (isNaN(fecha.getTime())) return String(fechaInput);

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
  }).format(fecha);
}

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD para inicializar inputs de tipo date.
 */
export function obtenerFechaHoyISO(hoy: Date = new Date()): string {
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export type EstadoFechaLimite = 'vencida' | 'hoy' | 'a-tiempo';

/**
 * Indica si una fecha límite (YYYY-MM-DD) ya pasó, vence hoy o sigue a tiempo.
 * Retorna null si la actividad no tiene fecha.
 */
export function evaluarFechaLimite(
  fecha: string | null,
  hoy: Date = new Date()
): EstadoFechaLimite | null {
  if (!fecha) return null;
  const hoyISO = obtenerFechaHoyISO(hoy);
  // Las cadenas YYYY-MM-DD se pueden comparar lexicográficamente
  if (fecha < hoyISO) return 'vencida';
  if (fecha === hoyISO) return 'hoy';
  return 'a-tiempo';
}
