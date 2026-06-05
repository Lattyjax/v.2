# Latimore Supabase MCP Server

MCP server for **Latimore Life & Legacy LLC** Hub OS — gives Claude structured tools to query and update the Supabase backend (`medxfhhxvmczmpurkmrp`).

## Tool Inventory

### Simple leads intake table (`public.leads`)

| Tool | Description |
|------|-------------|
| `leads_list` | Query leads with county/status/search filters + pagination |
| `leads_get` | Fetch a single lead by UUID |
| `leads_create` | Insert a new intake lead |
| `leads_update` | Update fields on an existing lead |
| `leads_summary` | Aggregate counts grouped by status & county |

### CRM tables (Prisma-managed: `Contact`, `Inquiry`, etc.)

| Tool | Description |
|------|-------------|
| `contact_list` | Query contacts with county/status/search filters |
| `contact_get` | Fetch a contact + its inquiries and open tasks |
| `contact_update` | Update contact fields or schedule a follow-up |
| `inquiry_list` | Query inquiries with stage/product/county filters |
| `pipeline_summary` | Counts by LeadStatus, PipelineStage, and ProductInterest |

### Generic database tools

| Tool | Description |
|------|-------------|
| `db_list_tables` | Discover all tables in the public schema |
| `db_query_table` | Generic SELECT on any table with filters + pagination |
| `db_raw_sql` | Execute a raw SELECT via the `execute_sql` RPC |

---

## Setup

```bash
cd mcp
npm install
npm run build
```

### Environment variables

```bash
export SUPABASE_URL="https://medxfhhxvmczmpurkmrp.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Run locally (stdio — for Claude Desktop)

```bash
node dist/index.js
```

### Claude Desktop config

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "latimore-hub-os": {
      "command": "node",
      "args": ["/path/to/latimore-hub-main/mcp/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://medxfhhxvmczmpurkmrp.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

### HTTP mode (Vercel)

```bash
TRANSPORT=http PORT=3000 node dist/index.js
```

Vercel env vars required: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TRANSPORT=http`

---

## Optional: Enable Raw SQL RPC

Run once in the Supabase SQL editor to unlock `db_raw_sql`:

```sql
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || query || ') t' INTO result;
  RETURN result;
END;
$$;
```

---

## Schema notes

There are two separate data layers in this Supabase project:

1. **`public.leads`** — flat intake table created by `supabase-leads-table.sql`.
   Columns: `id`, `created_at`, `full_name`, `phone`, `email`, `promo_code`,
   `product_interest`, `lead_source`, `page_source`, `status`, `county`, `notes`.

2. **Prisma-managed tables** — `Contact`, `Inquiry`, `LeadSession`, `Event`,
   `Task`, `Note`, `Appointment`, etc. These use camelCase column names
   (e.g., `createdAt`, `contactId`) and must be quoted as identifiers in raw SQL
   (e.g., `SELECT * FROM "Contact"`).
