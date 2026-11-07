import { describe, expect, it } from 'vitest';
import { agruparActividadesPorFecha, crearDiasCalendario } from './calendar';
import { crearResumen } from './report';
import type { Actividad } from '../types/activity';

const actividades: Actividad[] = [
  { id: '1', titulo: 'Entrega', categoria: 'Estudio', fecha: '2026-11-10', estado: 'proximo' },
  { id: '2', titulo: 'Revision', categoria: 'Trabajo', fecha: '2026-11-10', estado: 'progreso' },
  { id: '3', titulo: 'Archivo', categoria: 'Personal', fecha: null, estado: 'finalizado' },
];

describe('utilidades de calendario y reporte', () => {
  it('crea una cuadrícula estable de seis semanas empezando en lunes', () => {
    const dias = crearDiasCalendario(new Date(2026, 10, 1));
    expect(dias).toHaveLength(42);
    expect(dias[0].fecha.getDay()).toBe(1);
    expect(dias.some((dia) => dia.iso === '2026-11-01')).toBe(true);
  });

  it('agrupa entregas por su fecha límite e ignora las que no tienen fecha', () => {
    const porFecha = agruparActividadesPorFecha(actividades);
    expect(porFecha['2026-11-10']).toHaveLength(2);
    expect(Object.values(porFecha).flat()).toHaveLength(2);
  });

  it('calcula el resumen que se incluye en el PDF', () => {
    expect(crearResumen(actividades)).toEqual({
      total: 3,
      pendientes: 1,
      enProgreso: 1,
      completadas: 1,
      sinFecha: 1,
    });
  });
});
