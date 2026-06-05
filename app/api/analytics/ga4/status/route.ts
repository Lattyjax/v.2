export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const event = await prisma.systemEvent.findFirst({
      where: { type: "GA4_CONNECTED" },
      orderBy: { createdAt: "desc" },
    });
    if (!event) return NextResponse.json({ connected: false });
    const payload = event.payload as any;
    return NextResponse.json({ connected: true, lastSync: payload?.connected_at });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
