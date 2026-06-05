import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { registerLeadTools } from "./tools/leads.js";
import { registerContactTools } from "./tools/contacts.js";
import { registerTableTools } from "./tools/tables.js";
import { testConnection } from "./services/supabase.js";

const server = new McpServer({
  name: "latimore-supabase-mcp-server",
  version: "1.1.0"
});

registerLeadTools(server);     // public.leads intake table
registerContactTools(server);  // Prisma Contact / Inquiry tables
registerTableTools(server);    // generic db_query_table, db_raw_sql, db_list_tables

// ── TRANSPORT: STDIO (default for local / Termux) ────────────────────────────
async function runStdio(): Promise<void> {
  const ok = await testConnection();
  if (!ok) {
    process.stderr.write("⚠️  Could not verify Supabase connection. Check env vars.\n");
  } else {
    process.stderr.write("✅  Supabase connection verified.\n");
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("Latimore Supabase MCP server running (stdio)\n");
}

// ── TRANSPORT: HTTP (for Vercel / remote hosting) ────────────────────────────
async function runHTTP(): Promise<void> {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "latimore-supabase-mcp-server", version: "1.1.0" });
  });

  app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT ?? "3000");
  app.listen(port, () => {
    process.stderr.write(`Latimore Supabase MCP server running on http://localhost:${port}/mcp\n`);
  });
}

// ── ENTRY POINT ──────────────────────────────────────────────────────────────
const transport = process.env.TRANSPORT ?? "stdio";

if (transport === "http") {
  runHTTP().catch((err: unknown) => {
    process.stderr.write(`Server error: ${String(err)}\n`);
    process.exit(1);
  });
} else {
  runStdio().catch((err: unknown) => {
    process.stderr.write(`Server error: ${String(err)}\n`);
    process.exit(1);
  });
}
