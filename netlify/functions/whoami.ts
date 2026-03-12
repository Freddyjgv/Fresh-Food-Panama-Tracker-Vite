import type { Handler } from "@netlify/functions";
import { getUserAndProfile, json, text, optionsResponse } from "./_util";

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") return optionsResponse();

    const { user, profile } = await getUserAndProfile(event);

    if (!user) return text(401, "Unauthorized");

    if (!profile) return text(401, "Unauthorized (missing profile)");

    return json(200, {
      email: user.email,
      user_id: user.id,
      role: profile.role ?? null,
      client_id: profile.client_id ?? null,
    });
  } catch (e: any) {
    return text(500, e?.message || "Server error");
  }
};