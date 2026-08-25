import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filename = pathSegments ? pathSegments.join('/') : '';

    if (!filename || filename.includes('..') || filename.startsWith('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const baseDir = getProductImageDir();
    const filepath = path.resolve(path.join(baseDir, filename));

    if (!filepath.startsWith(baseDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    try {
      await stat(filepath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const buffer = await readFile(filepath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[Product Image Route] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
