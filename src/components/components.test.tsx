import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { Card } from './Card';
import { Column } from './Column';
import { Input } from './Input';
import { Link } from './Link';
import { Tag } from './Tag';
import { TaskCard } from './TaskCard';
import type { Actividad } from '../types/activity';

const navigate = vi.fn();

vi.mock('../hooks/useRouter', () => ({
  useRouter: () => ({ path: '/', navigate }),
}));

const actividad: Actividad = {
  id: 'actividad-1',
  titulo: 'Preparar entrega',
  descripcion: 'Revisar el documento final',
  categoria: 'Estudio',
  fecha: '2026-11-02',
  estado: 'proximo',
};

const callbacks = {
  onCambiarEstado: vi.fn(),
  onEliminar: vi.fn(),
  onEditar: vi.fn().mockResolvedValue(undefined),
};

describe('componentes reutilizables', () => {
  it('renderiza variantes de controles y mensajes de entrada', () => {
    render(
      <>
        <Button variant="danger" size="lg" fullWidth>
          Eliminar
        </Button>
        <Card as="section" animateEnter padding="sm">
          Contenido
        </Card>
        <Input label="Correo" helperText="Usa tu correo institucional" required />
        <Input label="Nombre" error="El nombre es obligatorio." />
        <Tag variant="accent" dot>
          Importante
        </Tag>
      </>
    );

    expect(screen.getByRole('button', { name: 'Eliminar' }).className).toContain(
      'rumbo-button--full-width'
    );
    expect(screen.getByText('Contenido').className).toContain('animate-enter');
    expect(screen.getByText('Usa tu correo institucional')).toBeDefined();
    expect(screen.getByRole('alert').textContent).toContain('El nombre es obligatorio.');
    expect(screen.getByText('Importante').className).toContain('rumbo-tag--accent');
  });

  it('navega con enlaces internos y respeta enlaces modificados', () => {
    render(
      <Link
        href="/dashboard"
        onClick={(event) => {
          if (event.ctrlKey) event.preventDefault();
        }}
      >
        Dashboard
      </Link>
    );
    const link = screen.getByRole('link', { name: 'Dashboard' });

    fireEvent.click(link);
    expect(navigate).toHaveBeenCalledWith('/dashboard');

    fireEvent.click(link, { ctrlKey: true });
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('muestra una columna vacía y una columna con actividades', () => {
    render(
      <>
        <Column id="proximo" titulo="Pendientes" actividades={[]} {...callbacks} />
        <Column id="progreso" titulo="En progreso" actividades={[actividad]} {...callbacks} />
      </>
    );

    expect(screen.getByText('Nada por aquí. Mueve una actividad a este estado.')).toBeDefined();
    expect(screen.getByText('Preparar entrega')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar actividad: Preparar entrega' }));
    expect(callbacks.onCambiarEstado).toHaveBeenCalledWith('actividad-1', 'progreso');
  });

  it('edita una actividad y valida campos requeridos', async () => {
    render(<TaskCard actividad={actividad} {...callbacks} />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar actividad: Preparar entrega' }));
    fireEvent.change(screen.getByRole('textbox', { name: /Título/ }), { target: { value: '' } });
    fireEvent.change(screen.getByDisplayValue('2026-11-02'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen.getByText('Escribe el título de la actividad.')).toBeDefined();
    expect(screen.getByText('Elige una fecha límite.')).toBeDefined();

    fireEvent.change(screen.getByRole('textbox', { name: /Título/ }), {
      target: { value: 'Entrega final' },
    });
    fireEvent.change(screen.getByLabelText(/Fecha límite/), {
      target: { value: '2026-11-10' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(callbacks.onEditar).toHaveBeenCalled());
  });
});
