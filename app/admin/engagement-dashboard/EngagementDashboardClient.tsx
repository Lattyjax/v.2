"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { trackDashboardEvent } from "@/lib/analytics/ga4";

type Totals = {
  impressions: number;
  reach: number;
  clicks: number;
  reactions: number;
  comments: number;
  shares: number;
  saves: number;
  leads: number;
};

type TrendPoint = {
  date: string;
  reactions: number;
  comments: number;
  shares: number;
  clicks: number;
};

type Insight = {
  id: string;
  type: string;
  severity: string;
  title: string;
  summary: string;
  action?: string;
  createdAt: string;
};

type Post = {
  id: string;
  platform: string;
  caption: string;
  publishedAt: string | null;
  metrics: { reactions: number; comments: number; shares: number; clicks: number; reach: number }[];
};

type MetricsData = {
  totals: Totals;
  byPlatform: Record<string, Totals>;
  trend: TrendPoint[];
  insights: Insight[];
  recentPosts: Post[];
  days: number;
};

type TabKey = "overview" | "posts" | "ai";

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E1306C",
  linkedin: "#0A66C2",
  twitter: "#1DA1F2",
  website: "#C49A6C",
};

const SEVERITY_BADGE: Record<string, { label: string; className: string }> = {
  high: { label: "High", className: "border-red-500/30 bg-red-500/10 text-red-700" },
  medium: { label: "Medium", className: "border-amber-500/30 bg-amber-500/10 text-amber-700" },
  low: { label: "Low", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" },
  info: { label: "Info", className: "border-sky-500/30 bg-sky-500/10 text-sky-700" },
};

function safeNumber(n: unknown, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function formatNumber(value: number | undefined) {
  return safeNumber(value).toLocaleString();
}

function metricTotal(post: Post, key: keyof Post["metrics"][number]) {
  return post.metrics?.reduce((sum, metric) => sum + safeNumber(metric[key]), 0) ?? 0;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-5 pt-5 ${className}`}>{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold tracking-tight text-slate-950">{children}</h2>;
}

function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function Button({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function ExecutiveKpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-medium text-slate-500">{label}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
        {note && <div className="mt-1 text-xs text-slate-500">{note}</div>}
      </CardContent>
    </Card>
  );
}

function MiniBarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-medium capitalize" style={{ color }}>
          {label}
        </div>
        <div className="text-sm tabular-nums text-slate-500">{value.toLocaleString()}</div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function TrendMiniBars({ trend }: { trend: TrendPoint[] }) {
  if (!trend?.length) {
    return <div className="py-10 text-center text-sm text-slate-500">No trend data yet.</div>;
  }

  const points = trend.slice(-21);
  const maxVal = Math.max(...points.map((t) => t.reactions + t.comments + t.shares + t.clicks), 1);

  return (
    <div className="flex h-28 items-end gap-1">
      {points.map((t) => {
        const total = t.reactions + t.comments + t.shares + t.clicks;
        const h = Math.max((total / maxVal) * 100, 6);

        return (
          <div
            key={t.date}
            title={`${t.date}: ${total.toLocaleString()} engagements`}
            className="flex-1 rounded-sm"
            style={{ height: `${h}%`, background: "#C49A6C", opacity: 0.9 }}
          />
        );
      })}
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardContent>
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-8 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-3 w-40 animate-pulse rounded bg-slate-200" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function EngagementDashboardClient() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [days, setDays] = useState(30);
  const [platform, setPlatform] = useState("all");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [sentimentText, setSentimentText] = useState("");
  const [sentimentResult, setSentimentResult] = useState<Record<string, unknown> | null>(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);

  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState<Record<string, unknown> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const params = new URLSearchParams({ days: String(days) });
      if (platform !== "all") params.set("platform", platform);

      const res = await fetch(`/api/social/metrics?${params}`, { cache: "no-store" });
      if (!res.ok) {
        setData(null);
        setLoadError(`Metrics request failed (${res.status}).`);
        return;
      }

      const json = (await res.json()) as MetricsData;
      setData(json);
    } catch {
      setData(null);
      setLoadError("Unable to load metrics.");
    } finally {
      setLoading(false);
    }
  }, [days, platform]);

  useEffect(() => {
    load();
    trackDashboardEvent("dashboard_view", { dashboard: "engagement_intelligence" });
  }, [load]);

  async function runSentiment() {
    if (!sentimentText.trim()) return;

    setSentimentLoading(true);
    setSentimentResult(null);

    try {
      const res = await fetch("/api/ai/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sentimentText }),
      });

      const json = await res.json();
      const result = isRecord(json?.result) ? (json.result as Record<string, unknown>) : null;
      setSentimentResult(result ?? { error: "No result returned" });
    } catch {
      setSentimentResult({ error: "Analysis failed" });
    } finally {
      setSentimentLoading(false);
    }
  }

  async function runWeeklyReport() {
    setWeeklyLoading(true);
    setWeeklyReport(null);

    try {
      const res = await fetch("/api/reports/weekly", { method: "POST" });
      const json = await res.json();
      const analysis = isRecord(json?.analysis) ? (json.analysis as Record<string, unknown>) : null;
      setWeeklyReport(analysis ?? { error: "No report returned" });
      trackDashboardEvent("report_generated", { type: "weekly" });
    } catch {
      setWeeklyReport({ error: "Report failed" });
    } finally {
      setWeeklyLoading(false);
    }
  }

  const totals = data?.totals;

  const engRate = useMemo(() => {
    if (!totals || totals.reach <= 0) return "—";
    const rate = ((totals.reactions + totals.comments + totals.shares) / totals.reach) * 100;
    return `${rate.toFixed(1)}%`;
  }, [totals]);

  const platforms = useMemo(() => (data ? Object.keys(data.byPlatform || {}) : []), [data]);

  const maxPlatformReach = useMemo(() => {
    if (!data || platforms.length === 0) return 1;
    return Math.max(...platforms.map((p) => data.byPlatform[p]?.reach ?? 0), 1);
  }, [data, platforms]);

  const insightCount = data?.insights?.length ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 text-slate-950">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Engagement Intelligence</h1>
            {insightCount > 0 && <Badge className="border-blue-200 bg-blue-50 text-blue-800">{insightCount} insight{insightCount !== 1 ? "s" : ""}</Badge>}
          </div>
          <p className="text-sm text-slate-500">hub.latimorelifelegacy.com</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={String(days)}
            onChange={(event) => setDays(Number(event.target.value))}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm shadow-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>

          <select
            value={platform}
            onChange={(event) => setPlatform(event.target.value)}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm shadow-sm"
          >
            <option value="all">All platforms</option>
            {platforms.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>

          <Button onClick={load} disabled={loading}>Refresh</Button>
        </div>
      </div>

      {loadError && (
        <Card className="border-red-500/30 bg-red-50">
          <CardContent className="text-sm text-red-700">{loadError}</CardContent>
        </Card>
      )}

      {loading ? (
        <LoadingDashboard />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <ExecutiveKpi label="Reach" value={formatNumber(totals?.reach)} note={`${days}-day audience exposure`} />
            <ExecutiveKpi label="Clicks" value={formatNumber(totals?.clicks)} note="Traffic intent signals" />
            <ExecutiveKpi label="Engagement Rate" value={engRate} note="Reactions + comments + shares / reach" />
            <ExecutiveKpi label="Leads" value={formatNumber(totals?.leads)} note="CRM conversion events" />
          </div>

          <div className="space-y-6">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(["overview", "posts", "ai"] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                    activeTab === tab ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab === "ai" ? "AI Tools" : tab}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-5">
                  <Card className="lg:col-span-3">
                    <CardHeader>
                      <CardTitle>Engagement Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TrendMiniBars trend={data?.trend ?? []} />
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Reach by Platform</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {platforms.length ? (
                        platforms.map((item) => (
                          <MiniBarRow
                            key={item}
                            label={item}
                            value={data?.byPlatform[item]?.reach ?? 0}
                            max={maxPlatformReach}
                            color={PLATFORM_COLORS[item] ?? "#C49A6C"}
                          />
                        ))
                      ) : (
                        <div className="py-8 text-center text-sm text-slate-500">No platform data yet.</div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data?.insights?.length ? (
                      data.insights.map((insight) => {
                        const severity = SEVERITY_BADGE[insight.severity] ?? SEVERITY_BADGE.info;
                        return (
                          <div key={insight.id} className="rounded-xl border border-slate-200 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="font-medium">{insight.title}</div>
                              <Badge className={severity.className}>{severity.label}</Badge>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">{insight.summary}</p>
                            {insight.action && <p className="mt-3 text-sm font-medium">Action: {insight.action}</p>}
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-sm text-slate-500">No AI insights generated yet.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "posts" && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data?.recentPosts?.length ? (
                    data.recentPosts.map((post) => (
                      <div key={post.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <Badge className="border-slate-200 bg-slate-50 capitalize text-slate-700">{post.platform}</Badge>
                          <span className="text-xs text-slate-500">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft / unscheduled"}
                          </span>
                        </div>
                        <p className="mt-3 text-sm">{post.caption}</p>
                        <div className="my-4 h-px bg-slate-200" />
                        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
                          <div>Reach: {metricTotal(post, "reach").toLocaleString()}</div>
                          <div>Clicks: {metricTotal(post, "clicks").toLocaleString()}</div>
                          <div>Reactions: {metricTotal(post, "reactions").toLocaleString()}</div>
                          <div>Comments: {metricTotal(post, "comments").toLocaleString()}</div>
                          <div>Shares: {metricTotal(post, "shares").toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-sm text-slate-500">No recent posts found.</div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "ai" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sentiment Analyzer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <textarea
                      value={sentimentText}
                      onChange={(event) => setSentimentText(event.target.value)}
                      placeholder="Paste a comment, DM, review, or post caption..."
                      className="min-h-32 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-sm"
                    />
                    <Button onClick={runSentiment} disabled={sentimentLoading || !sentimentText.trim()}>
                      {sentimentLoading ? "Analyzing..." : "Analyze Sentiment"}
                    </Button>
                    {sentimentResult && (
                      <pre className="max-h-80 overflow-auto rounded-xl bg-slate-100 p-4 text-xs">
                        {JSON.stringify(sentimentResult, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500">
                      Generate an executive summary for the current social and CRM reporting period.
                    </p>
                    <Button onClick={runWeeklyReport} disabled={weeklyLoading}>
                      {weeklyLoading ? "Generating..." : "Generate Weekly Report"}
                    </Button>
                    {weeklyReport && (
                      <pre className="max-h-80 overflow-auto rounded-xl bg-slate-100 p-4 text-xs">
                        {JSON.stringify(weeklyReport, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
