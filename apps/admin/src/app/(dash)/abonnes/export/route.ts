import { subscribersCsv } from "@ghom/db/admin";
import { isAuthenticated } from "@/auth/guard";

/** Export CSV des abonnés (protégé : session admin obligatoire). */
export async function GET() {
  if (!(await isAuthenticated())) return new Response("Unauthorized", { status: 401 });
  const date = new Date().toISOString().slice(0, 10);
  // BOM UTF-8 : accents corrects à l'ouverture dans Excel / LibreOffice
  return new Response(`﻿${await subscribersCsv()}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="abonnes-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}
