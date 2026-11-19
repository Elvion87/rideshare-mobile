import "server-only";

import { getSql } from "@/lib/db";
import type {
  GjendjaUdhetimit,
  KerkesaIme,
  KerkesaShoferi,
} from "@/lib/kerkesat-types";
import type { Udhetim } from "@/lib/udhetimet";

function lexoUdhetim(row: Record<string, unknown>): Udhetim {
  const { id, nisja, destinacioni, ora, vendtakimi, vende } = row;
  if (
    typeof id !== "string" ||
    typeof nisja !== "string" ||
    typeof destinacioni !== "string" ||
    typeof ora !== "string" ||
    typeof vendtakimi !== "string" ||
    typeof vende !== "number" ||
    !Number.isInteger(vende) ||
    vende < 0
  ) {
    throw new Error("Databaza ktheu të dhëna të pavlefshme për udhëtimin.");
  }

  return { id, nisja, destinacioni, ora, vendtakimi, vende };
}

function lexoKerkesen(
  id: unknown,
  status: unknown,
): KerkesaIme | null {
  if (id === null || id === undefined) {
    return null;
  }
  if (
    typeof id !== "string" ||
    (status !== "ne pritje" && status !== "pranuar")
  ) {
    throw new Error("Databaza ktheu status të pavlefshëm të kërkesës.");
  }
  return { id, status };
}

export async function lexoGjendjenUdhetimit(
  udhetimiId: string,
  githubId: string,
): Promise<GjendjaUdhetimit | undefined> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      u.id, u.nisja, u.destinacioni, u.ora, u.vendtakimi, u.vende,
      CASE
        WHEN u.shofer_id = ${githubId} AND p.roli = 'shofer' THEN 'shofer'
        ELSE 'udhetar'
      END AS roli,
      k.id AS kerkesa_id,
      k.status AS kerkesa_status
    FROM udhetimet u
    LEFT JOIN profilet p ON p.github_id = ${githubId}
    LEFT JOIN kerkesat k
      ON k.udhetimi_id = u.id AND k.udhetar_id = ${githubId}
    WHERE u.id = ${udhetimiId}
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return undefined;
  }

  const udhetim = lexoUdhetim(row);
  if (row.roli !== "shofer" && row.roli !== "udhetar") {
    throw new Error("Databaza ktheu rol të pavlefshëm për udhëtimin.");
  }

  const roli = row.roli as GjendjaUdhetimit["roli"];
  const kerkesaIme = roli === "udhetar"
    ? lexoKerkesen(row.kerkesa_id, row.kerkesa_status)
    : null;
  let kerkesat: KerkesaShoferi[] = [];

  if (roli === "shofer") {
    const rowsKerkesash = await sql`
      SELECT k.id, k.status, p.emri AS udhetar
      FROM kerkesat k
      JOIN profilet p ON p.github_id = k.udhetar_id
      JOIN udhetimet u ON u.id = k.udhetimi_id
      WHERE k.udhetimi_id = ${udhetimiId}
        AND u.shofer_id = ${githubId}
        AND EXISTS (
          SELECT 1 FROM profilet
          WHERE github_id = ${githubId} AND roli = 'shofer'
        )
      ORDER BY k.created_at, k.id
    `;
    kerkesat = rowsKerkesash.map((request) => {
      const requestRow = request as Record<string, unknown>;
      const kerkesa = lexoKerkesen(requestRow.id, requestRow.status);
      if (!kerkesa || typeof requestRow.udhetar !== "string") {
        throw new Error("Databaza ktheu një kërkesë shoferi të pavlefshme.");
      }
      return { ...kerkesa, udhetar: requestRow.udhetar };
    });
  }

  return { udhetim, roli, kerkesaIme, kerkesat };
}

export type RezultatiKerkeses = {
  kerkesa: KerkesaIme;
  eRe: boolean;
} | {
  gabim: "udhetimi_mungon" | "pa_vende" | "udhetimi_yt";
};

