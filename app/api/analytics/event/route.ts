import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

type AnalyticsPayload = {
  event_name?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  page_path?: string;
  lead_id?: string;
  client_id?: string;
  metadata?: Record<string, unknown>;
};

function cleanEventName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 40);
}

async function sendToGa4(payload: Required<Pick<AnalyticsPayload, "event_name">> & AnalyticsPayload) {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) return;

  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: payload.client_id || "latimore-os-server",
        events: [
          {
            name: cleanEventName(payload.event_name),
            params: {
              source: payload.source,
              medium: payload.medium,
              campaign: payload.campaign,
              page_path: payload.page_path,
              lead_id: payload.lead_id,
              ...(payload.metadata || {}),
            },
          },
        ],
      }),
    }
  );
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'event')
  if (limited) return limited

  try {
    const body = (await req.json()) as AnalyticsPayload;

    if (!body.event_name) {
      return NextResponse.json({ error: "Missing event_name" }, { status: 400 });
    }

    const eventName = cleanEventName(body.event_name);

    const record = {
      event_name: eventName,
      source: body.source || null,
      medium: body.medium || null,
      campaign: body.campaign || null,
      page_path: body.page_path || null,
      lead_id: body.lead_id || null,
      metadata: body.metadata || {},
    };

    if (supabase) {
      const { error } = await supabase.from("analytics_events").insert(record);
      if (error) {
        return NextResponse.json(
          { error: "Supabase insert failed", details: error.message },
          { status: 500 }
        );
      }
    }

    await sendToGa4({ ...body, event_name: eventName });

    return NextResponse.json({ success: true, event_name: eventName });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Analytics event failed", details: message },
      { status: 500 }
    );
  }
}
