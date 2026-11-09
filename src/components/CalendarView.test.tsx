import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CalendarView } from './CalendarView';
import type { Actividad } from '../types/activity';

const actividadesMock: Actividad[] = [
  {
    id: '1',
    titulo: 'Entrega Final',
    categoria: 'Estudio',
    fecha: '2026-11-10',
    estado: 'proximo',
  },
  {
    id: '2',
    titulo: 'Revisión Sprint',
    categoria: 'Trabajo',
    fecha: '2026-11-10',
    estado: 'progreso',
  },
  {
    id: '3',
    titulo: 'Tarea Extra',
    categoria: 'Personal',
    fecha: '2026-11-10',
    estado: 'finalizado',
  },
];

describe('CalendarView', () => {
  it('renderiza la cabecera y el calendario correctamente', () => {
    render(<CalendarView actividades={actividadesMock} />);
    expect(screen.getByText('Calendario de entregas')).toBeDefined();
    expect(
      screen.getByText('Consulta las fechas límite y selecciona un día para ver sus actividades.')
    ).toBeDefined();
  });

  it('permite cambiar de mes usando los botones de mes anterior y siguiente', () => {
    render(<CalendarView actividades={actividadesMock} />);
    const botonMesAnterior = screen.getByLabelText('Mes anterior');
    const botonMesSiguiente = screen.getByLabelText('Mes siguiente');

    fireEvent.click(botonMesAnterior);
    fireEvent.click(botonMesSiguiente);
    fireEvent.click(botonMesSiguiente);
  });

  it('muestra las actividades del día seleccionado y el texto de más actividades cuando hay más de dos', () => {
    render(<CalendarView actividades={actividadesMock} />);
    const botones = screen.getAllByRole('button');
    const botonDia10 = botones.find((b) => b.getAttribute('aria-label')?.includes('10 de '));

    if (botonDia10) {
      fireEvent.click(botonDia10);
      expect(screen.getByText('Entrega Final - Pendiente')).toBeDefined();
      expect(screen.getByText('Revisión Sprint - En progreso')).toBeDefined();
      expect(screen.getByText('+1 más')).toBeDefined();
    }
  });

  it('muestra mensaje cuando no hay entregas en la fecha seleccionada', () => {
    render(<CalendarView actividades={[]} />);
    expect(screen.getByText('No hay entregas para esta fecha.')).toBeDefined();
  });
});
