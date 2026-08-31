import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5217';

function getProductImageDir(): string {
  const directPath = path.resolve(process.cwd(), 'public', 'product-images');
  if (existsSync(directPath)) {
    return directPath;
  }
  const nestedPath = path.resolve(process.cwd(), 'edgetech-web', 'public', 'product-images');
  if (existsSync(nestedPath)) {
    return nestedPath;
  }
  return directPath;
}

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const FILENAME_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/;

async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const auth = request.headers.get('authorization');
  if (!auth) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: auth } });
    if (!res.ok) return false;
    const user = await res.json();
    return user?.role === 'Admin';
  } catch {
    return false;
  }
}

import sharp from 'sharp';

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'No file provided' }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json({ message: 'Only JPEG, PNG, WEBP, or GIF images are allowed' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: 'Image must be 8MB or smaller' }, { status: 400 });
  }

  try {
    const uploadDir = getProductImageDir();
    await mkdir(uploadDir, { recursive: true });
    
    // Always convert and save as modern WebP
    const filename = `${crypto.randomUUID()}.webp`;
    const filepath = path.join(uploadDir, filename);
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    let webpBuffer: Buffer;
    try {
      webpBuffer = await sharp(rawBuffer)
        .webp({ quality: 85, effort: 4 })
        .toBuffer();
    } catch {
      webpBuffer = rawBuffer;
    }

    await writeFile(filepath, webpBuffer);
    console.log(`[Upload] Saved WebP image: ${filepath} (${webpBuffer.length} bytes)`);
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
