import { NextResponse } from "next/server";
import { createSign } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parsePrivateKey() {
  return process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "";
}

async function getServiceAccountToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = parsePrivateKey();

  if (!clientEmail || !privateKey) {
    throw new Error("Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  ).toString("base64url");

  const unsigned = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  const signature = sign.sign(privateKey, "base64url");
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error ?? "Failed to obtain service account token");
  }

  return data.access_token;
}

export async function GET() {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID;
    if (!propertyId) {
      return NextResponse.json({ error: "Missing GA4_PROPERTY_ID" }, { status: 500 });
    }

    const accessToken = await getServiceAccountToken();

    const gaRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "pagePath" }, { name: "sessionSource" }],
          metrics: [
            { name: "screenPageViews" },
            { name: "activeUsers" },
            { name: "eventCount" },
          ],
          limit: 50,
        }),
      }
    );

    const data = (await gaRes.json()) as {
      rows?: Array<{
        dimensionValues?: Array<{ value: string }>;
        metricValues?: Array<{ value: string }>;
      }>;
      error?: unknown;
    };

    if (!gaRes.ok) {
      return NextResponse.json(
        { error: "GA4 report failed", details: data },
        { status: gaRes.status }
      );
    }

    const rows =
      data.rows?.map((row) => ({
        pagePath: row.dimensionValues?.[0]?.value || "(not set)",
        source: row.dimensionValues?.[1]?.value || "(direct)",
        pageViews: Number(row.metricValues?.[0]?.value || 0),
        activeUsers: Number(row.metricValues?.[1]?.value || 0),
        eventCount: Number(row.metricValues?.[2]?.value || 0),
      })) ?? [];

    return NextResponse.json({ rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "GA4 report failed", details: message }, { status: 500 });
  }
}
