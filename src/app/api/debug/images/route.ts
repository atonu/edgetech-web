import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const baseDir = path.resolve(process.cwd(), 'public', 'product-images');
    const files = await readdir(baseDir);
    const fileStats = await Promise.all(
      files.map(async (f) => {
        try {
          const s = await stat(path.join(baseDir, f));
          return { name: f, size: s.size, mtime: s.mtime };
        } catch (e) {
          return { name: f, error: String(e) };
        }
      })
    );

    return NextResponse.json({
      cwd: process.cwd(),
      baseDir,
      fileCount: files.length,
      files: fileStats,
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      cwd: process.cwd(),
    }, { status: 500 });
  }
}
