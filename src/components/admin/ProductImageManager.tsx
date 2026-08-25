'use client';
import { useRef, useState } from 'react';
import { ImagePlus, Star, Trash2 } from 'lucide-react';
import { ProductImageDto } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import styles from './ProductImageManager.module.css';

export interface StagedImage {
  file: File;
  previewUrl: string;
}

interface Props {
  images: ProductImageDto[];
  stagedImages: StagedImage[];
  uploading: boolean;
  busyImageId: number | null;
  onFilesSelected: (files: File[]) => void;
  onRemoveStaged: (index: number) => void;
  onSetPrimary: (imageId: number) => void;
  onDelete: (imageId: number) => void;
}

export default function ProductImageManager({
  images,
  stagedImages,
  uploading,
  busyImageId,
  onFilesSelected,
  onRemoveStaged,
  onSetPrimary,
  onDelete,
}: Props) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onFilesSelected(Array.from(fileList));
  };

  return (
    <div>
      <div
        className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={e => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? <Spinner size={22} /> : <ImagePlus size={22} className={styles.dropzoneIcon} />}
        <div>{uploading ? 'Uploading…' : 'Drag & drop images here, or click to browse'}</div>
        <div className={styles.dropzoneHint}>JPEG, PNG, WEBP, or GIF — up to 8MB each</div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {(images.length > 0 || stagedImages.length > 0) && (
        <div className={styles.grid}>
          {images.map(img => (
            <div key={img.id} className={styles.thumb}>
              {img.isPrimary && <span className={styles.primaryBadge}>Primary</span>}
              {/* eslint-disable-next-line @next/next/no-img-element -- local admin thumbnail grid, not worth next/image config here */}
              <img src={img.imageUrl} alt="" />
              <div className={styles.thumbActions}>
                <button
                  type="button"
                  title={img.isPrimary ? 'Primary image' : 'Set as primary'}
                  disabled={busyImageId === img.id}
                  onClick={() => onSetPrimary(img.id)}
                >
                  {busyImageId === img.id ? <Spinner size={14} /> : <Star size={14} className={img.isPrimary ? styles.starActive : ''} fill={img.isPrimary ? 'currentColor' : 'none'} />}
                </button>
                <button
                  type="button"
                  title="Delete image"
                  disabled={busyImageId === img.id}
                  onClick={() => onDelete(img.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {stagedImages.map((staged, i) => (
            <div key={`staged-${i}`} className={`${styles.thumb} ${styles.thumbPending}`}>
              {i === 0 && images.length === 0 && <span className={styles.primaryBadge}>Primary</span>}
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview URL, next/image can't optimize it anyway */}
              <img src={staged.previewUrl} alt="" />
              <div className={styles.thumbActions}>
                <button type="button" title="Remove" onClick={() => onRemoveStaged(i)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
