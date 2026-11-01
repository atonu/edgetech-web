'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Minus, Phone, Plus, Wrench } from 'lucide-react';
import { ServiceItemDto, servicesApi } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import { Spinner } from '@/components/ui/Spinner';
import styles from './services.module.css';

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItemDto[]>([]);
  const [units, setUnits] = useState<Record<number, number>>({});
  const [unitDrafts, setUnitDrafts] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    servicesApi.getAll()
      .then(res => setServices(res.data ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const setServiceUnits = (serviceId: number, value: number) => {
    const safeValue = Math.floor(Math.max(1, Math.min(10000, value)));
    setUnits(prev => ({ ...prev, [serviceId]: safeValue }));
    setUnitDrafts(prev => ({ ...prev, [serviceId]: String(safeValue) }));
  };

  const toggleDescription = (serviceId: number) => {
    setExpanded(prev => prev.includes(serviceId)
      ? prev.filter(id => id !== serviceId)
      : [...prev, serviceId]);
  };

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.heading}>
          <span className="section-label"><Wrench size={14} /> EdgeTech Services</span>
          <h1>Services built around <span className="gradient-text">your needs</span></h1>
          <p>Expert support and installation services from the EdgeTech team.</p>
        </div>

        {loading ? (
          <div className={styles.loading}><Spinner size={24} /></div>
        ) : error ? (
          <div className={styles.empty}>We couldn’t load services. Please refresh to try again.</div>
        ) : services.length === 0 ? (
          <div className={styles.empty}>There are no services available right now.</div>
        ) : (
          <div className={styles.list}>
            {services.map(service => {
              const quantity = units[service.id] ?? 1;
              const isExpanded = expanded.includes(service.id);
              const imageUrl = getImageUrl(service.images?.[0]);
              return (
                <article className={styles.card} key={service.id}>
                  <div className={styles.banner}>
                    {imageUrl ? (
                      <Image src={imageUrl} alt={service.name} fill sizes="(max-width: 768px) 100vw, 1100px" className={styles.bannerImage} />
                    ) : <div className={styles.bannerPlaceholder}><Wrench size={36} /></div>}
                    <div className={styles.bannerTitle}>
                      <h2>{service.name}</h2>
                      {service.shortDescription && <p>{service.shortDescription}</p>}
                    </div>
                  </div>
                  <div className={styles.content}>
                    <div className={styles.descriptionPanel}>
                      <div className={`${styles.description} ${!isExpanded ? styles.descriptionClamped : ''}`}>
                        {(service.description || '').split(/\r?\n/).filter(Boolean).map((paragraph, index) => (
                          <p key={`${service.id}-description-${index}`}>{paragraph}</p>
                        ))}
                        {!service.description && <p>Contact us to learn more about this service.</p>}
                      </div>
                      {service.description && (
                        <button type="button" className={styles.seeMore} onClick={() => toggleDescription(service.id)}>
                          {isExpanded ? 'See less' : 'See more'}
                        </button>
                      )}
                    </div>
                    <div className={styles.footer}>
                      <div className={styles.price}>
                        <strong>৳{service.price.toLocaleString()}</strong>
                        <span>{service.isPerUnit ? 'per unit' : 'fixed price'}</span>
                      </div>
                      {service.isPerUnit && (
                        <div className={styles.quantityControl} aria-label={`Units for ${service.name}`}>
                          <button type="button" onClick={() => setServiceUnits(service.id, quantity - 1)} aria-label="Decrease units"><Minus size={16} /></button>
                          <input
                            type="number"
                            min={1}
                            max={10000}
                            value={unitDrafts[service.id] ?? String(quantity)}
                            onChange={event => {
                              const raw = event.target.value;
                              setUnitDrafts(prev => ({ ...prev, [service.id]: raw }));
                              const parsed = Number(raw);
                              if (raw !== '' && Number.isInteger(parsed) && parsed >= 1 && parsed <= 10000) {
                                setUnits(prev => ({ ...prev, [service.id]: parsed }));
                              }
                            }}
                            onBlur={() => {
                              const parsed = Number(unitDrafts[service.id]);
                              setServiceUnits(service.id, Number.isFinite(parsed) && parsed > 0 ? parsed : quantity);
                            }}
                            aria-label="Number of units"
                          />
                          <button type="button" onClick={() => setServiceUnits(service.id, quantity + 1)} aria-label="Increase units"><Plus size={16} /></button>
                          <span className={styles.lineTotal}>৳{(service.price * quantity).toLocaleString()}</span>
                        </div>
                      )}
                      <div className={styles.actions}>
                        <a className={styles.contactButton} href="tel:+8801329661250"><Phone size={16} /> Call for info</a>
                        <button
                          type="button"
                          className={styles.orderButton}
                          onClick={() => {
                            const draft = Number(unitDrafts[service.id]);
                            const selectedUnits = Number.isFinite(draft) && draft > 0
                              ? Math.floor(Math.max(1, Math.min(10000, draft)))
                              : quantity;
                            router.push(`/checkout?serviceId=${service.id}&units=${selectedUnits}`);
                          }}
                        >
                          {service.isPerUnit ? 'Next' : 'Order service'} <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
