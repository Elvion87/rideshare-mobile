import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { GabimDatabaze } from "@/components/GabimDatabaze";
import { Hyrja } from "@/components/Hyrja";
import { SinkronizimiUdhetimit } from "@/components/SinkronizimiUdhetimit";
import { authConfigured, getCurrentSession } from "@/lib/auth";
import { lexoGjendjenUdhetimit } from "@/lib/kerkesat";
import type { GjendjaUdhetimit } from "@/lib/kerkesat-types";
import { siguroProfilin } from "@/lib/profilet";

export default async function Kerkesa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connection();

  const session = await getCurrentSession();
  const githubId = session?.user?.id;
  if (!githubId) {
    return (
      <main className="page-shell page-shell--detail">
        <Link className="back-link" href={`/udhetimi/${id}`}>
          ← Kthehu te detajet
        </Link>
        <section className="request-panel">
          <p className="eyebrow">KËRKESË PËR VEND</p>
          <h1>Hyr për të vazhduar</h1>
          <p>
            Kërkesat ruhen në server dhe lidhen me llogarinë tënde GitHub.
          </p>
          <Hyrja
            brenda={false}
            konfigurimiGati={authConfigured}
            callbackUrl={`/udhetimi/${encodeURIComponent(id)}/kerkesa`}
          />
        </section>
      </main>
    );
  }

  let gjendja: GjendjaUdhetimit | undefined;
  try {
    await siguroProfilin(githubId, session.user?.name);
    gjendja = await lexoGjendjenUdhetimit(id, githubId);
  } catch (error) {
    console.error(`Gabim gjatë hapjes së kërkesës për udhëtimin ${id}:`, error);
    return <GabimDatabaze href={`/udhetimi/${id}`} actionLabel="Kthehu te detajet" />;
  }
  if (!gjendja) {
    notFound();
  }

  return (
    <main className="page-shell page-shell--detail">
      <Link className="back-link" href={`/udhetimi/${id}`}>
        ← Kthehu te detajet
      </Link>
      <section className="request-panel request-panel--live">
        <span className="request-icon" aria-hidden="true">↔</span>
        <p className="eyebrow">UDHËTIMI {gjendja.udhetim.id}</p>
        <h1>
          {gjendja.udhetim.nisja} → {gjendja.udhetim.destinacioni}
        </h1>
        <p>
          Nisja {gjendja.udhetim.ora} · {gjendja.udhetim.vendtakimi}
        </p>
        {gjendja.roli === "shofer" ? (
          <p>
            Kjo është kërkesë për udhëtimin tënd. Menaxho kërkesat në{" "}
            <Link className="inline-link" href="/panel">panelin e shoferit</Link>.
          </p>
        ) : null}
        <SinkronizimiUdhetimit fillestare={gjendja} />
      </section>
    </main>
  );
}
