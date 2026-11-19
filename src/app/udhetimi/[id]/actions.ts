"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSession } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { siguroProfilin } from "@/lib/profilet";

export type RezultatiPreferimit = { ok: true } | { ok: false; mesazhi: string };

export async function ruajPreferimin(
  udhetimiId: string,
): Promise<RezultatiPreferimit> {
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(udhetimiId)) {
    return { ok: false, mesazhi: "ID-ja e udhëtimit nuk është e vlefshme." };
  }

  const session = await getCurrentSession();
  const githubId = session?.user?.id;
  if (!githubId) {
    return { ok: false, mesazhi: "Hyr me GitHub për të ruajtur udhëtimin." };
  }

  try {
    await siguroProfilin(githubId, session.user?.name);
    const sql = getSql();
    await sql`
      INSERT INTO preferimet (github_id, udhetimi_id)
      SELECT ${githubId}, id
      FROM udhetimet
      WHERE id = ${udhetimiId}
      ON CONFLICT (github_id, udhetimi_id) DO NOTHING
    `;
    const rows = await sql`
      SELECT EXISTS (
        SELECT 1 FROM preferimet
        WHERE github_id = ${githubId} AND udhetimi_id = ${udhetimiId}
      ) AS ruajtur
    `;
    if (rows[0]?.ruajtur !== true) {
      return { ok: false, mesazhi: "Udhëtimi nuk u gjet dhe nuk u ruajt." };
    }
    revalidatePath(`/udhetimi/${udhetimiId}`);
    return { ok: true };
  } catch (error) {
    console.error("Gabim gjatë ruajtjes së udhëtimit të preferuar:", error);
    return {
      ok: false,
      mesazhi: "Nuk u ruajt. Kontrollo lidhjen me databazën dhe provo përsëri.",
    };
  }
}
