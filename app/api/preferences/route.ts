import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email(),
  filters: z.record(z.any()),
});

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/db");
    const json: unknown = await req.json();
    const parsed = bodySchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, filters } = parsed.data;

    const pref = await prisma.userPreference.upsert({
      where: { email },
      update: { filters, updatedAt: new Date() },
      create: { email, filters },
    });

    return NextResponse.json({ success: true, filters: pref.filters });
  } catch (e) {
    console.error("[api/preferences] POST error:", e);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/db");
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const pref = await prisma.userPreference.findUnique({
      where: { email },
    });

    if (!pref) {
      return NextResponse.json({ filters: null });
    }

    return NextResponse.json({ filters: pref.filters });
  } catch (e) {
    console.error("[api/preferences] GET error:", e);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}
