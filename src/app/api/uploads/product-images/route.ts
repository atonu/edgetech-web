import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5217';
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'product-images');
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

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return NextResponse.json({ url: `/product-images/${filename}` });
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
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // already gone — nothing to clean up
  }

  return NextResponse.json({ ok: true });
}
