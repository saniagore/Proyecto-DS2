import React, { useEffect, useState, useTransition } from 'react';
import { RouterContext } from '../hooks/RouterContext';

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(() => {
    const current = window.location.pathname;
    return current === '/' ? '/login' : current;
  });
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handlePopState = () => {
      startTransition(() => {
        setPath(window.location.pathname || '/login');
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
      startTransition(() => {
        setPath(to);
      });
      window.scrollTo(0, 0);
    }
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
};
