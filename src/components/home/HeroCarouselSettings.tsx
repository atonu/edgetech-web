'use client';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle, ArrowDown, ArrowUp, Check, ImagePlus, Loader2, Pencil, Trash2, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import {
  HERO_MIN_SLIDES, HeroCarouselDto, HeroSlideDto, heroCarouselApi, productImagesApi,
} from '@/lib/api';
import styles from './HeroCarouselSettings.module.css';

/** The hero frame is ~21:9 on desktop, so anything squarer gets cropped top and bottom. */
const RECOMMENDED_RATIO = '21:9';
const RECOMMENDED_SIZE = '1800 × 780 px';

interface Props {
  carousel: HeroCarouselDto;
  onSaved: (updated: HeroCarouselDto) => void;
}

export default function HeroCarouselSettings({ carousel, onSaved }: Props) {
  const { user, isHydrated } = useAuthStore();
  const isAdmin = isHydrated && user?.role === 'Admin';

  const [open, setOpen] = useState(false);
  const [slides, setSlides] = useState<HeroSlideDto[]>([]);
  const [autoplaySec, setAutoplaySec] = useState(6);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  if (!isAdmin) return null;

  const openModal = () => {
    setSlides(carousel.slides.map(s => ({ ...s })));
    setAutoplaySec(Math.round((carousel.autoplayMs || 6000) / 1000));
    setOpen(true);
  };

  const closeModal = () => {
    if (saving || uploading) return;
    setOpen(false);
  };

  const patchSlide = (index: number, patch: Partial<HeroSlideDto>) => {
    setSlides(prev => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const move = (index: number, dir: -1 | 1) => {
    setSlides(prev => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeSlide = (index: number) => {
    setSlides(prev => (prev.length <= HERO_MIN_SLIDES ? prev : prev.filter((_, i) => i !== index)));
  };

  /** Uploads convert to WebP client-side, then again server-side — same path as product images. */
  const uploadFiles = async (files: FileList): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const { url } = await productImagesApi.upload(file);
      urls.push(url);
    }
    return urls;
  };

  const handleAdd = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await uploadFiles(files);
      setSlides(prev => [
        ...prev,
        ...urls.map((url, i) => ({
          imageUrl: url,
          title: '',
          subtitle: '',
          cta: '',
          ctaLink: '/products',
          order: prev.length + i,
        })),
      ]);
      toast.success(`${urls.length} image${urls.length === 1 ? '' : 's'} uploaded as WebP`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
      if (addInputRef.current) addInputRef.current.value = '';
    }
  };

  const handleReplace = async (files: FileList | null) => {
    const index = replaceIndexRef.current;
    if (!files?.length || index === null) return;
    setUploading(true);
    try {
      const [url] = await uploadFiles(files);
      patchSlide(index, { imageUrl: url });
      toast.success('Slide image replaced');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
      replaceIndexRef.current = null;
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (slides.length < HERO_MIN_SLIDES) {
      toast.error(`The carousel needs at least ${HERO_MIN_SLIDES} slides.`);
      return;
    }
    if (slides.some(s => !s.imageUrl)) {
      toast.error('Every slide needs an image.');
      return;
    }

    setSaving(true);
    try {
      const res = await heroCarouselApi.update({
        slides: slides.map((s, i) => ({ ...s, order: i })),
        autoplayMs: Math.min(30000, Math.max(2000, autoplaySec * 1000)),
      });

      // Drop files for slides that were removed, so the image volume doesn't grow forever.
      const keptUrls = new Set(res.data.slides.map(s => s.imageUrl));
      const orphaned = carousel.slides
        .map(s => s.imageUrl)
        .filter(url => url.startsWith('/product-images/') && !keptUrls.has(url));
      await Promise.allSettled(orphaned.map(url => productImagesApi.remove(url)));

      onSaved(res.data);
      toast.success('Carousel updated');
      setOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr?.response?.data?.message || 'Failed to save carousel');
    } finally {
      setSaving(false);
    }
  };

  const belowMinimum = slides.length < HERO_MIN_SLIDES;
  const busy = saving || uploading;

  return (
    <>
      <button type="button" className={styles.editBtn} onClick={openModal} title="Edit carousel settings">
        <Pencil size={12} />
        Edit Carousel
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div className={styles.backdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <div>
                <div className={styles.headerTitle}>Carousel Settings</div>
                <div className={styles.headerSubtitle}>
                  Use <span className={styles.ratioPill}>{RECOMMENDED_RATIO}</span> landscape images
                  (about {RECOMMENDED_SIZE}). Images are cropped to fill the frame, so keep the
                  subject centred. Uploads are converted to WebP automatically. The carousel shows one
                  slide per image, and needs at least {HERO_MIN_SLIDES}.
                </div>
              </div>
              <button type="button" className={styles.closeBtn} onClick={closeModal} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className={styles.body}>
              {belowMinimum && (
                <div className={styles.warn}>
                  <AlertTriangle size={15} style={{ flex: 'none', marginTop: 1 }} />
                  <span>
                    At least {HERO_MIN_SLIDES} slides are required. Add {HERO_MIN_SLIDES - slides.length} more
                    before saving.
                  </span>
                </div>
              )}

              {slides.map((slide, index) => (
                <div key={slide.id ?? `new-${index}`} className={styles.slideCard}>
                  <div>
                    <div className={styles.thumbWrap}>
                      {slide.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin preview thumbnail
                        <img src={slide.imageUrl} alt="" className={styles.thumb} />
                      ) : (
                        <div className={styles.thumbEmpty}><ImagePlus size={20} /></div>
                      )}
                    </div>
                    <button
                      type="button"
                      className={styles.replaceBtn}
                      disabled={busy}
                      onClick={() => {
                        replaceIndexRef.current = index;
                        replaceInputRef.current?.click();
                      }}
                    >
                      Replace image
                    </button>
                  </div>

                  <div className={styles.fields}>
                    <div>
                      <label className={styles.label}>Headline</label>
                      <textarea
                        className={styles.textarea}
                        rows={2}
                        value={slide.title}
                        onChange={e => patchSlide(index, { title: e.target.value })}
                        placeholder="Secure Your World&#10;With Smart Surveillance"
                      />
                      <div className={styles.hint}>
                        Press Enter for a line break — the second line is shown in the accent colour.
                      </div>
                    </div>

                    <div>
                      <label className={styles.label}>Subtitle</label>
                      <input
                        className={styles.input}
                        value={slide.subtitle}
                        onChange={e => patchSlide(index, { subtitle: e.target.value })}
                        placeholder="Short supporting line"
                      />
                    </div>

                    <div className={styles.fieldRow}>
                      <div>
                        <label className={styles.label}>Button label</label>
                        <input
                          className={styles.input}
                          value={slide.cta}
                          onChange={e => patchSlide(index, { cta: e.target.value })}
                          placeholder="Shop CCTV Cameras"
                        />
                      </div>
                      <div>
                        <label className={styles.label}>Button link</label>
                        <input
                          className={styles.input}
                          value={slide.ctaLink}
                          onChange={e => patchSlide(index, { ctaLink: e.target.value })}
                          placeholder="/products?category=ip-cameras"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.slideTools}>
                    <span className={styles.slideIndex}>#{index + 1}</span>
                    <button
                      type="button" className={styles.toolBtn} title="Move up"
                      disabled={index === 0 || busy} onClick={() => move(index, -1)}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button" className={styles.toolBtn} title="Move down"
                      disabled={index === slides.length - 1 || busy} onClick={() => move(index, 1)}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.toolBtn} ${styles.toolBtnDanger}`}
                      title={slides.length <= HERO_MIN_SLIDES
                        ? `At least ${HERO_MIN_SLIDES} slides are required`
                        : 'Remove slide'}
                      disabled={slides.length <= HERO_MIN_SLIDES || busy}
                      onClick={() => removeSlide(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <div className={styles.addRow}>
                <button
                  type="button"
                  className={styles.addBtn}
                  disabled={busy}
                  onClick={() => addInputRef.current?.click()}
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                  {uploading ? 'Uploading…' : 'Add slides'}
                </button>
                <span>
                  {slides.length} slide{slides.length === 1 ? '' : 's'} · select multiple files to add
                  several at once
                </span>
              </div>

              <input
                ref={addInputRef} type="file" accept="image/*" multiple hidden
                onChange={e => handleAdd(e.target.files)}
              />
              <input
                ref={replaceInputRef} type="file" accept="image/*" hidden
                onChange={e => handleReplace(e.target.files)}
              />
            </div>

            <div className={styles.footer}>
              <label className={styles.autoplayField}>
                Slide interval
                <input
                  type="number" min={2} max={30} className={styles.autoplayInput}
                  value={autoplaySec}
                  onChange={e => setAutoplaySec(Number(e.target.value) || 6)}
                />
                seconds
              </label>
              <div className={styles.footerActions}>
                <button type="button" className={styles.btnCancel} onClick={closeModal} disabled={busy}>
                  Cancel
                </button>
                <button
                  type="button" className={styles.btnSave}
                  onClick={handleSave} disabled={busy || belowMinimum}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
