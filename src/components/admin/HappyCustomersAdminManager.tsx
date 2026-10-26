'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { HappyCustomerDto, happyCustomersApi, productImagesApi } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@/components/ui/shadcn';

export default function HappyCustomersAdminManager() {
  const [customers, setCustomers] = useState<HappyCustomerDto[]>([]);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    const response = await happyCustomersApi.getForAdmin();
    return response.data;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCustomers(await fetchCustomers());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load customer entries');
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers]);

  useEffect(() => {
    fetchCustomers()
      .then(setCustomers)
      .catch(error => toast.error(error instanceof Error ? error.message : 'Could not load customer entries'))
      .finally(() => setLoading(false));
  }, [fetchCustomers]);

  const resetForm = () => {
    setName('');
    setImageUrl('');
    setEditingId(null);
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await productImagesApi.upload(file);
      setImageUrl(result.url);
      toast.success('Customer image uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !imageUrl) {
      toast.error('Customer name and image are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        imageUrl,
        displayOrder: editingId
          ? customers.find(customer => customer.id === editingId)?.displayOrder ?? customers.length
          : customers.length,
        isActive: true,
      };
      if (editingId) await happyCustomersApi.update(editingId, payload);
      else await happyCustomersApi.create(payload);
      await load();
      resetForm();
      toast.success(editingId ? 'Customer updated' : 'Customer added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save customer');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (customer: HappyCustomerDto) => {
    if (!window.confirm(`Remove ${customer.name} from Happy Customers?`)) return;
    try {
      await happyCustomersApi.delete(customer.id);
      setCustomers(current => current.filter(item => item.id !== customer.id));
      if (editingId === customer.id) resetForm();
      toast.success('Customer removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not remove customer');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(0, 2fr)', gap: 20 }}>
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit customer' : 'Add happy customer'}</CardTitle>
          <CardDescription>Entries appear in the left-to-right homepage carousel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} style={{ display: 'grid', gap: 14 }}>
            <div>
              <Label htmlFor="customer-name">Name</Label>
              <Input id="customer-name" value={name} onChange={event => setName(event.target.value)} required />
            </div>
            <div>
              <Label htmlFor="customer-image">Image</Label>
              <Input
                id="customer-image"
                type="file"
                accept="image/*"
                onChange={event => void uploadImage(event.target.files?.[0])}
                disabled={uploading}
              />
              {uploading && <small>Uploading image…</small>}
              {imageUrl && (
                <div style={{ position: 'relative', width: 100, height: 100, marginTop: 10 }}>
                  <Image src={getImageUrl(imageUrl)!} alt={name || 'Customer preview'} fill sizes="100px" style={{ objectFit: 'cover', borderRadius: 10 }} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="submit" loading={saving || uploading} disabled={uploading || !imageUrl}>
                {editingId ? <Pencil size={15} /> : <Plus size={15} />}
                {editingId ? 'Save changes' : 'Add customer'}
              </Button>
              {editingId && <Button type="button" variant="secondary" onClick={resetForm}><X size={15} /> Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer entries</CardTitle>
          <CardDescription>{customers.length} entries</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading customer entries…</p> : customers.length === 0 ? <p>No happy customers added yet.</p> : (
            <div style={{ display: 'grid', gap: 10 }}>
              {customers.map(customer => (
                <div key={customer.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, border: '1px solid var(--color-glass-border)', borderRadius: 10 }}>
                  <div style={{ position: 'relative', width: 56, height: 56, flex: 'none' }}>
                    <Image src={getImageUrl(customer.imageUrl)!} alt={customer.name} fill sizes="56px" style={{ objectFit: 'cover', borderRadius: 8 }} />
                  </div>
                  <strong style={{ flex: 1 }}>{customer.name}</strong>
                  <Button type="button" variant="secondary" onClick={() => {
                    setEditingId(customer.id);
                    setName(customer.name);
                    setImageUrl(customer.imageUrl);
                  }} aria-label={`Edit ${customer.name}`}><Pencil size={15} /></Button>
                  <Button type="button" variant="destructive" onClick={() => void remove(customer)} aria-label={`Remove ${customer.name}`}><Trash2 size={15} /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
