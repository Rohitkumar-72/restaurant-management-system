import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { tableService } from '../services/tableService.js';

const TableContext = createContext(null);
const STORAGE_KEY = 'sapphire-vista-table';

const readStoredTable = () => {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export function TableProvider({ children }) {
  const location = useLocation();
  const [table, setTable] = useState(readStoredTable);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const identifier = params.get('table');
    if (!identifier) return;
    let active = true;
    setLoading(true);
    setError('');
    tableService.validate(identifier)
      .then((validated) => {
        if (!active) return;
        setTable(validated);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
      })
      .catch((requestError) => {
        if (!active) return;
        setTable(null);
        sessionStorage.removeItem(STORAGE_KEY);
        setError(requestError.message || 'Unable to validate table');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [location.search]);

  const clearTable = () => {
    setTable(null);
    setError('');
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({
    table,
    loading,
    error,
    clearTable,
  }), [table, loading, error]);

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}

export function useTable() {
  const context = useContext(TableContext);
  if (!context) throw new Error('useTable must be used within TableProvider');
  return context;
}
