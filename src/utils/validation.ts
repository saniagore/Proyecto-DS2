export function validarEmail(email: string): string | null {
  const correo = email.trim();
  const posicionArroba = correo.indexOf('@');
  const ultimoArroba = correo.lastIndexOf('@');
  const posicionPunto = correo.lastIndexOf('.');
  const correoValido =
    posicionArroba > 0 &&
    posicionArroba === ultimoArroba &&
    posicionPunto > posicionArroba + 1 &&
    posicionPunto < correo.length - 1 &&
    !/\s/.test(correo);

  if (!email || !email.trim()) {
    return 'Escribe un correo válido, como ana@correo.com.';
  }
  if (!correoValido) {
    return 'Escribe un correo válido, como ana@correo.com.';
  }
  return null;
}

export function validarPassword(password: string): string | null {
  if (!password || password.length < 6) {
    return 'La contraseña necesita al menos 6 caracteres.';
  }
  return null;
}

export function validarNombre(nombre: string): string | null {
  if (!nombre || !nombre.trim()) {
    return 'El nombre es obligatorio.';
  }
  return null;
}

export function validarCoincidenciaPasswords(p1: string, p2: string): string | null {
  if (p1 !== p2) {
    return 'Las contraseñas no coinciden.';
  }
  return null;
}
