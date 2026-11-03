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
});
