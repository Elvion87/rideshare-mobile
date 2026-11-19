"use server";

import { revalidatePath } from "next/cache";

import { getCurrentSession } from "@/lib/auth";
import { getSql } from "@/lib/db";

export type RezultatiOres = { ok: true } | { ok: false; mesazhi: string };

export async function ruajOren(
  udhetimiId: string,
  ora: string,
): Promise<RezultatiOres> {
  if (!/^[0-2][0-9]:[0-5][0-9]$/.test(ora) || Number(ora.slice(0, 2)) > 23) {
    return { ok: false, mesazhi: "Shkruaj orën në formatin 24-orësh, p.sh. 08:25." };
  }
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(udhetimiId)) {
    return { ok: false, mesazhi: "ID-ja e udhëtimit nuk është e vlefshme." };
  }

  const session = await getCurrentSession();
  const githubId = session?.user?.id;
  if (!githubId) {
    return { ok: false, mesazhi: "Hyr me GitHub para se të ndryshosh udhëtimin." };
  }

  try {
    const sql = getSql();
    const rows = await sql`
      UPDATE udhetimet
      SET ora = ${ora}
      WHERE id = ${udhetimiId}
        AND shofer_id = ${githubId}
        AND EXISTS (
          SELECT 1 FROM profilet
          WHERE github_id = ${githubId} AND roli = 'shofer'
        )
      RETURNING id
    `;
    if (rows.length === 0) {
      return {
        ok: false,
        mesazhi: "Udhëtimi nuk u gjet ose nuk i përket shoferit të kyçur.",
      };
    }

    revalidatePath("/");
    revalidatePath(`/udhetimi/${udhetimiId}`);
    revalidatePath("/panel");
    return { ok: true };
  } catch (error) {
    console.error("Gabim gjatë ruajtjes së orës së udhëtimit:", error);
    return { ok: false, mesazhi: "Ora nuk u ruajt. Kontrollo lidhjen dhe provo përsëri." };
  }
}