export async function krijoKerkese(
  udhetimiId: string,
  githubId: string,
): Promise<RezultatiKerkeses> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO kerkesat (udhetimi_id, udhetar_id)
    SELECT id, ${githubId}
    FROM udhetimet
    WHERE id = ${udhetimiId}
      AND vende > 0
      AND shofer_id IS NOT NULL
      AND shofer_id <> ${githubId}
    ON CONFLICT (udhetimi_id, udhetar_id) DO NOTHING
    RETURNING id, status
  `;
  const created = rows[0] as Record<string, unknown> | undefined;
  if (created) {
    const kerkesa = lexoKerkesen(created.id, created.status);
    if (!kerkesa) {
      throw new Error("Databaza nuk ktheu kërkesën e krijuar.");
    }
    return { kerkesa, eRe: true };
  }

  const existingRows = await sql`
    SELECT id, status
    FROM kerkesat
    WHERE udhetimi_id = ${udhetimiId} AND udhetar_id = ${githubId}
  `;
  const existing = existingRows[0] as Record<string, unknown> | undefined;
  if (existing) {
    const kerkesa = lexoKerkesen(existing.id, existing.status);
    if (!kerkesa) {
      throw new Error("Databaza ktheu kërkesë të pavlefshme.");
    }
    return { kerkesa, eRe: false };
  }

  const tripRows = await sql`
    SELECT shofer_id, vende
    FROM udhetimet
    WHERE id = ${udhetimiId}
  `;
  const trip = tripRows[0] as Record<string, unknown> | undefined;
  if (!trip) {
    return { gabim: "udhetimi_mungon" };
  }
  if (trip.shofer_id === githubId) {
    return { gabim: "udhetimi_yt" };
  }
  if (typeof trip.vende === "number" && trip.vende < 1) {
    return { gabim: "pa_vende" };
  }
  throw new Error("Kërkesa nuk u ruajt edhe pse udhëtimi është i hapur.");
}

export type RezultatiPranimit =
  | { ok: true; ndryshoi: boolean }
  | { ok: false; gabim: "udhetimi_mungon" | "pa_vende" | "pa_leje" };

export async function pranoKerkese(
  udhetimiId: string,
  kerkesaId: string,
  githubId: string,
): Promise<RezultatiPranimit> {
  const sql = getSql();
  const acceptedRows = await sql`
    WITH kerkesa_ne_pritje AS MATERIALIZED (
      SELECT k.id, k.udhetimi_id
      FROM kerkesat k
      JOIN udhetimet u ON u.id = k.udhetimi_id
      JOIN profilet p
        ON p.github_id = ${githubId} AND p.roli = 'shofer'
      WHERE k.id = ${kerkesaId}::uuid
        AND k.udhetimi_id = ${udhetimiId}
        AND k.status = 'ne pritje'
        AND u.shofer_id = ${githubId}
        AND u.vende > 0
      FOR UPDATE OF k, u
    ),
    vendi_i_zbritur AS (
      UPDATE udhetimet u
      SET vende = u.vende - 1
      FROM kerkesa_ne_pritje k
      WHERE u.id = k.udhetimi_id AND u.vende > 0
      RETURNING u.id
    ),
    kerkesat_e_pranuara AS (
      UPDATE kerkesat k
      SET status = 'pranuar', updated_at = NOW()
      FROM kerkesa_ne_pritje pritje
      JOIN vendi_i_zbritur vend ON vend.id = pritje.udhetimi_id
      WHERE k.id = pritje.id AND k.status = 'ne pritje'
      RETURNING k.id
    )
    SELECT id FROM kerkesat_e_pranuara
  `;
  if (acceptedRows.length > 0) {
    return { ok: true, ndryshoi: true };
  }

  const rows = await sql`
    SELECT k.status, u.vende
    FROM kerkesat k
    JOIN udhetimet u ON u.id = k.udhetimi_id
    JOIN profilet p
      ON p.github_id = ${githubId} AND p.roli = 'shofer'
    WHERE k.id = ${kerkesaId}::uuid
      AND k.udhetimi_id = ${udhetimiId}
      AND u.shofer_id = ${githubId}
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) {
    return { ok: false, gabim: "pa_leje" };
  }
  if (row.status === "pranuar") {
    return { ok: true, ndryshoi: false };
  }
  if (row.status === "ne pritje" && row.vende === 0) {
    return { ok: false, gabim: "pa_vende" };
  }
  return { ok: false, gabim: "udhetimi_mungon" };
}
