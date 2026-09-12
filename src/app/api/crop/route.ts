import { NextResponse } from 'next/server';
import { cropHeroImage } from '@/lib/crop';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const x = parseFloat(searchParams.get('x') || '50');
    const y = parseFloat(searchParams.get('y') || '50');
    const width = parseFloat(searchParams.get('w') || searchParams.get('width') || '15');
    const height = parseFloat(searchParams.get('h') || searchParams.get('height') || '20');
    const productId = searchParams.get('productId') || `preview-${Date.now()}`;
    const heroImageUrl = searchParams.get('hero') || undefined;

    const result = await cropHeroImage({
      coords: { x, y, width, height },
      productId,
      heroImageUrl,
    });

    const body = new Uint8Array(result.buffer);

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Content-Disposition': `inline; filename="${result.filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to crop image' },
      { status: 500 }
    );
  }
}
