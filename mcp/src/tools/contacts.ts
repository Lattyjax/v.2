import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSupabaseClient } from "../services/supabase.js";
import {
  CHARACTER_LIMIT,
  COUNTIES,
  LEAD_STATUSES,
  PIPELINE_STAGES,
  PRODUCT_INTERESTS
} from "../types.js";

// Tools targeting the Prisma-managed "Contact" and "Inquiry" tables.
// Prisma stores field names as-is (camelCase) in Postgres — no snake_case conversion.

export function registerContactTools(server: McpServer): void {

  // ── LIST CONTACTS ─────────────────────────────────────────────────────────
  server.registerTool(
    "contact_list",
    {
      title: "List Contacts",
      description: `Query the Prisma-managed Contact table (full Hub OS CRM contacts).
Supports filtering by county, status, and free-text search.
Returns paginated results ordered by createdAt (newest first).

Args:
  - county: Filter by PA county
  - status: LeadStatus enum value (e.g. 'NEW', 'QUALIFIED', 'CLOSED_WON')
  - search: Free-text search against firstName, lastName, email, phone
  - limit: Results per page (default 20, max 100)
  - offset: Pagination offset (default 0)

Returns JSON with: data[], count, total, has_more`,
      inputSchema: z.object({
        county: z.enum(COUNTIES).optional(),
        status: z.enum(LEAD_STATUSES).optional(),
        search: z.string().max(100).optional().describe("Search name, email, or phone"),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0)
      }).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async ({ county, status, search, limit, offset }) => {
      try {
        const supabase = getSupabaseClient();
        let query = supabase
          .from("Contact")
          .select(
            "id,createdAt,email,firstName,lastName,fullName,phone,county,status,leadScore,primarySourceType,currentIntent,lastActivityAt,nextFollowUpAt,notesSummary",
            { count: "exact" }
          )
          .order("createdAt", { ascending: false })
          .range(offset, offset + limit - 1);

        if (county) query = query.eq("county", county);
        if (status) query = query.eq("status", status);
        if (search) {
          query = query.or(
            `firstName.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
          );
        }

        const { data, error, count } = await query;
        if (error) throw new Error(`Contact query error: ${error.message}`);

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

  // ── GET CONTACT ──────────────────────────────────────────────────────────
  server.registerTool(
    "contact_get",
    {
      title: "Get Contact",
      description: `Retrieve a full Contact record by UUID, including all inquiries and recent tasks.

Args:
  - id: Contact UUID

Returns the contact object with nested inquiries array.`,
      inputSchema: z.object({
        id: z.string().uuid()
      }).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async ({ id }) => {
      try {
        const supabase = getSupabaseClient();

        const [contactRes, inquiriesRes, tasksRes] = await Promise.all([
          supabase.from("Contact").select("*").eq("id", id).single(),
          supabase
            .from("Inquiry")
            .select("id,createdAt,stage,productInterest,status,county,leadScore,notes")
            .eq("contactId", id)
            .order("createdAt", { ascending: false })
            .limit(10),
          supabase
            .from("Task")
            .select("id,title,status,dueAt")
            .eq("contactId", id)
            .order("dueAt", { ascending: true })
            .limit(10)
        ]);

        if (contactRes.error) throw new Error(`Contact not found: ${contactRes.error.message}`);

        const result = {
          ...contactRes.data,
          inquiries: inquiriesRes.data ?? [],
          tasks: tasksRes.data ?? []
        };

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  // ── UPDATE CONTACT ───────────────────────────────────────────────────────
  server.registerTool(
    "contact_update",
    {
      title: "Update Contact",
      description: `Update fields on an existing Contact record. Only supply fields you want to change.

Args:
  - id: Contact UUID (required)
  - Any subset of: firstName, lastName, email, phone, county, status,
    nextFollowUpAt (ISO 8601), notesSummary

Returns: { success, message }`,
      inputSchema: z.object({
        id: z.string().uuid(),
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().min(1).max(100).optional(),
        email: z.string().email().optional(),
        phone: z.string().max(20).optional(),
        county: z.enum(COUNTIES).optional(),
        status: z.enum(LEAD_STATUSES).optional(),
        nextFollowUpAt: z.string().datetime({ offset: true }).optional(),
        notesSummary: z.string().max(2000).optional()
      }).strict(),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true }
    },
    async ({ id, ...updates }) => {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from("Contact")
          .update({ ...updates, updatedAt: new Date().toISOString() })
          .eq("id", id);

        if (error) throw new Error(`Update failed: ${error.message}`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ success: true, message: `Contact ${id} updated.` })
          }]
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );

  // ── LIST INQUIRIES ────────────────────────────────────────────────────────
  server.registerTool(
    "inquiry_list",
    {
      title: "List Inquiries",
      description: `Query the Prisma-managed Inquiry table (pipeline records linked to contacts).
Each inquiry tracks a specific product interest and pipeline stage.

Args:
  - stage: PipelineStage enum (e.g. 'New', 'Qualified', 'Booked', 'Sold', 'Lost')
  - product_interest: ProductInterest enum (e.g. 'IUL', 'Term_Life', 'Annuity')
  - county: Filter by PA county
  - contact_id: Filter by parent Contact UUID
  - limit: Results per page (default 20, max 100)
  - offset: Pagination offset (default 0)

Returns JSON with: data[], count, total, has_more`,
      inputSchema: z.object({
        stage: z.enum(PIPELINE_STAGES).optional(),
        product_interest: z.enum(PRODUCT_INTERESTS).optional(),
        county: z.enum(COUNTIES).optional(),
        contact_id: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0)
      }).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async ({ stage, product_interest, county, contact_id, limit, offset }) => {
      try {
        const supabase = getSupabaseClient();
        let query = supabase
          .from("Inquiry")
          .select(
            "id,createdAt,contactId,stage,productInterest,status,county,leadScore,source,sourceType,intent,notes",
            { count: "exact" }
          )
          .order("createdAt", { ascending: false })
          .range(offset, offset + limit - 1);

        if (stage) query = query.eq("stage", stage);
        if (product_interest) query = query.eq("productInterest", product_interest);
        if (county) query = query.eq("county", county);
        if (contact_id) query = query.eq("contactId", contact_id);

        const { data, error, count } = await query;
        if (error) throw new Error(`Inquiry query error: ${error.message}`);

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

  // ── PIPELINE SUMMARY ──────────────────────────────────────────────────────
  server.registerTool(
    "pipeline_summary",
    {
      title: "CRM Pipeline Summary",
      description: `Aggregate counts from the Contact and Inquiry tables.
Returns a combined snapshot useful for daily brief and pipeline reporting.

Returns:
  contacts_by_status: { [LeadStatus]: count }
  inquiries_by_stage: { [PipelineStage]: count }
  inquiries_by_product: { [ProductInterest]: count }
  total_contacts: number
  total_inquiries: number`,
      inputSchema: z.object({}).strict(),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true }
    },
    async () => {
      try {
        const supabase = getSupabaseClient();

        const [contactsRes, inquiriesRes] = await Promise.all([
          supabase.from("Contact").select("status"),
          supabase.from("Inquiry").select("stage, productInterest")
        ]);

        if (contactsRes.error) throw new Error(`Contact query: ${contactsRes.error.message}`);
        if (inquiriesRes.error) throw new Error(`Inquiry query: ${inquiriesRes.error.message}`);

        const contacts = contactsRes.data ?? [];
        const inquiries = inquiriesRes.data ?? [];

        const contacts_by_status: Record<string, number> = {};
        for (const c of contacts) {
          const s = c.status ?? "unknown";
          contacts_by_status[s] = (contacts_by_status[s] ?? 0) + 1;
        }

        const inquiries_by_stage: Record<string, number> = {};
        const inquiries_by_product: Record<string, number> = {};
        for (const i of inquiries) {
          const s = i.stage ?? "unknown";
          const p = i.productInterest ?? "unknown";
          inquiries_by_stage[s] = (inquiries_by_stage[s] ?? 0) + 1;
          inquiries_by_product[p] = (inquiries_by_product[p] ?? 0) + 1;
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              contacts_by_status,
              inquiries_by_stage,
              inquiries_by_product,
              total_contacts: contacts.length,
              total_inquiries: inquiries.length
            }, null, 2)
          }]
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
      }
    }
  );
}
