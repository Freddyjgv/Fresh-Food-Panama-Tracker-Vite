import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const base =
    process.env.NEXT_PUBLIC_NETLIFY_URL ||
    `https://${req.headers.host || "fresh-food-panama-tracker.netlify.app"}`;

  let id: string;
  let tokenStr: string;
  let lang = "es";
  let variant = "2";

  if (req.method === "POST" && req.body) {
    const body = req.body as any;
    id = body.id;
    tokenStr = body.token;
    lang = body.lang || "es";
    variant = body.variant || "2";
  } else {
    const { id: qId, token: qToken, lang: qLang, variant: qVariant } = req.query;
    id = String(Array.isArray(qId) ? qId[0] : qId);
    tokenStr = String(Array.isArray(qToken) ? qToken[0] : qToken);
    if (qLang) lang = String(Array.isArray(qLang) ? qLang[0] : qLang);
    if (qVariant) variant = String(Array.isArray(qVariant) ? qVariant[0] : qVariant);
  }

  if (!id || !tokenStr) {
    return res.status(400).json({ error: "Missing id or token" });
  }

  const params = new URLSearchParams();
  params.set("id", id);
  params.set("token", tokenStr);
  params.set("lang", lang);
  params.set("variant", variant);

  const url = `${base}/.netlify/functions/renderQuotePdf?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenStr}`,
        "Content-Type": "application/json",
      },
    });
    const contentType = response.headers.get("content-type") || "application/pdf";
    res.setHeader("Content-Type", contentType);

    if (response.headers.get("content-disposition")) {
      res.setHeader("Content-Disposition", response.headers.get("content-disposition")!);
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("[renderQuotePdf proxy] Netlify returned", response.status, "tokenLen:", tokenStr?.length);
      return res.status(response.status).send(text);
    }

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    console.error("PDF proxy error:", err?.message);
    res.status(500).json({ error: "Error generando PDF" });
  }
}
