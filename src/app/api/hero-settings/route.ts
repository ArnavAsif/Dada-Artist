import { NextResponse } from 'next/server';
import { getHeroSettings, updateHeroSettings } from '@/lib/supabase/service';

export async function GET() {
  try {
    const settings = await getHeroSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch hero settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.hero_image_url) {
      return NextResponse.json(
        { success: false, error: 'hero_image_url is required' },
        { status: 400 }
      );
    }
    await updateHeroSettings(body.hero_image_url);
    const settings = await getHeroSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update hero settings' },
      { status: 500 }
    );
  }
}
