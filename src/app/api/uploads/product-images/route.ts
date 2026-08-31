import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'http://edgetech-api-container:5001'
    : 'http://localhost:5001');

function getProductImageDir(): string {
  const candidates = [
    path.resolve(process.cwd(), 'public', 'product-images'),
    path.resolve(process.cwd(), 'edgetech-web', 'public', 'product-images'),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  // Default to candidate 0 and create it
  return candidates[0];
}

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const FILENAME_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/i;

function parseJwtRole(authHeader: string): string | null {
  try {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return (
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload['role'] ||
      payload['Role'] ||
      null
    );
  } catch {
    return null;
  }
}

async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const auth = request.headers.get('authorization');
  if (!auth) return false;

  // 1. Direct JWT token claim inspection
  const role = parseJwtRole(auth);
  if (role === 'Admin') return true;

  // 2. Fallback to API verification
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: auth } });
    if (res.ok) {
      const user = await res.json();
      if (user?.role === 'Admin') return true;
    }
  } catch {
    // If backend cannot be reached, fallback if role exists
  }
  return false;
}

async function convertToWebP(rawBuffer: Buffer): Promise<{ buffer: Buffer; isWebp: boolean }> {
  try {
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default || sharpModule;
    const webpBuffer = await sharp(rawBuffer)
      .webp({ quality: 85, effort: 4 })
      .toBuffer();
    return { buffer: webpBuffer, isWebp: true };
  } catch (err) {
    console.warn('[Upload WebP] Server sharp conversion skipped/unsupported on current runtime:', err);
    return { buffer: rawBuffer, isWebp: false };
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'No file provided' }, { status: 400 });
  }

  const rawExt = path.extname(file.name).toLowerCase() || ALLOWED_TYPES[file.type] || '.jpg';
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: 'Image must be 12MB or smaller' }, { status: 400 });
  }

  try {
    const uploadDir = getProductImageDir();
    await mkdir(uploadDir, { recursive: true });
    
    const uuid = crypto.randomUUID();
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    let finalBuffer: Buffer | Uint8Array = rawBuffer;
    let filename: string;

    // If client already converted to WebP
    if (file.type === 'image/webp' || rawExt === '.webp') {
      filename = `${uuid}.webp`;
      finalBuffer = rawBuffer;
    } else {
      // Attempt server-side WebP conversion
      const { buffer, isWebp } = await convertToWebP(rawBuffer);
      finalBuffer = buffer;
      filename = isWebp ? `${uuid}.webp` : `${uuid}${rawExt}`;
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, finalBuffer);

    // Sync to alternative directory if exists
    const altDir = uploadDir.includes('edgetech-web')
      ? uploadDir.replace('edgetech-web' + path.sep, '')
      : path.join(process.cwd(), 'public', 'product-images');
    if (existsSync(altDir) && altDir !== uploadDir) {
      try {
        await writeFile(path.join(altDir, filename), finalBuffer);
      } catch {}
    }

    console.log(`[Upload Success] Saved image as ${filename} (${finalBuffer.length} bytes)`);
    return NextResponse.json({ url: `/product-images/${filename}` });
  } catch (error) {
    console.error(`[Upload] Error:`, error);
    return NextResponse.json({ message: 'Upload failed', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const url = body?.url;
  if (typeof url !== 'string' || !url.startsWith('/product-images/')) {
    return NextResponse.json({ message: 'Invalid url' }, { status: 400 });
  }

  const filename = url.slice('/product-images/'.length);
  if (!FILENAME_PATTERN.test(filename)) {
    return NextResponse.json({ message: 'Invalid url' }, { status: 400 });
  }

  try {
    const uploadDir = getProductImageDir();
    await unlink(path.join(uploadDir, filename));
  } catch {
    // already gone — nothing to clean up
  }

  return NextResponse.json({ ok: true });
}
