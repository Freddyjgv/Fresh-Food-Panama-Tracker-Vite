import type { Handler } from "@netlify/functions";
import { sbAdmin, getUserAndProfile, json, text, optionsResponse } from "./_util";

function pad5(n: number) {
  const x = Math.max(0, Math.floor(n));
  return String(x).padStart(5, "0");
}

/**
 * Genera el siguiente correlativo PO-YEAR-XXXXX
 */
async function getNextPONumber(year: number) {
  const prefix = `PO-${year}-`;

  const { data, error } = await sbAdmin
    .from("quotes")
    .select("po_number")
    .ilike("po_number", `${prefix}%`)
    .order("po_number", { ascending: false })
    .limit(1);

  if (error || !data?.[0]?.po_number) {
    return `${prefix}${pad5(1)}`;
  }

  const last = String(data[0].po_number).trim();
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

    const body = JSON.parse(event.body || "{}");
    const { quoteId } = body;

    if (!quoteId) return text(400, "Quote ID is required");

    // 1. Verificar estado actual de la cotización
    const { data: quote, error: fetchErr } = await sbAdmin
      .from("quotes")
      .select("status, quote_number, client_id")
      .eq("id", quoteId)
      .single();

    if (fetchErr || !quote) return text(404, "Quote not found");
    
    // Seguridad: Solo se puede aprobar si está en status 'sent'
    if (quote.status !== 'sent') {
      return json(400, { error: "Solo se pueden aprobar cotizaciones en estado 'Enviada'" });
    }

    // 2. Generar número de PO
    const year = new Date().getFullYear();
    const po_number = await getNextPONumber(year);

    // 3. Actualizar Cotización a 'approved' e inyectar el PO_Number
    const { error: updateErr } = await sbAdmin
      .from("quotes")
      .update({
        status: 'approved',
        po_number: po_number,
        updated_at: new Date().toISOString()
      })
      .eq("id", quoteId);

    if (updateErr) return json(500, { error: updateErr.message });

    // 4. Log de actividad (opcional pero profesional)
    await sbAdmin.from("quote_logs").insert({
      quote_id: quoteId,
      user_id: user.id,
      user_email: user.email,
      changes: {
        status: { old: 'sent', new: 'approved' },
        po_number: { old: null, new: po_number }
      }
    });

    return json(200, { 
      ok: true, 
      message: "Cotización aprobada exitosamente",
      po_number 
    });

  } catch (e: any) {
    console.error("Error en approveQuote:", e.message);
    return text(500, "Server error");
  }
};