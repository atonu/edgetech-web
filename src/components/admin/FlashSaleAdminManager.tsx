'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HeroCarouselDto, heroCarouselApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn';
import styles from './FlashSaleAdminManager.module.css';

export default function FlashSaleAdminManager() {
  const [carousel, setCarousel] = useState<HeroCarouselDto | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    heroCarouselApi.get()
      .then(response => {
        setCarousel(response.data);
        setEnabled(response.data.flashSaleEnabled ?? true);
      })
      .catch(error => toast.error(error instanceof Error ? error.message : 'Could not load homepage settings'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!carousel) return;
    const nextEnabled = event.target.checked;
    setSaving(true);
    try {
      const response = await heroCarouselApi.update({ ...carousel, flashSaleEnabled: nextEnabled });
      setCarousel(response.data);
      setEnabled(response.data.flashSaleEnabled);
      toast.success(`Flash Sale ${response.data.flashSaleEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update Flash Sale');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage Flash Sale</CardTitle>
        <CardDescription>Control the Flash Sale banner, hero deal panel, and mobile Hot Deals section.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading homepage settings…</p> : !carousel ? <p>Homepage settings could not be loaded.</p> : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <label className={styles.setting}>
              <input
                type="checkbox"
                checked={enabled}
                onChange={toggle}
                disabled={saving}
                role="switch"
                aria-checked={enabled}
              />
              <span className={styles.slider} aria-hidden="true" />
              <span className={styles.status}>{saving ? 'Saving…' : enabled ? 'Flash Sale is enabled' : 'Flash Sale is disabled'}</span>
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
