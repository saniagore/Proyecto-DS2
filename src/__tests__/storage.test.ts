import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';

describe('Pruebas unitarias para storage.ts', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('setStorageItem', () => {
    it('debe guardar un objeto correctamente en localStorage', () => {
      const data = { id: 1, name: 'Tarea de prueba' };
      const result = setStorageItem('test_key', data);

      expect(result).toBe(true);
      expect(localStorage.getItem('test_key')).toBe(JSON.stringify(data));
    });

    it('debe retornar false si ocurre un error al serializar', () => {
      const circularRef: any = {};
      circularRef.myself = circularRef;

      const result = setStorageItem('circular_key', circularRef);
      expect(result).toBe(false);
    });
  });

  describe('getStorageItem', () => {
    it('debe obtener y parsear un valor existente', () => {
      const data = { role: 'admin' };
      localStorage.setItem('user_session', JSON.stringify(data));

      const result = getStorageItem('user_session', { role: 'guest' });
      expect(result).toEqual(data);
    });

    it('debe retornar el valor por defecto si la clave no existe', () => {
      const result = getStorageItem('non_existing_key', 'default_value');
      expect(result).toBe('default_value');
    });

    it('debe retornar el valor por defecto si el JSON almacenado está corrupto', () => {
      localStorage.setItem('corrupted_key', '{ invalid json ');

      const result = getStorageItem('corrupted_key', 'fallback');
      expect(result).toBe('fallback');
    });
  });

  describe('removeStorageItem', () => {
    it('debe eliminar la clave de localStorage', () => {
      localStorage.setItem('key_to_delete', 'val');
      removeStorageItem('key_to_delete');

      expect(localStorage.getItem('key_to_delete')).toBeNull();
    });
  });
});