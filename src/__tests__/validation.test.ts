import { describe, expect, it } from 'vitest';
import {
  validarCoincidenciaPasswords,
  validarEmail,
  validarNombre,
  validarPassword,
} from '../utils/validation';

describe('Utilidades de validación', () => {
  it('valida correos electrónicos correctamente', () => {
    expect(validarEmail('ana@correo.com')).toBeNull();
    expect(validarEmail('test.user@sub.dominio.org')).toBeNull();
    expect(validarEmail('')).toBe('Escribe un correo válido, como ana@correo.com.');
    expect(validarEmail('correo-invalido')).toBe('Escribe un correo válido, como ana@correo.com.');
  });

  it('valida longitud de contraseña', () => {
    expect(validarPassword('123456')).toBeNull();
    expect(validarPassword('12345')).toBe('La contraseña necesita al menos 6 caracteres.');
    expect(validarPassword('')).toBe('La contraseña necesita al menos 6 caracteres.');
  });

  it('valida nombre obligatorio', () => {
    expect(validarNombre('Ana')).toBeNull();
    expect(validarNombre('')).toBe('El nombre es obligatorio.');
    expect(validarNombre('   ')).toBe('El nombre es obligatorio.');
  });

  it('valida coincidencia de contraseñas', () => {
    expect(validarCoincidenciaPasswords('clave123', 'clave123')).toBeNull();
    expect(validarCoincidenciaPasswords('clave123', 'otraClave')).toBe(
      'Las contraseñas no coinciden.'
    );
  });
});
