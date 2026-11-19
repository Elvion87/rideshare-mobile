import "server-only";

import { getSql } from "@/lib/db";

export type GjendjaPreferimit = {
  ruajtur: boolean;
  numer: number;
};

export async function lexoGjendjenPreferimit(
  githubId: string,
  udhetimiId: string,
): Promise<GjendjaPreferimit> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      EXISTS (
        SELECT 1 FROM preferimet
        WHERE github_id = ${githubId} AND udhetimi_id = ${udhetimiId}
      ) AS ruajtur,
      (
        SELECT COUNT(*)::int FROM preferimet WHERE github_id = ${githubId}
      ) AS numer
  `;
  const row = rows[0];
  if (
    !row ||
    typeof row.ruajtur !== "boolean" ||
    typeof row.numer !== "number" ||
    !Number.isInteger(row.numer)
  ) {
    throw new Error("Databaza ktheu gjendje të pavlefshme të preferimeve.");
  }
  return { ruajtur: row.ruajtur, numer: row.numer };
}
