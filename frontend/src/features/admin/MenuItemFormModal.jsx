import { useState } from 'react';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { menuApi } from '../../api/menuApi';
import { toMessage } from '../../api/client';

const blank = { categoryId: '', name: '', description: '', price: '', available: true };

export default function MenuItemFormModal({ item, categories, onClose, onSaved }) {
  const editing = Boolean(item);
  const [form, setForm] = useState(
    item
      ? {
          categoryId: item.categoryId,
          name: item.name,
          description: item.description || '',
          price: item.price,
          available: item.available,
        }
      : { ...blank, categoryId: categories[0]?.id ?? '' },
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        categoryId: Number(form.categoryId),
        name: form.name,
        description: form.description,
        price: Number(form.price),
        available: form.available,
      };
      if (editing) await menuApi.updateItem(item.id, payload);
      else await menuApi.createItem(payload);
      onSaved();
    } catch (err) {
      setError(toMessage(err, 'Could not save the item'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={editing ? 'Edit item' : 'New item'} onClose={onClose}>
      <form className="space-y-4" onSubmit={submit}>
        {error && <Alert type="error">{error}</Alert>}
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.categoryId} onChange={update('categoryId')} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Name</label>
          <input className="input" required value={form.name} onChange={update('name')} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows="2" value={form.description} onChange={update('description')} />
        </div>
        <div>
          <label className="label">Price</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={form.price}
            onChange={update('price')}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
          />
          Available
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
