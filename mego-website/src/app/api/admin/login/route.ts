import { NextResponse } from "next/server";
import { checkAdminPassword, createAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
