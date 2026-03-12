import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Proxy para renderQuotePdf. En local el rewrite puede no reenviar bien la query string,
 * así que este endpoint hace el fetch explícito a Netlify con todos los params.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const base =
    process.env.NEXT_PUBLIC_NETLIFY_URL ||
    `https://${req.headers.host || "fresh-food-panama-tracker.netlify.app"}`;
  const { id, token, lang, variant } = req.query;
  const tokenStr = Array.isArray(token) ? token[0] : token;

  if (!id || !tokenStr) {
    return res.status(400).json({ error: "Missing id or token" });
  }

  const params = new URLSearchParams();
  params.set("id", String(id));
  params.set("token", tokenStr);
  if (lang) params.set("lang", String(lang));
  if (variant) params.set("variant", String(variant));

  const url = `${base}/.netlify/functions/renderQuotePdf?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${tokenStr}` },
    });
    const contentType = response.headers.get("content-type") || "application/pdf";
    res.setHeader("Content-Type", contentType);

    if (response.headers.get("content-disposition")) {
      res.setHeader("Content-Disposition", response.headers.get("content-disposition")!);
    }

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    console.error("PDF proxy error:", err?.message);
    res.status(500).json({ error: "Error generando PDF" });
  }
}
