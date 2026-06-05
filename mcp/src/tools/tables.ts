import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSupabaseClient } from "../services/supabase.js";
import { CHARACTER_LIMIT } from "../types.js";

export function registerTableTools(server: McpServer): void {

  // ── LIST TABLES ──────────────────────────────────────────────────────────
  server.registerTool(
    "db_list_tables",
    {
      title: "List Database Tables",
      description: `List all tables in the Supabase public schema.
Use this to discover what data is available — includes both the simple public.leads
intake table and the Prisma-managed CRM tables (Contact, Inquiry, Event, etc.).

Returns: { tables: string[] }`,
      inputSchema: z.object({}).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public")
          .eq("table_type", "BASE TABLE");

        if (error) {
          const { data: rpcData, error: rpcError } = await supabase.rpc("list_tables");
          if (rpcError) throw new Error(`Cannot list tables: ${error.message}`);
          return { content: [{ type: "text", text: JSON.stringify(rpcData, null, 2) }] };
        }

        const tables = (data ?? []).map((r: { table_name: string }) => r.table_name);
        return { content: [{ type: "text", text: JSON.stringify({ tables }, null, 2) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  // ── GENERIC QUERY ────────────────────────────────────────────────────────
  server.registerTool(
    "db_query_table",
    {
      title: "Query Any Table",
      description: `Run a read-only SELECT against any table in the Hub OS Supabase database.
Use this for tables not covered by the dedicated tools (e.g., Event, Task, Note,
AiRun, Appointment, InquiryStageHistory, WeeklyReport, etc.).

Note: Prisma-managed tables use camelCase column names (e.g., createdAt, contactId).
The simple public.leads table uses snake_case (e.g., created_at, full_name).

Args:
  - table: Table name (e.g., 'Event', 'Task', 'Note', 'leads')
  - select: Comma-separated columns to return (default '*')
  - filters: Array of { column, operator, value } filter objects
    Operators: eq, neq, lt, lte, gt, gte, like, ilike, is, in
  - order_by: Column to sort by
  - ascending: Sort direction (default false = newest first)
  - limit: Max rows (default 20, max 100)
  - offset: Pagination offset (default 0)

Returns JSON with data[], count, total, has_more`,
      inputSchema: z.object({
        table: z.string().min(1).max(100).describe("Table name"),
        select: z.string().default("*"),
        filters: z.array(z.object({
          column: z.string(),
          operator: z.enum(["eq", "neq", "lt", "lte", "gt", "gte", "like", "ilike", "is", "in"]),
          value: z.union([z.string(), z.number(), z.boolean(), z.null()])
        })).default([]),
        order_by: z.string().optional(),
        ascending: z.boolean().default(false),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0)
      }).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async ({ table, select, filters, order_by, ascending, limit, offset }) => {
      try {
        const supabase = getSupabaseClient();
        let query = supabase
          .from(table)
          .select(select, { count: "exact" })
          .range(offset, offset + limit - 1);

        for (const f of filters) {
          switch (f.operator) {
            case "eq":    query = query.eq(f.column, f.value); break;
            case "neq":   query = query.neq(f.column, f.value); break;
            case "lt":    query = query.lt(f.column, f.value as string | number); break;
            case "lte":   query = query.lte(f.column, f.value as string | number); break;
            case "gt":    query = query.gt(f.column, f.value as string | number); break;
            case "gte":   query = query.gte(f.column, f.value as string | number); break;
            case "like":  query = query.like(f.column, f.value as string); break;
            case "ilike": query = query.ilike(f.column, f.value as string); break;
            case "is":    query = query.is(f.column, f.value as null | boolean); break;
            case "in":    query = query.in(f.column, String(f.value).split(",")); break;
          }
        }

        if (order_by) query = query.order(order_by, { ascending });

        const { data, error, count } = await query;
        if (error) throw new Error(`Query error on '${table}': ${error.message}`);

        const total = count ?? 0;
        const result = {
          table,
          data: data ?? [],
          count: (data ?? []).length,
          total,
          has_more: total > offset + limit,
          ...(total > offset + limit ? { next_offset: offset + limit } : {})
        };

        const text = JSON.stringify(result, null, 2);
        return {
          content: [{
            type: "text",
            text: text.length > CHARACTER_LIMIT
              ? text.slice(0, CHARACTER_LIMIT) + "\n\n[Truncated — use offset/limit to paginate]"
              : text
          }]
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  // ── RAW SQL (READ-ONLY) ──────────────────────────────────────────────────
  server.registerTool(
    "db_raw_sql",
    {
      title: "Execute Raw SQL (Read-Only)",
      description: `Execute a raw PostgreSQL SELECT via Supabase RPC.
Use for complex joins, aggregations, or queries not possible with other tools.
ONLY SELECT statements are permitted.

Requires the execute_sql RPC function — see README for the one-time setup SQL.

Example:
  sql: "SELECT county, COUNT(*) FROM \\"Contact\\" GROUP BY county ORDER BY count DESC"

Note: Prisma table names are quoted identifiers (e.g., \\"Contact\\", \\"Inquiry\\").`,
      inputSchema: z.object({
        sql: z.string()
          .min(1)
          .refine(
            (s) => s.trim().toUpperCase().startsWith("SELECT"),
            "Only SELECT statements are allowed"
          )
      }).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async ({ sql }) => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.rpc("execute_sql", { query: sql });

        if (error) {
          if (error.message.includes("execute_sql")) {
            return {
              content: [{
                type: "text",
                text: `The 'execute_sql' RPC is not installed. Run this once in the Supabase SQL editor:\n\nCREATE OR REPLACE FUNCTION execute_sql(query text)\nRETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$\nDECLARE result json;\nBEGIN\n  EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || query || ') t' INTO result;\n  RETURN result;\nEND;\n$$;`
              }]
            };
          }
          throw new Error(`SQL error: ${error.message}`);
        }

        const text = JSON.stringify(data, null, 2);
        return {
          content: [{
            type: "text",
            text: text.length > CHARACTER_LIMIT
              ? text.slice(0, CHARACTER_LIMIT) + "\n\n[Truncated]"
              : text
          }]
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
