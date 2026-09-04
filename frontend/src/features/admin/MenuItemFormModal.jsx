import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { menuApi } from '../../api/menuApi';
import { toMessage } from '../../api/client';
import { uploadedImageUrl } from '../../lib/foodImages';
import { validateName, validatePrice, fieldClass } from '../../lib/validate';
import useFieldErrors from '../../hooks/useFieldErrors';
import FieldError from '../../components/FieldError';

const blank = { categoryId: '', name: '', description: '', price: '', available: true };

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

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

  const errs = useFieldErrors({
    name: () => validateName(form.name),
    price: () => validatePrice(form.price),
  });

  // Photo state: the existing photo URL, a newly picked file, and whether to remove.
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(editing ? uploadedImageUrl(item) : null);
  const [removePhoto, setRemovePhoto] = useState(false);

  // Build/tear down an object URL for the locally-picked file preview.
  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    errs.clear(field);
  };

  const pickFile = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (!ACCEPTED.includes(picked.type)) {
      setError('Photo must be a JPEG, PNG or WebP image');
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError('Photo must be 2 MB or smaller');
      return;
    }
    setError('');
    setRemovePhoto(false);
    setFile(picked);
  };

  const clearPhoto = () => {
    setFile(null);
    setPreviewUrl(null);
    setRemovePhoto(editing && item.hasImage);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!errs.validateAll()) return;
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
      const saved = editing
        ? await menuApi.updateItem(item.id, payload)
        : await menuApi.createItem(payload);

      // Photo is a separate multipart call once we have an item id.
      if (file) await menuApi.uploadItemImage(saved.id, file);
      else if (removePhoto) await menuApi.deleteItemImage(saved.id);

      onSaved();
    } catch (err) {
      setError(toMessage(err, 'Could not save the item'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={editing ? 'Edit item' : 'New item'} onClose={onClose}>
      <form className="space-y-4" onSubmit={submit} noValidate>
        {error && <Alert type="error">{error}</Alert>}
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.categoryId} onChange={update('categoryId')}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Name</label>
          <input
            className={fieldClass(errs.errors.name)}
            value={form.name}
            onChange={update('name')}
            onBlur={errs.blur('name')}
          />
          <FieldError>{errs.errors.name}</FieldError>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows="2" value={form.description} onChange={update('description')} />
        </div>
        <div>
          <label className="label">Price</label>
          <input
            className={fieldClass(errs.errors.price)}
            type="number"
            step="0.01"
            min="0.01"
            value={form.price}
            onChange={update('price')}
            onBlur={errs.blur('price')}
          />
          <FieldError>{errs.errors.price}</FieldError>
        </div>

        <div>
          <label className="label">Photo</label>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
              {previewUrl ? (
                <img src={previewUrl} alt="Item preview" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-2xl text-stone-300">🍽️</div>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={pickFile}
                className="block text-sm text-stone-600 file:mr-3 file:rounded-lg file:border file:border-stone-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:border-ink"
              />
              {previewUrl && (
                <button type="button" className="text-sm text-red-500 hover:underline" onClick={clearPhoto}>
                  Remove photo
                </button>
              )}
              <p className="text-xs text-stone-400">JPEG, PNG or WebP · up to 2 MB</p>
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-stone-700">
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
