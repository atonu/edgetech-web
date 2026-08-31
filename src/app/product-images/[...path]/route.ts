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

    const FALLBACK_SVG = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none"><rect width="400" height="400" fill="#0f172a"/><rect x="10" y="10" width="380" height="380" rx="12" fill="#1e293b" stroke="#334155" stroke-width="2"/><circle cx="200" cy="180" r="48" fill="#38bdf8" opacity="0.15"/><path d="M185 165l30 30-15 15" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text x="200" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#94a3b8" text-anchor="middle">EdgeTech Product</text></svg>`
    );

    if (!foundPath) {
      return new NextResponse(FALLBACK_SVG, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
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
