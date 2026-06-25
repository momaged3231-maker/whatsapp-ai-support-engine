import { NextResponse } from "next/server";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const body = await request.json();

  const required = [
    "customer_name",
    "phone",
    "customer_type",
    "service_type",
    "service_place",
    "area",
    "description",
  ];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `الحقل ${field} مطلوب` },
        { status: 400 }
      );
    }
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json({ saved: false, reason: "supabase_not_configured" });
  }

  const { error } = await supabaseAdmin.from("service_requests").insert({
    customer_name: body.customer_name,
    phone: body.phone,
    customer_type: body.customer_type,
    service_type: body.service_type,
    service_place: body.service_place,
    area: body.area,
    description: body.description,
    preferred_time: body.preferred_time || null,
    source: "website",
  });

  if (error) {
    return NextResponse.json({ saved: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: true });
}
