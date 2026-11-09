import { useContext } from 'react';
import { RouterContext } from './RouterContext';

export function useRouter() {
  return useContext(RouterContext);
}
