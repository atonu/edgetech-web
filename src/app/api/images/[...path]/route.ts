import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filename = params.path.join('/');
    console.log(`[Image] Requested: ${filename}`);

    if (!filename || filename.includes('..') || filename.startsWith('/')) {
      console.log(`[Image] Invalid path: ${filename}`);
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const baseDir = path.resolve(process.cwd(), 'public', 'product-images');
    const filepath = path.resolve(path.join(baseDir, filename));

    console.log(`[Image] Base dir: ${baseDir}`);
    console.log(`[Image] Resolved path: ${filepath}`);

    if (!filepath.startsWith(baseDir)) {
      console.log(`[Image] Path traversal attempt`);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    try {
      await stat(filepath);
      console.log(`[Image] File exists`);
    } catch (statErr) {
      console.log(`[Image] File not found at ${filepath}`, statErr);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const buffer = await readFile(filepath);
    console.log(`[Image] Served ${buffer.length} bytes`);

    let contentType = 'image/jpeg';
    if (filename.endsWith('.png')) contentType = 'image/png';
    if (filename.endsWith('.webp')) contentType = 'image/webp';
    if (filename.endsWith('.gif')) contentType = 'image/gif';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('[Image] Route error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
