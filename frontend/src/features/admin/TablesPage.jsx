import { useEffect, useState } from 'react';
import { tableApi } from '../../api/tableApi';
import { toMessage } from '../../api/client';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import TableFormModal from './TableFormModal';

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // table | 'new' | null

  const load = async () => {
    setLoading(true);
    try {
      setTables(await tableApi.list());
      setError('');
    } catch (e) {
      setError(toMessage(e, 'Failed to load tables'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (table) => {
    if (!window.confirm(`Delete table ${table.label}? This also removes its past reservation history.`)) {
      return;
    }
    try {
      await tableApi.remove(table.id);
      await load();
    } catch (e) {
      setError(toMessage(e, 'Could not delete the table'));
    }
  };

  const totalSeats = tables.reduce((sum, t) => sum + t.seats, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Tables</h1>
          {!loading && (
            <p className="mt-1 text-sm text-stone-500">
              {tables.length} {tables.length === 1 ? 'table' : 'tables'} · {totalSeats} seats total
            </p>
          )}
        </div>
        <button className="btn-primary" onClick={() => setEditing('new')}>
          + New table
        </button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Spinner label="Loading tables…" />
      ) : tables.length === 0 ? (
        <p className="py-10 text-center text-stone-500">
          No tables yet. Add tables so guests can book them.
        </p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3">Table</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {tables.map((t) => (
                <tr key={t.id} className="transition hover:bg-stone-50/70">
                  <td className="px-4 py-3 font-medium">{t.label}</td>
                  <td className="px-4 py-3">{t.seats}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-stone-600 hover:underline" onClick={() => setEditing(t)}>
                        Edit
                      </button>
                      <button className="text-red-500 hover:underline" onClick={() => remove(t)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <TableFormModal
          table={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
