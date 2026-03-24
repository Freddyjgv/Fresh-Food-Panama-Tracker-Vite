// netlify/functions/updateQuote.ts
import type { Handler } from "@netlify/functions";
import { sbAdmin, getUserAndProfile, json, text, isPrivilegedRole, optionsResponse } from "./_util";

/**
 * Función auxiliar para generar el siguiente correlativo oficial Q/
 */
function pad5(n: number) {
  const x = Math.max(0, Math.floor(n));
  return String(x).padStart(5, "0");
}

async function getNextOfficialNumber(year: number) {
  const prefix = `Q/${year}/`;
  const { data, error } = await sbAdmin
    .from("quotes")
    .select("quote_number")
    .ilike("quote_number", `${prefix}%`)
    .order("quote_number", { ascending: false })
    .limit(1);

  if (error || !data?.[0]?.quote_number) {
    return `${prefix}${pad5(1)}`;
  }

  const last = String(data[0].quote_number).trim();
  const tail = last.slice(prefix.length);
  const lastN = Number(tail);
  const next = Number.isFinite(lastN) ? lastN + 1 : 1;
  return `${prefix}${pad5(next)}`;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  if (event.httpMethod !== "POST") return text(405, "Method not allowed");

  try {
    const { user, profile } = await getUserAndProfile(event);
    
    if (!user || !profile) return text(401, "Unauthorized");
    if (!isPrivilegedRole(profile.role || "")) return text(403, "Forbidden");

    const body = JSON.parse(event.body || "{}");
    const id = String(body.id || "").trim();
    if (!id) return text(400, "Missing id");

    // 1. OBTENER DATOS ACTUALES PARA COMPARAR ESTADOS
    const { data: currentQuote, error: fetchError } = await sbAdmin
      .from("quotes")
      .select("status, quote_number")
      .eq("id", id)
      .single();

    if (fetchError || !currentQuote) return text(404, "Quote not found");

    const patch: any = {
      updated_at: new Date().toISOString()
    };

    const allowed = [
      "client_id", "status", "mode", "currency", "destination", 
      "boxes", "weight_kg", "margin_markup", "payment_terms", 
      "terms", "client_snapshot", "costs", "totals", "product_id", "product_details"
    ];

    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, k)) {
        patch[k] = body[k];
      }
    }

    // 2. LÓGICA DE TRANSFORMACIÓN RFQ -> Q
    const oldStatus = String(currentQuote.status).toLowerCase();
    const newStatus = String(patch.status || currentQuote.status).toLowerCase();
    const currentNum = String(currentQuote.quote_number);

    // Estados que califican para tener número "Q"
    const officialStatuses = ['draft', 'sent', 'approved', 'rejected', 'expired'];
    
    // Condición: Si actualmente es RFQ (o estatus solicitud) y el nuevo estatus es oficial
    const isCurrentRFQ = currentNum.startsWith('RFQ/') || oldStatus === 'solicitud';
    const isTargetOfficial = officialStatuses.includes(newStatus);

    if (isCurrentRFQ && isTargetOfficial) {
      const year = new Date().getFullYear();
      patch.quote_number = await getNextOfficialNumber(year);
    }

    // Normalización
    if (patch.mode) patch.mode = String(patch.mode).toUpperCase();
    if (patch.currency) patch.currency = String(patch.currency).toUpperCase();

    // 3. ACTUALIZACIÓN FINAL
    const { error: updateError } = await sbAdmin
      .from("quotes")
      .update(patch)
      .eq("id", id);

    if (updateError) {
      console.error("Error DB updateQuote:", updateError.message);
      return text(500, updateError.message);
    }

    return json(200, { 
      ok: true, 
      message: "Cotización actualizada",
      new_number: patch.quote_number || currentNum 
    });

  } catch (e: any) {
    console.error("Falla en updateQuote:", e.message);
    return text(500, e?.message || "Server error");
  }
};