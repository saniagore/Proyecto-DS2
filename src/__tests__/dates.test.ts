import { describe, expect, it } from 'vitest';
import { evaluarFechaLimite, formatearFechaCorta } from '../utils/dates';

describe('evaluarFechaLimite', () => {
  const hoy = new Date(2026, 10, 3); // 3 de noviembre de 2026

  it('marca como vencida una fecha anterior a hoy', () => {
    expect(evaluarFechaLimite('2026-11-02', hoy)).toBe('vencida');
  });

  it('marca la fecha de hoy', () => {
    expect(evaluarFechaLimite('2026-11-03', hoy)).toBe('hoy');
  });

  it('marca a tiempo una fecha futura', () => {
    expect(evaluarFechaLimite('2026-12-01', hoy)).toBe('a-tiempo');
  });

  it('retorna null si no hay fecha', () => {
    expect(evaluarFechaLimite(null, hoy)).toBeNull();
  });
});

describe('formatearFechaCorta', () => {
  it('formatea YYYY-MM-DD sin desfase de zona horaria', () => {
    expect(formatearFechaCorta('2026-11-02')).toMatch(/^2 nov/);
  });

  it('formatea objetos Date', () => {
    expect(formatearFechaCorta(new Date(2026, 10, 3))).toMatch(/^3 nov/);
  });

  it('devuelve una cadena vacía sin fecha', () => {
    expect(formatearFechaCorta('')).toBe('');
  });

  it('devuelve el valor original cuando la fecha no es válida', () => {
    expect(formatearFechaCorta('fecha-invalida')).toBe('fecha-invalida');
  });
});

describe('formatearFechaHoy y obtenerFechaHoyISO', () => {
  it('formatea la fecha actual en español', async () => {
    const { formatearFechaHoy } = await import('../utils/dates');
    expect(formatearFechaHoy(new Date(2026, 10, 3))).toMatch(/martes, 3 de noviembre/);
  });

  it('obtiene la fecha ISO local con ceros', async () => {
    const { obtenerFechaHoyISO } = await import('../utils/dates');
    expect(obtenerFechaHoyISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
