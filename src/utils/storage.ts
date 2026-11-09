/**
 * Guardamos un objeto o valor en localStorage serializándolo a JSON.
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Error guardando ${key} en localStorage:`, error);
    return false;
  }
}

/**
 * Se obtiene y parsea un objeto desde localStorage. Si falla o no existe, retorna el valor por defecto.
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error leyendo ${key} de localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Elimina un elemento de localStorage.
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error eliminando ${key} de localStorage:`, error);
  }
}