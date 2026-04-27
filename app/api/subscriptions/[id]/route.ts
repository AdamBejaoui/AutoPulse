import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import("@/lib/db");
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "Missing subscription ID" }, { status: 400 });
    }

    await prisma.subscription.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Subscription terminated" });
  } catch (error) {
    console.error("[api/subscriptions/[id]/DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}

const patchSchema = z.object({
  email: z.string().email().optional(),
  make: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  yearMin: z.coerce.number().int().nullable().optional(),
  yearMax: z.coerce.number().int().nullable().optional(),
  priceMin: z.coerce.number().nullable().optional(),
  priceMax: z.coerce.number().nullable().optional(),
  mileageMin: z.coerce.number().int().nullable().optional(),
  mileageMax: z.coerce.number().int().nullable().optional(),
  city: z.string().nullable().optional(),
  keywords: z.array(z.string()).optional(),
  trim: z.string().nullable().optional(),
  bodyStyle: z.string().nullable().optional(),
  driveType: z.string().nullable().optional(),
  transmission: z.string().nullable().optional(),
  fuelType: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  titleStatus: z.string().nullable().optional(),
  maxOwners: z.number().int().nullable().optional(),
  noAccidents: z.boolean().nullable().optional(),
  requiredFeatures: z.array(z.string()).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import("@/lib/db");
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "Missing subscription ID" }, { status: 400 });
    }

    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    
    // Map cents if price is provided
    const updateData: any = { ...data };
    if (data.priceMin !== undefined) {
      updateData.priceMin = data.priceMin != null ? Math.round(data.priceMin * 100) : null;
    }
    if (data.priceMax !== undefined) {
      updateData.priceMax = data.priceMax != null ? Math.round(data.priceMax * 100) : null;
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, subscription: updated });
  } catch (error) {
    console.error("[api/subscriptions/[id]/PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
