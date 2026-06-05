import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSupabaseClient } from "../services/supabase.js";
import { CHARACTER_LIMIT, COUNTIES } from "../types.js";

// Tools targeting the simple `public.leads` table (supabase-leads-table.sql).
// Column layout: id, created_at, full_name, phone, email, promo_code,
//                product_interest, lead_source, page_source, status, county, notes

export function registerLeadTools(server: McpServer): void {

  // ── LIST / SEARCH LEADS ──────────────────────────────────────────────────
  server.registerTool(
    "leads_list",
    {
      title: "List Simple Leads",
      description: `Query records from the public.leads table — the flat PAHS/QR-form intake table.
Supports filtering by county, status, and free-text search across full_name and email.
Returns paginated results ordered by creation date (newest first).

Args:
  - county: Filter by PA county ('Schuylkill' | 'Luzerne' | 'Northumberland')
  - status: Filter by status text (e.g. 'New', 'Contacted', 'Issued')
  - search: Free-text search against full_name, email
  - product_interest: Filter by product type (e.g., 'IUL', 'Term Life')
  - limit: Results per page (default 20, max 100)
  - offset: Pagination offset (default 0)

Returns JSON with: data[], count, total, has_more`,
      inputSchema: z.object({
        county: z.enum(COUNTIES).optional().describe("Filter by PA county"),
        status: z.string().max(50).optional().describe("Filter by status text"),
        search: z.string().max(100).optional().describe("Search full_name or email"),
        product_interest: z.string().max(50).optional().describe("Filter by product type"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0)
      }).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async ({ county, status, search, product_interest, limit, offset }) => {
      try {
        const supabase = getSupabaseClient();
        let query = supabase
          .from("leads")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (county) query = query.eq("county", county);
        if (status) query = query.ilike("status", status);
        if (product_interest) query = query.ilike("product_interest", `%${product_interest}%`);
        if (search) {
          query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data, error, count } = await query;
        if (error) throw new Error(`Supabase error: ${error.message}`);

        const total = count ?? 0;
        const result = {
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

  // ── GET SINGLE LEAD ──────────────────────────────────────────────────────
  server.registerTool(
    "leads_get",
    {
      title: "Get Simple Lead by ID",
      description: `Retrieve a single record from public.leads by its UUID.

Args:
  - id: UUID of the lead record

Returns the full lead object or an error if not found.`,
      inputSchema: z.object({
        id: z.string().uuid().describe("Lead UUID")
      }).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async ({ id }) => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw new Error(`Lead not found: ${error.message}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  // ── CREATE LEAD ──────────────────────────────────────────────────────────
  server.registerTool(
    "leads_create",
    {
      title: "Create Simple Lead",
      description: `Insert a new record into the public.leads intake table.

Args:
  - full_name: Lead's full name (required)
  - phone: Phone number (required, e.g., '570-555-1234')
  - email: Email address
  - county: PA county ('Schuylkill' | 'Luzerne' | 'Northumberland')
  - status: Initial status text (default: 'New')
  - product_interest: Product type (e.g., 'IUL', 'Term Life', 'Final Expense')
  - lead_source: Where the lead came from (e.g., 'Website', 'PAHS event', 'QR code')
  - page_source: Landing page or URL that generated this lead
  - promo_code: Any promo code used
  - notes: Additional notes

Returns: { success, id, message }`,
      inputSchema: z.object({
        full_name: z.string().min(1).max(200).describe("Full name"),
        phone: z.string().min(1).max(20).describe("Phone number"),
        email: z.string().email().optional(),
        county: z.enum(COUNTIES).optional(),
        status: z.string().max(50).default("New"),
        product_interest: z.string().max(100).optional(),
        lead_source: z.string().max(100).optional(),
        page_source: z.string().max(200).optional(),
        promo_code: z.string().max(50).optional(),
        notes: z.string().max(2000).optional()
      }).strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false }
    },
    async (params) => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("leads")
          .insert([params])
          .select("id")
          .single();

        if (error) throw new Error(`Insert failed: ${error.message}`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ success: true, id: data.id, message: "Lead created successfully." })
          }]
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  // ── UPDATE LEAD ──────────────────────────────────────────────────────────
  server.registerTool(
    "leads_update",
    {
      title: "Update Simple Lead",
      description: `Update fields on an existing public.leads record. Only supply fields you want to change.

Args:
  - id: UUID of the lead to update (required)
  - Any subset of: full_name, phone, email, county, status, product_interest,
    lead_source, page_source, promo_code, notes

Returns: { success, message }`,
      inputSchema: z.object({
        id: z.string().uuid().describe("Lead UUID"),
        full_name: z.string().min(1).max(200).optional(),
        phone: z.string().max(20).optional(),
        email: z.string().email().optional(),
        county: z.enum(COUNTIES).optional(),
        status: z.string().max(50).optional(),
        product_interest: z.string().max(100).optional(),
        lead_source: z.string().max(100).optional(),
        page_source: z.string().max(200).optional(),
        promo_code: z.string().max(50).optional(),
        notes: z.string().max(2000).optional()
      }).strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true }
    },
    async ({ id, ...updates }) => {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from("leads")
          .update(updates)
          .eq("id", id);

        if (error) throw new Error(`Update failed: ${error.message}`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ success: true, message: `Lead ${id} updated.` })
          }]
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  // ── LEADS SUMMARY ────────────────────────────────────────────────────────
  server.registerTool(
    "leads_summary",
    {
      title: "Simple Leads Summary",
      description: `Aggregate counts from public.leads grouped by status and county.

Returns: { by_status: {}, by_county: {}, total: number }`,
      inputSchema: z.object({}).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from("leads").select("status, county");
        if (error) throw new Error(`Query failed: ${error.message}`);

        const records = data ?? [];
        const by_status: Record<string, number> = {};
        const by_county: Record<string, number> = {};

        for (const row of records) {
          const s = row.status ?? "unknown";
          const c = row.county ?? "unknown";
          by_status[s] = (by_status[s] ?? 0) + 1;
          by_county[c] = (by_county[c] ?? 0) + 1;
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ by_status, by_county, total: records.length }, null, 2)
          }]
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
