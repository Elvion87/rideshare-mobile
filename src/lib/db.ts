import "server-only";

import { neon } from "@neondatabase/serverless";

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Mungon DATABASE_URL. Konfiguro databazën Neon në server.");
  }

  return neon(url);
}
