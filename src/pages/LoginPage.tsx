import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Link } from '../components/Link';
import { Tag } from '../components/Tag';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from '../hooks/useRouter';
import { validarEmail, validarPassword } from '../utils/validation';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState<{ email?: string; password?: string }>({});
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errorEmail = validarEmail(email);
    const errorPassword = validarPassword(password);

    if (errorEmail || errorPassword) {
      setErrores({
        email: errorEmail || undefined,
        password: errorPassword || undefined,
      });
      return;
    }

    setErrores({});
    setEnviando(true);

    try {
      await login({ email, password });
      navigate('/panel');
    } catch {
      setErrores({
        email: 'Ocurrió un error al iniciar sesión. Inténtalo de nuevo.',
      });
    } finally {
      setEnviando(false);
    }
  };

  const handleAccesoDemo = async () => {
    setEnviando(true);
    try {
      await login({ email: 'ana@correo.com', password: 'password123' });
      navigate('/panel');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="rumbo-login-layout">
      {/* Columna Izquierda: Panel de Marca */}
      <section className="rumbo-brand-panel" aria-label="Información de Rumbo">
        <header className="rumbo-brand-panel__top">
          <div className="rumbo-brand-logo" aria-label="Logo Rumbo">
            <span className="rumbo-brand-logo__mark" aria-hidden="true">
              ■
            </span>
            <span className="rumbo-brand-logo__text">Rumbo</span>
          </div>
        </header>

        <div className="rumbo-brand-panel__center">
          <h1 className="rumbo-brand-panel__title">Cada actividad, en su lugar.</h1>
          <p className="rumbo-brand-panel__desc">
            Separa lo que viene, lo que haces hoy y lo que ya terminaste.
          </p>
        </div>

        <footer className="rumbo-brand-panel__bottom">
          <div className="rumbo-brand-tags" aria-label="Estados disponibles">
            <Tag variant="proximo" dot>
              Próximos
            </Tag>
            <Tag variant="progreso" dot>
              En progreso
            </Tag>
            <Tag variant="finalizado" dot>
              Finalizados
            </Tag>
          </div>
        </footer>
      </section>

      {/* Columna Derecha: Tarjeta de Formulario */}
      <section className="rumbo-login-form-area" aria-label="Formulario de inicio de sesión">
        <Card className="rumbo-login-card" animateEnter padding="lg">
          <header className="rumbo-form-header">
            <h2 className="rumbo-form-title">Bienvenida de nuevo</h2>
            <p className="rumbo-form-subtitle">Entra para ver tus actividades.</p>
          </header>

          <form onSubmit={handleSubmit} noValidate className="rumbo-form">
            <Input
              id="login-email"
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
              id="login-password"
              label="Contraseña"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errores.password) setErrores((prev) => ({ ...prev, password: undefined }));
              }}
              error={errores.password}
              required
            />

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={enviando}>
              {enviando ? 'Entrando…' : 'Entrar a mi panel'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              fullWidth
              disabled={enviando}
              onClick={handleAccesoDemo}
            >
              Acceso rápido (Demo)
            </Button>

            <div className="rumbo-form-footer">
              <span className="rumbo-form-footer__text">¿Aún no tienes cuenta?</span>{' '}
              <Link href="/registro" className="rumbo-form-link">
                Crear cuenta
              </Link>
            </div>
          </form>
        </Card>
      </section>
    </main>
  );
};
