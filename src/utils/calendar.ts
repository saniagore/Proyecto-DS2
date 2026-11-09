import type { Actividad } from '../types/activity';

export interface DiaCalendario {
  fecha: Date;
  iso: string;
  perteneceAlMes: boolean;
}

export function fechaAISO(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function crearDiasCalendario(mes: Date): DiaCalendario[] {
  const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const añoMes = inicioMes.getFullYear();
  const numeroMes = inicioMes.getMonth();
  const inicio = new Date(inicioMes);
  // Lunes como primer día de la semana.
  inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));

  return Array.from({ length: 42 }, (_, index) => {
    const fecha = new Date(inicio);
    fecha.setDate(inicio.getDate() + index);
    return {
      fecha,
      iso: fechaAISO(fecha),
      perteneceAlMes: fecha.getFullYear() === añoMes && fecha.getMonth() === numeroMes,
    };
  });
}

export function agruparActividadesPorFecha(actividades: Actividad[]): Record<string, Actividad[]> {
  return actividades.reduce<Record<string, Actividad[]>>((porFecha, actividad) => {
    if (actividad.fecha) {
      (porFecha[actividad.fecha] ??= []).push(actividad);
    }
    return porFecha;
  }, {});
}
