import { describe, expect, it, vi } from 'vitest';
import { exportarResumenPdf } from './report';
import type { Actividad } from '../types/activity';

const mockSave = vi.fn();
const mockSetFillColor = vi.fn();
const mockRect = vi.fn();
const mockSetTextColor = vi.fn();
const mockSetFont = vi.fn();
const mockSetFontSize = vi.fn();
const mockText = vi.fn();
const mockSetDrawColor = vi.fn();
const mockLine = vi.fn();
const mockAddPage = vi.fn();

vi.mock('jspdf', () => {
  return {
    jsPDF: function () {
      return {
        setFillColor: mockSetFillColor,
        rect: mockRect,
        setTextColor: mockSetTextColor,
        setFont: mockSetFont,
        setFontSize: mockSetFontSize,
        text: mockText,
        setDrawColor: mockSetDrawColor,
        line: mockLine,
        addPage: mockAddPage,
        save: mockSave,
      };
    },
  };
});

describe('exportarResumenPdf', () => {
  it('genera y descarga el reporte en PDF con actividades variadas', () => {
    const actividades: Actividad[] = [
      {
        id: '1',
        titulo: 'Tarea corta',
        descripcion: 'Desc',
        categoria: 'Trabajo',
        fecha: '2026-11-15',
        estado: 'proximo',
      },
      {
        id: '2',
        titulo:
          'Tarea en progreso con un nombre extremadamente largo para probar la función de texto seguro que recorta cadenas',
        categoria: 'Estudio',
        fecha: '2026-11-10',
        estado: 'progreso',
      },
      {
        id: '3',
        titulo: 'Tarea completada sin fecha',
        categoria: 'Personal',
        fecha: '',
        estado: 'finalizado',
      },
    ];

    exportarResumenPdf(actividades, 'Santiago Vanegas');

    expect(mockSetFillColor).toHaveBeenCalledWith(255, 176, 0);
    expect(mockRect).toHaveBeenCalledWith(0, 0, 210, 28, 'F');
    expect(mockText).toHaveBeenCalledWith('Rumbo - Resumen de actividades', 16, 17);
    expect(mockSave).toHaveBeenCalled();
  });

  it('genera reporte vacío correctamente cuando la lista está vacía', () => {
    exportarResumenPdf([], 'Santiago');

    expect(mockText).toHaveBeenCalledWith(
      'No hay actividades para incluir en este reporte.',
      16,
      109
    );
    expect(mockSave).toHaveBeenCalled();
  });

  it('crea una nueva página cuando hay muchas actividades superando el límite vertical', () => {
    mockAddPage.mockClear();

    const muchasActividades: Actividad[] = Array.from({ length: 30 }, (_, i) => ({
      id: `act-${i}`,
      titulo: `Actividad de prueba número ${i}`,
      categoria: 'Trabajo',
      fecha: '2026-11-20',
      estado: i % 3 === 0 ? 'proximo' : i % 3 === 1 ? 'progreso' : 'finalizado',
    }));

    exportarResumenPdf(muchasActividades, 'Docente Prueba');

    expect(mockAddPage).toHaveBeenCalled();
    expect(mockText).toHaveBeenCalledWith('Detalle de actividades (continuación)', 16, 20);
    expect(mockSave).toHaveBeenCalled();
  });
});
