<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Application architecture
- Keep the first prototype entirely client-side in a shared React demo context; this avoids implying a connected monitoring, AI, or storage service.
- Define the demo context and consumer hook outside the provider component module so Fast Refresh cannot recreate context identity while consumers remain mounted.
- Give each operational module and incident/conversation detail a typed TanStack file route; this keeps navigation and thread identity stable.
- Use the installed AI Elements primitives for the demonstration assistant; this preserves a future-compatible chat surface without live model calls.
- Keep diagnostic validation and document assembly in browser-safe pure helpers with safety tests; this prevents unverified steps from becoming reported facts.
- Store incident analyses and per-incident verification steps in the shared session context, using incident source fingerprints to invalidate outdated assessments and document validation after record changes.
- Derive dashboard KPIs and domain distributions from current incident/report records, and cascade incident deletion to linked analyses, checks, and reports to prevent inconsistent counts.
- Generate PDF and DOCX files through lazy-loaded browser libraries; this makes exports functional without server dependencies.
- Derive all workspace record types and status/severity aliases from their validation schemas so UI records and authenticated function payloads cannot drift apart.
