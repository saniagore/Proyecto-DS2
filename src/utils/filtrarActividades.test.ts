import { describe, expect, it } from 'vitest';
import { filtrarActividades, type Actividad, type Filtros } from './filtrarActividades';

describe('filtrarActividades', () => {
  const mockActividades: Actividad[] = [
    {
      id: '1',
      titulo: 'Entregar informe de sprint',
      materia: 'Desarrollo de Software II',
      estado: 'pendiente',
      prioridad: 'alta',
    },
    {
      id: '2',
      titulo: 'Repasar consultas SQL',
      materia: 'Bases de Datos',
      estado: 'en_progreso',
      prioridad: 'media',
    },
    {
      id: '3',
      titulo: 'Corregir bugs de autenticación',
      materia: 'Desarrollo de Software II',
      estado: 'en_progreso',
      prioridad: 'alta',
    },
    {
      id: '4',
      titulo: 'Preparar exposición final',
      materia: 'Arquitectura de Computadores',
      estado: 'en_progreso',
      prioridad: 'alta',
    },
    {
      id: '5',
      titulo: 'Leer capítulo de redes',
      materia: 'Redes',
      estado: 'completada',
      prioridad: 'baja',
    },
  ];

  it('filtra correctamente las actividades cuando se le pasa un estado y una prioridad', () => {
    const filtros: Filtros = {
      estado: 'en_progreso',
      prioridad: 'alta',
    };

    const resultado = filtrarActividades(mockActividades, filtros);

    expect(resultado).toHaveLength(2);
    expect(resultado).toEqual([
      {
        id: '3',
        titulo: 'Corregir bugs de autenticación',
        materia: 'Desarrollo de Software II',
        estado: 'en_progreso',
        prioridad: 'alta',
      },
      {
        id: '4',
        titulo: 'Preparar exposición final',
        materia: 'Arquitectura de Computadores',
        estado: 'en_progreso',
        prioridad: 'alta',
      },
    ]);
  });

  it('filtra correctamente combinando materia, estado y prioridad', () => {
    const filtros: Filtros = {
      materia: 'Desarrollo de Software II',
      estado: 'en_progreso',
      prioridad: 'alta',
    };

    const resultado = filtrarActividades(mockActividades, filtros);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('3');
  });

  it('retorna todas las actividades cuando no hay filtros activos', () => {
    const resultado = filtrarActividades(mockActividades, {});

    expect(resultado).toHaveLength(mockActividades.length);
    expect(resultado).toEqual(mockActividades);
  });
});
