import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const contentType = req.headers.get("content-type") || "";
    let csvText: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (!file || !(file instanceof File)) {
        return errorResponse("Missing 'file' in form data", 400);
      }
      csvText = await file.text();
    } else {
      csvText = await req.text();
    }

    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return errorResponse("CSV must have a header row and at least one data row", 400);
    }

    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const requiredCols = ["id", "brand", "name", "category", "price"];
    for (const col of requiredCols) {
      if (!header.includes(col)) {
        return errorResponse(`Missing required column: ${col}`, 400);
      }
    }

    const { data: existingTags } = await supabase
      .from("style_tags")
      .select("id, tag");
    const tagMap = new Map<string, number>();
    for (const t of existingTags || []) {
      tagMap.set(t.tag.toLowerCase(), t.id);
    }

    const imported: string[] = [];
    const skipped: { row: number; reason: string }[] = [];
    const newTags: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const fields = parseCsvLine(lines[i]);
      const row: Record<string, string> = {};
      header.forEach((col, idx) => {
        row[col] = fields[idx] || "";
      });

      if (!row.id || !row.name || !row.category) {
        skipped.push({ row: i + 1, reason: "Missing id, name, or category" });
        continue;
      }

      const validCategories = [
        "Faucet", "Toilet", "Shower", "Vanity", "Tile", "Lighting", "Bathtub",
      ];
      if (!validCategories.includes(row.category)) {
        skipped.push({
          row: i + 1,
          reason: `Invalid category "${row.category}". Must be one of: ${validCategories.join(", ")}`,
        });
        continue;
      }

      const price = parseFloat(row.price);
      if (isNaN(price)) {
        skipped.push({ row: i + 1, reason: "Invalid price" });
        continue;
      }

      const { error: upsertError } = await supabase.from("products").upsert(
        {
          id: row.id,
          brand: row.brand || "",
          name: row.name,
          category: row.category,
          price,
          currency: row.currency || "EUR",
          image_url: row.image_url || "",
          origin: row.origin || "",
          is_active: true,
          display_order: parseInt(row.display_order || "0") || 0,
        },
        { onConflict: "id" }
      );

      if (upsertError) {
        skipped.push({ row: i + 1, reason: upsertError.message });
        continue;
      }

      const styleTags = (row.style_tags || "")
        .split("|")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const tagIds: number[] = [];
      for (const tagName of styleTags) {
        let tagId = tagMap.get(tagName);
        if (!tagId) {
          const { data: newTag } = await supabase
            .from("style_tags")
            .insert({ tag: tagName })
            .select("id")
            .maybeSingle();
          if (newTag) {
            tagId = newTag.id;
            tagMap.set(tagName, tagId);
            newTags.push(tagName);
          }
        }
        if (tagId) tagIds.push(tagId);
      }

      if (tagIds.length > 0) {
        await supabase
          .from("product_style_tags")
          .delete()
          .eq("product_id", row.id);

        await supabase.from("product_style_tags").insert(
          tagIds.map((tag_id) => ({ product_id: row.id, tag_id }))
        );
      }

      imported.push(row.id);
    }

    return new Response(
      JSON.stringify({
        imported_count: imported.length,
        skipped_count: skipped.length,
        new_tags_created: newTags,
        skipped,
        imported_ids: imported,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return errorResponse("Internal error: " + String(err), 500);
  }
});
