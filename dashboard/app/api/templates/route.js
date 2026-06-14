import { NextResponse } from 'next/server';
import { many } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await many(`SELECT key, name, business_type, description, config FROM business_templates ORDER BY name`);
  return NextResponse.json({ data: rows });
}
