import type { Handler } from "@netlify/functions";
import { sbAdmin, json, text, optionsResponse } from "./_util";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  if (event.httpMethod !== "GET") return text(405, "Method not allowed");

  try {
    const { data, error } = await sbAdmin
      .from("clients")
      .select(`
        id, 
        name, 
        legal_name, 
        tax_id, 
        contact_email, 
        phone, 
        country, 
        has_platform_access,
        billing_address,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return json(200, { items: data || [] });
  } catch (err: any) {
    console.error("Error en listClients:", err?.message);
    return text(500, err?.message || "Server error");
  }
};
