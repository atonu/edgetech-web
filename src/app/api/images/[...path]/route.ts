import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filename = params.path.join('/');

    if (filename.includes('..') || filename.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const filepath = join(process.cwd(), 'public/product-images', filename);
    const buffer = await readFile(filepath);

    let contentType = 'image/jpeg';
    if (filename.endsWith('.png')) contentType = 'image/png';
    if (filename.endsWith('.webp')) contentType = 'image/webp';
    if (filename.endsWith('.gif')) contentType = 'image/gif';

    return new NextResponse(buffer, {
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
