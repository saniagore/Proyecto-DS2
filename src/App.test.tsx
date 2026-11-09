import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import App from './App';

const path = vi.hoisted(() => ({ value: '/login' }));

vi.mock('./hooks/useRouter', () => ({
  useRouter: () => ({ path: path.value, navigate: vi.fn() }),
}));
vi.mock('./layouts/RouterProvider', () => ({
  RouterProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('./layouts/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('./layouts/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('./pages/LoginPage', () => ({ LoginPage: () => <span>login page</span> }));
vi.mock('./pages/RegisterPage', () => ({ RegisterPage: () => <span>register page</span> }));
vi.mock('./pages/DashboardPage', () => ({ DashboardPage: () => <span>dashboard page</span> }));

describe('App', () => {
  it.each([
    ['/login', 'login page'],
    ['/registro', 'register page'],
    ['/panel', 'dashboard page'],
    ['/ruta-no-definida', 'login page'],
  ])('renderiza la página para %s', (route, page) => {
    path.value = route;
    render(<App />);
    expect(screen.getByText(page)).toBeDefined();
  });
});
