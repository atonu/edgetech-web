import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

function getProductImageDirs(): string[] {
  return [
    path.resolve(process.cwd(), 'public', 'product-images'),
    path.resolve(process.cwd(), 'edgetech-web', 'public', 'product-images'),
  ];
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

    const baseDirs = getProductImageDirs();
    const parsed = path.parse(filename);
    const candidateExtensions = [
      parsed.ext.toLowerCase(),
      '.webp',
      '.jpg',
      '.png',
      '.jpeg',
      '.gif',
    ];

    let foundPath: string | null = null;

    for (const baseDir of baseDirs) {
      // 1. Direct file test
      const direct = path.resolve(path.join(baseDir, filename));
      if (direct.startsWith(baseDir) && existsSync(direct)) {
        foundPath = direct;
        break;
      }

      // 2. Extension variation test (e.g. .jpg requested but saved as .webp)
      for (const ext of candidateExtensions) {
        const altFilename = parsed.dir ? `${parsed.dir}/${parsed.name}${ext}` : `${parsed.name}${ext}`;
        const altPath = path.resolve(path.join(baseDir, altFilename));
        if (altPath.startsWith(baseDir) && existsSync(altPath)) {
          foundPath = altPath;
          break;
        }
      }

      if (foundPath) break;
    }

    if (!foundPath) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const buffer = await readFile(foundPath);
    const ext = path.extname(foundPath).toLowerCase();
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
