export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL;
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (!baseUrl) {
    return NextResponse.json(
      { error: "NEXTAUTH_URL is not configured" },
      { status: 500 }
    );
  }

  if (error) {
    await prisma.systemEvent.create({
      data: {
        type: "GA4_CONNECT_FAILED",
        occurredAt: new Date(),
        payload: {
          error,
          source: "google_oauth_callback",
        },
      },
    });

    return NextResponse.redirect(
      `${baseUrl}/admin/settings/analytics?error=oauth_denied`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/admin/settings/analytics?error=no_code`
    );
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${baseUrl}/api/analytics/ga4/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const tokenError = await tokenRes.text();

      await prisma.systemEvent.create({
        data: {
          type: "GA4_CONNECT_FAILED",
          occurredAt: new Date(),
          payload: {
            status: tokenRes.status,
            error: tokenError,
          },
        },
      });

      return NextResponse.redirect(
        `${baseUrl}/admin/settings/analytics?error=token_exchange_failed`
      );
    }

    const tokens = await tokenRes.json();

    if (!tokens.refresh_token) {
      await prisma.systemEvent.create({
        data: {
          type: "GA4_CONNECT_FAILED",
          occurredAt: new Date(),
          payload: {
            reason: "no_refresh_token",
            connected_at: new Date().toISOString(),
          },
        },
      });

      return NextResponse.redirect(
        `${baseUrl}/admin/settings/analytics?error=no_refresh_token`
      );
    }

    // Recommended: encrypt tokens.refresh_token before persisting.
    // Also recommended: store it in a dedicated integration/settings table,
    // not in an event log.
    await prisma.systemEvent.create({
      data: {
        type: "GA4_CONNECTED",
        occurredAt: new Date(),
        payload: {
          // Avoid storing raw refresh_token here in production.
          refresh_token: tokens.refresh_token,
          connected_at: new Date().toISOString(),
        },
      },
    });

    return NextResponse.redirect(
      `${baseUrl}/admin/settings/analytics?success=true`
    );
  } catch (err) {
    await prisma.systemEvent.create({
      data: {
        type: "GA4_CONNECT_FAILED",
        occurredAt: new Date(),
        payload: {
          error: err instanceof Error ? err.message : "Unknown error",
        },
      },
    });

    return NextResponse.redirect(
      `${baseUrl}/admin/settings/analytics?error=unexpected_error`
    );
  }
}
