import "server-only";

import { getSql } from "@/lib/db";

export type Roli = "udhetar" | "shofer";

export type Profili = {
  githubId: string;
  emri: string;
  roli: Roli;
};

export async function siguroProfilin(
  githubId: string,
  emri: string | null | undefined,
): Promise<Profili> {
  const sql = getSql();
  await sql`
    INSERT INTO profilet (github_id, emri)
    VALUES (${githubId}, ${emri?.trim() || "Përdorues GitHub"})
    ON CONFLICT (github_id) DO NOTHING
  `;

  const rows = await sql`
    SELECT github_id, emri, roli
    FROM profilet
    WHERE github_id = ${githubId}
  `;
  const row = rows[0];
  if (
    !row ||
    typeof row.github_id !== "string" ||
    typeof row.emri !== "string" ||
    (row.roli !== "udhetar" && row.roli !== "shofer")
  ) {
    throw new Error("Databaza nuk ktheu një profil të vlefshëm.");
  }

  return { githubId: row.github_id, emri: row.emri, roli: row.roli };
}
