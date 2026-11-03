import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Link } from '../components/Link';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from '../hooks/useRouter';
import type { UsoPrincipal } from '../types/auth';
import {
  validarCoincidenciaPasswords,
  validarEmail,
  validarNombre,
  validarPassword,
} from '../utils/validation';
import './RegisterPage.css';

const OPCIONES_USO: { id: UsoPrincipal; label: string }[] = [
  { id: 'Trabajo', label: 'Trabajo' },
  { id: 'Estudio', label: 'Estudio' },
  { id: 'Personal', label: 'Personal' },
];

export const RegisterPage: React.FC = () => {
  const { registro } = useAuth();
  const { navigate } = useRouter();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usoPrincipal, setUsoPrincipal] = useState<UsoPrincipal>('Trabajo');

  const [errores, setErrores] = useState<{
    nombre?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errorNombre = validarNombre(nombre);
    const errorEmail = validarEmail(email);
    const errorPassword = validarPassword(password);
    const errorMatch = validarCoincidenciaPasswords(password, confirmPassword);

    if (errorNombre || errorEmail || errorPassword || errorMatch) {
      setErrores({
        nombre: errorNombre || undefined,
        email: errorEmail || undefined,
        password: errorPassword || undefined,
        confirmPassword: errorMatch || undefined,
      });
      return;
    }

    setErrores({});
    setEnviando(true);

    try {
      await registro({
        nombre,
        email,
        password,
        usoPrincipal,
      });
      navigate('/panel');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Ocurrió un error al crear la cuenta.';
      // Si el error es de rate limit, lo ponemos como error general (no de campo)
      if (mensaje.toLowerCase().includes('espera') || mensaje.toLowerCase().includes('intento')) {
        setErrores({ general: mensaje });
      } else {
        setErrores({ email: mensaje });
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="rumbo-register-layout">
      <div className="rumbo-register-container">
        {/* Cabecera centrada */}
        <header className="rumbo-register-header">
          <div className="rumbo-brand-logo" aria-label="Logo Rumbo">
            <span className="rumbo-brand-logo__mark" aria-hidden="true">
              ■
            </span>
            <span className="rumbo-brand-logo__text">Rumbo</span>
          </div>

          <h1 className="rumbo-register-title">Crea tu cuenta en un minuto</h1>
          <p className="rumbo-register-subtitle">
            Sin tarjeta. Empiezas con tres columnas listas para usar.
          </p>
        </header>

        {/* Tarjeta de Formulario centrada (máx 560px) */}
        <Card className="rumbo-register-card" animateEnter padding="lg">
          <form onSubmit={handleSubmit} noValidate className="rumbo-register-form">
            <div className="rumbo-form-grid">
              <Input
                id="register-nombre"
                label="Nombre"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Ana García"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errores.nombre) setErrores((prev) => ({ ...prev, nombre: undefined }));
                }}
                error={errores.nombre}
                required
              />

              <Input
                id="register-email"
                label="Correo electrónico"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="ana@correo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errores.email) setErrores((prev) => ({ ...prev, email: undefined }));
                }}
                error={errores.email}
                required
              />

              <Input
                id="register-password"
                label="Contraseña"
                type="password"
                name="new-password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errores.password) setErrores((prev) => ({ ...prev, password: undefined }));
                }}
                error={errores.password}
                required
              />

              <Input
                id="register-confirm-password"
                label="Repetir contraseña"
                type="password"
                name="confirm-password"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errores.confirmPassword) {
                    setErrores((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                error={errores.confirmPassword}
                required
              />
            </div>

            {/* Selector de uso con botones de radio accesibles */}
            <fieldset className="rumbo-usage-group">
              <legend className="rumbo-usage-legend">¿Para qué la usarás?</legend>
              <div
                className="rumbo-usage-options"
                role="radiogroup"
                aria-label="Finalidad de uso principal"
              >
                {OPCIONES_USO.map((opcion) => {
                  const estaSeleccionado = usoPrincipal === opcion.id;
                  const radioId = `uso-${opcion.id.toLowerCase()}`;

                  return (
                    <label
                      key={opcion.id}
                      htmlFor={radioId}
                      className={`rumbo-usage-option ${
                        estaSeleccionado ? 'rumbo-usage-option--selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        id={radioId}
                        name="usoPrincipal"
                        value={opcion.id}
                        checked={estaSeleccionado}
                        onChange={() => setUsoPrincipal(opcion.id)}
                        className="rumbo-usage-input-native"
                      />
                      <span className="rumbo-usage-label-text">{opcion.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={enviando}>
              {enviando ? 'Creando cuenta…' : 'Crear mi cuenta'}
            </Button>

            {errores.general && (
              <p className="rumbo-form-error-general" role="alert">
                {errores.general}
              </p>
            )}

            <div className="rumbo-form-footer">
              <span className="rumbo-form-footer__text">¿Ya tienes cuenta?</span>{' '}
              <Link href="/login" className="rumbo-form-link">
                Iniciar sesión
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
};
