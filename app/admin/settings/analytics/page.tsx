"use client";
import { useState, useEffect } from "react";

export default function AnalyticsSettingsPage() {
  const [status, setStatus] = useState<"idle"|"loading"|"connected"|"error">("idle");
  const [data, setData] = useState<any>(null);

  async function connectGA4() {
    setStatus("loading");
    try {
      const res = await fetch("/api/analytics/ga4/connect");
      const json = await res.json();
      if (json.authUrl) window.location.href = json.authUrl;
    } catch { setStatus("error"); }
  }

  useEffect(() => {
    fetch("/api/analytics/ga4/status")
      .then(r => r.json())
      .then(d => { setData(d); setStatus(d.connected ? "connected" : "idle"); })
      .catch(() => setStatus("idle"));
  }, []);

  return (
    <div className="p-6 max-w-2xl">
      <p className="text-[#C9A24D] text-xs font-bold tracking-widest mb-1">SETTINGS</p>
      <h1 className="text-2xl font-black text-white mb-2">Analytics Connection</h1>
      <p className="text-gray-400 text-sm mb-8">Connect your Google Analytics properties to populate Hub dashboards.</p>

      <div className="bg-[#1a2535] border border-white/10 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-bold">Main Site</p>
            <p className="text-gray-400 text-xs">latimorelifelegacy.com · G-WZWMX83WXQ</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${status === "connected" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
            {status === "connected" ? "Connected" : "Not Connected"}
          </span>
        </div>
        <button
          onClick={connectGA4}
          disabled={status === "loading" || status === "connected"}
          className="w-full bg-[#C9A24D] text-black font-bold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50"
        >
          {status === "loading" ? "Connecting..." : status === "connected" ? "✓ Connected" : "Connect with Google"}
        </button>
      </div>

      {data?.lastSync && (
        <p className="text-gray-500 text-xs">Last synced: {new Date(data.lastSync).toLocaleString()}</p>
      )}
    </div>
  );
}
