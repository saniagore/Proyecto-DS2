import { createContext } from 'react';

export interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

export const RouterContext = createContext<RouterContextType>({
  path: window.location.pathname || '/login',
  navigate: () => {},
});
